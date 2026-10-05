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

        q_lower = request.question.lower()
        candidate_connectors = []

        if request.include_categories:
            candidate_connectors = request.include_categories
        else:
            # Domain-targeted category selection
            is_internet = any(w in q_lower for w in ["internet", "outage", "disruption", "censorship", "connectivity", "telecom", "cable", "ooni", "ioda", "bgp", "dns", "probe"])
            is_humanitarian = any(w in q_lower for w in ["humanitarian", "crisis", "disaster", "relief", "refugee", "ocha", "aid", "famine", "displacement"])
            is_attention = any(w in q_lower for w in ["public digital attention", "digital attention", "pageviews", "wikipedia", "attention to", "attention"])
            is_entity = any(w in q_lower for w in ["structured information", "organization", "entities", "wikidata", "relationship", "capital", "currency"])
            is_economic = any(w in q_lower for w in ["economic", "gdp", "trade", "oil", "energy", "shipping", "sanction", "export", "import", "inflation", "financial"])
            is_science = any(w in q_lower for w in ["earthquake", "seismic", "volcano", "wildfire", "cyclone", "flood", "weather", "tsunami"])

            if is_internet:
                candidate_connectors.extend(["Internet & Infrastructure", "News"])
            if is_humanitarian:
                candidate_connectors.extend(["International Organizations", "News", "Geographic & Entities"])
            if is_attention:
                candidate_connectors.append("Public Social/Digital Signals")
            if is_entity:
                candidate_connectors.append("Geographic & Entities")
            if is_economic:
                candidate_connectors.extend(["Economic & Financial Data", "News", "Geographic & Entities", "Public Social/Digital Signals"])
            if is_science:
                candidate_connectors.extend(["Scientific & Disaster Data", "News"])

            # If broad geopolitical question (e.g. Test Question 1)
            if not candidate_connectors or any(w in q_lower for w in ["geopolitical", "escalate", "middle east", "impact on"]):
                for cat in ["Economic & Financial Data", "News", "International Organizations", "Geographic & Entities", "Public Social/Digital Signals"]:
                    if cat not in candidate_connectors:
                        candidate_connectors.append(cat)

        gaps = []
        if any("conflict" in c.lower() for c in candidate_connectors):
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
