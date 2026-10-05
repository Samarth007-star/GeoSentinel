import asyncio
import os
import sys
import json
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath("."))
load_dotenv(dotenv_path=os.path.abspath("../.env"), override=True)
load_dotenv(override=True)

import pytest
from app.schemas.models import QuestionIntakeRequest
from app.orchestration.pipeline import geosentinel_pipeline

@pytest.mark.anyio
async def test_humanitarian_pipeline():
    question_text = "What recent humanitarian developments are relevant to the Middle East?"
    print(f"=== TESTING COMPLETE 12-STAGE PIPELINE WITH RELIEFWEB ===")
    print(f"Question: {question_text}")
    
    req = QuestionIntakeRequest(
        session_id="test_reliefweb_live_ses",
        question=question_text,
        geographies=["IRN", "SYR"],
        time_horizon="30d"
    )
    
    result = await geosentinel_pipeline.execute(req)
    print(f"\nPipeline Status: {result.status}")
    print(f"Total Relevant Evidence Ingested: {len(result.answer.relevant_evidence)}")
    
    sources = {}
    for ev in result.answer.relevant_evidence:
        sources.setdefault(ev.source_name, []).append(ev)
        
    print("\nEvidence Breakdown by Source:")
    for src, items in sources.items():
        print(f"- {src}: {len(items)} items")
        for it in items[:2]:
            print(f"    * [{it.evidence_id}] {it.relevance[:80]} ({it.source_url})")
            
    print(f"\nSituation Summary Snippet:\n{result.answer.current_situation.summary[:300]}...")

if __name__ == "__main__":
    asyncio.run(test_humanitarian_pipeline())
