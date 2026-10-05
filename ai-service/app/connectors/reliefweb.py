import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState, ConnectorStatus
from ..core.config import settings

class ReliefWebConnector(BaseConnector):
    """
    Connector for UN OCHA ReliefWeb API v2.
    Provides humanitarian crisis updates, disaster reports, and situation analysis.
    Note: ReliefWeb API v2 requires an approved appname registration parameter.
    """
    def __init__(self):
        super().__init__(
            connector_id="CONN_RELIEFWEB",
            category="International Organizations",
            provider_name="UN OCHA ReliefWeb API",
            terms_url="https://reliefweb.int/terms-conditions",
            license_type="CC-BY 4.0",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.RELIEFWEB_BASE_URL.rstrip('/')
        self.appname = settings.RELIEFWEB_APPNAME.strip()
        self.auth_type = "Pre-approved Appname Parameter (Free)"
        self.last_checked: Optional[str] = None
        self.last_success: Optional[str] = None
        self.last_error: Optional[str] = None
        self.records_retrieved: int = 0

    def is_available(self) -> bool:
        if not self.appname:
            return False
        return super().is_available()

    async def check_health(self) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        self.last_checked = now_iso
        
        if not self.appname:
            self.last_error = "RELIEFWEB_APPNAME is not configured. ReliefWeb API v2 requires a pre-approved appname."
            return {
                "status": "CREDENTIAL_MISSING",
                "message": self.last_error,
                "registration_url": "https://apidoc.reliefweb.int/parameters#appname"
            }

        try:
            url = f"{self.base_url}/reports?appname={self.appname}&limit=1"
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    self.record_success()
                    self.last_success = now_iso
                    self.last_error = None
                    return {"status": "HEALTHY", "latency_ms": res.elapsed.total_seconds() * 1000}
                elif res.status_code == 403:
                    self.record_failure()
                    self.last_error = f"HTTP 403 Forbidden: Unapproved appname '{self.appname}'."
                    return {"status": "BLOCKED", "http_code": 403, "error": self.last_error}
                else:
                    self.record_failure()
                    self.last_error = f"HTTP {res.status_code}"
                    return {"status": "DEGRADED", "http_code": res.status_code}
        except httpx.TimeoutException:
            self.record_failure()
            self.last_error = "Connection timed out."
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

        # Build search query from entities and geographies
        terms = [g for g in target_geographies if g] + [e for e in target_entities if e]
        query_str = " OR ".join(terms[:4]) if terms else "humanitarian crisis"

        url = f"{self.base_url}/reports?appname={self.appname}&query[value]={query_str}&limit=5&profile=full"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    for item in data.get("data", []):
                        fields = item.get("fields", {})
                        results.append({
                            "id": item.get("id"),
                            "title": fields.get("title", "Untitled Humanitarian Report"),
                            "body": fields.get("body", "")[:500] if fields.get("body") else fields.get("title", ""),
                            "date": fields.get("date", {}).get("created") or fields.get("date", {}).get("original"),
                            "url": fields.get("url") or f"https://reliefweb.int/node/{item.get('id')}",
                            "country": fields.get("primary_country", {}).get("name") or (fields.get("country", [{}])[0].get("name") if fields.get("country") else None),
                            "source": fields.get("source", [{}])[0].get("name") if fields.get("source") else "ReliefWeb Partner",
                            "query": query_str
                        })
                    self.record_success()
                    self.last_success = now_iso
                    self.records_retrieved += len(results)
                    self.last_error = None
                elif res.status_code == 403:
                    self.record_failure()
                    self.last_error = f"HTTP 403 Forbidden: Unapproved appname '{self.appname}'."
                elif res.status_code == 429:
                    self.status = ConnectorStatus.RATE_LIMITED
                    self.last_error = "Rate limit exceeded (HTTP 429)."
                else:
                    self.record_failure()
                    self.last_error = f"HTTP error {res.status_code} from ReliefWeb."
        except httpx.TimeoutException:
            self.record_failure()
            self.last_error = "ReliefWeb request timed out."
        except Exception as e:
            self.record_failure()
            self.last_error = str(e)

        return results

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_iso = datetime.now(timezone.utc).isoformat()
        records: List[EvidenceRecord] = []

        for item in raw_records:
            rep_id = str(item.get("id", "")).strip()
            if not rep_id:
                continue
            title = item.get("title", "ReliefWeb Humanitarian Report")
            body_snip = item.get("body", "")
            source_url = item.get("url", f"https://reliefweb.int/node/{rep_id}")
            country = item.get("country")
            source_org = item.get("source", "UN OCHA ReliefWeb")
            published_at = item.get("date") or now_iso

            claim_text = f"[{source_org}] {title}. {body_snip}".strip()
            content_hash = hashlib.sha256(f"{rep_id}:{title}:{published_at}".encode("utf-8")).hexdigest()

            records.append(EvidenceRecord(
                evidence_id=f"ev_rw_{rep_id}",
                source_id=self.connector_id,
                source_name=f"UN OCHA ReliefWeb ({source_org})",
                source_url=source_url,
                title=f"ReliefWeb: {title[:120]}",
                claim_text=claim_text,
                evidence_type="humanitarian_report",
                published_at=published_at,
                retrieved_at=now_iso,
                geography=country,
                data_origin="LIVE",
                verification_status=VerificationState.SOURCE_REFERENCED,
                verification_rationale="Retrieved from official UN OCHA ReliefWeb API v2 with structured report metadata.",
                license_id=self.license_type,
                attribution=f"Source: UN OCHA ReliefWeb / {source_org} (CC-BY 4.0)",
                content_hash=content_hash,
                limitations="Humanitarian field assessments reflect operational estimates subject to evolving ground conditions."
            ))

        return records
