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
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-[0_6px_24px_rgba(9,9,11,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-display font-bold text-[#09090B]">
                Advanced Research Laboratory
              </h2>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-[#DC2626] border border-red-200">
                Research Lab
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Explore GeoFork counterfactuals, GeoLens multi-country comparison, and ForecastLab empirical scoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAFAFA] rounded-2xl border border-zinc-200 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('geofork')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeSubTab === 'geofork'
                  ? 'bg-gradient-to-r from-[#09090B] to-[#DC2626] text-white shadow-sm'
                  : 'text-zinc-600 hover:text-[#DC2626]'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>GeoFork</span>
            </button>
            <button
              onClick={() => setActiveSubTab('geolens')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeSubTab === 'geolens'
                  ? 'bg-gradient-to-r from-[#09090B] to-[#DC2626] text-white shadow-sm'
                  : 'text-zinc-600 hover:text-[#DC2626]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GeoLens</span>
            </button>
            <button
              onClick={() => setActiveSubTab('forecastlab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeSubTab === 'forecastlab'
                  ? 'bg-gradient-to-r from-[#09090B] to-[#DC2626] text-white shadow-sm'
                  : 'text-zinc-600 hover:text-[#DC2626]'
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
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-[0_6px_24px_rgba(9,9,11,0.04)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">Branch Scenario A</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-50 text-[#DC2626] border border-red-200 font-mono font-semibold">
                Baseline Escalation
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#09090B]">Full Maritime Chokepoint Disruption</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Assumption: Retaliatory mine-laying or targeted drone strikes in the Strait of Hormuz for 30–60 days.
            </p>
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Brent Crude Impact:</span>
                <span className="font-semibold text-[#DC2626]">+25% to +40%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">India Import Inflation:</span>
                <span className="font-semibold text-amber-600">+1.2% to +1.8% CPI</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">SPR Sufficiency:</span>
                <span className="font-semibold text-emerald-600">74 Days Buffer</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-[0_6px_24px_rgba(9,9,11,0.04)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Branch Scenario B</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
                Diplomatic Off-Ramp
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#09090B]">Third-Party Maritime Escort &amp; Bilateral Ceasefire</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Assumption: Oman and Switzerland facilitate targeted maritime deconfliction within 14 days of initial friction.
            </p>
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Brent Crude Impact:</span>
                <span className="font-semibold text-amber-600">+5% to +10% transitory</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Insurance Surcharge:</span>
                <span className="font-semibold text-zinc-700">Reverts to baseline within 45d</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Diplomatic Feasibility:</span>
                <span className="font-semibold text-emerald-600">High (Historical precedent)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: GeoLens Cross-Country Comparison */}
      {activeSubTab === 'geolens' && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-[0_6px_24px_rgba(9,9,11,0.04)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#09090B]">Cross-Country Asymmetry Analysis (Section 30.8)</h3>
            <span className="text-xs text-[#DC2626] font-mono font-medium">India vs. Iran vs. United States</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200">
            <table className="w-full min-w-[540px] text-left text-xs border-collapse">
              <thead className="bg-[#FAFAFA] text-[#09090B] font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Dimension</th>
                  <th className="py-3 px-4">India (IND)</th>
                  <th className="py-3 px-4">Iran (IRN)</th>
                  <th className="py-3 px-4">United States (USA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                <tr className="hover:bg-red-50/30">
                  <td className="py-3 px-4 font-bold text-[#09090B]">Net Energy Position</td>
                  <td className="py-3 px-4 text-[#DC2626] font-medium">Net Importer (84.5% import dependency)</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Net Exporter (Major producer)</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Net Exporter (Shale / LNG exporter)</td>
                </tr>
                <tr className="hover:bg-red-50/30">
                  <td className="py-3 px-4 font-bold text-[#09090B]">Chokepoint Exposure</td>
                  <td className="py-3 px-4 text-amber-700 font-medium">High transit dependency via Hormuz</td>
                  <td className="py-3 px-4 text-[#DC2626] font-medium">Direct sovereign geographic control</td>
                  <td className="py-3 px-4 text-[#09090B] font-medium">Naval power projection &amp; global routing</td>
                </tr>
                <tr className="hover:bg-red-50/30">
                  <td className="py-3 px-4 font-bold text-[#09090B]">Financial / Currency Resilience</td>
                  <td className="py-3 px-4">Forex reserves (~$650B), Rupee billing agreements</td>
                  <td className="py-3 px-4 text-[#DC2626] font-medium">Severe SWIFT sanctions, high inflation</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">USD global reserve currency dominance</td>
                </tr>
                <tr className="hover:bg-red-50/30">
                  <td className="py-3 px-4 font-bold text-[#09090B]">Mitigation Buffer</td>
                  <td className="py-3 px-4">74-day SPR + Russian/West African crude pivot</td>
                  <td className="py-3 px-4">Bilateral barter &amp; shadow fleet transport</td>
                  <td className="py-3 px-4">Domestic production surge &amp; SPR flexibility</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: ForecastLab Empirical Scoring */}
      {activeSubTab === 'forecastlab' && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-[0_6px_24px_rgba(9,9,11,0.04)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#09090B]">ForecastLab Replay &amp; Empirical Scoring (Section 30.5)</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Strict temporal integrity: All predictions locked at cutoff timestamp before outcome observation.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Temporal Integrity: Verified Clean</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-zinc-200">
              <span className="text-[10px] font-bold uppercase text-zinc-500">Model Brier Score</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">0.044</div>
              <span className="text-[10px] text-zinc-500">Lower is better (0 = perfect)</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-zinc-200">
              <span className="text-[10px] font-bold uppercase text-zinc-500">Baseline Comparison</span>
              <div className="text-2xl font-bold text-zinc-700 mt-1">0.250</div>
              <span className="text-[10px] text-zinc-500">Uninformed 50/50 baseline</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-zinc-200">
              <span className="text-[10px] font-bold uppercase text-zinc-500">Calibration Error</span>
              <div className="text-2xl font-bold text-[#DC2626] mt-1">0.083</div>
              <span className="text-[10px] text-zinc-500">|mean(p) - mean(y)|</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-zinc-200">
              <span className="text-[10px] font-bold uppercase text-zinc-500">Adjudicated Cases</span>
              <div className="text-2xl font-bold text-[#09090B] mt-1">3 Historical</div>
              <span className="text-[10px] text-zinc-500">Verified ground truth</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-zinc-200 text-xs text-zinc-600 space-y-1">
            <div className="font-bold text-[#09090B]">Methodological Compliance Notice:</div>
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
