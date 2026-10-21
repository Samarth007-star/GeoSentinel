import asyncio
import os
import sys
import json
import httpx
from dotenv import load_dotenv

# Ensure app can be imported
sys.path.insert(0, os.path.abspath("."))
load_dotenv(dotenv_path=os.path.abspath("../.env"), override=True)
load_dotenv(override=True)

import pytest
from app.core.config import settings
from app.connectors.reliefweb import ReliefWebConnector

@pytest.mark.anyio
async def test_live_reliefweb():
    print(f"=== TESTING RELIEFWEB LIVE CONNECTOR ===")
    print(f"Configured Base URL: {settings.RELIEFWEB_BASE_URL}")
    print(f"Configured Appname: {settings.RELIEFWEB_APPNAME}")
    
    conn = ReliefWebConnector()
    print(f"Connector ID: {conn.connector_id}")
    print(f"Is Available: {conn.is_available()}")
    print(f"Auth Type: {conn.auth_type}")

    # 1. Health check
    print("\n--- Running Health Check ---")
    health = await conn.check_health()
    print("Health Check Result:")
    print(json.dumps(health, indent=2))

    # 2. Fetch live reports
    print("\n--- Running Live Fetch (geographies: ['IRN', 'SYR'], entities: ['crisis', 'humanitarian']) ---")
    raw_records = await conn.fetch(["crisis", "humanitarian"], ["IRN", "SYR"])
    print(f"Total Raw Records Retrieved: {len(raw_records)}")

    # 3. Normalize records
    print("\n--- Normalizing Records to Canonical EvidenceRecords ---")
    norm_records = conn.normalize(raw_records)
    print(f"Total Normalized Evidence Records: {len(norm_records)}")

    if norm_records:
        sample = norm_records[0]
        print("\n--- Sample Normalized Evidence Record ---")
        print(f"Evidence ID: {sample.evidence_id}")
        print(f"Title: {sample.title}")
        print(f"Source ID: {sample.source_id}")
        print(f"Source URL: {sample.source_url}")
        print(f"Published At: {sample.published_at}")
        print(f"Retrieved At: {sample.retrieved_at}")
        print(f"Geography: {sample.geography}")
        print(f"Data Origin: {sample.data_origin}")
        print(f"Verification Status: {sample.verification_status}")
        print(f"Content Hash: {sample.content_hash}")
        print(f"Attribution: {sample.attribution}")
        print(f"Claim Text Snippet: {sample.claim_text[:200]}...")
        print(f"\nSTATUS: LIVE_DATA_VERIFIED")
    else:
        print(f"\nLast Error: {conn.last_error}")
        print(f"STATUS: {conn.status.value}")

if __name__ == "__main__":
    asyncio.run(test_live_reliefweb())
