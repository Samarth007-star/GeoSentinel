import React from 'react';
import {
  MessageSquarePlus,
  Sparkles,
  Link2,
  TrendingUp,
  Compass,
  MessageSquare,
  Trash2,
  X
} from 'lucide-react';

export interface RecentChatSummary {
  id: string;
  title: string;
  updatedAt: string;
}

interface LeftSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onNewChat: () => void;
  recentChats: RecentChatSummary[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeNav,
  setActiveNav,
  onNewChat,
  recentChats,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  isOpen,
  onClose
}) => {
  const navItems = [
    { id: 'dashboard', label: 'AI Workspace', icon: Sparkles },
    { id: 'datasources', label: 'Data Sources', icon: Link2 },
    { id: 'forecastlab', label: 'ForecastLab', icon: TrendingUp },
    { id: 'geolens', label: 'GeoLens', icon: Compass },
  ];

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs md:hidden animate-fadeIn"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 md:w-56 xl:w-64 bg-white border-r border-zinc-200 flex flex-col h-full md:h-[calc(100vh-4rem)] md:sticky md:top-16 select-none shrink-0 overflow-y-auto shadow-2xl md:shadow-none transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3.5 space-y-5">
          {/* Mobile Header inside Drawer */}
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-zinc-200">
            <span className="text-xs font-bold uppercase tracking-widest text-[#09090B]">
              GeoSentinel Menu
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-50 hover:text-[#DC2626]"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Black & Red Gradient CTA */}
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#09090B] via-[#B91C1C] to-[#DC2626] hover:from-[#18181B] hover:to-[#B91C1C] text-white transition-all font-bold text-xs shadow-[0_6px_20px_rgba(220,38,38,0.25)] active:scale-[0.98]"
          >
            <MessageSquarePlus className="w-4 h-4 stroke-[2.2]" />
            <span>New Chat</span>
          </button>

          {/* Streamlined Primary Navigation */}
          <div className="space-y-1">
            <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Workspace
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-red-50 text-[#DC2626] border border-red-200 shadow-xs font-semibold'
                        : 'text-zinc-600 hover:text-[#09090B] hover:bg-zinc-100/80 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#DC2626]' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dynamic Recent Chats Section */}
        <div className="mt-auto p-3.5 border-t border-zinc-200 bg-[#FAFAFA]">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Recent Chats
            </h4>
            {recentChats.length > 0 && (
              <span className="text-[10px] font-bold text-[#DC2626] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                {recentChats.length}
              </span>
            )}
          </div>

          {recentChats.length === 0 ? (
            <p className="text-[11px] text-zinc-400 px-2 py-2 leading-relaxed">
              No recent chats yet. Ask your query to begin.
            </p>
          ) : (
            <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
              {recentChats.map((chat) => {
                const isSelected = activeNav === 'dashboard' && activeSessionId === chat.id;
                return (
                  <div
                    key={chat.id}
                    className={`group flex items-center justify-between gap-1 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-white border-red-200 text-[#DC2626] font-semibold shadow-xs'
                        : 'border-transparent text-zinc-600 hover:text-[#09090B] hover:bg-white'
                    }`}
                  >
                    <button
                      onClick={() => {
                        onSelectSession(chat.id);
                        onClose();
                      }}
                      className="flex-1 flex items-center gap-2 px-2.5 py-2 text-[11px] text-left truncate min-w-0"
                      title={chat.title}
                    >
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-[#DC2626]' : 'text-zinc-400 group-hover:text-[#DC2626]'
                        }`}
                      />
                      <span className="truncate">{chat.title}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(chat.id);
                      }}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 mr-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0"
                      title="Delete chat"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
