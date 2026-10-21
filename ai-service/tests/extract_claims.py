import json

with open("fresh_audit_results.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for q in data["question_traces"]:
    code = q["code"]
    q_short = q["question"]
    print("=" * 60)
    print(f"QUESTION {code}: {q_short}")
    print("=" * 60)
    ans = q["final_answer"]
    sit = ans.get("current_situation", {})
    facts = sit.get("verified_facts", [])
    claims = sit.get("attributed_claims", [])
    evidence = ans.get("relevant_evidence", [])
    impacts = ans.get("impact_analysis", [])
    strategies = ans.get("strategy_recommendations", [])
    
    print(f"Total Evidence Items in Response: {len(evidence)}")
    print(f"Verified Facts ({len(facts)}):")
    for idx, fc in enumerate(facts):
        print(f"  [{idx+1}] {fc}")
    print(f"Attributed Claims ({len(claims)}):")
    for idx, cl in enumerate(claims):
        print(f"  [{idx+1}] {cl}")
    print(f"Impact Pathways ({len(impacts)}):")
    for idx, imp in enumerate(impacts):
        print(f"  [{idx+1}] Sector: {imp.get('sector')} | Pathway: {imp.get('pathway')}")
    print(f"Strategy Recommendations ({len(strategies)}):")
    for idx, st in enumerate(strategies):
        print(f"  [{idx+1}] Title: {st.get('title')} | Status: {st.get('risk_review_status')} | Mitigation: {st.get('required_mitigation')}")
    print()
