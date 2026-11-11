import React, { useState, useEffect } from 'react';
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
  X
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
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let displayName = 'Admin';
    if (mode === 'register' && fullName.trim()) {
      displayName = fullName.trim();
    } else {
      const rawPrefix = (email.split('@')[0] || 'Admin').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
      displayName = rawPrefix
        ? rawPrefix.split(/\s+/)[0].replace(/^[a-z]/, (c) => c.toUpperCase())
        : 'Admin';
    }
    onSuccess(displayName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E1B4B]/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Outer Card with Split Screen Layout */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl shadow-purple-950/30 border border-purple-200/40 bg-[#2E1065] grid grid-cols-1 md:grid-cols-12 md:min-h-[560px]">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-950 border border-purple-200 flex items-center justify-center transition cursor-pointer"
          title="Return to Dashboard"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Hero: Royal Purple Executive Atmospheric Panel */}
        <div className="md:col-span-7 relative p-6 sm:p-10 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2E1065] via-[#4C1D95] to-[#6D28D9]">
          {/* Earth Background Image */}
          <img
            src="/earth_space_bg.jpg"
            alt="GeoSentinel Earth Background"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-luminosity select-none"
          />
          {/* Royal purple gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E1065] via-[#4C1D95]/65 to-[#2E1065]/45" />

          {/* Top Branding */}
          <div className="relative z-10 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-purple-300/40 flex items-center justify-center text-white backdrop-blur-md shadow-[0_0_24px_rgba(124,58,237,0.5)]">
                <Globe className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
                GeoSentinel
              </h1>
            </div>

            <p className="text-xs sm:text-base text-purple-100/90 max-w-md font-normal leading-relaxed">
              Global Event Intelligence for a Safer, More Informed World
            </p>
          </div>

          {/* 4 Feature Bullet Points */}
          <div className="relative z-10 space-y-3 sm:space-y-4 my-6 sm:my-8">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-purple-400/20 border border-purple-300/40 flex items-center justify-center text-purple-200">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-purple-50">
                Real-time Global Data
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-purple-400/20 border border-purple-300/40 flex items-center justify-center text-purple-200">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-purple-50">
                AI-Powered Analysis
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-purple-400/20 border border-purple-300/40 flex items-center justify-center text-purple-200">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-purple-50">
                Evidence-Based Insights
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-purple-400/20 border border-purple-300/40 flex items-center justify-center text-purple-200">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-purple-50">
                Strategic Recommendations
              </span>
            </div>
          </div>

          {/* Bottom subtle compliance */}
          <div className="relative z-10 text-[11px] text-purple-200/80">
            Explainable Multi-Agent AI Framework • Zero-Paid-API Compliant
          </div>
        </div>

        {/* Right Side: Clean White Login / Register Card */}
        <div className="md:col-span-5 bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#FAF8FF] border border-purple-100">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#2E1065]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#2E1065]'
                }`}
              >
                Register
              </button>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#2E1065] tracking-tight">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Sign in to open your GeoSentinel Workspace'
                  : 'Register for real-time AI strategy & risk insights'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name (Register Mode Only) */}
              {mode === 'register' && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-[#2E1065] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>Full Name</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Enter your name"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8FF] border border-purple-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#2E1065] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-[#FAF8FF] border border-purple-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition text-slate-800"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#2E1065] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-[#FAF8FF] border border-purple-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-purple-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-purple-300 text-purple-700 focus:ring-purple-500"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-purple-700 hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Sign In / Register Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-700/25 transition-all transform active:scale-98 cursor-pointer"
              >
                <span>{mode === 'login' ? 'Login to Workspace' : 'Create Account & Enter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* OR Divider */}
              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-purple-100"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                  OR
                </span>
                <div className="flex-grow border-t border-purple-100"></div>
              </div>

              {/* Switch Auth Mode Link */}
              <div className="text-center text-xs text-slate-500">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-purple-700 font-semibold hover:underline cursor-pointer"
                >
                  {mode === 'login' ? 'Register' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
