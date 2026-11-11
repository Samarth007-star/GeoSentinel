import React, { useState } from 'react';
import { Globe, Bell, ChevronDown, LogIn, ShieldCheck, Check, Crown, Menu, X, Home } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onGoHome: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onGoHome,
  isSidebarOpen,
  onToggleSidebar,
  userName = 'Admin'
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'USGS Disaster Alert', desc: 'M5.8 earthquake detected in Western Iran region', time: '12m ago', unread: true },
    { id: 2, title: 'GDELT Conflict Stream', desc: '1,420 regional tension articles verified across Persian Gulf', time: '35m ago', unread: true },
    { id: 3, title: 'World Bank Economic Feed', desc: 'Updated trade flows and maritime vulnerability indices', time: '2h ago', unread: false },
  ];

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between shadow-[0_2px_20px_rgba(109,40,217,0.06)]">
      {/* Left: Mobile Menu Button + Royal Purple & White Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 select-none">
        <button
          onClick={onToggleSidebar}
          className="md:hidden w-9 h-9 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200/80 transition-colors"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 sm:gap-3.5 text-left group cursor-pointer"
          title="Back to Home Page"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(109,40,217,0.28)] group-hover:scale-105 transition-transform shrink-0">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.1]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-bold text-lg sm:text-xl text-[#2E1065] tracking-tight truncate">
                GeoSentinel
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#9333EA] text-white text-[9px] font-extrabold uppercase tracking-widest shadow-sm shrink-0">
                <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                Prime
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-purple-600/80 font-medium tracking-wide hidden sm:block">
              Royal Global Event Intelligence
            </p>
          </div>
        </button>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="w-9 h-9 rounded-full bg-purple-50/70 border border-purple-100 hover:border-purple-300 hover:bg-purple-100/70 flex items-center justify-center text-purple-700 relative transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(91,33,182,0.16)] border border-purple-100 py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-2.5 border-b border-purple-50 flex items-center justify-between">
                <span className="text-xs font-bold text-[#2E1065]">Intelligence Alerts</span>
                <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="divide-y divide-purple-50 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-purple-50/50 transition-colors cursor-pointer text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#2E1065]">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-purple-50/70 border border-purple-100 hover:border-purple-300 hover:bg-purple-100/60 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-[#2E1065] hidden sm:inline-block">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-purple-600" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-[0_20px_50px_rgba(91,33,182,0.16)] border border-purple-100 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-purple-50">
                <p className="text-xs font-bold text-[#2E1065]">Chief Analyst ({userName})</p>
                <p className="text-[11px] text-slate-500 truncate">admin@geosentinel.ai</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onGoHome();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors"
                >
                  <Home className="w-4 h-4 text-purple-600" />
                  <span>Back to Home Page</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAuth();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-purple-600" />
                  <span>Switch Account / Login</span>
                </button>
                <div className="px-4 py-2 text-left text-xs text-slate-500 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Prime Live Verified</span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
