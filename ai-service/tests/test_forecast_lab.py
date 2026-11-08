import pytest
from app.evaluation.forecast_lab import ForecastLabService, forecast_lab
from app.schemas.models import ForecastPrediction, ForecastOutcome

def test_forecast_lab_ten_historical_cases_reproducibility():
    service = ForecastLabService()
    report = service.run_evaluation()

    assert report.predictions_count == 10
    assert report.outcomes_count == 10
    assert report.metrics.sample_size == 10

    # Mathematically exact reproduced metrics:
    assert report.metrics.brier_score == 0.0368
    assert report.metrics.log_loss == 0.2084
    assert report.metrics.calibration_error == 0.0910
    assert report.metrics.baseline_brier_comparison == 0.2500
    assert report.metrics.baseline_brier_historical == 0.2658
    assert report.temporal_leakage_checks_passed is True

def test_forecast_lab_temporal_integrity_no_future_leakage():
    service = ForecastLabService()
    predictions = {p.prediction_id: p for p in service.list_predictions()}
    outcomes = {o.prediction_id: o for o in service.list_outcomes()}

    for pid, pred in predictions.items():
        assert pid in outcomes, f"Prediction {pid} must have paired outcome"
        outcome = outcomes[pid]

        # Verification: observation_date must be chronologically AFTER cutoff_timestamp
        assert outcome.observation_date > pred.cutoff_timestamp, (
            f"Temporal violation: observation {outcome.observation_date} <= cutoff {pred.cutoff_timestamp}"
        )
        # Adjudication must specify source and empirical method
        assert len(outcome.adjudication_source) > 5
        assert len(outcome.adjudication_method) > 5

def test_forecast_lab_unadjudicated_exclusion():
    service = ForecastLabService()
    # Add a pending prospective prediction without an outcome
    unpaired_pred = ForecastPrediction(
        prediction_id="pred_prospective_001",
        target_event="Prospective forward-looking test event",
        time_horizon="30d",
        cutoff_timestamp="2026-11-08T00:00:00Z",
        predicted_probability=0.55,
        confidence_interval=[0.45, 0.65],
        model_version="geosentinel_geocausal_v1"
    )
    service.record_prediction(unpaired_pred)

    # Evaluation should evaluate ONLY paired (N=10) records
    report = service.run_evaluation()
    assert report.metrics.sample_size == 10
    assert report.predictions_count == 11
    assert report.outcomes_count == 10

