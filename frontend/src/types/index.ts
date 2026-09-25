export type VerificationState =
  | 'VERIFIED'
  | 'CROSS_CHECKED'
  | 'SOURCE_REFERENCED'
  | 'UNVERIFIED'
  | 'CONFLICTING'
  | 'REJECTED';

export type RiskReviewStatus =
  | 'PENDING'
  | 'APPROVED_WITH_LIMITATIONS'
  | 'REQUIRES_REVISION'
  | 'REJECTED'
  | 'WITHHOLD';

export interface CurrentSituation {
  summary: string;
  as_of: string;
  verified_facts: string[];
  attributed_claims: string[];
}

export interface EvidenceItem {
  evidence_id: string;
  source_name: string;
  source_url: string;
  published_date?: string;
  retrieval_date: string;
  verification_status: VerificationState;
  relevance: string;
  conflicts_or_limitations?: string;
}

export interface ImpactAnalysisItem {
  sector: string;
  pathway: string;
  horizon: string;
  direct_impact: string;
  indirect_impact: string;
  affected_populations: string[];
  uncertainty: string;
}

export interface StrategyRecommendation {
  option_id: string;
  title: string;
  objective: string;
  mechanism: string;
  benefits: string[];
  tradeoffs: string[];
  unintended_consequences: string[];
  risk_review_status: RiskReviewStatus;
  required_mitigations: string[];
  residual_risk: string;
  fallback: string;
}

export interface GeoForkScenario {
  scenario_id: string;
  name: string;
  assumptions: string[];
  probability_description: string;
  key_drivers: string[];
  projected_outcomes: string[];
  monitoring_indicators: string[];
}

export interface GeoSentinelAnswer {
  current_situation: CurrentSituation;
  relevant_evidence: EvidenceItem[];
  impact_analysis: ImpactAnalysisItem[];
  strategy_recommendations: StrategyRecommendation[];
  scenarios?: GeoForkScenario[];
  confidence_rationale: string;
  limitations: string[];
}

export interface AnalysisResult {
  question_id: string;
  session_id: string;
  analysis_run_id: string;
  status: string;
  answer: GeoSentinelAnswer;
  completed_at: string;
}

export interface ConnectorInfo {
  id: string;
  category: string;
  provider: string;
  status: string;
  license: string;
  termsUrl: string;
}
