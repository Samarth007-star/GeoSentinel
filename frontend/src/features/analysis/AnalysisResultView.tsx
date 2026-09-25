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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
          </span>
        );
      case 'CROSS_CHECKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> CROSS-CHECKED
          </span>
        );
      case 'SOURCE_REFERENCED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5" /> SOURCE REFERENCED
          </span>
        );
      case 'CONFLICTING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> CONFLICTING
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <XCircle className="w-3.5 h-3.5" /> REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            UNVERIFIED
          </span>
        );
    }
  };

  const getRiskReviewBadge = (status: RiskReviewStatus) => {
    switch (status) {
      case 'APPROVED_WITH_LIMITATIONS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> RED TEAM REVIEWED
          </span>
        );
      case 'WITHHOLD':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> WITHHELD (UNREVIEWED / HIGH RISK)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> PENDING REVIEW
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border-blue-500/20 bg-gradient-to-br from-sentinel-850 via-sentinel-900 to-sentinel-800">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sentinel-700/50 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">GeoSentinel Evidence-Grounded Analysis</h2>
              <p className="text-xs text-slate-400">
                Run ID: <span className="font-mono text-slate-300">{result.analysis_run_id}</span> • Completed: {new Date(result.completed_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-sentinel-800/80 text-slate-400 hover:text-white hover:bg-sentinel-700'
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
      {/* SECTION 1: Current Situation (Mandatory Canonical Section 1) */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'evidence') && (
        <section className="glass-panel rounded-2xl p-6 border-blue-500/15">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
            <h3 className="text-lg font-display font-semibold text-white">Current Situation</h3>
            <span className="text-xs text-slate-400 ml-auto">As of {new Date(answer.current_situation.as_of).toLocaleDateString()}</span>
          </div>

          <p className="text-slate-200 text-sm leading-relaxed mb-6 bg-sentinel-800/50 p-4 rounded-xl border border-sentinel-700/40">
            {answer.current_situation.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold uppercase text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Verified Facts
              </h4>
              <ul className="space-y-2">
                {answer.current_situation.verified_facts.map((fact, idx) => (
                  <li key={idx} className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-emerald-500/40">
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold uppercase text-amber-400 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Attributed Claims & Context
              </h4>
              <ul className="space-y-2">
                {answer.current_situation.attributed_claims.map((claim, idx) => (
                  <li key={idx} className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-amber-500/40">
                    {claim}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: Relevant Evidence (Mandatory Canonical Section 2) */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'evidence') && (
        <section className="glass-panel rounded-2xl p-6 border-blue-500/15">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
              <h3 className="text-lg font-display font-semibold text-white">Relevant Evidence & Provenance DNA</h3>
            </div>
            <span className="text-xs text-slate-400">Strict Source Provenance & Licensing Check</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sentinel-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-sentinel-700">
                <tr>
                  <th className="py-3 px-4">Evidence ID / Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Analytical Relevance</th>
                  <th className="py-3 px-4">Limitations & Validation</th>
                  <th className="py-3 px-4 text-right">Verification Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sentinel-700/40">
                {answer.relevant_evidence.map((ev) => (
                  <tr key={ev.evidence_id} className="hover:bg-sentinel-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{ev.source_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{ev.evidence_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      {getVerificationBadge(ev.verification_status)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs leading-relaxed">
                      {ev.relevance}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs leading-relaxed">
                      {ev.conflicts_or_limitations || 'None detected.'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
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
      {/* SECTION 3: Impact Analysis & GeoCausal (Mandatory Section 3)  */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'causal') && (
        <section className="glass-panel rounded-2xl p-6 border-blue-500/15">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
            <h3 className="text-lg font-display font-semibold text-white">Impact Analysis & GeoCausal Propagation</h3>
            <span className="text-xs text-slate-400 ml-auto">Direct, Indirect & Second-Order Effects</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {answer.impact_analysis.map((impact, idx) => (
              <div key={idx} className="bg-sentinel-850 rounded-xl p-5 border border-sentinel-700/60 shadow-lg">
                <div className="flex items-center justify-between mb-3 border-b border-sentinel-700/40 pb-2">
                  <span className="text-xs font-semibold uppercase text-blue-400 tracking-wider">{impact.sector}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    impact.uncertainty === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {impact.uncertainty} Uncertainty
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white mb-2">{impact.pathway}</h4>

                <div className="space-y-2 text-xs text-slate-300 mb-4">
                  <p><span className="text-slate-400 font-medium">Direct Impact:</span> {impact.direct_impact}</p>
                  <p><span className="text-slate-400 font-medium">Indirect Impact:</span> {impact.indirect_impact}</p>
                  <p><span className="text-slate-400 font-medium">Horizon:</span> <span className="font-mono text-cyan-400">{impact.horizon}</span></p>
                </div>

                <div className="pt-2 border-t border-sentinel-700/40">
                  <span className="text-[11px] text-slate-400 block mb-1">Affected Sectors & Populations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {impact.affected_populations.map((pop, pIdx) => (
                      <span key={pIdx} className="px-2 py-0.5 rounded-md bg-sentinel-800 text-[11px] text-slate-300 border border-sentinel-700/50">
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
      {/* SECTION 4: Strategy Recommendations & Risk Review Gate       */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'strategy') && (
        <section className="glass-panel rounded-2xl p-6 border-blue-500/15">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">4</span>
              <h3 className="text-lg font-display font-semibold text-white">Strategy Recommendations & Mandatory Risk Review Gate</h3>
            </div>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Independent Red-Team Gate Enforced
            </span>
          </div>

          <div className="space-y-6">
            {answer.strategy_recommendations.map((strat) => (
              <div key={strat.option_id} className="bg-sentinel-850 rounded-xl p-6 border border-sentinel-700/60 shadow-xl space-y-4">
                
                {/* Strategy Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sentinel-700/50 pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase">{strat.option_id}</span>
                    <h4 className="text-base font-display font-bold text-white">{strat.title}</h4>
                  </div>
                  <div>{getRiskReviewBadge(strat.risk_review_status)}</div>
                </div>

                {/* Objective & Mechanism */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-sentinel-800/60 p-3 rounded-lg border border-sentinel-700/40">
                    <span className="text-slate-400 font-medium block mb-1">Target Objective:</span>
                    <p className="text-slate-200">{strat.objective}</p>
                  </div>
                  <div className="bg-sentinel-800/60 p-3 rounded-lg border border-sentinel-700/40">
                    <span className="text-slate-400 font-medium block mb-1">Causal Mechanism:</span>
                    <p className="text-slate-200">{strat.mechanism}</p>
                  </div>
                </div>

                {/* Benefits vs Trade-offs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-950/15 border border-emerald-500/20 p-3 rounded-lg">
                    <span className="text-emerald-400 font-semibold block mb-1.5">Intended Benefits:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {strat.benefits.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>
                  </div>
                  <div className="bg-amber-950/15 border border-amber-500/20 p-3 rounded-lg">
                    <span className="text-amber-400 font-semibold block mb-1.5">Trade-offs & Constraints:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {strat.tradeoffs.map((t, tIdx) => <li key={tIdx}>{t}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Mandatory Red Team Review Findings & Mitigations */}
                <div className="bg-rose-950/10 border border-rose-500/20 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Independent Red-Team Risk Review Findings & Unintended Consequences:</span>
                  </div>
                  
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {strat.unintended_consequences.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-rose-500/20">
                    <span className="text-slate-400 font-semibold block mb-1">Required Mitigations (Enforced Before Deployment):</span>
                    <ul className="space-y-1 text-slate-300">
                      {strat.required_mitigations.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 border-t border-rose-500/20">
                    <span className="font-semibold text-rose-300">Residual Risk Disclosure:</span> {strat.residual_risk}
                  </div>
                  
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-cyan-300">Exit / Fallback Condition:</span> {strat.fallback}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* GeoFork Scenarios (Section 9 Addendum)                         */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'scenarios') && answer.scenarios && answer.scenarios.length > 0 && (
        <section className="glass-panel rounded-2xl p-6 border-blue-500/15">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-display font-semibold text-white">GeoFork Conditional Scenario Laboratory</h3>
            <span className="text-xs text-slate-400 ml-auto">Branch Exploration (No Fabricated Probabilities)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {answer.scenarios.map((scen) => (
              <div key={scen.scenario_id} className="bg-sentinel-850 rounded-xl p-5 border border-sentinel-700/60 shadow-lg space-y-3 text-xs">
                <h4 className="text-sm font-semibold text-white">{scen.name}</h4>
                <p className="text-slate-300 italic text-[11px]">{scen.probability_description}</p>
                
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Key Assumptions:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {scen.assumptions.map((a, aIdx) => <li key={aIdx}>{a}</li>)}
                  </ul>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Projected Branch Outcomes:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {scen.projected_outcomes.map((o, oIdx) => <li key={oIdx}>{o}</li>)}
                  </ul>
                </div>

                <div className="pt-2 border-t border-sentinel-700/40 text-[11px]">
                  <span className="text-cyan-400 font-medium">Monitoring Indicators: </span>
                  <span className="text-slate-300">{scen.monitoring_indicators.join(' • ')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Limitations & Confidence Disclosure */}
      <div className="bg-sentinel-850/60 rounded-xl p-5 border border-sentinel-700/40 text-xs space-y-2">
        <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-blue-400" /> Evidence Limitations & Research Confidence Disclosure
        </h4>
        <p className="text-slate-400 leading-relaxed">{answer.confidence_rationale}</p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          {answer.limitations.map((lim, lIdx) => (
            <li key={lIdx}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
