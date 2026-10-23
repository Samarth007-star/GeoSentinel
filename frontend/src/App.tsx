import React, { useState } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { AuthModal } from './components/AuthModal';
import { AskInterface } from './features/ask/AskInterface';
import { AnalysisResultView } from './features/analysis/AnalysisResultView';
import { ConnectorStatusView } from './features/connectors/ConnectorStatusView';
import { ScenarioLaboratoryView } from './features/scenarios/ScenarioLaboratoryView';
import { AnalysisResult } from './types';
import { Sparkles, Layers, Globe, ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const handleAnalysisComplete = (res: AnalysisResult) => {
    setCurrentResult(res);
  };

  const handleNewChat = () => {
    setCurrentResult(null);
    setSelectedQuery('');
    setActiveNav('dashboard');
  };

  const handleSelectQuestion = (q: string) => {
    setSelectedQuery(q);
    setActiveNav('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
      {/* Top Header matching Image 1 */}
      <Header
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main 3-Column Layout matching Image 1 */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        <LeftSidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onNewChat={handleNewChat}
          onSelectRecentChat={handleSelectQuestion}
        />

        {/* Center Main Intelligence Workspace */}
        <main className="flex-1 overflow-y-auto bg-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-8">
            
            {/* Dashboard / Ask View */}
            {activeNav === 'dashboard' && (
              <div className="space-y-8">
                <AskInterface
                  onAnalysisComplete={handleAnalysisComplete}
                  selectedQuery={selectedQuery}
                  onClearResult={() => setCurrentResult(null)}
                />

                {currentResult && (
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Intelligence Briefing Ready
                      </span>
                      <button
                        onClick={() => setCurrentResult(null)}
                        className="text-xs text-slate-500 hover:text-blue-600 font-medium"
                      >
                        Reset / New Query
                      </button>
                    </div>
                    <AnalysisResultView result={currentResult} />
                  </div>
                )}
              </div>
            )}

            {/* Evidence DNA View */}
            {activeNav === 'evidence' && (
              <div className="space-y-6">
                {currentResult ? (
                  <AnalysisResultView result={currentResult} />
                ) : (
                  <div className="bg-slate-50 rounded-3xl p-10 text-center border border-slate-200/80 max-w-xl mx-auto space-y-4 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto">
                      <Layers className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Active Evidence Graph Loaded</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Submit an inquiry on the Dashboard to inspect claim-level provenance, verification status, and cross-reference citations.
                    </p>
                    <button
                      onClick={() => setActiveNav('dashboard')}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                    >
                      Return to Chat
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Data Sources View */}
            {activeNav === 'datasources' && (
              <ConnectorStatusView />
            )}

            {/* ForecastLab View */}
            {activeNav === 'forecastlab' && (
              <ScenarioLaboratoryView initialSubTab="forecastlab" />
            )}

            {/* GeoMemory View */}
            {activeNav === 'geomemory' && (
              <ScenarioLaboratoryView initialSubTab="geofork" />
            )}

            {/* GeoLens View */}
            {activeNav === 'geolens' && (
              <ScenarioLaboratoryView initialSubTab="geolens" />
            )}

            {/* Generic Secondary Pages */}
            {(['events', 'countries', 'news', 'organizations', 'reports', 'settings'].includes(activeNav)) && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 capitalize">{activeNav} Intelligence Module</h2>
                    <p className="text-xs text-slate-500">Live multilateral feeds aggregated via GeoSentinel Agent Cluster</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time synchronization for <strong>{activeNav}</strong> is running across all 8 verified connectors (GDELT, World Bank, ReliefWeb, IMF, USGS, NASA, Wikidata, OONI).
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveNav('dashboard')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Intelligence Chat
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Right Data Sources & Questions Sidebar */}
        <RightSidebar
          onSelectQuestion={handleSelectQuestion}
          onOpenConnectors={() => setActiveNav('datasources')}
        />

      </div>

      {/* Auth / Login Modal matching Image 2 */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
};
