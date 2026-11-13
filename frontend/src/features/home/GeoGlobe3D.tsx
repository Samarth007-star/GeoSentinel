import React, { useEffect, useRef } from 'react';

interface GlobeNode {
  label: string;
  lat: number;
  lon: number;
  accent: string;
}

const GLOBE_NODES: GlobeNode[] = [
  { label: 'India Hub', lat: 21, lon: 78, accent: '#EF4444' },
  { label: 'Strait of Hormuz', lat: 26, lon: 56, accent: '#FFFFFF' },
  { label: 'US Markets', lat: 39, lon: -77, accent: '#DC2626' },
  { label: 'Europe Hub', lat: 50, lon: 10, accent: '#F87171' },
  { label: 'East Asia', lat: 35, lon: 139, accent: '#FFFFFF' },
  { label: 'Singapore Trade', lat: 1, lon: 104, accent: '#EF4444' }
];

const ARC_PAIRS: [number, number][] = [
  [0, 1],
  [0, 5],
  [1, 3],
  [2, 3],
  [0, 4],
  [5, 4]
];

function latLonToVec3(latDeg: number, lonDeg: number): [number, number, number] {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  return [
    cosLat * Math.sin(lon),
    Math.sin(lat),
    cosLat * Math.cos(lon)
  ];
}

function rotatePoint(
  p: [number, number, number],
  rotX: number,
  rotY: number
): [number, number, number] {
  const [x0, y0, z0] = p;
  // Rotate around Y axis
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = x0 * cosY + z0 * sinY;
  const z1 = -x0 * sinY + z0 * cosY;

  // Rotate around X axis
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = y0 * cosX - z1 * sinX;
  const z2 = y0 * sinX + z1 * cosX;

  return [x1, y2, z2];
}

function generateFibonacciSphere(count: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    pts.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius]);
  }
  return pts;
}

