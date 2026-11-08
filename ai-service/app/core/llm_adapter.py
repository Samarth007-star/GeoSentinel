import json
import logging
from typing import Type, TypeVar, Any, Optional, Dict, Tuple
import httpx
from pydantic import BaseModel, ValidationError
from .config import settings

logger = logging.getLogger("geosentinel.llm_adapter")
T = TypeVar("T", bound=BaseModel)

class InferenceResult(BaseModel):
    data: Any
    inference_mode: str  # "local_llm" or "deterministic_fallback"
    model_name: str
    model_version: Optional[str] = None
    execution_latency_ms: float
    fallback_reason: Optional[str] = None

class ModelAdapter:
    """
    Adapter to communicate with local LLM runners (Ollama / Local OpenAI-compatible)
    with strict schema validation, timeout protection, malformed response handling,
    and transparent deterministic fallback labelling.
    """

    def __init__(self):
        self.base_url = settings.LOCAL_MODEL_BASE_URL.rstrip("/")
        self.model_name = os_model = getattr(settings, "LOCAL_MODEL_NAME", "llama3")
        self.timeout_seconds = getattr(settings, "LOCAL_MODEL_TIMEOUT", 10.0)

    async def check_health(self) -> Dict[str, Any]:
        """
        Probes the local model runner endpoint for availability, version, and loaded models.
        """
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/version")
                if res.status_code == 200:
                    ver_data = res.json()
                    tags_res = await client.get(f"{self.base_url}/api/tags")
                    models = []
                    if tags_res.status_code == 200:
                        models = [m.get("name") for m in tags_res.json().get("models", [])]
                    return {
                        "status": "UP",
                        "provider": "ollama",
                        "version": ver_data.get("version", "unknown"),
                        "available_models": models,
                        "active_model": self.model_name,
                        "endpoint": self.base_url
                    }
        except Exception as e:
            logger.debug(f"Local LLM runner probe failed at {self.base_url}: {e}")

        return {
            "status": "UNAVAILABLE",
            "provider": "ollama",
            "version": None,
            "available_models": [],
            "active_model": self.model_name,
            "endpoint": self.base_url,
            "error": "Connection refused or server dormant"
        }

    async def generate_structured(
        self,
        prompt: str,
        schema: Type[T],
        fallback_factory: Optional[callable] = None
    ) -> Tuple[T, Dict[str, Any]]:
        """
        Attempts structured JSON generation via local LLM. If the model is unavailable,
        times out (>10s), returns malformed JSON, or schema validation fails, it
        transparently invokes the fallback_factory with an explicitly labelled audit trail.
        """
        import time
        start_time = time.time()
        schema_json = schema.model_json_schema()

        # If configured for explicit local fallback, skip remote call
        if settings.MODEL_PROVIDER == "local_fallback":
            latency = (time.time() - start_time) * 1000
            if fallback_factory:
                fallback_data = fallback_factory()
                return fallback_data, {
                    "inference_mode": "deterministic_fallback",
                    "model_name": "geocausal-deterministic-engine",
                    "latency_ms": round(latency, 2),
                    "reason": "MODEL_PROVIDER set to local_fallback by operational configuration"
                }
            raise RuntimeError("MODEL_PROVIDER=local_fallback and no fallback_factory provided")

        system_prompt = (
            "You are a geopolitical intelligence AI. "
            "You must output your response EXACTLY as a valid JSON object matching this schema:\n"
            f"{json.dumps(schema_json, indent=2)}\n\n"
            "Do not output markdown code blocks (```json), do not output explanatory text, ONLY raw valid JSON."
        )

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.1
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
                response.raise_for_status()
                data = response.json()
                raw_content = data.get("message", {}).get("content", "{}")

                # Parse and validate with Pydantic schema
                validated_obj = schema.model_validate_json(raw_content)
                latency = (time.time() - start_time) * 1000

                return validated_obj, {
                    "inference_mode": "local_llm",
                    "model_name": self.model_name,
                    "model_version": data.get("model", self.model_name),
                    "latency_ms": round(latency, 2),
                    "reason": None
                }

        except httpx.TimeoutException:
            reason = f"Local LLM timed out after {self.timeout_seconds}s"
            logger.warning(reason)
        except httpx.ConnectError:
            reason = f"Local LLM service unavailable at {self.base_url}"
            logger.warning(reason)
        except ValidationError as ve:
            reason = f"Local LLM output failed schema validation: {ve}"
            logger.warning(reason)
        except Exception as e:
            reason = f"Local LLM inference error: {e}"
            logger.warning(reason)

        # Fallback path
        latency = (time.time() - start_time) * 1000
        if fallback_factory:
            fallback_data = fallback_factory()
            return fallback_data, {
                "inference_mode": "deterministic_fallback",
                "model_name": "geocausal-deterministic-engine",
                "latency_ms": round(latency, 2),
                "reason": reason
            }

        raise RuntimeError(f"Local LLM failed and no fallback available: {reason}")

llm_adapter = ModelAdapter()
