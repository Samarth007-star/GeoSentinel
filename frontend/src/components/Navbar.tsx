import React from 'react';
import { Shield, Globe, Activity, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: 'ask' | 'evidence' | 'connectors' | 'scenarios';
  setActiveTab: (tab: 'ask' | 'evidence' | 'connectors' | 'scenarios') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-sentinel-700/60 bg-sentinel-850/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('ask')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-sentinel-900 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white tracking-wide">GeoSentinel</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Research MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Explainable Multi-Agent AI Framework</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'ask'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-sentinel-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Ask GeoSentinel</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'evidence'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-sentinel-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Evidence DNA</span>
          </button>

          <button
            onClick={() => setActiveTab('connectors')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'connectors'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-sentinel-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Connectors</span>
          </button>
        </nav>

        {/* System Status Indicators */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Zero-Paid-API Compliant</span>
          </div>
        </div>

      </div>
    </header>
  );
};
