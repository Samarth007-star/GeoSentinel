import React, { useEffect, useRef } from 'react';

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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Scroll tracking with smooth fluid momentum
    let scrollY = window.scrollY;
    let smoothScrollY = scrollY;
    let scrollVelocity = 0;
    let lastScrollY = scrollY;

    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', onMotionChange);

    // Liquid droplet particles that float along the serpentine current
    const DROPLETS_COUNT = 50;
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

    const startTime = performance.now();

    const draw = (now: number) => {
      // Smooth, natural medium time progression
      const t = (now - startTime) * 0.00028;

      // Responsive scroll tracking: silky smooth momentum easing
      const currentScroll = scrollY;
      const dScroll = currentScroll - lastScrollY;
      lastScrollY = currentScroll;
      scrollVelocity += (dScroll - scrollVelocity) * 0.04;
      smoothScrollY += (currentScroll - smoothScrollY) * 0.038;

      ctx.clearRect(0, 0, width, height);
      if (prefersReducedMotion) {
        animId = window.requestAnimationFrame(draw);
        return;
      }

      // Responsive screen scaling factors
      const isMobile = width < 768;
      const scaleFactor = Math.min(1.3, Math.max(0.65, width / 1280));

      // Accurate document scroll progress: 0.0 (top) -> 1.0 (bottom)
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollProgress = Math.min(1, Math.max(0, smoothScrollY / maxScroll));

      // Global screen sweep: navigates across the full screen from Right -> Left -> Right -> Center
      const sweepMagnitude = isMobile ? 0.20 : 0.26;
      const sweepFactor =
        Math.cos(scrollProgress * Math.PI * 2.6 - 0.55) * sweepMagnitude +
        Math.sin(scrollProgress * Math.PI * 1.8) * 0.08 -
        Math.sin(scrollProgress * Math.PI * 4.2) * 0.04;

      const baseCenterX = width * (0.50 + sweepFactor);

      // Gentle scroll surge without abrupt acceleration
      const waterSurge = 1 + Math.min(0.25, Math.max(-0.20, scrollVelocity * 0.0012));

      // Serpentine snake wavelength: broad, relaxed, graceful S-curves
      const snakeWavelength = Math.max(540, height * 0.65);
      const snakeK = (Math.PI * 2) / snakeWavelength;

      // Serene, medium-speed slithering motion propagation along the snake body
      const slitherSpeed = 0.85;
      const slitherPhase = t * slitherSpeed * waterSurge + (smoothScrollY * 0.00035);

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

      // 1. RENDER SERPENTINE SNAKE BODY RIBBONS
      const STEPS = 58;
      const stepY = (height * 1.35) / (STEPS - 1);
      const startY = -height * 0.18;

      for (let rIdx = 0; rIdx < SNAKE_RIBBONS.length; rIdx++) {
        const ribbon = SNAKE_RIBBONS[rIdx];
        const halfW = ribbon.baseWidth * 0.5 * scaleFactor;

        // Compute left and right serpentine contours
        const leftPoints: [number, number][] = [];
        const rightPoints: [number, number][] = [];

        for (let i = 0; i < STEPS; i++) {
          const y = startY + i * stepY;
          const cx = getRiverCenter(y, ribbon.speed, ribbon.phase, ribbon.ampFactor);

          // Muscular width pulsing along the snake's slithering length
          const muscularPulse = 1 + Math.sin(y * snakeK * 1.2 - slitherPhase * 1.1 + rIdx * 0.8) * 0.30;
          const w = halfW * muscularPulse;

          leftPoints.push([cx - w, y]);
          rightPoints.push([cx + w, y]);
        }

        // Draw snake ribbon polygon
        ctx.beginPath();
        ctx.moveTo(leftPoints[0][0], leftPoints[0][1]);
        for (let i = 1; i < leftPoints.length; i++) {
          const xc = (leftPoints[i - 1][0] + leftPoints[i][0]) * 0.5;
          const yc = (leftPoints[i - 1][1] + leftPoints[i][1]) * 0.5;
          ctx.quadraticCurveTo(leftPoints[i - 1][0], leftPoints[i - 1][1], xc, yc);
        }
        ctx.lineTo(leftPoints[leftPoints.length - 1][0], leftPoints[leftPoints.length - 1][1]);

        // Connect and go back up right flank
        ctx.lineTo(rightPoints[rightPoints.length - 1][0], rightPoints[rightPoints.length - 1][1]);
        for (let i = rightPoints.length - 2; i >= 0; i--) {
          const xc = (rightPoints[i + 1][0] + rightPoints[i][0]) * 0.5;
          const yc = (rightPoints[i + 1][1] + rightPoints[i][1]) * 0.5;
          ctx.quadraticCurveTo(rightPoints[i + 1][0], rightPoints[i + 1][1], xc, yc);
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
      for (let fIdx = 0; fIdx < FILAMENTS.length; fIdx++) {
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
        ctx.lineWidth = filament.lineWidth * (1 + Math.abs(scrollVelocity) * 0.015);
        ctx.stroke();
      }

      // 3. RENDER GLOWING PARTICLES ALONG THE SNAKE SPINE
      for (let i = 0; i < droplets.length; i++) {
        const drop = droplets[i];

        // Downward slither motion
        drop.yNorm = (drop.yNorm + drop.baseSpeed * waterSurge * 1.4) % 1;
        const y = drop.yNorm * height;

        // Position droplet along the snake's undulating spine
        const spineX = getRiverCenter(y, 1.0, 0, 1.0);
        const lateralJitter = Math.sin(y * snakeK * 2 + drop.phase + t * 2.0) * 14 * scaleFactor;
        const x = spineX + drop.lateralOffset * 85 * scaleFactor + lateralJitter;

        const pulse = 0.65 + 0.35 * Math.sin(t * 3.5 + drop.phase);
        const a = drop.alpha * pulse;
        const r = drop.radius * (1 + (waterSurge - 1) * 0.3);

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
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
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
