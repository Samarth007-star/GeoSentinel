import uuid
from typing import List
from ..schemas.models import (
    ContextSnapshot,
    GeoCausalPathway,
    ImpactPathwayNode,
    EvidenceRecord
)

class ImpactAnalysisAgent:
    """
    Stage 8: GeoCausal Evidence-Linked Impact Propagation Engine.
    Maps direct, indirect, and second-order impact pathways supported by evidence citations.
    """

    def analyze_impacts(
        self,
        question: str,
        geographies: List[str],
        context: ContextSnapshot
    ) -> List[GeoCausalPathway]:
        pathways: List[GeoCausalPathway] = []
        geos = geographies or ["India"]

        # Find supporting evidence IDs
        energy_ev = [e.evidence_id for e in context.evidence_items if "energy" in e.claim_text.lower() or "gdp" in e.claim_text.lower()]
        disaster_ev = [e.evidence_id for e in context.evidence_items if "usgs" in e.source_id.lower() or "nasa" in e.source_id.lower()]

        # Pathway 1: Energy & Trade Exposure Pathway
        nodes_p1 = [
            ImpactPathwayNode(node_id="n1", label="Geopolitical naval friction / Strait of Hormuz bottleneck", node_type="event", evidence_ref=energy_ev[0] if energy_ev else None),
            ImpactPathwayNode(node_id="n2", label="Crude freight tanker insurance & Brent price surge", node_type="commodity"),
            ImpactPathwayNode(node_id="n3", label="Domestic OMC import cost expansion", node_type="market_exposure"),
            ImpactPathwayNode(node_id="n4", label="Inflationary pressure on freight tariffs and consumer goods", node_type="domestic_sector")
        ]

        pathways.append(GeoCausalPathway(
            pathway_id=f"path_{uuid.uuid4().hex[:8]}",
            sector="Energy & Macroeconomic Inflation",
            title="Persian Gulf Maritime Disruption to Domestic Fuel and Trade Pass-Through",
            direct_impact="Sudden upward pressure on landed crude import bill and foreign exchange reserves.",
            indirect_impact="Higher logistics freight rates filtering into vegetable and fertilizer supply chains.",
            second_order_effects=[
                "Fiscal pressure on central fertilizer and LPG fuel subsidies.",
                "Short-term rupee depreciation relative to USD."
            ],
            affected_geographies=geos,
            affected_populations=[
                "Commercial transport fleet operators",
                "Urban fuel consumers",
                "Agricultural sector (fertilizer dependency)"
            ],
            time_horizon="15 to 45 days",
            nodes=nodes_p1,
            uncertainty_level="MEDIUM",
            evidence_citations=energy_ev[:2]
        ))

        # Pathway 2: Supply Chain & Diaspora Remittance Pathway
        nodes_p2 = [
            ImpactPathwayNode(node_id="n2_1", label="Airspace re-routing and commercial flight cancellations", node_type="infrastructure"),
            ImpactPathwayNode(node_id="n2_2", label="Expatriate worker safety and banking channel disruptions", node_type="population_exposure"),
            ImpactPathwayNode(node_id="n2_3", label="Slowdown in Gulf-to-South Asia bilateral remittances", node_type="outcome")
        ]

        pathways.append(GeoCausalPathway(
            pathway_id=f"path_{uuid.uuid4().hex[:8]}",
            sector="Consular & Civil Aviation",
            title="Airspace Restrictions and Expatriate Remittance Transmission Strain",
            direct_impact="Rerouting of Westbound commercial aviation corridors increasing transit time and fuel burn.",
            indirect_impact="Temporary friction in commercial banking remittances from Gulf diaspora hubs.",
            second_order_effects=[
                "Consular evacuation contingency planning overhead.",
                "Increased international passenger ticket fares."
            ],
            affected_geographies=geos,
            affected_populations=[
                "Gulf expatriate diaspora workforce and dependents",
                "International airline passengers and cargo carriers"
            ],
            time_horizon="30 to 90 days",
            nodes=nodes_p2,
            uncertainty_level="HIGH",
            evidence_citations=energy_ev[:1]
        ))

        return pathways

impact_analysis_agent = ImpactAnalysisAgent()
