import asyncio
import hashlib
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState, ConnectorStatus
from ..core.config import settings

class GdeltConnector(BaseConnector):
    """
    Connector for GDELT Project 2.0 DOC API.
    Provides global event, news, and geopolitical reporting telemetry.
    Respects GDELT rate limits (minimum 5 seconds between consecutive requests).
    """
    _last_request_time: float = 0.0

    def __init__(self):
        super().__init__(
            connector_id="CONN_GDELT",
            category="News",
            provider_name="GDELT Project (DOC 2.0 API)",
            terms_url="https://www.gdeltproject.org/data.html",
            license_type="Open Research Access",
            timeout=15.0
        )
        self.base_url = settings.GDELT_BASE_URL.rstrip('/')
        self.auth_type = "None (Public API)"
        self.last_checked: Optional[str] = None
        self.last_success: Optional[str] = None
        self.last_error: Optional[str] = None
        self.records_retrieved: int = 0

    async def _rate_limit_throttle(self):
        now = time.time()
        elapsed = now - GdeltConnector._last_request_time
        if elapsed < 5.0:
            await asyncio.sleep(5.0 - elapsed)
        GdeltConnector._last_request_time = time.time()

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
                    self.last_success = now_iso
                    self.last_error = None
                    return {"status": "HEALTHY", "latency_ms": res.elapsed.total_seconds() * 1000}
                elif res.status_code == 429:
                    self.status = ConnectorStatus.RATE_LIMITED
                    self.last_error = "GDELT rate limit exceeded (HTTP 429). Throttling required."
                    return {"status": "RATE_LIMITED", "http_code": 429, "error": self.last_error}
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
            await self._rate_limit_throttle()
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
                    self.last_success = now_iso
                    self.records_retrieved += len(results)
                    self.last_error = None
                elif res.status_code == 429:
                    self.status = ConnectorStatus.RATE_LIMITED
                    self.last_error = "GDELT rate limit exceeded (HTTP 429)."
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
