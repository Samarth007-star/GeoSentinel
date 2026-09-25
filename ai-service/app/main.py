from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
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
