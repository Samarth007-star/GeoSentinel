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
