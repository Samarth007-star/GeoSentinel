import pytest
from app.evaluation.forecast_lab import ForecastLabService
from app.schemas.models import ForecastPrediction, ForecastOutcome
from app.agents.geomemory import GeoMemoryService
from app.agents.geolens import GeoLensService

def test_forecast_lab_evaluation_metrics():
    lab = ForecastLabService()
    report = lab.run_evaluation()

    assert report.evaluation_run_id.startswith("eval_")
    assert report.temporal_leakage_checks_passed is True
    assert report.metrics.sample_size >= 3
    assert 0.0 <= report.metrics.brier_score <= 1.0
    assert report.metrics.brier_score < report.metrics.baseline_brier_comparison, (
        "Model Brier score should outperform uninformative baseline (0.25)"
    )
    assert report.metrics.log_loss >= 0.0

def test_forecast_lab_temporal_integrity():
    lab = ForecastLabService()
    # Adding a future outcome after prediction
    pred = ForecastPrediction(
        prediction_id="pred_test_temporal",
        target_event="Sanctions imposition on energy exports",
        time_horizon="60d",
        cutoff_timestamp="2024-03-01T00:00:00Z",
        predicted_probability=0.65,
        confidence_interval=[0.55, 0.75],
        model_version="geosentinel_geocausal_v1"
    )
    out = ForecastOutcome(
        outcome_id="out_test_temporal",
        prediction_id="pred_test_temporal",
        actual_occurrence=True,
        observation_date="2024-04-20T00:00:00Z",
        adjudication_source="Official Journal of the European Union",
        adjudication_method="Regulatory Gazette Publication"
    )
    lab.record_prediction(pred)
    lab.record_outcome(out)

    report = lab.run_evaluation()
    assert report.predictions_count >= 4
    assert report.outcomes_count >= 4

def test_geomemory_analogs_and_limits_of_analogy():
    mem = GeoMemoryService()
    result = mem.find_analogs(
        query="What could be the impact on maritime shipping and energy in the Strait of Hormuz?",
        geographies=["IRN", "IND", "USA"]
    )

    assert len(result.retrieved_cases) > 0
    top_case = result.retrieved_cases[0]
    assert top_case.similarity_score > 0.5
    assert len(top_case.key_parallels) > 0
    assert len(top_case.limits_of_analogy) > 0, "Limits of analogy must be explicitly articulated"
    assert len(result.memory_limitations) > 0

def test_geolens_comparative_profiles():
    lens = GeoLensService()
    result = lens.compare_countries(
        countries=["IND", "IRN", "USA"],
        sectors=["energy", "macroeconomic", "maritime"]
    )

    assert result.comparison_id.startswith("lens_")
    assert len(result.profiles) == 3
    
    ind_profile = next(p for p in result.profiles if p.country_code == "IND")
    assert ind_profile.country_name == "India"
    assert len(ind_profile.metrics) > 0
    assert len(ind_profile.vulnerabilities) > 0
    assert len(ind_profile.strengths) > 0

    assert len(result.cross_cutting_findings) > 0
    assert len(result.data_gaps_and_limitations) > 0
