import asyncio
import pytest
from app.schemas.models import (
    QuestionIntakeRequest,
    RiskReviewStatus,
    VerificationState,
    StrategyOption,
    StrategyRiskReviewResult,
    StrategyRecommendationSection,
    ImpactAnalysisSection,
    GeoSentinelAnswer
)
from app.agents.question_understanding import question_understanding_agent
from app.dataset_builder.builder import dataset_builder
from app.agents.strategy_risk_review import strategy_risk_review_agent
from app.agents.response_composition import response_composition_agent
from app.agents.context_builder import context_builder_agent
from app.core.config import settings

def test_missing_evidence_fallback_activation():
    # If no live records returned, fallback reference records must be injected
    records = dataset_builder._load_fallback_reference_records(["IND"])
    assert len(records) >= 2
    for r in records:
        assert r.evidence_id.startswith("ev_ref_")
        assert r.source_url.startswith("http")
        assert len(r.content_hash) > 0

def test_rejected_strategy_risk_gate_withholding():
    # Construct a draft StrategyOption with PENDING risk review
    pending_review = StrategyRiskReviewResult(
        review_id="rev_pend_001",
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
    draft = [
        StrategyOption(
            option_id="opt_risky_001",
            title="Aggressive Unilateral Secondary Sanctions",
            objective="Interdict oil shipments",
            causal_mechanism="Immediate extraterritorial seizure of unflagged tankers",
            prerequisites=[],
            benefits=["Immediate flow stoppage"],
            tradeoffs=["Escalation of maritime kinetic conflict"],
            time_horizon="14d",
            evidence_basis=[],
            risk_review=pending_review,
            fallback_option="Diplomatic mediation"
        )
    ]
    context = context_builder_agent.build_context("sess_test_risk", [])
    reviewed = strategy_risk_review_agent.review_strategies(draft, context)
    
    # Reviewer must have reviewed it (not PENDING)
    assert reviewed[0].risk_review.disposition != RiskReviewStatus.PENDING

    # Test that response composition agent enforces risk review status
    answer = response_composition_agent.compose_answer(
        question="Test Question",
        context=context,
        pathways=[],
        scenarios=[],
        strategies=reviewed
    )
    assert len(answer.strategy_recommendations) > 0
    assert answer.strategy_recommendations[0].risk_review_status != RiskReviewStatus.PENDING

def test_unavailable_model_resilient_fallback():
    # Force MODEL_PROVIDER to an unavailable remote endpoint
    settings.MODEL_PROVIDER = "remote_ollama_mock_down"
    req = QuestionIntakeRequest(
        session_id="test_sess_unavailable_llm",
        question="What could be the effects on India if crude oil prices spike?",
        geographies=["IND"]
    )
    # Process must not crash, but must fall back to deterministic extraction
    intent, entities = asyncio.run(question_understanding_agent.process(req))
    assert intent.confidence > 0.0
    assert any(e.canonical_id == "IND" for e in entities.entities)
    # Reset
    settings.MODEL_PROVIDER = "local_fallback"
