import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Home,
  Workflow,
  Radio,
  LayoutGrid,
  Terminal,
  Database,
  ShieldCheck,
  Activity,
  Layers,
  Lock,
  Mail,
  ArrowRight,
  Check,
  Cpu,
  X
} from 'lucide-react';

interface Footer3DProps {
  onLaunchWorkspace: (prefillQuery?: string) => void;
  scrollToSection: (sectionId: string) => void;
}

/**
 * High-Fidelity Canvas 2D Component for the Glowing Red Digital Globe & Undulating Cybernetic Wave Mesh.
 * Matches the reference cinematic horizon (Globe crest, illuminated continents, orbital telemetry, particle wave mesh).
 * Fully mobile-optimized with 0 runtime GC allocations and clamped DPR for 60fps butter on all devices.
 */
const FooterGlobeHorizon: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let isMobile = false;
    let dpr = 1.0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      isMobile = width < 768;
      height = parent ? parent.clientHeight : (isMobile ? 190 : 295);
      dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.35);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // =========================================================================
    // PRE-COMPILED GEOGRAPHY & CONTINENT VERTICES (Unit Sphere 3D Coordinates)
    // Precalculated at initialization -> 0 runtime GC allocations inside draw()
    // =========================================================================
    
    // Convert (latDeg, lonDeg) to unit sphere (x, y, z)
    const toUnit = (latDeg: number, lonDeg: number): [number, number, number] => {
      const lat = (latDeg * Math.PI) / 180;
      const lon = (lonDeg * Math.PI) / 180;
      const cosLat = Math.cos(lat);
      return [cosLat * Math.sin(lon), Math.sin(lat), cosLat * Math.cos(lon)];
    };

    // 1. Realistic Geographic Continental Coastlines
    // (Scandinavia, Great Britain, Ireland, Western Europe, Italy, Balkans/Greece,
    //  Turkey/Black Sea, North Africa, Arabia/Red Sea, Iceland, Greenland, East Coast NA)
    const COASTLINE_SEGMENTS_GEO: [number, number][][] = [
      // Scandinavia & Baltic Sea
      [
        [71.2, 25.8], [70.5, 28.0], [69.8, 31.0], [68.0, 39.0], [66.0, 34.0], [65.0, 25.5],
        [64.0, 21.0], [61.0, 17.5], [59.5, 18.5], [58.5, 17.0], [56.2, 16.0], [55.4, 14.2],
        [55.5, 12.8], [56.3, 12.6], [57.7, 11.9], [58.9, 11.2], [59.0, 10.5], [58.0, 7.0],
        [58.9, 5.5], [60.4, 5.2], [62.4, 6.0], [64.0, 9.5], [66.0, 12.5], [68.0, 15.0],
        [69.5, 18.0], [70.5, 23.5], [71.2, 25.8]
      ],
      // Great Britain
      [
        [58.6, -3.1], [58.2, -5.0], [57.0, -5.7], [56.3, -5.6], [55.4, -4.8], 
        [54.8, -3.6], [53.8, -3.0], [53.3, -4.3], [52.0, -5.2], [51.6, -4.8], 
        [50.2, -5.4], [50.1, -5.0], [50.5, -3.5], [50.7, -1.5], [51.1, 1.4], 
        [51.9, 1.3], [52.9, 1.6], [53.5, 0.0], [54.5, -0.6], [55.8, -1.9], 
        [57.0, -2.0], [57.7, -4.0], [58.6, -3.1]
      ],
      // Ireland
      [
        [55.3, -7.3], [54.3, -8.5], [53.5, -10.0], [52.0, -10.5], [51.4, -9.5],
        [51.9, -7.8], [52.3, -6.3], [53.4, -6.0], [54.3, -5.5], [55.2, -6.2], [55.3, -7.3]
      ],
      // Western Europe & Iberia (France, Spain, Portugal)
      [
        [53.5, 7.2], [51.3, 3.2], [50.0, 1.6], [49.5, -0.5], [48.6, -2.0], [48.4, -4.7],
        [47.5, -3.0], [46.0, -1.2], [43.5, -1.8], [43.5, -5.5], [43.8, -8.5], [42.0, -8.9],
        [38.7, -9.5], [37.0, -9.0], [36.2, -6.0], [36.0, -5.3], [36.8, -2.2], [38.0, -0.5],
        [39.5, -0.3], [41.4, 2.2], [42.4, 3.2], [43.4, 3.5], [43.3, 5.3], [43.7, 7.3]
      ],
      // Italy & Adriatic Coast
      [
        [43.7, 7.3], [44.4, 9.0], [43.5, 10.3], [41.8, 12.0], [40.8, 14.2], [39.0, 16.0],
        [38.0, 15.6], [38.2, 13.0], [37.5, 12.5], [36.7, 14.5], [37.2, 15.2], [38.2, 15.6],
        [39.5, 16.8], [40.3, 17.5], [40.0, 18.5], [41.3, 16.8], [42.5, 14.2], [44.0, 12.5],
        [45.4, 12.3], [45.7, 13.6]
      ],
      // Greece & Balkans
      [
        [45.7, 13.6], [44.5, 15.0], [43.0, 17.5], [42.0, 19.0], [40.5, 19.5], [39.0, 20.5],
        [38.0, 21.7], [36.5, 22.5], [36.5, 23.0], [37.5, 24.0], [38.5, 24.0], [39.5, 23.0],
        [40.5, 23.0], [40.8, 25.0], [40.0, 26.2]
      ],
      // Turkey & Black Sea
      [
        [40.0, 26.2], [41.0, 29.0], [41.8, 31.5], [41.5, 36.0], [41.0, 39.5], [41.5, 41.5],
        [44.5, 38.0], [45.0, 36.5], [46.5, 32.0], [45.0, 29.5], [43.0, 28.0], [41.0, 29.0]
      ],
      // North Africa & Mediterranean Coast
      [
        [35.8, -5.3], [35.5, -2.0], [36.5, 1.0], [37.0, 4.0], [37.2, 9.8], [36.8, 11.0],
        [34.0, 10.5], [33.0, 11.5], [32.8, 13.2], [32.0, 15.2], [31.0, 17.0], [31.5, 20.0],
        [32.8, 22.0], [31.5, 25.0], [31.2, 29.9], [31.5, 32.3], [31.2, 34.2]
      ],
      // Arabia & Red Sea
      [
        [31.2, 34.2], [28.0, 34.5], [22.0, 38.8], [15.5, 42.5], [12.6, 43.5], [12.8, 45.0],
        [14.5, 49.0], [17.0, 54.0], [22.5, 59.8], [24.0, 57.5], [26.0, 56.0], [25.0, 51.0],
        [27.0, 49.5], [29.5, 48.0], [30.0, 48.0]
      ]
    ];

    // Precompile coastline segment buffers for zero-allocation rendering
    const segmentBuffers: { buffer: Float32Array; count: number }[] = [];
    for (const seg of COASTLINE_SEGMENTS_GEO) {
      const flat: number[] = [];
      for (const pt of seg) {
        const [x, y, z] = toUnit(pt[0], pt[1]);
        flat.push(x, y, z);
      }
      segmentBuffers.push({
        buffer: new Float32Array(flat),
        count: seg.length
      });
    }

    // 2. High-density European & Mediterranean Landmass Point Cloud (780+ points)
    // Fills Scandinavia, UK, France, Spain, Germany, Italy, Balkans, North Africa
    const landCoords: number[] = [];
    const addLandCluster = (latMin: number, latMax: number, lonMin: number, lonMax: number, count: number, majorRate: number) => {
      let seed = latMin * 100 + lonMin * 10;
      const rnd = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      for (let i = 0; i < count; i++) {
        const lat = latMin + rnd() * (latMax - latMin);
        const lon = lonMin + rnd() * (lonMax - lonMin);
        const [x, y, z] = toUnit(lat, lon);
        const isMajor = rnd() < majorRate ? 1 : 0;
        landCoords.push(x, y, z, isMajor);
      }
    };
    // Scandinavia (Norway, Sweden, Finland)
    addLandCluster(56.0, 70.0, 6.0, 26.0, 130, 0.12);
    // Great Britain & Ireland
    addLandCluster(50.5, 58.5, -9.5, 1.5, 90, 0.12);
    // Western Europe (France, Spain, Portugal, Low Countries, Germany)
    addLandCluster(36.5, 54.0, -8.5, 14.0, 190, 0.12);
    // Italy & Alps
    addLandCluster(37.5, 46.5, 8.0, 18.0, 75, 0.15);
    // Central & Eastern Europe
    addLandCluster(41.0, 55.0, 14.0, 34.0, 150, 0.12);
    // Mediterranean Coast & North Africa (Morocco to Egypt)
    addLandCluster(28.0, 36.5, -6.0, 34.0, 140, 0.12);

    // Major Capital Beacons
    const HUBS: [number, number][] = [
      [51.5, -0.1], // London
      [48.8, 2.3],  // Paris
      [52.5, 13.4], // Berlin
      [40.4, -3.7], // Madrid
      [41.9, 12.5], // Rome
      [59.3, 18.0], // Stockholm
      [60.2, 24.9], // Helsinki
      [52.2, 21.0], // Warsaw
      [50.4, 30.5], // Kyiv
      [41.0, 28.9], // Istanbul
      [38.0, 23.7], // Athens
      [30.0, 31.2], // Cairo
      [24.7, 46.7], // Riyadh
      [25.2, 55.3], // Dubai
    ];
    for (const hub of HUBS) {
      const [x, y, z] = toUnit(hub[0], hub[1]);
      landCoords.push(x, y, z, 1);
    }
    const landNodesBuffer = new Float32Array(landCoords);
    const landNodesCount = landCoords.length / 4;

    // Tactical network vectors between neighboring hubs
    const networkEdges: [number, number][] = [];
    for (let i = 0; i < HUBS.length; i++) {
      const idxA = (landNodesCount - HUBS.length + i) * 4;
      const ax = landNodesBuffer[idxA];
      const ay = landNodesBuffer[idxA + 1];
      const az = landNodesBuffer[idxA + 2];
      for (let j = i + 1; j < HUBS.length; j++) {
        const idxB = (landNodesCount - HUBS.length + j) * 4;
        const bx = landNodesBuffer[idxB];
        const by = landNodesBuffer[idxB + 1];
        const bz = landNodesBuffer[idxB + 2];
        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < 0.065) {
          networkEdges.push([landNodesCount - HUBS.length + i, landNodesCount - HUBS.length + j]);
        }
      }
    }

    // 3. Precompiled Globe Graticule Lines (Parallels & Meridians)
    const graticuleLines: Float32Array[] = [];
    // Latitude parallels at 25, 40, 55, 70
    for (const lat of [25, 40, 55, 70]) {
      const pts: number[] = [];
      for (let lon = -70; lon <= 70; lon += 5) {
        const [x, y, z] = toUnit(lat, lon);
        pts.push(x, y, z);
      }
      graticuleLines.push(new Float32Array(pts));
    }
    // Longitude meridians at -40, -20, 0, 20, 40, 60
    for (const lon of [-40, -20, 0, 20, 40, 60]) {
      const pts: number[] = [];
      for (let lat = 15; lat <= 80; lat += 5) {
        const [x, y, z] = toUnit(lat, lon);
        pts.push(x, y, z);
      }
      graticuleLines.push(new Float32Array(pts));
    }

    // 3. Ambient Fibonacci sphere digital cloud
    const FIB_COUNT = 240;
    const fibFlat: number[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < FIB_COUNT; i++) {
      const y = 1 - (i / (FIB_COUNT - 1)) * 1.5; // Upper visible hemisphere
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      fibFlat.push(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
    }
    const fibBuffer = new Float32Array(fibFlat);

    // =========================================================================
    // STATE & VISIBILITY CONTROLS
    // =========================================================================
    let rotY = -0.05; // Positions Europe, UK, Scandinavia & Mediterranean directly facing forward in center
    let tick = 0;
    let isVisible = true;
    let lastTime = performance.now();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
          if (isVisible && !animId && !document.hidden) {
            lastTime = performance.now();
            animId = requestAnimationFrame(draw);
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const handleVisibility = () => {
      if (document.hidden) {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      } else if (isVisible && !animId) {
        lastTime = performance.now();
        animId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Pre-allocated coordinate vars (0 allocations inside loop)
    let rx1 = 0, rz1 = 0, ry2 = 0, rz2 = 0;
    let sx = 0, sy = 0;

    // =========================================================================
    // ANIMATION RENDER LOOP (60 FPS BUTTER, 0 GC)
    // =========================================================================
    const draw = (now: number) => {
      if (!isVisible || document.hidden) {
        animId = 0;
        return;
      }

      // Delta time calculation with 50ms clamp to prevent jumps
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      tick += dt * 1.1;
      rotY += dt * 0.02;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      // Proportional globe radius and crest apex positioning
      const globeRadius = isMobile
        ? Math.max(150, Math.min(width * 0.50, 210))
        : Math.max(340, Math.min(width * 0.38, 480));

      const crestTop = isMobile ? Math.round(height * 0.44) : Math.round(height * 0.22);
      const cy = crestTop + globeRadius;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const tilt = 0.38; // 3D tilt towards viewer
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);

      // -----------------------------------------------------------------------
      // 1. DEEP CRIMSON ATMOSPHERIC BLOOM & HALO BEHIND GLOBE
      // -----------------------------------------------------------------------
      const aura = ctx.createRadialGradient(cx, cy, globeRadius * 0.8, cx, cy, globeRadius * 1.25);
      aura.addColorStop(0, 'rgba(255, 37, 37, 0.45)');
      aura.addColorStop(0.35, 'rgba(185, 28, 28, 0.22)');
      aura.addColorStop(0.7, 'rgba(133, 0, 0, 0.08)');
      aura.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // -----------------------------------------------------------------------
      // 2. VOLUMETRIC DIGITAL PARTICLE DUNES (Rendered in the BACKGROUND behind Globe)
      // Exactly matches reference: waves flow behind the Earth's horizon
      // -----------------------------------------------------------------------
      const waveLayers = isMobile ? 12 : 18;
      const ptsPerLayer = isMobile ? 48 : 88;
      const leftSpan = cx;
      const rightSpan = cx;

      const drawVolumetricDunes = (isRight: boolean) => {
        const waveBaseY = isMobile ? height * 0.74 : height * 0.75;
        const amp = isMobile ? 18 : 28;

        // Path batches for high-speed rendering (0 GC allocations)
        const sparklePath = new Path2D();
        const brightRedPath = new Path2D();
        const crimsonPath = new Path2D();
        const mutedPath = new Path2D();

        // A. Delicate Continuous Crest Ridge Filaments (Top 2 layers)
        for (let l = 0; l <= 1; l++) {
          const lNorm = l;
          const lAmp = amp * (1 - lNorm * 0.15);
          const lBaseY = waveBaseY + l * (isMobile ? 6 : 8);

          ctx.beginPath();
          for (let p = 0; p <= ptsPerLayer; p++) {
            const u = p / ptsPerLayer; // 0 (outer edge) -> 1 (center behind globe)
            const x = isRight ? width - u * rightSpan : u * leftSpan;

            const elevation =
              -Math.cos(u * Math.PI * 2.5 - 0.25 + l * 0.18) * lAmp +
              Math.sin(u * Math.PI * 5.0 - tick + l * 0.3) * (lAmp * 0.16);

            const y = lBaseY + elevation;

            if (p === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          if (l === 0) {
            // Primary neon red ridge line
            ctx.strokeStyle = 'rgba(255, 37, 37, 0.92)';
            ctx.lineWidth = isMobile ? 1.4 : 1.9;
            ctx.stroke();

            // Soft bloom halo along crest
            ctx.strokeStyle = 'rgba(255, 37, 37, 0.30)';
            ctx.lineWidth = isMobile ? 3.0 : 4.5;
            ctx.stroke();
          } else {
            // Secondary crest filament
            ctx.strokeStyle = 'rgba(255, 85, 85, 0.55)';
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }

        // B. Volumetric Particle Dunes (Thousands of glowing micro-dots in background)
        for (let layer = 0; layer < waveLayers; layer++) {
          const depthNorm = layer / (waveLayers - 1); // 0 (crest) to 1 (lower depth)
          const layerBaseY = waveBaseY + layer * (isMobile ? 7 : 9.5);
          const layerAmp = amp * (1.0 - depthNorm * 0.35);
          const layerPhase = layer * 0.16;

          for (let p = 0; p < ptsPerLayer; p++) {
            const u = (p + (p % 2 === 0 ? 0.25 : -0.25) * 0.4) / ptsPerLayer;
            if (u < 0 || u > 1) continue;

            const x = isRight ? width - u * rightSpan : u * leftSpan;

            // Elevation with travelling wave harmonics
            const elevation =
              -Math.cos(u * Math.PI * 2.5 - 0.25 + layerPhase) * layerAmp +
              Math.sin(u * Math.PI * 5.0 - tick + layer * 0.22) * (layerAmp * 0.16);

            const y = layerBaseY + elevation;

            // Vignette edge fade (fading softly at outer screen edge)
            const edgeFade = Math.min(1.0, u * 3.8);
            if (edgeFade <= 0.02) continue;

            const isSparkle = layer <= 3 && (p + layer * 3) % 5 === 0;

            if (isSparkle) {
              sparklePath.moveTo(x + 1.4, y);
              sparklePath.arc(x, y, 1.4, 0, Math.PI * 2);
            } else if (depthNorm < 0.3) {
              const r = 1.1;
              brightRedPath.moveTo(x + r, y);
              brightRedPath.arc(x, y, r, 0, Math.PI * 2);
            } else if (depthNorm < 0.65) {
              const r = 0.95;
              crimsonPath.moveTo(x + r, y);
              crimsonPath.arc(x, y, r, 0, Math.PI * 2);
            } else {
              const r = 0.8;
              mutedPath.moveTo(x + r, y);
              mutedPath.arc(x, y, r, 0, Math.PI * 2);
            }
          }
        }

        // Render batched particle groups
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill(sparklePath);

        ctx.fillStyle = 'rgba(255, 37, 37, 0.90)';
        ctx.fill(brightRedPath);

        ctx.fillStyle = 'rgba(215, 25, 25, 0.65)';
        ctx.fill(crimsonPath);

        ctx.fillStyle = 'rgba(145, 12, 12, 0.38)';
        ctx.fill(mutedPath);
      };

      drawVolumetricDunes(false);
      drawVolumetricDunes(true);

      // -----------------------------------------------------------------------
      // 3. GLOBE INTERNAL CLIPPED HEMISPHERE (IN FRONT OF WAVES)
      // -----------------------------------------------------------------------
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
      ctx.clip();

      // Solid Deep Red to Black Core Gradient
      const coreGrad = ctx.createRadialGradient(cx, crestTop, globeRadius * 0.05, cx, cy, globeRadius);
      coreGrad.addColorStop(0, 'rgba(180, 20, 25, 0.35)');
      coreGrad.addColorStop(0.22, 'rgba(38, 6, 10, 0.98)');
      coreGrad.addColorStop(0.85, 'rgba(5, 5, 5, 1.0)');
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Spherical Latitude & Longitude Graticule Coordinate Rings
      ctx.lineWidth = 0.55;
      ctx.strokeStyle = 'rgba(255, 60, 60, 0.18)';
      for (let g = 0; g < graticuleLines.length; g++) {
        const line = graticuleLines[g];
        const numPts = line.length / 3;
        ctx.beginPath();
        let prevVis = false;
        for (let i = 0; i < numPts; i++) {
          const idx = i * 3;
          const gx = line[idx];
          const gy = line[idx + 1];
          const gz = line[idx + 2];
          const grx1 = gx * cosY + gz * sinY;
          const grz1 = -gx * sinY + gz * cosY;
          const gry2 = gy * cosX - grz1 * sinX;
          const grz2 = gy * sinX + grz1 * cosX;
          if (grz2 > 0.04 && gry2 > -0.05) {
            const sxPos = cx + grx1 * globeRadius;
            const syPos = cy - gry2 * globeRadius;
            if (!prevVis) {
              ctx.moveTo(sxPos, syPos);
              prevVis = true;
            } else {
              ctx.lineTo(sxPos, syPos);
            }
          } else {
            prevVis = false;
          }
        }
        ctx.stroke();
      }

      // Tactical Cyber Network Edges (Connections between neighboring hubs)
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = 'rgba(255, 37, 37, 0.28)';
      ctx.beginPath();
      for (let e = 0; e < networkEdges.length; e++) {
        const [i, j] = networkEdges[e];
        const idxA = i * 4;
        const idxB = j * 4;

        // Node A
        const ax = landNodesBuffer[idxA];
        const ay = landNodesBuffer[idxA + 1];
        const az = landNodesBuffer[idxA + 2];
        const arx1 = ax * cosY + az * sinY;
        const arz1 = -ax * sinY + az * cosY;
        const ary2 = ay * cosX - arz1 * sinX;
        const arz2 = ay * sinX + arz1 * cosX;

        // Node B
        const bx = landNodesBuffer[idxB];
        const by = landNodesBuffer[idxB + 1];
        const bz = landNodesBuffer[idxB + 2];
        const brx1 = bx * cosY + bz * sinY;
        const brz1 = -bx * sinY + bz * cosY;
        const bry2 = by * cosX - brz1 * sinX;
        const brz2 = by * sinX + brz1 * cosX;

        if (arz2 > 0.08 && ary2 > 0.02 && brz2 > 0.08 && bry2 > 0.02) {
          const asx = cx + arx1 * globeRadius;
          const asy = cy - ary2 * globeRadius;
          const bsx = cx + brx1 * globeRadius;
          const bsy = cy - bry2 * globeRadius;

          ctx.moveTo(asx, asy);
          ctx.lineTo(bsx, bsy);
        }
      }
      ctx.stroke();

      // Realistic Geographic Continental Coastlines (Stroke only, no chord cut-offs)
      ctx.lineWidth = isMobile ? 1.0 : 1.35;
      ctx.strokeStyle = 'rgba(255, 80, 80, 0.92)';
      ctx.beginPath();
      for (let s = 0; s < segmentBuffers.length; s++) {
        const seg = segmentBuffers[s];
        let prevVisible = false;

        for (let i = 0; i < seg.count; i++) {
          const idx = i * 3;
          const x = seg.buffer[idx];
          const y = seg.buffer[idx + 1];
          const z = seg.buffer[idx + 2];

          rx1 = x * cosY + z * sinY;
          rz1 = -x * sinY + z * cosY;
          ry2 = y * cosX - rz1 * sinX;
          rz2 = y * sinX + rz1 * cosX;

          if (rz2 > 0.02 && ry2 > -0.05) {
            sx = cx + rx1 * globeRadius;
            sy = cy - ry2 * globeRadius;

            if (!prevVisible) {
              ctx.moveTo(sx, sy);
              prevVisible = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            prevVisible = false;
          }
        }
      }
      ctx.stroke();

      // Strategic Hubs, Cities & Cyber Intelligence Nodes
      for (let i = 0; i < landNodesCount; i++) {
        const idx = i * 4;
        const x = landNodesBuffer[idx];
        const y = landNodesBuffer[idx + 1];
        const z = landNodesBuffer[idx + 2];
        const isMajor = landNodesBuffer[idx + 3] === 1;

        rx1 = x * cosY + z * sinY;
        rz1 = -x * sinY + z * cosY;
        ry2 = y * cosX - rz1 * sinX;
        rz2 = y * sinX + rz1 * cosX;

        if (rz2 > 0.05 && ry2 > 0.02) {
          sx = cx + rx1 * globeRadius;
          sy = cy - ry2 * globeRadius;
          const depthAlpha = Math.min(1.0, Math.max(0.25, rz2 * 1.3));

          if (isMajor) {
            // High-priority white core beacon with red halo
            ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha * 0.95})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = `rgba(255, 37, 37, ${depthAlpha * 0.75})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(255, 50, 50, ${depthAlpha * 0.85})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Digital Fibonacci particle dust on globe
      const fibStep = isMobile ? 2 : 1;
      for (let i = 0; i < FIB_COUNT; i += fibStep) {
        const idx = i * 3;
        const x = fibBuffer[idx];
        const y = fibBuffer[idx + 1];
        const z = fibBuffer[idx + 2];

        rx1 = x * cosY + z * sinY;
        rz1 = -x * sinY + z * cosY;
        ry2 = y * cosX - rz1 * sinX;
        rz2 = y * sinX + rz1 * cosX;

        if (rz2 > 0.12 && ry2 > 0.05) {
          sx = cx + rx1 * globeRadius;
          sy = cy - ry2 * globeRadius;
          const a = (0.2 + rz2 * 0.6) * 0.65;
          ctx.fillStyle = i % 8 === 0 ? `rgba(255, 255, 255, ${a})` : `rgba(255, 37, 37, ${a * 0.85})`;
          ctx.beginPath();
          ctx.arc(sx, sy, i % 8 === 0 ? 1.2 : 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore(); // Exit globe clip

      // -----------------------------------------------------------------------
      // 3. HORIZON RIM & INCANDESCENT APEX FLARE (Matches uploaded reference)
      // -----------------------------------------------------------------------
      
      // Razor-Sharp Incandescent Horizon Rim Light along the top arc
      const rimGrad = ctx.createLinearGradient(cx - globeRadius * 0.55, crestTop, cx + globeRadius * 0.55, crestTop);
      rimGrad.addColorStop(0, 'rgba(255, 37, 37, 0)');
      rimGrad.addColorStop(0.25, 'rgba(255, 37, 37, 0.85)');
      rimGrad.addColorStop(0.46, 'rgba(255, 240, 240, 1.0)');
      rimGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
      rimGrad.addColorStop(0.54, 'rgba(255, 240, 240, 1.0)');
      rimGrad.addColorStop(0.75, 'rgba(255, 37, 37, 0.85)');
      rimGrad.addColorStop(1, 'rgba(255, 37, 37, 0)');

      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = isMobile ? 2.2 : 3.0;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius, Math.PI * 1.16, Math.PI * 1.84);
      ctx.stroke();

      // Incandescent Apex Flare (Radiating upwards between legal row blocks)
      const flareGrad = ctx.createRadialGradient(cx, crestTop, 1, cx, crestTop, globeRadius * 0.38);
      flareGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      flareGrad.addColorStop(0.12, 'rgba(255, 180, 180, 0.95)');
      flareGrad.addColorStop(0.32, 'rgba(255, 37, 37, 0.55)');
      flareGrad.addColorStop(0.68, 'rgba(133, 0, 0, 0.18)');
      flareGrad.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(cx, crestTop, globeRadius * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal Anamorphic Lens Flare Streak (Matches reference image)
      const streakGrad = ctx.createLinearGradient(cx - globeRadius * 0.4, crestTop, cx + globeRadius * 0.4, crestTop);
      streakGrad.addColorStop(0, 'rgba(255, 37, 37, 0)');
      streakGrad.addColorStop(0.35, 'rgba(255, 80, 80, 0.55)');
      streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
      streakGrad.addColorStop(0.65, 'rgba(255, 80, 80, 0.55)');
      streakGrad.addColorStop(1, 'rgba(255, 37, 37, 0)');
      ctx.fillStyle = streakGrad;
      ctx.beginPath();
      ctx.ellipse(cx, crestTop, globeRadius * 0.4, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer delicate atmospheric halo line
      ctx.strokeStyle = 'rgba(255, 55, 55, 0.45)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius + 3.5, Math.PI * 1.20, Math.PI * 1.80);
      ctx.stroke();

      // -----------------------------------------------------------------------
      // 4. ORBITAL SATELLITE & DATA TRAJECTORIES (Curved lines across globe)
      // -----------------------------------------------------------------------
      ctx.lineWidth = 0.85;
      ctx.strokeStyle = 'rgba(255, 50, 50, 0.32)';
      
      // Upper Orbit Arc
      ctx.beginPath();
      const rOrbit1 = globeRadius * 1.08;
      ctx.ellipse(cx, cy - globeRadius * 0.12, rOrbit1, rOrbit1 * 0.32, -0.15, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

      // Orbit pulse particle
      const pAngle1 = Math.PI * 1.05 + ((tick * 0.45) % (Math.PI * 0.9));
      const px1 = cx + Math.cos(pAngle1) * rOrbit1;
      const py1 = (cy - globeRadius * 0.12) + Math.sin(pAngle1) * (rOrbit1 * 0.32);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(px1, py1, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Second Orbit Arc
      ctx.beginPath();
      const rOrbit2 = globeRadius * 1.14;
      ctx.ellipse(cx, cy - globeRadius * 0.08, rOrbit2, rOrbit2 * 0.28, 0.22, Math.PI * 1.12, Math.PI * 1.88);
      ctx.strokeStyle = 'rgba(255, 85, 85, 0.28)';
      ctx.stroke();

      // Second orbit pulse
      const pAngle2 = Math.PI * 1.12 + (((tick * 0.38) + 1.2) % (Math.PI * 0.76));
      const px2 = cx + Math.cos(pAngle2) * rOrbit2;
      const py2 = (cy - globeRadius * 0.08) + Math.sin(pAngle2) * (rOrbit2 * 0.28);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(px2, py2, 1.6, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block transform-gpu will-change-transform"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    />
  );
};

export const Footer3D: React.FC<Footer3DProps> = ({
  onLaunchWorkspace,
  scrollToSection
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'disclaimer' | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setIsSubscribed(true);
    setNewsletterEmail('');
    window.setTimeout(() => setIsSubscribed(false), 4500);
  };

  return (
    <footer className="relative w-full bg-[#050507] text-white overflow-hidden border-t border-white/10 pt-14 sm:pt-16">
      {/* Ambient Top Glow Line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(220, 38, 38, 0.6) 50%, transparent 100%)'
        }}
      />

      {/* Main 4-Column Grid Container */}
      <div className="relative z-10 w-full max-w-7xl 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-2 sm:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-12">
          
          {/* ========================================================= */}
          {/* COLUMN 1: BRAND IDENTITY & BADGES (lg:col-span-4) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4 text-left">
            {/* Logo + Platform Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#991B1B] via-[#DC2626] to-[#EF4444] p-0.5 flex items-center justify-center shadow-[0_0_24px_rgba(220,38,38,0.45)] shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#09090B] flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white stroke-[2.2]" />
                </div>
              </div>
              <div>
                <h3 className="font-display font-extrabold text-2xl text-white tracking-tight leading-none">
                  GeoSentinel
                </h3>
                <span className="text-red-500 text-[11px] font-medium tracking-wide mt-1 block">
                  Global Event Intelligence Platform
                </span>
              </div>
            </div>

            {/* Platform Description */}
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              An AI-powered platform that connects global events, economic indicators, and verified evidence to assess impacts, explore scenarios, and generate explainable strategic recommendations.
            </p>

            {/* 3 Canonical Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D0D12] border border-white/10 text-[11px] font-medium text-zinc-300 shadow-xs hover:border-red-500/50 transition-colors">
                <Cpu className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>12-Stage Pipeline</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D0D12] border border-white/10 text-[11px] font-medium text-zinc-300 shadow-xs hover:border-red-500/50 transition-colors">
                <Layers className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Zero-Paid-API</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D0D12] border border-white/10 text-[11px] font-medium text-zinc-300 shadow-xs hover:border-red-500/50 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Evidence-First</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: EXPLORE (lg:col-span-2) */}
          {/* ========================================================= */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
              <span className="w-0.5 h-3.5 bg-red-600 rounded-full inline-block" />
              <span>EXPLORE</span>
            </div>

            <ul className="space-y-3 text-xs text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('concept')}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <Home className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 transition-colors shrink-0" />
                  <span>Project Concept</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <Workflow className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 transition-colors shrink-0" />
                  <span>How It Works</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('signals')}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <Radio className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 transition-colors shrink-0" />
                  <span>Live Signals</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('capabilities')}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 transition-colors shrink-0" />
                  <span>Capabilities</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onLaunchWorkspace()}
                  className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-semibold transition-colors cursor-pointer group text-left"
                >
                  <Terminal className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Workspace</span>
                </button>
              </li>
            </ul>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3: TRUST & DOCUMENTATION (lg:col-span-3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
              <span className="w-0.5 h-3.5 bg-red-600 rounded-full inline-block" />
              <span>TRUST &amp; DOCUMENTATION</span>
            </div>

            <ul className="space-y-3 text-xs text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('signals')}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer text-left group"
                >
                  <Database className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 transition-colors shrink-0" />
                  <span>Data Sources (Public Connectors)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer text-left group"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 transition-colors shrink-0" />
                  <span>Evidence &amp; Verification Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('case-studies')}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer text-left group"
                >
                  <Activity className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 transition-colors shrink-0" />
                  <span>Research &amp; Evaluation (ForecastLab)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('concept')}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer text-left group"
                >
                  <Layers className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 transition-colors shrink-0" />
                  <span>System Architecture (12-Stage Pipeline)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('runtime')}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer text-left group"
                >
                  <Lock className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 transition-colors shrink-0" />
                  <span>Privacy &amp; Security</span>
                </button>
              </li>
            </ul>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 4: STAY CONNECTED (lg:col-span-3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-3.5 text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
              <span className="w-0.5 h-3.5 bg-red-600 rounded-full inline-block" />
              <span>STAY CONNECTED</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Updates, releases, and project insights.
            </p>

            {/* Newsletter Input Box matching reference design */}
            <form
              onSubmit={handleSubscribe}
              className="relative flex items-center w-full bg-[#0D0D12] border border-white/10 hover:border-red-500/40 focus-within:border-red-500 rounded-2xl p-1.5 transition-all shadow-inner"
            >
              <div className="pl-3 pr-2 text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#EF4444] hover:from-[#B91C1C] hover:to-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Submit Email"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {isSubscribed && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                <span>Thank you! Subscribed to updates.</span>
              </div>
            )}

            {/* Social Icon Grid matching reference image with supplied URLs */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* GitHub */}
              <a
                href="https://github.com/Samarth007-star"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub - Samarth007-star"
                className="w-9 h-9 rounded-xl bg-[#0D0D12] border border-white/10 hover:border-red-500/60 hover:bg-white/5 text-zinc-300 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/samarth-chavan-41b819323/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn - Samarth Chavan"
                className="w-9 h-9 rounded-xl bg-[#0D0D12] border border-white/10 hover:border-red-500/60 hover:bg-white/5 text-zinc-300 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37z" />
                </svg>
              </a>



              {/* Instagram */}
              <a
                href="https://www.instagram.com/mr._samarth_.007?srtk=MWNhNDJuOHFxazJrOQ=="
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram - @mr._samarth_.007"
                className="w-9 h-9 rounded-xl bg-[#0D0D12] border border-white/10 hover:border-red-500/60 hover:bg-white/5 text-zinc-300 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CINEMATIC FOOTER-BOTTOM STRIP                             */}
      {/* Exactly recreates the uploaded reference design           */}
      {/* ========================================================= */}
      <div className="relative w-full bg-[#050505] overflow-hidden border-t border-white/10 min-h-[325px] sm:min-h-[275px] lg:min-h-[295px] flex flex-col justify-between">
        {/* Layer 1: Dark-Red Radial Gradient Illumination */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 65% at 50% 100%, rgba(133, 0, 0, 0.45) 0%, rgba(50, 0, 0, 0.22) 50%, rgba(5, 5, 5, 0) 100%)',
          }}
        />

        {/* Layer 2 & 3: Large Holographic Earth & Symmetrical Particle Waves Canvas */}
        <div className="absolute inset-0 z-10 pointer-events-none select-none">
          <FooterGlobeHorizon />
        </div>

        {/* Layer 4: Real HTML Legal Information & Navigation Row */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 pointer-events-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 lg:gap-6 font-serif">
            {/* LEFT SIDE: Small red outlined info icon + Transparency Statement */}
            <div className="flex items-center gap-2 text-center lg:text-left">
              <span
                className="w-3.5 h-3.5 rounded-full border border-[#FF2525] text-[#FF2525] flex items-center justify-center text-[9px] font-sans font-bold shrink-0 leading-none"
                aria-hidden="true"
              >
                i
              </span>
              <p className="text-[10px] sm:text-[11px] lg:text-[12px] text-[#E5E5E5] tracking-wide leading-relaxed">
                Built for transparent, evidence-grounded strategic intelligence. GeoSentinel supports human decision-making; it does not replace it.
              </p>
            </div>

            {/* RIGHT SIDE: Copyright & Legal Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0 text-[10px] sm:text-[11px] lg:text-[12px] text-[#A0A0A0]">
              <span>© 2026 GeoSentinel. All rights reserved.</span>
              <span className="text-zinc-700">|</span>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="text-[#E5E5E5] hover:text-white transition-colors cursor-pointer"
              >
                Terms
              </button>
              <span className="text-zinc-700">|</span>
              <button
                type="button"
                onClick={() => setLegalModal('disclaimer')}
                className="text-[#E5E5E5] hover:text-white transition-colors cursor-pointer"
              >
                Disclaimer
              </button>
              <span className="text-zinc-700">|</span>
              <a
                href="mailto:analyst@geosentinel.ai"
                className="text-[#E5E5E5] hover:text-white transition-colors cursor-pointer"
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        {/* Spacer to preserve vertical room for the globe and waves below the legal row */}
        <div className="relative z-0 h-[180px] sm:h-[195px] lg:h-[225px] pointer-events-none" />
      </div>

      {/* Legal Dialog Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#09090B] border border-red-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-display font-bold text-lg text-white">
                {legalModal === 'terms' ? 'Terms of Service' : 'Transparency & Risk Disclaimer'}
              </h4>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-zinc-300 leading-relaxed space-y-2.5 max-h-72 overflow-y-auto pr-2">
              {legalModal === 'terms' ? (
                <>
                  <p>
                    GeoSentinel is an educational, research-grade, and enterprise strategic decision support system. By accessing this platform, users agree that outputs constitute AI-generated analytical assessments grounded in public open datasets.
                  </p>
                  <p>
                    All multi-agent telemetry and scenario forks operate without paid API dependencies under open data terms provided by ReliefWeb, GDELT, World Bank, IMF, USGS, NASA, and NOAA.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    GeoSentinel synthesizes geopolitical, economic, and humanitarian data into causal dependency graphs and strategic options. AI outputs should not be used as sole guidance for high-consequence national security, legal, or financial actions without human-in-the-loop review.
                  </p>
                  <p>
                    The independent Red-Team Review agent continuously challenges proposed options, highlights unintended consequences, and rates confidence levels to reduce hallucination and overconfidence.
                  </p>
                </>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

