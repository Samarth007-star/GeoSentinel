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

    KNOWN_COUNTRIES = {
        "india": "IND", "iran": "IRN", "united states": "USA", "us": "USA", "usa": "USA",
        "china": "CHN", "russia": "RUS", "ukraine": "UKR", "israel": "ISR", "taiwan": "TWN"
    }

    KNOWN_SECTORS = [
        "energy", "oil", "petroleum", "shipping", "logistics", "trade", "technology", "agriculture", "food"
    ]

    def _fallback_process(self, request: QuestionIntakeRequest) -> Tuple[IntentOutput, EntityExtractionOutput]:
        q_lower = request.question.lower()

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

        entities: List[ExtractedEntity] = []
        for name, code in self.KNOWN_COUNTRIES.items():
            pattern = r'\b' + re.escape(name) + r'\b'
            if re.search(pattern, q_lower):
                entities.append(ExtractedEntity(
                    name=name.title(),
                    entity_type=EntityType.COUNTRY,
                    canonical_id=code,
                    aliases=[code]
                ))

        if request.geographies:
            for g in request.geographies:
                g_code = g.upper()
                if not any(e.canonical_id == g_code for e in entities):
                    entities.append(ExtractedEntity(
                        name=g,
                        entity_type=EntityType.COUNTRY,
                        canonical_id=g_code,
                        aliases=[g_code]
                    ))

        for s in self.KNOWN_SECTORS:
            if s in q_lower:
                entities.append(ExtractedEntity(
                    name=s.title(),
                    entity_type=EntityType.SECTOR,
                    canonical_id=f"sec_{s}"
                ))

        entity_out = EntityExtractionOutput(
            entities=entities,
            unresolved_ambiguities=[]
        )

        return intent_out, entity_out

    async def process(self, request: QuestionIntakeRequest) -> Tuple[IntentOutput, EntityExtractionOutput]:
        if settings.MODEL_PROVIDER == "local_fallback":
            return self._fallback_process(request)

        try:
            prompt = f"Analyze this geopolitical question: '{request.question}'. Extract the intent and any entities (countries, sectors, organizations)."
            result = await llm_adapter.generate_structured(prompt, QUCombinedOutput)
            return result.intent, result.entities
        except Exception:
            return self._fallback_process(request)

question_understanding_agent = QuestionUnderstandingAgent()
