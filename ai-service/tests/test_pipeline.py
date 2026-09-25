import asyncio
from app.schemas.models import (
    QuestionIntakeRequest,
    RiskReviewStatus,
    VerificationState
)
from app.orchestration.pipeline import geosentinel_pipeline

def test_canonical_12_stage_pipeline_execution():
    request = QuestionIntakeRequest(
        session_id="test_session_123",
        question="What could be the effects on India if US-Iran tensions escalate?",
        time_horizon="30d",
        geographies=["IND", "IRN", "USA"],
        include_categories=["economic", "scientific", "international"]
    )

    result = asyncio.run(geosentinel_pipeline.execute(request))

    # 1. Assert status and run IDs
    assert result.status == "COMPLETED"
    assert result.session_id == "test_session_123"
    assert result.analysis_run_id.startswith("run_")
    assert result.question_id.startswith("q_")

    answer = result.answer

    # 2. Section 1: Current Situation
    assert answer.current_situation is not None
    assert len(answer.current_situation.summary) > 0
    assert len(answer.current_situation.verified_facts) > 0

    # 3. Section 2: Relevant Evidence
    assert len(answer.relevant_evidence) > 0
    for ev in answer.relevant_evidence:
        assert ev.evidence_id is not None
        assert ev.source_name is not None
        assert ev.source_url.startswith("http")
        assert ev.verification_status in [
            VerificationState.VERIFIED,
            VerificationState.CROSS_CHECKED,
            VerificationState.SOURCE_REFERENCED,
            VerificationState.CONFLICTING,
            VerificationState.REJECTED
        ]

    # 4. Section 3: Impact Analysis (GeoCausal)
    assert len(answer.impact_analysis) > 0
    for impact in answer.impact_analysis:
        assert impact.sector is not None
        assert len(impact.pathway) > 0
        assert impact.direct_impact is not None
        assert impact.uncertainty in ["LOW", "MEDIUM", "HIGH"]

    # 5. Section 4: Strategy Recommendations & Mandatory Risk Review Gate
    assert len(answer.strategy_recommendations) > 0
    for strat in answer.strategy_recommendations:
        assert strat.title is not None
        assert strat.objective is not None
        assert strat.mechanism is not None
        assert len(strat.benefits) > 0
        assert len(strat.tradeoffs) > 0
        # Mandatory risk review must NOT be PENDING
        assert strat.risk_review_status != RiskReviewStatus.PENDING
        assert strat.risk_review_status in [
            RiskReviewStatus.APPROVED_WITH_LIMITATIONS,
            RiskReviewStatus.REQUIRES_REVISION,
            RiskReviewStatus.REJECTED,
            RiskReviewStatus.WITHHOLD
        ]
        assert len(strat.required_mitigations) > 0
        assert len(strat.residual_risk) > 0
        assert strat.fallback is not None

    # 6. Overall Limitations & Confidence
    assert len(answer.limitations) > 0
    assert len(answer.confidence_rationale) > 0
