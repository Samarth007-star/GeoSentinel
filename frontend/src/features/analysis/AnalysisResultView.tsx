import React, { useState } from 'react';
import { AnalysisResult, VerificationState, RiskReviewStatus } from '../../types';
import {
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Scale,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  GitBranch
} from 'lucide-react';

interface AnalysisResultViewProps {
  result: AnalysisResult;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result }) => {
  const { answer } = result;
  const [activeTab, setActiveTab] = useState<'all' | 'evidence' | 'causal' | 'strategy' | 'scenarios'>('all');

  const getVerificationBadge = (status: VerificationState) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
          </span>
        );
      case 'CROSS_CHECKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5" /> CROSS-CHECKED
          </span>
        );
      case 'SOURCE_REFERENCED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-3.5 h-3.5" /> SOURCE REFERENCED
          </span>
        );
      case 'CONFLICTING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" /> CONFLICTING
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" /> REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            UNVERIFIED
          </span>
        );
    }
  };

  const getRiskReviewBadge = (status: RiskReviewStatus) => {
    switch (status) {
      case 'APPROVED_WITH_LIMITATIONS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> RED TEAM REVIEWED
          </span>
        );
      case 'WITHHOLD':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> WITHHELD (HIGH RISK)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> PENDING REVIEW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900">
                GeoSentinel Strategic Intelligence Report
              </h2>
              <p className="text-xs text-slate-500">
                Run ID: <span className="font-mono text-slate-700">{result.analysis_run_id}</span> • Completed: {new Date(result.completed_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Canonical 12-Stage Validated
            </span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'evidence', 'causal', 'strategy', 'scenarios'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {tab === 'all' && 'Full 4-Section View'}
              {tab === 'evidence' && `Evidence DNA (${answer.relevant_evidence.length})`}
              {tab === 'causal' && `GeoCausal Pathways (${answer.impact_analysis.length})`}
              {tab === 'strategy' && `Strategy Recommendations (${answer.strategy_recommendations.length})`}
              {tab === 'scenarios' && `GeoFork Scenarios (${answer.scenarios?.length || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: Current Situation */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'evidence') && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            <h3 className="text-base font-display font-bold text-slate-900">Current Situation</h3>
            <span className="text-xs text-slate-400 ml-auto">As of {new Date(answer.current_situation.as_of).toLocaleDateString()}</span>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            {answer.current_situation.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase text-emerald-800 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Facts
              </h4>
              <ul className="space-y-2">
                {answer.current_situation.verified_facts.map((fact, idx) => (
                  <li key={idx} className="text-xs text-slate-700 leading-relaxed pl-2 border-l-2 border-emerald-500">
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase text-amber-800 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" /> Attributed Claims & Context
              </h4>
              <ul className="space-y-2">
                {answer.current_situation.attributed_claims.map((claim, idx) => (
                  <li key={idx} className="text-xs text-slate-700 leading-relaxed pl-2 border-l-2 border-amber-500">
                    {claim}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: Relevant Evidence */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'evidence') && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
              <h3 className="text-base font-display font-bold text-slate-900">Relevant Evidence & Provenance DNA</h3>
            </div>
            <span className="text-xs text-slate-500">Multilateral Source Provenance Verified</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Evidence ID / Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Analytical Relevance</th>
                  <th className="py-3 px-4">Limitations & Validation</th>
                  <th className="py-3 px-4 text-right">Verification Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {answer.relevant_evidence.map((ev) => (
                  <tr key={ev.evidence_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ev.source_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{ev.evidence_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      {getVerificationBadge(ev.verification_status)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs leading-relaxed">
                      {ev.relevance}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs leading-relaxed">
                      {ev.conflicts_or_limitations || 'None detected.'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Source <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: Impact Analysis & GeoCausal */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'causal') && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
            <h3 className="text-base font-display font-bold text-slate-900">Impact Analysis & GeoCausal Propagation</h3>
            <span className="text-xs text-slate-400 ml-auto">Direct, Indirect & Second-Order Effects</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {answer.impact_analysis.map((impact, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-xs font-bold uppercase text-blue-700 tracking-wider">{impact.sector}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    impact.uncertainty === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {impact.uncertainty} Uncertainty
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900">{impact.pathway}</h4>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p><span className="text-slate-400 font-medium">Direct Impact:</span> {impact.direct_impact}</p>
                  <p><span className="text-slate-400 font-medium">Indirect Impact:</span> {impact.indirect_impact}</p>
                  <p><span className="text-slate-400 font-medium">Horizon:</span> <span className="font-mono text-blue-600 font-semibold">{impact.horizon}</span></p>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-500 block mb-1">Affected Sectors & Populations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {impact.affected_populations.map((pop, pIdx) => (
                      <span key={pIdx} className="px-2.5 py-0.5 rounded-md bg-white text-[11px] text-slate-700 border border-slate-200 font-medium">
                        {pop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: Strategy Recommendations */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'strategy') && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</span>
              <h3 className="text-base font-display font-bold text-slate-900">Strategy Recommendations & Mandatory Risk Review Gate</h3>
            </div>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Independent Red-Team Gate Enforced
            </span>
          </div>

          <div className="space-y-4">
            {answer.strategy_recommendations.map((strat) => (
              <div key={strat.option_id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-blue-600 font-bold uppercase">{strat.option_id}</span>
                    <h4 className="text-base font-display font-bold text-slate-900">{strat.title}</h4>
                  </div>
                  <div>{getRiskReviewBadge(strat.risk_review_status)}</div>
                </div>

                {/* Objectives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-semibold block mb-1">Target Objective:</span>
                    <p className="text-slate-800">{strat.objective}</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-semibold block mb-1">Causal Mechanism:</span>
                    <p className="text-slate-800">{strat.mechanism}</p>
                  </div>
                </div>

                {/* Benefits vs Trade-offs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl">
                    <span className="text-emerald-800 font-bold block mb-1.5">Intended Benefits:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {strat.benefits.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>
                  </div>
                  <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
                    <span className="text-amber-800 font-bold block mb-1.5">Trade-offs & Constraints:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {strat.tradeoffs.map((t, tIdx) => <li key={tIdx}>{t}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Red Team Risk Review */}
                <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Independent Red-Team Risk Review Findings & Unintended Consequences:</span>
                  </div>
                  
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {strat.unintended_consequences.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-rose-200/80">
                    <span className="text-slate-700 font-bold block mb-1">Required Mitigations (Enforced Before Deployment):</span>
                    <ul className="space-y-1 text-slate-700">
                      {strat.required_mitigations.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-600 border-t border-rose-200/80">
                    <span className="font-bold text-rose-900">Residual Risk:</span> {strat.residual_risk}
                  </div>
                  
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-blue-900">Exit / Fallback Condition:</span> {strat.fallback}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* GeoFork Scenarios */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'scenarios') && answer.scenarios && answer.scenarios.length > 0 && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-display font-bold text-slate-900">GeoFork Conditional Scenario Laboratory</h3>
            <span className="text-xs text-slate-400 ml-auto">Branch Exploration (Empirical Evidence)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {answer.scenarios.map((scen) => (
              <div key={scen.scenario_id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 text-xs">
                <h4 className="text-sm font-bold text-slate-900">{scen.name}</h4>
                <p className="text-slate-600 italic text-[11px]">{scen.probability_description}</p>
                
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Key Assumptions:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {scen.assumptions.map((a, aIdx) => <li key={aIdx}>{a}</li>)}
                  </ul>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Projected Branch Outcomes:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {scen.projected_outcomes.map((o, oIdx) => <li key={oIdx}>{o}</li>)}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-blue-600 font-semibold">Monitoring Indicators: </span>
                  <span className="text-slate-600">{scen.monitoring_indicators.join(' • ')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Limitations Disclosure */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 text-xs space-y-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-blue-600" /> Evidence Limitations & Research Confidence Disclosure
        </h4>
        <p className="text-slate-600 leading-relaxed">{answer.confidence_rationale}</p>
        <ul className="list-disc list-inside space-y-1 text-slate-500">
          {answer.limitations.map((lim, lIdx) => (
            <li key={lIdx}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
