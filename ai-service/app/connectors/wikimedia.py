import json
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class WikimediaSignalsConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_WIKIMEDIA",
            category="Public Social Signals",
            provider_name="Wikimedia Foundation Pageviews API",
            terms_url="https://wikimediafoundation.org/terms-of-use/",
            license_type="CC0 1.0",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.WIKIMEDIA_BASE_URL
        self.headers = {"User-Agent": "GeoSentinel-Research-Agent/1.0 (contact: info@geosentinel.org)"}

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(
                    f"{self.base_url}/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/India/daily/20240101/20240102",
                    headers=self.headers
                )
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

        # Target article names
        articles = [g.replace(" ", "_") for g in target_geographies if len(g) > 2]
        if not articles:
            articles = ["India", "Strait_of_Hormuz", "Crude_oil"]

        # 30-day window from reference period
        start_date = "20240101"
        end_date = "20240105"

        results = []
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                for art in articles[:2]:
                    url = f"{self.base_url}/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/{art}/daily/{start_date}/{end_date}"
                    res = await client.get(url, headers=self.headers)
                    if res.status_code == 200:
                        data = res.json()
                        items = data.get("items", [])
                        total_views = sum(it.get("views", 0) for it in items)
                        avg_views = total_views / max(len(items), 1)
                        if items:
                            results.append({
                                "article": art,
                                "total_views": total_views,
                                "avg_daily_views": int(avg_views),
                                "sample_timestamp": items[-1].get("timestamp"),
                                "url": f"https://en.wikipedia.org/wiki/{art}"
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
            ev_id = f"ev_wiki_pv_{r['article'].lower()}"
            claim = f"Public attention signal: Wikipedia article '{r['article']}' registered {r['total_views']} aggregate reader views with an average daily engagement volume of {r['avg_daily_views']:,} requests."
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=r["url"],
                title=f"Public Attention Signal: {r['article'].replace('_', ' ')} Pageviews",
                claim_text=claim,
                evidence_type="public_social_signal",
                published_at="2024-01-05T00:00:00Z",
                retrieved_at=now_iso,
                geography=r["article"][:3].upper() if len(r["article"]) == 3 else "WLD",
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Derived from Wikimedia Foundation open access analytics telemetry measuring public information-seeking attention intensity.",
                license_id=self.license_type,
                attribution="Source: Wikimedia Foundation Analytics Open API (CC0 1.0)",
                content_hash=content_hash,
                limitations="Pageview metrics indicate public curiosity and information search spikes; not direct causal sentiment."
            ))
        return evidence_list
