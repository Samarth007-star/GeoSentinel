import asyncio
import json
import time
import sys
import os
sys.path.insert(0, os.path.abspath("."))
from datetime import datetime, timezone
import httpx

from app.connectors.registry import connector_registry
from app.connectors.reliefweb import ReliefWebConnector
from app.connectors.gdelt import GdeltConnector
from app.connectors.ooni import OoniConnector
from app.connectors.ioda import IodaConnector
from app.connectors.wikidata import WikidataConnector
from app.connectors.wikimedia import WikimediaPageviewsConnector
from app.connectors.world_bank import WorldBankConnector
from app.connectors.usgs import UsgsConnector
from app.connectors.nasa_eonet import NasaEonetConnector
from app.dataset_builder.builder import DatasetBuilder
from app.schemas.models import QuestionIntakeRequest
from app.orchestration.pipeline import geosentinel_pipeline

async def probe_individual_connector(conn, sample_entities, sample_geos):
    print(f"\n--- Probing {conn.connector_id} ({conn.provider_name}) ---")
    start_t = time.time()
    
    # 1. Health check
    health = await conn.check_health()
    health_latency = (time.time() - start_t) * 1000
    print(f"Health check result: {health} (Latency: {health_latency:.1f}ms)")
    
    # 2. Fetch raw records
    fetch_start = time.time()
    raw_records = await conn.fetch(sample_entities, sample_geos)
    fetch_latency = (time.time() - fetch_start) * 1000
    
    # 3. Normalize records
    norm_records = conn.normalize(raw_records)
    
    sample_rec = norm_records[0] if norm_records else None
    
    status_str = "FAILED"
    if len(norm_records) > 0 and sample_rec and sample_rec.data_origin in ["LIVE", "HISTORICAL"]:
        status_str = "LIVE_DATA_VERIFIED"
    elif hasattr(conn, "appname") and not conn.appname:
        status_str = "CREDENTIAL_MISSING"
    elif conn.status.value == "RATE_LIMITED":
        status_str = "RATE_LIMITED"
        
    audit_item = {
        "provider": conn.provider_name,
        "connector_id": conn.connector_id,
        "category": conn.category,
        "endpoint": getattr(conn, "base_url", getattr(conn, "endpoint", "")),
        "request_timestamp": datetime.now(timezone.utc).isoformat(),
        "health_status": health.get("status"),
        "response_latency_ms": round(fetch_latency, 1),
        "data_origin": sample_rec.data_origin if sample_rec else ("CREDENTIAL_MISSING" if status_str == "CREDENTIAL_MISSING" else "N/A"),
        "raw_record_count": len(raw_records),
        "normalized_record_count": len(norm_records),
        "sample_record_id": sample_rec.evidence_id if sample_rec else "N/A",
        "sample_record_timestamp": sample_rec.published_at if sample_rec else "N/A",
        "source_url": sample_rec.source_url if sample_rec else getattr(conn, "terms_url", ""),
        "content_hash": sample_rec.content_hash if sample_rec else "N/A",
        "result": status_str
    }
    
    print(f"Outcome: {status_str} | Retrieved {len(raw_records)} raw records -> {len(norm_records)} normalized records")
    if sample_rec:
        print(f"Sample Evidence ID: {sample_rec.evidence_id} | Title: {sample_rec.title[:60]}... | Origin: {sample_rec.data_origin}")
        print(f"Content Hash: {sample_rec.content_hash[:20]}...")
    return audit_item

async def run_live_question(q_id, question_text, geos):
    print(f"\n=======================================================")
    print(f"LIVE TEST QUESTION {q_id}: {question_text}")
    print(f"=======================================================")
    req = QuestionIntakeRequest(
        session_id=f"test_ses_{q_id}_{int(time.time())}",
        question=question_text,
        geographies=geos,
        time_horizon="30d"
    )
    result = await geosentinel_pipeline.execute(req)
    
    ans = result.answer
    evidence_items = ans.relevant_evidence
    print(f"Pipeline Result Status: {result.status}")
    print(f"Total Relevant Evidence Ingested: {len(evidence_items)}")
    
    sources_used = set()
    for ev in evidence_items:
        sources_used.add(ev.source_name)
        print(f"  - [{ev.verification_status.value}] {ev.source_name}: {ev.source_url}")
        
    print(f"Distinct Sources Contributing: {list(sources_used)}")
    print(f"Situation Summary Snippet: {ans.current_situation.summary[:150]}...")
    return {
        "question_id": q_id,
        "question": question_text,
        "evidence_count": len(evidence_items),
        "sources": list(sources_used),
        "verified_facts_count": len(ans.current_situation.verified_facts)
    }

async def main():
    print("=== STARTING OFFICIAL PHASE 1 LIVE CONNECTOR VERIFICATION ===")
    
    connectors_to_probe = [
        (OoniConnector(), ["censorship", "tor"], ["IRN", "IND"]),
        (IodaConnector(), ["outage", "bgp"], ["IRN", "IND"]),
        (WikidataConnector(), ["India", "Iran"], ["IND", "IRN"]),
        (WikimediaPageviewsConnector(), ["India", "Iran"], ["IND", "IRN"]),
        (GdeltConnector(), ["India Iran oil", "Middle East shipping"], ["IND", "IRN"]),
        (ReliefWebConnector(), ["Middle East", "crisis"], ["IRN", "SYR"]),
        (WorldBankConnector(), ["gdp", "trade"], ["IND", "IRN"]),
        (UsgsConnector(), ["earthquake"], ["IND", "IRN"]),
        (NasaEonetConnector(), ["wildfire", "storm"], ["IND", "USA"])
    ]
    
    audit_results = []
    for conn, entities, geos in connectors_to_probe:
        audit = await probe_individual_connector(conn, entities, geos)
        audit_results.append(audit)
        await asyncio.sleep(2.0) # Graceful delay to respect public rate limits
        
    print("\n\n=== RUNNING THE 5 CANONICAL GEOPOLITICAL QUESTIONS ===")
    
    # 5 Questions from Section 14:
    questions = [
        (1, "What could be the economic and geopolitical impact on India if tensions in the Middle East escalate?", ["IND", "IRN"]),
        (2, "Are there recent internet connectivity disruptions relevant to Iran or the Middle East?", ["IRN"]),
        (3, "What recent humanitarian developments are relevant to the Middle East?", ["IRN", "SYR"]),
        (4, "Has public digital attention to Iran increased recently?", ["IRN"]),
        (5, "Give me structured information about India, Iran and their relevant organizations/entities.", ["IND", "IRN"])
    ]
    
    q_results = []
    for q_id, q_text, geos in questions:
        qr = await run_live_question(q_id, q_text, geos)
        q_results.append(qr)
        await asyncio.sleep(3.0)
        
    with open("live_audit_summary.json", "w", encoding="utf-8") as f:
        json.dump({"connectors": audit_results, "questions": q_results}, f, indent=2)
        
    print("\n=== VERIFICATION COMPLETE: Saved live_audit_summary.json ===")

if __name__ == "__main__":
    asyncio.run(main())
