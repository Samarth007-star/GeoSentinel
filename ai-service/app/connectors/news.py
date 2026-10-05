import json
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class NewsFeedConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_NEWS",
            category="News Sources",
            provider_name="UN News Service Global Feed",
            terms_url="https://news.un.org/en/content/terms-service",
            license_type="Open Access",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.feed_url = settings.UN_NEWS_FEED_URL

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                res = await client.get(self.feed_url, headers={"User-Agent": "GeoSentinel/1.0"})
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
                res = await client.get(self.feed_url, headers={"User-Agent": "GeoSentinel/1.0"})
                if res.status_code == 200:
                    root = ET.fromstring(res.content)
                    items = root.findall(".//item")
                    for item in items[:6]:
                        title = item.findtext("title", "").strip()
                        link = item.findtext("link", "").strip()
                        pub_date = item.findtext("pubDate", "").strip()
                        description = item.findtext("description", "").strip()
                        guid = item.findtext("guid", link).strip()
                        if title and link:
                            results.append({
                                "guid": guid,
                                "title": title,
                                "link": link,
                                "pub_date": pub_date,
                                "description": description[:300]
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
            ev_id = f"ev_news_{content_hash[:12]}"
            claim = f"Global News Dispatch: {r['title']}. Summary: {r.get('description') or r['title']}"
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=r["link"],
                title=f"UN News: {r['title']}",
                claim_text=claim,
                evidence_type="news_dispatch",
                published_at=r.get("pub_date") or now_iso,
                retrieved_at=now_iso,
                geography="WLD",
                verification_status=VerificationState.SOURCE_REFERENCED,
                verification_rationale="Live news dispatch from UN News Service multilateral news feed.",
                license_id=self.license_type,
                attribution="Source: UN News Service Open Feed (Open Access)",
                content_hash=content_hash,
                limitations="News reporting reflects ongoing situation updates and is subject to developing verification."
            ))
        return evidence_list
