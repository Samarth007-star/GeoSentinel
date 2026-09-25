import json
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

class WorldBankConnector(BaseConnector):
    def __init__(self):
        super().__init__(
            connector_id="CONN_WORLDBANK",
            category="Economic & Financial",
            provider_name="World Bank Indicators API",
            terms_url="https://data.worldbank.org/summary-terms-of-use",
            license_type="CC-BY 4.0",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.WORLD_BANK_BASE_URL
        # Core standard indicators: GDP, Inflation, Trade % of GDP, Energy Imports
        self.key_indicators = {
            "NY.GDP.MKTP.KD.ZG": "GDP Growth (annual %)",
            "FP.CPI.TOTL.ZG": "Inflation, consumer prices (annual %)",
            "NE.TRD.GNFS.ZS": "Trade (% of GDP)",
            "EG.IMP.CONS.ZS": "Energy imports, net (% of energy use)"
        }

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/country/IND/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1")
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

        geos = [g.upper() for g in target_geographies if len(g) in [2, 3]]
        if not geos:
            geos = ["IND", "WLD"]

        results = []
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                for geo in geos[:3]:  # Bound requests
                    for ind_code in list(self.key_indicators.keys())[:2]:
                        url = f"{self.base_url}/country/{geo}/indicator/{ind_code}?format=json&per_page=3"
                        res = await client.get(url)
                        if res.status_code == 200:
                            data = res.json()
                            if len(data) > 1 and isinstance(data[1], list):
                                for item in data[1]:
                                    if item.get("value") is not None:
                                        results.append({
                                            "geo": geo,
                                            "country_name": item.get("countryiso3code", geo),
                                            "indicator_code": ind_code,
                                            "indicator_name": item.get("indicator", {}).get("value", self.key_indicators[ind_code]),
                                            "year": item.get("date"),
                                            "value": item.get("value"),
                                            "url": url
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
            ev_id = f"ev_wb_{r['geo']}_{r['indicator_code'].replace('.', '_')}_{r['year']}"
            claim = f"{r['indicator_name']} for {r['country_name']} was recorded at {r['value']:.2f} in {r['year']}."
            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=r["url"],
                title=f"World Bank: {r['indicator_name']} ({r['country_name']} - {r['year']})",
                claim_text=claim,
                evidence_type="economic_indicator",
                published_at=f"{r['year']}-12-31T00:00:00Z",
                retrieved_at=now_iso,
                geography=r["geo"],
                verification_status=VerificationState.VERIFIED,  # Official multilateral dataset
                verification_rationale="Retrieved from official World Bank Open Data API with deterministic schema validation.",
                license_id=self.license_type,
                attribution="Source: World Bank Open Data API (CC-BY 4.0)",
                content_hash=content_hash,
                limitations="Annual macroeconomic indicators carry historical publishing lag."
            ))
        return evidence_list
