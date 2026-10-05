import hashlib
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState, ConnectorStatus
from ..core.config import settings

class WikimediaPageviewsConnector(BaseConnector):
    """
    Connector for Wikimedia Foundation REST API (Pageviews).
    Monitors public digital information consumption and search/reading attention signals.
    Note: Represents public digital attention, NOT sentiment or social media opinion.
    """
    def __init__(self):
        super().__init__(
            connector_id="CONN_WIKIMEDIA",
            category="Public Social/Digital Signals",
            provider_name="Wikimedia REST API (Pageviews)",
            terms_url="https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use",
            license_type="CC-BY-SA 3.0 / Open Access",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.WIKIMEDIA_BASE_URL.rstrip('/')
        self.auth_type = "User-Agent Header (Free Public API)"
        self.headers = {
            "User-Agent": "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)",
            "Accept": "application/json"
        }
        self.last_checked: Optional[str] = None
        self.last_success: Optional[str] = None
        self.last_error: Optional[str] = None
        self.records_retrieved: int = 0

    async def check_health(self) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        self.last_checked = now_iso
        now_dt = datetime.now(timezone.utc)
        # End date 3 days ago to account for Wikimedia 24-48h ingestion lag
        end_dt = now_dt - timedelta(days=2)
        start_dt = end_dt - timedelta(days=1)
        start_str = start_dt.strftime("%Y%m%d00")
        end_str = end_dt.strftime("%Y%m%d00")

        url = f"{self.base_url}/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/India/daily/{start_str}/{end_str}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, headers=self.headers)
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
            self.last_error = "Wikimedia Pageviews connection timed out."
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

        now_dt = datetime.now(timezone.utc)
        end_dt = now_dt - timedelta(days=2)
        start_dt = end_dt - timedelta(days=3)
        start_str = start_dt.strftime("%Y%m%d00")
        end_str = end_dt.strftime("%Y%m%d00")

        # Map entities and countries to Wikipedia article titles
        articles = []
        for term in target_entities + target_geographies:
            if not term:
                continue
            clean = term.strip().replace(" ", "_").capitalize()
            if clean and clean not in articles:
                articles.append(clean)

        if not articles:
            articles = ["India", "Iran"]

        for article in articles[:3]:  # Bounded queries
            url = f"{self.base_url}/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/{article}/daily/{start_str}/{end_str}"
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    res = await client.get(url, headers=self.headers)
                    if res.status_code == 200:
                        items = res.json().get("items", [])
                        for it in items:
                            results.append({
                                "project": it.get("project", "en.wikipedia"),
                                "article": it.get("article", article),
                                "granularity": it.get("granularity", "daily"),
                                "timestamp": it.get("timestamp"),
                                "views": it.get("views", 0),
                                "access": it.get("access", "all-access"),
                                "agent": it.get("agent", "all-agents")
                            })
                        self.record_success()
                        self.last_success = now_iso
                        self.last_error = None
                    elif res.status_code == 404:
                        # Article title not found in English Wikipedia
                        pass
                    elif res.status_code == 429:
                        self.status = ConnectorStatus.RATE_LIMITED
                        self.last_error = "Wikimedia rate limit exceeded (HTTP 429)."
                    else:
                        self.record_failure()
                        self.last_error = f"HTTP {res.status_code} from Wikimedia Pageviews."
            except httpx.TimeoutException:
                self.record_failure()
                self.last_error = "Wikimedia request timed out."
            except Exception as e:
                self.record_failure()
                self.last_error = str(e)

        self.records_retrieved += len(results)
        return results

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_iso = datetime.now(timezone.utc).isoformat()
        records: List[EvidenceRecord] = []

        for it in raw_records:
            article = it.get("article", "Topic")
            article_display = article.replace("_", " ")
            views = it.get("views", 0)
            raw_ts = it.get("timestamp", "")

            # Parse YYYYMMDDHH to ISO date
            published_at = now_iso
            date_str = raw_ts[:8] if len(raw_ts) >= 8 else "recent"
            if len(raw_ts) >= 8:
                try:
                    dt = datetime.strptime(raw_ts[:8], "%Y%m%d").replace(tzinfo=timezone.utc)
                    published_at = dt.isoformat()
                    date_str = dt.strftime("%Y-%m-%d")
                except Exception:
                    published_at = now_iso

            source_url = f"https://en.wikipedia.org/wiki/{article}"
            claim_text = (
                f"Wikimedia Pageviews API recorded {views:,} views on English Wikipedia for '{article_display}' "
                f"on {date_str}. Public digital attention signal reflects relative open-source reading interest "
                f"(distinguished from social media sentiment or opinion polls)."
            )

            content_hash = hashlib.sha256(f"{article}:{raw_ts}:{views}".encode("utf-8")).hexdigest()
            ev_id = f"ev_wpv_{article.lower()[:10]}_{raw_ts}"

            records.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name="Wikimedia Pageviews API",
                source_url=source_url,
                title=f"Wikimedia Digital Attention: '{article_display}' ({views:,} daily views on {date_str})",
                claim_text=claim_text,
                evidence_type="digital_attention_signal",
                published_at=published_at,
                retrieved_at=now_iso,
                geography=article_display if article_display in ["India", "Iran", "United States", "China", "Russia"] else None,
                data_origin="LIVE",
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Empirical aggregate request logs from Wikimedia Foundation server infrastructure.",
                license_id=self.license_type,
                attribution="Source: Wikimedia Foundation REST API (Public Digital Attention Signal, CC-BY-SA 3.0)",
                content_hash=content_hash,
                limitations="Measures encyclopedic information retrieval attention; does not measure emotional sentiment or public approval."
            ))

        return records

# Alias for backward compatibility
WikimediaSignalsConnector = WikimediaPageviewsConnector
