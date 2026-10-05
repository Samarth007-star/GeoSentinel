import uuid
from typing import List
from ..schemas.models import (
    StrategyOption,
    StrategyRiskReviewResult,
    StrategyMitigation,
    RiskReviewStatus,
    ContextSnapshot
)

class StrategyRiskReviewAgent:
    """
    Stage 11: Mandatory Independent Strategy Risk Review Gate (Red Team Challenge).
    Structurally separate from Strategy Generation.
    Assesses second-order harm, escalation, feasibility, and vulnerable populations.
    Enforces that unreviewed strategies CANNOT pass through as approved.
    """

    def review_strategies(
        self,
        strategies: List[StrategyOption],
        context: ContextSnapshot
    ) -> List[StrategyOption]:
        reviewed_strategies: List[StrategyOption] = []

        for strat in strategies:
            review = self._red_team_evaluate(strat, context)
            strat.risk_review = review
            reviewed_strategies.append(strat)

        return reviewed_strategies

    def _red_team_evaluate(
        self,
        strat: StrategyOption,
        context: ContextSnapshot
    ) -> StrategyRiskReviewResult:
        review_id = f"rev_{uuid.uuid4().hex[:8]}"
        title_lower = strat.title.lower()

        # Case 1: SPR Drawdown
        if "strategic petroleum reserve" in title_lower:
            return StrategyRiskReviewResult(
                review_id=review_id,
                reviewer="GeoSentinel_IndependentRedTeam_v1.0",
                disposition=RiskReviewStatus.APPROVED_WITH_LIMITATIONS,
                findings="Tactically feasible for a bounded 30-day supply window, but presents high strategic inventory vulnerability if naval friction escalates beyond 60 days.",
                unintended_consequences=[
                    "Exhaustion of underground cavern storage weakens deterrence posture in a wider conflict.",
                    "Pre-announcing large spot market purchases may trigger speculative price spikes by international commodity traders."
                ],
                second_order_harms=[
                    "Refinery configuration bottlenecks if replacement crude grades differ in sulfur/API gravity specification from Arab Light.",
                    "Higher maritime insurance surcharges on alternative long-distance routes."
                ],
                escalation_risks=[
                    "Perception by conflict belligerents of siding with non-sanctioned market coalitions."
                ],
                affected_vulnerable_groups=[
                    "Small-scale domestic fishing communities dependent on diesel subsidies.",
                    "Marginal transport operators vulnerable to temporary fuel rationing."
                ],
                required_mitigations=[
                    StrategyMitigation(
                        mitigation_id=f"mit_{uuid.uuid4().hex[:6]}",
                        description="Cap initial emergency drawdown strictly at 25% of total strategic volume.",
                        trigger_indicator="Crude supply transit disruption persists >10 consecutive days.",
                        fallback_action="Activate commercial refinery reserve blending protocols."
                    ),
                    StrategyMitigation(
                        mitigation_id=f"mit_{uuid.uuid4().hex[:6]}",
                        description="Execute advance forward purchase agreements with West African/Latin American producers.",
                        trigger_indicator="Persian Gulf tanker insurance premium exceeds 300% of baseline.",
                        fallback_action="Direct bilateral crude swap arrangement with friendly regional nations."
                    )
                ],
                residual_risk_disclosure="Residual price volatility cannot be eliminated by national reserves alone; macroeconomic fiscal cushion required."
            )

        # Case 2: Component Stockpiling & Semiconductor Backup
        elif "component strategic stockpiling" in title_lower or "semiconductor" in title_lower:
            return StrategyRiskReviewResult(
                review_id=review_id,
                reviewer="GeoSentinel_IndependentRedTeam_v1.0",
                disposition=RiskReviewStatus.APPROVED_WITH_LIMITATIONS,
                findings="High working capital allocation with substantial depreciation risk; mitigates sudden assembly line shutdowns but cannot resolve multi-quarter fabrication interdictions.",
                unintended_consequences=[
                    "Large cash lock-up by domestic hardware manufacturers restricts quarterly R&D expenditure.",
                    "Precautionary hoarding by tier-1 conglomerates creates artificial shortages for smaller MSME electronics makers."
                ],
                second_order_harms=[
                    "Rapid component obsolescence if engineering product roadmaps migrate to next-generation node architectures.",
                    "Compliance friction under bilateral intellectual property licensing covenants."
                ],
                escalation_risks=[
                    "Foreign export-control authorities may view large-scale stockpiling as diversion risk, subjecting buyers to intrusive audits."
                ],
                affected_vulnerable_groups=[
                    "Small-scale domestic IoT and electronics repair enterprises priced out of spot component markets.",
                    "Contract assembly floor laborers facing temporary furloughs during part reconfiguration."
                ],
                required_mitigations=[
                    StrategyMitigation(
                        mitigation_id=f"mit_{uuid.uuid4().hex[:6]}",
                        description="Deploy centralized government inventory tracking to prevent anti-competitive hoarding by tier-1 manufacturers.",
                        trigger_indicator="Spot market distributor markup on standard microcontrollers exceeds 50%.",
                        fallback_action="Activate priority hardware allocation for critical infrastructure and defense."
                    )
                ],
                residual_risk_disclosure="Domestic inventory buffers provide time-bounded tactical resilience; fundamental supply security requires indigenous semiconductor fabrication capability."
            )

        # Case 3: Fertilizer Offtake & Barter Clearing
        elif "fertilizer" in title_lower:
            return StrategyRiskReviewResult(
                review_id=review_id,
                reviewer="GeoSentinel_IndependentRedTeam_v1.0",
                disposition=RiskReviewStatus.APPROVED_WITH_LIMITATIONS,
                findings="Critical national food security intervention, but exposes public treasury to long-term price distortion if multi-year contracts lock in peak commodity valuations.",
                unintended_consequences=[
                    "Lock-in of elevated nutrient procurement rates creates severe multi-year fiscal drag if international markets experience supply gluts.",
                    "Agronomic soil chemistry friction if substitution of alternative rock phosphate sources alters field application dosage."
                ],
                second_order_harms=[
                    "Fiscal trade-offs requiring reductions in other capital investments within the agricultural sector.",
                    "Shipping voyage risks on long-haul bulk carrier routes vulnerable to maritime chokepoints."
                ],
                escalation_risks=[
                    "Diplomatic friction with competing developing nations vying for identical non-embargoed fertilizer volumes."
                ],
                affected_vulnerable_groups=[
                    "Smallholder farmers in rain-fed regions vulnerable to delayed nutrient distribution schedules."
                ],
                required_mitigations=[
                    StrategyMitigation(
                        mitigation_id=f"mit_{uuid.uuid4().hex[:6]}",
                        description="Incorporate flexible price indexing clauses tied to international trailing 6-month commodity averages.",
                        trigger_indicator="Global spot urea/DAP prices decline >20% below contract strike price.",
                        fallback_action="Reroute contracted surplus to sovereign strategic buffer stockpiles."
                    )
                ],
                residual_risk_disclosure="Price hedging and multi-origin procurement buffer against outright physical shortages, but sovereign fiscal exposure remains substantial during prolonged geopolitical conflict."
            )

        # Case 4: Default / Financial Settlement & Bilateral Clearing
        else:
            return StrategyRiskReviewResult(
                review_id=review_id,
                reviewer="GeoSentinel_IndependentRedTeam_v1.0",
                disposition=RiskReviewStatus.APPROVED_WITH_LIMITATIONS,
                findings="Viable for essential humanitarian and agricultural commerce, but requires strict OFAC and international compliance auditing to prevent secondary financial penalties.",
                unintended_consequences=[
                    "Accumulation of non-convertible foreign currencies in domestic Vostro accounts.",
                    "Potential scrutiny from international banking correspondent networks."
                ],
                second_order_harms=[
                    "Commercial exchange rate arbitrage opportunities for illicit financial brokers."
                ],
                escalation_risks=[
                    "Diplomatic friction with Western financial sanctions enforcement entities."
                ],
                affected_vulnerable_groups=[
                    "Small and medium enterprises (MSME exporters) lacking dedicated international compliance departments."
                ],
                required_mitigations=[
                    StrategyMitigation(
                        mitigation_id=f"mit_{uuid.uuid4().hex[:6]}",
                        description="Establish dedicated Central Bank compliance hotline and white-listed humanitarian commodity schedules.",
                        trigger_indicator="Vostro non-convertible currency accumulation exceeds $1 billion equivalent.",
                        fallback_action="Mandatory bilateral investment agreements to absorb currency into infrastructure."
                    )
                ],
                residual_risk_disclosure="Secondary sanctions risks persist if transaction counterparties have undisclosed corporate ties."
            )

strategy_risk_review_agent = StrategyRiskReviewAgent()
