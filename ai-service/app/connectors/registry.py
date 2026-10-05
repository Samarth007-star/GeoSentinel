from typing import Dict, List, Optional
from .base import BaseConnector
from .world_bank import WorldBankConnector
from .usgs import UsgsConnector
from .nasa_eonet import NasaEonetConnector
from .reliefweb import ReliefWebConnector
from .gdelt import GdeltConnector
from .ooni import OoniConnector
from .ioda import IodaConnector
from .wikidata import WikidataConnector
from .wikimedia import WikimediaPageviewsConnector
from .usaspending import UsaSpendingConnector
from .un_sdg import UnSdgConnector
from .news import NewsFeedConnector
from .nominatim import NominatimConnector

class ConnectorRegistry:
    def __init__(self):
        self._connectors: Dict[str, BaseConnector] = {}
        # Core & Phase 1 Connectors
        # 1. International Organizations
        self.register(ReliefWebConnector())
        self.register(UnSdgConnector())
        # 2. News Intelligence
        self.register(GdeltConnector())
        self.register(NewsFeedConnector())
        # 3. Internet & Infrastructure Outages & Censorship
        self.register(OoniConnector())
        self.register(IodaConnector())
        # 4. Geographic & Entities
        self.register(WikidataConnector())
        self.register(NominatimConnector())
        # 5. Public Social & Digital Signals (Digital Attention)
        self.register(WikimediaPageviewsConnector())
        # 6. Economic & Financial Data
        self.register(WorldBankConnector())
        # 7. Scientific & Disaster Telemetry
        self.register(UsgsConnector())
        self.register(NasaEonetConnector())
        # 8. Government Open Data
        self.register(UsaSpendingConnector())

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
            def matches(conn_cat: str) -> bool:
                cc = conn_cat.lower()
                return any(nc in cc or cc in nc for nc in norm_cats)
            eligible = [c for c in eligible if matches(c.category)]
        return eligible

connector_registry = ConnectorRegistry()
