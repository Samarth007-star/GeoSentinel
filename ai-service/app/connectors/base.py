import time
import hashlib
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import httpx
from ..schemas.models import ConnectorStatus, EvidenceRecord, VerificationState

class BaseConnector(ABC):
    def __init__(
        self,
        connector_id: str,
        category: str,
        provider_name: str,
        terms_url: str,
        license_type: str,
        timeout: float = 8.0
    ):
        self.connector_id = connector_id
        self.category = category
        self.provider_name = provider_name
        self.terms_url = terms_url
        self.license_type = license_type
        self.timeout = timeout
        self.status = ConnectorStatus.ACTIVE
        self.consecutive_failures = 0
        self.circuit_open_until = 0.0

    def is_available(self) -> bool:
        if self.status in [ConnectorStatus.DISABLED, ConnectorStatus.LICENSE_CHECK]:
            return False
        if time.time() < self.circuit_open_until:
            return False
        return True

    def record_success(self):
        self.consecutive_failures = 0
        if self.status == ConnectorStatus.RATE_LIMITED or self.status == ConnectorStatus.ERROR:
            self.status = ConnectorStatus.ACTIVE

    def record_failure(self):
        self.consecutive_failures += 1
        if self.consecutive_failures >= 5:
            self.status = ConnectorStatus.ERROR
            self.circuit_open_until = time.time() + 60.0  # Open circuit for 60 seconds

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Verify endpoint connectivity and schema responsiveness."""
        pass

    @abstractmethod
    async def fetch(self, target_entities: List[str], target_geographies: List[str]) -> List[Dict[str, Any]]:
        """Fetch raw records bounded by timeouts and quotas."""
        pass

    @abstractmethod
    def normalize(self, raw_records: List[Dict[str, Any]]) -> List[EvidenceRecord]:
        """Transform provider schema to canonical EvidenceRecord preserving provenance."""
        pass

    def compute_content_hash(self, content_str: str) -> str:
        return hashlib.sha256(content_str.encode('utf-8')).hexdigest()
