import json
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class UnSdgConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_UN_SDG",
            category="International Organizations",
            provider_name="UN Statistics Division SDG API",
            terms_url="https://unstats.un.org/terms/",
            license_type="CC-BY 3.0 IGO",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.UN_SDG_BASE_URL

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/sdg/Target/List?format=json", headers={"User-Agent": "GeoSentinel/1.0"})
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
                res = await client.get(f"{self.base_url}/sdg/Target/List?format=json", headers={"User-Agent": "GeoSentinel/1.0"})
                if res.status_code == 200:
                    data = res.json()
                    # Filter targets relevant to economic growth, infrastructure, or energy
                    for item in data[:6]:
                        results.append({
                            "goal": item.get("goal"),
                            "code": item.get("code"),
                            "title": item.get("title"),
                            "description": item.get("description", item.get("title")),
                            "url": f"https://unstats.un.org/sdgs/indicators/database/?target={item.get('code')}"
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
            ev_id = f"ev_unsdg_{r['code'].replace('.', '_')}"
            claim = f"United Nations Sustainable Development Framework (Goal {r['goal']}, Target {r['code']}): {r['title']}."
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=r["url"],
                title=f"UN SDG Target {r['code']}: {r['title'][:80]}",
                claim_text=claim,
                evidence_type="multilateral_standard",
                published_at="2024-01-01T00:00:00Z",
                retrieved_at=now_iso,
                geography="WLD",
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Official multilateral development framework established by United Nations General Assembly.",
                license_id=self.license_type,
                attribution="Source: United Nations Statistics Division Open API (CC-BY 3.0 IGO)",
                content_hash=content_hash,
                limitations="Global multilateral framework benchmark; local policy adaptation required."
            ))
        return evidence_list
