from typing import Dict, List, Optional
from .base import BaseConnector
from .world_bank import WorldBankConnector
from .usgs import UsgsConnector
from .nasa_eonet import NasaEonetConnector
from .reliefweb import ReliefWebConnector
from .usaspending import UsaSpendingConnector
from .un_sdg import UnSdgConnector
from .news import NewsFeedConnector
from .nominatim import NominatimConnector
from .wikimedia import WikimediaSignalsConnector
from .gdelt_events import GdeltEventsConnector

class ConnectorRegistry:
    def __init__(self):
        self._connectors: Dict[str, BaseConnector] = {}
        # 1. Government Open Data
        self.register(UsaSpendingConnector())
        # 2. International Organizations
        self.register(UnSdgConnector())
        self.register(ReliefWebConnector())
        # 3. Economic & Financial Data
        self.register(WorldBankConnector())
        # 4. News Sources
        self.register(NewsFeedConnector())
        # 5. Scientific & Disaster Data
        self.register(UsgsConnector())
        self.register(NasaEonetConnector())
        # 6. Geographic Data
        self.register(NominatimConnector())
        # 7. Public Social Signals
        self.register(WikimediaSignalsConnector())
        # 8. Conflict & Political Events
        self.register(GdeltEventsConnector())

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
