import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  BrainCircuit,
  Database,
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  CheckCircle2,
  Sparkles,
  Radio,
  ShieldCheck
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userName?: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState('Abhi');
  const [email, setEmail] = useState('analyst@geosentinel.ai');
  const [password, setPassword] = useState('Sentinel@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [completedAuth, setCompletedAuth] = useState<{
    mode: 'login' | 'register';
    displayName: string;
  } | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);
  onSuccessRef.current = onSuccess;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setCompletedAuth(null);
      setTilt({ rx: 0, ry: 0 });
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!completedAuth) return;
    const timer = window.setTimeout(() => {
      if (completedAuth.mode === 'register') {
        try {
          localStorage.setItem('geosentinel_user_name', completedAuth.displayName);
        } catch {
          // ignore storage failures
        }
        setCompletedAuth(null);
        setMode('login');
      } else {
        onSuccessRef.current(completedAuth.displayName);
        onCloseRef.current();
      }
    }, 1150);
    return () => window.clearTimeout(timer);
  }, [completedAuth]);

  if (!isOpen) return null;

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (completedAuth) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 3.5,
      ry: (px - 0.5) * 4.5
    });
  };

  const handleCardMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completedAuth) return;

    let displayName = 'Admin';
    if (mode === 'register' && fullName.trim()) {
      displayName = fullName.trim();
    } else {
      const rawPrefix = (email.split('@')[0] || 'Admin').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
      displayName = rawPrefix
        ? rawPrefix.split(/\s+/)[0].replace(/^[a-z]/, (c) => c.toUpperCase())
        : 'Admin';
    }

    setTilt({ rx: 0, ry: 0 });
    setCompletedAuth({ mode, displayName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#050507]/80 backdrop-blur-md animate-fadeIn overflow-y-auto perspective-1200">
      {/* Outer Card with 3D Tilt & Split Screen Layout */}
      <div
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        style={{
          transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
        }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl shadow-black/60 border border-red-500/30 bg-[#09090B] grid grid-cols-1 md:grid-cols-12 md:min-h-[560px] animate-modal-pop transition-transform duration-200 ease-out preserve-3d"
      >
        {/* Close button */}
        {!completedAuth && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-zinc-100 hover:bg-red-50 text-zinc-800 hover:text-[#DC2626] border border-zinc-300 flex items-center justify-center transition cursor-pointer"
            title="Return to Home"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* 3D Completion Overlay when Login or Register succeeds */}
        {completedAuth && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-br from-[#050507]/95 via-[#09090B]/95 to-[#18181B]/95 backdrop-blur-xl text-white p-6 text-center animate-fadeIn">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center perspective-1200 mb-5">
              {/* Expanding 3D Shockwave Rings */}
              <div className="absolute inset-2 rounded-full border-2 border-red-500/65 animate-shockwave" />
              <div
                className="absolute inset-2 rounded-full border border-white/45 animate-shockwave"
                style={{ animationDelay: '0.55s' }}
              />
              {/* 3D Gyroscope Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/60 animate-gyro-a pointer-events-none" />
              <div className="absolute inset-3 rounded-full border-2 border-white/40 animate-gyro-b pointer-events-none" />

              {/* 3D Springing Success Emblem */}
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-white flex items-center justify-center shadow-[0_20px_50px_rgba(220,38,38,0.55)] border-2 border-white/50 animate-check-3d">
                <CheckCircle2 className="w-11 h-11 stroke-[2.2]" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-[#DC2626] border border-red-500 flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="space-y-2 max-w-md animate-slide-reveal">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/45 text-red-300 text-[11px] font-extrabold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                {completedAuth.mode === 'login' ? 'Login Verified' : 'Account Registered'}
              </span>

              <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                {completedAuth.mode === 'login'
                  ? 'Login Completed!'
                  : 'Registration Completed!'}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300">
                {completedAuth.mode === 'login'
                  ? `Welcome back, ${completedAuth.displayName}. Preparing transition to your AI Chat page...`
                  : `Your account is ready, ${completedAuth.displayName}. Redirecting you to the Login page...`}
              </p>
            </div>
          </div>
        )}

        {/* Left Hero: Pitch Black & Crimson Atmospheric Panel + 3D Orbital Stage */}
        <div className="md:col-span-7 relative p-6 sm:p-10 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#050507] via-[#09090B] to-[#7F1D1D]">
          {/* Earth Background Image */}
          <img
            src="/earth_space_bg.jpg"
            alt="GeoSentinel Earth Background"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-20 mix-blend-luminosity select-none"
          />
          {/* Black & Crimson gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#09090B]/70 to-[#991B1B]/35" />

          {/* Ambient 3D Orbital Gyroscope Decoration */}
          <div className="pointer-events-none hidden sm:flex absolute -right-12 top-1/2 -translate-y-1/2 w-56 h-56 items-center justify-center perspective-1200 opacity-65">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/55 animate-gyro-a" />
            <div className="absolute inset-5 rounded-full border-2 border-white/35 animate-gyro-b" />
            <div className="w-16 h-16 rounded-2xl bg-zinc-950/90 border border-red-500/45 backdrop-blur-md flex items-center justify-center text-red-400 shadow-[0_0_25px_rgba(220,38,38,0.35)] animate-float-slow">
              <Radio className="w-7 h-7" />
            </div>
          </div>

          {/* Top Branding */}
          <div className="relative z-10 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#09090B] to-[#DC2626] border border-red-400/50 flex items-center justify-center text-white backdrop-blur-md shadow-[0_0_24px_rgba(220,38,38,0.45)] animate-float-slow">
                <Globe className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
                GeoSentinel
              </h1>
            </div>

            <p className="text-xs sm:text-base text-zinc-200 max-w-md font-normal leading-relaxed">
              Global Event Intelligence for a Safer, More Informed World
            </p>
          </div>

          {/* 4 Feature Bullet Points */}
          <div className="relative z-10 space-y-3 sm:space-y-4 my-6 sm:my-8">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-400/40 flex items-center justify-center text-red-400">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white">
                Real-time Global Data
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-400/40 flex items-center justify-center text-red-400">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white">
                AI-Powered Analysis
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-400/40 flex items-center justify-center text-red-400">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white">
                Evidence-Based Insights
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-400/40 flex items-center justify-center text-red-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white">
                Strategic Recommendations
              </span>
            </div>
          </div>

          {/* Bottom subtle compliance */}
          <div className="relative z-10 text-[11px] text-zinc-400">
            Explainable Multi-Agent AI Framework • Zero-Paid-API Compliant
          </div>
        </div>

        {/* Right Side: Crisp White Login / Register Card with 3D Mode Switch */}
        <div className="md:col-span-5 bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#FAFAFA] border border-zinc-200">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-[#09090B] to-[#DC2626] text-white shadow-sm'
                    : 'text-zinc-600 hover:text-[#09090B]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-[#09090B] to-[#DC2626] text-white shadow-sm'
                    : 'text-zinc-600 hover:text-[#09090B]'
                }`}
              >
                Register
              </button>
            </div>

            {/* 3D Flip Form Container */}
            <div key={mode} className="space-y-5 animate-auth-flip">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#09090B] tracking-tight">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  {mode === 'login'
                    ? 'Sign in to open your GeoSentinel Workspace'
                    : 'Register for real-time AI strategy & risk insights'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name (Register Mode Only) */}
                {mode === 'register' && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>Full Name</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="Enter your name"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAFAFA] border border-zinc-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] transition text-zinc-900"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Email</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-[#FAFAFA] border border-zinc-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] transition text-zinc-900"
                    />
                    <Mail className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-[#FAFAFA] border border-zinc-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] transition text-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword((prev) => !prev);
                      }}
                      className="absolute right-3.5 top-3 text-zinc-400 hover:text-[#DC2626] transition-colors cursor-pointer z-10 p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-[#DC2626]" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-[#DC2626] focus:ring-red-500"
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[#DC2626] hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>

                {/* Sign In / Register Button */}
                <button
                  type="submit"
                  className="group w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#09090B] via-[#B91C1C] to-[#DC2626] hover:from-[#18181B] hover:to-[#B91C1C] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-red-700/25 transition-all transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
                >
                  <span>{mode === 'login' ? 'Login to Workspace' : 'Create Account & Enter'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* OR Divider */}
                <div className="relative flex py-1.5 items-center">
                  <div className="flex-grow border-t border-zinc-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    OR
                  </span>
                  <div className="flex-grow border-t border-zinc-200"></div>
                </div>

                {/* Switch Auth Mode Link */}
                <div className="text-center text-xs text-zinc-500">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-[#DC2626] font-semibold hover:underline cursor-pointer"
                  >
                    {mode === 'login' ? 'Register' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
