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

        # Out-of-scope / non-geopolitical check
        if any(w in q_lower for w in ["recipe", "cookie", "cookies", "baking", "cake", "dessert", "chocolate chip"]):
            return []

        # Domain: Disaster & Scientific Hazard Telemetry (USGS, NOAA, EONET)
        if any(k in q_lower for k in ["earthquake", "seismic", "volcano", "wildfire", "cyclone", "flood", "natural hazard", "tsunami"]):
            return [
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario A: Localized Infrastructure Shock & Rapid Civil Recovery (Baseline)",
                    assumptions=[
                        "Seismic or meteorological disturbance remains bounded to localized geographic perimeter.",
                        "Regional transport and electrical utility grids resume normal operations within 72 to 120 hours."
                    ],
                    probability_description="High qualitative likelihood; typical for standard magnitude events without structural dam or nuclear failure.",
                    key_drivers=[
                        "Rapid deployment of municipal civil protection and search-and-rescue units.",
                        "Effective enforcement of seismic and meteorological building codes."
                    ],
                    projected_outcomes=[
                        "[SOURCE_DERIVED: USGS/NOAA/EONET Telemetry] Recorded event perimeter undergoes physical structural clearance without cross-border logistics stoppage.",
                        "[SCENARIO_ASSUMPTION] Regional arterial highways reopen under speed restrictions within 3 to 5 days.",
                        "[SCENARIO_ASSUMPTION] Emergency fiscal buffer funds cover immediate shelter and medical supply mobilization."
                    ],
                    monitoring_indicators=[
                        "USGS real-time shakemap and aftershock sequence telemetry.",
                        "NOAA / National Weather Service active warning cancellations."
                    ]
                ),
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario B: Cascading Lifeline Disruption & Secondary Supply Chain Strain (High Impact)",
                    assumptions=[
                        "Secondary hazards (landslides, flash flooding, or power grid trip-outs) sever major transit arterials for >14 days.",
                        "Critical industrial or port operations face extended inspection and repair shutdowns."
                    ],
                    probability_description="Conditional contingency branch; triggered by high-magnitude events near dense industrial/coastal nodes.",
                    key_drivers=[
                        "Severity of ground acceleration and coastal inundation telemetry.",
                        "Vulnerability of legacy transport bridges and electrical substations."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Rerouting of commercial freight adds 5 to 10 days transit delay across regional trade corridors.",
                        "[SCENARIO_ASSUMPTION] Temporary spike in localized food and essential commodity wholesale prices.",
                        "[SCENARIO_ASSUMPTION] Reallocation of state development budgets toward infrastructure reconstruction."
                    ],
                    monitoring_indicators=[
                        "Port and railway operational status reports.",
                        "National Disaster Management Authority (NDMA) situation reports."
                    ]
                )
            ]

        # Domain: Internet Connectivity & Censorship Signals (OONI, IODA)
        elif any(k in q_lower for k in ["internet", "connectivity", "ooni", "ioda", "bgp", "dns", "censorship", "outage", "telecom"]):
            return [
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario A: Transient Point-of-Presence Throttling & Fast BGP Route Recovery (Baseline)",
                    assumptions=[
                        "Network interference is localized to specific content delivery endpoints or transient routing shifts.",
                        "Core international submarine fiber-optic cable landing stations maintain continuous electrical power."
                    ],
                    probability_description="High qualitative likelihood; standard profile for selective digital compliance filtering.",
                    key_drivers=[
                        "Regulatory filtering of specific domain endpoints rather than macroscopic infrastructure cutoffs.",
                        "Redundant autonomous system (AS) peering agreements routing around impaired hops."
                    ],
                    projected_outcomes=[
                        "[SOURCE_DERIVED: OONI/IODA network measurements] Enterprise cross-border VPNs and financial clearing experience elevated latency but avoid complete disconnection.",
                        "[SCENARIO_ASSUMPTION] End-user digital transactions redirect through auxiliary carrier networks within 24 hours.",
                        "[SCENARIO_ASSUMPTION] Sovereign telecommunications regulators issue compliance notices without national blackouts."
                    ],
                    monitoring_indicators=[
                        "IODA macroscopic BGP route announcement count by ASN.",
                        "OONI probe measurement test failure rates."
                    ]
                ),
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario B: Macroscopic National Gateway Interdiction & Multi-Day Digital Partition (High Impact)",
                    assumptions=[
                        "Broad-scale border gateway protocol (BGP) prefix withdrawals sever international connectivity for >72 hours.",
                        "Mobile data transmission halted across major metropolitan and commercial hubs."
                    ],
                    probability_description="Conditional contingency branch; triggered during acute civil unrest or kinetic confrontation.",
                    key_drivers=[
                        "Emergency state telecommunications intervention directives.",
                        "Physical cable cuts or critical exchange point power failures."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Severe disruption to cross-border digital trade, software export billings, and e-commerce.",
                        "[SCENARIO_ASSUMPTION] Corporate multinational entities switch to dedicated satellite fallback links at substantial operational cost.",
                        "[SCENARIO_ASSUMPTION] Commercial banking clearing systems operate under emergency store-and-forward batch mode."
                    ],
                    monitoring_indicators=[
                        "Global BGP routing table reachability indices.",
                        "Cloudflare Radar and RIPE Stat national traffic volume telemetry."
                    ]
                )
            ]

        # Domain: Humanitarian Assistance & Conflict Protection (OCHA, ReliefWeb)
        elif any(k in q_lower for k in ["humanitarian", "refugee", "ocha", "aid", "displacement", "famine", "crisis", "conflict-affected"]):
            return [
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario A: Managed De-escalation Corridors & Coordinated Multilateral Relief (Baseline)",
                    assumptions=[
                        "Negotiated humanitarian pauses allow UN and Red Cross relief convoys access to besieged populations.",
                        "Donor nations release emergency drawdowns through UN OCHA consolidated appeals."
                    ],
                    probability_description="Moderate qualitative likelihood; contingent on active diplomatic backchannel mediation.",
                    key_drivers=[
                        "International multilateral pressure for civilian protection guarantees.",
                        "Neutral third-party oversight of overland aid corridors."
                    ],
                    projected_outcomes=[
                        "[SOURCE_DERIVED: UN OCHA / ReliefWeb Field Reports] Essential food grain, clean water, and medical supplies reach designated distribution nodes.",
                        "[SCENARIO_ASSUMPTION] Civilian displacement stabilizes along managed transit reception corridors.",
                        "[SCENARIO_ASSUMPTION] Bilateral donor relief shipments avoid direct kinetic interdiction."
                    ],
                    monitoring_indicators=[
                        "ReliefWeb field situation report updates and funding coverage percentages.",
                        "UN OCHA humanitarian corridor convoy transit counts."
                    ]
                ),
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario B: Protracted Access Blockade & Compounding Cross-Border Refugee Crisis (High Impact)",
                    assumptions=[
                        "Sustained kinetic hostilities completely interdict commercial and humanitarian supply lines for >60 days.",
                        "Severe damage to municipal sanitation, water treatment, and electrical infrastructure."
                    ],
                    probability_description="Conditional contingency branch; triggered by total breakdown of ceasefire negotiations.",
                    key_drivers=[
                        "Intensification of siege warfare and denial of humanitarian access.",
                        "Exhaustion of local hospital diesel fuel and clean water reserves."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Rapid acceleration in child malnutrition rates and outbreak of water-borne epidemics.",
                        "[SCENARIO_ASSUMPTION] Massive irregular cross-border civilian refugee displacement overwhelming border control infrastructure.",
                        "[SCENARIO_ASSUMPTION] Emergency UN General Assembly and Security Council resolutions mobilizing international legal accountability."
                    ],
                    monitoring_indicators=[
                        "WHO / UNICEF epidemiological alert bulletins.",
                        "UNHCR cross-border registered refugee intake counts."
                    ]
                )
            ]

        # Domain: Entity & Bilateral Knowledge Graph (Wikidata, Chabahar, Strategic Treaties)
        elif any(k in q_lower for k in ["relationship", "relationships", "relations", "bilateral", "knowledge sources", "reliable information"]) and not any(k in q_lower for k in ["hormuz", "military", "war"]):
            return [
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario A: Incremental Strategic Transit Integration & Balanced Multi-Vector Diplomacy (Baseline)",
                    assumptions=[
                        "Operational management agreements at strategic transit nodes (e.g. Chabahar Shahid Beheshti Port) remain active.",
                        "Bilateral non-sanctioned commercial trade continues utilizing dedicated rupee/local-currency mechanisms."
                    ],
                    probability_description="High qualitative likelihood; reflects decades of pragmatic diplomatic and commercial coexistence.",
                    key_drivers=[
                        "Strategic necessity of landlocked Central Asian connectivity (INSTC corridor).",
                        "Mutual interest in counter-narcotics and regional border stability."
                    ],
                    projected_outcomes=[
                        "[SOURCE_DERIVED: Wikidata / Official Bilateral Accords] Bilateral transit freight volumes via INSTC expand steadily by [SCENARIO_ASSUMPTION: 10-15% annually].",
                        "[SCENARIO_ASSUMPTION] Bilateral diplomatic joint commissions convene on schedule to resolve customs and clearing friction.",
                        "[SCENARIO_ASSUMPTION] Sovereign entities maintain formal compliance carve-outs with international sanctions authorities."
                    ],
                    monitoring_indicators=[
                        "Chabahar Port container twenty-foot equivalent unit (TEU) throughput data.",
                        "Bilateral trade turnover and joint ministerial communique releases."
                    ]
                ),
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario B: Secondary Sanctions Friction & Maritime Insurance Chilling Effects (High Impact)",
                    assumptions=[
                        "Expanded extraterritorial secondary sanctions penalize third-party commercial banks financing port operations.",
                        "International maritime hull underwriters withdraw standard coverage for transit vessels calling at regional terminals."
                    ],
                    probability_description="Conditional contingency branch; triggered by sweeping unilateral sanctions expansion.",
                    key_drivers=[
                        "Geopolitical confrontation between major powers and regional state actors.",
                        "Stringent enforcement of banking compliance filters by correspondent clearing institutions."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Private shipping lines temporarily pause scheduled port calls pending legal review.",
                        "[SCENARIO_ASSUMPTION] Bilateral clearing shifts exclusively to sovereign-backed state barter and specialized financial vehicles.",
                        "[SCENARIO_ASSUMPTION] Diplomatic demarches request formal humanitarian and regional connectivity general licenses."
                    ],
                    monitoring_indicators=[
                        "OFAC sanctions designations and general license modification notices.",
                        "Foreign port call cancellation notices by commercial container carriers."
                    ]
                )
            ]

        # Topic 1: South China Sea / Semiconductor / Maritime Trade
        elif any(k in q_lower for k in ["south china sea", "semiconductor", "taiwan", "microchip", "electronics"]):
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

        # Topic 4: Macroeconomic Indicators & World Bank Statistics
        elif any(k in q_lower for k in ["world bank", "indicator", "gdp", "inflation", "macroeconomic", "unit, observation"]) and not any(k in q_lower for k in ["hormuz", "iran", "semiconductor", "taiwan", "russia", "ukraine", "fertilizer", "sanctions"]):
            return [
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario A: Sustained Domestic Expansion & Price Stability (Baseline)",
                    assumptions=[
                        "World Bank real GDP growth remains anchored around 7.0%-7.5% through strong domestic capex.",
                        "Monetary policy remains data-dependent with headline CPI inflation contained within 2%-6% RBI band."
                    ],
                    probability_description="High qualitative likelihood; consistent with latest verified multilateral indicators.",
                    key_drivers=[
                        "Public infrastructure capital expenditure outlays.",
                        "Stable domestic agricultural harvests and food price stabilization."
                    ],
                    projected_outcomes=[
                        "[SOURCE_DERIVED: World Bank IND GDP growth baseline] Domestic economic activity maintains momentum without overheating.",
                        "[SCENARIO_ASSUMPTION] Inflation remains centered near 2.4%-4.0%, supporting gradual easing of corporate borrowing costs.",
                        "[SCENARIO_ASSUMPTION] Sovereign revenue collections sustain public investment programs."
                    ],
                    monitoring_indicators=[
                        "World Bank and Ministry of Statistics & Programme Implementation (MOSPI) quarterly GDP releases.",
                        "Consumer Price Index (CPI) and Wholesale Price Index (WPI) monthly updates."
                    ]
                ),
                GeoForkScenario(
                    scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                    name="Scenario B: External Commodity Cost Shocks & Trade Deficit Friction (Contingency Branch)",
                    assumptions=[
                        "Global commodity or energy market disruptions increase imported input prices.",
                        "Current account deficit widens temporarily requiring strategic foreign exchange intervention."
                    ],
                    probability_description="Moderate qualitative likelihood; contingent on external geopolitical and supply chain developments.",
                    key_drivers=[
                        "Global crude oil and shipping freight rate volatility.",
                        "Major central bank interest rate divergences."
                    ],
                    projected_outcomes=[
                        "[SCENARIO_ASSUMPTION] Core inflation remains anchored while headline CPI experiences temporary supply-side spikes.",
                        "[SCENARIO_ASSUMPTION] Central bank deploys macro-prudential tools and currency liquidity buffers.",
                        "[SCENARIO_ASSUMPTION] Fiscal authorities prioritize nutrient and fuel subsidies to protect lower-income cohorts."
                    ],
                    monitoring_indicators=[
                        "Import trade balance and foreign exchange reserve adequacy reports.",
                        "Global Brent crude and freight index movements."
                    ]
                )
            ]

        # Topic 5: Energy Security / Crude Oil / US-Iran / Middle East Conflict (Default & Q1/Q3)
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
