import uuid
from datetime import datetime, timezone
from ..schemas.models import (
    QuestionIntakeRequest,
    PipelineExecutionResult
)
from ..agents.question_understanding import question_understanding_agent
from ..agents.retrieval_planning import retrieval_planning_agent
from ..dataset_builder.builder import dataset_builder
from ..agents.context_builder import context_builder_agent
from ..agents.impact_analysis import impact_analysis_agent
from ..agents.prediction_scenario import prediction_scenario_agent
from ..agents.strategy_generation import strategy_generation_agent
from ..agents.strategy_risk_review import strategy_risk_review_agent
from ..agents.response_composition import response_composition_agent

class GeoSentinelPipeline:
    """
    Canonical 12-Stage Pipeline Orchestrator.
    Executes stages 1 through 12 sequentially and returns a validated structured answer.
    """

    async def execute(self, request: QuestionIntakeRequest) -> PipelineExecutionResult:
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        q_id = f"q_{uuid.uuid4().hex[:8]}"

        # Stages 1, 2, 3: Intake, Intent Classification, Entity Extraction
        intent_out, entity_out = question_understanding_agent.process(request)

        # Stage 4: Retrieval Planning
        plan = retrieval_planning_agent.create_plan(request, intent_out, entity_out)

        # Stages 5 & 6: Dataset Builder & Evidence DNA Verification
        verified_evidence = await dataset_builder.build_dataset(plan)

        # Stage 7: Context Builder
        context = context_builder_agent.build_context(request.session_id, verified_evidence)

        # Stage 8: Risk and Impact Analysis (GeoCausal)
        pathways = impact_analysis_agent.analyze_impacts(request.question, plan.target_geographies, context)

        # Stage 9: Prediction and Scenario Analysis (GeoFork)
        scenarios = prediction_scenario_agent.generate_scenarios(request.question, context)

        # Stage 10: Strategy Generation
        strategies_draft = strategy_generation_agent.generate_strategies(request.question, pathways, context)

        # Stage 11: Mandatory Independent Strategy Risk Review Gate (Red Team)
        reviewed_strategies = strategy_risk_review_agent.review_strategies(strategies_draft, context)

        # Stage 12: Explainability & 4-Section Response Composition
        answer = response_composition_agent.compose_answer(
            question=request.question,
            context=context,
            pathways=pathways,
            scenarios=scenarios,
            strategies=reviewed_strategies
        )

        completed_at = datetime.now(timezone.utc).isoformat()

        return PipelineExecutionResult(
            question_id=q_id,
            session_id=request.session_id,
            analysis_run_id=run_id,
            status="COMPLETED",
            answer=answer,
            completed_at=completed_at
        )

geosentinel_pipeline = GeoSentinelPipeline()
