import pytest
import time
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch, MagicMock
import httpx

from app.connectors.registry import connector_registry
from app.connectors.imf import ImfConnector
from app.connectors.noaa import NoaaConnector
from app.connectors.gdelt import GdeltConnector
from app.schemas.models import ConnectorStatus, VerificationState


# ============================================================================
# IMF CONNECTOR UNIT TESTS
# ============================================================================

def test_imf_initialization():
    conn = ImfConnector()
    assert conn.connector_id == "CONN_IMF"
    assert "Economic" in conn.category
    assert "International Monetary Fund" in conn.provider_name
    assert conn.terms_url == "https://www.imf.org/external/terms.htm"
    assert "IMF Copyright" in conn.license_type
    assert conn.is_available() is True


@pytest.mark.anyio
async def test_imf_health_check_success():
    conn = ImfConnector()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.elapsed.total_seconds.return_value = 0.12

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_resp):
        res = await conn.check_health()
        assert res["status"] == "HEALTHY"
        assert res["latency_ms"] == 120.0


@pytest.mark.anyio
async def test_imf_health_check_failure():
    conn = ImfConnector()
    mock_resp = MagicMock()
    mock_resp.status_code = 503

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_resp):
        res = await conn.check_health()
        assert res["status"] == "DEGRADED"
        assert res["http_code"] == 503


def test_imf_extract_series():
    conn = ImfConnector()
    mock_data = {
        "CompactData": {
            "DataSet": {
                "Series": {
                    "@UNIT_MEASURE": "Percent",
                    "Obs": [
                        {"@TIME_PERIOD": "2024", "@OBS_VALUE": "6.8"},
                        {"@TIME_PERIOD": "2025", "@OBS_VALUE": "6.5"},
                        {"@TIME_PERIOD": "2026", "@OBS_VALUE": "6.3"}
                    ]
                }
            }
        }
    }
    series = conn._extract_series(mock_data, "NGDP_RPCH", "Real GDP Growth (%)", "IND")
    assert len(series) == 3
    assert series[0]["period"] == "2026"
    assert series[0]["value"] == "6.3"
    assert series[0]["indicator_code"] == "NGDP_RPCH"


def test_imf_normalization():
    conn = ImfConnector()
    raw_records = [
        {
            "indicator_code": "NGDP_RPCH",
            "indicator_name": "Real GDP Growth (%)",
            "country_code": "IND",
            "period": "2025",
            "value": "6.5",
            "dataset": "WEO",
            "unit": "Percent"
        }
    ]
    ev_list = conn.normalize(raw_records)
    assert len(ev_list) == 1
    ev = ev_list[0]
    assert ev.evidence_id.startswith("ev_imf_")
    assert ev.source_id == "CONN_IMF"
    assert ev.verification_status == VerificationState.VERIFIED
    assert "Real GDP Growth" in ev.claim_text
    assert "6.5" in ev.claim_text
    assert "International Monetary Fund" in ev.attribution
    assert ev.limitations is not None


# ============================================================================
# NOAA CONNECTOR UNIT TESTS
# ============================================================================

def test_noaa_initialization():
    conn = NoaaConnector()
    assert conn.connector_id == "CONN_NOAA"
    assert "Scientific" in conn.category
    assert "NOAA" in conn.provider_name
    assert conn.license_type == "US Public Domain"
    assert conn.is_available() is True


@pytest.mark.anyio
async def test_noaa_health_check_success():
    conn = NoaaConnector()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.elapsed.total_seconds.return_value = 0.08

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_resp):
        res = await conn.check_health()
        assert res["status"] == "HEALTHY"
        assert res["latency_ms"] == 80.0


@pytest.mark.anyio
async def test_noaa_fetch_alerts():
    conn = NoaaConnector()
    mock_geojson = {
        "features": [
            {
                "properties": {
                    "id": "alert_12345",
                    "event": "Flood Warning",
                    "headline": "Flood Warning in effect until tomorrow",
                    "description": "Flooding caused by excessive rainfall is expected.",
                    "severity": "Severe",
                    "certainty": "Likely",
                    "urgency": "Expected",
                    "areaDesc": "Coastal District",
                    "effective": "2026-10-19T06:00:00Z",
                    "expires": "2026-10-20T06:00:00Z",
                    "senderName": "NWS River Forecast Center",
                    "category": "Met"
                }
            }
        ]
    }
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_geojson

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_resp):
        records = await conn.fetch([], ["US"])
        assert len(records) == 1
        assert records[0]["event"] == "Flood Warning"
        assert records[0]["severity"] == "Severe"


def test_noaa_normalization():
    conn = NoaaConnector()
    raw = [
        {
            "alert_id": "urn:oid:2.49.0.1.840.0.12345",
            "event": "High Wind Warning",
            "headline": "Damaging winds up to 60 mph expected",
            "description": "Winds may bring down tree branches and power lines.",
            "severity": "Moderate",
            "areas": "Northern County, Central Valley",
            "effective": "2026-10-19T12:00:00+00:00"
        }
    ]
    ev_list = conn.normalize(raw)
    assert len(ev_list) == 1
    ev = ev_list[0]
    assert ev.evidence_id.startswith("ev_noaa_")
    assert ev.source_id == "CONN_NOAA"
    assert ev.verification_status == VerificationState.VERIFIED
    assert "High Wind Warning" in ev.title
    assert "moderate severity" in ev.claim_text.lower()
    assert "NOAA / National Weather Service" in ev.attribution


# ============================================================================
# GDELT RATE-LIMIT & BACKOFF UNIT TESTS
# ============================================================================

def test_gdelt_rate_limit_backoff():
    conn = GdeltConnector()
    conn._reset_backoff()
    assert GdeltConnector._backoff_seconds == 5.0
    assert GdeltConnector._rate_limit_until == 0.0

    # Simulate 429 response without Retry-After
    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.headers = {}
    conn._handle_rate_limit(mock_resp)

    assert conn.status == ConnectorStatus.RATE_LIMITED
    assert GdeltConnector._backoff_seconds == 10.0  # 5.0 * 2
    assert GdeltConnector._rate_limit_until > time.time()

    # Simulate 429 with explicit Retry-After header
    mock_resp.headers = {"Retry-After": "25"}
    conn._handle_rate_limit(mock_resp)
    assert GdeltConnector._backoff_seconds == 25.0

    # Reset backoff
    conn._reset_backoff()
    assert GdeltConnector._backoff_seconds == 5.0
    assert GdeltConnector._rate_limit_until == 0.0
