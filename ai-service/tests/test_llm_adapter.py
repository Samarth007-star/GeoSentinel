import asyncio
import json
import pytest
from pydantic import BaseModel
from unittest.mock import patch, AsyncMock, MagicMock
import httpx
from app.core.llm_adapter import ModelAdapter, llm_adapter
from app.core.config import settings

class SampleSchema(BaseModel):
    intent: str
    confidence: float
    entities: list[str]

def test_llm_adapter_health_check_offline():
    async def _run():
        adapter = ModelAdapter()
        with patch("httpx.AsyncClient.get", AsyncMock(side_effect=httpx.ConnectError("Offline"))):
            health = await adapter.check_health()
            assert "status" in health
            assert "provider" in health
            assert health["provider"] == "ollama"
            assert health["active_model"] == "llama3"
    asyncio.run(_run())

def test_llm_adapter_deterministic_fallback():
    async def _run():
        adapter = ModelAdapter()
        with patch.object(settings, "MODEL_PROVIDER", "local_fallback"):
            fallback_called = False
            def sample_fallback():
                nonlocal fallback_called
                fallback_called = True
                return SampleSchema(intent="ENERGY_CRISIS", confidence=0.92, entities=["IND", "IRN"])

            res, meta = await adapter.generate_structured(
                "What happens if Strait of Hormuz is blocked?",
                SampleSchema,
                fallback_factory=sample_fallback
            )
            assert fallback_called is True
            assert res.intent == "ENERGY_CRISIS"
            assert res.confidence == 0.92
            assert meta["inference_mode"] == "deterministic_fallback"
            assert meta["model_name"] == "geocausal-deterministic-engine"
            assert "latency_ms" in meta
    asyncio.run(_run())

def test_llm_adapter_connection_error_fallback():
    async def _run():
        adapter = ModelAdapter()
        with patch.object(settings, "MODEL_PROVIDER", "ollama"):
            with patch("httpx.AsyncClient.post", AsyncMock(side_effect=httpx.ConnectError("Connection refused"))):
                def sample_fallback():
                    return SampleSchema(intent="LOGISTICS_DISRUPTION", confidence=0.88, entities=["SGP"])

                res, meta = await adapter.generate_structured(
                    "Simulate Singapore port delay",
                    SampleSchema,
                    fallback_factory=sample_fallback
                )
                assert res.intent == "LOGISTICS_DISRUPTION"
                assert meta["inference_mode"] == "deterministic_fallback"
                assert "unavailable" in meta["reason"] or "Connection" in meta["reason"] or "error" in meta["reason"]
    asyncio.run(_run())

def test_llm_adapter_successful_mock_inference():
    async def _run():
        adapter = ModelAdapter()
        mock_payload = {
            "model": "llama3:latest",
            "message": {
                "content": json.dumps({
                    "intent": "SANCTIONS_IMPACT",
                    "confidence": 0.95,
                    "entities": ["USA", "IRN"]
                })
            }
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_payload
        mock_response.raise_for_status.return_value = None

        with patch.object(settings, "MODEL_PROVIDER", "ollama"):
            with patch("httpx.AsyncClient.post", AsyncMock(return_value=mock_response)):
                res, meta = await adapter.generate_structured(
                    "Evaluate Iran sanctions",
                    SampleSchema,
                    fallback_factory=lambda: SampleSchema(intent="FALLBACK", confidence=0.1, entities=[])
                )
                assert res.intent == "SANCTIONS_IMPACT"
                assert res.confidence == 0.95
                assert res.entities == ["USA", "IRN"]
                assert meta["inference_mode"] == "local_llm"
                assert meta["model_name"] == "llama3"
    asyncio.run(_run())

def test_llm_adapter_schema_validation_failure_fallback():
    async def _run():
        adapter = ModelAdapter()
        mock_payload = {
            "model": "llama3",
            "message": {
                "content": json.dumps({"intent": "INVALID", "confidence": "not-a-number"})
            }
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_payload
        mock_response.raise_for_status.return_value = None

        with patch.object(settings, "MODEL_PROVIDER", "ollama"):
            with patch("httpx.AsyncClient.post", AsyncMock(return_value=mock_response)):
                res, meta = await adapter.generate_structured(
                    "Test malformed response",
                    SampleSchema,
                    fallback_factory=lambda: SampleSchema(intent="SAFE_RECOVERED", confidence=0.5, entities=["SEC"])
                )
                assert res.intent == "SAFE_RECOVERED"
                assert meta["inference_mode"] == "deterministic_fallback"
                assert "validation" in meta["reason"].lower()
    asyncio.run(_run())
