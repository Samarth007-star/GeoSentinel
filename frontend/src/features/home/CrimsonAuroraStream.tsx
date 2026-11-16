import React, { useEffect, useRef } from 'react';
import { detectGraphicsTier, getTierConfig } from '../../utils/graphicsTier';

interface CrimsonAuroraStreamProps {
  className?: string;
}

export const CrimsonAuroraStream: React.FC<CrimsonAuroraStreamProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const tier = detectGraphicsTier();
    const tierConfig = getTierConfig(tier);
    let isMobile = window.innerWidth < 768;
    const dpr = tierConfig.dpr;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      isMobile = width < 768;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', onMotionChange);

    const handleVisibility = () => {
      if (document.hidden) {
        if (animId) {
          window.cancelAnimationFrame(animId);
          animId = 0;
        }
      } else if (!animId) {
        lastFrameTime = performance.now();
        animId = window.requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Liquid droplet particles that float along the serpentine current
    const DROPLETS_COUNT = Math.min(50, tierConfig.dropletCount);
    const droplets = Array.from({ length: DROPLETS_COUNT }, (_, i) => ({
      yNorm: Math.random(),
      lateralOffset: (Math.random() - 0.5) * 0.8,
      baseSpeed: 0.00035 + Math.random() * 0.0005,
      radius: 0.8 + Math.random() * 1.6,
      alpha: 0.18 + Math.random() * 0.35,
      isHighlight: i % 3 === 0,
      phase: Math.random() * Math.PI * 2
    }));

    // 4 Layered Volumetric Ribbons forming the serpentine snake body (fluid silk S-curves, refined translucency)
    const SNAKE_RIBBONS = [
      {
        baseWidth: 165,
        speed: 1.0,
        phase: 0,
        ampFactor: 1.0,
        gradStart: 'rgba(220, 38, 38, 0.12)',
        gradMid: 'rgba(239, 68, 68, 0.24)',
        gradEnd: 'rgba(153, 27, 27, 0.02)'
      },
      {
        baseWidth: 120,
        speed: 1.06,
        phase: 0.35,
        ampFactor: 1.05,
        gradStart: 'rgba(248, 113, 113, 0.15)',
        gradMid: 'rgba(220, 38, 38, 0.28)',
        gradEnd: 'rgba(185, 28, 28, 0.03)'
      },
      {
        baseWidth: 75,
        speed: 1.12,
        phase: 0.7,
        ampFactor: 0.96,
        gradStart: 'rgba(255, 255, 255, 0.20)',
        gradMid: 'rgba(239, 68, 68, 0.32)',
        gradEnd: 'rgba(220, 38, 38, 0.04)'
      },
      {
        baseWidth: 195,
        speed: 0.94,
        phase: -0.4,
        ampFactor: 1.10,
        gradStart: 'rgba(185, 28, 28, 0.10)',
        gradMid: 'rgba(153, 27, 27, 0.18)',
        gradEnd: 'rgba(9, 9, 11, 0.01)'
      }
    ];

    // Surface dorsal filaments highlighting the snake spine
    const FILAMENTS = [
      { offset: 0, speed: 1.0, phase: 0, stroke: 'rgba(255, 255, 255, 0.35)', lineWidth: 1.2 },
      { offset: -0.35, speed: 1.04, phase: 0.15, stroke: 'rgba(255, 210, 210, 0.26)', lineWidth: 1.0 },
      { offset: 0.35, speed: 0.96, phase: -0.15, stroke: 'rgba(239, 68, 68, 0.28)', lineWidth: 1.0 },
      { offset: -0.18, speed: 1.08, phase: 0.4, stroke: 'rgba(255, 255, 255, 0.22)', lineWidth: 0.8 },
      { offset: 0.18, speed: 1.02, phase: -0.3, stroke: 'rgba(248, 113, 113, 0.24)', lineWidth: 0.8 }
    ];

    const MAX_STEPS = 56;
    const leftPtsX = new Float32Array(MAX_STEPS);
    const leftPtsY = new Float32Array(MAX_STEPS);
    const rightPtsX = new Float32Array(MAX_STEPS);
    const rightPtsY = new Float32Array(MAX_STEPS);

    const startTime = performance.now();
    let lastFrameTime = 0;

    const draw = (now: number) => {
      if (document.hidden) {
        animId = 0;
        return;
      }
      // Adaptive frame rate limiter
      const minInterval = 1000 / tierConfig.targetFps - 2;
      if (now - lastFrameTime < minInterval) {
        animId = window.requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = now;

      // Smooth, natural medium time progression
      const t = (now - startTime) * 0.00028;

      ctx.clearRect(0, 0, width, height);
      if (prefersReducedMotion) {
        animId = window.requestAnimationFrame(draw);
        return;
      }

      // Responsive screen scaling factors
      isMobile = width < 768;
      const scaleFactor = Math.min(1.3, Math.max(0.65, width / 1280));

      // Automatic graceful screen sweep: cycles smoothly in an arranged sequence, independent of scroll
      const sweepMagnitude = isMobile ? 0.16 : 0.22;
      const sweepFactor =
        Math.sin(t * 0.65) * sweepMagnitude +
        Math.cos(t * 0.32) * (sweepMagnitude * 0.45);

      const baseCenterX = width * (0.50 + sweepFactor);

      // Serpentine snake wavelength: broad, relaxed, graceful S-curves
      const snakeWavelength = Math.max(540, height * 0.65);
      const snakeK = (Math.PI * 2) / snakeWavelength;

      // Serene, automatic slithering motion propagation along the stream
      const slitherSpeed = 0.85;
      const slitherPhase = t * slitherSpeed;

      // Snake lateral undulating amplitude across the screen
      const snakeAmp = (isMobile ? width * 0.20 : width * 0.18) * scaleFactor;

      // Calculate the centerline of the slithering snake at vertical coordinate Y
      const getRiverCenter = (
        y: number,
        strandSpeed: number,
        phaseOffset: number,
        ampFactor: number
      ) => {
        const waveY = y * snakeK - slitherPhase * strandSpeed + phaseOffset;

        // Primary serpentine S-curve slither
        const primarySnake = Math.sin(waveY);

        // Secondary muscular spine inflection (gentle, organic flex)
        const spineFlex = Math.cos(waveY * 1.5 - t * 0.5) * 0.22;

        // Subtle micro ripple
        const microRipple = Math.sin(waveY * 2.2 + t * 0.8) * 0.06;

        const lateralOffset = (primarySnake + spineFlex + microRipple) * (snakeAmp * ampFactor);

        return baseCenterX + lateralOffset;
      };

      ctx.globalCompositeOperation = 'lighter';

      // 1. RENDER SERPENTINE SNAKE BODY RIBBONS (Adaptive complexity for mobile vs desktop)
      const STEPS = Math.min(MAX_STEPS, isMobile ? 20 : 44);
      const stepY = (height * 1.35) / (STEPS - 1);
      const startY = -height * 0.18;

      const ribbonCount = Math.min(SNAKE_RIBBONS.length, isMobile ? 2 : tierConfig.ribbonLayers);

      for (let rIdx = 0; rIdx < ribbonCount; rIdx++) {
        const ribbon = SNAKE_RIBBONS[rIdx];
        const halfW = ribbon.baseWidth * 0.5 * scaleFactor;

        for (let i = 0; i < STEPS; i++) {
          const y = startY + i * stepY;
          const cx = getRiverCenter(y, ribbon.speed, ribbon.phase, ribbon.ampFactor);

          // Muscular width pulsing along the snake's slithering length
          const muscularPulse = 1 + Math.sin(y * snakeK * 1.2 - slitherPhase * 1.1 + rIdx * 0.8) * 0.30;
          const w = halfW * muscularPulse;

          leftPtsX[i] = cx - w;
          leftPtsY[i] = y;
          rightPtsX[i] = cx + w;
          rightPtsY[i] = y;
        }

        // Draw snake ribbon polygon
        ctx.beginPath();
        ctx.moveTo(leftPtsX[0], leftPtsY[0]);
        for (let i = 1; i < STEPS; i++) {
          const xc = (leftPtsX[i - 1] + leftPtsX[i]) * 0.5;
          const yc = (leftPtsY[i - 1] + leftPtsY[i]) * 0.5;
          ctx.quadraticCurveTo(leftPtsX[i - 1], leftPtsY[i - 1], xc, yc);
        }
        ctx.lineTo(leftPtsX[STEPS - 1], leftPtsY[STEPS - 1]);

        // Connect and go back up right flank
        ctx.lineTo(rightPtsX[STEPS - 1], rightPtsY[STEPS - 1]);
        for (let i = STEPS - 2; i >= 0; i--) {
          const xc = (rightPtsX[i + 1] + rightPtsX[i]) * 0.5;
          const yc = (rightPtsY[i + 1] + rightPtsY[i]) * 0.5;
          ctx.quadraticCurveTo(rightPtsX[i + 1], rightPtsY[i + 1], xc, yc);
        }
        ctx.closePath();

        // Fluid linear gradient tracking baseCenterX across the screen
        const grad = ctx.createLinearGradient(
          baseCenterX - halfW * 2.2,
          0,
          baseCenterX + halfW * 2.2,
          height
        );
        grad.addColorStop(0, ribbon.gradStart);
        grad.addColorStop(0.5, ribbon.gradMid);
        grad.addColorStop(1, ribbon.gradEnd);

        ctx.fillStyle = grad;
        ctx.fill();
      }

      // 2. RENDER DORSAL SPINE & CAUSTIC FILAMENTS
      const filamentCount = isMobile ? 2 : Math.min(FILAMENTS.length, tierConfig.ribbonLayers + 1);
      for (let fIdx = 0; fIdx < filamentCount; fIdx++) {
        const filament = FILAMENTS[fIdx];
        ctx.beginPath();

        for (let i = 0; i < STEPS; i++) {
          const y = startY + i * stepY;
          const cx = getRiverCenter(y, filament.speed, filament.phase, 1.0);
          const flankOffset = filament.offset * 70 * scaleFactor;
          const x = cx + flankOffset;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = filament.stroke;
        ctx.lineWidth = filament.lineWidth;
        ctx.stroke();
      }

      // 3. RENDER GLOWING PARTICLES ALONG THE SNAKE SPINE
      const activeDropletsCount = isMobile ? 16 : droplets.length;
      for (let i = 0; i < activeDropletsCount; i++) {
        const drop = droplets[i];

        // Downward slither motion
        drop.yNorm = (drop.yNorm + drop.baseSpeed * 1.4) % 1;
        const y = drop.yNorm * height;

        // Position droplet along the snake's undulating spine
        const spineX = getRiverCenter(y, 1.0, 0, 1.0);
        const lateralJitter = Math.sin(y * snakeK * 2 + drop.phase + t * 2.0) * 14 * scaleFactor;
        const x = spineX + drop.lateralOffset * 85 * scaleFactor + lateralJitter;

        const pulse = 0.65 + 0.35 * Math.sin(t * 3.5 + drop.phase);
        const a = drop.alpha * pulse;
        const r = drop.radius;

        if (drop.isHighlight) {
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(239, 68, 68, ${a * 0.5})`;
          ctx.beginPath();
          ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(239, 68, 68, ${a * 0.8})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      animId = window.requestAnimationFrame(draw);
    };

    animId = window.requestAnimationFrame(draw);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};
