import pytest
import time
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, patch, MagicMock
import httpx

from app.connectors.registry import connector_registry
from app.connectors.reliefweb import ReliefWebConnector
from app.connectors.gdelt import GdeltConnector
from app.connectors.ooni import OoniConnector
from app.connectors.ioda import IodaConnector
from app.connectors.wikidata import WikidataConnector
from app.connectors.wikimedia import WikimediaPageviewsConnector
from app.dataset_builder.builder import DatasetBuilder
from app.schemas.models import (
    RetrievalPlan,
    QuestionIntakeRequest,
    IntentOutput,
    IntentCategory,
    EntityExtractionOutput,
    ExtractedEntity,
    EntityType,
    ConnectorStatus,
    VerificationState
)
from app.agents.retrieval_planning import retrieval_planning_agent


# ============================================================================
# 1. RELIEFWEB UNIT TESTS
# ============================================================================

def test_reliefweb_configuration_and_missing_credential():
    """Verify ReliefWeb reports CREDENTIAL_MISSING when RELIEFWEB_APPNAME is blank."""
    with patch("app.connectors.reliefweb.settings") as mock_settings:
        mock_settings.RELIEFWEB_BASE_URL = "https://api.reliefweb.int/v2"
        mock_settings.RELIEFWEB_APPNAME = ""
        mock_settings.CONNECTOR_TIMEOUT_SECONDS = 8
        conn = ReliefWebConnector()
        assert conn.is_available() is False
        assert conn.appname == ""


@pytest.mark.anyio
async def test_reliefweb_health_check_missing_credential():
    with patch("app.connectors.reliefweb.settings") as mock_settings:
        mock_settings.RELIEFWEB_BASE_URL = "https://api.reliefweb.int/v2"
        mock_settings.RELIEFWEB_APPNAME = ""
        mock_settings.CONNECTOR_TIMEOUT_SECONDS = 8
        conn = ReliefWebConnector()
        res = await conn.check_health()
        assert res["status"] == "CREDENTIAL_MISSING"
        assert "RELIEFWEB_APPNAME is not configured" in res["message"]


