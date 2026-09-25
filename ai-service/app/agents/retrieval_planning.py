import uuid
from typing import List
from ..schemas.models import (
    QuestionIntakeRequest,
    IntentOutput,
    EntityExtractionOutput,
    RetrievalPlan
)

class RetrievalPlanningAgent:
    """
    Stage 4: Formulates bounded Data Requirement Plan specifying candidate connectors,
    target entities, geographies, and freshness requirements.
    """

    def create_plan(
        self,
        request: QuestionIntakeRequest,
        intent: IntentOutput,
        entities: EntityExtractionOutput
    ) -> RetrievalPlan:
        geos = [e.canonical_id for e in entities.entities if e.entity_type == "country" and e.canonical_id]
        if not geos and request.geographies:
            geos = request.geographies

        candidate_connectors = ["economic", "scientific", "international"]
        if request.include_categories:
            candidate_connectors = request.include_categories

        gaps = []
        if "conflict" in candidate_connectors:
            gaps.append("ACLED real-time conflict telemetry excluded in compliance with Zero-Paid-API terms.")

        return RetrievalPlan(
            plan_id=f"plan_{uuid.uuid4().hex[:8]}",
            target_entities=[e.name for e in entities.entities],
            target_geographies=geos or ["IND", "WLD"],
            time_horizon=request.time_horizon or "30d",
            candidate_connectors=candidate_connectors,
            required_freshness_hours=48,
            evidence_diversity_min_sources=2,
            identified_gaps=gaps
        )

retrieval_planning_agent = RetrievalPlanningAgent()
