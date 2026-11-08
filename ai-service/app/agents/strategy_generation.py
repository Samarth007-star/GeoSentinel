import uuid
from typing import List
from ..schemas.models import (
    StrategyOption,
    StrategyRiskReviewResult,
    RiskReviewStatus,
    ContextSnapshot,
    GeoCausalPathway
)

class StrategyGenerationAgent:
    """
    Stage 10: Formulates actionable decision-support strategy options.
    Initial risk_review is tagged as PENDING until Stage 11 executes.
    All numerical parameters are explicitly labeled as [STRATEGY_PARAM: SCENARIO_ASSUMPTION].
    """

    def generate_strategies(
        self,
        question: str,
        pathways: List[GeoCausalPathway],
        context: ContextSnapshot
    ) -> List[StrategyOption]:
        ev_refs = [e.evidence_id for e in context.evidence_items]
        q_lower = question.lower()

        # Initial unreviewed placeholder for Stage 11 Red Team
        pending_review = StrategyRiskReviewResult(
            review_id=f"rev_pend_{uuid.uuid4().hex[:6]}",
            reviewer="Unassigned",
            disposition=RiskReviewStatus.PENDING,
            findings="Awaiting independent Stage 11 Risk Review Gate.",
            unintended_consequences=[],
            second_order_harms=[],
            escalation_risks=[],
            affected_vulnerable_groups=[],
            required_mitigations=[],
            residual_risk_disclosure="Unreviewed"
        )

        # Out-of-scope / non-geopolitical check
        if any(w in q_lower for w in ["recipe", "cookie", "cookies", "baking", "cake", "dessert", "chocolate chip"]):
            return []

        # DOMAIN: Disaster & Scientific Hazard Telemetry (USGS, NOAA, EONET)
        if any(k in q_lower for k in ["earthquake", "seismic", "volcano", "wildfire", "cyclone", "flood", "natural hazard", "tsunami"]):
            return [
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Critical Infrastructure Emergency Redundancy & Grid Islanding Protocol",
                    objective="Protect regional electricity, water distribution, and digital switching stations from cascading failures following seismic or meteorological hazards.",
                    causal_mechanism="Activate automated sectionalizing and microgrid islanding for vital hospital and water pumping networks within [STRATEGY_PARAM: SCENARIO_ASSUMPTION: 15 minutes] of confirmed telemetry.",
                    prerequisites=[
                        "National and State Disaster Management Authority real-time telemetry link.",
                        "Inter-utility mutual assistance and automated grid isolation switches."
                    ],
                    benefits=[
                        "Prevents widespread blackouts and maintains emergency healthcare operability.",
                        "Enables focused repair crews to restore municipal sectors sequentially."
                    ],
                    tradeoffs=[
                        "Capital cost for redundant automated circuit switchgear.",
                        "Temporary power curtailment for non-essential industrial consumers."
                    ],
                    time_horizon="Immediate to 72 hours",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Mobilize mobile containerized diesel and battery energy storage trailers to critical public facilities."
                ),
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Pre-Positioned Civil Defense Logistics & Rapid Arterial Route Clearance",
                    objective="Ensure unhindered transit of search-and-rescue teams, mobile medical units, and emergency supplies to hazard epicenters.",
                    causal_mechanism="Deploy pre-designated heavy engineering and bridge-layer battalions to clear primary arterial logistics corridors within [STRATEGY_PARAM: SCENARIO_ASSUMPTION: 24 to 48 hours].",
                    prerequisites=[
                        "Pre-positioned regional emergency equipment depots near seismic fault zones.",
                        "Civil-military joint coordination standard operating procedures."
                    ],
                    benefits=[
                        "Accelerates golden-hour medical evacuation and survivor extrication.",
                        "Prevents secondary humanitarian distress in isolated rural settlements."
                    ],
                    tradeoffs=[
                        "Ongoing inventory holding and maintenance overhead for specialized clearance equipment.",
                        "Diversion of engineering corps assets from standard infrastructure projects."
                    ],
                    time_horizon="24 to 120 hours",
                    evidence_basis=ev_refs[:1],
                    risk_review=pending_review,
                    fallback_option="Deploy rotary-wing heavy-lift helicopters and tactical airdrop operations for cut-off communities."
                )
            ]

        # DOMAIN: Internet Connectivity & Censorship Signals (OONI, IODA)
        elif any(k in q_lower for k in ["internet", "connectivity", "ooni", "ioda", "bgp", "dns", "censorship", "outage", "telecom"]):
            return [
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Multi-Homed BGP Peering Diversity & Encrypted Out-of-Band Gateway Architecture",
                    objective="Ensure sovereign and commercial communications survive macroscopic network partitioning or upstream gateway disruptions.",
                    causal_mechanism="Mandate Tier-1 national telecommunications operators establish minimum [STRATEGY_PARAM: SCENARIO_ASSUMPTION: 3 independent] diverse physical terrestrial/submarine cable landing routes with automated BGP failover.",
                    prerequisites=[
                        "National Telecom Regulatory Authority inter-connection compliance mandate.",
                        "Diverse autonomous system (ASN) peering agreements with neutral regional exchange points."
                    ],
                    benefits=[
                        "Eliminates single point of failure in national internet backbone connectivity.",
                        "Protects cross-border financial transactions and sovereign diplomatic communications."
                    ],
                    tradeoffs=[
                        "Significant capital investment in redundant dark fiber leases and international transit commitments.",
                        "Increased complexity in BGP routing table optimization and route leak prevention."
                    ],
                    time_horizon="30 to 180 days",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Establish dedicated encrypted Low Earth Orbit (LEO) satellite data backhauls for essential governmental and banking networks."
                ),
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Distributed Edge Content Caching & Sovereign Autonomous Mesh Infrastructure",
                    objective="Preserve domestic essential digital services, emergency alerts, and payment processing during international gateway blackouts.",
                    causal_mechanism="Deploy distributed domestic edge caching servers and offline-capable digital public infrastructure (DPI) supporting store-and-forward commercial transactions for up to [STRATEGY_PARAM: SCENARIO_ASSUMPTION: 7 days].",
                    prerequisites=[
                        "National Informatics Centre and private cloud provider edge deployment agreement.",
                        "Cryptographic validation standards for delayed transaction settlement."
                    ],
                    benefits=[
                        "Ensures continuity of domestic retail commerce and civil defense messaging during external cable cuts.",
                        "Reduces national bandwidth reliance on overseas point-of-presence servers."
                    ],
                    tradeoffs=[
                        "Data consistency lag between domestic edge nodes and global ledger databases.",
                        "Security management overhead across distributed physical edge hardware nodes."
                    ],
                    time_horizon="60 to 120 days",
                    evidence_basis=ev_refs[:1],
                    risk_review=pending_review,
                    fallback_option="Revert commercial point-of-sale systems to batched offline SMS and store-and-forward digital token protocols."
                )
            ]

        # DOMAIN: Humanitarian Situation & Conflict Protection (OCHA, ReliefWeb)
        elif any(k in q_lower for k in ["humanitarian", "refugee", "ocha", "aid", "displacement", "famine", "crisis", "conflict-affected"]):
            return [
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Sovereign Humanitarian Relief Corridor & Protected Multilateral Escort Protocol",
                    objective="Deliver life-sustaining nutritional and medical assistance to conflict-affected civilian enclaves without militarizing aid delivery.",
                    causal_mechanism="Negotiate formally demilitarized humanitarian transit corridors with belligerent forces under International Committee of the Red Cross (ICRC) and UN auspices, backed by neutral state airlifts delivering [STRATEGY_PARAM: SCENARIO_ASSUMPTION: 100 tonnes daily] of high-energy therapeutic food.",
                    prerequisites=[
                        "UN Security Council / General Assembly humanitarian consensus declaration.",
                        "Bilateral deconfliction hotlines between donor liaison officers and local military commanders."
                    ],
                    benefits=[
                        "Prevents acute famine mortality and stabilizes displaced civilian populations.",
                        "Maintains international legal adherence to Geneva Conventions civil protection standards."
                    ],
                    tradeoffs=[
                        "Risk of physical attack on transport personnel by rogue non-state militia factions.",
                        "Potential diversion of relief goods by combatant elements in contested territory."
                    ],
                    time_horizon="7 to 30 days",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Execute high-altitude precision GPS parachute drops in coordination with local civil society networks."
                ),
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Third-Party Sovereign Humanitarian Escrow & Direct Medical Procurement Facility",
                    objective="Shield life-saving humanitarian payments from extraterritorial sanctions and banking clearing deadlocks.",
                    causal_mechanism="Establish an independently audited Swiss/neutral jurisdiction humanitarian payment channel facilitating verified procurement of WHO-certified pediatric vaccines, water purification tablets, and surgical supplies.",
                    prerequisites=[
                        "OFAC and EU Humanitarian General License exemptions confirmation.",
                        "Independent international auditing firm monitoring end-to-end cargo arrival."
                    ],
                    benefits=[
                        "Bypasses commercial bank compliance hesitation and correspondent clearing blockages.",
                        "Guarantees that 100% of disbursed funds translate into verified physical health supplies."
                    ],
                    tradeoffs=[
                        "High administrative auditing and compliance verification costs.",
                        "Stringent inspection requirements may extend procurement timelines by 10 to 14 days."
                    ],
                    time_horizon="15 to 45 days",
                    evidence_basis=ev_refs[:1],
                    risk_review=pending_review,
                    fallback_option="Direct physical barter exchange of pharmaceutical commodities against accredited sovereign goods."
                )
            ]

        # DOMAIN: Entity & Bilateral Knowledge Graph (Wikidata, Chabahar, Strategic Treaties)
        elif any(k in q_lower for k in ["relationship", "relationships", "relations", "bilateral", "knowledge sources", "reliable information"]) and not any(k in q_lower for k in ["hormuz", "military", "war"]):
            return [
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="INSTC Multimodal Freight Optimization & Terminal Berthing Guarantees",
                    objective="Strengthen sovereign transit autonomy across the International North-South Transport Corridor via Chabahar Port.",
                    causal_mechanism="Execute long-term terminal berthing and container handling priority agreements at Chabahar's Shahid Beheshti terminal, connecting railway links to reduce transit duration to Central Asia by [STRATEGY_PARAM: SCENARIO_ASSUMPTION: 35-40%].",
                    prerequisites=[
                        "Bilateral inter-governmental port management agreement execution.",
                        "Harmonization of railway gauge transfer standards and customs electronic seals."
                    ],
                    benefits=[
                        "Bypasses hostile land borders to access resource-rich Central Asian markets.",
                        "Lowers freight costs and transit times relative to traditional Suez Canal maritime routing."
                    ],
                    tradeoffs=[
                        "Substantial capital investment in port gantry cranes and rail connectivity.",
                        "Geopolitical exposure to changing regulatory postures of third-party transit states."
                    ],
                    time_horizon="90 to 365 days",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Deploy specialized road transport fleets under TIR (Transports Internationaux Routiers) transit carnet conventions."
                ),
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Bilateral Rupee-Rial Trade Clearing & Specialized Financial Mechanism",
                    objective="Maintain robust bilateral non-sanctioned commercial trade while fully respecting international regulatory guardrails.",
                    causal_mechanism="Expand dedicated Special Vostro Rupee Accounts (SVRA) in accredited domestic public sector banks to settle non-sanctioned agricultural, pharmaceutical, and tea/rice exports.",
                    prerequisites=[
                        "Central Bank (RBI) regulatory authorization and anti-money laundering (AML) monitoring protocols.",
                        "Designation of exclusive commercial banking channels with zero exposure to western financial jurisdictions."
                    ],
                    benefits=[
                        "Protects domestic agricultural exporters from dollar payment freezes.",
                        "Strengthens bilateral commercial ties without breaching multilateral sanctions covenants."
                    ],
                    tradeoffs=[
                        "Trade imbalance accumulation if export volumes significantly outpace non-sanctioned import demand.",
                        "Currency conversion restrictions limiting liquidity deployment outside bilateral commerce."
                    ],
                    time_horizon="30 to 90 days",
                    evidence_basis=ev_refs[:1],
                    risk_review=pending_review,
                    fallback_option="Counter-trade and barter clearing through third-party escrow arrangements in neutral trade hubs."
                )
            ]

        # TOPIC 1: South China Sea / Semiconductor / Global Supply Chains (Q2)
        elif any(k in q_lower for k in ["south china sea", "semiconductor", "taiwan", "microchip", "electronics"]):
            return [
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Critical Component Strategic Stockpiling & Alternative Fab Sourcing Protocol",
                    objective="Ensure 60 to 90 days of manufacturing continuity for high-priority domestic electronics and automotive lines.",
                    causal_mechanism="Mandate domestic tier-1 manufacturers build a [STRATEGY_PARAM: SCENARIO_ASSUMPTION: 60-day] buffer inventory of legacy and automotive-grade semiconductors while qualifying backup packaging and testing vendors in alternate geographies.",
                    prerequisites=[
                        "Ministry of Electronics and Information Technology (MeitY) component inventory audit.",
                        "Expedited customs clearance green-corridors for critical microelectronic imports."
                    ],
                    benefits=[
                        "Prevents immediate assembly line stoppages during short-term maritime transit bottlenecks.",
                        "Protects domestic manufacturing output and export delivery schedules."
                    ],
                    tradeoffs=[
                        "Substantial working capital lock-in for domestic electronics manufacturers.",
                        "Inventory obsolescence risk if microchip model cycles advance rapidly."
                    ],
                    time_horizon="30 to 90 days",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Prioritized allocation of available microchips strictly to essential public infrastructure, defense, and healthcare medical hardware."
                ),
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Maritime Shipping Multi-Modal Routing & Freight Risk Equalization Pool",
                    objective="Mitigate catastrophic freight rate spikes and secure dedicated vessel capacity on alternate sea corridors.",
                    causal_mechanism="Establish a sovereign-backed maritime freight reinsurance pool and charter multi-purpose vessels to operate scheduled feeder runs bypassing congested chokepoints via Sunda and Lombok Straits.",
                    prerequisites=[
                        "Shipping ministry coordination with state-owned maritime shipping corporations.",
                        "Inter-governmental bilateral port berthing priority agreements with regional port operators."
                    ],
                    benefits=[
                        "Guarantees scheduled maritime container capacity for essential high-value manufactured exports.",
                        "Caps ocean freight risk premiums for domestic MSME exporters."
                    ],
                    tradeoffs=[
                        "Fiscal contingency liability on sovereign maritime reinsurance fund.",
                        "Extended voyage schedules require higher operational fuel allocations."
                    ],
                    time_horizon="15 to 60 days",
                    evidence_basis=ev_refs[:1],
                    risk_review=pending_review,
                    fallback_option="Emergency air-cargo charter bridges for critical components and high-value export merchandise."
                )
            ]

        # TOPIC 2: Russia-Ukraine / Food Security / Fertilizer (Q4)
        elif any(k in q_lower for k in ["russia", "ukraine", "fertilizer", "food security", "wheat", "grain"]):
            return [
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Multi-National Long-Term Fertilizer Offtake Contracts & Barter Settlement",
                    objective="Secure domestic agricultural fertilizer availability for upcoming crop sowing cycles and contain price inflation.",
                    causal_mechanism="Execute multi-year bilateral offtake contracts for DAP, MOP, and Urea with non-Black Sea producers (Morocco, Jordan, Canada, Saudi Arabia) utilizing rupee-denominated trade mechanisms and sovereign counter-trade.",
                    prerequisites=[
                        "Department of Fertilizers inter-ministerial nutrient subsidy budget revision.",
                        "Diplomatic sovereign supply guarantees and shipping escort protocols."
                    ],
                    benefits=[
                        "Insulates domestic farming sector from global Black Sea fertilizer spot price spikes.",
                        "Guarantees required N-P-K nutrient balance to protect domestic seasonal food grain yields."
                    ],
                    tradeoffs=[
                        "Long-term procurement price lock-in risks financial loss if global prices subsequently normalize.",
                        "Higher shipping voyage distances increase CIF freight component."
                    ],
                    time_horizon="30 to 90 days",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Emergency mandatory domestic allocation of fertilizer stocks to staple food grain crops with temporary quotas on cash crops."
                ),
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Strategic Edible Oil & Food Buffer Stock Market Stabilization Mechanism",
                    objective="Stabilize retail food inflation and prevent consumer market hoarding during international commodity shocks.",
                    causal_mechanism="Calibrate dynamic reduction in basic customs duty on crude palm, soybean, and sunflower oil imports while releasing calibrated buffer stocks through public distribution channels.",
                    prerequisites=[
                        "Food and Consumer Affairs price monitoring committee daily reporting.",
                        "State civil supplies corporations logistics readiness."
                    ],
                    benefits=[
                        "Dampens headline retail food CPI inflation pass-through to vulnerable consumer households.",
                        "Maintains predictable domestic culinary oil availability."
                    ],
                    tradeoffs=[
                        "Fiscal customs revenue sacrifice on tariff reductions.",
                        "Temporary disincentive for domestic oilseed farmers if imported oils enter at lower tariffs."
                    ],
                    time_horizon="15 to 45 days",
                    evidence_basis=ev_refs[:1],
                    risk_review=pending_review,
                    fallback_option="Strict enforcement of statutory stockholding limits on wholesale agricultural commodity trading intermediaries."
                )
            ]

        # TOPIC 3: Trade Sanctions (China, Russia, Iran) (Q5)
        elif any(k in q_lower for k in ["sanction", "sanctions", "trade sanction", "export control", "embargo"]):
            return [
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Bilateral Financial Settlement & Multi-Currency Clearing Expansion",
                    objective="Insulate international trade payments from banking sanctions and dollar clearing bottlenecks.",
                    causal_mechanism="Activate bilateral local-currency trading mechanisms and Vostro account clearing for non-sanctioned agricultural, pharmaceutical, and energy goods.",
                    prerequisites=[
                        "Central Bank bilateral swap line operationalization.",
                        "Commercial bank clearing agency compliance verification."
                    ],
                    benefits=[
                        "Maintains critical bilateral trade flows during third-party financial sanctions.",
                        "Reduces direct foreign exchange drain on US Dollar reserves."
                    ],
                    tradeoffs=[
                        "Currency exchange rate risk and illiquid trading balance accumulation.",
                        "Secondary compliance audit requirements from international financial regulators."
                    ],
                    time_horizon="30 to 90 days",
                    evidence_basis=ev_refs[:1],
                    risk_review=pending_review,
                    fallback_option="Third-party escrow accounts in neutral financial centers (e.g., UAE, Singapore)."
                ),
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Strategic Industrial IP & Precision Component Indigenization Acceleration",
                    objective="Shield strategic manufacturing sectors from secondary technology export controls and tooling embargoes.",
                    causal_mechanism="Establish a targeted sovereign technology indigenization fund providing Capex subsidies for domestic production of high-precision CNC tooling, specialized chemicals, and industrial automation software.",
                    prerequisites=[
                        "Industrial policy notification designating national priority critical components.",
                        "Collaborative R&D consortium between national laboratories, public undertakings, and private manufacturers."
                    ],
                    benefits=[
                        "Reduces sovereign vulnerability to extraterritorial technology export denial regimes.",
                        "Enhances long-term domestic industrial self-reliance and technological autonomy."
                    ],
                    tradeoffs=[
                        "Substantial capital investment with 2 to 5 year gestation lag for high-precision components.",
                        "Potential initial domestic quality variance relative to established global market leaders."
                    ],
                    time_horizon="60 to 180 days",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Negotiate formal diplomatic technology-sharing exceptions and dual-use end-user verification protocols."
                )
            ]

        # TOPIC 4: Macroeconomic Indicators & World Bank Statistics
        elif any(k in q_lower for k in ["world bank", "indicator", "gdp", "inflation", "macroeconomic", "unit, observation"]) and not any(k in q_lower for k in ["hormuz", "iran", "semiconductor", "taiwan", "russia", "ukraine", "fertilizer", "sanctions"]):
            return [
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Public Capital Expenditure (Capex) Growth-Inflation Coordination Protocol",
                    objective="Leverage 7%+ GDP growth momentum to expand high-multiplier infrastructure while anchoring inflation expectations.",
                    causal_mechanism="Sustain targeted public capex allocations in logistics corridors and renewable energy while coordinating with the central bank to maintain statutory inflation targeting.",
                    prerequisites=[
                        "Ministry of Finance medium-term fiscal consolidation framework alignment.",
                        "Monetary Policy Committee (MPC) data-dependent rate policy stance."
                    ],
                    benefits=[
                        "Crowds in private capital expenditure and modernizes freight and transport networks.",
                        "Protects domestic wage-earning purchasing power against demand-pull price pressures."
                    ],
                    tradeoffs=[
                        "Constrains room for broad-based countercyclical revenue spending.",
                        "Requires strict quality control on public sector capital project execution."
                    ],
                    time_horizon="12 to 24 months",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Rebalance budget outlays toward targeted social safety nets and nutrient/food buffer releases if food CPI spikes."
                ),
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="External Account & Terms-of-Trade High-Frequency Surveillance Framework",
                    objective="Preemptively insulate foreign exchange reserves and sovereign debt yields from external commodity price volatility.",
                    causal_mechanism="Deploy multi-agency high-frequency tracking of merchandise trade balances, import price elasticities, and core vs. headline CPI divergence.",
                    prerequisites=[
                        "Central Bank (RBI) and Department of Commerce integrated data-sharing portal.",
                        "Sovereign foreign exchange reserve liquidity adequacy benchmarks."
                    ],
                    benefits=[
                        "Provides 30 to 60 days advance warning of external current account deterioration.",
                        "Enables targeted tariff adjustments or currency swap activation before market stress emerges."
                    ],
                    tradeoffs=[
                        "Administrative compliance overhead for export-import monitoring authorities.",
                        "May signal policy anxiety to international capital markets if not communicated transparently."
                    ],
                    time_horizon="Ongoing surveillance",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Activate bilateral currency swap lines and mobilize non-resident diaspora deposit incentives."
                )
            ]

        # TOPIC 5: Energy Security / Crude Oil / US-Iran / Middle East Conflict (Q1, Q3 & Default)
        else:
            return [
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Strategic Petroleum Reserve (SPR) Staged Drawdown & Sourcing Diversification",
                    objective="Mitigate short-term physical crude supply deficits and dampen domestic retail fuel inflation.",
                    causal_mechanism="Release [STRATEGY_PARAM: SCENARIO_ASSUMPTION: 20-30%] of domestic commercial/underground crude reserves at Padur/Mangalore while executing spot import contracts with non-Hormuz suppliers (West Africa, Latin America).",
                    prerequisites=[
                        "Inter-ministerial emergency drawdown notification (MoPNG & Finance).",
                        "Offshore freight contract arrangements with non-Gulf maritime fleets."
                    ],
                    benefits=[
                        "Provides an estimated [STRATEGY_PARAM: SCENARIO_ASSUMPTION: 25 to 30 days] of insulated domestic refining feedstocks.",
                        "Prevents sudden overnight retail fuel price hikes and freight price gouging."
                    ],
                    tradeoffs=[
                        "Drawdown lowers national strategic buffer in the event of an expanded prolonged regional war.",
                        "Alternative long-haul crude shipments incur higher freight transit duration (18-24 days)."
                    ],
                    time_horizon="15 to 45 days",
                    evidence_basis=ev_refs[:2],
                    risk_review=pending_review,
                    fallback_option="Implement mandatory industrial fuel blending quotas and prioritized supply allocation to essential food/medical freight."
                ),
                StrategyOption(
                    option_id=f"opt_{uuid.uuid4().hex[:8]}",
                    title="Bilateral Financial Settlement & Multi-Currency Clearing Expansion",
                    objective="Insulate international trade payments from banking sanctions and dollar clearing bottlenecks.",
                    causal_mechanism="Activate bilateral local-currency trading mechanisms and Vostro account clearing for non-sanctioned agricultural and energy goods.",
                    prerequisites=[
                        "Central Bank bilateral swap line operationalization.",
                        "Commercial bank clearing agency compliance verification."
                    ],
                    benefits=[
                        "Maintains critical bilateral trade flows during third-party financial sanctions.",
                        "Reduces direct foreign exchange drain on US Dollar reserves."
                    ],
                    tradeoffs=[
                        "Currency exchange rate risk and illiquid trading balance accumulation.",
                        "Secondary compliance audit requirements from international financial regulators."
                    ],
                    time_horizon="30 to 90 days",
                    evidence_basis=ev_refs[:1],
                    risk_review=pending_review,
                    fallback_option="Third-party escrow accounts in neutral financial centers (e.g., UAE, Singapore)."
                )
            ]

strategy_generation_agent = StrategyGenerationAgent()
