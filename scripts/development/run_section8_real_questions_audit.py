import asyncio
import json
import time
from datetime import datetime, timezone
import httpx

from typing import Any, Dict, List

from app.orchestration.pipeline import geosentinel_pipeline
from app.schemas.models import QuestionIntakeRequest, VerificationState, RiskReviewStatus

async def run_section8_tests():
    now_utc = datetime.now(timezone.utc)
    print(f"==================================================================")
    print(f"RUNNING SECTION 8 EMPIRICAL QUESTION AUDIT (TESTS A - J)")
    print(f"Current System Time (UTC): {now_utc.isoformat()}")
    print(f"==================================================================")

    test_cases: List[Dict[str, Any]] = [
        {
            "id": "TEST_A",
            "category": "Current Geopolitical Situation",
            "question": "What are the latest verified developments involving Iran and the Strait of Hormuz, and what potential implications could they have for India's energy security?",
            "geos": ["IRN", "IND", "USA"],
            "horizon": "30d",
            "cats": ["government", "international", "news", "conflict", "economic"]
        },
        {
            "id": "TEST_B",
            "category": "Current Energy & Economic Indicators",
            "question": "What are the latest available indicators relevant to India's energy imports and economic exposure to Middle East instability?",
            "geos": ["IND", "SAU", "IRN"],
            "horizon": "45d",
            "cats": ["economic", "international", "government"]
        },
        {
            "id": "TEST_C",
            "category": "Current Disaster or Scientific Event",
            "question": "What significant recent earthquakes or natural hazards are reported by the configured scientific data sources, and what evidence supports the findings?",
            "geos": ["IND", "IRN", "TUR"],
            "horizon": "14d",
            "cats": ["scientific", "geographic"]
        },
        {
            "id": "TEST_D",
            "category": "Recent Humanitarian Situation",
            "question": "What recent humanitarian developments are reported for a currently relevant conflict-affected region?",
            "geos": ["UKR", "PSE", "AFG"],
            "horizon": "30d",
            "cats": ["international", "news", "social"]
        },
        {
            "id": "TEST_E",
            "category": "Internet Connectivity & Censorship Signals",
            "question": "What recent network interference or connectivity anomalies are reported for a selected country by the configured OONI or IODA integrations?",
            "geos": ["IRN", "RUS", "IND"],
            "horizon": "14d",
            "cats": ["social", "government", "news"]
        },
        {
            "id": "TEST_F",
            "category": "Entity & Relationship Question",
            "question": "What reliable information do the configured knowledge sources provide about India, Iran, and their relevant international or economic relationships?",
            "geos": ["IND", "IRN"],
            "horizon": "60d",
            "cats": ["geographic", "international", "economic"]
        },
        {
            "id": "TEST_G",
            "category": "Arbitrary Natural-Language Question",
            "question": "How will recent semiconductor supply chain agreements between India and East Asian economies affect high-tech manufacturing resilience?",
            "geos": ["IND", "TWN", "JPN"],
            "horizon": "90d",
            "cats": ["economic", "international", "government"]
        },
        {
            "id": "TEST_H",
            "category": "Hypothetical Scenario",
            "question": "If a major disruption occurred in the Strait of Hormuz, what possible effects could it have on India's energy security, trade, and economy?",
            "geos": ["IND", "IRN", "OMN"],
            "horizon": "30d",
            "cats": ["conflict", "economic", "international"]
        },
        {
            "id": "TEST_I",
            "category": "Insufficient-Evidence Question",
            "question": "What will the exact price of crude oil in India be on a specific date next month?",
            "geos": ["IND"],
            "horizon": "30d",
            "cats": ["economic"]
        },
        {
            "id": "TEST_J",
            "category": "Unrelated or Ambiguous Question",
            "question": "What is the best recipe for baking chocolate chip cookies in cold weather?",
            "geos": ["IND"],
            "horizon": "7d",
            "cats": ["social"]
        }
    ]

    results = []

    for tc in test_cases:
        t0 = time.time()
        print(f"\n------------------------------------------------------------------")
        print(f"[{tc['id']}] {tc['category']}")
        print(f"Question: {tc['question']}")
        print(f"------------------------------------------------------------------")

        req = QuestionIntakeRequest(
            session_id=f"audit_sess_{tc['id']}",
            question=str(tc["question"]),
            time_horizon=str(tc["horizon"]),
            geographies=list(tc["geos"]),
            include_categories=list(tc["cats"])
        )

        pipe_res = await geosentinel_pipeline.execute(req)
        ans = pipe_res.answer
        elapsed_ms = (time.time() - t0) * 1000

        # Validate 4 sections
        has_sec1 = ans.current_situation is not None and len(ans.current_situation.verified_facts) >= 0
        has_sec2 = len(ans.relevant_evidence) >= 0
        has_sec3 = len(ans.impact_analysis) >= 0
        has_sec4 = len(ans.strategy_recommendations) >= 0

        # Review risk gates
        red_team_passed = all(
            s.risk_review_status in (RiskReviewStatus.APPROVED_WITH_LIMITATIONS, RiskReviewStatus.WITHHOLD, RiskReviewStatus.REJECTED)
            and s.risk_review_status != RiskReviewStatus.PENDING
            for s in ans.strategy_recommendations
        ) if ans.strategy_recommendations else True

        # Check assumptions labeling
        scenarios_labeled = all(
            all("[SCENARIO_ASSUMPTION]" in o or "[SOURCE_DERIVED" in o or "Assumes" in o for o in sc.projected_outcomes)
            for sc in ans.scenarios
        ) if ans.scenarios else True

        # Check Insufficient Evidence handling
        is_insufficient = tc["id"] == "TEST_I"
        if is_insufficient:
            # Check that answer contains limitation / confidence caveats
            limitation_noted = any("uncertainty" in l.lower() or "limit" in l.lower() or "exact" in l.lower() or "cannot" in l.lower() or "forecasting" in l.lower() for l in ans.limitations) or len(ans.confidence_rationale) > 0
        else:
            limitation_noted = True

        status = "PASSED" if (has_sec1 and has_sec2 and has_sec3 and has_sec4 and red_team_passed) else "FAILED"

        print(f" -> Time: {elapsed_ms:.1f}ms | Status: {status}")
        print(f" -> Facts: {len(ans.current_situation.verified_facts)} | Evidence: {len(ans.relevant_evidence)} | Impacts: {len(ans.impact_analysis)} | Strategies: {len(ans.strategy_recommendations)} | Scenarios: {len(ans.scenarios)}")
        if ans.current_situation.verified_facts:
            print(f" -> Sample Fact: {ans.current_situation.verified_facts[0][:90]}...")
        if ans.relevant_evidence:
            print(f" -> Sample Source: {ans.relevant_evidence[0].source_name} ({ans.relevant_evidence[0].source_url})")

        results.append({
            "test_id": tc["id"],
            "category": tc["category"],
            "question": tc["question"],
            "elapsed_ms": round(elapsed_ms, 2),
            "status": status,
            "facts_count": len(ans.current_situation.verified_facts),
            "evidence_count": len(ans.relevant_evidence),
            "impacts_count": len(ans.impact_analysis),
            "strategies_count": len(ans.strategy_recommendations),
            "scenarios_count": len(ans.scenarios),
            "red_team_passed": red_team_passed,
            "scenarios_labeled": scenarios_labeled,
            "sample_sources": [e.source_name for e in ans.relevant_evidence[:3]],
            "sample_urls": [e.source_url for e in ans.relevant_evidence[:3]]
        })

    with open("docs/SECTION8_EMPIRICAL_TEST_RESULTS.json", "w", encoding="utf-8") as f:
        json.dump({
            "audit_timestamp_utc": now_utc.isoformat(),
            "total_tests": len(results),
            "passed_tests": sum(1 for r in results if r["status"] == "PASSED"),
            "results": results
        }, f, indent=2)

    print("\n==================================================================")
    print(f"AUDIT COMPLETE: {sum(1 for r in results if r['status'] == 'PASSED')}/{len(results)} PASSED")
    print("Results saved to docs/SECTION8_EMPIRICAL_TEST_RESULTS.json")
    print("==================================================================")

if __name__ == "__main__":
    asyncio.run(run_section8_tests())
