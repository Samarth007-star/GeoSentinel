from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from .config import settings

api_key_header = APIKeyHeader(name="X-Internal-Service-Key", auto_error=False)

def verify_internal_service_key(key: str = Security(api_key_header)):
    """
    Ensure the caller possesses the shared internal service token.
    Allows local development bypass if explicitly configured.
    """
    if not key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing required X-Internal-Service-Key header"
        )
    if key != settings.INTERNAL_SERVICE_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid internal service key"
        )
    return key
