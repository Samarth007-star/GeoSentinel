import React, { useState } from 'react';
import { Globe, Bell, ChevronDown, LogIn, LogOut, ShieldCheck, Check, Menu, X, Home, User } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenProfile,
  onLogout,
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
    <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between shadow-[0_2px_20px_rgba(9,9,11,0.05)]">
      {/* Left: Mobile Menu Button + Black, Red & White Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 select-none">
        <button
          onClick={onToggleSidebar}
          className="md:hidden w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC2626] flex items-center justify-center border border-red-200 transition-colors"
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
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#09090B] via-[#991B1B] to-[#DC2626] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(220,38,38,0.28)] group-hover:scale-105 transition-transform shrink-0">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.1]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-bold text-lg sm:text-xl text-[#09090B] tracking-tight truncate">
                GeoSentinel
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#DC2626] font-semibold tracking-wide hidden sm:block">
              Global Event Intelligence
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
            className="w-9 h-9 rounded-full bg-zinc-50 border border-zinc-200 hover:border-red-300 hover:bg-red-50/70 flex items-center justify-center text-[#09090B] relative transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(9,9,11,0.16)] border border-zinc-200 py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-2.5 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#09090B]">Intelligence Alerts</span>
                <span className="text-[10px] text-[#DC2626] font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-red-50/40 transition-colors cursor-pointer text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#09090B]">{n.title}</span>
                      <span className="text-[10px] text-zinc-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-snug">{n.desc}</p>
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
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 hover:border-red-300 hover:bg-red-50/50 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#09090B] to-[#DC2626] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-[#09090B] hidden sm:inline-block">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#DC2626]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-[0_20px_50px_rgba(9,9,11,0.16)] border border-zinc-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-zinc-100">
                <p className="text-xs font-bold text-[#09090B]">Chief Analyst ({userName})</p>
                <p className="text-[11px] text-zinc-500 truncate">admin@geosentinel.ai</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-zinc-700 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#DC2626]" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onGoHome();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-zinc-700 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Home className="w-4 h-4 text-[#09090B]" />
                  <span>Back to Home Page</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAuth();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-zinc-700 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#09090B]" />
                  <span>Switch Account / Login</span>
                </button>
                <div className="px-4 py-2 text-left text-xs text-zinc-500 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#09090B]" />
                    <span>Live Verified</span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-[#DC2626]" />
                </div>
                <div className="my-1 border-t border-zinc-100" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-[#DC2626] hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#DC2626]" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
