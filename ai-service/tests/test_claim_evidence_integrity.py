import pytest
from datetime import datetime, timezone
from app.schemas.models import (
    EvidenceRecord,
    VerificationState,
    StrategyOption,
    StrategyRiskReviewResult,
    RiskReviewStatus,
    ContextSnapshot
)
from app.verification.engine import EvidenceVerificationEngine
from app.agents.strategy_risk_review import StrategyRiskReviewAgent

def test_missing_evidence_metadata_rejection():
    """Verify that records with missing URL or title are immediately rejected."""
    now_iso = datetime.now(timezone.utc).isoformat()
    records = [
        EvidenceRecord(
            evidence_id="ev_bad_01",
            source_id="CONN_TEST",
            source_name="Test Source",
            source_url="",  # Missing URL
            title="Some title",
            claim_text="Unsubstantiated assertion",
            retrieved_at=now_iso,
            verification_status=VerificationState.UNVERIFIED
        ),
        EvidenceRecord(
            evidence_id="ev_bad_02",
            source_id="CONN_TEST",
            source_name="Test Source",
            source_url="https://example.org/doc",
            title="",  # Missing Title
            claim_text="Another assertion",
            retrieved_at=now_iso,
            verification_status=VerificationState.UNVERIFIED
        )
    ]

    verified = EvidenceVerificationEngine.verify_records(records)
    for rec in verified:
        assert rec.verification_status == VerificationState.REJECTED
        assert "Rejected" in rec.verification_rationale

def test_contradictory_sources_detection():
    """Verify opposing signals across sources for the same geography are tagged as CONFLICTING."""
    now_iso = datetime.now(timezone.utc).isoformat()
    rec_a = EvidenceRecord(
        evidence_id="ev_src_a",
        source_id="CONN_SOURCE_A",
        source_name="Source A",
        source_url="https://source-a.org/data",
        title="Energy Export Forecast",
        claim_text="Expect significant crude export increase and surplus across Persian Gulf corridors.",
        geography="IRN",
        retrieved_at=now_iso,
        verification_status=VerificationState.UNVERIFIED
    )
    rec_b = EvidenceRecord(
        evidence_id="ev_src_b",
        source_id="CONN_SOURCE_B",
        source_name="Source B",
        source_url="https://source-b.org/data",
        title="Sanctions Assessment",
        claim_text="Expect sharp crude export decrease and severe shipping contraction across Persian Gulf corridors.",
        geography="IRN",
        retrieved_at=now_iso,
        verification_status=VerificationState.UNVERIFIED
    )

    verified = EvidenceVerificationEngine.verify_records([rec_a, rec_b])
    assert verified[0].verification_status == VerificationState.CONFLICTING
    assert verified[1].verification_status == VerificationState.CONFLICTING
    assert "ev_src_b" in verified[0].contradiction_ids
    assert "ev_src_a" in verified[1].contradiction_ids

def test_strategy_risk_gate_unbypasable():
    """Verify that the independent Strategy Risk Review Gate evaluates every proposed strategy."""
    agent = StrategyRiskReviewAgent()

    initial_review = StrategyRiskReviewResult(
        review_id="rev_pending",
        reviewer="Pending",
        disposition=RiskReviewStatus.PENDING,
        findings="Pending review",
        unintended_consequences=[],
        second_order_harms=[],
        escalation_risks=[],
        affected_vulnerable_groups=[],
        required_mitigations=[],
        residual_risk_disclosure="Pending final evaluation"
    )

    strategy = StrategyOption(
        option_id="opt_spr_01",
        title="Strategic Petroleum Reserve (SPR) emergency commercial release",
        objective="Mitigate domestic refined product shortages",
        causal_mechanism="Release crude oil reserves into domestic refineries to offset shipping interdiction",
        prerequisites=["Cabinet committee approval", "ISPRL valve readiness"],
        benefits=["Stabilizes fuel prices", "Prevents power grid brownouts"],
        tradeoffs=["Depletes sovereign emergency cushion", "Fiscal subsidy cost"],
        time_horizon="30d",
        evidence_basis=["ev_wb_ind_energy_2026"],
        risk_review=initial_review,
        fallback_option="Spot market crude procurement via alternative sea lanes"
    )

    dummy_context = ContextSnapshot(
        session_id="ses_test_01",
        snapshot_id="snap_01",
        temporal_window="30d",
        geographies=["IND", "IRN"],
        focal_entities=["IND_ENERGY"],
        key_facts=["Crude import dependency > 80%"],
        uncertainties=["Naval blockade duration"]
    )

    reviewed = agent.review_strategies([strategy], dummy_context)
    assert len(reviewed) == 1
    review = reviewed[0].risk_review
    assert review is not None
    assert review.reviewer == "GeoSentinel_IndependentRedTeam_v1.0"
    assert review.disposition in [RiskReviewStatus.APPROVED_WITH_LIMITATIONS, RiskReviewStatus.REJECTED, RiskReviewStatus.REQUIRES_REVISION]
    assert len(review.unintended_consequences) > 0
    assert len(review.second_order_harms) > 0
    assert len(review.affected_vulnerable_groups) > 0

def test_historical_economic_indicator_fidelity():
    """Verify that economic and multilateral data preserve indicator year and do not fabricate current-second tick precision."""
    from app.connectors.world_bank import WorldBankConnector
    conn = WorldBankConnector()
    sample_raw = [
        {
            "geo": "IND",
            "country_name": "India",
            "indicator_code": "NY.GDP.MKTP.KD.ZG",
            "indicator_name": "GDP growth (annual %)",
            "year": "2023",
            "value": 7.24,
            "url": "https://api.worldbank.org/v2/country/IND/indicator/NY.GDP.MKTP.KD.ZG"
        }
    ]
    norm = conn.normalize(sample_raw)
    assert len(norm) == 1
    assert "2023" in norm[0].title
    assert "2023" in norm[0].claim_text
    assert norm[0].published_at.startswith("2023")
    assert norm[0].verification_status == VerificationState.VERIFIED
