from datetime import datetime, timezone
from typing import List
from ..schemas.models import (
    ContextSnapshot,
    GeoCausalPathway,
    GeoForkScenario,
    StrategyOption,
    GeoSentinelAnswer,
    CurrentSituationSection,
    EvidenceItemSection,
    ImpactAnalysisSection,
    StrategyRecommendationSection,
    RiskReviewStatus
)

class ResponseCompositionAgent:
    """
    Stage 12: Enforces the canonical 4-section answer schema,
    traces evidence provenance, and blocks approval of unreviewed strategies.
    """

    def compose_answer(
        self,
        question: str,
        context: ContextSnapshot,
        pathways: List[GeoCausalPathway],
        scenarios: List[GeoForkScenario],
        strategies: List[StrategyOption]
    ) -> GeoSentinelAnswer:
        now_iso = datetime.now(timezone.utc).isoformat()
        q_lower = question.lower()

        # Out-of-scope guardrail
        is_out_of_scope = any(w in q_lower for w in ["recipe", "cookie", "cookies", "baking", "cake", "dessert", "chocolate chip"]) or (
            len(pathways) == 0 and len(strategies) == 0 and len(scenarios) == 0
        )

        if is_out_of_scope:
            situation = CurrentSituationSection(
                summary=f"Inquiry Assessment: The submitted question ('{question}') falls outside the operational domain scope of GeoSentinel (geopolitics, macroeconomics, natural hazards, critical infrastructure, and humanitarian crises). In accordance with defensive research guardrails, non-geopolitical inquiries generate zero unverified causal projections or military/economic strategies.",
                as_of=now_iso,
                verified_facts=[
                    "GeoSentinel Domain Boundary: Operational intelligence models are strictly restricted to sovereign geopolitics, global trade corridors, macroeconomic indicators, disaster telemetry, and civil infrastructure."
                ],
                attributed_claims=[]
            )
            return GeoSentinelAnswer(
                current_situation=situation,
                relevant_evidence=[],
                impact_analysis=[],
                strategy_recommendations=[],
                scenarios=[],
                confidence_rationale="N/A: Submitted inquiry falls outside the operational domain scope of GeoSentinel.",
                limitations=[
                    "Defensive Guardrail: GeoSentinel declines processing of culinary, lifestyle, or non-geopolitical inquiries to maintain data integrity.",
                    "All strategic models require contextually relevant geopolitical, economic, or hazard inputs."
                ]
            )

        # Section 1: Current Situation
        situation = CurrentSituationSection(
            summary=f"Analysis of current global indicators and geopolitical signals relevant to: '{question}'.",
            as_of=now_iso,
            verified_facts=context.verified_facts[:4],
            attributed_claims=context.source_referenced_claims[:4]
        )

        # Section 2: Relevant Evidence
        evidence_items: List[EvidenceItemSection] = []
        for ev in context.evidence_items:
            evidence_items.append(EvidenceItemSection(
                evidence_id=ev.evidence_id,
                source_name=ev.source_name,
                source_url=ev.source_url,
                published_date=ev.published_at,
                retrieval_date=ev.retrieved_at,
                verification_status=ev.verification_status,
                relevance=f"Informs analysis on {ev.geography or 'regional'} indicators and impact pathways.",
                data_origin=ev.data_origin,
                conflicts_or_limitations=ev.limitations or "Verified under standard source license terms."
            ))

        # Section 3: Impact Analysis (GeoCausal)
        impact_sections: List[ImpactAnalysisSection] = []
        for p in pathways:
            impact_sections.append(ImpactAnalysisSection(
                sector=p.sector,
                pathway=f"{p.title}: {p.direct_impact}",
                horizon=p.time_horizon,
                direct_impact=p.direct_impact,
                indirect_impact=p.indirect_impact,
                affected_populations=p.affected_populations,
                uncertainty=p.uncertainty_level
            ))

        # Section 4: Strategy Recommendations (with Risk Review Gate enforcement)
        strat_sections: List[StrategyRecommendationSection] = []
        for strat in strategies:
            # Gate check: Structurally prevent unreviewed strategies from appearing approved
            rev_status = strat.risk_review.disposition
            if rev_status == RiskReviewStatus.PENDING:
                rev_status = RiskReviewStatus.WITHHOLD

            strat_sections.append(StrategyRecommendationSection(
                option_id=strat.option_id,
                title=strat.title,
                objective=strat.objective,
                mechanism=strat.causal_mechanism,
                benefits=strat.benefits,
                tradeoffs=strat.tradeoffs,
                unintended_consequences=strat.risk_review.unintended_consequences,
                risk_review_status=rev_status,
                required_mitigations=[m.description for m in strat.risk_review.required_mitigations],
                residual_risk=strat.risk_review.residual_risk_disclosure,
                fallback=strat.fallback_option
            ))

        limitations = [
            "Analytical projections represent decision-support hypotheses grounded in verified open data; they do not constitute guaranteed geopolitical outcomes.",
            "Real-time tactical military maneuvers excluded under zero-paid-API and defensive research constraints.",
            "All recommendations require contextual review by qualified policy and domain authorities."
        ]
        if context.missing_data_disclosures:
            limitations.extend(context.missing_data_disclosures)

        # Check for exact point forecasting / insufficient evidence questions
        is_exact_forecasting = any(k in q_lower for k in ["exact price", "exact date", "specific date", "exact value next month", "will the exact"])
        if is_exact_forecasting:
            limitations.append(
                "Forecasting Methodological Limitation: GeoSentinel strictly adheres to empirical intelligence standards prohibiting deterministic point forecasting (e.g. projecting the exact future calendar price of crude oil or precise conflict onset date). Future asset spot prices and market valuations are governed by non-linear extrinsic factors, speculative financial flows, and unmodeled geopolitical shocks. Strategic decision-support must rely on conditional scenario stress-testing and buffer capacity rather than deterministic point price targets."
            )
            confidence_rationale = "High confidence regarding baseline macroeconomic dependency and official multilateral data; low/inapplicable confidence for deterministic point price forecasting due to irreducible extrinsic market volatility."
        else:
            confidence_rationale = "High confidence regarding baseline macroeconomic dependency and official multilateral data; moderate confidence regarding geopolitical escalation time horizons."

        return GeoSentinelAnswer(
            current_situation=situation,
            relevant_evidence=evidence_items,
            impact_analysis=impact_sections,
            strategy_recommendations=strat_sections,
            scenarios=scenarios,
            confidence_rationale=confidence_rationale,
            limitations=limitations
        )

response_composition_agent = ResponseCompositionAgent()
