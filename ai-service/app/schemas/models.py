from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# ==========================================
# 1. Enums
# ==========================================

class IntentCategory(str, Enum):
    SITUATIONAL_SUMMARY = "situational_summary"
    EVENT_LOOKUP = "event_lookup"
    IMPACT_ANALYSIS = "impact_analysis"
    CONDITIONAL_SCENARIO = "conditional_scenario"
    FORECAST_PREDICTION = "forecast_prediction"
    STRATEGY_COMPARISON = "strategy_comparison"
    INFRASTRUCTURE_OUTAGE = "infrastructure_outage"
    REPORT_GENERATION = "report_generation"

class EntityType(str, Enum):
    COUNTRY = "country"
    ORGANIZATION = "organization"
    PERSON = "person"
    LOCATION = "location"
    SECTOR = "sector"
    INFRASTRUCTURE = "infrastructure"
    EVENT = "event"
    INDICATOR = "indicator"

class VerificationState(str, Enum):
    UNVERIFIED = "UNVERIFIED"
    SOURCE_REFERENCED = "SOURCE_REFERENCED"
    CROSS_CHECKED = "CROSS_CHECKED"
    VERIFIED = "VERIFIED"
    CONFLICTING = "CONFLICTING"
    REJECTED = "REJECTED"

class RiskReviewStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED_WITH_LIMITATIONS = "APPROVED_WITH_LIMITATIONS"
    REQUIRES_REVISION = "REQUIRES_REVISION"
    REJECTED = "REJECTED"
    WITHHOLD = "WITHHOLD"

class ConnectorStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DISABLED = "DISABLED"
    LICENSE_CHECK = "LICENSE_CHECK"
    RATE_LIMITED = "RATE_LIMITED"
    ERROR = "ERROR"

# ==========================================
# 2. Pipeline Stage Models
# ==========================================

class QuestionIntakeRequest(BaseModel):
    session_id: str
    question: str
    time_horizon: Optional[str] = "30d"
    geographies: Optional[List[str]] = Field(default_factory=list)
    include_categories: Optional[List[str]] = Field(default_factory=list)
    refresh_evidence: bool = False

class IntentOutput(BaseModel):
    primary_intent: IntentCategory
    confidence: float = Field(ge=0.0, le=1.0)
    requires_geocausal: bool = True
    requires_scenario: bool = False
    requires_strategy: bool = True
    intent_rationale: str

class ExtractedEntity(BaseModel):
    name: str
    entity_type: EntityType
    canonical_id: Optional[str] = None
    aliases: List[str] = Field(default_factory=list)
    confidence: float = 1.0

class EntityExtractionOutput(BaseModel):
    entities: List[ExtractedEntity]
    unresolved_ambiguities: List[str] = Field(default_factory=list)

class RetrievalPlan(BaseModel):
    plan_id: str
    target_entities: List[str]
    target_geographies: List[str]
    time_horizon: str
    candidate_connectors: List[str]
    required_freshness_hours: int = 48
    evidence_diversity_min_sources: int = 2
    identified_gaps: List[str] = Field(default_factory=list)

class EvidenceRecord(BaseModel):
    evidence_id: str
    source_id: str
    source_name: str
    source_url: str
    title: str
    claim_text: str
    evidence_type: str = "statistical_indicator"
    published_at: Optional[str] = None
    retrieved_at: str
    geography: Optional[str] = None
    verification_status: VerificationState = VerificationState.UNVERIFIED
    verification_rationale: str = ""
    license_id: str = "open_access"
    attribution: str = ""
    content_hash: str = ""
    corroboration_ids: List[str] = Field(default_factory=list)
    contradiction_ids: List[str] = Field(default_factory=list)
    limitations: Optional[str] = None

class ContextSnapshot(BaseModel):
    session_id: str
    verified_facts: List[str] = Field(default_factory=list)
    source_referenced_claims: List[str] = Field(default_factory=list)
    conflicting_claims: List[str] = Field(default_factory=list)
    evidence_items: List[EvidenceRecord] = Field(default_factory=list)
    missing_data_disclosures: List[str] = Field(default_factory=list)

# ==========================================
# 3. GeoCausal & GeoFork Models
# ==========================================

class ImpactPathwayNode(BaseModel):
    node_id: str
    label: str
    node_type: str  # event, commodity, sector, outcome
    evidence_ref: Optional[str] = None

class GeoCausalPathway(BaseModel):
    pathway_id: str
    sector: str
    title: str
    direct_impact: str
    indirect_impact: str
    second_order_effects: List[str] = Field(default_factory=list)
    affected_geographies: List[str]
    affected_populations: List[str]
    time_horizon: str
    nodes: List[ImpactPathwayNode]
    uncertainty_level: str  # LOW, MEDIUM, HIGH
    evidence_citations: List[str]

class GeoForkScenario(BaseModel):
    scenario_id: str
    name: str
    assumptions: List[str]
    probability_description: str  # Qualitative unless scientifically calibrated
    key_drivers: List[str]
    projected_outcomes: List[str]
    monitoring_indicators: List[str]

# ==========================================
# 4. Strategy & Mandatory Risk Review Models
# ==========================================

class StrategyMitigation(BaseModel):
    mitigation_id: str
    description: str
    trigger_indicator: str
    fallback_action: str

class StrategyRiskReviewResult(BaseModel):
    review_id: str
    reviewer: str = "IndependentRedTeamReviewer_v1"
    disposition: RiskReviewStatus
    findings: str
    unintended_consequences: List[str]
    second_order_harms: List[str]
    escalation_risks: List[str]
    affected_vulnerable_groups: List[str]
    required_mitigations: List[StrategyMitigation]
    residual_risk_disclosure: str

class StrategyOption(BaseModel):
    option_id: str
    title: str
    objective: str
    causal_mechanism: str
    prerequisites: List[str]
    benefits: List[str]
    tradeoffs: List[str]
    time_horizon: str
    evidence_basis: List[str]
    risk_review: StrategyRiskReviewResult
    fallback_option: str

# ==========================================
# 5. Canonical 4-Section Answer Models
# ==========================================

class CurrentSituationSection(BaseModel):
    summary: str
    as_of: str
    verified_facts: List[str]
    attributed_claims: List[str]

class EvidenceItemSection(BaseModel):
    evidence_id: str
    source_name: str
    source_url: str
    published_date: Optional[str]
    retrieval_date: str
    verification_status: VerificationState
    relevance: str
    conflicts_or_limitations: Optional[str] = None

class ImpactAnalysisSection(BaseModel):
    sector: str
    pathway: str
    horizon: str
    direct_impact: str
    indirect_impact: str
    affected_populations: List[str]
    uncertainty: str

class StrategyRecommendationSection(BaseModel):
    option_id: str
    title: str
    objective: str
    mechanism: str
    benefits: List[str]
    tradeoffs: List[str]
    unintended_consequences: List[str]
    risk_review_status: RiskReviewStatus
    required_mitigations: List[str]
    residual_risk: str
    fallback: str

class GeoSentinelAnswer(BaseModel):
    current_situation: CurrentSituationSection
    relevant_evidence: List[EvidenceItemSection]
    impact_analysis: List[ImpactAnalysisSection]
    strategy_recommendations: List[StrategyRecommendationSection]
    scenarios: List[GeoForkScenario] = Field(default_factory=list)
    confidence_rationale: str
    limitations: List[str]

class PipelineExecutionResult(BaseModel):
    question_id: str
    session_id: str
    analysis_run_id: str
    status: str
    pipeline_version: str = "1.0.0"
    model_version: str = "local_deterministic_v1"
    answer: GeoSentinelAnswer
    completed_at: str
