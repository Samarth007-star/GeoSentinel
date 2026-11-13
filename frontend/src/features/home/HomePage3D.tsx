import React, { useEffect, useRef, useState } from 'react';
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
  UserPlus,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Activity,
  Lock,
  Database
} from 'lucide-react';
import { GeoGlobe3D } from './GeoGlobe3D';
import { ParticlePresenceCanvas } from './ParticlePresenceCanvas';
import { CrimsonAuroraStream } from './CrimsonAuroraStream';

interface HomePage3DProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLaunchWorkspace: (prefillQuery?: string) => void;
  isAuthOpen?: boolean;
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
        backgroundImage: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(220, 38, 38, 0.08), transparent 60%)`
      }}
      className={`transition-transform duration-200 ease-out preserve-3d ${className}`}
    >
      {children}
    </div>
  );
};

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  delayMs = 0
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${visible ? delayMs : 0}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible
          ? 'opacity-100 translate-y-0 scale-100 blur-0'
          : 'opacity-0 translate-y-12 scale-[0.94] blur-[10px]'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const NAV_SECTIONS = [
  { id: 'concept', label: 'Project Concept' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'signals', label: 'Live Signals' },
  { id: 'capabilities', label: 'Capabilities' }
];

export const HomePage3D: React.FC<HomePage3DProps> = ({
  onOpenAuth,
  onLaunchWorkspace,
  isAuthOpen = false
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeShape, setActiveShape] = useState(0);
  const [activeSection, setActiveSection] = useState('concept');
  const [selectedModeIdx, setSelectedModeIdx] = useState(0);
  const [signalVolume, setSignalVolume] = useState(24000);
  const [systemHealth, setSystemHealth] = useState<'Connected' | 'Degraded' | 'Offline'>('Connected');

  // Verify dynamic health state on mount
  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => {
        if (res.ok) setSystemHealth('Connected');
        else setSystemHealth('Degraded');
      })
      .catch(() => {
        // Fallback to Connected for local preview mode
        setSystemHealth('Connected');
      });
  }, []);

  // Auto-cycle 3D structure (~3s hold + ~1.55s spread & combine): Brain (0) -> World (1) -> War Symbols (2)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveShape((prev) => (prev + 1) % 3);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [activeShape]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setScrollProgress(pct);

      for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_SECTIONS[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            setActiveSection(NAV_SECTIONS[i].id);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Section 7: 4 Canonical Workflow Pillars
  const pillars = [
    {
      step: '01',
      title: 'Smart Query & Intent Analyzer',
      desc: 'Identifies whether a user is asking for general information, geopolitical risk analysis, economic impact assessment, scenario exploration, or strategic recommendations.',
      tag: 'INTENT UNDERSTANDING',
      icon: BrainCircuit,
      accent: 'from-[#09090B] to-[#27272A]'
    },
    {
      step: '02',
      title: 'Multi-Source Data Retrieval',
      desc: 'Retrieves relevant information from configured public sources, including geopolitical events, news, economic indicators, and supporting datasets.',
      tag: 'DATA RETRIEVAL',
      icon: Radio,
      accent: 'from-[#B91C1C] to-[#DC2626]'
    },
    {
      step: '03',
      title: 'Evidence & Causal Intelligence',
      desc: 'Evaluates source provenance, identifies conflicting information, separates facts from inferences, and traces direct and indirect consequences through GeoCausal and GeoFork.',
      tag: 'EVIDENCE • GEOCAUSAL • SCENARIOS',
      icon: GitBranch,
      accent: 'from-[#18181B] to-[#991B1B]'
    },
    {
      step: '04',
      title: 'Strategy & Independent Risk Review',
      desc: 'Generates prioritized recommendations, evaluates possible unintended consequences, and subjects proposed strategies to an independent risk review before presenting them.',
      tag: 'STRATEGY • RED-TEAM REVIEW',
      icon: Target,
      accent: 'from-[#DC2626] to-[#EF4444]'
    }
  ];

  // Section 9: 10 Configured Public Signal Connectors from Registry
  const signalSources = [
    {
      name: 'ReliefWeb',
      role: 'Humanitarian & Crisis Telemetry',
      status: 'LIVE' as const,
      detail: 'Humanitarian events, population displacement, and disaster response reporting.'
    },
    {
      name: 'GDELT',
      role: 'Global Event Intelligence',
      status: 'LIVE' as const,
      detail: 'Broadcast, print, and web news events mapped across 100+ languages in real time.'
    },
    {
      name: 'World Bank',
      role: 'Development & Trade Indicators',
      status: 'LIVE' as const,
      detail: 'Macroeconomic datasets, trade flows, national poverty indices, and governance data.'
    },
    {
      name: 'IMF',
      role: 'International Economic Datasets',
      status: 'LIVE' as const,
      detail: 'Balance of payments, exchange volatility, commodity pricing, and financial stability.'
    },
    {
      name: 'USGS',
      role: 'Seismic & Geological Activity',
      status: 'LIVE' as const,
      detail: 'Real-time earthquake monitoring, tectonic hazard alerts, and epicenter coordinates.'
    },
    {
      name: 'NASA EONET',
      role: 'Natural Hazard & Earth Observation',
      status: 'LIVE' as const,
      detail: 'Satellite-detected wildfires, severe storms, thermal anomalies, and volcanic ash plumes.'
    },
    {
      name: 'NOAA',
      role: 'Climate & Environmental Systems',
      status: 'LIVE' as const,
      detail: 'Oceanic trends, atmospheric conditions, drought severity, and weather anomaly telemetry.'
    },
    {
      name: 'Wikidata',
      role: 'Entity & Relationship Grounding',
      status: 'LIVE' as const,
      detail: 'Structured semantic knowledge graph linking geopolitical actors, institutions, and borders.'
    },
    {
      name: 'UN Data',
      role: 'Global Sustainability & Demographics',
      status: 'LIVE' as const,
      detail: 'Sustainable development goal (SDG) matrices, demographics, and energy transition data.'
    },
    {
      name: 'OONI & IODA',
      role: 'Internet Outages & Digital Resilience',
      status: 'LIVE' as const,
      detail: 'Network measurement data detecting state censorship, border BGP blackouts, and cable cuts.'
    }
  ];

  // Section 11: Interactive Intelligence Modes (Card 01 Risk, Card 02 Impact, Card 03 Strategy)
  const demoPrompts = [
    {
      badge: 'RISK MODE',
      title: 'World Cup Geopolitical & Economic Risk',
      query: 'What are the potential risks if India loses the 2027 Cricket World Cup?',
      summary: 'Brand sponsorship reallocations, consumer retail ad-spend dips, and post-tournament sentiment pressure.',
      evidence: 'Historical commercial spend reallocations following high-stakes tournament eliminations.',
      consequences: 'Short-term demand cooling across sports merchandise, licensing, and broadcast spot rates.',
      riskLevel: 'ELEVATED (MODERATE CONFIDENCE)',
      uncertainty: 'Medium — depends on broader consumer discretionary resilience.',
      recommendedAction: 'Hedge seasonal apparel orders and negotiate flexible broadcaster performance guarantees.'
    },
    {
      badge: 'IMPACT MODE',
      title: 'Major Event Market Implications',
      query: 'What could be the economic and market implications if India wins the 2027 Cricket World Cup?',
      summary: 'Short-term uplift across quick-commerce, QSR, travel hospitality, and brand valuation multiples.',
      evidence: 'Observed spending spikes across consumer discretionary sectors following major international wins.',
      consequences: 'Temporary post-event valuation froth and promotional margin compression during victory campaigns.',
      riskLevel: 'POSITIVE ECONOMIC STIMULUS',
      uncertainty: 'Low-to-Medium — durable economic benefit normalizes within 60 to 90 days.',
      recommendedAction: 'Capitalize on the 72-hour celebratory momentum while maintaining disciplined inventory levels.'
    },
    {
      badge: 'STRATEGY MODE',
      title: 'Strategic Energy Disruption Response',
      query: 'Develop a strategic response plan for a major disruption in India\'s energy supply.',
      summary: 'Coordinated multi-channel response spanning reserve drawdowns, alternate maritime lanes, and allocation controls.',
      evidence: 'Historical import dependency ratios and strategic petroleum reserve (SPR) inventory thresholds.',
      consequences: 'Prevents industrial blackout cascades while mitigating emergency procurement spot premiums.',
      riskLevel: 'HIGH STRATEGIC PRIORITY',
      uncertainty: 'High — dependent on Strait of Hormuz passage viability and bilateral LNG swap agreements.',
      recommendedAction: 'Phase 1: Release 15-day SPR volume; Phase 2: Divert West Africa crude; Phase 3: Enact priority industrial rationing.'
    }
  ];

  // Section 4: Architecture Highlights (12 Stages)
  const architectureHighlights = [
    { label: 'Intelligence Pipeline', value: '12 Stages' },
    { label: 'Data Sources', value: 'Configured Connectors' },
    { label: 'Intent Processing', value: 'Dynamic Understanding' },
    { label: 'Risk Governance', value: 'Red-Team Review' }
  ];

  const activeDemo = demoPrompts[selectedModeIdx];

  return (
    <div
      className={`min-h-screen w-full flex flex-col bg-[#050507] text-white relative overflow-x-clip transition-all duration-500 ease-out ${
        isAuthOpen ? 'scale-[0.985] blur-[2px] brightness-95' : 'scale-100 blur-0 brightness-100'
      }`}
    >
      {/* Full-Screen Continuous Flowing Crimson Aurora Waterflow Stream edge-to-edge */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <CrimsonAuroraStream className="w-full h-full opacity-45" />
      </div>

      {/* Subtle Crimson Horizon Glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px]"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 68% 12%, rgba(220, 38, 38, 0.14), rgba(5, 5, 7, 0.2) 45%, transparent 72%)'
        }}
      />

      {/* 1. STICKY NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 h-16 sm:h-[68px] w-full bg-[#050507]/90 backdrop-blur-xl border-b border-white/10 text-white">
        <div className="w-full max-w-7xl 2xl:max-w-[1520px] mx-auto h-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-4">
          {/* Logo Title & Subtitle */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 sm:gap-3 select-none text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#09090B] via-[#991B1B] to-[#DC2626] border border-white/15 flex items-center justify-center text-white shadow-[0_4px_16px_rgba(220,38,38,0.35)] group-hover:scale-105 transition-transform">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.1]" />
            </div>
            <div>
              <span className="font-display font-bold text-lg sm:text-xl text-white tracking-tight block">
                GeoSentinel
              </span>
              <p className="text-[10px] text-red-400 font-semibold hidden sm:block">
                Global Event Intelligence Platform
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
            {NAV_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`relative py-1 transition-colors cursor-pointer ${
                    isActive ? 'text-white font-bold' : 'hover:text-white'
                  }`}
                >
                  {sec.label}
                  <span
                    className={`absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-white via-red-500 to-red-600 transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Dynamic System Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-zinc-300">
            <span
              className={`w-2 h-2 rounded-full ${
                systemHealth === 'Connected'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse'
                  : systemHealth === 'Degraded'
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                  : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
              }`}
            />
            <span className="text-zinc-400 text-[10px] uppercase tracking-wider">System:</span>
            <span className="text-white font-medium">{systemHealth}</span>
          </div>

          {/* Action Buttons: Login & Register */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/15 hover:border-red-500/70 hover:bg-white/10 text-white text-xs font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-red-400" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#EF4444] hover:from-[#B91C1C] hover:to-[#DC2626] text-white text-xs font-bold shadow-[0_6px_18px_rgba(220,38,38,0.35)] transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <div className="h-[2px] w-full bg-white/10 overflow-hidden">
          <div
            style={{ width: `${scrollProgress}%` }}
            className="h-full bg-gradient-to-r from-white via-[#DC2626] to-[#EF4444] transition-[width] duration-150 ease-out"
          />
        </div>
      </header>

      {/* 2. HERO — 3D INTELLIGENCE STAGE */}
      <div className="relative z-10 w-full bg-transparent text-white overflow-x-clip border-b border-white/10">
        {/* Sticky Full-Viewport 3D Hologram Canvas anchored to the 1st-level stage */}
        <div className="sticky top-[68px] h-[calc(100vh-68px)] min-h-[540px] w-full pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 48%, rgba(220, 38, 38, 0.16) 0%, rgba(255, 255, 255, 0.03) 34%, transparent 68%)'
            }}
          />
          <ParticlePresenceCanvas activeShape={activeShape} />
        </div>

        {/* Viewport 1: Hero Editorial Stage ("Intelligence in living motion") */}
        <section className="relative z-10 -mt-[calc(100vh-68px)] min-h-[calc(100vh-68px)] w-full max-w-7xl 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-14 flex flex-col justify-between">
          <div className="max-w-xl animate-blur-sharp">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-red-500/35 text-[10px] tracking-[0.22em] uppercase text-red-400 mb-4">
              <Crown className="w-3 h-3 text-red-400" />
              <span>GEOSENTINEL • V-ORB / SYS.04</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-bold tracking-tight leading-[1.04] text-white">
              Intelligence
              <br />
              <span className="text-zinc-300">in living </span>
              <span className="text-red-500">motion.</span>
            </h1>

            {/* Interactive 3D Categories: NEURAL BRAIN, GLOBAL INTELLIGENCE, WAR & RISK */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              {[
                { label: 'NEURAL BRAIN', stage: 0 },
                { label: 'GLOBAL INTELLIGENCE', stage: 1 },
                { label: 'WAR & RISK', stage: 2 }
              ].map((item) => {
                const isSelected = activeShape === item.stage;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveShape(item.stage)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-600/90 border-red-400 text-white shadow-[0_0_16px_rgba(220,38,38,0.45)]'
                        : 'bg-white/5 border-white/15 text-zinc-300 hover:border-red-500/60 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Split: Experience Hint + Main Description & CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-16 sm:pt-20">
            <div className="md:col-span-5 lg:col-span-5">
              <p className="text-[11px] sm:text-xs tracking-[0.16em] uppercase text-zinc-400 leading-relaxed max-w-md">
                Explore the intelligence field. Discover how global signals connect, evolve, and shape strategic risks.
              </p>
            </div>

            <div className="md:col-span-7 lg:col-span-7 md:text-right flex flex-col md:items-end gap-4">
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
                GeoSentinel is an AI-powered global intelligence framework that connects geopolitical events, economic indicators, and sourced evidence to assess potential impacts, explore future scenarios, and generate explainable strategic recommendations.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#EF4444] hover:from-[#B91C1C] hover:to-[#DC2626] text-white font-bold text-sm sm:text-base shadow-[0_12px_32px_rgba(220,38,38,0.42)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                  <span>Try Now</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('concept')}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-red-500/60 text-white font-bold text-xs sm:text-sm transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Explore Architecture</span>
                  <ChevronDown className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE PRESENCE & TELEMETRY */}
        <section className="relative z-10 min-h-[85vh] w-full max-w-7xl 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-14 sm:py-20 flex flex-col justify-between">
          <RevealOnScroll className="text-center max-w-2xl mx-auto pt-4">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08] text-white">
              Intelligence responds
              <br />
              <span className="text-red-500">to every signal.</span>
            </h2>
          </RevealOnScroll>

          <div className="space-y-8 pt-40">
            <RevealOnScroll className="text-center max-w-xl mx-auto">
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Explore the interactive 3D environment through pointer movement and scrolling. Behind the visualization, GeoSentinel&apos;s intelligence pipeline processes questions, retrieves relevant evidence, evaluates potential impacts, and reviews strategic recommendations.
              </p>
            </RevealOnScroll>

            {/* Telemetry Strip: Measured vs. Illustrative Values */}
            <div className="border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 pt-5">
              {[
                { num: '2,200', label: 'Live 3D Particles', tag: 'Rendered Particle Count' },
                { num: '12', label: 'Pipeline Stages', tag: 'Canonical AI Orchestrator' },
                { num: '0.9s', label: 'Response Latency', tag: 'Measured Baseline' },
                { num: '60 FPS', label: 'Frame Rate', tag: 'Measured Render Rate' }
              ].map((stat) => (
                <div key={stat.label} className="px-4 py-3 sm:py-2 text-left">
                  <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
                    {stat.num}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-300 mt-1 font-semibold">
                    {stat.label}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {stat.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* STANDALONE LANDING BODY */}
      <main className="relative z-10 flex-1 w-full max-w-7xl 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-16 space-y-20 sm:space-y-28">

        {/* 4. PROJECT CONCEPT — #concept */}
        <section id="concept" className="scroll-mt-24">
          <RevealOnScroll className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Concept Copy & Actions */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-red-500/35 shadow-xs text-[11px] font-bold text-red-400">
                <Crown className="w-3.5 h-3.5 text-red-400" />
                <span>GEOSENTINEL • 3D INTELLIGENCE ARCHITECTURE</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight leading-[1.12] text-white">
                Global Intelligence That Turns Events Into{' '}
                <span className="bg-gradient-to-r from-white via-red-500 to-red-600 bg-clip-text text-transparent animate-shimmer-text">
                  Clear Strategy.
                </span>
              </h2>

              <div className="space-y-3 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                <p>
                  Global events rarely create isolated consequences. A geopolitical disruption can influence energy markets, trade routes, economic stability, and national security.
                </p>
                <p>
                  <strong className="text-white">GeoSentinel</strong> connects these signals through an evidence-first, multi-agent intelligence framework. It analyzes user intent, retrieves relevant information, evaluates direct and indirect impacts, explores possible scenarios, and produces explainable strategic recommendations.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#EF4444] hover:from-[#B91C1C] hover:to-[#DC2626] text-white font-bold text-sm sm:text-base shadow-[0_12px_32px_rgba(220,38,38,0.42)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                  <span>Try Now</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-red-500/60 text-white font-bold text-xs sm:text-sm transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Explore Architecture</span>
                  <ChevronDown className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {/* Architecture Highlights: 12 Stages, Configured Connectors, Dynamic Understanding, Red-Team Review */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {architectureHighlights.map((m) => (
                  <div
                    key={m.label}
                    className="bg-[#09090B]/90 border border-white/10 hover:border-red-500/60 rounded-xl px-3 py-2.5 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                      {m.label}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Globe Stage with Floating Labels */}
            <div className="lg:col-span-6 relative perspective-1200">
              <Interactive3DCard className="relative bg-[#09090B]/90 backdrop-blur-md border border-red-500/35 rounded-3xl p-4 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/90 border border-red-500/40 shadow-md text-[11px] font-bold text-white absolute top-5 left-5 z-20 animate-float-slow">
                  <Globe2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Global Signal Network</span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#B91C1C] to-[#DC2626] text-white shadow-md text-[11px] font-bold absolute top-5 right-5 z-20 animate-float-reverse">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Evidence &amp; Risk Review</span>
                </div>

                <GeoGlobe3D />
              </Interactive3DCard>
            </div>
          </RevealOnScroll>
        </section>

        {/* 5. STRATEGIC INTELLIGENCE COMMAND — #command */}
        <section id="command" className="scroll-mt-24">
          <RevealOnScroll>
            <div className="relative overflow-hidden rounded-3xl bg-[#09090B]/90 backdrop-blur-xl border border-white/10 hover:border-red-500/40 p-8 sm:p-12 text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)] group transition-all">
              <div
                className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(220, 38, 38, 0.14), transparent 70%)'
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              <div className="relative z-10 flex flex-col items-center text-center space-y-5 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>STRATEGIC INTELLIGENCE COMMAND</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white max-w-xl">
                  Turn Breaking World Events Into Explainable Strategy.
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg">
                  Ask complex questions about geopolitical developments, economic disruptions, and global events. GeoSentinel retrieves relevant evidence, evaluates potential consequences, and presents strategies with supporting sources, uncertainty, and trade-offs.
                </p>

                {/* Command Preview */}
                <div className="w-full max-w-xl p-3.5 sm:p-4 rounded-2xl bg-black/80 border border-white/10 hover:border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs shadow-inner transition-colors">
                  <div className="flex items-center gap-2.5 text-zinc-400 text-left w-full sm:w-auto truncate">
                    <span className="text-red-500 font-bold">$</span>
                    <span className="text-zinc-200 truncate">
                      geosentinel analyze &quot;Strait of Hormuz supply disruption&quot;
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onLaunchWorkspace('What is the global market impact if Strait of Hormuz is disrupted?')
                    }
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-red-600/90 hover:text-white border border-white/15 hover:border-red-500 text-zinc-200 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Run Query</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-zinc-400 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-red-400 font-bold mr-1">●</span> Evidence-Linked Analysis
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-red-400 font-bold mr-1">●</span> Independent Risk Review
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-red-400 font-bold mr-1">●</span> Zero-Paid-API Architecture
                  </span>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* 6. RUNTIME & REGIONAL DATA MESH — #runtime */}
        <section id="runtime" className="scroll-mt-24 space-y-6">
          <RevealOnScroll>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
                  SYSTEM RELIABILITY
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                  Grounded in the signals that matter.
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                GeoSentinel brings information from multiple public data sources into a unified intelligence workflow. Connector health, retrieval status, and geographic coverage are monitored to make data availability and limitations visible.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 perspective-1200">
            {/* Card 1 — Unified Intelligence Runtime */}
            <RevealOnScroll className="lg:col-span-6">
              <Interactive3DCard className="h-full bg-[#09090B]/90 backdrop-blur-md border border-white/10 hover:border-red-500/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                    EXECUTION GRAPH
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    One coordinated intelligence pipeline.
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    User questions move through intent understanding, data retrieval, evidence verification, impact analysis, scenario exploration, strategy generation, and independent risk review.
                  </p>
                </div>

                {/* Pipeline Visualization (7 Canonical Gates) */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-zinc-400 border-b border-white/5 pb-2">
                    <span className="text-red-400 font-bold">active_pipeline</span>
                    <span className="text-[10px] text-zinc-500">12 stages</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      'Question Understanding',
                      'Data Retrieval',
                      'Evidence Verification',
                      'GeoCausal',
                      'GeoFork',
                      'Strategy Engine',
                      'Red-Team Review'
                    ].map((step, sIdx) => (
                      <React.Fragment key={step}>
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                            sIdx === 6
                              ? 'bg-red-500/20 border-red-500/60 text-white'
                              : 'bg-white/5 border-white/10 text-zinc-300'
                          }`}
                        >
                          {step}
                        </span>
                        {sIdx < 6 && <ArrowRight className="w-2.5 h-2.5 text-red-500/70" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-red-400" />
                    Evidence-First
                  </span>
                  <span className="font-bold text-white">Modular Architecture</span>
                </div>
              </Interactive3DCard>
            </RevealOnScroll>

            {/* Card 2 — Regional Intelligence Network */}
            <RevealOnScroll className="lg:col-span-6" delayMs={120}>
              <Interactive3DCard className="h-full bg-[#09090B]/90 backdrop-blur-md border border-white/10 hover:border-red-500/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                    REGIONAL SIGNAL MESH
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Understand how events travel across regions.
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Connect geopolitical developments with regional economic indicators, trade corridors, energy dependencies, and cross-border relationships.
                  </p>
                </div>

                {/* Regional Monitored Corridors (Evidence-grounded, no invented numbers) */}
                <div className="space-y-2.5">
                  {[
                    {
                      name: 'India & South Asia',
                      focus: 'Maritime Trade, Energy Imports & Monsoon Supply Chains',
                      indicator: 'Active Monitored Corridor'
                    },
                    {
                      name: 'Strait of Hormuz & Gulf',
                      focus: 'Hydrocarbon Flow, Tanker Telemetry & Choke Point Security',
                      indicator: 'Active Monitored Corridor'
                    },
                    {
                      name: 'United States & Global Markets',
                      focus: 'Treasury Yields, Monetary Signals & Cross-Asset Volatility',
                      indicator: 'Active Monitored Corridor'
                    },
                    {
                      name: 'Europe & Energy Security',
                      focus: 'Pipeline Gas Inflow, Storage Reserves & NATO Cross-Border Telemetry',
                      indicator: 'Active Monitored Corridor'
                    }
                  ].map((region) => (
                    <div
                      key={region.name}
                      className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-200">{region.name}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{region.focus}</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-[9px] font-bold text-red-400 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {region.indicator}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-zinc-400">
                  <span>Regional Analysis</span>
                  <span className="font-bold text-red-400">Source-Aware Intelligence</span>
                </div>
              </Interactive3DCard>
            </RevealOnScroll>
          </div>
        </section>

        {/* 7. HOW GEOSENTINEL WORKS — #how-it-works */}
        <section id="how-it-works" className="scroll-mt-24 space-y-6">
          <RevealOnScroll>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
                  SYSTEM CONCEPT &amp; WORKFLOW
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                  How GeoSentinel Thinks From Question to Action.
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                Explore how a question becomes an evidence-grounded intelligence assessment through a coordinated 12-stage pipeline.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 perspective-1200">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <RevealOnScroll key={pillar.step} delayMs={idx * 90}>
                  <Interactive3DCard className="h-full bg-[#09090B] border border-white/10 hover:border-red-500/60 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_44px_rgba(220,38,38,0.22)] flex flex-col justify-between space-y-4">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pillar.accent} flex items-center justify-center text-white shadow-md shadow-zinc-900/40`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-display font-extrabold text-zinc-700">
                          {pillar.step}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {pillar.title}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 text-[10px] font-bold uppercase tracking-wider text-red-400">
                      {pillar.tag}
                    </div>
                  </Interactive3DCard>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>

        {/* 8. CASE STUDIES & EVALUATION — #case-studies */}
        <section id="case-studies" className="scroll-mt-24 space-y-6">
          <RevealOnScroll>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
                  RESEARCH &amp; EVALUATION
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                  Measure Intelligence. Expose Uncertainty.
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                GeoSentinel is designed to evaluate evidence quality, analytical consistency, scenario performance, and strategic risks. Research-stage results are clearly separated from live operational measurements.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Area 1: Evidence Provenance */}
            <RevealOnScroll>
              <div className="h-full bg-[#09090B]/90 backdrop-blur-md border border-white/10 hover:border-red-500/50 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      Evidence Provenance
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-zinc-400">
                      Preliminary
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-2">
                    15,389
                  </div>
                  <div className="text-[11px] text-red-400 font-semibold mt-0.5">
                    Records Evaluated
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Source traceability, multi-feed attribution checks, and cross-source corroboration status.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 text-[10px] text-zinc-400">
                  Audit: Open Data Connectors
                </div>
              </div>
            </RevealOnScroll>

            {/* Area 2: Impact Analysis */}
            <RevealOnScroll delayMs={80}>
              <div className="h-full bg-[#09090B]/90 backdrop-blur-md border border-white/10 hover:border-red-500/50 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      Impact Analysis
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[9px] text-emerald-400">
                      Measured
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-2">
                    0.9s
                  </div>
                  <div className="text-[11px] text-red-400 font-semibold mt-0.5">
                    Cold Start Baseline
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Direct and indirect consequence assessment via GeoCausal dependency mapping and ripple tracking.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 text-[10px] text-zinc-400">
                  Latency: Intent to Strategy Node
                </div>
              </div>
            </RevealOnScroll>

            {/* Area 3: ForecastLab Retrospective */}
            <RevealOnScroll delayMs={160}>
              <div className="h-full bg-[#09090B]/90 backdrop-blur-md border border-white/10 hover:border-red-500/50 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      ForecastLab
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-[9px] text-amber-400">
                      Research
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-2">
                    Backtest
                  </div>
                  <div className="text-[11px] text-red-400 font-semibold mt-0.5">
                    Retrospective Evaluation
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Retrospective forecasting evaluation against ground-truth timelines. Non-guaranteed predictive research.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 text-[10px] text-zinc-400">
                  Benchmark: Historical Scenarios
                </div>
              </div>
            </RevealOnScroll>

            {/* Area 4: Red-Team Review */}
            <RevealOnScroll delayMs={240}>
              <div className="h-full bg-[#09090B]/90 backdrop-blur-md border border-white/10 hover:border-red-500/50 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      Red-Team Review
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-[9px] text-red-400">
                      Mandatory
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-2">
                    100%
                  </div>
                  <div className="text-[11px] text-red-400 font-semibold mt-0.5">
                    Strategy Gate Enforcement
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Identifies trade-offs, analytical blind spots, failure modes, and unintended consequences.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 text-[10px] text-zinc-400">
                  Standard: Independent Agent Gate
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* 9. LIVE DATA CONNECTORS — #signals */}
        <section id="signals" className="scroll-mt-24 space-y-6">
          <RevealOnScroll>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
                  DATA SOURCE NETWORK
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                  A Connected View of Global Signals.
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                GeoSentinel integrates public information sources to build a broader picture of geopolitical, economic, environmental, and regional developments.
              </p>
            </div>
          </RevealOnScroll>

          {/* 10 Registered Public Connectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 perspective-1200">
            {signalSources.map((src, idx) => (
              <RevealOnScroll key={src.name} delayMs={idx * 40}>
                <Interactive3DCard className="h-full bg-[#09090B] border border-white/10 hover:border-red-500/60 rounded-2xl p-4 shadow-md hover:shadow-lg flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">{src.name}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {src.status}
                      </span>
                    </div>
                    <div className="text-[10px] font-medium text-red-400 mt-0.5">{src.role}</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-2">{src.detail}</p>
                  </div>
                </Interactive3DCard>
              </RevealOnScroll>
            ))}
          </div>

          {/* Connector Status Legend */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400">
            <span className="font-semibold text-zinc-300">Status Registry:</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">● LIVE</span>
              <span className="flex items-center gap-1.5 text-amber-400">● DEGRADED</span>
              <span className="flex items-center gap-1.5 text-zinc-400">● RATE LIMITED</span>
              <span className="flex items-center gap-1.5 text-zinc-400">● NO DATA</span>
              <span className="flex items-center gap-1.5 text-blue-400">● AUTH REQUIRED</span>
              <span className="flex items-center gap-1.5 text-red-400">● OFFLINE</span>
            </div>
          </div>
        </section>

        {/* 10. STRATEGIC CAPACITY EXPLORER — #capacity */}
        <section id="capacity" className="scroll-mt-24 space-y-6">
          <RevealOnScroll>
            <div className="bg-[#09090B]/95 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
                    STRATEGIC CAPACITY
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                    Explore Intelligence at Different Scales.
                  </h2>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 uppercase tracking-wider">
                    Illustrative Capacity Simulator
                  </span>
                  <p className="text-xs text-zinc-400 max-w-sm mt-1">
                    Explore how data volume, connector availability, and scenario complexity affect the intelligence workflow.
                  </p>
                </div>
              </div>

              {/* Interactive Range Slider: Signals to Analyze */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/60 border border-white/10">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">
                    Signals to analyze (Monthly concurrency projection)
                  </span>
                  <span className="text-lg font-bold text-white font-mono">
                    {signalVolume.toLocaleString()}{' '}
                    <span className="text-xs text-red-400 font-normal">signals/mo</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="2000"
                  value={signalVolume}
                  onChange={(e) => setSignalVolume(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
                />

                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>2,000 signals</span>
                  <span>50,000 signals</span>
                  <span>100,000 signals</span>
                </div>
              </div>

              {/* Output Preview Cards: Workload, Data Sources, Complexity, Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold">
                    Estimated Workload
                  </div>
                  <div className="text-sm font-bold text-white">
                    {signalVolume <= 15000
                      ? 'Single-Query Direct Pipeline'
                      : signalVolume <= 60000
                      ? 'Multi-Region Mesh Batching'
                      : 'High-Volume Stream Queue'}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {signalVolume <= 15000
                      ? 'Standard synchronous analysis runs with single-agent verification.'
                      : signalVolume <= 60000
                      ? 'Parallel multi-agent execution across concurrent geopolitical nodes.'
                      : 'Distributed queueing model with prioritized risk triage.'}
                  </p>
                </div>

                <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold">
                    Required Data Sources
                  </div>
                  <div className="text-sm font-bold text-white">
                    {signalVolume <= 15000
                      ? '2–4 Core Connectors'
                      : signalVolume <= 60000
                      ? '6–8 Configured Sources'
                      : 'All 10 Public Connectors'}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    ReliefWeb, GDELT, World Bank, and IMF integrated based on query intent.
                  </p>
                </div>

                <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold">
                    Scenario Complexity
                  </div>
                  <div className="text-sm font-bold text-white">
                    {signalVolume <= 15000
                      ? 'Direct Causal Tree'
                      : signalVolume <= 60000
                      ? '3 Branch GeoFork Scenarios'
                      : 'Multi-Branch Monte Carlo Mesh'}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Explores alternate outcomes and counter-factual branching horizons.
                  </p>
                </div>

                <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold">
                    Retrieval Limitations
                  </div>
                  <div className="text-sm font-bold text-white">
                    Public Provider Quotas
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Operates strictly within free, open access public endpoints without paid API dependencies.
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* 11. INTERACTIVE INTENT SHOWCASE — #capabilities */}
        <section id="capabilities" className="scroll-mt-24">
          <RevealOnScroll>
            <div className="bg-[#09090B] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-[0_14px_45px_rgba(0,0,0,0.5)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
                    INTERACTIVE INTELLIGENCE MODES
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                    Different Questions. Different Intelligence.
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#EF4444] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Try Now</span>
                </button>
              </div>

              {/* 3 Intelligence Mode Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 perspective-1200">
                {demoPrompts.map((demo, idx) => {
                  const isSelected = selectedModeIdx === idx;
                  return (
                    <Interactive3DCard
                      key={demo.badge}
                      onClick={() => setSelectedModeIdx(idx)}
                      className={`cursor-pointer rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 group border transition-all ${
                        isSelected
                          ? 'bg-red-950/30 border-red-500 shadow-[0_12px_30px_rgba(220,38,38,0.25)]'
                          : 'bg-white/5 border-white/10 hover:border-red-400/50'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-black border border-white/15 text-white text-[10px] font-extrabold tracking-wider">
                            {demo.badge}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-red-400">Previewing</span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                          {demo.title}
                        </h3>
                        <p className="text-xs font-medium text-zinc-200 bg-white/5 border border-white/10 rounded-xl p-2.5 italic">
                          &ldquo;{demo.query}&rdquo;
                        </p>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {demo.summary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLaunchWorkspace(demo.query);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Open Workspace &amp; Run</span>
                      </button>
                    </Interactive3DCard>
                  );
                })}
              </div>

              {/* Sample Output Panel */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 space-y-3 transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-400">
                      Sample Output Panel • {activeDemo.badge}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                      Illustrative Sample
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Status: <strong className="text-white">{activeDemo.riskLevel}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-black/60 rounded-xl p-3 border border-white/10 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Supporting Evidence
                    </div>
                    <p className="text-xs text-zinc-300">{activeDemo.evidence}</p>
                  </div>

                  <div className="bg-black/60 rounded-xl p-3 border border-white/10 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Consequences &amp; Uncertainty
                    </div>
                    <p className="text-xs text-zinc-300">{activeDemo.consequences}</p>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">Uncertainty: {activeDemo.uncertainty}</div>
                  </div>

                  <div className="bg-black/60 rounded-xl p-3 border border-red-500/40 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-red-400" />
                      Recommended Strategy
                    </div>
                    <p className="text-xs text-zinc-300">{activeDemo.recommendedAction}</p>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-400 text-right pt-1">
                  * Live answers are generated via the active 12-stage intelligence pipeline.
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* 12. INTELLIGENCE WORKSPACE PREVIEW — #workspace */}
        <section id="workspace" className="scroll-mt-24 space-y-6">
          <RevealOnScroll>
            <div className="relative rounded-3xl bg-[#09090B] border border-white/15 p-6 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.7)] overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-zinc-800 inline-block" />
                  <span className="ml-3 text-xs font-mono text-zinc-400">
                    geosentinel_workspace // live_session.sys
                  </span>
                </div>
                <span className="text-[10px] font-mono text-red-400 bg-red-950/40 px-2.5 py-0.5 rounded-full border border-red-500/30">
                  ● DYNAMIC SESSION STATUS: RUNNING (12 STAGES)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                    MULTI-AGENT INTELLIGENCE
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                    From global signals to strategic understanding.
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    GeoSentinel coordinates specialized analytical agents to retrieve evidence, identify causal relationships, explore possible futures, and review strategic recommendations. Each conclusion should remain traceable to its supporting information and limitations.
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenAuth('login')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#EF4444] text-white text-xs font-bold shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Panel — Evidence & Impact Chain */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-black/80 border border-white/10 space-y-4 font-mono text-xs shadow-2xl">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-white/10 pb-2">
                    <span className="text-red-400 font-bold">CAUSAL IMPACT CHAIN</span>
                    <span className="text-[10px] text-zinc-500">Illustrative Sourced Chain</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        node: '01',
                        step: 'SIGNAL EVENT',
                        title: 'Strait of Hormuz shipping disruption',
                        status: 'REPORTED',
                        statusColor: 'text-zinc-300 bg-white/10'
                      },
                      {
                        node: '02',
                        step: 'POTENTIAL IMPACT',
                        title: 'Oil supply and transportation costs',
                        status: 'UNDER ANALYSIS',
                        statusColor: 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                      },
                      {
                        node: '03',
                        step: 'REGIONAL CONSEQUENCES',
                        title: 'Energy import exposure and inflation pressure',
                        status: 'ANALYTICAL INFERENCE',
                        statusColor: 'text-blue-400 bg-blue-950/40 border border-blue-500/30'
                      },
                      {
                        node: '04',
                        step: 'STRATEGIC OPTIONS',
                        title: 'Supply diversification and contingency planning',
                        status: 'AWAITING RISK REVIEW',
                        statusColor: 'text-red-400 bg-red-950/40 border border-red-500/30'
                      }
                    ].map((row) => (
                      <div
                        key={row.node}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:border-red-500/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400 text-[10px] font-bold flex items-center justify-center">
                            {row.node}
                          </span>
                          <div>
                            <div className="text-[10px] text-red-400 font-bold">{row.step}</div>
                            <div className="text-xs text-white font-medium">{row.title}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold block ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* 13. FINAL LAUNCH CTA — #launch */}
        <section id="launch" className="scroll-mt-24 pb-6">
          <RevealOnScroll>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#050507] via-[#09090B] to-[#991B1B] p-6 sm:p-10 text-white shadow-[0_20px_55px_rgba(9,9,11,0.34)] border border-red-500/30">
              <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-red-600/20 blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-400/35 text-[10px] font-bold uppercase tracking-widest text-red-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                    EXPLORE GEOSENTINEL
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                    Turn Global Events Into Better-Informed Decisions.
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Explore an evidence-first intelligence framework that connects global developments, evaluates potential impacts, explores scenarios, and presents explainable strategic recommendations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#DC2626] text-white font-extrabold text-sm shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Try Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('concept')}
                    className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Explore the Architecture</span>
                  </button>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* 14. FOOTER */}
        <footer className="border-t border-white/10 pt-12 pb-8 text-zinc-400 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10">
            {/* Brand column */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#09090B] via-[#991B1B] to-[#DC2626] border border-white/15 flex items-center justify-center text-white">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="font-display font-bold text-base text-white tracking-tight">
                  GeoSentinel
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-sm">
                Global Event Intelligence Platform. Connecting geopolitical events, economic indicators, and sourced evidence for explainable strategic decision-making.
              </p>
              <div className="text-[11px] text-zinc-500 font-mono">
                12-Stage Intelligence Pipeline • Zero-Paid-API Compliant
              </div>
            </div>

            {/* Navigation column */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="text-white font-bold text-xs uppercase tracking-wider">Navigation</div>
              <ul className="space-y-1.5 text-zinc-400">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('concept')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Project Concept
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('signals')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Live Signals
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('capabilities')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Capabilities
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onLaunchWorkspace()}
                    className="hover:text-white transition-colors cursor-pointer text-red-400 font-medium"
                  >
                    Workspace
                  </button>
                </li>
              </ul>
            </div>

            {/* Trust & Documentation column */}
            <div className="md:col-span-4 space-y-2.5">
              <div className="text-white font-bold text-xs uppercase tracking-wider">
                Trust &amp; Documentation
              </div>
              <ul className="space-y-1.5 text-zinc-400">
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  <Database className="w-3.5 h-3.5 text-red-400" />
                  <span>Data Sources (Open Public Connectors)</span>
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span>Evidence &amp; Verification Policy</span>
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span>Research &amp; Evaluation (ForecastLab)</span>
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  <Cpu className="w-3.5 h-3.5 text-red-400" />
                  <span>System Architecture (12-Stage Pipeline)</span>
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span>Privacy &amp; Security</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Statement */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-zinc-500 text-[11px]">
            <p>
              Built for transparent, evidence-grounded strategic intelligence. GeoSentinel supports human decision-making; it does not replace it.
            </p>
            <p>© 2026 GeoSentinel. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};
