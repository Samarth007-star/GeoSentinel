import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState, ConnectorStatus
from ..core.config import settings

class WikidataConnector(BaseConnector):
    """
    Connector for Wikidata Knowledge Base SPARQL API.
    Provides structured entity definitions, administrative relationships, and knowledge graph relations.
    """
    def __init__(self):
        super().__init__(
            connector_id="CONN_WIKIDATA",
            category="Geographic & Entities",
            provider_name="Wikidata Knowledge Base (SPARQL)",
            terms_url="https://www.wikidata.org/wiki/Wikidata:Data_reuse",
            license_type="CC0 1.0 Public Domain",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.endpoint = "https://query.wikidata.org/sparql"
        self.auth_type = "User-Agent Header (Free Public SPARQL)"
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
        sparql = "SELECT ?item WHERE { ?item wdt:P31 wd:P6256. } LIMIT 1"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(self.endpoint, params={"query": sparql, "format": "json"}, headers=self.headers)
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
            self.last_error = "Wikidata connection timed out."
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

        # Build list of entities to query
        search_terms = [e for e in target_entities if e] + [g for g in target_geographies if g]
        if not search_terms:
            search_terms = ["India", "Iran"]

        for term in search_terms[:3]:  # Bounded queries
            clean_term = term.strip().replace('"', '\\"')
            sparql = f"""
            SELECT ?item ?itemLabel ?itemDescription ?instanceOfLabel WHERE {{
              SERVICE wikibase:mwapi {{
                bd:serviceParam wikibase:endpoint "www.wikidata.org";
                                wikibase:api "EntitySearch";
                                mwapi:search "{clean_term}";
                                mwapi:language "en".
                ?item wikibase:apiOutputItem mwapi:item.
              }}
              OPTIONAL {{ ?item wdt:P31 ?instanceOf. }}
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
            }} LIMIT 3
            """
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    res = await client.get(self.endpoint, params={"query": sparql, "format": "json"}, headers=self.headers)
                    if res.status_code == 200:
                        bindings = res.json().get("results", {}).get("bindings", [])
                        for b in bindings:
                            item_uri = b.get("item", {}).get("value", "")
                            qid = item_uri.split('/')[-1] if '/' in item_uri else item_uri
                            results.append({
                                "qid": qid,
                                "label": b.get("itemLabel", {}).get("value", clean_term),
                                "description": b.get("itemDescription", {}).get("value", "No description provided"),
                                "instance_of": b.get("instanceOfLabel", {}).get("value", "geopolitical entity"),
                                "uri": item_uri,
                                "search_term": clean_term
                            })
                        self.record_success()
                        self.last_success = now_iso
                        self.last_error = None
                    elif res.status_code == 429:
                        self.status = ConnectorStatus.RATE_LIMITED
                        self.last_error = "Wikidata rate limit exceeded (HTTP 429)."
                    else:
                        self.record_failure()
                        self.last_error = f"HTTP {res.status_code} from Wikidata."
            except httpx.TimeoutException:
                self.record_failure()
                self.last_error = "Wikidata request timed out."
            except Exception as e:
                self.record_failure()
                self.last_error = str(e)

        self.records_retrieved += len(results)
        return results

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_iso = datetime.now(timezone.utc).isoformat()
        records: List[EvidenceRecord] = []

        seen_qids = set()
        for item in raw_records:
            qid = item.get("qid", "").strip()
            if not qid and item.get("item"):
                item_val = str(item.get("item", ""))
                qid = item_val.split('/')[-1] if '/' in item_val else item_val
            
            if not qid or qid in seen_qids:
                continue
            seen_qids.add(qid)

            label = item.get("label") or item.get("itemLabel") or "Entity"
            desc = item.get("description") or item.get("itemDescription") or "Structured knowledge base entity"
            instance_of = item.get("instance_of") or item.get("instanceOfLabel") or "entity"
            uri = item.get("uri") or item.get("item") or f"https://www.wikidata.org/entity/{qid}"
            search_term = item.get("search_term", "")

            claim_text = (
                f"Wikidata structured entity knowledge: '{label}' ({desc}). "
                f"Classified as {instance_of}. Query term: '{search_term}'. "
                f"Canonical URI: {uri}."
            )
            content_hash = hashlib.sha256(f"{qid}:{label}:{desc}".encode("utf-8")).hexdigest()

            records.append(EvidenceRecord(
                evidence_id=f"ev_wd_{qid}",
                source_id=self.connector_id,
                source_name="Wikidata Knowledge Base",
                source_url=uri,
                title=f"Wikidata Entity: {label} ({instance_of})",
                claim_text=claim_text,
                evidence_type="entity_knowledge_graph",
                published_at=now_iso,
                retrieved_at=now_iso,
                geography=label if instance_of in ["country", "sovereign state"] else None,
                data_origin="LIVE",
                verification_status=VerificationState.VERIFIED,
                verification_rationale="Extracted from official Wikimedia Wikidata SPARQL graph endpoint with URI provenance.",
                license_id=self.license_type,
                attribution="Source: Wikidata Knowledge Base (CC0 1.0 Public Domain)",
                content_hash=content_hash,
                limitations="Crowdsourced semantic ontology definitions; administrative boundaries reflect Wikidata community consensus."
            ))

        return records
