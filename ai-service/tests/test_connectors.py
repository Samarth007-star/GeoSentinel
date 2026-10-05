import pytest
import time
from app.connectors.registry import connector_registry
from app.connectors.base import BaseConnector
from app.connectors.world_bank import WorldBankConnector
from app.connectors.usgs import UsgsConnector
from app.connectors.nasa_eonet import NasaEonetConnector
from app.connectors.reliefweb import ReliefWebConnector
from app.dataset_builder.builder import DatasetBuilder
from app.verification.engine import EvidenceVerificationEngine
from app.schemas.models import ConnectorStatus, RetrievalPlan, EvidenceRecord, VerificationState

def test_connector_registry_and_licensing():
    connectors = connector_registry.list_all()
    assert len(connectors) >= 4

    for conn in connectors:
        assert conn.connector_id.startswith("CONN_")
        assert len(conn.provider_name) > 0
        assert conn.terms_url.startswith("http")
        assert len(conn.license_type) > 0
        if conn.connector_id == "CONN_RELIEFWEB" and not getattr(conn, "appname", None):
            assert conn.is_available() is False
        else:
            assert conn.is_available() is True

def test_base_connector_content_hash():
    conn = connector_registry.get_connector("CONN_WORLDBANK")
    assert conn is not None
    h1 = conn.compute_content_hash("data_payload_1")
    h2 = conn.compute_content_hash("data_payload_1")
    h3 = conn.compute_content_hash("data_payload_2")
    assert h1 == h2
    assert h1 != h3

def test_circuit_breaker_and_failure_handling():
    conn = WorldBankConnector()
    assert conn.is_available() is True
    assert conn.consecutive_failures == 0

    # Record 4 failures: should remain active
    for _ in range(4):
        conn.record_failure()
    assert conn.consecutive_failures == 4
    assert conn.status == ConnectorStatus.ACTIVE
    assert conn.is_available() is True

    # 5th failure trips the circuit breaker
    conn.record_failure()
    assert conn.consecutive_failures == 5
    assert conn.status == ConnectorStatus.ERROR
    assert conn.circuit_open_until > time.time()
    assert conn.is_available() is False

    # Success resets consecutive failures and clears error
    conn.record_success()
    assert conn.consecutive_failures == 0
    assert conn.status == ConnectorStatus.ACTIVE

def test_connector_disabled_status():
    conn = UsgsConnector()
    conn.status = ConnectorStatus.DISABLED
    assert conn.is_available() is False

    conn.status = ConnectorStatus.LICENSE_CHECK
    assert conn.is_available() is False

