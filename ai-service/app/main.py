from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
from .core.config import settings
from .core.security import verify_internal_service_key
from .schemas.models import (
    QuestionIntakeRequest,
    PipelineExecutionResult
)
from .orchestration.pipeline import geosentinel_pipeline
from .connectors.registry import connector_registry

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GeoSentinel AI Multi-Agent Service & 12-Stage Question Pipeline"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """Base system health check probe."""
    return {
        "status": "UP",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model_provider": settings.MODEL_PROVIDER
    }

@app.get("/api/v1/connectors", tags=["Connectors"])
async def list_connectors() -> List[Dict[str, Any]]:
    """Lists registered public data connectors and their terms/health status."""
    connectors = connector_registry.list_all()
    return [
        {
            "id": c.connector_id,
            "category": c.category,
            "provider": c.provider_name,
            "status": c.status.value,
            "license": c.license_type,
            "termsUrl": c.terms_url
        }
        for c in connectors
    ]

@app.post("/api/v1/connectors/{connector_id}/health", tags=["Connectors"])
async def check_connector_health(connector_id: str) -> Dict[str, Any]:
    """Triggers an on-demand latency and schema health check for a connector."""
    conn = connector_registry.get_connector(connector_id)
    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Connector {connector_id} not found"
        )
    return await conn.check_health()

@app.post(
    "/api/v1/pipeline/execute",
    response_model=PipelineExecutionResult,
    tags=["Pipeline"],
    dependencies=[Depends(verify_internal_service_key)]
)
async def execute_analysis_pipeline(request: QuestionIntakeRequest) -> PipelineExecutionResult:
    """
    Executes the canonical 12-stage AI analysis pipeline.
    Internal endpoint called by Spring Boot backend.
    """
    try:
        return await geosentinel_pipeline.execute(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline execution failure: {str(e)}"
        )

# ==========================================
# Section 30 Distinctive Capabilities Routes
# ==========================================
from .evaluation.forecast_lab import forecast_lab
from .agents.geomemory import geomemory_service
from .agents.geolens import geolens_service
from .schemas.models import (
    ForecastEvaluationReport,
    ForecastPrediction,
    ForecastOutcome,
    GeoMemoryResult,
    GeoLensComparisonResult
)

@app.get("/api/v1/forecastlab/predictions", response_model=List[ForecastPrediction], tags=["ForecastLab"])
async def list_forecast_predictions():
    """Lists immutable historical prediction records (Section 30.5)."""
    return forecast_lab.list_predictions()

@app.get("/api/v1/forecastlab/outcomes", response_model=List[ForecastOutcome], tags=["ForecastLab"])
async def list_forecast_outcomes():
    """Lists adjudicated historical outcomes (Section 30.5)."""
    return forecast_lab.list_outcomes()

@app.post("/api/v1/forecastlab/evaluate", response_model=ForecastEvaluationReport, tags=["ForecastLab"])
async def run_forecastlab_evaluation(model_version: Optional[str] = None):
    """Executes Brier score, log loss, and calibration evaluation with temporal integrity checks."""
    try:
        return forecast_lab.run_evaluation(model_version=model_version)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.post("/api/v1/geomemory/search", response_model=GeoMemoryResult, tags=["GeoMemory"])
async def search_geomemory(payload: Dict[str, Any]):
    """Retrieves historical precedents, parallels, and limits of analogy (Section 30.7)."""
    query = payload.get("query", "")
    geographies = payload.get("geographies", [])
    cutoff = payload.get("temporal_cutoff")
    return geomemory_service.find_analogs(query=query, geographies=geographies, temporal_cutoff=cutoff)

@app.post("/api/v1/geolens/compare", response_model=GeoLensComparisonResult, tags=["GeoLens"])
async def compare_geolens(payload: Dict[str, Any]):
    """Performs cross-country and cross-sector impact profile comparison (Section 30.8)."""
    countries = payload.get("countries", ["IND", "IRN", "USA"])
    sectors = payload.get("sectors", ["energy", "trade", "macroeconomic", "maritime"])
    return geolens_service.compare_countries(countries=countries, sectors=sectors)

