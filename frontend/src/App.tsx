import React, { useState } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { AuthModal } from './components/AuthModal';
import { ChatWorkspace, ChatMessage } from './features/chat/ChatWorkspace';
import { ConnectorStatusView } from './features/connectors/ConnectorStatusView';
import { ScenarioLaboratoryView } from './features/scenarios/ScenarioLaboratoryView';
import { Globe, ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const handleNewChat = () => {
    setMessages([]);
    setSelectedQuery('');
    setActiveNav('dashboard');
  };

  const handleSelectQuestion = (q: string) => {
    setSelectedQuery(q);
    setActiveNav('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
      {/* Top Header */}
      <Header
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Full-Width Layout (Right Sidebar Completely Removed) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        <LeftSidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onNewChat={handleNewChat}
          onSelectRecentChat={handleSelectQuestion}
        />

        {/* Center Main Intelligence Workspace - Full Width For Chat */}
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden">
          
          {/* ChatGPT / Gemini Full Screen Chat Interface */}
          {activeNav === 'dashboard' && (
            <ChatWorkspace
              messages={messages}
              setMessages={setMessages}
              selectedQuery={selectedQuery}
              onClearSelectedQuery={() => setSelectedQuery('')}
            />
          )}

          {/* Secondary Views (Accessible via Left Navigation) */}
          {activeNav !== 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="w-full max-w-5xl mx-auto space-y-6">
                
                {/* Data Sources View */}
                {activeNav === 'datasources' && <ConnectorStatusView />}

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

                {/* Other Modules */}
                {['events', 'countries', 'news', 'organizations', 'evidence', 'reports', 'settings'].includes(activeNav) && (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 capitalize">
                          {activeNav} Intelligence Module
                        </h2>
                        <p className="text-xs text-slate-500">
                          Live multilateral data integrated with GeoSentinel reasoning pipeline
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Continuous telemetry monitoring for <strong>{activeNav}</strong> across all registered public data connectors.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveNav('dashboard')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Chat
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </main>

      </div>

      {/* Auth / Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />
    </div>
  );
};
