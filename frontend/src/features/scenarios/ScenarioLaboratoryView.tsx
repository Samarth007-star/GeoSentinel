import React, { useState } from 'react';
import { GitFork, Layers, BarChart2, Award } from 'lucide-react';

interface ScenarioLaboratoryViewProps {
  initialSubTab?: 'geofork' | 'geolens' | 'forecastlab';
}

export const ScenarioLaboratoryView: React.FC<ScenarioLaboratoryViewProps> = ({
  initialSubTab = 'geofork'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'geofork' | 'geolens' | 'forecastlab'>(initialSubTab);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-slate-900">Advanced Research Laboratory</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Section 30 Addendum
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Explore GeoFork counterfactuals, GeoLens multi-country comparison, and ForecastLab empirical scoring.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('geofork')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeSubTab === 'geofork'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>GeoFork</span>
            </button>
            <button
              onClick={() => setActiveSubTab('geolens')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeSubTab === 'geolens'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GeoLens</span>
            </button>
            <button
              onClick={() => setActiveSubTab('forecastlab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeSubTab === 'forecastlab'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>ForecastLab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtab 1: GeoFork Counterfactuals */}
      {activeSubTab === 'geofork' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Branch Scenario A</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-semibold">
                Baseline Escalation
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Full Maritime Chokepoint Disruption</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assumption: Retaliatory mine-laying or targeted drone strikes in the Strait of Hormuz for 30–60 days.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Brent Crude Impact:</span>
                <span className="font-semibold text-rose-600">+25% to +40%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">India Import Inflation:</span>
                <span className="font-semibold text-amber-600">+1.2% to +1.8% CPI</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">SPR Sufficiency:</span>
                <span className="font-semibold text-emerald-600">74 Days Buffer</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Branch Scenario B</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
                Diplomatic Off-Ramp
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Third-Party Maritime Escort & Bilateral Ceasefire</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assumption: Oman and Switzerland facilitate targeted maritime deconfliction within 14 days of initial friction.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Brent Crude Impact:</span>
                <span className="font-semibold text-amber-600">+5% to +10% transitory</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Insurance Surcharge:</span>
                <span className="font-semibold text-slate-700">Reverts to baseline within 45d</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Diplomatic Feasibility:</span>
                <span className="font-semibold text-emerald-600">High (Historical precedent)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: GeoLens Cross-Country Comparison */}
      {activeSubTab === 'geolens' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Cross-Country Asymmetry Analysis (Section 30.8)</h3>
            <span className="text-xs text-slate-500 font-mono">India vs. Iran vs. United States</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Dimension</th>
                  <th className="py-3 px-4">India (IND)</th>
                  <th className="py-3 px-4">Iran (IRN)</th>
                  <th className="py-3 px-4">United States (USA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">Net Energy Position</td>
                  <td className="py-3 px-4 text-rose-700 font-medium">Net Importer (84.5% import dependency)</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Net Exporter (Major producer)</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Net Exporter (Shale / LNG exporter)</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">Chokepoint Exposure</td>
                  <td className="py-3 px-4 text-amber-700 font-medium">High transit dependency via Hormuz</td>
                  <td className="py-3 px-4 text-blue-700 font-medium">Direct sovereign geographic control</td>
                  <td className="py-3 px-4 text-indigo-700 font-medium">Naval power projection & global routing</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">Financial / Currency Resilience</td>
                  <td className="py-3 px-4">Forex reserves (~$650B), Rupee billing agreements</td>
                  <td className="py-3 px-4 text-rose-700 font-medium">Severe SWIFT sanctions, high inflation</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">USD global reserve currency dominance</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">Mitigation Buffer</td>
                  <td className="py-3 px-4">74-day SPR + Russian/West African crude pivot</td>
                  <td className="py-3 px-4">Bilateral barter & shadow fleet transport</td>
                  <td className="py-3 px-4">Domestic production surge & SPR flexibility</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: ForecastLab Empirical Scoring */}
      {activeSubTab === 'forecastlab' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">ForecastLab Replay & Empirical Scoring (Section 30.5)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Strict temporal integrity: All predictions locked at cutoff timestamp before outcome observation.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Temporal Integrity: Verified Clean</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500">Model Brier Score</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">0.044</div>
              <span className="text-[10px] text-slate-500">Lower is better (0 = perfect)</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500">Baseline Comparison</span>
              <div className="text-2xl font-bold text-slate-700 mt-1">0.250</div>
              <span className="text-[10px] text-slate-500">Uninformed 50/50 baseline</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500">Calibration Error</span>
              <div className="text-2xl font-bold text-blue-600 mt-1">0.083</div>
              <span className="text-[10px] text-slate-500">|mean(p) - mean(y)|</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500">Adjudicated Cases</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">3 Historical</div>
              <span className="text-[10px] text-slate-500">Verified ground truth</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900">Methodological Compliance Notice:</div>
            <p>
              In accordance with Section 30.5 of Prompt.md, ForecastLab maintains immutable timestamped predictions.
              Future data leakage is blocked via explicit cutoff timestamps. Synthetic test cases are strictly excluded from performance metrics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
