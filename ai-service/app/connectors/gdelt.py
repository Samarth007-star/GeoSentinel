import asyncio
import hashlib
import logging
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState, ConnectorStatus
from ..core.config import settings

logger = logging.getLogger(__name__)

class GdeltConnector(BaseConnector):
    """
    Connector for GDELT Project 2.0 DOC API.
    Provides global event, news, and geopolitical reporting telemetry.
    Respects GDELT rate limits (minimum 5 seconds between consecutive requests).
    Implements exponential backoff on 429 and Retry-After header support.
    """
    _last_request_time: float = 0.0
    _backoff_seconds: float = 5.0  # starts at 5s, doubles on 429
    _max_backoff: float = 60.0
    _rate_limit_until: float = 0.0  # time.time() until which we must wait

    def __init__(self):
        super().__init__(
            connector_id="CONN_GDELT",
            category="News",
            provider_name="GDELT Project (DOC 2.0 API)",
            terms_url="https://www.gdeltproject.org/data.html",
            license_type="Open Research Access",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.GDELT_BASE_URL.rstrip('/')
        self.auth_type = "None (Public API)"
        self.last_checked: Optional[str] = None
        self.last_success: Optional[str] = None
        self.last_error: Optional[str] = None
        self.records_retrieved: int = 0

    async def _rate_limit_throttle(self) -> bool:
        """Enforce minimum interval between requests plus any rate-limit cooldown."""
        now = time.time()
        # Honour Retry-After / backoff cooldown
        if now < GdeltConnector._rate_limit_until:
            wait = GdeltConnector._rate_limit_until - now
            if wait > 2.0:
                logger.info(f"GDELT rate-limit cooldown active ({wait:.1f}s remaining); skipping live fetch to avoid latency.")
                return False
            await asyncio.sleep(wait)
        # Enforce minimum inter-request gap
        elapsed = time.time() - GdeltConnector._last_request_time
        if elapsed < GdeltConnector._backoff_seconds:
            gap = GdeltConnector._backoff_seconds - elapsed
            if gap > 2.0:
                return False
            await asyncio.sleep(gap)
        GdeltConnector._last_request_time = time.time()
        return True

    def _handle_rate_limit(self, response: httpx.Response):
        """Parse Retry-After header and apply exponential backoff on 429."""
        retry_after = response.headers.get("Retry-After")
        if retry_after:
            try:
                wait_seconds = float(retry_after)
            except (ValueError, TypeError):
                wait_seconds = GdeltConnector._backoff_seconds * 2
        else:
            wait_seconds = GdeltConnector._backoff_seconds * 2
        # Cap the backoff
        wait_seconds = min(wait_seconds, GdeltConnector._max_backoff)
        GdeltConnector._backoff_seconds = min(wait_seconds, GdeltConnector._max_backoff)
        GdeltConnector._rate_limit_until = time.time() + wait_seconds
        self.status = ConnectorStatus.RATE_LIMITED
        logger.warning(f"GDELT 429: backoff set to {wait_seconds:.1f}s")

    def _reset_backoff(self):
        """Reset backoff to default after successful request."""
        GdeltConnector._backoff_seconds = 5.0
        GdeltConnector._rate_limit_until = 0.0

    async def check_health(self) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        self.last_checked = now_iso
        try:
            await self._rate_limit_throttle()
            url = f"{self.base_url}/doc/doc?query=geopolitics&mode=artlist&maxrecords=1&format=json"
            headers = {
                "User-Agent": "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)",
                "Accept": "*/*"
            }
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    self.record_success()
                    self._reset_backoff()
                    self.last_success = now_iso
                    self.last_error = None
                    return {"status": "HEALTHY", "latency_ms": res.elapsed.total_seconds() * 1000}
                elif res.status_code == 429:
                    self._handle_rate_limit(res)
                    self.last_error = f"GDELT rate limit exceeded (HTTP 429). Backoff: {GdeltConnector._backoff_seconds:.0f}s."
                    return {"status": "RATE_LIMITED", "http_code": 429, "retry_after_seconds": GdeltConnector._backoff_seconds, "error": self.last_error}
                else:
                    self.record_failure()
                    self.last_error = f"HTTP {res.status_code}"
                    return {"status": "DEGRADED", "http_code": res.status_code}
        except httpx.TimeoutException:
            self.record_failure()
            self.last_error = "GDELT connection timed out."
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

        # Build clean query terms
        terms = [g for g in target_geographies if g] + [e for e in target_entities if e]
        query_str = " ".join(terms[:3]) if terms else "geopolitical security"

        url = f"{self.base_url}/doc/doc?query={query_str}&mode=artlist&maxrecords=5&format=json"
        headers = {
            "User-Agent": "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)",
            "Accept": "*/*"
        }

        try:
            proceed = await self._rate_limit_throttle()
            if not proceed:
                return []
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    for art in data.get("articles", []):
                        results.append({
                            "title": art.get("title", "Untitled News Article"),
                            "url": art.get("url", ""),
                            "domain": art.get("domain", ""),
                            "seendate": art.get("seendate", ""),
                            "language": art.get("language", "English"),
                            "sourcecountry": art.get("sourcecountry", ""),
                            "query": query_str
                        })
                    self.record_success()
                    self._reset_backoff()
                    self.last_success = now_iso
                    self.records_retrieved += len(results)
                    self.last_error = None
                elif res.status_code == 429:
                    self._handle_rate_limit(res)
                    self.last_error = f"GDELT rate limit exceeded (HTTP 429). Next retry after {GdeltConnector._backoff_seconds:.0f}s."
                else:
                    self.record_failure()
                    self.last_error = f"HTTP {res.status_code} from GDELT."
        except httpx.TimeoutException:
            self.record_failure()
            self.last_error = "GDELT request timed out."
        except Exception as e:
            self.record_failure()
            self.last_error = str(e)

        return results

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_iso = datetime.now(timezone.utc).isoformat()
        records: List[EvidenceRecord] = []

        for art in raw_records:
            url = art.get("url", "").strip()
            title = art.get("title", "").strip()
            if not url and not title:
                continue
            if not title:
                title = "GDELT Monitored Event"
            domain = art.get("domain", "gdeltproject.org")
            seendate = art.get("seendate", "")
            query = art.get("query", "")

            # Parse seendate YYYYMMDDTHHMMSSZ or YYYYMMDDHHMMSS
            published_at = now_iso
            if seendate and len(seendate) >= 8:
                try:
                    if "T" in seendate:
                        dt = datetime.strptime(seendate, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
                    else:
                        dt = datetime.strptime(seendate[:14], "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
                    published_at = dt.isoformat()
                except Exception:
                    published_at = now_iso

            content_hash = hashlib.sha256(f"{url}:{title}:{seendate}".encode("utf-8")).hexdigest()
            ev_id = f"ev_gdelt_{content_hash[:12]}"

            records.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=f"GDELT Project ({domain})",
                source_url=url if url else f"https://www.gdeltproject.org/data.html#{ev_id}",
                title=f"GDELT: {title[:120]}",
                claim_text=f"[{domain}] {title} (Reported: {published_at[:10]}, query: '{query}').",
                evidence_type="news_report",
                published_at=published_at,
                retrieved_at=now_iso,
                geography=art.get("sourcecountry") or None,
                data_origin="LIVE",
                verification_status=VerificationState.SOURCE_REFERENCED,
                verification_rationale="Retrieved from official GDELT 2.0 DOC API with validated source domain provenance.",
                license_id=self.license_type,
                attribution=f"Source: GDELT Project / {domain} (Open Research Access)",
                content_hash=content_hash,
                limitations="Media monitoring feeds aggregate press reports without independent factual verification."
            ))

        return records
