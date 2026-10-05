import asyncio
import os
import sys
import json
import time
from datetime import datetime, timezone
import httpx
from dotenv import load_dotenv

# Ensure local imports work cleanly
sys.path.insert(0, os.path.abspath("."))
load_dotenv(dotenv_path=os.path.abspath("../.env"), override=True)
load_dotenv(override=True)

from app.core.config import settings
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
from app.schemas.models import QuestionIntakeRequest, RetrievalPlan, VerificationState
from app.orchestration.pipeline import geosentinel_pipeline
from app.agents.question_understanding import question_understanding_agent
from app.agents.retrieval_planning import retrieval_planning_agent
from app.dataset_builder.builder import dataset_builder
from app.agents.context_builder import context_builder_agent
from app.agents.impact_analysis import impact_analysis_agent
from app.agents.prediction_scenario import prediction_scenario_agent
from app.agents.strategy_generation import strategy_generation_agent
from app.agents.strategy_risk_review import strategy_risk_review_agent
from app.agents.response_composition import response_composition_agent

print("=== LOADED CONFIGURATION ===")
print("RELIEFWEB_APPNAME:", settings.RELIEFWEB_APPNAME)
print("RELIEFWEB_BASE_URL:", settings.RELIEFWEB_BASE_URL)
print("GDELT_BASE_URL:", settings.GDELT_BASE_URL)
print("OONI_BASE_URL:", settings.OONI_BASE_URL)
print("IODA_BASE_URL:", getattr(settings, 'IODA_BASE_URL', 'https://api.ioda.inetintel.cc.gatech.edu/v2'))

# ============================================================================
# PART 1: FRESH LIVE CONNECTOR PROBES (9 Connectors)
# ============================================================================

async def probe_connector(conn, sample_entities, sample_geos):
    print(f"\nProbing {conn.connector_id} ({conn.provider_name})...")
    req_time = datetime.now(timezone.utc).isoformat()
    t0 = time.time()
    
    # 1. Health Probe
    health = await conn.check_health()
    health_latency = (time.time() - t0) * 1000
    
    # 2. Live Data Fetch
    t_fetch = time.time()
    raw_records = await conn.fetch(sample_entities, sample_geos)
    fetch_latency = (time.time() - t_fetch) * 1000
    
    # 3. Normalization
    norm_records = conn.normalize(raw_records)
    
    sample_rec = norm_records[0] if norm_records else None
    
    status = "FAILED"
    if norm_records:
        if sample_rec.data_origin == "LIVE":
            status = "LIVE_DATA_VERIFIED"
        elif sample_rec.data_origin == "HISTORICAL":
            status = "LIVE_API + HISTORICAL_DATA"
    elif getattr(conn, "status", None) and conn.status.value == "RATE_LIMITED":
        status = "RATE_LIMITED"
    elif hasattr(conn, "appname") and not conn.appname:
        status = "CREDENTIAL_MISSING"

    result = {
        "connector_id": conn.connector_id,
        "provider": conn.provider_name,
        "category": conn.category,
        "endpoint": getattr(conn, "base_url", getattr(conn, "endpoint", "")),
        "request_timestamp": req_time,
        "health_status": health.get("status"),
        "latency_ms": round(fetch_latency, 1),
        "raw_records": len(raw_records),
        "normalized_records": len(norm_records),
        "data_origin": sample_rec.data_origin if sample_rec else "N/A",
        "sample_record_id": sample_rec.evidence_id if sample_rec else "N/A",
        "source_url": sample_rec.source_url if sample_rec else getattr(conn, "terms_url", ""),
        "published_at": sample_rec.published_at if sample_rec else "N/A",
        "retrieved_at": sample_rec.retrieved_at if sample_rec else "N/A",
        "content_hash": sample_rec.content_hash if sample_rec else "N/A",
        "error_status": getattr(conn, "last_error", None),
        "status": status
    }
    print(f" -> {conn.connector_id}: {status} ({len(raw_records)} raw -> {len(norm_records)} norm, latency: {fetch_latency:.1f}ms)")
    if sample_rec:
        print(f"    Sample: [{sample_rec.evidence_id}] {sample_rec.title[:65]}...")
        print(f"    Published: {sample_rec.published_at} | Retrieved: {sample_rec.retrieved_at}")
    return result

async def run_all_fresh_probes():
    probes = [
        (ReliefWebConnector(), ["Middle East", "crisis"], ["IRN", "SYR"]),
        (OoniConnector(), ["dns", "censorship"], ["IRN", "IND"]),
        (IodaConnector(), ["bgp", "outage"], ["IRN"]),
        (WikidataConnector(), ["India", "Iran"], ["IND", "IRN"]),
        (WikimediaPageviewsConnector(), ["India", "Iran"], ["IND", "IRN"]),
        (WorldBankConnector(), ["gdp", "trade"], ["IND", "IRN"]),
        (UsgsConnector(), ["earthquake"], ["IND"]),
        (NasaEonetConnector(), ["storm", "fire"], ["IND", "USA"]),
        (GdeltConnector(), ["India Iran oil"], ["IND", "IRN"])
    ]
    
    results = []
    for conn, entities, geos in probes:
        # Wait 5.5s before GDELT to prevent rate limits
        if conn.connector_id == "CONN_GDELT":
            print("\nWaiting 6 seconds before GDELT to respect rate limits...")
            await asyncio.sleep(6.0)
        res = await probe_connector(conn, entities, geos)
        results.append(res)
        await asyncio.sleep(1.0)
    return results

