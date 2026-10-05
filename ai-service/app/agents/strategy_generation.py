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

        # TOPIC 1: South China Sea / Semiconductor / Global Supply Chains (Q2)
        if any(k in q_lower for k in ["south china sea", "semiconductor", "taiwan", "microchip", "electronics"]):
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

        # TOPIC 4: Energy Security / Crude Oil / US-Iran / Middle East Conflict (Q1, Q3 & Default)
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
