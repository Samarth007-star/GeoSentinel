from app.connectors.registry import connector_registry
from app.connectors.base import BaseConnector

def test_connector_registry_and_licensing():
    connectors = connector_registry.list_all()
    assert len(connectors) >= 4

    # Verify all registered connectors have non-empty terms URLs and licenses
    for conn in connectors:
        assert conn.connector_id.startswith("CONN_")
        assert len(conn.provider_name) > 0
        assert conn.terms_url.startswith("http")
        assert len(conn.license_type) > 0
        assert conn.is_available() is True

def test_base_connector_content_hash():
    conn = connector_registry.get_connector("CONN_WORLDBANK")
    assert conn is not None
    h1 = conn.compute_content_hash("data_payload_1")
    h2 = conn.compute_content_hash("data_payload_1")
    h3 = conn.compute_content_hash("data_payload_2")
    assert h1 == h2
    assert h1 != h3