export const GeoGlobe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sphereDots = generateFibonacciSphere(260);
    const nodeVectors = GLOBE_NODES.map((n) => latLonToVec3(n.lat, n.lon));

    let width = container.clientWidth || 380;
    let height = container.clientHeight || 380;
    let rotY = 0.55;
    let rotX = 0.24;
    let velY = 0.0042;
    let velX = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let animId = 0;
    let tick = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(260, rect.width);
      height = Math.max(260, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      velY = dx * 0.007;
      velX = dy * 0.005;
      rotY += velY;
      rotX = Math.max(-0.85, Math.min(0.85, rotX + velX));
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore if already released
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    const project = (v: [number, number, number], cx: number, cy: number, radius: number) => {
      const fov = 3.2;
      const scale = fov / (fov - v[2]);
      return {
        x: cx + v[0] * radius * scale,
        y: cy - v[1] * radius * scale,
        z: v[2],
        scale
      };
    };

    const drawFrame = () => {
      tick += 0.02;
      if (!isDragging) {
        rotY += velY;
        rotX = rotX * 0.992 + 0.22 * 0.008;
        velY = velY * 0.96 + 0.0042 * 0.04;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.34;

      // Ambient crimson & white radial glow behind 3D sphere
      const aura = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius * 1.48);
      aura.addColorStop(0, 'rgba(220, 38, 38, 0.28)');
      aura.addColorStop(0.55, 'rgba(185, 28, 28, 0.12)');
      aura.addColorStop(1, 'rgba(9, 9, 11, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Deep pitch-black & crimson glass sphere core
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.32,
        cy - radius * 0.32,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, 'rgba(39, 39, 42, 0.92)');
      sphereGrad.addColorStop(0.62, 'rgba(9, 9, 11, 0.96)');
      sphereGrad.addColorStop(1, 'rgba(220, 38, 38, 0.25)');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // 3D Latitude wireframe rings
      for (const latDeg of [-50, -25, 0, 25, 50]) {
        ctx.beginPath();
        for (let step = 0; step <= 48; step++) {
          const lonDeg = (step / 48) * 360 - 180;
          const rotated = rotatePoint(latLonToVec3(latDeg, lonDeg), rotX, rotY);
          const p = project(rotated, cx, cy, radius);
          if (step === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = latDeg === 0 ? 'rgba(239, 68, 68, 0.42)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = latDeg === 0 ? 1.2 : 0.85;
        ctx.stroke();
      }

      // 3D Longitude meridians
      for (let lonDeg = 0; lonDeg < 180; lonDeg += 30) {
        ctx.beginPath();
        for (let step = 0; step <= 48; step++) {
          const latDeg = (step / 48) * 360 - 180;
          const rotated = rotatePoint(latLonToVec3(latDeg, lonDeg), rotX, rotY);
          const p = project(rotated, cx, cy, radius);
          if (step === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }

      // 3D Back & Front Fibonacci surface dots
      const projectedDots = sphereDots
        .map((pt) => project(rotatePoint(pt, rotX, rotY), cx, cy, radius))
        .sort((a, b) => a.z - b.z);

      for (const d of projectedDots) {
        const depth = (d.z + 1) * 0.5;
        const alpha = 0.16 + depth * 0.72;
        const dotSize = 1.0 + depth * 1.45;
        ctx.fillStyle = d.z > 0.25 ? `rgba(255, 255, 255, ${alpha})` : `rgba(239, 68, 68, ${alpha * 0.55})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tilted 3D Orbital Satellite Rings
      const orbits = [
        { tiltX: 0.48, tiltZ: -0.35, mult: 1.26, speed: 0.95, color: 'rgba(239, 68, 68, 0.52)' },
        { tiltX: -0.58, tiltZ: 0.42, mult: 1.38, speed: -0.7, color: 'rgba(255, 255, 255, 0.34)' }
      ];

      orbits.forEach((orb, idx) => {
        ctx.beginPath();
        const segs = 72;
        for (let s = 0; s <= segs; s++) {
          const a = (s / segs) * Math.PI * 2;
          const ox = Math.cos(a) * orb.mult;
          const oy = Math.sin(a) * orb.mult * Math.sin(orb.tiltX);
          const oz = Math.sin(a) * orb.mult * Math.cos(orb.tiltX);
          const rx = ox * Math.cos(orb.tiltZ) - oy * Math.sin(orb.tiltZ);
          const ry = ox * Math.sin(orb.tiltZ) + oy * Math.cos(orb.tiltZ);
          const p = project([rx, ry, oz], cx, cy, radius);
          if (s === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = 1.35;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated orbiting satellite data packet
        const satAngle = tick * orb.speed + idx * 2.1;
        const ox = Math.cos(satAngle) * orb.mult;
        const oy = Math.sin(satAngle) * orb.mult * Math.sin(orb.tiltX);
        const oz = Math.sin(satAngle) * orb.mult * Math.cos(orb.tiltX);
        const rx = ox * Math.cos(orb.tiltZ) - oy * Math.sin(orb.tiltZ);
        const ry = ox * Math.sin(orb.tiltZ) + oy * Math.cos(orb.tiltZ);
        const sp = project([rx, ry, oz], cx, cy, radius);

        ctx.fillStyle = '#09090B';
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 4.2 * sp.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Great-circle 3D Intelligence Connection Arcs
      ARC_PAIRS.forEach(([i, j], arcIdx) => {
        const a = nodeVectors[i];
        const b = nodeVectors[j];
        const ra = rotatePoint(a, rotX, rotY);
        const rb = rotatePoint(b, rotX, rotY);
        if (ra[2] < -0.25 && rb[2] < -0.25) return;

        ctx.beginPath();
        const steps = 26;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const mx = a[0] * (1 - t) + b[0] * t;
          const my = a[1] * (1 - t) + b[1] * t;
          const mz = a[2] * (1 - t) + b[2] * t;
          const len = Math.sqrt(mx * mx + my * my + mz * mz) || 1;
          const elev = 1 + Math.sin(t * Math.PI) * 0.22;
          const pt: [number, number, number] = [(mx / len) * elev, (my / len) * elev, (mz / len) * elev];
          const p = project(rotatePoint(pt, rotX, rotY), cx, cy, radius);
          if (s === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Moving signal pulse along arc
        const pulseT = (tick * 0.45 + arcIdx * 0.28) % 1;
        const pmx = a[0] * (1 - pulseT) + b[0] * pulseT;
        const pmy = a[1] * (1 - pulseT) + b[1] * pulseT;
        const pmz = a[2] * (1 - pulseT) + b[2] * pulseT;
        const plen = Math.sqrt(pmx * pmx + pmy * pmy + pmz * pmz) || 1;
        const pelev = 1 + Math.sin(pulseT * Math.PI) * 0.22;
        const pp = project(
          rotatePoint([(pmx / plen) * pelev, (pmy / plen) * pelev, (pmz / plen) * pelev], rotX, rotY),
          cx,
          cy,
          radius
        );
        if (pp.z > -0.2) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(pp.x, pp.y, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Named 3D Intelligence Nodes with depth labels
      nodeVectors.forEach((vec, idx) => {
        const node = GLOBE_NODES[idx];
        const p = project(rotatePoint(vec, rotX, rotY), cx, cy, radius);
        if (p.z < -0.15) return;

        const visAlpha = Math.min(1, (p.z + 0.2) * 1.15);
        const pulseR = 6 + Math.sin(tick * 2 + idx) * 3;

        ctx.strokeStyle = `rgba(239, 68, 68, ${0.55 * visAlpha})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = node.accent;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.8, 0, Math.PI * 2);
        ctx.fill();

        if (p.z > 0.22) {
          ctx.font = '600 10px "Times New Roman", Times, Georgia, serif';
          const textW = ctx.measureText(node.label).width;
          const bx = p.x + 8;
          const by = p.y - 10;

          ctx.fillStyle = `rgba(9, 9, 11, ${0.9 * visAlpha})`;
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.7 * visAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(bx, by, textW + 12, 18, 9);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = `rgba(255, 255, 255, ${visAlpha})`;
          ctx.fillText(node.label, bx + 6, by + 12.5);
        }
      });

      animId = requestAnimationFrame(drawFrame);
    };

    animId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] sm:h-[380px] lg:h-[430px] flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        aria-label="Interactive 3D GeoSentinel Global Intelligence Globe"
      />
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-zinc-950/90 border border-red-500/40 text-[10px] font-semibold text-white shadow-xs whitespace-nowrap">
        Drag to rotate 3D Globe • Live Intelligence Topology
      </div>
    </div>
  );
};

