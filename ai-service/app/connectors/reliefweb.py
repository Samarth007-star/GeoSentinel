import json
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class ReliefWebConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_RELIEFWEB",
            category="International Organizations",
            provider_name="UN OCHA ReliefWeb API",
            terms_url="https://reliefweb.int/terms-conditions",
            license_type="CC-BY 4.0",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.RELIEFWEB_BASE_URL

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/reports?appname=geosentinel&limit=1")
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
            # Query recent humanitarian situation reports
            query_str = " OR ".join(target_geographies) if target_geographies else "humanitarian"
            url = f"{self.base_url}/reports?appname=geosentinel&query[value]={query_str}&limit=4&preset=latest"
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    for item in data.get("data", []):
                        fields = item.get("fields", {})
                        results.append({
                            "id": item.get("id"),
                            "title": fields.get("title"),
                            "body": fields.get("body", "")[:400] if fields.get("body") else fields.get("title"),
                            "date": fields.get("date", {}).get("created"),
                            "url": fields.get("url", f"https://reliefweb.int/node/{item.get('id')}")
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
            ev_id = f"ev_rw_{r['id']}"
            pub_date = r.get("date") or now_iso
            claim = f"ReliefWeb Humanitarian Situation Update: {r.get('title')}."
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=r.get("url", self.terms_url),
                title=f"UN OCHA ReliefWeb: {r.get('title')}",
                claim_text=claim,
                evidence_type="humanitarian_report",
                published_at=pub_date,
                retrieved_at=now_iso,
                verification_status=VerificationState.SOURCE_REFERENCED,
                verification_rationale="Published by UN OCHA ReliefWeb aggregator; requires corroboration with primary agency bulletins.",
                license_id=self.license_type,
                attribution="Source: UN OCHA ReliefWeb (CC-BY 4.0)",
                content_hash=content_hash,
                limitations="Secondary news digests in ReliefWeb reflect originating agency perspectives."
            ))
        return evidence_list
