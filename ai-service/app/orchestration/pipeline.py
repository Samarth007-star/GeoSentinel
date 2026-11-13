import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from ..schemas.models import (
    QuestionIntakeRequest,
    PipelineExecutionResult,
    GeoSentinelAnswer,
    CurrentSituationSection,
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
from ..services.llm_service import live_llm_service

logger = logging.getLogger("geosentinel.pipeline")


class GeoSentinelPipeline:
    """
    Canonical 12-Stage Pipeline Orchestrator + Intelligent Query Analyzer Fast-Path.
    Analyzes user query intent FIRST: conversational greetings, small talk, thanks, help,
    and unclear inputs receive concise natural replies without triggering heavy connectors or strategies.
    """

    @staticmethod
    def _build_conversational_result(
        request: QuestionIntakeRequest,
        run_id: str,
        q_id: str,
        chat_output: Dict[str, Any],
        rationale: str,
    ) -> PipelineExecutionResult:
        now_iso = datetime.now(timezone.utc).isoformat()
        primary_msg = ""
        for sec in chat_output.get("sections", []):
            if sec.get("content"):
                primary_msg = sec["content"]
                break

        answer = GeoSentinelAnswer(
            current_situation=CurrentSituationSection(
                summary=primary_msg or "Hello! How can I help you today?",
                as_of=now_iso,
                verified_facts=[],
                attributed_claims=[],
            ),
            relevant_evidence=[],
            impact_analysis=[],
            strategy_recommendations=[],
            scenarios=[],
            confidence_rationale=rationale,
            limitations=[],
            chat_output=chat_output,
        )
        return PipelineExecutionResult(
            question_id=q_id,
            session_id=request.session_id,
            analysis_run_id=run_id,
            status="COMPLETED",
            answer=answer,
            completed_at=now_iso,
        )

    async def execute(self, request: QuestionIntakeRequest) -> PipelineExecutionResult:
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        q_id = f"q_{uuid.uuid4().hex[:8]}"

        # Stage 0: Powerful Query Analyzer Pre-Flight Check
        query_profile = question_understanding_agent.analyze_query(
            request.question,
            request.geographies,
        )

        # Fast-path: pure greeting, small talk, thanks/bye, identity/help, unclear input
        if query_profile.is_conversational:
            chat_out = live_llm_service.build_conversational_response(
                request.question,
                query_profile,
                user_name=request.user_name,
            )
            chat_out["query_analysis"] = {
                "query_type": query_profile.query_type,
                "complexity": query_profile.complexity,
                "signals": query_profile.key_signals,
            }
            return self._build_conversational_result(
                request=request,
                run_id=run_id,
                q_id=q_id,
                chat_output=chat_out,
                rationale=query_profile.intent_rationale,
            )

        # Ambiguous short-message LLM Query Analyzer Guard (before running heavy connectors)
        casual_override = await asyncio.to_thread(
            live_llm_service.classify_ambiguous_query,
            request.question,
            query_profile,
        )
        if casual_override is not None:
            casual_override["query_analysis"] = {
                "query_type": "CONVERSATIONAL",
                "complexity": "conversational",
                "signals": ["llm_query_analyzer_guard"],
            }
            return self._build_conversational_result(
                request=request,
                run_id=run_id,
                q_id=q_id,
                chat_output=casual_override,
                rationale="Classified as conversational chat by LLM Query Analyzer Guard.",
            )

        # Clean request if user prefixed a greeting like "Hi, what is the risk of..."
        effective_request = (
            request.model_copy(update={"question": query_profile.cleaned_question})
            if query_profile.greeting_stripped
            else request
        )

        # Stages 1, 2, 3: Intake, Intent Classification, Entity Extraction
        intent_out, entity_out = await question_understanding_agent.process(effective_request)

        # Stage 4: Retrieval Planning
        plan = retrieval_planning_agent.create_plan(effective_request, intent_out, entity_out)

        # Stages 5 & 6: Dataset Builder & Evidence DNA Verification
        verified_evidence = await dataset_builder.build_dataset(plan)

        # Stage 7: Context Builder
        context = context_builder_agent.build_context(effective_request.session_id, verified_evidence)

        # Stage 8: Risk and Impact Analysis (GeoCausal)
        pathways = impact_analysis_agent.analyze_impacts(
            effective_request.question,
            plan.target_geographies,
            context,
        )

        # Stage 9: Prediction and Scenario Analysis (GeoFork)
        scenarios = prediction_scenario_agent.generate_scenarios(effective_request.question, context)

        # Stage 10: Strategy Generation
        strategies_draft = strategy_generation_agent.generate_strategies(
            effective_request.question,
            pathways,
            context,
        )

        # Stage 11: Mandatory Independent Strategy Risk Review Gate (Red Team)
        reviewed_strategies = strategy_risk_review_agent.review_strategies(strategies_draft, context)

        # Stage 12: Explainability & Schema Response Composition
        answer = response_composition_agent.compose_answer(
            question=effective_request.question,
            context=context,
            pathways=pathways,
            scenarios=scenarios,
            strategies=reviewed_strategies,
        )

        # Stage 13: Live LLM Real-Time Analysis (Query-Analyzer-Guided, No hardcoded answers)
        try:
            live_analysis = await asyncio.to_thread(
                live_llm_service.analyze,
                effective_request.question,
                query_profile,
            )
            live_analysis["query_analysis"] = {
                "query_type": query_profile.query_type,
                "complexity": query_profile.complexity,
                "greeting_stripped": query_profile.greeting_stripped,
                "search_keywords": query_profile.search_keywords,
                "signals": query_profile.key_signals,
            }
            answer.chat_output = live_analysis
        except Exception as e:
            logger.error(f"Live LLM execution error: {e}")

        completed_at = datetime.now(timezone.utc).isoformat()

        return PipelineExecutionResult(
            question_id=q_id,
            session_id=request.session_id,
            analysis_run_id=run_id,
            status="COMPLETED",
            answer=answer,
            completed_at=completed_at,
        )


geosentinel_pipeline = GeoSentinelPipeline()
