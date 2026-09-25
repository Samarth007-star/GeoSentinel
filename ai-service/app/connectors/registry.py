from typing import Dict, List, Optional
from .base import BaseConnector
from .world_bank import WorldBankConnector
from .usgs import UsgsConnector
from .nasa_eonet import NasaEonetConnector
from .reliefweb import ReliefWebConnector

class ConnectorRegistry:
    def __init__(self):
        self._connectors: Dict[str, BaseConnector] = {}
        # Register core free public connectors
        self.register(WorldBankConnector())
        self.register(UsgsConnector())
        self.register(NasaEonetConnector())
        self.register(ReliefWebConnector())

    def register(self, connector: BaseConnector):
        self._connectors[connector.connector_id] = connector

    def get_connector(self, connector_id: str) -> Optional[BaseConnector]:
        return self._connectors.get(connector_id)

    def list_all(self) -> List[BaseConnector]:
        return list(self._connectors.values())

    def get_eligible(self, categories: Optional[List[str]] = None) -> List[BaseConnector]:
        eligible = [c for c in self._connectors.values() if c.is_available()]
        if categories:
            norm_cats = [c.lower() for c in categories]
            eligible = [c for c in eligible if c.category.lower() in norm_cats or any(nc in c.category.lower() for nc in norm_cats)]
        return eligible

connector_registry = ConnectorRegistry()
