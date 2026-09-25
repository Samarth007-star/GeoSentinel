import json
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class UsgsConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_USGS",
            category="Scientific & Disaster",
            provider_name="USGS Earthquake Hazards Program",
            terms_url="https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits",
            license_type="Public Domain",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.USGS_BASE_URL

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/query?format=geojson&limit=1")
                if res.status_code == 200:
                    self.record_success()
                    return {"status": "HEALTHY", "latency_ms": res.elapsed.total_seconds() * 1000}
                self.record_failure()
                return {"status": "DEGRADED", "http_code": res.status_code}
        except Exception as e:
            self.record_failure()
            return {"status": "UNHEALTHY", "error": str(e)}

    async def fetch(self, target_entities: List[str], target_geographies: List[str]) -> List[Dict[str, Any]]:
        if not self.is_available():
            return []

        results = []
        try:
            # Query recent significant seismic events
            url = f"{self.base_url}/query?format=geojson&minmagnitude=4.5&limit=5"
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    for feature in data.get("features", []):
                        props = feature.get("properties", {})
                        geom = feature.get("geometry", {})
                        results.append({
                            "event_id": feature.get("id"),
                            "title": props.get("title"),
                            "mag": props.get("mag"),
                            "place": props.get("place"),
                            "time_ms": props.get("time"),
                            "url": props.get("url", url),
                            "coordinates": geom.get("coordinates", [])
                        })
            self.record_success()
        except Exception:
            self.record_failure()
        return results

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_iso = datetime.now(timezone.utc).isoformat()
        evidence_list = []
        for r in raw_records:
            time_sec = (r.get("time_ms") or 0) / 1000.0
            pub_date = datetime.fromtimestamp(time_sec, timezone.utc).isoformat() if time_sec > 0 else now_iso
            raw_str = json.dumps(r, sort_keys=True)
            content_hash = self.compute_content_hash(raw_str)
            ev_id = f"ev_usgs_{r['event_id']}"
            claim = f"USGS recorded a magnitude {r.get('mag')} earthquake located at {r.get('place')}."
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=r.get("url", self.terms_url),
                title=f"USGS Seismic Event: {r.get('title')}",
                claim_text=claim,
                evidence_type="geophysical_event",
                published_at=pub_date,
                retrieved_at=now_iso,
                geography=r.get("place"),
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Physical seismographic sensor measurement confirmed by USGS National Earthquake Information Center.",
                license_id=self.license_type,
                attribution="Source: USGS Earthquake Hazards Program (Public Domain)",
                content_hash=content_hash,
                limitations="Preliminary magnitudes subject to review and revision by USGS analysts."
            ))
        return evidence_list
