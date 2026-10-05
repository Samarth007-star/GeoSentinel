import hashlib
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState, ConnectorStatus
from ..core.config import settings

class IodaConnector(BaseConnector):
    """
    Connector for Georgia Tech / CAIDA Internet Outage Detection & Analysis (IODA) API v2.
    Monitors global BGP, active probing, and darknet telescope connectivity disruptions.
    """
    # ISO 3166-1 alpha-3 to alpha-2 map
    ALPHA3_TO_ALPHA2 = {
        "IND": "IN", "IRN": "IR", "USA": "US", "RUS": "RU", "CHN": "CN",
        "EGY": "EG", "YEM": "YE", "SAU": "SA", "ARE": "AE", "TUR": "TR",
        "UKR": "UA", "ISR": "IL", "TWN": "TW", "MMR": "MM", "VEN": "VE"
    }

    def __init__(self):
        super().__init__(
            connector_id="CONN_IODA",
            category="Internet & Infrastructure",
            provider_name="Internet Outage Detection & Analysis (IODA)",
            terms_url="https://ioda.inetintel.cc.gatech.edu/",
            license_type="Academic Non-Commercial Research",
            timeout=15.0
        )
        self.base_url = settings.IODA_BASE_URL.rstrip('/')
        self.auth_type = "None (Academic API)"
        self.last_checked: Optional[str] = None
        self.last_success: Optional[str] = None
        self.last_error: Optional[str] = None
        self.records_retrieved: int = 0

    def _resolve_country_code(self, geos: List[str]) -> Optional[str]:
        for g in geos:
            g_up = g.upper()
            if len(g_up) == 2:
                return g_up
            if g_up in self.ALPHA3_TO_ALPHA2:
                return self.ALPHA3_TO_ALPHA2[g_up]
        return None

    async def check_health(self) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        self.last_checked = now_iso
        now = int(time.time())
        try:
            url = f"{self.base_url}/outages/events?from={now - 86400}&until={now}&limit=1"
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    self.record_success()
                    self.last_success = now_iso
                    self.last_error = None
                    return {"status": "HEALTHY", "latency_ms": res.elapsed.total_seconds() * 1000}
                else:
                    self.record_failure()
                    self.last_error = f"HTTP {res.status_code}"
                    return {"status": "DEGRADED", "http_code": res.status_code}
        except httpx.TimeoutException:
            self.record_failure()
            self.last_error = "IODA connection timed out."
            return {"status": "UNHEALTHY", "error": self.last_error}
        except Exception as e:
            self.record_failure()
            self.last_error = str(e)
            return {"status": "UNHEALTHY", "error": str(e)}

    async def fetch(self, target_entities: List[str], target_geographies: List[str]) -> List[Dict[str, Any]]:
        if not self.is_available():
            return []

        results: List[Dict[str, Any]] = []
        now_iso = datetime.now(timezone.utc).isoformat()
        self.last_checked = now_iso
        now = int(time.time())
        from_ts = now - (7 * 86400)  # Past 7 days of outage telemetry

        country_code = self._resolve_country_code(target_geographies)
        if country_code:
            url = f"{self.base_url}/outages/events?entityType=country&entityCode={country_code}&from={from_ts}&until={now}&limit=5"
        else:
            url = f"{self.base_url}/outages/events?from={from_ts}&until={now}&limit=5"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    events = data.get("data", [])
                    # If specific country returned 0 outages, fetch overall recent events
                    if not events and country_code:
                        url_fallback = f"{self.base_url}/outages/events?from={from_ts}&until={now}&limit=5"
                        res_fallback = await client.get(url_fallback)
                        if res_fallback.status_code == 200:
                            events = res_fallback.json().get("data", [])

                    for ev in events:
                        results.append({
                            "location": ev.get("location"),
                            "location_name": ev.get("location_name", "Global ASN/Region"),
                            "start": ev.get("start"),
                            "duration": ev.get("duration", 0),
                            "datasource": ev.get("datasource", "bgp"),
                            "score": ev.get("score", 0.0),
                            "status": ev.get("status", 0),
                            "country_code": country_code
                        })
                    self.record_success()
                    self.last_success = now_iso
                    self.records_retrieved += len(results)
                    self.last_error = None
                elif res.status_code == 429:
                    self.status = ConnectorStatus.RATE_LIMITED
                    self.last_error = "Rate limit exceeded (HTTP 429)."
                else:
                    self.record_failure()
                    self.last_error = f"HTTP {res.status_code} from IODA."
        except httpx.TimeoutException:
            self.record_failure()
            self.last_error = "IODA request timed out."
        except Exception as e:
            self.record_failure()
            self.last_error = str(e)

        return results

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_dt = datetime.now(timezone.utc)
        now_iso = now_dt.isoformat()
        records: List[EvidenceRecord] = []

        for item in raw_records:
            loc_name = item.get("location_name", "Network Infrastructure")
            datasource = item.get("datasource", "bgp").upper()
            start_ts = item.get("start")
            duration_sec = item.get("duration", 0)
            score = item.get("score", 0.0)
            cc = item.get("country_code")

            duration_str = f"{duration_sec // 3600}h {(duration_sec % 3600) // 60}m" if duration_sec else "Ongoing"

            # Parse start timestamp
            published_at = now_iso
            data_origin = "LIVE"
            if start_ts:
                try:
                    event_dt = datetime.fromtimestamp(start_ts, tz=timezone.utc)
                    published_at = event_dt.isoformat()
                    # Distinguish LIVE (< 48 hours) from HISTORICAL
                    if (now_dt - event_dt).total_seconds() > (48 * 3600):
                        data_origin = "HISTORICAL"
                    else:
                        data_origin = "LIVE"
                except Exception:
                    published_at = now_iso

            claim_text = (
                f"IODA detected macroscopic connectivity outage impacting {loc_name} "
                f"via {datasource} telemetry. Anomaly score: {score:.1f}, "
                f"Event start: {published_at}, Duration: {duration_str}."
            )

            content_hash = hashlib.sha256(f"{loc_name}:{start_ts}:{datasource}".encode("utf-8")).hexdigest()
            ev_id = f"ev_ioda_{content_hash[:12]}"

            records.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name="IODA Internet Outage Detection",
                source_url="https://ioda.inetintel.cc.gatech.edu/",
                title=f"IODA Outage Signal: {loc_name} ({datasource})",
                claim_text=claim_text,
                evidence_type="infrastructure_outage_signal",
                published_at=published_at,
                retrieved_at=now_iso,
                geography=cc or loc_name,
                data_origin=data_origin,
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Derived from multi-vantage macroscopic telemetry (BGP routing, active CAIDA probes, darknet telescope).",
                license_id=self.license_type,
                attribution="Source: Georgia Tech / CAIDA IODA (Academic Non-Commercial Research)",
                content_hash=content_hash,
                limitations="Automated statistical thresholding detects aggregate macro disruptions; edge connectivity may differ."
            ))

        return records