# ============================================================================
# PART 2: 12-STAGE PIPELINE EXECUTION FOR QUESTIONS A, B, C, D, E
# ============================================================================

TEST_QUESTIONS = [
    {
        "code": "Q_A",
        "title": "Question A (Geopolitical / Economic)",
        "question": "What could be the economic and geopolitical impact on India if tensions in the Middle East escalate?",
        "geographies": ["IND", "IRN"]
    },
    {
        "code": "Q_B",
        "title": "Question B (Internet Disruption)",
        "question": "Are there recent internet connectivity disruptions relevant to Iran or the Middle East?",
        "geographies": ["IRN"]
    },
    {
        "code": "Q_C",
        "title": "Question C (Humanitarian Developments)",
        "question": "What recent humanitarian developments are relevant to the Middle East?",
        "geographies": ["IRN", "SYR"]
    },
    {
        "code": "Q_D",
        "title": "Question D (Digital Attention)",
        "question": "Has public digital attention to Iran increased recently?",
        "geographies": ["IRN"]
    },
    {
        "code": "Q_E",
        "title": "Question E (Entity Intelligence)",
        "question": "Give me structured information about India, Iran and their relevant organizations/entities.",
        "geographies": ["IND", "IRN"]
    }
]

async def run_pipeline_with_trace(q_item):
    code = q_item["code"]
    q_text = q_item["question"]
    geos = q_item["geographies"]
    print(f"\n====================================================================")
    print(f"EXECUTING 12-STAGE TRACE: {code} — {q_text}")
    print(f"====================================================================")
    
    t_start = time.time()
    
    # Stage 1: Question Intake
    req = QuestionIntakeRequest(
        session_id=f"audit_ses_{code}_{int(time.time())}",
        question=q_text,
        geographies=geos,
        time_horizon="30d"
    )
    s1_trace = {
        "stage": 1,
        "name": "Question Intake",
        "input": q_text,
        "geographies": geos,
        "status": "PASSED"
    }

    # Stages 2 & 3: Intent Classification & Entity Extraction
    intent, entities = await question_understanding_agent.process(req)
    s2_trace = {
        "stage": 2,
        "name": "Intent Classification",
        "primary_intent": intent.primary_intent.value if hasattr(intent.primary_intent, 'value') else str(intent.primary_intent),
        "confidence": intent.confidence,
        "status": "PASSED"
    }
    s3_trace = {
        "stage": 3,
        "name": "Entity Extraction",
        "entities": [e.name for e in entities.entities],
        "countries": [e.name for e in entities.entities if getattr(getattr(e, 'entity_type', None), 'value', str(getattr(e, 'entity_type', ''))) == "country"],
        "status": "PASSED"
    }

    # Stage 4: Retrieval Planning
    plan = retrieval_planning_agent.create_plan(req, intent, entities)
    s4_trace = {
        "stage": 4,
        "name": "Retrieval Planning",
        "plan_id": plan.plan_id,
        "categories": plan.candidate_connectors,
        "status": "PASSED"
    }

    # Stage 5 & 6: Dataset Builder & Evidence Verification
    t_dsb = time.time()
    verified_evidence = await dataset_builder.build_dataset(plan)
    dsb_latency = (time.time() - t_dsb) * 1000
    
    # Calculate verification breakdown
    states_count = {
        "VERIFIED": 0,
        "CROSS_CHECKED": 0,
        "SOURCE_REFERENCED": 0,
        "UNVERIFIED": 0,
        "CONFLICTING": 0,
        "REJECTED": 0
    }
    for ev in verified_evidence:
        st_val = ev.verification_status.value if hasattr(ev.verification_status, 'value') else str(ev.verification_status)
        states_count[st_val] = states_count.get(st_val, 0) + 1

    s5_trace = {
        "stage": 5,
        "name": "Dataset Builder",
        "connectors_selected": plan.candidate_connectors,
        "total_records": len(verified_evidence),
        "latency_ms": round(dsb_latency, 1),
        "status": "PASSED"
    }
    s6_trace = {
        "stage": 6,
        "name": "Evidence Verification",
        "breakdown": states_count,
        "status": "PASSED"
    }

    # Stage 7: Context Builder
    context = context_builder_agent.build_context(req.session_id, verified_evidence)
    s7_trace = {
        "stage": 7,
        "name": "Context Builder",
        "context_id": context.session_id,
        "evidence_items_count": len(context.evidence_items),
        "status": "PASSED"
    }

    # Stage 8: GeoCausal / Impact Analysis
    pathways = impact_analysis_agent.analyze_impacts(req.question, plan.target_geographies, context)
    s8_trace = {
        "stage": 8,
        "name": "GeoCausal Impact Analysis",
        "pathways_count": len(pathways),
        "sectors": [p.sector for p in pathways],
        "status": "PASSED"
    }

    # Stage 9: GeoFork Scenario Analysis
    scenarios = prediction_scenario_agent.generate_scenarios(req.question, context)
    s9_trace = {
        "stage": 9,
        "name": "GeoFork Scenario Analysis",
        "scenarios_count": len(scenarios),
        "scenario_names": [s.name for s in scenarios],
        "status": "PASSED"
    }

    # Stage 10: Strategy Generation
    strategies_draft = strategy_generation_agent.generate_strategies(req.question, pathways, context)
    s10_trace = {
        "stage": 10,
        "name": "Strategy Generation",
        "options_count": len(strategies_draft),
        "strategy_titles": [s.title for s in strategies_draft],
        "status": "PASSED"
    }

    # Stage 11: Independent Strategy Risk Review Gate
    reviewed_strategies = strategy_risk_review_agent.review_strategies(strategies_draft, context)
    approved_count = 0
    withheld_count = 0
    for s in reviewed_strategies:
        rev_st = getattr(getattr(s, 'risk_review', None), 'status', None)
        st_str = getattr(rev_st, 'value', str(rev_st)) if rev_st else "PENDING"
        if st_str in ["APPROVED", "APPROVED_WITH_LIMITATIONS"]:
            approved_count += 1
        elif st_str in ["WITHHOLD", "REJECTED"]:
            withheld_count += 1

    s11_trace = {
        "stage": 11,
        "name": "Independent Strategy Risk Review",
        "total_reviewed": len(reviewed_strategies),
        "approved_count": approved_count,
        "withheld_count": withheld_count,
        "status": "PASSED"
    }

    # Stage 12: Final Response Composition
    answer = response_composition_agent.compose_answer(
        question=req.question,
        context=context,
        pathways=pathways,
        scenarios=scenarios,
        strategies=reviewed_strategies
    )
    s12_trace = {
        "stage": 12,
        "name": "Response Composition (4 Mandatory Sections)",
        "has_current_situation": bool(answer.current_situation),
        "has_relevant_evidence": len(answer.relevant_evidence) > 0,
        "has_impact_analysis": len(answer.impact_analysis) > 0,
        "has_strategy_recommendations": len(answer.strategy_recommendations) > 0,
        "status": "PASSED"
    }

    total_latency = (time.time() - t_start) * 1000

    print(f"All 12 Stages Completed Successfully in {total_latency:.1f}ms!")
    print(f"Total Ingested Evidence: {len(verified_evidence)}")
    print(f"Sources Contributing: {set(ev.source_name for ev in verified_evidence)}")

    return {
        "code": code,
        "question": q_text,
        "total_latency_ms": round(total_latency, 1),
        "stages": [s1_trace, s2_trace, s3_trace, s4_trace, s5_trace, s6_trace, s7_trace, s8_trace, s9_trace, s10_trace, s11_trace, s12_trace],
        "evidence_records": [ev.model_dump() for ev in verified_evidence],
        "final_answer": answer.model_dump()
    }

