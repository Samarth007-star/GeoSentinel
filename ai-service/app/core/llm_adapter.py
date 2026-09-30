import json
import httpx
from typing import Type, TypeVar, Any
from pydantic import BaseModel
from .config import settings

T = TypeVar("T", bound=BaseModel)

class ModelAdapter:
    """
    Adapter to communicate with the Local Ollama API and parse responses into Pydantic models.
    """
    
    def __init__(self):
        self.base_url = settings.LOCAL_MODEL_BASE_URL
        self.model_name = "llama3" # Default, can be overridden or loaded from env
        
    async def generate_structured(self, prompt: str, schema: Type[T]) -> T:
        """
        Sends a prompt to Ollama, enforcing JSON output matching the Pydantic schema.
        """
        schema_json = schema.model_json_schema()
        
        system_prompt = (
            "You are a geopolitical intelligence AI. "
            "You must output your response EXACTLY as a valid JSON object matching this schema:\n"
            f"{json.dumps(schema_json, indent=2)}\n\n"
            "Do not output markdown formatting, do not output explanations, ONLY output the JSON."
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
                "temperature": 0.1 # Keep it deterministic for pipelines
            }
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
                response.raise_for_status()
                data = response.json()
                content = data.get("message", {}).get("content", "{}")
                return schema.model_validate_json(content)
            except Exception as e:
                print(f"LLM Error: {e}")
                raise e

llm_adapter = ModelAdapter()
