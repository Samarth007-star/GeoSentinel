import React, { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';

interface WelcomeSplash3DProps {
  onComplete: () => void;
}

const BOOT_PHASES = [
  'INITIATING SHADER PASS...',
  'CALIBRATING 3D PARTICLE FIELD...',
  'SYNCING LIVE 2026 SIGNAL MESH...',
  'PRESENCE ENGINE ONLINE'
];

export const WelcomeSplash3D: React.FC<WelcomeSplash3DProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [exiting, setExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const start = performance.now();
    const totalMs = 2600;
    let rafId = 0;

    const tickProgress = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / totalMs);
      // Smooth ease-out curve for crisp 00% -> 100% telemetry
      const eased = 1 - Math.pow(1 - ratio, 2.2);
      const pct = Math.min(100, Math.round(eased * 100));
      setProgress(pct);

      if (pct < 28) setPhaseIdx(0);
      else if (pct < 62) setPhaseIdx(1);
      else if (pct < 92) setPhaseIdx(2);
      else setPhaseIdx(3);

      if (ratio < 1) {
        rafId = window.requestAnimationFrame(tickProgress);
      }
    };

    rafId = window.requestAnimationFrame(tickProgress);

    const tExit = window.setTimeout(() => setExiting(true), 2750);
    const tDone = window.setTimeout(() => onCompleteRef.current(), 3300);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(tExit);
      window.clearTimeout(tDone);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // High-speed diagonal warp streaks matching the 00:00 preloader aesthetic
    const streaks = Array.from({ length: 130 }, (_, i) => {
      const isCrimson = i % 5 === 0;
      const isSoftRed = i % 9 === 0;
      return {
        x: Math.random() * window.innerWidth * 1.4 - window.innerWidth * 0.2,
        y: Math.random() * window.innerHeight * 1.4 - window.innerHeight * 0.2,
        len: 28 + Math.random() * 95,
        speed: 7 + Math.random() * 14,
        width: 0.6 + Math.random() * 1.3,
        alpha: 0.15 + Math.random() * 0.65,
        color: isCrimson
          ? 'rgba(239, 68, 68,'
          : isSoftRed
          ? 'rgba(220, 38, 38,'
          : 'rgba(255, 255, 255,'
      };
    });

    // Subtle coalescing 3D ring dots in center
    const ringDots = Array.from({ length: 180 }, (_, i) => ({
      angle: (i / 180) * Math.PI * 2,
      radiusOffset: (Math.random() - 0.5) * 18,
      speed: 0.008 + Math.random() * 0.006,
      size: 0.9 + Math.random() * 1.4,
      isRed: i % 3 === 0
    }));

    const startTime = performance.now();

    const draw = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const elapsed = (now - startTime) / 1000;
      const ramp = Math.min(1, elapsed / 2.2);

      // Slight motion trail fill for sleek streak persistence
      ctx.fillStyle = 'rgba(5, 5, 7, 0.36)';
      ctx.fillRect(0, 0, w, h);

      // Diagonal angle (~ -65 deg, matching fast downward-left rain/warp streaks)
      const vx = -0.34;
      const vy = 0.94;

      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        s.x += vx * s.speed * (1 + ramp * 0.6);
        s.y += vy * s.speed * (1 + ramp * 0.6);

        if (s.y > h + 140 || s.x < -140) {
          if (Math.random() > 0.35) {
            s.x = Math.random() * (w + 260);
            s.y = -80 - Math.random() * 120;
          } else {
            s.x = w + 60 + Math.random() * 120;
            s.y = Math.random() * h * 0.7;
          }
        }

        const x2 = s.x - vx * s.len;
        const y2 = s.y - vy * s.len;

        const grad = ctx.createLinearGradient(s.x, s.y, x2, y2);
        grad.addColorStop(0, `${s.color} ${s.alpha})`);
        grad.addColorStop(0.6, `${s.color} ${s.alpha * 0.35})`);
        grad.addColorStop(1, `${s.color} 0)`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Coalescing 3D torus-ring preview in the center as loading completes
      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * (0.19 - ramp * 0.03);
      for (let i = 0; i < ringDots.length; i++) {
        const d = ringDots[i];
        d.angle += d.speed;
        const wave = Math.sin(d.angle * 5 + elapsed * 2.5) * 10;
        const r = baseR + d.radiusOffset + wave;
        const px = cx + Math.cos(d.angle) * r;
        const py = cy + Math.sin(d.angle) * r * 0.72;
        const alpha = (0.08 + ramp * 0.48) * (0.6 + 0.4 * Math.sin(d.angle + elapsed));

        ctx.beginPath();
        ctx.arc(px, py, d.size, 0, Math.PI * 2);
        ctx.fillStyle = d.isRed
          ? `rgba(239, 68, 68, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      animId = window.requestAnimationFrame(draw);
    };

    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    animId = window.requestAnimationFrame(draw);

    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const paddedPct = String(progress).padStart(2, '0');

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col justify-between bg-[#050507] text-white overflow-hidden select-none transition-all duration-700 ease-out ${
        exiting ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Crimson Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.14) 0%, rgba(5, 5, 7, 0.85) 58%, #050507 100%)'
        }}
      />

      {/* Warp-Streak Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top-Left Minimal System HUD */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#09090B] via-[#B91C1C] to-[#EF4444] border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.45)]">
            <Globe className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-[0.22em] uppercase text-white">
            GEOSENTINEL
          </span>
          <span className="hidden sm:inline-block text-[11px] tracking-[0.2em] uppercase text-zinc-400 pl-2 border-l border-white/15">
            V—ORB / SYS.04
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setExiting(true);
            window.setTimeout(() => onCompleteRef.current(), 350);
          }}
          className="text-[11px] tracking-[0.2em] uppercase text-zinc-400 hover:text-white border border-white/15 hover:border-red-500/60 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Center Minimal Brand Crest */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-red-500/35 text-[10px] tracking-[0.26em] uppercase text-red-400 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>3D Motion Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Geo<span className="text-red-500">Sentinel</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 tracking-wide max-w-md">
          Global Event Intelligence in Living Motion
        </p>
      </div>

      {/* Bottom Telemetry Bar (00% -> 100%) */}
      <div className="relative z-10 px-6 sm:px-10 pb-6 sm:pb-8">
        <div className="h-[1px] w-full bg-white/10 mb-4 overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-white via-red-500 to-red-600 transition-[width] duration-75 ease-out"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] tracking-[0.22em] uppercase">
          <span className="text-zinc-400">{BOOT_PHASES[phaseIdx]}</span>
          <span className="font-bold text-white tabular-nums">
            <span className="text-red-500">{paddedPct}</span>%
          </span>
        </div>
      </div>
    </div>
  );
};
