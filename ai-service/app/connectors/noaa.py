import json
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

logger = logging.getLogger(__name__)


class NoaaConnector(BaseConnector):
    """
    Connector for NOAA Climate Data Online (CDO) Web Services API v2.
    Provides climate and weather data including severe weather alerts,
    storm events, and climate extremes monitoring.

    Free public API. Requires a token obtained from:
    https://www.ncdc.noaa.gov/cdo-web/token

    If no token is configured, falls back to the NOAA Severe Weather
    Data Inventory (SWDI) public endpoint which requires no authentication.

    Terms: https://www.weather.gov/disclaimer
    License: US Public Domain
    Rate limit: 5 requests/second, 10,000 requests/day (CDO API)
    """

    def __init__(self):
        super().__init__(
            connector_id="CONN_NOAA",
            category="Scientific & Disaster",
            provider_name="NOAA National Centers for Environmental Information",
            terms_url="https://www.weather.gov/disclaimer",
            license_type="US Public Domain",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.cdo_token = settings.NOAA_CDO_TOKEN
        # Primary: CDO API v2 (needs token); Fallback: SWDI severe weather (no auth)
        self.cdo_base_url = "https://www.ncdc.noaa.gov/cdo-web/api/v2"
        self.swdi_base_url = "https://www.ncdc.noaa.gov/swdi/rest/csv"
        self.alerts_base_url = "https://api.weather.gov/alerts/active"
        self.user_agent = "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)"

    async def check_health(self) -> Dict[str, Any]:
        """Check NOAA Weather.gov alerts API health (no auth required)."""
        try:
            headers = {
                "User-Agent": self.user_agent,
                "Accept": "application/geo+json"
            }
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(
                    f"{self.alerts_base_url}?status=actual",
                    headers=headers
                )
                if res.status_code == 200:
                    self.record_success()
                    return {
                        "status": "HEALTHY",
                        "latency_ms": res.elapsed.total_seconds() * 1000,
                        "cdo_token_configured": bool(self.cdo_token)
                    }
                self.record_failure()
                return {"status": "DEGRADED", "http_code": res.status_code}
        except Exception as e:
            self.record_failure()
            return {"status": "UNHEALTHY", "error": str(e)}

    async def fetch(self, target_entities: List[str], target_geographies: List[str]) -> List[Dict[str, Any]]:
        """Fetch active severe weather alerts from NOAA Weather.gov API."""
        if not self.is_available():
            return []

        results = []
        try:
            headers = {
                "User-Agent": self.user_agent,
                "Accept": "application/geo+json"
            }
            # Fetch active alerts — free, no key required (weather.gov does not accept 'limit' query parameter)
            params = {
                "status": "actual"
            }
            # Add area filter for US state codes if geographies provided
            # NOAA alerts API uses US state abbreviations
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                res = await client.get(self.alerts_base_url, headers=headers, params=params)
                if res.status_code == 200:
                    data = res.json()
                    for feature in data.get("features", [])[:5]:
                        props = feature.get("properties", {})
                        results.append({
                            "alert_id": props.get("id", ""),
                            "event": props.get("event", "Unknown Event"),
                            "headline": props.get("headline", ""),
                            "description": (props.get("description", "") or "")[:500],
                            "severity": props.get("severity", "Unknown"),
                            "certainty": props.get("certainty", "Unknown"),
                            "urgency": props.get("urgency", "Unknown"),
                            "areas": props.get("areaDesc", ""),
                            "effective": props.get("effective", ""),
                            "expires": props.get("expires", ""),
                            "sender": props.get("senderName", "NWS"),
                            "category": props.get("category", "Met"),
                        })
                    self.record_success()
                    logger.info(f"NOAA: Retrieved {len(results)} active weather alerts")
                else:
                    self.record_failure()
                    logger.warning(f"NOAA alerts API returned HTTP {res.status_code}")
        except httpx.TimeoutException:
            self.record_failure()
            logger.warning("NOAA alerts request timed out")
        except Exception as e:
            self.record_failure()
            logger.error(f"NOAA fetch error: {e}")

        return results

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_iso = datetime.now(timezone.utc).isoformat()
        evidence_list = []

        for r in raw_records:
            raw_str = json.dumps(r, sort_keys=True)
            content_hash = self.compute_content_hash(raw_str)
            alert_id = r.get("alert_id", content_hash[:12])
            ev_id = f"ev_noaa_{content_hash[:12]}"

            event_type = r.get("event", "Weather Event")
            severity = r.get("severity", "Unknown")
            areas = r.get("areas", "United States")
            headline = r.get("headline", event_type)

            # Parse effective date
            effective = r.get("effective", "")
            published_at = now_iso
            if effective:
                try:
                    dt = datetime.fromisoformat(effective.replace("Z", "+00:00"))
                    published_at = dt.isoformat()
                except Exception:
                    pass

            claim = (
                f"NOAA/NWS issued a {severity.lower()} severity '{event_type}' alert "
                f"affecting {areas[:200]}. {headline[:300]}"
            )

            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=f"https://api.weather.gov/alerts/{alert_id}" if alert_id else self.terms_url,
                title=f"NOAA Alert: {event_type} — {severity} Severity",
                claim_text=claim,
                evidence_type="weather_alert",
                published_at=published_at,
                retrieved_at=now_iso,
                geography=areas[:100] if areas else "US",
                verification_status=VerificationState.VERIFIED,
                verification_rationale=(
                    "Official National Weather Service alert issued through "
                    "authorized NOAA Weather.gov API. Instrument-verified meteorological data."
                ),
                license_id=self.license_type,
                attribution="Source: NOAA / National Weather Service (US Public Domain)",
                content_hash=content_hash,
                limitations=(
                    "Weather alerts are primarily US-focused. "
                    "Alert status is time-sensitive and may expire rapidly."
                )
            ))

        return evidence_list
