import React from 'react';
import {
  MessageSquarePlus,
  LayoutDashboard,
  Calendar,
  Globe,
  Newspaper,
  Users,
  Layers,
  Link2,
  TrendingUp,
  Cpu,
  Compass,
  FileSpreadsheet,
  Settings,
  MessageSquare
} from 'lucide-react';

interface LeftSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onNewChat: () => void;
  onSelectRecentChat: (query: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeNav,
  setActiveNav,
  onNewChat,
  onSelectRecentChat
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'countries', label: 'Countries', icon: Globe },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'organizations', label: 'Organizations', icon: Users },
    { id: 'evidence', label: 'Evidence', icon: Layers },
    { id: 'datasources', label: 'Data Sources', icon: Link2 },
    { id: 'forecastlab', label: 'ForecastLab', icon: TrendingUp },
    { id: 'geomemory', label: 'GeoMemory', icon: Cpu },
    { id: 'geolens', label: 'GeoLens', icon: Compass },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const recentChats = [
    { title: 'US Iran conflict impact...', query: 'What could be the effects on India if US-Iran tensions escalate?' },
    { title: 'Red Sea shipping risks...', query: 'Evaluate the economic and shipping container freight impact of Red Sea transit disruptions.' },
    { title: 'India energy security...', query: 'Analyze potential domestic sector spillovers if crude oil trade routes face selective maritime blockades.' },
    { title: 'China Taiwan latest...', query: 'Strategic assessment of East Asian semiconductor supply security and regional trade balance.' },
    { title: 'Recent earthquakes...', query: 'Review recent high-magnitude seismic events and humanitarian response infrastructure.' },
  ];

  return (
    <aside className="w-52 xl:w-60 bg-white border-r border-slate-200/90 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-y-auto">
      <div className="p-3 xl:p-3.5 space-y-4">
        {/* New Chat Primary Pill */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100/80 transition-all font-semibold text-xs border border-blue-100 shadow-sm"
        >
          <MessageSquarePlus className="w-4 h-4 stroke-[2.2]" />
          <span>New Chat</span>
        </button>

        {/* Primary Nav List */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Recent Chats Section */}
      <div className="mt-auto p-3.5 border-t border-slate-100">
        <h4 className="text-[11px] font-bold text-slate-800 tracking-tight mb-2 px-1">
          Recent Chats
        </h4>
        <div className="space-y-0.5">
          {recentChats.map((chat, idx) => (
            <button
              key={idx}
              onClick={() => onSelectRecentChat(chat.query)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors text-left truncate group"
              title={chat.title}
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
