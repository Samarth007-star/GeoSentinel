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

        is_internet = any(w in q_lower for w in ["internet", "outage", "disruption", "censorship", "connectivity", "telecom", "cable", "ooni", "ioda", "bgp", "dns", "probe"])
        is_humanitarian = any(w in q_lower for w in ["humanitarian", "refugee", "ocha", "aid", "famine", "displacement", "asylum"])
        is_attention = any(w in q_lower for w in ["public digital attention", "digital attention", "pageviews", "wikipedia", "attention to", "attention"])
        is_entity = any(w in q_lower for w in ["structured information", "organization", "entities", "wikidata", "relationship", "capital", "currency"])
        is_economic = any(w in q_lower for w in ["economic", "gdp", "trade", "oil", "energy", "shipping", "sanction", "export", "import", "inflation", "financial", "crude", "petroleum", "fuel", "chokepoint"])
        is_science = any(w in q_lower for w in ["earthquake", "seismic", "volcano", "wildfire", "cyclone", "flood", "weather", "tsunami", "hazard"])
        is_geopolitical = any(w in q_lower for w in ["geopolitical", "escalate", "middle east", "impact on", "iran", "conflict", "military", "security", "developments", "hormuz", "strait", "persian gulf", "tensions"])

        is_wb_specific = any(w in q_lower for w in ["world bank", "indicator's value", "observation year", "available world bank", "economic indicators"])

        domain_categories: List[str] = []
        if is_wb_specific and not is_geopolitical and not is_science and not is_humanitarian:
            domain_categories = ["Economic & Financial Data"]
        else:
            if is_internet:
                domain_categories.extend(["Internet & Infrastructure", "News"])
            if is_humanitarian:
                domain_categories.extend(["International Organizations", "News", "Geographic & Entities"])
            if is_attention or is_geopolitical:
                domain_categories.append("Public Social/Digital Signals")
            if is_entity or is_geopolitical:
                domain_categories.append("Geographic & Entities")
            if is_economic or is_geopolitical:
                domain_categories.extend(["Economic & Financial Data", "News", "Conflict & Political Events"])
            if is_science:
                domain_categories.extend(["Scientific & Disaster Data", "News"])

        if not domain_categories:
            domain_categories = ["Economic & Financial Data", "News", "Geographic & Entities", "Public Social/Digital Signals"]

        if request.include_categories:
            candidate_connectors = []
            for cat in request.include_categories:
                # Prune scientific/disaster telemetry if the query has zero scientific keywords
                if any(s in cat.lower() for s in ["scientific", "disaster"]) and not is_science:
                    continue
                # Prune humanitarian/UN SDG if strictly an energy/economic/military/indicator question
                if any(s in cat.lower() for s in ["international"]) and not is_humanitarian and (is_economic or is_geopolitical or is_wb_specific):
                    continue
                # Prune news if strictly asking for official indicators
                if is_wb_specific and any(s in cat.lower() for s in ["news", "social"]):
                    continue
                candidate_connectors.append(cat)
            for d in domain_categories:
                if d not in candidate_connectors:
                    candidate_connectors.append(d)
        else:
            candidate_connectors = domain_categories

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