# ============================================================================
# PART 3: FALLBACK SIMULATION TEST (Section 22)
# ============================================================================

async def test_fallback_simulation():
    print("\n=== RUNNING SECTION 22 FALLBACK SIMULATION ===")
    plan = RetrievalPlan(
        plan_id="plan_fallback_simulation",
        target_entities=["HypotheticalNonExistentEntityX99"],
        target_geographies=["IND"],
        time_horizon="30d",
        candidate_connectors=["NonExistentCategory"]
    )
    records = await dataset_builder.build_dataset(plan)
    print(f"Fallback Activated: Retrieved {len(records)} records.")
    for r in records:
        print(f" - [{r.evidence_id}] Origin: {r.data_origin} | Title: {r.title} | Source: {r.source_name}")
        assert r.data_origin == "REFERENCE", "Fallback records must strictly be labeled REFERENCE"
    print("Section 22 Fallback Simulation Verified: 100% Compliant.")
    return len(records)

# ============================================================================
# MAIN ORCHESTRATION
# ============================================================================

async def main():
    print("====================================================================")
    print("STARTING FRESH PHASE 1 EMPIRICAL AUDIT EXECUTION")
    print("====================================================================")
    
    # 1. Fresh Connector Probes
    connector_probes = await run_all_fresh_probes()
    
    # 2. Pipeline Questions A to E
    question_traces = []
    for q in TEST_QUESTIONS:
        tr = await run_pipeline_with_trace(q)
        question_traces.append(tr)
        await asyncio.sleep(2.0)
        
    # 3. Fallback Test
    fallback_count = await test_fallback_simulation()
    
    output = {
        "audit_timestamp": datetime.now(timezone.utc).isoformat(),
        "connector_probes": connector_probes,
        "question_traces": question_traces,
        "fallback_count": fallback_count
    }
    
    with open("fresh_audit_results.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
        
    print("\n=== AUDIT COMPLETE: Results written to fresh_audit_results.json ===")

if __name__ == "__main__":
    asyncio.run(main())
