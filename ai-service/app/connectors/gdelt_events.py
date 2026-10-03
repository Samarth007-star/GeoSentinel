import json
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class GdeltEventsConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_GDELT_EVENTS",
            category="Conflict & Political Events",
            provider_name="GDELT Project Real-Time Events Feed",
            terms_url="https://www.gdeltproject.org/data.html",
            license_type="Open Research Access",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.GDELT_EVENTS_BASE_URL

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                res = await client.get(f"{self.base_url}/lastupdate.txt", headers={"User-Agent": "GeoSentinel/1.0"})
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
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                res = await client.get(f"{self.base_url}/lastupdate.txt", headers={"User-Agent": "GeoSentinel/1.0"})
                if res.status_code == 200:
                    lines = res.text.strip().split("\n")
                    for line in lines:
                        parts = line.strip().split()
                        if len(parts) >= 3:
                            size_bytes = parts[0]
                            file_md5 = parts[1]
                            file_url = parts[2]
                            file_name = file_url.split("/")[-1]
                            results.append({
                                "file_name": file_name,
                                "file_url": file_url,
                                "file_md5": file_md5,
                                "size_bytes": size_bytes,
                                "retrieved_at": datetime.now(timezone.utc).isoformat()
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
            ev_id = f"ev_gdelt_{content_hash[:12]}"
            feed_type = "Events Stream" if "export" in r["file_name"] else ("Mentions Stream" if "mentions" in r["file_name"] else "GKG Knowledge Stream")
            claim = f"GDELT 2.0 Global Conflict & Political Telemetry: Published 15-minute global stream '{r['file_name']}' ({feed_type}, size: {int(r['size_bytes']):,} bytes, MD5: {r['file_md5']})."
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=r["file_url"],
                title=f"GDELT Real-Time Event Stream: {r['file_name']}",
                claim_text=claim,
                evidence_type="conflict_political_event",
                published_at=now_iso,
                retrieved_at=now_iso,
                geography="WLD",
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Derived from GDELT 2.0 automated global 15-minute event synchronization monitor.",
                license_id=self.license_type,
                attribution="Source: The GDELT Project (Open Research Access)",
                content_hash=content_hash,
                limitations="Automated multi-lingual broadcast parsing subject to news media reporting density."
            ))
        return evidence_list
