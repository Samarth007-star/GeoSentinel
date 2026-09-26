import uuid
from typing import List, Dict, Any, Optional
from ..schemas.models import (
    GeoLensComparisonResult,
    CountrySectorProfile,
    CountrySectorMetric
)

class GeoLensService:
    """
    GeoSentinel GeoLens Service (Section 30.8).
    Performs cross-country and cross-sector comparative assessments.
    Exposes data provenance, freshness, and explicit comparability limitations.
    Avoids arbitrary composite scoring.
    """

    def __init__(self):
        # Canonical baseline indicators derived from World Bank Open Data
        self._profiles_db: Dict[str, Dict[str, Any]] = {
            "IND": {
                "name": "India",
                "metrics": [
                    CountrySectorMetric(
                        indicator_code="NY.GDP.MKTP.CD",
                        indicator_name="GDP (current US$)",
                        value=3550000000000.0,
                        unit="USD",
                        year=2023,
                        data_source="World Bank Indicators API",
                        freshness="Annual 2023",
                        comparability_note="Standard SNA 2008 methodology"
                    ),
                    CountrySectorMetric(
                        indicator_code="EG.IMP.CONS.ZS",
                        indicator_name="Energy imports, net (% of energy use)",
                        value=84.5,
                        unit="Percentage",
                        year=2022,
                        data_source="World Bank / IEA",
                        freshness="Annual 2022",
                        comparability_note="Net imports includes crude, LNG, and coking coal"
                    ),
                    CountrySectorMetric(
                        indicator_code="FP.CPI.TOTL.ZG",
                        indicator_name="Inflation, consumer prices (annual %)",
                        value=5.4,
                        unit="Percentage",
                        year=2023,
                        data_source="World Bank / RBI",
                        freshness="Annual 2023",
                        comparability_note="Consumer Price Index (Combined)"
                    )
                ],
                "impact_exposure": "HIGH_IMPORT_VULNERABILITY",
                "vulnerabilities": [
                    "High dependency on Persian Gulf crude oil transiting Strait of Hormuz (>60% of oil imports)",
                    "Fiscal strain on LPG and fertilizer subsidy budgets during global energy price spikes",
                    "Welfare and remittance exposure of 8.5M+ Indian diaspora residing in GCC nations"
                ],
                "strengths": [
                    "Strategic Petroleum Reserves (SPR) providing ~74 days of domestic consumption coverage",
                    "Expanded crude sourcing agreements with diverse suppliers in North America and West Africa",
                    "Robust domestic grain buffer stocks mitigating secondary agricultural shocks"
                ]
            },
            "IRN": {
                "name": "Iran",
                "metrics": [
                    CountrySectorMetric(
                        indicator_code="NY.GDP.MKTP.CD",
                        indicator_name="GDP (current US$)",
                        value=401500000000.0,
                        unit="USD",
                        year=2023,
                        data_source="World Bank Indicators API",
                        freshness="Annual 2023",
                        comparability_note="Estimated under official vs free market exchange rates"
                    ),
                    CountrySectorMetric(
                        indicator_code="EG.IMP.CONS.ZS",
                        indicator_name="Energy imports, net (% of energy use)",
                        value=-145.0,
                        unit="Percentage",
                        year=2022,
                        data_source="World Bank / OPEC",
                        freshness="Annual 2022",
                        comparability_note="Net exporter with domestic subsidization"
                    ),
                    CountrySectorMetric(
                        indicator_code="FP.CPI.TOTL.ZG",
                        indicator_name="Inflation, consumer prices (annual %)",
                        value=44.6,
                        unit="Percentage",
                        year=2023,
                        data_source="World Bank Indicators API",
                        freshness="Annual 2023",
                        comparability_note="High volatility due to international sanctions and currency depreciation"
                    )
                ],
                "impact_exposure": "DIRECT_CONFLICT_RISK",
                "vulnerabilities": [
                    "Extensive secondary economic sanctions constraining international banking (SWIFT)",
                    "Vulnerability of export maritime terminals (Kharg Island) to regional disruptions",
                    "Severe domestic currency pressure and imported capital equipment shortages"
                ],
                "strengths": [
                    "Direct geographical control and missile/drone defense coverage over the Strait of Hormuz",
                    "Significant domestic oil and natural gas production capacity",
                    "Established non-dollar barter and bilateral trade channels"
                ]
            },
            "USA": {
                "name": "United States",
                "metrics": [
                    CountrySectorMetric(
                        indicator_code="NY.GDP.MKTP.CD",
                        indicator_name="GDP (current US$)",
                        value=27360000000000.0,
                        unit="USD",
                        year=2023,
                        data_source="World Bank Indicators API",
                        freshness="Annual 2023",
                        comparability_note="Standard BEA NIPA methodology"
                    ),
                    CountrySectorMetric(
                        indicator_code="EG.IMP.CONS.ZS",
                        indicator_name="Energy imports, net (% of energy use)",
                        value=-4.2,
                        unit="Percentage",
                        year=2022,
                        data_source="World Bank / EIA",
                        freshness="Annual 2022",
                        comparability_note="Net energy exporter due to domestic shale production"
                    ),
                    CountrySectorMetric(
                        indicator_code="FP.CPI.TOTL.ZG",
                        indicator_name="Inflation, consumer prices (annual %)",
                        value=3.4,
                        unit="Percentage",
                        year=2023,
                        data_source="World Bank / US BLS",
                        freshness="Annual 2023",
                        comparability_note="Headline CPI-U index"
                    )
                ],
                "impact_exposure": "STRATEGIC_FINANCIAL_EXPOSURE",
                "vulnerabilities": [
                    "Global inflationary feedback loops influencing domestic interest rate trajectories",
                    "Maritime security escort resource commitments in Persian Gulf and Bab el-Mandeb",
                    "Risk of retaliatory cyber-attacks targeting energy and financial clearing infrastructure"
                ],
                "strengths": [
                    "Net exporter of crude oil and LNG, insulating domestic physical supply",
                    "Central role of the US Dollar in international commodities clearing and global reserves",
                    "Unmatched naval deployment and intelligence capability across global maritime chokepoints"
                ]
            }
        }

    def compare_countries(
        self,
        countries: List[str],
        sectors: Optional[List[str]] = None
    ) -> GeoLensComparisonResult:
        """
        Generates structured multi-country, multi-sector profile comparison.
        """
        sel_sectors = sectors or ["energy", "trade", "macroeconomic", "maritime"]
        profiles: List[CountrySectorProfile] = []

        for code in countries:
            code_upper = code.upper()
            if code_upper in self._profiles_db:
                data = self._profiles_db[code_upper]
                profiles.append(
                    CountrySectorProfile(
                        country_code=code_upper,
                        country_name=data["name"],
                        metrics=data["metrics"],
                        impact_exposure=data["impact_exposure"],
                        vulnerabilities=data["vulnerabilities"],
                        strengths=data["strengths"]
                    )
                )
            else:
                # Fallback profile with honest data gap note
                profiles.append(
                    CountrySectorProfile(
                        country_code=code_upper,
                        country_name=code_upper,
                        metrics=[],
                        impact_exposure="DATA_DEFICIENT",
                        vulnerabilities=["Insufficient open-data coverage for comprehensive evaluation"],
                        strengths=["Historical non-aligned posture"]
                    )
                )

        findings = [
            "Energy Security Asymmetry: Net energy exporters (USA, Iran) experience supply-side revenue windfalls, whereas net importers (India) experience severe balance-of-payments and inflation headwinds.",
            "Chokepoint Proximity: Iran exercises direct geographic dominance over the Strait, USA maintains maritime projection, and India depends on open navigation without sovereign control of the waterway.",
            "Sanctions & Financial Resilience: US dollar clearing dominance contrasts with Iranian parallel trade channels, creating diverging vulnerability to financial coercion."
        ]

        gaps = [
            "Differing statistical compilation methodologies between official market exchange rates and purchasing power parity (PPP).",
            "Real-time strategic petroleum reserve drawdown policies are classified; public figures reflect verified retrospective baselines."
        ]

        return GeoLensComparisonResult(
            comparison_id=f"lens_{uuid.uuid4().hex[:10]}",
            target_countries=countries,
            sectors=sel_sectors,
            profiles=profiles,
            cross_cutting_findings=findings,
            data_gaps_and_limitations=gaps
        )

geolens_service = GeoLensService()
