from app.schemas.models import (
    StrategyOption,
    StrategyRiskReviewResult,
    RiskReviewStatus,
    ContextSnapshot
)
from app.agents.response_composition import response_composition_agent

def test_unreviewed_strategy_blocked_from_approval():
    """
    Test proving that if a strategy somehow reaches Stage 12 with a PENDING review,
    the Response Composition Agent structurally withholds approval.
    """
    unreviewed_strat = StrategyOption(
        option_id="opt_unreviewed",
        title="Unreviewed High-Risk Naval Deployment",
        objective="Escalate naval presence without risk review",
        causal_mechanism="Deploy naval fleet directly into active zone",
        prerequisites=[],
        benefits=["Immediate physical deterrence"],
        tradeoffs=["Severe risk of miscalculation"],
        time_horizon="7d",
        evidence_basis=[],
        risk_review=StrategyRiskReviewResult(
            review_id="rev_pending",
            reviewer="None",
            disposition=RiskReviewStatus.PENDING,  # PENDING review
            findings="Never reviewed by Red Team",
            unintended_consequences=[],
            second_order_harms=[],
            escalation_risks=[],
            affected_vulnerable_groups=[],
            required_mitigations=[],
            residual_risk_disclosure=""
        ),
        fallback_option="None"
    )

    empty_context = ContextSnapshot(session_id="test_sess")
    answer = response_composition_agent.compose_answer(
        question="Test Question",
        context=empty_context,
        pathways=[],
        scenarios=[],
        strategies=[unreviewed_strat]
    )

    # Verify that the unreviewed strategy was WITHHELD and NOT approved
    strat_result = answer.strategy_recommendations[0]
    assert strat_result.risk_review_status == RiskReviewStatus.WITHHOLD
    assert strat_result.risk_review_status != RiskReviewStatus.APPROVED_WITH_LIMITATIONS
