import React, { useEffect, useRef, useState } from 'react';
import {
  Globe,
  Sparkles,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface WorkspaceTransition3DProps {
  userName: string;
  onComplete: () => void;
}

const STEPS = [
  { label: 'Verifying Workspace Session...', icon: ShieldCheck },
  { label: 'Connecting Live 2026 Intelligence Feeds...', icon: Radio },
  { label: 'Opening Direct AI Chat Workspace...', icon: MessageSquare }
];

export const WorkspaceTransition3D: React.FC<WorkspaceTransition3DProps> = ({
  userName,
  onComplete
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [exiting, setExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const t1 = window.setTimeout(() => setStepIdx(1), 480);
    const t2 = window.setTimeout(() => setStepIdx(2), 960);
    const tExit = window.setTimeout(() => setExiting(true), 1450);
    const tDone = window.setTimeout(() => onCompleteRef.current(), 1850);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(tExit);
      window.clearTimeout(tDone);
    };
  }, []);

  const ActiveIcon = STEPS[stepIdx].icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#050507] via-[#09090B] to-[#18181B] text-white px-4 transition-all duration-400 ease-out ${
        exiting ? 'opacity-0 scale-110 blur-sm pointer-events-none' : 'opacity-100 scale-100 blur-0'
      }`}
    >
      {/* Ambient Crimson Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(220, 38, 38, 0.24), rgba(255, 255, 255, 0.04) 45%, transparent 72%)'
        }}
      />

      {/* Floating Bokeh Orbs */}
      <div className="pointer-events-none absolute top-[18%] left-[15%] w-44 h-44 rounded-full bg-red-600/15 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute bottom-[18%] right-[15%] w-52 h-52 rounded-full bg-white/5 blur-3xl animate-float-reverse" />

      {/* 3D Portal Centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full space-y-6">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center perspective-1200">
          {/* Shockwave Rings */}
          <div className="absolute inset-2 rounded-full border-2 border-red-500/60 animate-shockwave" />
          <div
            className="absolute inset-2 rounded-full border border-white/35 animate-shockwave"
            style={{ animationDelay: '0.8s' }}
          />

          {/* Counter-Rotating 3D Gyroscope Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/65 animate-gyro-a pointer-events-none" />
          <div className="absolute inset-3 rounded-full border-2 border-white/35 animate-gyro-b pointer-events-none" />

          {/* Floating 3D Core */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#09090B] via-[#B91C1C] to-[#DC2626] text-white flex items-center justify-center shadow-[0_20px_60px_rgba(220,38,38,0.48)] border border-white/35 animate-pop-spring">
            <Globe className="w-10 h-10 stroke-[1.9]" />
            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-[#DC2626] border-2 border-red-500 flex items-center justify-center shadow-md">
              <BrainCircuit className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-red-500/40 text-[10px] font-bold uppercase tracking-widest text-red-400">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>Authenticated • {userName}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            Launching Your Chat Workspace
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300">
            Preparing your real-time query analyzer and 2026 intelligence feeds...
          </p>
        </div>

        {/* Sleek Progress Bar & Step Status */}
        <div className="w-full max-w-xs space-y-2.5">
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
            <div className="h-full rounded-full bg-gradient-to-r from-white via-[#EF4444] to-[#DC2626] animate-transition-fill shadow-[0_0_12px_rgba(239,68,68,0.75)]" />
          </div>

          <div className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-zinc-100">
            <ActiveIcon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>{STEPS[stepIdx].label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