def test_reliefweb_normalization():
    conn = ReliefWebConnector()
    raw = [{
        "id": "123456",
        "title": "Middle East Crisis: Situation Report No. 12",
        "body": "Humanitarian operations continue across affected border corridors.",
        "date": "2026-10-01T10:00:00+00:00",
        "url": "https://reliefweb.int/report/123456",
        "country": "Iran",
        "source": "UN OCHA"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_RELIEFWEB"
    assert rec.evidence_id == "ev_rw_123456"
    assert rec.geography == "Iran"
    assert rec.data_origin == "LIVE"
    assert "UN OCHA" in rec.attribution
    assert len(rec.content_hash) >= 32


def test_reliefweb_empty_and_malformed():
    conn = ReliefWebConnector()
    assert conn.normalize([]) == []
    assert conn.normalize([{"invalid_field": 123}]) == []


# ============================================================================
# 2. GDELT UNIT TESTS
# ============================================================================

def test_gdelt_initialization():
    conn = GdeltConnector()
    assert conn.connector_id == "CONN_GDELT"
    assert conn.category == "News"
    assert conn.auth_type == "None (Public API)"


def test_gdelt_normalization():
    conn = GdeltConnector()
    raw = [{
        "url": "https://www.reuters.com/world/india-iran-trade-2026",
        "title": "India Explores Strategic Energy Options Amid Gulf Maritime Tensions",
        "seendate": "20261002T120000Z",
        "domain": "reuters.com",
        "language": "English",
        "sourcecountry": "India",
        "query_used": "India Iran oil"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_GDELT"
    assert rec.data_origin == "LIVE"
    assert "reuters.com" in rec.attribution
    assert rec.evidence_type == "news_report"
    assert rec.content_hash != ""


def test_gdelt_empty_and_invalid():
    conn = GdeltConnector()
    assert conn.normalize([]) == []
    # Missing title and url
    assert conn.normalize([{"seendate": "20261002T000000Z"}]) == []


# ============================================================================
# 3. OONI UNIT TESTS
# ============================================================================

def test_ooni_country_resolution():
    conn = OoniConnector()
    assert conn._resolve_country_code(["IND"]) == "IN"
    assert conn._resolve_country_code(["IRN"]) == "IR"
    assert conn._resolve_country_code(["USA"]) == "US"
    assert conn._resolve_country_code(["RU"]) == "RU"


def test_ooni_normalization():
    conn = OoniConnector()
    raw = [{
        "measurement_uid": "msmt-ooni-test-999",
        "probe_cc": "IR",
        "probe_asn": "AS58224",
        "measurement_start_time": "2026-10-02 08:30:00",
        "test_name": "web_connectivity",
        "input": "https://www.bbc.com",
        "anomaly": True,
        "confirmed": True,
        "failure": None
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_OONI"
    assert rec.data_origin == "LIVE"
    assert rec.geography == "IR"
    assert rec.evidence_type == "network_measurement"
    assert "web_connectivity" in rec.title
    assert "Censorship Anomaly Detected" in rec.claim_text


def test_ooni_empty_normalization():
    conn = OoniConnector()
    assert conn.normalize([]) == []


# ============================================================================
# 4. IODA UNIT TESTS
# ============================================================================

def test_ioda_normalization_distinguishes_live_vs_historical():
    conn = IodaConnector()
    now = int(time.time())
    
    # Record from 1 hour ago -> LIVE
    recent_raw = {
        "event_id": "ioda_ev_recent",
        "entity_type": "country",
        "entity_code": "IR",
        "start": now - 3600,
        "stop": now,
        "score": 0.85,
        "source": "bgp"
    }
    # Record from 5 days ago -> HISTORICAL
    old_raw = {
        "event_id": "ioda_ev_old",
        "entity_type": "country",
        "entity_code": "IR",
        "start": now - (5 * 86400),
        "stop": now - (4 * 86400),
        "score": 0.40,
        "source": "active_ping"
    }

    records = conn.normalize([recent_raw, old_raw])
    assert len(records) == 2
    assert records[0].data_origin == "LIVE"
    assert records[1].data_origin == "HISTORICAL"
    assert records[0].evidence_type == "infrastructure_outage_signal"


def test_ioda_empty_records():
    conn = IodaConnector()
    assert conn.normalize([]) == []


# ============================================================================
# 5. WIKIDATA UNIT TESTS
# ============================================================================

def test_wikidata_normalization():
    conn = WikidataConnector()
    raw = [{
        "item": "http://www.wikidata.org/entity/Q668",
        "itemLabel": "India",
        "itemDescription": "country in South Asia",
        "instanceOfLabel": "sovereign state",
        "search_term": "India"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_WIKIDATA"
    assert rec.data_origin == "LIVE"
    assert rec.evidence_type == "entity_knowledge_graph"
    assert "Q668" in rec.evidence_id
    assert "India" in rec.title


def test_wikidata_empty_and_malformed():
    conn = WikidataConnector()
    assert conn.normalize([]) == []
    # Missing required keys
    assert conn.normalize([{"unrelated": 42}]) == []


# ============================================================================
# 6. WIKIMEDIA PAGEVIEWS UNIT TESTS
# ============================================================================

def test_wikimedia_normalization_and_semantics():
    conn = WikimediaPageviewsConnector()
    raw = [{
        "project": "en.wikipedia",
        "article": "India",
        "granularity": "daily",
        "timestamp": "2026100100",
        "views": 45200,
        "url": "https://en.wikipedia.org/wiki/India"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_WIKIMEDIA"
    assert rec.data_origin == "LIVE"
    assert rec.evidence_type == "digital_attention_signal"
    # Verify non-social-media semantics
    assert "does not measure emotional sentiment or public approval" in rec.limitations
    assert "45,200 views" in rec.claim_text


def test_wikimedia_empty():
    conn = WikimediaPageviewsConnector()
    assert conn.normalize([]) == []


# ============================================================================
# 7. CONNECTOR REGISTRY TESTS
# ============================================================================

def test_registry_contains_all_six_connectors():
    expected_ids = [
        "CONN_RELIEFWEB",
        "CONN_GDELT",
        "CONN_OONI",
        "CONN_IODA",
        "CONN_WIKIDATA",
        "CONN_WIKIMEDIA"
    ]
    all_connectors = connector_registry.list_all()
    registered_ids = [c.connector_id for c in all_connectors]

    for eid in expected_ids:
        assert eid in registered_ids, f"Connector {eid} not found in registry"
        conn = connector_registry.get_connector(eid)
        assert conn is not None
        assert conn.category != ""
        assert conn.provider_name != ""
        assert conn.license_type != ""


def test_registry_category_filtering():
    # News category
    news_conns = connector_registry.get_eligible(["News"])
    news_ids = [c.connector_id for c in news_conns]
    assert "CONN_GDELT" in news_ids

    # Internet & Infrastructure category
    infra_conns = connector_registry.get_eligible(["Internet & Infrastructure"])
    infra_ids = [c.connector_id for c in infra_conns]
    assert "CONN_OONI" in infra_ids
    assert "CONN_IODA" in infra_ids

    # Geographic & Entities category
    entity_conns = connector_registry.get_eligible(["Geographic & Entities"])
    entity_ids = [c.connector_id for c in entity_conns]
    assert "CONN_WIKIDATA" in entity_ids

    # Public Social/Digital Signals category
    sig_conns = connector_registry.get_eligible(["Public Social/Digital Signals"])
    sig_ids = [c.connector_id for c in sig_conns]
    assert "CONN_WIKIMEDIA" in sig_ids


# ============================================================================
# 8. RETRIEVAL PLANNING & DATASET BUILDER INTEGRATION
# ============================================================================

def test_retrieval_plan_dynamic_category_selection():
    agent = retrieval_planning_agent

    # Test 2: Internet disruption question
    req_net = QuestionIntakeRequest(
        session_id="s1",
        question="Are there recent internet connectivity disruptions relevant to Iran or the Middle East?",
        geographies=["IRN"]
    )
    plan_net = agent.create_plan(
        req_net,
        IntentOutput(primary_intent=IntentCategory.INFRASTRUCTURE_OUTAGE, confidence=0.9, requires_geocausal=False, requires_strategy=False, intent_rationale=""),
        EntityExtractionOutput(entities=[ExtractedEntity(name="Iran", entity_type=EntityType.COUNTRY, canonical_id="IRN")])
    )
    assert any("Internet & Infrastructure" in c for c in plan_net.candidate_connectors)

    # Test 4: Digital attention question
    req_att = QuestionIntakeRequest(
        session_id="s2",
        question="Has public digital attention to Iran increased recently?",
        geographies=["IRN"]
    )
    plan_att = agent.create_plan(
        req_att,
        IntentOutput(primary_intent=IntentCategory.EVENT_LOOKUP, confidence=0.9, requires_geocausal=False, requires_strategy=False, intent_rationale=""),
        EntityExtractionOutput(entities=[ExtractedEntity(name="Iran", entity_type=EntityType.COUNTRY, canonical_id="IRN")])
    )
    assert "Public Social/Digital Signals" in plan_att.candidate_connectors

    # Test 5: Structured information question
    req_ent = QuestionIntakeRequest(
        session_id="s3",
        question="Give me structured information about India, Iran and their relevant organizations/entities.",
        geographies=["IND", "IRN"]
    )
    plan_ent = agent.create_plan(
        req_ent,
        IntentOutput(primary_intent=IntentCategory.EVENT_LOOKUP, confidence=0.9, requires_geocausal=False, requires_strategy=False, intent_rationale=""),
        EntityExtractionOutput(entities=[ExtractedEntity(name="India", entity_type=EntityType.COUNTRY, canonical_id="IND")])
    )
    assert "Geographic & Entities" in plan_ent.candidate_connectors


@pytest.mark.anyio
async def test_dataset_builder_fallback_origin_reference():
    """Verify that when live connectors return 0 records, fallback evidence is marked REFERENCE."""
    builder = DatasetBuilder()
    plan = RetrievalPlan(
        plan_id="plan_empty_test",
        target_entities=["UnknownNonExistentEntity"],
        target_geographies=["IND"],
        time_horizon="30d",
        candidate_connectors=["NonExistentCategory"]
    )
    records = await builder.build_dataset(plan)
    assert len(records) > 0
    for rec in records:
        assert rec.data_origin == "REFERENCE"
