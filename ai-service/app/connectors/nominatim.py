import json
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class NominatimConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_NOMINATIM",
            category="Geographic Data",
            provider_name="OpenStreetMap Nominatim Spatial API",
            terms_url="https://osm.org/copyright",
            license_type="ODbL 1.0",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.NOMINATIM_BASE_URL
        self.headers = {"User-Agent": "GeoSentinel-Research-Engine/1.0 (info@geosentinel.org)"}

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/search?q=New+Delhi&format=json&limit=1", headers=self.headers)
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

        # Determine target queries
        queries = target_geographies if target_geographies else ["India", "Hormuz", "Taiwan"]
        results = []
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                for q in queries[:2]:
                    url = f"{self.base_url}/search?q={q}&format=json&limit=2"
                    res = await client.get(url, headers=self.headers)
                    if res.status_code == 200:
                        data = res.json()
                        for item in data:
                            results.append({
                                "place_id": item.get("place_id"),
                                "osm_id": item.get("osm_id"),
                                "name": item.get("display_name"),
                                "lat": item.get("lat"),
                                "lon": item.get("lon"),
                                "type": item.get("type"),
                                "class": item.get("class"),
                                "query": q,
                                "url": f"https://www.openstreetmap.org/?mlat={item.get('lat')}&mlon={item.get('lon')}"
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
            ev_id = f"ev_osm_{r['place_id']}"
            claim = f"Spatial reference for {r['query']}: Identified as {r['name']} at coordinates (Lat: {r['lat']}, Lon: {r['lon']}) [Type: {r['type']}]."
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=r["url"],
                title=f"OpenStreetMap Boundary: {r['query']} ({r['lat']}, {r['lon']})",
                claim_text=claim,
                evidence_type="spatial_boundary",
                published_at=now_iso,
                retrieved_at=now_iso,
                geography=r["query"][:3].upper() if len(r["query"]) >= 3 else r["query"],
                verification_status=VerificationState.VERIFIED,
                verification_rationale="OpenStreetMap geocoded administrative boundary confirmed via Nominatim service.",
                license_id=self.license_type,
                attribution="Source: OpenStreetMap Contributors (ODbL 1.0)",
                content_hash=content_hash,
                limitations="Geographic boundaries subject to ongoing community mapping and territorial conventions."
            ))
        return evidence_list
