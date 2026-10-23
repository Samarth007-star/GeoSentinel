import React, { useState } from 'react';
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
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('analyst@geosentinel.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Outer Card with Split Screen Layout matching Image 2 */}
      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-700/40 bg-[#060c18] grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          title="Return to Dashboard"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Hero: Earth from space with Glowing Atmospheric Rim & Features */}
        <div className="md:col-span-7 relative p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
          {/* Earth Background Image */}
          <img
            src="/earth_space_bg.jpg"
            alt="GeoSentinel Earth Background"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-85 select-none"
          />
          {/* Subtle dark vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060c18] via-transparent to-[#060c18]/40" />

          {/* Top Branding */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                <Globe className="w-7 h-7" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
                GeoSentinel
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-md font-normal leading-relaxed">
              Global Event Intelligence for a Safer, More Informed World
            </p>
          </div>

          {/* 4 Feature Bullet Points matching Image 2 */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                Real-time Global Data
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                AI-Powered Analysis
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                Evidence-Based Insights
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                Strategic Recommendations
              </span>
            </div>
          </div>

          {/* Bottom subtle compliance */}
          <div className="relative z-10 text-[11px] text-slate-400/80">
            Explainable Multi-Agent AI Framework • Zero-Paid-API Compliant
          </div>
        </div>

        {/* Right Side: Clean White Login Card matching Image 2 */}
        <div className="md:col-span-5 bg-white p-8 sm:p-10 flex flex-col justify-center">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sign in to continue to GeoSentinel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
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
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all transform active:scale-98"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* OR Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  OR
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Register Link */}
              <div className="text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => alert('Registration is managed by organization admin.')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
