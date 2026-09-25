import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "GeoSentinel AI Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Internal Communication Security
    INTERNAL_SERVICE_KEY: str = os.getenv("INTERNAL_SERVICE_KEY", "geosentinel-internal-secret-token-2026")
    
    # Model Configuration
    MODEL_PROVIDER: str = os.getenv("MODEL_PROVIDER", "local_fallback")
    LOCAL_MODEL_BASE_URL: str = os.getenv("LOCAL_MODEL_BASE_URL", "http://localhost:11434")
    
    # Data Connector Endpoints
    WORLD_BANK_BASE_URL: str = os.getenv("WORLD_BANK_BASE_URL", "https://api.worldbank.org/v2")
    USGS_BASE_URL: str = os.getenv("USGS_BASE_URL", "https://earthquake.usgs.gov/fdsnws/event/1")
    NASA_EONET_BASE_URL: str = os.getenv("NASA_EONET_BASE_URL", "https://eonet.gsfc.nasa.gov/api/v3")
    GDELT_BASE_URL: str = os.getenv("GDELT_BASE_URL", "https://api.gdeltproject.org/api/v2")
    OONI_BASE_URL: str = os.getenv("OONI_BASE_URL", "https://api.ooni.io/api/v1")
    RELIEFWEB_BASE_URL: str = os.getenv("RELIEFWEB_BASE_URL", "https://api.reliefweb.int/v1")
    
    # Limits & Timeouts
    CONNECTOR_TIMEOUT_SECONDS: int = 8
    MAX_CONNECTOR_RETRIES: int = 3
    SESSION_TTL_MINUTES: int = 120

settings = Settings()
