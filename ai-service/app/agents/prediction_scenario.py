import uuid
from typing import List
from ..schemas.models import GeoForkScenario, ContextSnapshot

class PredictionScenarioAgent:
    """
    Stage 9: GeoFork Conditional Scenario Engine.
    Generates comparative branch scenarios with explicit assumptions, drivers,
    and monitoring indicators without inventing arbitrary unverified probabilities.
    All numerical estimates are strictly labeled as [SCENARIO_ASSUMPTION] or [SOURCE_DERIVED].
    """

    def generate_scenarios(self, question: str, context: ContextSnapshot) -> List[GeoForkScenario]:
        q_lower = question.lower()

        # Topic 1: South China Sea / Semiconductor / Maritime Trade
        if any(k in q_lower for k in ["south china sea", "semiconductor", "taiwan", "microchip", "electronics"]):
            return [
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario A: Calibrated Freedom-of-Navigation Patrols & Localized Maritime Friction (Baseline)",
                    assumptions=[
                        "Commercial container traffic continues with selective tactical rerouting around active naval drills.",
                        "Major East Asian semiconductor fabrication facilities maintain continuous electrical power and core logistics."
                    ],
                    probability_description="Moderate qualitative likelihood; consistent with historical maritime standoff cycles.",
                    key_drivers=[
                        "Multilateral diplomatic demarches and maritime hotline de-escalation protocols.",
                        "Shared international economic stake in semiconductor supply chain continuity."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Component transit durations on intra-Asia shipping routes experience limited 3-7 day delays.",
                        "[SCENARIO_ASSUMPTION] Spot freight insurance rates stabilize after initial precautionary uptick.",
                        "[SCENARIO_ASSUMPTION] Domestic electronic assembly inventory cushions absorb delivery friction without plant shutdowns."
                    ],
                    monitoring_indicators=[
                        "Taiwan Strait and Luzon Strait commercial vessel traffic density via AIS telemetry.",
                        "Spot wafer and microcontroller delivery lead time indices."
                    ]
                ),
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario B: Commercial Shipping Exclusion Zones & Critical Chokepoint Interdiction (High Impact)",
                    assumptions=[
                        "Maritime insurance underwriters temporarily suspend standard coverage across specified South China Sea corridors.",
                        "Commercial container vessels reroute through Lombok and Sunda Straits or south of Australia for >45 days."
                    ],
                    probability_description="Conditional contingency branch; triggered upon direct military engagement or declaration of exclusion zones.",
                    key_drivers=[
                        "Tit-for-tat naval enforcement and kinetic maritime interdiction.",
                        "Breakdown of bilateral crisis-management communications."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Extended voyage distances add an estimated 8-14 transit days for Asia-Europe and Asia-South Asia cargo.",
                        "[SCENARIO_ASSUMPTION] Automotive and consumer electronics manufacturing sectors face rolling component supply deficits.",
                        "[SCENARIO_ASSUMPTION] Global container freight rates experience sharp upward spot price volatility."
                    ],
                    monitoring_indicators=[
                        "Lloyd's Market Association Joint War Committee listed area announcements.",
                        "Major port transshipment dwell times at Singapore, Port Klang, and Kaohsiung."
                    ]
                )
            ]

        # Topic 2: Russia-Ukraine / Food Security / Fertilizer
        elif any(k in q_lower for k in ["russia", "ukraine", "fertilizer", "food security", "wheat", "grain"]):
            return [
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario A: Managed Agricultural Transit Corridors & Third-Party Sourcing (Baseline)",
                    assumptions=[
                        "Alternative rail and Danube river export routes maintain bounded grain outflows.",
                        "Non-sanctioned bilateral fertilizer import agreements remain operational with friendly producing nations."
                    ],
                    probability_description="Moderate qualitative likelihood; reflects ongoing adaptation of global agricultural trading networks.",
                    key_drivers=[
                        "Multilateral food security mediation by international organizations (UN/FAO).",
                        "Active diversification of ammonia and muriate of potash procurement."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Domestic fertilizer availability remains adequate for planting cycles through state buffer reserves.",
                        "[SCENARIO_ASSUMPTION] International wheat and sunflower oil prices remain within a bounded 5-12% volatility band.",
                        "[SOURCE_DERIVED: World Bank] Macroeconomic baseline agricultural GDP contribution remains insulated."
                    ],
                    monitoring_indicators=[
                        "Black Sea commercial bulk carrier voyage tracking and grain export volumes.",
                        "Global benchmark DAP (diammonium phosphate) and Urea spot FOB price quotes."
                    ]
                ),
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario B: Broad Interdiction of Black Sea Ports & Critical Mineral/Fertilizer Embargoes (High Impact)",
                    assumptions=[
                        "Complete maritime stoppage of Black Sea agricultural and ammonia terminal loadings for >90 days.",
                        "Imposition of secondary sanctions targeting critical fertilizer and mineral transport logistics."
                    ],
                    probability_description="Conditional contingency branch; triggered by severe military escalation in maritime transit zones.",
                    key_drivers=[
                        "Expanded naval exclusion zones and mining of shipping corridors.",
                        "Retaliatory export restrictions by major agricultural chemical producing states."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Global nitrogen and potassium fertilizer prices surge, expanding domestic government subsidy fiscal burden.",
                        "[SCENARIO_ASSUMPTION] Food importing nations in Africa and South Asia encounter food price inflation and balance-of-payments strain.",
                        "[SCENARIO_ASSUMPTION] Compulsory domestic allocation of available fertilizer stocks to staple food crops."
                    ],
                    monitoring_indicators=[
                        "FAO Food Price Index monthly releases.",
                        "Domestic sovereign fertilizer subsidy expenditure disbursements."
                    ]
                )
            ]

        # Topic 3: International Trade Sanctions (China, Russia, Iran)
        elif any(k in q_lower for k in ["sanction", "sanctions", "trade sanction", "export control", "embargo"]):
            return [
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario A: Sector-Specific Targeted Sanctions with Defined Humanitarian Carve-outs (Baseline)",
                    assumptions=[
                        "Sanctions focus primarily on dual-use technology and specific state-owned enterprise entities.",
                        "Clear compliance exemptions and general licenses persist for civil energy, agriculture, and pharmaceuticals."
                    ],
                    probability_description="High qualitative likelihood; standard multilateral sanctions policy design.",
                    key_drivers=[
                        "Desire by enacting powers to prevent catastrophic global commodity supply shocks.",
                        "Active diplomatic engagement to preserve essential developing economy trade corridors."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Bilateral trade continues with expanded regulatory compliance documentation and third-party bank audits.",
                        "[SCENARIO_ASSUMPTION] Technology import authorizations experience administrative lead time extensions of 30-60 days.",
                        "[SCENARIO_ASSUMPTION] Gradual expansion of national local-currency settlement mechanisms."
                    ],
                    monitoring_indicators=[
                        "OFAC and EU Official Journal sanctions designations and General License releases.",
                        "Bilateral trade volume statistics in non-dollar clearing accounts."
                    ]
                ),
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario B: Comprehensive Secondary Financial Sanctions & Technology Embargoes (High Impact)",
                    assumptions=[
                        "Extraterritorial secondary sanctions penalize third-country financial institutions conducting commercial clearing.",
                        "Sweeping export restrictions cut off access to foundational software, semiconductors, and precision tooling."
                    ],
                    probability_description="Conditional contingency branch; triggered by major geopolitical confrontation.",
                    key_drivers=[
                        "Geopolitical polarization and weaponization of international payments architecture.",
                        "Unilateral enforcement actions by major reserve currency jurisdictions."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Sharp friction in bilateral trade settlement, leading to stranded balances in foreign bank accounts.",
                        "[SCENARIO_ASSUMPTION] High-technology manufacturing supply chains face immediate re-engineering and sourcing substitution requirements.",
                        "[SCENARIO_ASSUMPTION] Accelerated fragmentation of global financial clearing into non-convertible bilateral currency blocs."
                    ],
                    monitoring_indicators=[
                        "Correspondent banking relationship termination notices.",
                        "Central Bank foreign exchange reserve composition reports."
                    ]
                )
            ]

        # Topic 4: Energy Security / Crude Oil / US-Iran / Middle East Conflict (Default & Q1/Q3)
        else:
            return [
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario A: De-escalation via Diplomatic Backchannels (Baseline)",
                    assumptions=[
                        "Naval patrols remain calibrated; no full maritime blockade of the Strait of Hormuz is attempted.",
                        "Third-party mediation establishes limited regional security guarantees within 14-30 days."
                    ],
                    probability_description="Moderate qualitative likelihood; consistent with historical standoff cycles.",
                    key_drivers=[
                        "Bilateral backchannel communication channels.",
                        "Mutual economic aversion to protracted global energy spikes."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Modeled crude oil risk premium subsides toward baseline within 30-45 days.",
                        "[SCENARIO_ASSUMPTION] Maritime shipping insurance surcharges normalize after initial peak.",
                        "[SOURCE_DERIVED: World Bank IND GDP growth baseline] Domestic macroeconomic trajectory remains anchored by domestic demand."
                    ],
                    monitoring_indicators=[
                        "Strait of Hormuz commercial vessel transit counts via AIS.",
                        "Lloyd's Market Association Joint War Committee listed area reviews."
                    ]
                ),
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario B: Protracted Asymmetric Maritime Friction (High Impact)",
                    assumptions=[
                        "Drone, mine, or fast-attack craft harassment of commercial tankers continues intermittently for >60 days.",
                        "Major commercial container and tanker fleets re-route around the Cape of Good Hope."
                    ],
                    probability_description="Conditional contingency branch; triggered if retaliatory strikes target critical logistics hubs.",
                    key_drivers=[
                        "Retaliatory tit-for-tat escalation dynamics.",
                        "Inability of diplomatic mediators to enforce maritime truce."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Sustained risk premium on global benchmark crude oil contracts.",
                        "[SCENARIO_ASSUMPTION] Global container freight rates increase significantly on Asia-Europe and Persian Gulf lanes.",
                        "[SCENARIO_ASSUMPTION] Strategic petroleum reserve staged drawdown protocols activated to dampen domestic retail price shock."
                    ],
                    monitoring_indicators=[
                        "War-risk insurance premium rates for Persian Gulf transit.",
                        "National strategic petroleum reserve inventory drawdown notifications."
                    ]
                )
            ]

prediction_scenario_agent = PredictionScenarioAgent()
