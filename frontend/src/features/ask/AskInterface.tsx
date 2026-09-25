import React, { useState } from 'react';
import { Search, Sparkles, Globe, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { executeAnalysis } from '../../services/api';
import { AnalysisResult } from '../../types';

interface AskInterfaceProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export const AskInterface: React.FC<AskInterfaceProps> = ({ onAnalysisComplete }) => {
  const [question, setQuestion] = useState('What could be the effects on India if US-Iran tensions escalate?');
  const [timeHorizon, setTimeHorizon] = useState('30d');
  const [selectedGeos, setSelectedGeos] = useState<string[]>(['IND', 'IRN', 'USA']);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');

  const sampleQuestions = [
    {
      title: 'Persian Gulf Naval Escalation & India',
      q: 'What could be the effects on India if US-Iran tensions escalate?',
      geos: ['IND', 'IRN', 'USA'],
      horizon: '30d'
    },
    {
      title: 'Red Sea Maritime & Shipping Shocks',
      q: 'Evaluate the economic and shipping container freight impact of Red Sea transit disruptions.',
      geos: ['EGY', 'YEM', 'IND', 'WLD'],
      horizon: '60d'
    },
    {
      title: 'Critical Mineral & Energy Trade Bans',
      q: 'Analyze potential domestic sector spillovers if crude oil trade routes face selective maritime blockades.',
      geos: ['IND', 'SAU', 'ARE', 'IRN'],
      horizon: '90d'
    }
  ];

  const availableGeos = [
    { code: 'IND', label: 'India' },
    { code: 'IRN', label: 'Iran' },
    { code: 'USA', label: 'United States' },
    { code: 'CHN', label: 'China' },
    { code: 'RUS', label: 'Russia' },
    { code: 'UKR', label: 'Ukraine' },
    { code: 'ISR', label: 'Israel' },
    { code: 'EGY', label: 'Egypt' }
  ];

  const handleToggleGeo = (code: string) => {
    if (selectedGeos.includes(code)) {
      if (selectedGeos.length > 1) {
        setSelectedGeos(selectedGeos.filter(g => g !== code));
      }
    } else {
      setSelectedGeos([...selectedGeos, code]);
    }
  };

  const handleRunAnalysis = async (customQ?: string, customGeos?: string[], customH?: string) => {
    const qToRun = customQ || question;
    const geosToRun = customGeos || selectedGeos;
    const hToRun = customH || timeHorizon;

    if (!qToRun.trim()) return;

    setLoading(true);
    setCurrentStage('Stage 1-3: Question Intake & Entity Resolution...');

    const stages = [
      'Stage 4-5: Bounded Retrieval Planning & Dataset Builder...',
      'Stage 6-7: Evidence DNA Verification & Context Assembly...',
      'Stage 8-9: GeoCausal Propagation & GeoFork Scenario Lab...',
      'Stage 10: Strategy Option Formulation...',
      'Stage 11: Mandatory Independent Strategy Risk Review Gate...',
      'Stage 12: 4-Section Composition & Explainability...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < stages.length) {
        setCurrentStage(stages[step]);
        step++;
      }
    }, 700);

    try {
      const res = await executeAnalysis(qToRun, geosToRun, hToRun);
      clearInterval(interval);
      onAnalysisComplete(res);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
    } finally {
      setLoading(false);
      setCurrentStage('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable Decision-Support Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Global Event Intelligence & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Impact Prediction</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Ground complex geopolitical questions in verified multilateral data, physical sensor feeds, causal propagation chains, and independent red-team risk reviews.
        </p>
      </div>

      {/* Query Form Panel */}
      <div className="glass-panel rounded-2xl p-6 border-blue-500/20 max-w-4xl mx-auto space-y-5">
        
        {/* Main Textarea */}
        <div className="relative">
          <label className="text-xs font-semibold uppercase text-slate-400 block mb-2 tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-400" /> Enter Analytical Inquiry
          </label>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            placeholder="e.g., What could be the effects on India if US-Iran tensions escalate?"
            className="w-full bg-sentinel-900/90 text-white rounded-xl p-4 text-sm border border-sentinel-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none placeholder-slate-500"
          />
        </div>

        {/* Filter Controls: Geographies & Time Horizon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          
          {/* Target Geographies */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-2 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Target Geographies
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableGeos.map((g) => {
                const isSelected = selectedGeos.includes(g.code);
                return (
                  <button
                    key={g.code}
                    type="button"
                    onClick={() => handleToggleGeo(g.code)}
                    disabled={loading}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'bg-sentinel-800 text-slate-400 hover:text-white border border-sentinel-700/60'
                    }`}
                  >
                    {g.label} ({g.code})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Horizon */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-2 tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Projection Horizon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: '15d', label: '15 Days' },
                { value: '30d', label: '30 Days' },
                { value: '90d', label: '90 Days' },
                { value: '180d', label: '180 Days' }
              ].map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => setTimeHorizon(h.value)}
                  disabled={loading}
                  className={`py-2 px-1 rounded-lg text-xs font-medium text-center transition ${
                    timeHorizon === h.value
                      ? 'bg-blue-600 text-white border border-blue-400/40 shadow-sm'
                      : 'bg-sentinel-800 text-slate-400 hover:text-white border border-sentinel-700/60'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action Button & Live Progress */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-sentinel-700/50">
          <div className="text-xs text-slate-400">
            {loading ? (
              <span className="flex items-center gap-2 text-cyan-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{currentStage}</span>
              </span>
            ) : (
              <span>Zero-Paid-API verified • 12-stage sequential validation</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleRunAnalysis()}
            disabled={loading || !question.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Pipeline...</span>
              </>
            ) : (
              <>
                <span>Run Analysis Pipeline</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Preset Research Scenarios */}
      <div className="max-w-4xl mx-auto space-y-3">
        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
          Preset Curated Research Scenarios
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sampleQuestions.map((s, idx) => (
            <div
              key={idx}
              onClick={() => {
                setQuestion(s.q);
                setSelectedGeos(s.geos);
                setTimeHorizon(s.horizon);
                handleRunAnalysis(s.q, s.geos, s.horizon);
              }}
              className="glass-panel glass-panel-hover p-4 rounded-xl cursor-pointer border-sentinel-700/60 text-left space-y-2"
            >
              <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">{s.horizon} Horizon</span>
              <h4 className="text-xs font-semibold text-white line-clamp-1">{s.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{s.q}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
