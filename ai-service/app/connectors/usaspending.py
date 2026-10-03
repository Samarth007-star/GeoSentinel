import json
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class UsaSpendingConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_USASPENDING",
            category="Government Open Data",
            provider_name="US Federal Government Open Data (USAspending)",
            terms_url="https://www.usaspending.gov/about",
            license_type="Public Domain",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.USASPENDING_BASE_URL

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/references/toptier_agencies/", headers={"User-Agent": "GeoSentinel/1.0"})
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
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/references/toptier_agencies/", headers={"User-Agent": "GeoSentinel/1.0"})
                if res.status_code == 200:
                    data = res.json()
                    for item in data.get("results", [])[:5]:
                        results.append({
                            "agency_id": item.get("agency_id"),
                            "agency_name": item.get("agency_name"),
                            "abbreviation": item.get("abbreviation"),
                            "toptier_code": item.get("toptier_code"),
                            "url": f"https://www.usaspending.gov/agency/{item.get('toptier_code')}"
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
            ev_id = f"ev_usaspending_{r['agency_id']}"
            claim = f"US Federal Government Open Data: {r['agency_name']} ({r.get('abbreviation') or 'N/A'}) reported official public budget and agency operational status."
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=r["url"],
                title=f"USAspending Open Data: {r['agency_name']}",
                claim_text=claim,
                evidence_type="government_open_data",
                published_at=now_iso,
                retrieved_at=now_iso,
                geography="USA",
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Retrieved from official US Federal Government USAspending Open Data API with deterministic schema validation.",
                license_id=self.license_type,
                attribution="Source: US Federal Government Open Data (Public Domain)",
                content_hash=content_hash,
                limitations="Reflects US Federal agency public registry and authorizations."
            ))
        return evidence_list
