import React, { useEffect, useState } from 'react';
import { Globe, Crown, Sparkles, ArrowRight, Radio, BrainCircuit, ShieldCheck } from 'lucide-react';

interface WelcomeSplash3DProps {
  onComplete: () => void;
}

const BOOT_PHASES = [
  { label: 'Initializing Query & Intent Analyzer...', icon: BrainCircuit },
  { label: 'Connecting Live 2026 Global Signals...', icon: Radio },
  { label: 'Entering GeoSentinel Prime 3D Home...', icon: ShieldCheck }
];

export const WelcomeSplash3D: React.FC<WelcomeSplash3DProps> = ({ onComplete }) => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhaseIdx(1), 850);
    const t2 = window.setTimeout(() => setPhaseIdx(2), 1750);
    const tExit = window.setTimeout(() => setExiting(true), 2550);
    const tDone = window.setTimeout(() => onComplete(), 3100);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(tExit);
      window.clearTimeout(tDone);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setExiting(true);
    window.setTimeout(() => onComplete(), 380);
  };

  const ActiveIcon = BOOT_PHASES[phaseIdx].icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FAF8FF] via-white to-[#F3E8FF] transition-all duration-500 ease-out px-4 ${
        exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Radial Royal Purple Ambient Aura */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 44%, rgba(124, 58, 237, 0.22), rgba(167, 139, 250, 0.08) 42%, transparent 72%)'
        }}
      />

      {/* Soft Floating Lavender Bokeh Orbs */}
      <div className="pointer-events-none absolute top-[14%] left-[12%] w-36 h-36 sm:w-56 sm:h-56 rounded-full bg-purple-400/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute bottom-[14%] right-[12%] w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-violet-500/15 blur-3xl animate-float-reverse" />

      {/* Main 3D Centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full space-y-6 sm:space-y-7">
        {/* 3D Gyroscope Emblem Stage */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center perspective-1200">
          {/* Expanding Shockwave Pulse Rings */}
          <div className="absolute inset-3 rounded-full border-2 border-purple-400/45 animate-shockwave" />
          <div
            className="absolute inset-3 rounded-full border border-violet-500/35 animate-shockwave"
            style={{ animationDelay: '1.1s' }}
          />

          {/* Counter-Rotating 3D Gyroscope Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#7C3AED]/45 animate-gyro-a pointer-events-none" />
          <div className="absolute inset-2 rounded-full border-2 border-[#5B21B6]/30 animate-gyro-b pointer-events-none" />

          {/* Center Floating Royal Purple Emblem */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#9333EA] flex items-center justify-center text-white shadow-[0_20px_55px_rgba(109,40,217,0.45)] border border-white/30 animate-pop-spring">
            <Globe className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.8]" />
            <span className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center text-[#6D28D9] shadow-md">
              <Crown className="w-4 h-4 stroke-[2.3]" />
            </span>
          </div>
        </div>

        {/* Staggered Welcome Typography */}
        <div className="space-y-3">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 border border-purple-200 shadow-xs text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.22em] text-[#6D28D9] opacity-0 animate-slide-reveal"
            style={{ animationDelay: '0.18s' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Welcome To</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight opacity-0 animate-slide-reveal"
            style={{ animationDelay: '0.38s' }}
          >
            <span className="bg-gradient-to-r from-[#2E1065] via-[#6D28D9] to-[#9333EA] bg-clip-text text-transparent">
              GeoSentinel
            </span>{' '}
            <span className="inline-block px-3 py-0.5 text-lg sm:text-2xl align-middle rounded-2xl bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-md shadow-purple-700/30">
              Prime
            </span>
          </h1>

          <p
            className="text-xs sm:text-sm md:text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed opacity-0 animate-slide-reveal"
            style={{ animationDelay: '0.58s' }}
          >
            Global Event Intelligence &amp; Actionable AI Strategy Platform
          </p>
        </div>

        {/* Sleek Royal Progress Indicator & Live Phase Pill */}
        <div
          className="w-full max-w-xs sm:max-w-sm space-y-2.5 opacity-0 animate-slide-reveal"
          style={{ animationDelay: '0.75s' }}
        >
          <div className="h-1.5 w-full rounded-full bg-purple-100 overflow-hidden shadow-inner">
            <div className="h-full rounded-full bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#A855F7] animate-progress-fill shadow-[0_0_12px_rgba(124,58,237,0.6)]" />
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-[#5B21B6]">
            <ActiveIcon className="w-3.5 h-3.5 text-[#7C3AED] animate-pulse" />
            <span>{BOOT_PHASES[phaseIdx].label}</span>
          </div>
        </div>
      </div>

      {/* Subtle Skip Intro Action */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-20 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white border border-purple-200 hover:border-purple-400 text-[#5B21B6] text-xs font-bold shadow-sm transition-all cursor-pointer"
      >
        <span>Skip Intro</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

