import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { LeftSidebar, RecentChatSummary } from './components/LeftSidebar';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ChatWorkspace, ChatMessage } from './features/chat/ChatWorkspace';
import { ConnectorStatusView } from './features/connectors/ConnectorStatusView';
import { ScenarioLaboratoryView } from './features/scenarios/ScenarioLaboratoryView';
import { HomePage3D } from './features/home/HomePage3D';
import { WelcomeSplash3D } from './components/WelcomeSplash3D';
import { WorkspaceTransition3D } from './components/WorkspaceTransition3D';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

const STORAGE_KEY = 'geosentinel_recent_chats_v1';
const MAX_RECENT_CHATS = 25;

function loadStoredSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s) => ({
      id: String(s.id),
      title: String(s.title || 'Untitled Chat'),
      updatedAt: String(s.updatedAt || new Date().toISOString()),
      messages: Array.isArray(s.messages)
        ? s.messages.map((m: ChatMessage) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
          }))
        : []
    }));
  } catch {
    return [];
  }
}

function buildChatTitle(msgs: ChatMessage[]): string {
  const firstUserMsg = msgs.find((m) => m.sender === 'user' && m.text?.trim());
  const raw = firstUserMsg?.text?.trim() || 'New Chat';
  return raw.length > 36 ? `${raw.slice(0, 36).trim()}...` : raw;
}

export const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showAuthTransition, setShowAuthTransition] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'workspace'>('home');
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadStoredSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('geosentinel_user_name') || 'Admin';
    } catch {
      return 'Admin';
    }
  });

  // Persist dynamic recent chats to localStorage whenever sessions update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_RECENT_CHATS)));
    } catch (err) {
      console.warn('Could not save chat history to localStorage:', err);
    }
  }, [sessions]);

  const activeMessages: ChatMessage[] = activeSessionId
    ? sessions.find((s) => s.id === activeSessionId)?.messages || []
    : [];

  const handleSetMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = useCallback(
    (updater) => {
      let targetId = activeSessionIdRef.current;

      if (!targetId) {
        const previewNext = typeof updater === 'function' ? updater([]) : updater;
        if (previewNext.length === 0) {
          return;
        }
        targetId = `chat_${Date.now()}`;
        activeSessionIdRef.current = targetId;
        setActiveSessionId(targetId);
      }

      const nowIso = new Date().toISOString();

      setSessions((prevSessions) => {
        const existingIndex = prevSessions.findIndex((s) => s.id === targetId);
        const prevMsgs = existingIndex >= 0 ? prevSessions[existingIndex].messages : [];
        const nextMsgs = typeof updater === 'function' ? updater(prevMsgs) : updater;

        if (nextMsgs.length === 0 && existingIndex < 0) {
          return prevSessions;
        }

        const updatedSession: ChatSession = {
          id: targetId as string,
          title:
            existingIndex >= 0 && prevSessions[existingIndex].title !== 'New Chat'
              ? prevSessions[existingIndex].title
              : buildChatTitle(nextMsgs),
          messages: nextMsgs,
          updatedAt: nowIso
        };

        const remaining = prevSessions.filter((s) => s.id !== targetId);
        return [updatedSession, ...remaining].slice(0, MAX_RECENT_CHATS);
      });
    },
    []
  );

  const handleNewChat = () => {
    activeSessionIdRef.current = null;
    setActiveSessionId(null);
    setSelectedQuery('');
    setActiveNav('dashboard');
  };

  const handleSelectSession = (sessionId: string) => {
    activeSessionIdRef.current = sessionId;
    setActiveSessionId(sessionId);
    setSelectedQuery('');
    setActiveNav('dashboard');
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionIdRef.current === sessionId) {
      activeSessionIdRef.current = null;
      setActiveSessionId(null);
    }
  };

  const recentChatSummaries: RecentChatSummary[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    updatedAt: s.updatedAt
  }));

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const enterWorkspace = (prefillQuery?: string) => {
    if (prefillQuery) {
      activeSessionIdRef.current = null;
      setActiveSessionId(null);
      setSelectedQuery(prefillQuery);
    }
    setActiveNav('dashboard');
    setCurrentPage('workspace');
  };

  const handleAuthTransitionComplete = useCallback(() => {
    setShowAuthTransition(false);
  }, []);

  const handleSaveProfileName = (newName: string) => {
    setUserName(newName);
    try {
      localStorage.setItem('geosentinel_user_name', newName);
    } catch {
      // ignore storage failures
    }
  };

  const handleLogout = () => {
    setUserName('Admin');
    try {
      localStorage.removeItem('geosentinel_user_name');
    } catch {
      // ignore storage failures
    }
    setIsProfileOpen(false);
    setIsAuthOpen(false);
    setShowAuthTransition(false);
    setCurrentPage('home');
  };

  const authModalElement = (
    <AuthModal
      isOpen={isAuthOpen}
      initialMode={authMode}
      onClose={() => setIsAuthOpen(false)}
      onSuccess={(signedInName) => {
        if (signedInName) {
          setUserName(signedInName);
          try {
            localStorage.setItem('geosentinel_user_name', signedInName);
          } catch {
            // ignore storage failures
          }
        }
        setIsAuthOpen(false);
        setActiveNav('dashboard');
        setCurrentPage('workspace');
        setShowAuthTransition(true);
      }}
    />
  );

  if (currentPage === 'home') {
    return (
      <>
        {showWelcome && <WelcomeSplash3D onComplete={() => setShowWelcome(false)} />}
        <div
          className={`w-full min-h-screen transition-all duration-700 ease-out ${
            showWelcome ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
          }`}
        >
          <HomePage3D
            onOpenAuth={(mode) => openAuthModal(mode)}
            onLaunchWorkspace={(prefillQuery) => enterWorkspace(prefillQuery)}
            isAuthOpen={isAuthOpen}
          />
        </div>
        {authModalElement}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-zinc-950 antialiased font-sans">
      {showAuthTransition && (
        <WorkspaceTransition3D
          userName={userName}
          onComplete={handleAuthTransitionComplete}
        />
      )}
      {/* Top Header */}
      <Header
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenAuth={() => openAuthModal('login')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        onGoHome={() => setCurrentPage('home')}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        userName={userName}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Navigation Sidebar with Dynamic Recent Chats & Mobile Drawer */}
        <LeftSidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onNewChat={handleNewChat}
          recentChats={recentChatSummaries}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center Main Intelligence Workspace - Full Width */}
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#FAFAFA] overflow-hidden min-w-0">
          
          {/* ChatGPT / Gemini Full Screen Chat Interface */}
          {activeNav === 'dashboard' && (
            <ChatWorkspace
              messages={activeMessages}
              setMessages={handleSetMessages}
              selectedQuery={selectedQuery}
              onClearSelectedQuery={() => setSelectedQuery('')}
            />
          )}

          {/* Secondary Functional Views (Black, Red & White Theme) */}
          {activeNav !== 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-[#FAFAFA] text-zinc-950">
              <div className="w-full max-w-5xl mx-auto space-y-6">
                
                {/* Data Sources View */}
                {activeNav === 'datasources' && <ConnectorStatusView />}

                {/* ForecastLab View */}
                {activeNav === 'forecastlab' && (
                  <ScenarioLaboratoryView initialSubTab="forecastlab" />
                )}

                {/* GeoLens View */}
                {activeNav === 'geolens' && (
                  <ScenarioLaboratoryView initialSubTab="geolens" />
                )}

              </div>
            </div>
          )}

        </main>

      </div>

      {authModalElement}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userName={userName}
        onSaveName={handleSaveProfileName}
      />
    </div>
  );
};
