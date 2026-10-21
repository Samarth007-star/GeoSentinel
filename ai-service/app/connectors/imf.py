import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from .base import BaseConnector
from ..schemas.models import EvidenceRecord, VerificationState
from ..core.config import settings

logger = logging.getLogger(__name__)


class ImfConnector(BaseConnector):
    """
    Connector for the International Monetary Fund (IMF) Data API.
    Provides macroeconomic indicators from World Economic Outlook (WEO),
    International Financial Statistics (IFS), and Balance of Payments (BOP).

    Free public API. No authentication required.
    Terms: https://www.imf.org/external/terms.htm
    License: IMF Copyright — free for non-commercial research use with attribution.
    Rate limit: Undocumented; connector uses 1-second inter-request delay as courtesy.
    """

    # Key WEO indicators for geopolitical/economic analysis
    WEO_INDICATORS = {
        "NGDP_RPCH": "Real GDP Growth (%)",
        "PCPIPCH": "Inflation, avg. consumer prices (%)",
        "BCA_NGDPD": "Current Account Balance (% GDP)",
        "GGXWDG_NGDP": "General Gov't Gross Debt (% GDP)",
        "LUR": "Unemployment Rate (%)",
    }

    def __init__(self):
        super().__init__(
            connector_id="CONN_IMF",
            category="Economic & Financial",
            provider_name="International Monetary Fund Data API",
            terms_url="https://www.imf.org/external/terms.htm",
            license_type="IMF Copyright (Research Use Permitted with Attribution)",
            timeout=settings.CONNECTOR_TIMEOUT_SECONDS
        )
        self.base_url = settings.IMF_BASE_URL.rstrip("/")
        self.user_agent = "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)"

    async def check_health(self) -> Dict[str, Any]:
        """Check IMF API health by fetching dataflow catalogue."""
        try:
            headers = {"User-Agent": self.user_agent, "Accept": "application/json"}
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                # Use the Dataflow endpoint to verify API is responsive
                res = await client.get(
                    f"{self.base_url}/Dataflow",
                    headers=headers
                )
                if res.status_code == 200:
                    self.record_success()
                    return {
                        "status": "HEALTHY",
                        "latency_ms": res.elapsed.total_seconds() * 1000
                    }
                self.record_failure()
                return {"status": "DEGRADED", "http_code": res.status_code}
        except Exception as e:
            self.record_failure()
            return {"status": "UNHEALTHY", "error": str(e)}

    async def fetch(self, target_entities: List[str], target_geographies: List[str]) -> List[Dict[str, Any]]:
        """
        Fetch IMF WEO economic indicators for target countries.
        Uses the IMF JSON RESTful API (SDMX-compliant).
        """
        if not self.is_available():
            return []

        results = []
        # Map ISO-3 country codes; IMF uses ISO-2 in some datasets but ISO-3 in WEO
        geo_codes = [g.upper() for g in target_geographies if g and len(g) <= 3]
        if not geo_codes:
            geo_codes = ["IND"]  # Default to India per project context

        # Fetch from WEO (World Economic Outlook) dataset
        for indicator_code, indicator_name in self.WEO_INDICATORS.items():
            for geo in geo_codes[:3]:  # Limit to 3 countries to respect rate limits
                try:
                    # IMF CompactData endpoint: /CompactData/{database}/{frequency}.{country}.{indicator}
                    url = f"{self.base_url}/CompactData/WEO/{geo}.{indicator_code}"
                    headers = {
                        "User-Agent": self.user_agent,
                        "Accept": "application/json"
                    }
                    async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                        res = await client.get(url, headers=headers)
                        if res.status_code == 200:
                            data = res.json()
                            # Navigate SDMX-JSON structure
                            series_data = self._extract_series(data, indicator_code, indicator_name, geo)
                            results.extend(series_data)
                            self.record_success()
                        else:
                            logger.warning(f"IMF API returned {res.status_code} for {geo}/{indicator_code}")
                except httpx.TimeoutException:
                    logger.warning(f"IMF request timed out for {geo}/{indicator_code}")
                except Exception as e:
                    logger.error(f"IMF fetch error for {geo}/{indicator_code}: {e}")

            # Brief rate-limit courtesy delay between indicator batches
            import asyncio
            await asyncio.sleep(0.5)

        if results:
            self.record_success()
            logger.info(f"IMF: Retrieved {len(results)} indicator observations")
        return results

    def _extract_series(
        self, data: dict, indicator_code: str, indicator_name: str, geo: str
    ) -> List[Dict[str, Any]]:
        """Extract time-series observations from IMF SDMX-JSON response."""
        records = []
        try:
            # IMF CompactData structure varies; handle common patterns
            structure = data.get("CompactData", data)
            dataset = structure.get("DataSet", {})
            series = dataset.get("Series", {})

            # Series can be a dict (single) or list (multiple)
            if isinstance(series, dict):
                series = [series]
            elif not isinstance(series, list):
                return records

            for s in series:
                obs = s.get("Obs", [])
                if isinstance(obs, dict):
                    obs = [obs]
                for ob in obs:
                    period = ob.get("@TIME_PERIOD", "")
                    value = ob.get("@OBS_VALUE", "")
                    if period and value:
                        records.append({
                            "indicator_code": indicator_code,
                            "indicator_name": indicator_name,
                            "country_code": geo,
                            "period": period,
                            "value": value,
                            "dataset": "WEO",
                            "unit": s.get("@UNIT_MEASURE", "Percent" if "%" in indicator_name else "Index"),
                        })
        except Exception as e:
            logger.debug(f"IMF series extraction error: {e}")

        # Return only most recent 3 observations per indicator
        records.sort(key=lambda x: x.get("period", ""), reverse=True)
        return records[:3]

    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        now_iso = datetime.now(timezone.utc).isoformat()
        evidence_list = []

        for r in raw_records:
            raw_str = json.dumps(r, sort_keys=True)
            content_hash = self.compute_content_hash(raw_str)
            ev_id = f"ev_imf_{content_hash[:12]}"

            indicator_name = r.get("indicator_name", "Economic Indicator")
            country = r.get("country_code", "WLD")
            period = r.get("period", "Unknown")
            value = r.get("value", "N/A")
            unit = r.get("unit", "")
            dataset = r.get("dataset", "WEO")

            claim = (
                f"IMF {dataset} reports {indicator_name} for {country} "
                f"in period {period}: {value} {unit}."
            )

            evidence_list.append(EvidenceRecord(
                evidence_id=ev_id,
                source_id=self.connector_id,
                source_name=self.provider_name,
                source_url=f"https://www.imf.org/external/datamapper/{r.get('indicator_code', '')}@WEO",
                title=f"IMF {dataset}: {indicator_name} — {country} ({period})",
                claim_text=claim,
                evidence_type="economic_indicator",
                published_at=f"{period}-01-01T00:00:00+00:00" if len(period) == 4 else now_iso,
                retrieved_at=now_iso,
                geography=country,
                verification_status=VerificationState.VERIFIED,
                verification_rationale=(
                    f"Official IMF {dataset} publication. Data compiled from national statistical "
                    f"agencies and IMF staff estimates with documented methodology."
                ),
                license_id=self.license_type,
                attribution=f"Source: International Monetary Fund — {dataset} Database",
                content_hash=content_hash,
                limitations=(
                    "IMF WEO projections are staff estimates subject to revision. "
                    "Historical data may be retroactively adjusted. "
                    "Country coverage and timeliness vary by indicator."
                )
            ))

        return evidence_list
