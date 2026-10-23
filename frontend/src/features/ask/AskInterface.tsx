import React, { useState, useEffect } from 'react';
import {
  Globe,
  BarChart3,
  AlertTriangle,
  Users,
  ArrowRight,
  Plus,
  Send,
  Mic,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { executeAnalysis } from '../../services/api';
import { AnalysisResult } from '../../types';

interface AskInterfaceProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  selectedQuery?: string;
  onClearResult?: () => void;
}

export const AskInterface: React.FC<AskInterfaceProps> = ({
  onAnalysisComplete,
  selectedQuery,
  onClearResult
}) => {
  const [question, setQuestion] = useState('');
  const [useLiveData, setUseLiveData] = useState(true);
  const [analysisMode, setAnalysisMode] = useState('Global Analysis');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (selectedQuery) {
      setQuestion(selectedQuery);
    }
  }, [selectedQuery]);

  const suggestionCards = [
    {
      id: 'middle-east',
      title: 'Latest developments in the Middle East?',
      icon: Globe,
      color: 'text-blue-600 bg-blue-50',
      geos: ['IRN', 'ISR', 'SAU', 'USA', 'IND'],
      horizon: '30d'
    },
    {
      id: 'india-economy',
      title: "Impact on India's economy?",
      icon: BarChart3,
      color: 'text-emerald-600 bg-emerald-50',
      geos: ['IND', 'WLD'],
      horizon: '90d'
    },
    {
      id: 'natural-disasters',
      title: 'Recent natural disasters?',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50',
      geos: ['IND', 'JPN', 'IDN', 'USA'],
      horizon: '15d'
    },
    {
      id: 'india-china',
      title: 'India and China relations?',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50',
      geos: ['IND', 'CHN'],
      horizon: '60d'
    }
  ];

  const analysisModes = [
    'Global Analysis',
    'India Strategic Impact',
    'Economic Spillovers',
    'Humanitarian & Disaster'
  ];

  const handleRunAnalysis = async (customQ?: string, customGeos?: string[], customH?: string) => {
    const qToRun = customQ || question;
    if (!qToRun.trim() || loading) return;

    if (onClearResult) onClearResult();
    setLoading(true);
    setCurrentStage('Stage 1-3: Question Intake & Entity Resolution...');
    setStageIndex(1);

    const stages = [
      'Stage 1-3: Question Intake & Multi-entity Resolution...',
      'Stage 4-5: Bounded Retrieval Planning & Live Dataset Builder...',
      'Stage 6-7: Evidence DNA Verification & Context Assembly...',
      'Stage 8-9: GeoCausal Propagation & GeoFork Scenario Lab...',
      'Stage 10: Strategy Option Formulation...',
      'Stage 11: Mandatory Independent Strategy Risk Review Gate...',
      'Stage 12: 4-Section Composition & Explainability Proof...'
    ];

    let step = 1;
    const interval = setInterval(() => {
      if (step < stages.length) {
        setCurrentStage(stages[step]);
        setStageIndex(step + 1);
        step++;
      }
    }, 700);

    try {
      const res = await executeAnalysis(
        qToRun,
        customGeos || ['IND', 'IRN', 'USA'],
        customH || '30d'
      );
      clearInterval(interval);
      onAnalysisComplete(res);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
    } finally {
      setLoading(false);
      setCurrentStage('');
      setStageIndex(0);
    }
  };

  const handleCardClick = (card: typeof suggestionCards[0]) => {
    setQuestion(card.title);
    handleRunAnalysis(card.title, card.geos, card.horizon);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRunAnalysis();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center space-y-8 py-4 sm:py-6">
      
      {/* Center Welcome Hero matching Image 1 */}
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Globe icon badge */}
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 shadow-sm">
          <Globe className="w-8 h-8 stroke-[2]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
          How can I help you today?
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed">
          Ask any question about global events, conflicts, economies, organizations,
          or their impact on India and get AI-powered analysis with real data sources.
        </p>
      </div>

      {/* 4 Suggestion Cards matching Image 1 */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {suggestionCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={loading}
              className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all text-left group min-h-[105px]"
            >
              <div className={`w-8 h-8 rounded-xl ${card.color} flex items-center justify-center mb-2.5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                  {card.title}
                </span>
                <ArrowRight className="w-4 h-4 text-blue-600 transform group-hover:translate-x-1 transition-transform shrink-0 mb-0.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Question Input Box matching Image 1 & Image 3 */}
      <div className="w-full relative">
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all p-3 sm:p-4">
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Enter your question here..."
            className="w-full resize-none border-none outline-none text-slate-800 placeholder-slate-400 text-sm sm:text-base leading-relaxed bg-transparent"
          />

          {/* Bottom Action Bar inside Card matching Image 1 */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
            {/* Left controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Plus button */}
              <button
                type="button"
                onClick={() => alert('Additional context or attachment uploads enabled for Enterprise.')}
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center transition"
                title="Add attachment or prompt modifier"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Mode dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{analysisMode}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showModeDropdown && (
                  <div className="absolute left-0 bottom-full mb-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50 animate-fadeIn">
                    {analysisModes.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setAnalysisMode(mode);
                          setShowModeDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between ${
                          analysisMode === mode
                            ? 'text-blue-600 bg-blue-50 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{mode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Data Sources switch */}
              <div className="flex items-center gap-2 pl-1">
                <span className="text-xs font-medium text-slate-600 hidden sm:inline-block">
                  Use Live Data Sources
                </span>
                <span className="text-xs font-medium text-slate-600 sm:hidden">
                  Live Sources
                </span>
                <button
                  type="button"
                  onClick={() => setUseLiveData(!useLiveData)}
                  className={`theme-switch ${
                    useLiveData ? 'theme-switch-checked' : 'theme-switch-unchecked'
                  }`}
                  role="switch"
                  aria-checked={useLiveData}
                >
                  <span
                    className={`theme-switch-thumb ${
                      useLiveData ? 'theme-switch-thumb-checked' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right actions: Mic & Send button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('Voice input is ready and waiting for audio permissions.')}
                className="w-9 h-9 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition"
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleRunAnalysis()}
                disabled={loading || !question.trim()}
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center shadow-sm transition transform active:scale-95"
                title="Send Question"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline Execution Animation */}
        {loading && (
          <div className="mt-4 p-4 rounded-2xl bg-white border border-blue-100 shadow-sm animate-fadeIn space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{currentStage}</span>
              </div>
              <span className="text-slate-400 font-medium">Stage {stageIndex} of 7</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(stageIndex / 7) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
