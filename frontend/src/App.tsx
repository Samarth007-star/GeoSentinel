import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AskInterface } from './features/ask/AskInterface';
import { AnalysisResultView } from './features/analysis/AnalysisResultView';
import { ConnectorStatusView } from './features/connectors/ConnectorStatusView';
import { AnalysisResult } from './types';
import { Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ask' | 'evidence' | 'connectors' | 'scenarios'>('ask');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  const handleAnalysisComplete = (res: AnalysisResult) => {
    setCurrentResult(res);
  };

  return (
    <div className="min-h-screen flex flex-col bg-sentinel-900 text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'ask' && (
          <div className="space-y-10">
            <AskInterface onAnalysisComplete={handleAnalysisComplete} />
            {currentResult && (
              <div className="pt-6 border-t border-sentinel-700/60">
                <AnalysisResultView result={currentResult} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="space-y-6">
            {currentResult ? (
              <AnalysisResultView result={currentResult} />
            ) : (
              <div className="glass-panel rounded-2xl p-10 text-center max-w-2xl mx-auto space-y-4">
                <Shield className="w-12 h-12 text-blue-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">No Active Analysis Loaded</h3>
                <p className="text-sm text-slate-400">
                  Please submit a question via "Ask GeoSentinel" or select a preset scenario to view claim-level Evidence DNA and contradiction graphs.
                </p>
                <button
                  onClick={() => setActiveTab('ask')}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                >
                  Go to Ask GeoSentinel
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'connectors' && (
          <ConnectorStatusView />
        )}
      </main>

      <footer className="border-t border-sentinel-700/50 bg-sentinel-850/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">GeoSentinel</span>
            <span>•</span>
            <span>Explainable Multi-Agent AI Framework v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400">Zero-Paid-API Compliant</span>
            <span>•</span>
            <span className="text-blue-400">Mandatory Strategy Risk Review Gate</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