def test_world_bank_normalization():
    conn = WorldBankConnector()
    raw = [{
        "geo": "IND",
        "country_name": "India",
        "indicator_code": "NY.GDP.MKTP.KD.ZG",
        "indicator_name": "GDP Growth (annual %)",
        "year": "2024",
        "value": 7.2,
        "url": "https://api.worldbank.org/test"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_WORLDBANK"
    assert rec.geography == "IND"
    assert rec.evidence_type == "economic_indicator"
    assert rec.verification_status == VerificationState.VERIFIED
    assert len(rec.content_hash) == 64

def test_usgs_normalization():
    conn = UsgsConnector()
    raw = [{
        "event_id": "us7000test",
        "title": "M 5.8 - 45 km E of Hualien City, Taiwan",
        "mag": 5.8,
        "place": "Taiwan",
        "time_ms": 1712100000000,
        "url": "https://earthquake.usgs.gov/earthquakes/eventpage/us7000test",
        "coordinates": [121.5, 23.9, 10.0]
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_USGS"
    assert "magnitude 5.8" in rec.claim_text
    assert rec.evidence_type == "geophysical_event"
    assert rec.verification_status == VerificationState.VERIFIED

def test_nasa_eonet_normalization():
    conn = NasaEonetConnector()
    raw = [{
        "id": "EONET_6000",
        "title": "Wildfire - North Pacific Rim",
        "categories": ["Wildfires"],
        "sources": ["https://inciweb.wildfire.gov/test"],
        "geometries": []
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_NASA_EONET"
    assert rec.evidence_type == "satellite_disaster_signal"
    assert rec.verification_status == VerificationState.VERIFIED

def test_reliefweb_normalization():
    conn = ReliefWebConnector()
    raw = [{
        "id": 4012345,
        "title": "Horn of Africa: Food Security Outlook Update",
        "body": "Ongoing drought has impacted agricultural production across regions.",
        "date": "2026-03-01T00:00:00+00:00",
        "url": "https://reliefweb.int/report/test"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_RELIEFWEB"
    assert rec.evidence_type == "humanitarian_report"
    assert rec.verification_status == VerificationState.SOURCE_REFERENCED

def test_reliefweb_credential_missing_health():
    import asyncio
    conn = ReliefWebConnector()
    # When RELIEFWEB_APPNAME is not set, returns CREDENTIAL_MISSING
    res = asyncio.run(conn.check_health())
    assert res.get("status") in ["CREDENTIAL_MISSING", "HEALTHY"]

def test_usaspending_normalization():
    from app.connectors.usaspending import UsaSpendingConnector
    conn = UsaSpendingConnector()
    raw = [{
        "agency_id": 1525,
        "agency_name": "Department of Energy",
        "abbreviation": "DOE",
        "toptier_code": "089",
        "url": "https://www.usaspending.gov/agency/089"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_USASPENDING"
    assert rec.evidence_type == "government_open_data"
    assert rec.verification_status == VerificationState.VERIFIED

def test_un_sdg_normalization():
    from app.connectors.un_sdg import UnSdgConnector
    conn = UnSdgConnector()
    raw = [{
        "goal": "8",
        "code": "8.1",
        "title": "Sustain per capita economic growth",
        "description": "Sustain per capita economic growth in accordance with national circumstances",
        "url": "https://unstats.un.org/sdgs/"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_UN_SDG"
    assert rec.evidence_type == "multilateral_standard"
    assert rec.verification_status == VerificationState.VERIFIED

def test_news_feed_normalization():
    from app.connectors.news import NewsFeedConnector
    conn = NewsFeedConnector()
    raw = [{
        "guid": "https://news.un.org/en/story/2026/10/12345",
        "title": "Global Shipping Corridors Face Escalating Security Review",
        "link": "https://news.un.org/en/story/2026/10/12345",
        "pub_date": "Wed, 02 Oct 2026 06:00:00 GMT",
        "description": "International maritime authorities review safety protocols."
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_NEWS"
    assert rec.evidence_type == "news_dispatch"
    assert rec.verification_status == VerificationState.SOURCE_REFERENCED

def test_nominatim_normalization():
    from app.connectors.nominatim import NominatimConnector
    conn = NominatimConnector()
    raw = [{
        "place_id": 123456,
        "osm_id": 98765,
        "name": "Strait of Hormuz, Persian Gulf",
        "lat": "26.5667",
        "lon": "56.2500",
        "type": "strait",
        "class": "natural",
        "query": "Hormuz",
        "url": "https://www.openstreetmap.org/"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_NOMINATIM"
    assert rec.evidence_type == "spatial_boundary"
    assert rec.verification_status == VerificationState.VERIFIED

def test_wikimedia_signals_normalization():
    from app.connectors.wikimedia import WikimediaSignalsConnector
    conn = WikimediaSignalsConnector()
    raw = [{
        "article": "India",
        "total_views": 150000,
        "avg_daily_views": 30000,
        "sample_timestamp": "2024010500",
        "url": "https://en.wikipedia.org/wiki/India"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_WIKIMEDIA"
    assert rec.evidence_type in ["public_social_signal", "digital_attention_signal"]
    assert rec.verification_status == VerificationState.VERIFIED

def test_gdelt_events_normalization():
    from app.connectors.gdelt_events import GdeltEventsConnector
    conn = GdeltEventsConnector()
    raw = [{
        "file_name": "20261002073000.export.CSV.zip",
        "file_url": "http://data.gdeltproject.org/gdeltv2/20261002073000.export.CSV.zip",
        "file_md5": "46cf98e4438dcf465ac34c53329fe7e3",
        "size_bytes": "61534",
        "retrieved_at": "2026-10-02T07:30:00Z"
    }]
    records = conn.normalize(raw)
    assert len(records) == 1
    rec = records[0]
    assert rec.source_id == "CONN_GDELT_EVENTS"
    assert rec.evidence_type == "conflict_political_event"
    assert rec.verification_status == VerificationState.VERIFIED

import asyncio

def test_dataset_builder_fallback_and_deduplication():
    builder = DatasetBuilder()
    plan = RetrievalPlan(
        plan_id="plan_test_001",
        candidate_connectors=["Economic & Financial"],
        target_entities=["India Economy"],
        target_geographies=["IND"],
        time_horizon="12m",
        max_records_per_category=5
    )
    # When connectors return fallback or live records, verify structure
    records = asyncio.run(builder.build_dataset(plan))
    assert len(records) >= 1
    # Check that all records have non-empty content hashes and IDs
    hashes = set()
    for rec in records:
        assert rec.content_hash not in hashes  # Deduplication guaranteed
        hashes.add(rec.content_hash)
        assert rec.evidence_id.startswith("ev_")

def test_evidence_verification_engine_states():
    # 1. Missing URL or Title -> REJECTED
    rec_bad = EvidenceRecord(
        evidence_id="ev_bad",
        source_id="CONN_TEST",
        source_name="Test Source",
        source_url="",
        title="",
        claim_text="Unreferenced claim",
        evidence_type="test",
        published_at="2026-01-01T00:00:00Z",
        retrieved_at="2026-01-01T00:00:00Z"
    )
    # 2. Authoritative source -> VERIFIED
    rec_authoritative = EvidenceRecord(
        evidence_id="ev_auth",
        source_id="CONN_WORLDBANK",
        source_name="World Bank",
        source_url="https://worldbank.org/test",
        title="Authoritative Economic Report",
        claim_text="National trade volume showed steady growth in the fiscal period.",
        evidence_type="economic_indicator",
        published_at="2026-01-01T00:00:00Z",
        retrieved_at="2026-01-01T00:00:00Z",
        geography="IND"
    )
    # 3. Independent source with opposing trajectory -> CONFLICTING
    rec_contrary = EvidenceRecord(
        evidence_id="ev_contrary",
        source_id="CONN_REPUTABLE_NGO",
        source_name="Independent NGO",
        source_url="https://ngo.org/test",
        title="Economic Contraction Study",
        claim_text="Trade volume experienced severe contraction and declining output.",
        evidence_type="economic_report",
        published_at="2026-01-01T00:00:00Z",
        retrieved_at="2026-01-01T00:00:00Z",
        geography="IND"
    )

    results = EvidenceVerificationEngine.verify_records([rec_bad, rec_authoritative, rec_contrary])
    
    res_map = {r.evidence_id: r for r in results}
    assert res_map["ev_bad"].verification_status == VerificationState.REJECTED
    assert res_map["ev_auth"].verification_status == VerificationState.CONFLICTING
    assert res_map["ev_contrary"].verification_status == VerificationState.CONFLICTING
    assert "ev_contrary" in res_map["ev_auth"].contradiction_ids
    assert "ev_auth" in res_map["ev_contrary"].contradiction_ids
