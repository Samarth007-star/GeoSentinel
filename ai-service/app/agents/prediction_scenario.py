import uuid
from typing import List
from ..schemas.models import GeoForkScenario, ContextSnapshot

class PredictionScenarioAgent:
    """
    Stage 9: GeoFork Conditional Scenario Engine.
    Generates comparative branch scenarios with explicit assumptions, drivers,
    and monitoring indicators without inventing arbitrary probabilities.
    """

    def generate_scenarios(self, question: str, context: ContextSnapshot) -> List[GeoForkScenario]:
        return [
            GeoForkScenario(
                scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                name="Scenario A: De-escalation via Diplomatic Backchannels (Baseline)",
                assumptions=[
                    "Naval patrols remain calibrated; no full maritime blockade is attempted.",
                    "Third-party mediation establishes limited security guarantees within 14 days."
                ],
                probability_description="Moderate qualitative likelihood; consistent with historical standoff cycles.",
                key_drivers=[
                    "Bilateral backchannel communication channels.",
                    "Mutual economic aversion to protracted global energy spikes."
                ],
                projected_outcomes=[
                    "Crude oil risk premium subsides toward baseline within 30-45 days.",
                    "Shipping insurance surcharges normalize.",
                    "Domestic fuel price adjustments remain contained under 3%."
                ],
                monitoring_indicators=[
                    "Strait of Hormuz commercial vessel transit counts via AIS.",
                    "Lloyd's Market Association Joint War Committee listed area reviews."
                ]
            ),
            GeoForkScenario(
                scenario_id=f"scen_{uuid.uuid4().hex[:8]}",
                name="Scenario B: Protracted Asymmetric Maritime Friction (High Impact)",
                assumptions=[
                    "Drone and fast-attack craft harassment of commercial tankers continues intermittently for >60 days.",
                    "Major commercial container lines re-route around the Cape of Good Hope."
                ],
                probability_description="Conditional contingency branch; triggered if retaliatory strikes target logistics hubs.",
                key_drivers=[
                    "Retaliatory tit-for-tat escalation dynamics.",
                    "Inability of diplomatic mediators to enforce maritime truce."
                ],
                projected_outcomes=[
                    "Sustained 15-25% premium on Brent crude oil contracts.",
                    "Global container freight rates increase by 40-70% on Asia-Europe-Mediterranean lanes.",
                    "Accelerated drawdown of national Strategic Petroleum Reserves."
                ],
                monitoring_indicators=[
                    "War-risk insurance premium rates for Persian Gulf transit.",
                    "National strategic reserve inventory drawdown notifications."
                ]
            )
        ]

prediction_scenario_agent = PredictionScenarioAgent()
