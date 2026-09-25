import json
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class NasaEonetConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_NASA_EONET",
            category="Scientific & Disaster",
            provider_name="NASA Earth Observatory Natural Event Tracker (EONET)",
            terms_url="https://www.nasa.gov/open/data.html",
            license_type="NASA Open Access",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.NASA_EONET_BASE_URL

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/events?limit=1")
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
            url = f"{self.base_url}/events?status=open&limit=5"
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    for event in data.get("events", []):
                        results.append({
                            "id": event.get("id"),
                            "title": event.get("title"),
                            "categories": [c.get("title") for c in event.get("categories", [])],
                            "sources": [s.get("url") for s in event.get("sources", []) if s.get("url")],
                            "geometries": event.get("geometry", [])
                        })
            self.record_success()
        except Exception:
            self.record_failure()
        return results

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_iso = datetime.now(timezone.utc).isoformat()
        evidence_list = []
        for r in raw_records:
            raw_str = json.dumps(r, sort_keys=True)
            content_hash = self.compute_content_hash(raw_str)
            cats = ", ".join(r.get("categories", ["Natural Event"]))
            ev_id = f"ev_nasa_{r['id']}"
            source_link = r["sources"][0] if r.get("sources") else f"{self.base_url}/events/{r['id']}"
            claim = f"NASA EONET detected active {cats} event: '{r.get('title')}'."
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=source_link,
                title=f"NASA EONET: {r.get('title')}",
                claim_text=claim,
                evidence_type="satellite_disaster_signal",
                published_at=now_iso,
                retrieved_at=now_iso,
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Derived from NASA satellite remote-sensing observations and partnered meteorological agencies.",
                license_id=self.license_type,
                attribution="Source: NASA EONET / Earth Science Data Systems",
                content_hash=content_hash,
                limitations="Coordinates reflect latest satellite orbital pass centerpoint."
            ))
        return evidence_list
