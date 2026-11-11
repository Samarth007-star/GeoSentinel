import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Radio,
  GitBranch,
  Target,
  ShieldCheck,
  Globe2,
  Crown,
  Play,
  Globe,
  LogIn,
  UserPlus
} from 'lucide-react';
import { GeoGlobe3D } from './GeoGlobe3D';

interface HomePage3DProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLaunchWorkspace: (prefillQuery?: string) => void;
  onReplayWelcome?: () => void;
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Interactive3DCard: React.FC<TiltCardProps> = ({ children, className = '', onClick }) => {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glowX: 50, glowY: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 10,
      ry: (px - 0.5) * 12,
      glowX: px * 100,
      glowY: py * 100
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, glowX: 50, glowY: 50 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
        backgroundImage: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(124, 58, 237, 0.08), transparent 60%)`
      }}
      className={`transition-transform duration-200 ease-out preserve-3d ${className}`}
    >
      {children}
    </div>
  );
};

export const HomePage3D: React.FC<HomePage3DProps> = ({
  onOpenAuth,
  onLaunchWorkspace,
  onReplayWelcome
}) => {
  const pillars = [
    {
      step: '01',
      title: 'Smart Query & Intent Analyzer',
      desc: 'Detects greetings, simple facts, risks, good vs. bad trade-offs, market effects, or strategy requests before computing.',
      tag: 'Stage 0–3 • Intent AI',
      icon: BrainCircuit,
      accent: 'from-[#5B21B6] to-[#7C3AED]'
    },
    {
      step: '02',
      title: 'Live 2026 Multi-Source Fetch',
      desc: 'Streams real-time Google News, market trends, YouTube search buzz, social sentiment, DuckDuckGo, and Wikipedia in parallel.',
      tag: 'Stage 4–6 • Real-Time Feeds',
      icon: Radio,
      accent: 'from-[#6D28D9] to-[#9333EA]'
    },
    {
      step: '03',
      title: 'Causal & Scenario Modeling',
      desc: 'Traces direct vs. indirect impacts (GeoCausal), explores branching futures (GeoFork), and enforces a Strategy Risk Review Gate.',
      tag: 'Stage 7–11 • Risk Gate',
      icon: GitBranch,
      accent: 'from-[#4C1D95] to-[#6D28D9]'
    },
    {
      step: '04',
      title: 'Actionable Strategy Engine',
      desc: 'Delivers 4–5 specific, prioritized strategies with Good Effects, Bad Effects / Risks, Timing, Effort, and Best Strategy For You.',
      tag: 'Stage 12–13 • Decision Output',
      icon: Target,
      accent: 'from-[#7C3AED] to-[#A855F7]'
    }
  ];

  const demoPrompts = [
    {
      badge: 'RISK MODE',
      title: 'World Cup 2027 Loss Risk',
      query: 'What is risk if India loses World Cup 2027?',
      preview: 'Returns Risk summary, Why Will Happen bullets, Risk Level badge, Good/Bad Effect & Strategies.'
    },
    {
      badge: 'EFFECT MODE',
      title: 'India Win Market Effect',
      query: 'If India wins World Cup 2027 what will be effect on market?',
      preview: 'Compares Good Effects vs. Bad Effects, gives Overall Conclusion & actionable strategies.'
    },
    {
      badge: 'STRATEGY MODE',
      title: '5-Step Actionable Plan',
      query: 'Give strategy for India market if India wins World Cup 2027?',
      preview: 'Produces 5 prioritized non-generic strategies grounded in live 2026 news + Best Strategy pick.'
    }
  ];

  const metrics = [
    { label: 'Pipeline Stages', value: '13-Stage AI' },
    { label: 'Free Live Feeds', value: 'News • Social • YT' },
    { label: 'Intent Formats', value: 'Dynamic UI' },
    { label: 'Risk Governance', value: 'Red-Team Gate' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] text-slate-900 relative overflow-x-hidden">
      {/* Subtle Royal Lavender Background Glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px]"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 68% 12%, rgba(124, 58, 237, 0.14), transparent 72%)'
        }}
      />

      {/* Standalone Landing Top Navbar (Login & Register Right Here) */}
      <header className="sticky top-0 z-40 h-16 sm:h-[70px] bg-white/90 backdrop-blur-xl border-b border-purple-100 shadow-[0_2px_20px_rgba(109,40,217,0.06)]">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="#concept" className="flex items-center gap-2.5 sm:gap-3 select-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(109,40,217,0.3)]">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.1]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display font-bold text-lg sm:text-xl text-[#2E1065] tracking-tight">
                  GeoSentinel
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#9333EA] text-white text-[9px] font-extrabold uppercase tracking-widest shadow-sm">
                  <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                  Prime
                </span>
              </div>
              <p className="text-[10px] text-purple-600/80 font-medium hidden sm:block">
                Global Event Intelligence Platform
              </p>
            </div>
          </a>

          {/* Landing Section Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#concept" className="hover:text-[#6D28D9] transition-colors">
              Project Concept
            </a>
            <a href="#how-it-works" className="hover:text-[#6D28D9] transition-colors">
              How It Works
            </a>
            <a href="#capabilities" className="hover:text-[#6D28D9] transition-colors">
              Live Modes
            </a>
          </nav>

          {/* Login & Register Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/70 text-[#4C1D95] text-xs font-bold transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#6D28D9]" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white text-xs font-bold shadow-[0_6px_18px_rgba(109,40,217,0.28)] transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>
      </header>

      {/* Standalone Landing Body */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-14 sm:space-y-20">
        {/* SECTION 1: 3D Hero Showcase */}
        <section id="concept" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Hero Copy & Auth / Launch CTAs */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-purple-200 shadow-xs text-[11px] font-bold text-[#5B21B6]">
              <Crown className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>GeoSentinel Prime • 3D Intelligence Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight leading-[1.12] text-[#2E1065]">
              Global Intelligence That Turns Events Into{' '}
              <span className="bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent">
                Clear Strategy.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              <strong className="text-[#2E1065]">GeoSentinel Prime</strong> bridges breaking global events and real-world decisions. Instead of overwhelming you with raw links or generic advice, our multi-agent AI analyzes your exact query intent, streams live 2026 news &amp; social buzz, and delivers clear good/bad effects and actionable steps.
            </p>

            {/* Primary CTA Buttons (Login / Register / Launch Demo) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-bold text-xs sm:text-sm shadow-[0_10px_28px_rgba(109,40,217,0.3)] transition-all active:scale-98 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 text-[#4C1D95] font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#6D28D9]" />
                <span>Register Account</span>
              </button>

              <button
                type="button"
                onClick={() => onLaunchWorkspace()}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-[#6D28D9] hover:bg-purple-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Try Live Chat</span>
              </button>
            </div>

            {/* Concept Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-white/95 border border-purple-100 rounded-xl px-3 py-2.5 shadow-xs"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-purple-600/80">
                    {m.label}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#2E1065] mt-0.5">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive 3D Globe Showcase */}
          <div className="lg:col-span-6 relative perspective-1200">
            <Interactive3DCard className="relative bg-white/90 backdrop-blur-md border border-purple-200/80 rounded-3xl p-4 sm:p-6 shadow-[0_24px_60px_rgba(91,33,182,0.13)]">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-purple-200 shadow-md text-[11px] font-bold text-[#5B21B6] absolute top-5 left-5 z-20 animate-float-slow">
                <Globe2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Live Signal Mesh</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-md text-[11px] font-bold absolute top-5 right-5 z-20 animate-float-reverse">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Intent &amp; Risk Gate</span>
              </div>

              <GeoGlobe3D />
            </Interactive3DCard>
          </div>
        </section>

        {/* SECTION 2: 3D Architecture Concept Pillars */}
        <section id="how-it-works" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#6D28D9]">
                System Concept &amp; Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#2E1065] mt-1">
                How GeoSentinel Thinks From Question to Action
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Hover each 3D card to explore how raw questions turn into verified, simple-English strategy decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 perspective-1200">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Interactive3DCard
                  key={pillar.step}
                  className="bg-white border border-purple-100 hover:border-purple-400 rounded-2xl p-5 shadow-[0_10px_30px_rgba(91,33,182,0.06)] hover:shadow-[0_20px_44px_rgba(109,40,217,0.14)] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pillar.accent} flex items-center justify-center text-white shadow-md shadow-purple-700/20`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xl font-display font-extrabold text-purple-200">
                        {pillar.step}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#2E1065]">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-purple-50 text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    {pillar.tag}
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Interactive Concept Playground */}
        <section
          id="capabilities"
          className="bg-white border border-purple-200/80 rounded-3xl p-5 sm:p-8 shadow-[0_14px_45px_rgba(91,33,182,0.08)] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7C3AED]">
                Interactive Intent Showcase
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2E1065]">
                Different Questions Produce Smart Tailored Formats
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-[#5B21B6] transition-colors shrink-0 cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 perspective-1200">
            {demoPrompts.map((demo) => (
              <Interactive3DCard
                key={demo.badge}
                onClick={() => onLaunchWorkspace(demo.query)}
                className="cursor-pointer bg-[#FAF8FF] border border-purple-100 hover:border-purple-400 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5B21B6] text-[10px] font-extrabold tracking-wider">
                    {demo.badge}
                  </span>
                  <h3 className="text-sm font-bold text-[#2E1065] group-hover:text-[#6D28D9] transition-colors">
                    {demo.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-800 bg-white border border-purple-100 rounded-xl p-2.5 italic">
                    &ldquo;{demo.query}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {demo.preview}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6D28D9] group-hover:translate-x-0.5 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Workspace &amp; Run</span>
                </div>
              </Interactive3DCard>
            ))}
          </div>
        </section>
      </main>

      {/* Standalone Landing Footer */}
      <footer className="border-t border-purple-100 bg-white/80 py-6 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-[#2E1065]">
            <Globe className="w-4 h-4 text-[#6D28D9]" />
            <span>GeoSentinel Prime • Explainable Global Event Intelligence</span>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="text-[#5B21B6] hover:underline cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="text-[#5B21B6] hover:underline cursor-pointer"
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => onLaunchWorkspace()}
              className="text-[#5B21B6] hover:underline cursor-pointer"
            >
              AI Workspace
            </button>
            {onReplayWelcome && (
              <button
                type="button"
                onClick={onReplayWelcome}
                className="text-purple-500 hover:text-[#5B21B6] hover:underline cursor-pointer"
              >
                Replay Intro
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
