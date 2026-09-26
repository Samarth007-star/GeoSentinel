import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from ..schemas.models import GeoMemoryMatch, GeoMemoryResult

class GeoMemoryService:
    """
    GeoSentinel GeoMemory Service (Section 30.7).
    Retrieves time-aware historical analog cases and contextual precedents.
    Explicitly articulates key parallels and structural limits of analogy.
    """

    def __init__(self):
        self._historical_cases: List[Dict[str, Any]] = [
            {
                "case_id": "hist_case_1984_tanker_war",
                "event_title": "1984 Tanker War (Persian Gulf Shipping Disruptions)",
                "event_date": "1984-05-13",
                "geographies": ["IRN", "IRQ", "KWT", "USA"],
                "keywords": ["iran", "persian gulf", "strait of hormuz", "shipping", "oil", "tanker"],
                "key_parallels": [
                    "Targeting of commercial commercial maritime shipping in the Strait of Hormuz",
                    "Global oil price volatility and spike in Lloyd's war risk premiums",
                    "International naval escort missions deployed to protect maritime lanes"
                ],
                "limits_of_analogy": (
                    "Modern maritime trade features heavily automated AIS tracking and different global supply routes; "
                    "India's current hydrocarbon import dependency and domestic strategic reserves (SPR) are "
                    "significantly more diversified than in 1984."
                ),
                "source_references": [
                    "U.S. Naval Institute Historical Archives (1989)",
                    "OPEC Annual Statistical Bulletin Historical Series"
                ]
            },
            {
                "case_id": "hist_case_2019_drone_tensions",
                "event_title": "2019 Gulf of Oman Maritime Incidents & Drone Downing",
                "event_date": "2019-06-20",
                "geographies": ["IRN", "USA", "ARE", "OMN"],
                "keywords": ["iran", "us", "drone", "escalation", "sanctions", "strait of hormuz"],
                "key_parallels": [
                    "Direct confrontation between US forces and Iranian assets in the Strait region",
                    "Surge in regional diplomatic mediation and rerouting of civil aviation routes"
                ],
                "limits_of_analogy": (
                    "The 2019 incident was localized without prolonged missile strikes against regional infrastructure; "
                    "diplomatic backchannels prevented regional kinetic expansion."
                ),
                "source_references": [
                    "UN Security Council Briefing S/PV.8561 (2019)",
                    "USGS & ICAO International Civil Aviation Conflict Zone Warnings"
                ]
            },
            {
                "case_id": "hist_case_2022_ukraine_commodity_shock",
                "event_title": "2022 Black Sea Conflict & Fertilizer/Grain Supply Chain Disruption",
                "event_date": "2022-02-24",
                "geographies": ["UKR", "RUS", "EGY", "IND"],
                "keywords": ["commodity", "supply chain", "fertilizer", "sanctions", "food security"],
                "key_parallels": [
                    "Immediate disruption of critical chokepoints and maritime insurance withdrawal",
                    "Secondary inflationary impact on importing nations, specifically fertilizer and fuel"
                ],
                "limits_of_analogy": (
                    "Black Sea maritime geography is semi-enclosed with distinct naval blockade mechanisms, "
                    "whereas Strait of Hormuz is an international transit strait governed by UNCLOS transit passage rules."
                ),
                "source_references": [
                    "World Bank Commodity Markets Outlook (2022)",
                    "FAO Food Price Index Special Reports"
                ]
            }
        ]

    def find_analogs(
        self,
        query: str,
        geographies: Optional[List[str]] = None,
        temporal_cutoff: Optional[str] = None
    ) -> GeoMemoryResult:
        """
        Finds historical precedents relevant to query text and target geographies.
        Enforces temporal cutoff to prevent anachronistic context.
        """
        cutoff = temporal_cutoff or datetime.now(timezone.utc).isoformat()
        query_lower = query.lower()
        query_words = set(re.findall(r"\w+", query_lower))

        matches: List[GeoMemoryMatch] = []

        for case in self._historical_cases:
            # Check cutoff: event_date must be strictly before cutoff
            if case["event_date"] > cutoff[:10]:
                continue

            # Calculate keyword overlap score
            case_words = set(case["keywords"])
            overlap = len(query_words.intersection(case_words))
            
            # Geography bonus
            geo_overlap = 0
            if geographies:
                geo_overlap = len(set(geographies).intersection(set(case["geographies"])))

            score = min(0.95, round(0.40 + (overlap * 0.12) + (geo_overlap * 0.15), 2))

            if overlap > 0 or geo_overlap > 0:
                matches.append(
                    GeoMemoryMatch(
                        case_id=case["case_id"],
                        event_title=case["event_title"],
                        event_date=case["event_date"],
                        geographies=case["geographies"],
                        similarity_score=score,
                        key_parallels=case["key_parallels"],
                        limits_of_analogy=case["limits_of_analogy"],
                        source_references=case["source_references"]
                    )
                )

        matches.sort(key=lambda x: x.similarity_score, reverse=True)

        return GeoMemoryResult(
            query_context=query,
            temporal_cutoff=cutoff,
            retrieved_cases=matches[:3],
            memory_limitations=(
                "Historical precedents provide qualitative contextual grounding, not deterministic predictions. "
                "Structural differences in current technology, geopolitical alliances, and domestic energy reserves "
                "must be factored into any forward-looking assessment."
            )
        )

geomemory_service = GeoMemoryService()
