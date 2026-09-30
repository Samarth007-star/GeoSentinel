import re
from typing import List, Tuple
from ..schemas.models import (
    QuestionIntakeRequest,
    IntentOutput,
    IntentCategory,
    ExtractedEntity,
    EntityType,
    EntityExtractionOutput
)
from pydantic import BaseModel
from ..core.llm_adapter import llm_adapter
from ..core.config import settings

class QUCombinedOutput(BaseModel):
    intent: IntentOutput
    entities: EntityExtractionOutput

class QuestionUnderstandingAgent:
    """
    Handles Stages 1 (Intake), 2 (Intent Classification), and 3 (Entity Extraction).
    """

    async def process(self, request: QuestionIntakeRequest) -> Tuple[IntentOutput, EntityExtractionOutput]:
        q_lower = request.question.lower()

        if settings.MODEL_PROVIDER == "local_fallback":
            # Fallback deterministic logic
            intent = IntentCategory.IMPACT_ANALYSIS
            requires_scenario = False
            requires_strategy = True
            rationale = "User inquiry examines causal consequences and risks of global event."

            if any(w in q_lower for w in ["what could be the effects", "impact", "consequence", "spillover"]):
                intent = IntentCategory.IMPACT_ANALYSIS
                requires_scenario = True
            elif any(w in q_lower for w in ["what if", "scenario", "alternative", "counterfactual"]):
                intent = IntentCategory.CONDITIONAL_SCENARIO
                requires_scenario = True
            elif any(w in q_lower for w in ["strategy", "mitigate", "recommend", "options", "policy"]):
                intent = IntentCategory.STRATEGY_COMPARISON
                requires_strategy = True
            elif any(w in q_lower for w in ["current situation", "status", "latest news", "update"]):
                intent = IntentCategory.SITUATIONAL_SUMMARY

            intent_out = IntentOutput(
                primary_intent=intent,
                confidence=0.92,
                requires_geocausal=True,
                requires_scenario=requires_scenario,
                requires_strategy=requires_strategy,
                intent_rationale=rationale
            )
            entity_out = EntityExtractionOutput(entities=[], unresolved_ambiguities=[])
            return intent_out, entity_out

        prompt = f"Analyze this geopolitical question: '{request.question}'. Extract the intent and any entities (countries, sectors, organizations)."
        result = await llm_adapter.generate_structured(prompt, QUCombinedOutput)
        return result.intent, result.entities

question_understanding_agent = QuestionUnderstandingAgent()
