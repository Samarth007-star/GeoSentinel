import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState, ConnectorStatus
from ..core.config import settings

class OoniConnector(BaseConnector):
    """
    Connector for Open Observatory of Network Interference (OONI) API.
    Provides network measurement, censorship signals, and traffic interference telemetry.
    """
    # ISO 3166-1 alpha-3 to alpha-2 map for common geopolitical research entities
    ALPHA3_TO_ALPHA2 = {
        "IND": "IN", "IRN": "IR", "USA": "US", "RUS": "RU", "CHN": "CN",
        "EGY": "EG", "YEM": "YE", "SAU": "SA", "ARE": "AE", "TUR": "TR",
        "UKR": "UA", "ISR": "IL", "TWN": "TW", "MMR": "MM", "VEN": "VE"
    }

    def __init__(self):
        super().__init__(
            connector_id="CONN_OONI",
            category="Internet & Infrastructure",
            provider_name="Open Observatory of Network Interference (OONI)",
            terms_url="https://ooni.org/about/data-policy/",
            license_type="CC0 1.0 Public Domain",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.OONI_BASE_URL.rstrip('/')
        self.auth_type = "None (Open Data API)"
        self.last_checked: Optional[str] = None
        self.last_success: Optional[str] = None
        self.last_error: Optional[str] = None
        self.records_retrieved: int = 0

    def _resolve_country_code(self, geos: List[str]) -> str:
        for g in geos:
            g_up = g.upper()
            if len(g_up) == 2:
                return g_up
            if g_up in self.ALPHA3_TO_ALPHA2:
                return self.ALPHA3_TO_ALPHA2[g_up]
        return "IR"  # Default research focus for censorship signals

    async def check_health(self) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        self.last_checked = now_iso
        try:
            url = f"{self.base_url}/measurements?probe_cc=US&limit=1"
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
            self.last_error = "OONI connection timed out."
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

        probe_cc = self._resolve_country_code(target_geographies)
        url = f"{self.base_url}/measurements?probe_cc={probe_cc}&limit=5"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    for item in data.get("results", []):
                        results.append({
                            "measurement_uid": item.get("measurement_uid"),
                            "probe_cc": item.get("probe_cc", probe_cc),
                            "probe_asn": item.get("probe_asn", "Unknown ASN"),
                            "test_name": item.get("test_name", "web_connectivity"),
                            "input": item.get("input"),
                            "anomaly": item.get("anomaly", False),
                            "confirmed": item.get("confirmed", False),
                            "measurement_start_time": item.get("measurement_start_time"),
                            "measurement_url": item.get("measurement_url")
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
                    self.last_error = f"HTTP {res.status_code} from OONI."
        except httpx.TimeoutException:
            self.record_failure()
            self.last_error = "OONI request timed out."
        except Exception as e:
            self.record_failure()
            self.last_error = str(e)

        return results

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_iso = datetime.now(timezone.utc).isoformat()
        records: List[EvidenceRecord] = []

        for m in raw_records:
            uid = m.get("measurement_uid") or hashlib.sha256(str(m).encode()).hexdigest()[:16]
            probe_cc = m.get("probe_cc", "XX")
            probe_asn = m.get("probe_asn", "ASN")
            test_name = m.get("test_name", "network_test")
            target_input = m.get("input") or "Network routing"
            anomaly = m.get("anomaly", False)
            confirmed = m.get("confirmed", False)
            start_time = m.get("measurement_start_time") or now_iso
            source_url = m.get("measurement_url") or f"https://explorer.ooni.org/m/{uid}"

            status_desc = "Censorship Anomaly Detected" if anomaly else ("Confirmed Blocked" if confirmed else "Normal Connectivity")
            claim_text = (
                f"OONI probe in {probe_cc} ({probe_asn}) observed '{test_name}' on target '{target_input}'. "
                f"Status: {status_desc} (Measurement timestamp: {start_time})."
            )

            content_hash = hashlib.sha256(f"{uid}:{probe_cc}:{start_time}".encode("utf-8")).hexdigest()

            records.append(EvidenceRecord(
                evidence_id=f"ev_ooni_{uid[:14]}",
                source_id=self.connector_id,
                source_name="OONI Network Measurements",
                source_url=source_url,
                title=f"OONI Network Signal: {probe_cc} ({test_name} - {status_desc})",
                claim_text=claim_text,
                evidence_type="network_measurement",
                published_at=start_time,
                retrieved_at=now_iso,
                geography=probe_cc,
                data_origin="LIVE",
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Empirical client network telemetry recorded by distributed OONI measurement probes.",
                license_id=self.license_type,
                attribution="Source: Open Observatory of Network Interference (CC0 1.0 Public Domain)",
                content_hash=content_hash,
                limitations="Volunteer vantage points reflect specific ISP/ASN network hops, not nationwide totality."
            ))

        return records
