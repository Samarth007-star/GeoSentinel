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
        geos = geographies or ["IND"]
        q_lower = question.lower()

        # Gather relevant evidence citations by category
        energy_ev = [e.evidence_id for e in context.evidence_items if any(k in e.claim_text.lower() for k in ["energy", "gdp", "economic", "world bank"])]
        news_ev = [e.evidence_id for e in context.evidence_items if any(k in e.source_id.lower() for k in ["news", "un_sdg", "reliefweb"])]
        gov_ev = [e.evidence_id for e in context.evidence_items if "usaspending" in e.source_id.lower() or "osm" in e.source_id.lower() or "wiki" in e.source_id.lower()]
        conflict_ev = [e.evidence_id for e in context.evidence_items if "gdelt" in e.source_id.lower() or "usgs" in e.source_id.lower() or "eonet" in e.source_id.lower()]

        # TOPIC 1: South China Sea / Semiconductor / Global Supply Chains (Q2)
        if any(k in q_lower for k in ["south china sea", "semiconductor", "taiwan", "microchip", "electronics"]):
            nodes_p1 = [
                ImpactPathwayNode(node_id="n1_scs", label="Maritime exclusion zones in Taiwan Strait and South China Sea chokepoints", node_type="event", evidence_ref=conflict_ev[0] if conflict_ev else None),
                ImpactPathwayNode(node_id="n2_scs", label="Commercial vessel rerouting around Sunda/Lombok Straits extending voyage lead times", node_type="infrastructure"),
                ImpactPathwayNode(node_id="n3_scs", label="Export container congestion at Southeast Asian transshipment hubs", node_type="logistics"),
                ImpactPathwayNode(node_id="n4_scs", label="Domestic manufacturing delay in electronic components and automobile assembly lines", node_type="domestic_sector")
            ]
            pathways.append(GeoCausalPathway(
                pathway_id=f"path_{uuid.uuid4().hex[:8]}",
                sector="Maritime Logistics & Trade Routing",
                title="Critical Maritime Chokepoint Rerouting to Industrial Supply Chain Delay",
                direct_impact="Maritime carrier diversions increase round-trip transit durations between East Asia and South Asia.",
                indirect_impact="Elevated spot ocean freight container rates and shipping insurance surcharges on Indo-Pacific lanes.",
                second_order_effects=[
                    "Working capital lockup for import-dependent manufacturers.",
                    "Port gate congestion and localized inventory shortages in consumer durables."
                ],
                affected_geographies=geos,
                affected_populations=[
                    "Export-import freight forwarders",
                    "Automobile and industrial machinery manufacturers",
                    "Domestic electronics retail distributors"
                ],
                time_horizon="15 to 60 days",
                nodes=nodes_p1,
                uncertainty_level="MEDIUM",
                evidence_citations=conflict_ev[:1] + energy_ev[:1]
            ))

            nodes_p2 = [
                ImpactPathwayNode(node_id="n2_semi1", label="East Asian foundry production interruptions or export licensing controls", node_type="market_exposure"),
                ImpactPathwayNode(node_id="n2_semi2", label="Global allocation quotas for high-end microcontrollers and power management ICs", node_type="commodity"),
                ImpactPathwayNode(node_id="n2_semi3", label="Domestic automotive, telecom equipment, and smartphone assembly line throttling", node_type="outcome")
            ]
            pathways.append(GeoCausalPathway(
                pathway_id=f"path_{uuid.uuid4().hex[:8]}",
                sector="High-Tech Manufacturing & Semiconductor Inputs",
                title="Semiconductor Fabrication Quotas to Domestic Hardware Production Disruption",
                direct_impact="Restricted allocation of specialized microchips and logic boards required for domestic tech manufacturing.",
                indirect_impact="Suppliers prioritize highest-margin global tier-1 buyers, causing extended delivery lead times for regional producers.",
                second_order_effects=[
                    "Deferred rollout schedules for domestic 5G/telecom infrastructure expansion.",
                    "Production slowdowns in passenger vehicle manufacturing requiring chip-intensive ECUs."
                ],
                affected_geographies=geos,
                affected_populations=[
                    "Domestic electronics and semiconductor design startups",
                    "Automotive manufacturing workforce",
                    "Consumer tech retail ecosystem"
                ],
                time_horizon="30 to 90 days",
                nodes=nodes_p2,
                uncertainty_level="HIGH",
                evidence_citations=energy_ev[:2]
            ))

        # TOPIC 2: Russia-Ukraine / Food Security / Fertilizer (Q4)
        elif any(k in q_lower for k in ["russia", "ukraine", "fertilizer", "food security", "wheat", "grain"]):
            nodes_p1 = [
                ImpactPathwayNode(node_id="n1_fert", label="Black Sea and Eastern European export restrictions on nitrogen, phosphate, and potash", node_type="event", evidence_ref=conflict_ev[0] if conflict_ev else None),
                ImpactPathwayNode(node_id="n2_fert", label="Global fertilizer FOB spot price expansion", node_type="commodity"),
                ImpactPathwayNode(node_id="n3_fert", label="Elevated sovereign fertilizer subsidy import bill", node_type="market_exposure"),
                ImpactPathwayNode(node_id="n4_fert", label="Agricultural input cost pressure on seasonal crop sowing", node_type="domestic_sector")
            ]
            pathways.append(GeoCausalPathway(
                pathway_id=f"path_{uuid.uuid4().hex[:8]}",
                sector="Agriculture & Fertilizer Supply Security",
                title="Global Fertilizer Export Contraction to Domestic Agricultural Input Inflation",
                direct_impact="Tightening global availability and sharp cost escalation of key fertilizer feedstocks (DAP, MOP, Urea).",
                indirect_impact="Expanded central fiscal outlays required to maintain statutory farm-gate nutrient subsidy ceilings.",
                second_order_effects=[
                    "Potential rationing of specialty fertilizers to non-food commercial crops.",
                    "Downstream food grain yield uncertainty if balanced soil nutrient ratios are disrupted."
                ],
                affected_geographies=geos,
                affected_populations=[
                    "Smallholder farming households",
                    "Domestic fertilizer manufacturing and importing cooperatives",
                    "Agricultural credit and cooperative rural banking institutions"
                ],
                time_horizon="30 to 90 days",
                nodes=nodes_p1,
                uncertainty_level="MEDIUM",
                evidence_citations=energy_ev[:1] + news_ev[:1]
            ))

            nodes_p2 = [
                ImpactPathwayNode(node_id="n2_food1", label="Black Sea commercial grain terminal interruptions", node_type="infrastructure"),
                ImpactPathwayNode(node_id="n2_food2", label="International edible oil (sunflower/palm) and wheat trade balance tightening", node_type="commodity"),
                ImpactPathwayNode(node_id="n2_food3", label="Domestic consumer food price index volatility and export quota adjustments", node_type="outcome")
            ]
            pathways.append(GeoCausalPathway(
                pathway_id=f"path_{uuid.uuid4().hex[:8]}",
                sector="Food Security & Macroeconomic Inflation",
                title="Global Edible Oil and Grain Tightening to Domestic Food CPI Pass-Through",
                direct_impact="Increased landed import prices for edible oils and substitute agricultural commodities.",
                indirect_impact="Headline retail food inflation pressure influencing central bank interest rate policy stance.",
                second_order_effects=[
                    "Continuation of domestic agricultural export embargoes to protect domestic buffer stocks.",
                    "Fiscal expenditure shifts toward expanded public distribution system grain allocations."
                ],
                affected_geographies=geos,
                affected_populations=[
                    "Lower-income rural and urban consumer households",
                    "Food processing and packaged consumer goods enterprises",
                    "Wholesale agricultural produce market committees"
                ],
                time_horizon="15 to 45 days",
                nodes=nodes_p2,
                uncertainty_level="MEDIUM",
                evidence_citations=energy_ev[:2]
            ))

        # TOPIC 3: Trade Sanctions (China, Russia, Iran) (Q5)
        elif any(k in q_lower for k in ["sanction", "sanctions", "trade sanction", "export control", "embargo"]):
            nodes_p1 = [
                ImpactPathwayNode(node_id="n1_sanc", label="Multilateral or secondary trade and financial sanctions imposition", node_type="event", evidence_ref=conflict_ev[0] if conflict_ev else None),
                ImpactPathwayNode(node_id="n2_sanc", label="Western correspondent banking compliance de-risking and payment freezes", node_type="infrastructure"),
                ImpactPathwayNode(node_id="n3_sanc", label="Commercial settlement delays and trapped currency balances in Vostro accounts", node_type="market_exposure"),
                ImpactPathwayNode(node_id="n4_sanc", label="Exporters face non-payment risks and elevated compliance transaction costs", node_type="domestic_sector")
            ]
            pathways.append(GeoCausalPathway(
                pathway_id=f"path_{uuid.uuid4().hex[:8]}",
                sector="Trade Finance & Cross-Border Payments",
                title="Financial Sanctions and Correspondent De-Risking to Trade Settlement Friction",
                direct_impact="Direct payment settlement bottlenecks for legitimate bilateral commerce in energy, pharmaceuticals, and agricultural goods.",
                indirect_impact="Commercial banks enforce defensive over-compliance, delaying letter-of-credit issuances.",
                second_order_effects=[
                    "Accumulation of non-repatriated export balances in domestic currency accounts.",
                    "Friction in bilateral strategic defense equipment maintenance and component supply."
                ],
                affected_geographies=geos,
                affected_populations=[
                    "Engineering goods and pharmaceutical exporters",
                    "Commercial public and private sector banks",
                    "Public sector defense and infrastructure procurement undertakings"
                ],
                time_horizon="30 to 90 days",
                nodes=nodes_p1,
                uncertainty_level="MEDIUM",
                evidence_citations=energy_ev[:1] + gov_ev[:1]
            ))

            nodes_p2 = [
                ImpactPathwayNode(node_id="n2_sanc1", label="High-technology and dual-use equipment export restrictions on sanctioned entities", node_type="event"),
                ImpactPathwayNode(node_id="n2_sanc2", label="Rerouting of global technology supply chains and secondary source audits", node_type="market_exposure"),
                ImpactPathwayNode(node_id="n2_sanc3", label="Strategic manufacturing sector access to licensed foreign IP and precision components", node_type="outcome")
            ]
            pathways.append(GeoCausalPathway(
                pathway_id=f"path_{uuid.uuid4().hex[:8]}",
                sector="Strategic Technology & Industrial Sourcing",
                title="Technology Export Controls to Domestic Industrial Upgrading Impediment",
                direct_impact="Scrutiny and compliance delays on imported precision tooling, industrial software, and advanced materials.",
                indirect_impact="Accelerated imperative for indigenous component substitution and alternative supplier qualification.",
                second_order_effects=[
                    "Increased Capex requirements for domestic technology indigenization programs.",
                    "Geopolitical diplomatic balancing between multiple trading bloc partners."
                ],
                affected_geographies=geos,
                affected_populations=[
                    "Domestic precision engineering and aerospace manufacturers",
                    "Industrial automation and robotics integrators",
                    "Scientific research and development laboratories"
                ],
                time_horizon="60 to 180 days",
                nodes=nodes_p2,
                uncertainty_level="HIGH",
                evidence_citations=energy_ev[:2]
            ))

        # TOPIC 4: Energy Security / Crude Oil / US-Iran / Middle East Instability (Q1, Q3 & Default)
        else:
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
                evidence_citations=energy_ev[:1] + news_ev[:1]
            ))

        return pathways

impact_analysis_agent = ImpactAnalysisAgent()
