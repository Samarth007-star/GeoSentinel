import React, { useEffect, useRef } from 'react';
import { detectGraphicsTier, getTierConfig } from '../../utils/graphicsTier';

interface ParticlePresenceCanvasProps {
  /** Target shape index: 0 = Neural Brain, 1 = World Globe, 2 = War Tactical Emblem */
  activeShape: number;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface NodeData {
  brain: Vec3;
  world: Vec3;
  war: Vec3;
  spread: Vec3;
  size: number;
  bright: boolean;
  phase: number;
}

interface EdgePair {
  a: number;
  b: number;
  shape: 0 | 1 | 2;
  bright?: boolean;
}

// Globe radius constant
const GLOBE_R = 0.94;

// Detailed, geographically accurate continent coastlines for a crisp, recognizable World Globe
const CONTINENT_POLYS: { name: string; targetPts: number; poly: [number, number][] }[] = [
  // 1. Africa
  {
    name: 'Africa',
    targetPts: 70,
    poly: [
      [35.8, -5.3], [35.5, -2.0], [36.8, 3.0], [37.0, 10.0], [33.0, 11.5], [32.0, 15.0],
      [31.5, 25.0], [31.2, 32.3], [30.0, 32.5], [27.5, 34.0], [22.0, 37.0], [15.5, 41.5],
      [12.0, 43.5], [11.5, 51.0], [9.0, 50.5], [2.0, 45.0], [-4.5, 39.5], [-11.0, 40.5],
      [-17.0, 39.0], [-26.0, 33.0], [-34.0, 26.0], [-34.8, 20.0], [-34.0, 18.5], [-28.5, 16.5],
      [-22.0, 14.5], [-12.5, 13.5], [-6.0, 12.0], [4.5, 9.0], [6.0, 2.5], [5.0, -2.0],
      [4.5, -7.5], [7.0, -12.5], [11.5, -16.5], [14.8, -17.5], [21.0, -17.0], [26.0, -14.5],
      [30.5, -10.0], [35.8, -5.3]
    ]
  },
  // 2. Madagascar
  {
    name: 'Madagascar',
    targetPts: 14,
    poly: [
      [-12.0, 49.3], [-15.5, 50.5], [-20.0, 48.5], [-25.5, 45.0], [-25.0, 44.0],
      [-20.0, 44.0], [-16.0, 44.5], [-12.0, 49.3]
    ]
  },
  // 3. Europe & Mediterranean
  {
    name: 'Europe',
    targetPts: 58,
    poly: [
      [36.0, -5.5], [37.0, -9.0], [42.0, -9.0], [43.5, -8.5], [43.5, -1.8], [47.5, -3.0],
      [49.5, -0.5], [51.0, 2.0], [53.5, 7.0], [55.5, 8.5], [57.5, 10.5], [58.0, 12.0],
      [55.5, 14.5], [54.5, 19.0], [59.0, 25.0], [60.0, 30.0], [65.0, 25.0], [70.0, 28.0],
      [71.0, 25.5], [68.0, 15.0], [62.0, 6.0], [58.0, 6.0], [54.0, 38.0], [47.0, 38.0],
      [45.0, 35.0], [46.5, 31.0], [43.0, 28.5], [41.0, 29.0], [40.0, 26.0], [38.0, 23.5],
      [36.5, 22.5], [39.0, 20.0], [42.0, 19.0], [45.5, 13.5], [44.0, 12.5], [40.0, 18.5],
      [38.0, 16.0], [37.5, 12.5], [41.0, 14.0], [43.5, 10.0], [43.5, 4.0], [36.0, -5.5]
    ]
  },
  // 4. Great Britain & Ireland
  {
    name: 'Britain_Ireland',
    targetPts: 18,
    poly: [
      [50.0, -5.0], [50.5, -1.5], [51.5, 1.5], [53.0, 0.5], [55.0, -1.5], [58.5, -3.0],
      [58.0, -5.5], [55.5, -5.0], [53.5, -3.0], [51.5, -5.0], [50.0, -5.0]
    ]
  },
  // 5. Asia & Middle East
  {
    name: 'Asia',
    targetPts: 78,
    poly: [
      [30.0, 32.5], [28.0, 34.5], [22.0, 38.5], [12.5, 43.5], [14.5, 54.0], [24.0, 57.5],
      [26.0, 56.0], [30.0, 48.0], [25.0, 62.0], [24.8, 67.0], [22.0, 69.5], [19.0, 72.8],
      [15.0, 73.8], [8.5, 77.0], [13.0, 80.2], [17.5, 83.0], [21.5, 87.0], [22.0, 91.5],
      [16.0, 96.0], [12.0, 100.0], [4.0, 103.5], [1.3, 103.8], [7.0, 105.0], [10.5, 107.5],
      [16.0, 108.0], [21.0, 108.0], [22.5, 114.0], [25.0, 119.0], [31.0, 122.0], [35.0, 119.5],
      [37.5, 122.5], [39.0, 124.0], [37.5, 126.5], [34.5, 128.5], [37.0, 129.5], [40.0, 128.5],
      [43.0, 132.0], [47.0, 138.0], [53.0, 141.0], [58.0, 162.0], [65.0, 175.0], [70.0, 170.0],
      [73.0, 130.0], [75.0, 100.0], [70.0, 75.0], [68.0, 55.0], [50.0, 55.0], [40.0, 50.0],
      [36.0, 38.0], [30.0, 32.5]
    ]
  },
  // 6. Japan
  {
    name: 'Japan',
    targetPts: 14,
    poly: [
      [31.0, 131.0], [34.0, 135.0], [36.0, 140.0], [41.0, 141.5], [44.0, 144.0],
      [42.0, 140.0], [37.0, 137.0], [34.0, 131.0], [31.0, 131.0]
    ]
  },
  // 7. North America
  {
    name: 'NorthAmerica',
    targetPts: 64,
    poly: [
      [71.0, -156.0], [65.0, -168.0], [59.0, -160.0], [55.0, -163.0], [60.0, -145.0],
      [55.0, -131.0], [49.0, -125.0], [42.0, -124.5], [37.5, -122.5], [32.5, -117.0],
      [24.0, -110.0], [30.0, -113.0], [22.0, -106.0], [16.0, -98.0], [14.0, -92.0],
      [8.5, -83.5], [8.5, -79.5], [13.0, -84.0], [18.0, -88.0], [21.5, -87.0],
      [20.0, -91.0], [26.0, -97.0], [29.0, -95.0], [30.0, -88.0], [25.0, -80.5],
      [31.0, -81.5], [36.0, -75.5], [41.0, -72.0], [44.5, -66.0], [47.0, -53.0],
      [55.0, -58.0], [62.0, -65.0], [70.0, -85.0], [72.0, -125.0], [71.0, -156.0]
    ]
  },
  // 8. South America
  {
    name: 'SouthAmerica',
    targetPts: 46,
    poly: [
      [11.5, -73.0], [10.5, -63.0], [6.0, -55.0], [-1.0, -48.0], [-5.0, -35.0],
      [-13.0, -38.5], [-23.0, -43.0], [-34.5, -54.0], [-40.0, -62.0], [-52.0, -68.0],
      [-55.0, -67.0], [-48.0, -75.0], [-35.0, -72.0], [-20.0, -70.0], [-12.0, -77.0],
      [-2.0, -80.5], [5.0, -77.5], [8.0, -77.0], [11.5, -73.0]
    ]
  },
  // 9. Australia
  {
    name: 'Australia',
    targetPts: 28,
    poly: [
      [-12.0, 131.0], [-12.0, 136.0], [-16.0, 139.0], [-11.0, 142.5], [-18.0, 146.0],
      [-25.0, 153.0], [-34.0, 151.0], [-38.0, 145.0], [-38.0, 141.0], [-35.0, 136.0],
      [-32.0, 132.0], [-33.5, 122.0], [-34.5, 115.0], [-26.0, 113.0], [-20.0, 118.0],
      [-15.0, 124.0], [-14.0, 129.0], [-12.0, 131.0]
    ]
  }
];

function samplePolyOutline(poly: [number, number][], targetCount: number): [number, number][] {
  const segLens: number[] = [];
  let totalLen = 0;
  for (let i = 0; i < poly.length; i++) {
    const [la1, lo1] = poly[i];
    const [la2, lo2] = poly[(i + 1) % poly.length];
    const dLa = la2 - la1;
    const dLo = (lo2 - lo1) * Math.cos(((la1 + la2) * Math.PI) / 360);
    const len = Math.sqrt(dLa * dLa + dLo * dLo);
    segLens.push(len);
    totalLen += len;
  }
  const pts: [number, number][] = [];
  for (let k = 0; k < targetCount; k++) {
    const targetDist = (k / targetCount) * totalLen;
    let accumulated = 0;
    for (let i = 0; i < poly.length; i++) {
      if (accumulated + segLens[i] >= targetDist || i === poly.length - 1) {
        const segDist = targetDist - accumulated;
        const frac = segLens[i] > 1e-6 ? Math.min(1, Math.max(0, segDist / segLens[i])) : 0;
        const [la1, lo1] = poly[i];
        const [la2, lo2] = poly[(i + 1) % poly.length];
        pts.push([la1 + (la2 - la1) * frac, lo1 + (lo2 - lo1) * frac]);
        break;
      }
      accumulated += segLens[i];
    }
  }
  return pts;
}

function pointInPoly(lat: number, lon: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const yi = poly[i][0], xi = poly[i][1];
    const yj = poly[j][0], xj = poly[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isWorldLand(lat: number, lon: number): boolean {
  for (let i = 0; i < CONTINENT_POLYS.length; i++) {
    if (pointInPoly(lat, lon, CONTINENT_POLYS[i].poly)) return true;
  }
  return false;
}

function latLonToSphere(latDeg: number, lonDeg: number, r: number): Vec3 {
  const la = (latDeg * Math.PI) / 180;
  const lo = (lonDeg * Math.PI) / 180;
  return {
    x: Math.cos(la) * Math.sin(lo) * r,
    y: Math.sin(la) * r,
    z: Math.cos(la) * Math.cos(lo) * r
  };
}

function buildHologramGeometry(): { nodes: NodeData[]; edges: EdgePair[] } {
  const TOTAL = 2200;
  const nodes: NodeData[] = [];
  const edges: EdgePair[] = [];

  let seed = 918273;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // ===========================================================================
  // SHAPE 0: 3D HOLOGRAPHIC NEURAL BRAIN (matches Image 1)
  // ===========================================================================
  const brainPts: { v: Vec3; bright: boolean }[] = [];
  // 1) Cerebrum (1,650 nodes arranged along flowing cortical wave ribbons)
  const C_RIBBONS = 22;
  const C_PER_RIBBON = 75;
  for (let r = 0; r < C_RIBBONS; r++) {
    const baseIdx = brainPts.length;
    const vNorm = r / (C_RIBBONS - 1); // 0 (bottom) -> 1 (top)
    const elev = -0.35 + vNorm * 1.15; // vertical slice
    const sliceWidth = Math.sqrt(Math.max(0.08, 1 - Math.pow((vNorm - 0.52) * 1.85, 2)));

    for (let s = 0; s < C_PER_RIBBON; s++) {
      const ang = (s / C_PER_RIBBON) * Math.PI * 2;
      // Side-profile brain shape: elongated horizontally (X), slightly tucked front (X < 0)
      const cosA = Math.cos(ang);
      const sinA = Math.sin(ang);
      const frontalTuck = cosA < 0 ? 0.88 : 1.0;
      const wave =
        Math.sin(ang * 5 + r * 0.9) * 0.045 +
        Math.cos(ang * 8 - r * 1.1) * 0.025;

      const x = cosA * sliceWidth * 1.06 * frontalTuck * (1 + wave);
      const y = elev * 0.72 + Math.sin(ang * 3 + r) * 0.045 + 0.14;
      const z = sinA * sliceWidth * 0.72 * (1 + wave);

      const isBright = s % 6 === 0 || r % 4 === 0;
      brainPts.push({ v: { x, y, z }, bright: isBright });

      if (s > 0) {
        edges.push({ a: baseIdx + s - 1, b: baseIdx + s, shape: 0, bright: r % 3 === 0 });
      }
    }
    edges.push({ a: baseIdx + C_PER_RIBBON - 1, b: baseIdx, shape: 0, bright: r % 3 === 0 });
  }
  // Vertical neural mesh connections across ribbons
  for (let r = 0; r < C_RIBBONS - 1; r++) {
    for (let s = 0; s < C_PER_RIBBON; s += 3) {
      edges.push({
        a: r * C_PER_RIBBON + s,
        b: (r + 1) * C_PER_RIBBON + ((s + 1) % C_PER_RIBBON),
        shape: 0,
        bright: false
      });
    }
  }

  // 2) Cerebellum (lower back rounded lobe, 350 nodes)
  const cbBase = brainPts.length;
  for (let i = 0; i < 350; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / 350);
    const theta = i * 2.39996323;
    const x = Math.sin(phi) * Math.cos(theta) * 0.36 + 0.42;
    const y = Math.cos(phi) * 0.24 - 0.34;
    const z = Math.sin(phi) * Math.sin(theta) * 0.34;
    brainPts.push({ v: { x, y, z }, bright: i % 5 === 0 });
    if (i > 0 && i % 4 !== 0) {
      edges.push({ a: cbBase + i - 1, b: cbBase + i, shape: 0, bright: false });
    }
  }

  // 3) Brainstem tapering down to the hologram base (200 nodes)
  const stemBase = brainPts.length;
  const STEM_RINGS = 10;
  const STEM_SEGS = 20;
  for (let r = 0; r < STEM_RINGS; r++) {
    const t = r / (STEM_RINGS - 1);
    const rad = 0.16 * (1 - t * 0.58);
    const y = -0.32 - t * 0.52;
    const xShift = 0.08 - t * 0.12;
    const ringStart = brainPts.length;
    for (let s = 0; s < STEM_SEGS; s++) {
      const ang = (s / STEM_SEGS) * Math.PI * 2;
      brainPts.push({
        v: { x: xShift + Math.cos(ang) * rad, y, z: Math.sin(ang) * rad },
        bright: r === STEM_RINGS - 1 || s % 4 === 0
      });
      if (s > 0) edges.push({ a: ringStart + s - 1, b: ringStart + s, shape: 0, bright: true });
      if (r > 0 && s % 2 === 0) {
        edges.push({ a: ringStart + s - STEM_SEGS, b: ringStart + s, shape: 0, bright: false });
      }
    }
    edges.push({ a: ringStart + STEM_SEGS - 1, b: ringStart, shape: 0, bright: true });
  }
  void stemBase;

  // ===========================================================================
  // SHAPE 1: 3D HOLOGRAPHIC WORLD GLOBE (Mathematically Structured Parametric Surface)
  // Matches TARGET (CORRECT & PERFECT) from reference exactly:
  // - Uniform parametric spherical particle lattice on R = 0.94 (no stray points)
  // - High-contrast luminous landmass dots vs subtle neon red ocean dots
  // - Continuous, clean vector coastline outlines without internal spiderweb clutter
  // - Two smooth tilted orbital rings with glowing satellite beacon
  // ===========================================================================
  const worldPts: { v: Vec3; bright: boolean }[] = [];

  // 1) Continuous Continental Vector Outlines (742 nodes + closed outline edges)
  for (let p = 0; p < CONTINENT_POLYS.length; p++) {
    const { poly, targetPts } = CONTINENT_POLYS[p];
    const sampled = samplePolyOutline(poly, targetPts);
    const polyStart = worldPts.length;
    for (let k = 0; k < sampled.length; k++) {
      const [la, lo] = sampled[k];
      const v = latLonToSphere(la, lo, GLOBE_R);
      worldPts.push({ v, bright: true });
      if (k > 0) {
        edges.push({ a: worldPts.length - 2, b: worldPts.length - 1, shape: 1, bright: true });
      }
    }
    if (sampled.length > 2) {
      edges.push({ a: worldPts.length - 1, b: polyStart, shape: 1, bright: true });
    }
  }

  // 2) Uniform Parametric Spherical Particle Lattice (Clean Parallel Rings & Meridians)
  // Perfectly balanced across 45 latitude parallels from -80 to +80 deg (exact 1,670 nodes)
  const RINGS = 45;
  const dLat = 160 / (RINGS - 1);
  for (let r = 0; r < RINGS; r++) {
    const lat = -80 + r * dLat;
    const cosLat = Math.cos((lat * Math.PI) / 180);
    const ptsInRing = Math.max(6, Math.round(53.5 * cosLat));

    for (let k = 0; k < ptsInRing; k++) {
      const lon = -180 + (k / ptsInRing) * 360;
      const v = latLonToSphere(lat, lon, GLOBE_R);
      const isLand = isWorldLand(lat, lon);
      worldPts.push({ v, bright: isLand });
    }
  }

  // 3) Two Smooth Tilted Orbital Satellite Rings (80 + 60 = 140 nodes -> TOTAL = 2200)
  // Both orbits form complete, smooth 3D ellipses wrapping around the Earth
  const orbitConfigs = [
    { rx: 0.40, rz: -0.38, r: 1.24, count: 80 },
    { rx: -0.35, rz: 0.42, r: 1.20, count: 60 }
  ];
  for (let o = 0; o < orbitConfigs.length; o++) {
    const cfg = orbitConfigs[o];
    const ringStart = worldPts.length;
    for (let k = 0; k < cfg.count; k++) {
      const ang = (k / cfg.count) * Math.PI * 2;
      const x0 = Math.cos(ang) * cfg.r;
      const z0 = Math.sin(ang) * cfg.r;
      const y1 = -z0 * Math.sin(cfg.rx);
      const z1 = z0 * Math.cos(cfg.rx);
      const x2 = x0 * Math.cos(cfg.rz) - y1 * Math.sin(cfg.rz);
      const y2 = x0 * Math.sin(cfg.rz) + y1 * Math.cos(cfg.rz);
      worldPts.push({ v: { x: x2, y: y2, z: z1 }, bright: true });
      if (k > 0) edges.push({ a: ringStart + k - 1, b: ringStart + k, shape: 1, bright: false });
    }
    edges.push({ a: ringStart + cfg.count - 1, b: ringStart, shape: 1, bright: false });
  }

  // ===========================================================================
  // SHAPE 2: 3D WAR TACTICAL EMBLEM (Helmet + Crossed M4 Rifles + Reticle + Dotted Globe)
  // ===========================================================================
  const warPts: { v: Vec3; bright: boolean }[] = [];

  const addWarSegment = (p1: Vec3, p2: Vec3, steps: number, bright = true) => {
    const start = warPts.length;
    for (let s = 0; s < steps; s++) {
      if (warPts.length >= TOTAL) return;
      const f = steps === 1 ? 0 : s / (steps - 1);
      warPts.push({
        v: {
          x: p1.x + (p2.x - p1.x) * f,
          y: p1.y + (p2.y - p1.y) * f,
          z: p1.z + (p2.z - p1.z) * f
        },
        bright: bright && (s === 0 || s === steps - 1 || s % 4 === 0)
      });
      if (s > 0) edges.push({ a: start + s - 1, b: start + s, shape: 2, bright });
    }
  };

  // 1) Outer Segmented Reticle (4 quadrant arcs) + Inner Thin Arcs + 4 Cardinal Crosshairs
  for (let q = 0; q < 4; q++) {
    const aStart = (q * 90 + 9) * (Math.PI / 180);
    const aEnd = (q * 90 + 81) * (Math.PI / 180);
    // Outer thick reticle arc
    const segs = 50;
    const oStart = warPts.length;
    for (let s = 0; s < segs; s++) {
      const ang = aStart + ((aEnd - aStart) * s) / (segs - 1);
      warPts.push({
        v: { x: Math.cos(ang) * 1.06, y: Math.sin(ang) * 1.06, z: 0 },
        bright: s === 0 || s === segs - 1 || s % 8 === 0
      });
      if (s > 0) edges.push({ a: oStart + s - 1, b: oStart + s, shape: 2, bright: true });
    }
    // Inner fine reticle arc
    const iSegs = 32;
    const iStart = warPts.length;
    for (let s = 0; s < iSegs; s++) {
      const ang = aStart + 0.08 + ((aEnd - aStart - 0.16) * s) / (iSegs - 1);
      warPts.push({
        v: { x: Math.cos(ang) * 0.92, y: Math.sin(ang) * 0.92, z: 0 },
        bright: false
      });
      if (s > 0) edges.push({ a: iStart + s - 1, b: iStart + s, shape: 2, bright: false });
    }
  }

  // 4 Cardinal Crosshair Bars (Top, Bottom, Left, Right)
  addWarSegment({ x: 0, y: 0.86, z: 0.02 }, { x: 0, y: 1.24, z: 0.02 }, 20, true);
  addWarSegment({ x: 0, y: -0.86, z: 0.02 }, { x: 0, y: -1.24, z: 0.02 }, 20, true);
  addWarSegment({ x: -0.86, y: 0, z: 0.02 }, { x: -1.24, y: 0, z: 0.02 }, 20, true);
  addWarSegment({ x: 0.86, y: 0, z: 0.02 }, { x: 1.24, y: 0, z: 0.02 }, 20, true);

  // 2) Combat Helmet (Top-Center: dome + flared rim + V-chinstrap)
  for (let rib = 0; rib < 6; rib++) {
    const zAngle = (rib / 5 - 0.5) * 1.1;
    const zDepth = Math.sin(zAngle) * 0.22;
    const rScale = Math.cos(zAngle * 0.45);
    const segs = 26;
    const rStart = warPts.length;
    for (let s = 0; s < segs; s++) {
      const a = (s / (segs - 1)) * Math.PI;
      const hx = -Math.cos(a) * 0.31 * rScale;
      const hy = 0.41 + Math.sin(a) * 0.31 * rScale;
      warPts.push({ v: { x: hx, y: hy, z: zDepth }, bright: rib === 2 || s % 5 === 0 });
      if (s > 0) edges.push({ a: rStart + s - 1, b: rStart + s, shape: 2, bright: rib === 2 });
    }
  }
  // Curved helmet brow & flared ear rim
  const brimSegs = 28;
  const brimStart = warPts.length;
  for (let s = 0; s < brimSegs; s++) {
    const f = s / (brimSegs - 1);
    const bx = -0.37 + f * 0.74;
    const by = 0.34 - Math.pow(Math.abs(f - 0.5) * 2, 2) * 0.04;
    warPts.push({ v: { x: bx, y: by, z: 0.05 }, bright: s % 4 === 0 });
    if (s > 0) edges.push({ a: brimStart + s - 1, b: brimStart + s, shape: 2, bright: true });
  }
  addWarSegment({ x: -0.31, y: 0.42, z: 0.04 }, { x: -0.37, y: 0.3, z: 0.05 }, 8, true);
  addWarSegment({ x: 0.31, y: 0.42, z: 0.04 }, { x: 0.37, y: 0.3, z: 0.05 }, 8, true);
  // Chinstrap V-harness + chin cup
  addWarSegment({ x: -0.22, y: 0.32, z: 0.04 }, { x: -0.11, y: 0.14, z: 0.04 }, 10, true);
  addWarSegment({ x: 0.22, y: 0.32, z: 0.04 }, { x: 0.11, y: 0.14, z: 0.04 }, 10, true);
  addWarSegment({ x: -0.15, y: 0.2, z: 0.04 }, { x: 0.15, y: 0.2, z: 0.04 }, 12, true);
  addWarSegment({ x: -0.11, y: 0.14, z: 0.04 }, { x: 0.11, y: 0.14, z: 0.04 }, 10, true);

  // 3) Two Symmetrical Crossed M4 Rifles (Up-Right & Up-Left, grips/stocks downward!)
  const rifleAngle = (38 * Math.PI) / 180;
  const cosR = Math.cos(rifleAngle);
  const sinR = Math.sin(rifleAngle);

  for (let side = 0; side < 2; side++) {
    const mirrorX = side === 0 ? 1 : -1;
    const zOff = side === 0 ? 0.03 : -0.03;

    // Transform upright local rifle coords (u = along rifle, v = +up / -down)
    const pt = (u: number, v: number): Vec3 => {
      const rx = u * cosR - v * sinR;
      const ry = u * sinR + v * cosR;
      return {
        x: rx * mirrorX,
        y: ry - 0.18,
        z: zOff
      };
    };

    // Barrel + Muzzle Flash Hider (u: +0.34 to +0.84)
    addWarSegment(pt(0.34, 0.025), pt(0.84, 0.025), 22, true);
    addWarSegment(pt(0.34, -0.005), pt(0.84, -0.005), 22, true);
    addWarSegment(pt(0.8, 0.04), pt(0.85, 0.04), 6, true);
    addWarSegment(pt(0.8, -0.02), pt(0.85, -0.02), 6, true);
    addWarSegment(pt(0.85, 0.04), pt(0.85, -0.02), 5, true);

    // A-Frame Front Sight Triangle (u: +0.40 to +0.48, +v up!)
    addWarSegment(pt(0.4, 0.025), pt(0.44, 0.125), 8, true);
    addWarSegment(pt(0.48, 0.025), pt(0.44, 0.125), 8, true);

    // Ribbed Handguard (u: -0.02 to +0.36)
    addWarSegment(pt(-0.02, 0.055), pt(0.36, 0.055), 18, true);
    addWarSegment(pt(-0.02, -0.05), pt(0.36, -0.05), 18, true);
    addWarSegment(pt(0.36, 0.055), pt(0.36, -0.05), 6, true);
    for (let ribU = 0.04; ribU <= 0.32; ribU += 0.056) {
      addWarSegment(pt(ribU, 0.052), pt(ribU, -0.048), 5, false);
    }

    // Upper & Lower Receiver + Carry Handle / Top Rail (u: -0.40 to -0.02)
    addWarSegment(pt(-0.38, 0.095), pt(-0.04, 0.095), 14, true); // top optic rail
    addWarSegment(pt(-0.4, 0.055), pt(-0.02, 0.055), 16, true);
    addWarSegment(pt(-0.4, -0.065), pt(-0.02, -0.065), 16, true);
    addWarSegment(pt(-0.4, 0.055), pt(-0.4, -0.065), 6, true);

    // Angled Pistol Grip (pointing down-back, -v)
    addWarSegment(pt(-0.36, -0.065), pt(-0.44, -0.24), 10, true);
    addWarSegment(pt(-0.27, -0.065), pt(-0.35, -0.24), 10, true);
    addWarSegment(pt(-0.44, -0.24), pt(-0.35, -0.24), 6, true);

    // Curved Magazine (pointing down-forward, -v)
    addWarSegment(pt(-0.18, -0.065), pt(-0.13, -0.26), 10, true);
    addWarSegment(pt(-0.08, -0.065), pt(-0.02, -0.25), 10, true);
    addWarSegment(pt(-0.13, -0.26), pt(-0.02, -0.25), 6, true);

    // M4 Buttstock Triangle (u: -0.78 to -0.40)
    addWarSegment(pt(-0.4, 0.055), pt(-0.78, 0.055), 16, true);
    addWarSegment(pt(-0.4, -0.03), pt(-0.78, -0.2), 18, true);
    addWarSegment(pt(-0.78, 0.055), pt(-0.78, -0.2), 12, true);
    // Inner stock sling cutout
    addWarSegment(pt(-0.56, 0.015), pt(-0.72, 0.015), 8, false);
    addWarSegment(pt(-0.72, 0.015), pt(-0.72, -0.11), 8, false);
    addWarSegment(pt(-0.56, 0.015), pt(-0.72, -0.11), 8, false);
  }

  // 4) Fill remaining War nodes with dotted World Map inside the reticle backdrop
  let attempts = 0;
  while (warPts.length < TOTAL && attempts < 12000) {
    attempts++;
    const lat = (rand() - 0.5) * 145;
    const lon = (rand() - 0.5) * 170; // front hemisphere centered on Atlantic/Europe/Africa/Americas/Asia
    if (isWorldLand(lat, lon) || attempts > 10500) {
      const v = latLonToSphere(lat, lon, 0.86);
      if (v.z > 0) {
        warPts.push({
          v: { x: v.x, y: v.y, z: -0.16 },
          bright: false
        });
      }
    }
  }

  for (let i = 0; i < TOTAL; i++) {
    const b = brainPts[i % brainPts.length];
    const w = worldPts[i % worldPts.length];
    const wa = warPts[i % warPts.length];

    // Full-page 3D scatter vector for dramatic spread-and-combine transitions
    const sTheta = i * 2.39996323;
    const sPhi = Math.acos(1 - (2 * (i + 0.5)) / TOTAL);
    const sRadius = 1.45 + ((i * 0.6180339887) % 1) * 1.95;
    const spread: Vec3 = {
      x: Math.sin(sPhi) * Math.cos(sTheta) * sRadius * 1.4,
      y: Math.cos(sPhi) * sRadius * 0.95,
      z: Math.sin(sPhi) * Math.sin(sTheta) * sRadius
    };

    nodes.push({
      brain: b.v,
      world: w.v,
      war: wa.v,
      spread,
      size: b.bright || w.bright || wa.bright ? 1.55 : 0.85,
      bright: b.bright || w.bright || wa.bright,
      phase: (i * 0.37) % (Math.PI * 2)
    });
  }

  return { nodes, edges };
}

// Module-level cached geometry: builds 12,000 polygon points once for the entire session
let cachedHologramGeometry: { nodes: NodeData[]; edges: EdgePair[] } | null = null;
function getHologramGeometry(): { nodes: NodeData[]; edges: EdgePair[] } {
  if (!cachedHologramGeometry) {
    cachedHologramGeometry = buildHologramGeometry();
  }
  return cachedHologramGeometry;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const ParticlePresenceCanvas: React.FC<ParticlePresenceCanvasProps> = ({
  activeShape
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetShapeRef = useRef(activeShape);
  targetShapeRef.current = activeShape;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const tier = detectGraphicsTier();
    const tierConfig = getTierConfig(tier);
    const dpr = tierConfig.dpr;
    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;
    let canvasRect = { left: 0, top: 0, width: 1, height: 1 };

    const updateRect = () => {
      const rect = canvas.getBoundingClientRect();
      canvasRect = {
        left: rect.left,
        top: rect.top,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height)
      };
    };

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateRect();
    };
    resize();

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId && !document.hidden) {
            lastTimestamp = performance.now();
            animId = window.requestAnimationFrame(draw);
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const handleVisibility = () => {
      if (document.hidden) {
        if (animId) {
          window.cancelAnimationFrame(animId);
          animId = 0;
        }
      } else if (isVisible && !animId) {
        lastTimestamp = performance.now();
        animId = window.requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e: MouseEvent) => {
      const nx = ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
      const ny = ((e.clientY - canvasRect.top) / canvasRect.height) * 2 - 1;
      pointer.targetX = Math.max(-1, Math.min(1, nx));
      pointer.targetY = Math.max(-1, Math.min(1, ny));
    };
    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateRect, { passive: true });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    const { nodes, edges } = getHologramGeometry();
    const COUNT = nodes.length;
    const projX = new Float32Array(COUNT);
    const projY = new Float32Array(COUNT);
    const projDepth = new Float32Array(COUNT);
    const projZ = new Float32Array(COUNT);

    const stars = Array.from({ length: 65 }, (_, i) => ({
      x: (i * 0.6180339887) % 1,
      y: (i * 1.324717957) % 1,
      r: 0.5 + (i % 3) * 0.35,
      alpha: 0.1 + (i % 4) * 0.06,
      twinkle: i * 0.7
    }));

    // Subtle orbiting digital-network motes for the War & Conflict hologram
    const warMotes = Array.from({ length: 44 }, (_, i) => ({
      angle: (i / 44) * Math.PI * 2,
      radius: 0.42 + ((i * 0.6180339887) % 1) * 0.74,
      speed: (i % 2 === 0 ? 1 : -1) * (0.14 + (i % 5) * 0.04),
      size: 0.8 + (i % 3) * 0.35,
      isWhite: i % 4 === 0,
      phase: i * 0.85
    }));

    let fromShape = targetShapeRef.current;
    let toShape = targetShapeRef.current;
    let transitionProgress = 1;
    let lastTimestamp = performance.now();
    const startTime = lastTimestamp;

    const getShapeVec = (node: NodeData, shapeIdx: number): Vec3 => {
      if (shapeIdx === 0) return node.brain;
      if (shapeIdx === 1) return node.world;
      return node.war;
    };

    const draw = (now: number) => {
      if (!isVisible || document.hidden) {
        animId = 0;
        return;
      }
      if (tierConfig.targetFps < 60 && now - lastTimestamp < 1000 / tierConfig.targetFps - 2) {
        animId = window.requestAnimationFrame(draw);
        return;
      }
      const dt = Math.min(0.05, (now - lastTimestamp) / 1000);
      lastTimestamp = now;
      const t = (now - startTime) * 0.001;

      if (targetShapeRef.current !== toShape) {
        fromShape = transitionProgress >= 0.98 ? toShape : fromShape;
        toShape = targetShapeRef.current;
        transitionProgress = 0;
      }

      if (transitionProgress < 1) {
        transitionProgress = Math.min(1, transitionProgress + dt / 1.55);
      }

      const morphEased = easeInOutCubic(transitionProgress);
      const spreadAmt =
        transitionProgress < 1 ? Math.pow(Math.sin(transitionProgress * Math.PI), 1.25) : 0;

      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, width, height);

      // Ambient stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const sx = s.x * width + pointer.x * -10;
        const sy = s.y * height + pointer.y * -8;
        const a = s.alpha * (0.65 + 0.35 * Math.sin(t * 1.4 + s.twinkle));
        ctx.fillStyle = i % 5 === 0 ? `rgba(239, 68, 68, ${a})` : `rgba(255, 255, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const cx = width * 0.5;
      const cy = height * 0.47;
      const scaleBase = Math.min(width, height) * 0.39;

      // Holographic concentric base rings underneath Brain & World Globe (matching Images 1 & 2)
      const baseRingOpacity =
        toShape === 2 ? Math.max(0, 1 - morphEased) : 1 - spreadAmt * 0.7;
      if (baseRingOpacity > 0.04) {
        const baseY = cy + scaleBase * 1.06;
        const ringRadii = [scaleBase * 0.95, scaleBase * 0.68, scaleBase * 0.42];
        for (let r = 0; r < ringRadii.length; r++) {
          ctx.beginPath();
          ctx.ellipse(cx, baseY, ringRadii[r], ringRadii[r] * 0.16, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(239, 68, 68, ${(0.28 + r * 0.12) * baseRingOpacity})`;
          ctx.lineWidth = r === 2 ? 1.4 : 0.85;
          ctx.stroke();
        }
        // Center hologram emitter glow
        const grad = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, scaleBase * 0.5);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.42 * baseRingOpacity})`);
        grad.addColorStop(0.3, `rgba(239, 68, 68, ${0.35 * baseRingOpacity})`);
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, baseY, scaleBase * 0.5, scaleBase * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Controlled 3D rotation
      const isWarTarget = toShape === 2 && morphEased > 0.5;
      const warWeight =
        toShape === 2 ? morphEased : fromShape === 2 ? 1 - morphEased : 0;
      const warMotionActive = warWeight > 0.05 && !prefersReducedMotion;

      // Controlled 3D rotation & subtle centered floating/breathing for War symbol
      const isBrainTarget = toShape === 0 && morphEased > 0.5;
      const rotY = isWarTarget
        ? prefersReducedMotion
          ? 0
          : Math.sin(t * 0.45) * 0.1 + pointer.x * 0.16
        : isBrainTarget
        ? Math.sin(t * 0.45) * 0.35 + pointer.x * 0.45
        : -0.35 + t * 0.18 + pointer.x * 0.5;
      const rotX = isWarTarget
        ? prefersReducedMotion
          ? 0
          : 0.04 + Math.sin(t * 0.5) * 0.03 + pointer.y * 0.12
        : 0.16 + Math.sin(t * 0.3) * 0.04 + pointer.y * 0.22;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Stable inertial orbital plane orientation (smooth, elegant ellipse wrapping Earth)
      const orbitRotY = prefersReducedMotion ? -0.12 : -0.12 + Math.sin(t * 0.12) * 0.04 + pointer.x * 0.22;
      const orbitRotX = prefersReducedMotion ? 0.12 : 0.12 + pointer.y * 0.12;
      const cosOY = Math.cos(orbitRotY);
      const sinOY = Math.sin(orbitRotY);
      const cosOX = Math.cos(orbitRotX);
      const sinOX = Math.sin(orbitRotX);

      // Smooth neon pulse, holographic vertical scan beam, and subtle floating breath
      const neonPulse = warMotionActive ? 0.5 + 0.5 * Math.sin(t * 1.85) : 0.5;
      const scanY = warMotionActive ? Math.sin(t * 1.1) * 1.05 : 99;
      const warFloatY = warMotionActive ? Math.sin(t * 1.35) * 0.022 * warWeight : 0;
      const warBreathScale = warMotionActive ? 1 + Math.sin(t * 1.35) * 0.012 * warWeight : 1;

      const fov = 640;

      for (let i = 0; i < COUNT; i++) {
        const node = nodes[i];
        const a = getShapeVec(node, fromShape);
        const b = getShapeVec(node, toShape);

        let lx = a.x * (1 - morphEased) + b.x * morphEased;
        let ly = a.y * (1 - morphEased) + b.y * morphEased;
        let lz = a.z * (1 - morphEased) + b.z * morphEased;

        if (warWeight > 0.05) {
          lx *= warBreathScale;
          ly = ly * warBreathScale + warFloatY;
          lz *= warBreathScale;
          // Subtle living particle drift along the War symbol without altering silhouette
          if (warMotionActive && spreadAmt < 0.05) {
            const drift = 0.0045 * warWeight;
            lx += Math.sin(t * 2.1 + node.phase) * drift;
            ly += Math.cos(t * 1.9 + node.phase * 1.3) * drift;
          }
        }

        if (spreadAmt > 0.001 && !prefersReducedMotion) {
          const swirl = spreadAmt * 0.85;
          const sx = node.spread.x * Math.cos(swirl) - node.spread.z * Math.sin(swirl);
          const sz = node.spread.x * Math.sin(swirl) + node.spread.z * Math.cos(swirl);
          lx += sx * spreadAmt;
          ly += node.spread.y * spreadAmt;
          lz += sz * spreadAmt;
        }

        // Earth surface nodes use Earth spin; outside orbital nodes use inertial orbit frame
        const isOrbit = toShape === 1 && i >= 2060;
        const cY = isOrbit ? cosOY : cosY;
        const sY = isOrbit ? sinOY : sinY;
        const cX = isOrbit ? cosOX : cosX;
        const sX = isOrbit ? sinOX : sinX;

        const rx1 = lx * cY + lz * sY;
        const rz1 = -lx * sY + lz * cY;
        const ry2 = -ly * cX - rz1 * sX;
        const rz2 = -ly * sX + rz1 * cX;

        const depth = fov / (fov + rz2 * scaleBase + scaleBase * 0.55);
        projX[i] = cx + rx1 * scaleBase * depth;
        projY[i] = cy + ry2 * scaleBase * depth;
        projDepth[i] = depth;
        projZ[i] = rz2;
      }

      // Additive holographic glow pass for wireframe edges & bright nodes
      ctx.globalCompositeOperation = 'lighter';

      const edgeVisibility =
        transitionProgress > 0.52 ? Math.min(1, (transitionProgress - 0.52) / 0.48) : 0;

      if (edgeVisibility > 0.02) {
        const edgeLimit = Math.min(edges.length, tierConfig.maxEdges);

        // Pass 1: Standard crimson connective mesh (Batched into 1 draw call)
        ctx.beginPath();
        ctx.strokeStyle = `rgba(185, 28, 28, ${Math.min(0.65, 0.28 * edgeVisibility * (warMotionActive ? 0.8 + neonPulse * 0.3 : 1))})`;
        ctx.lineWidth = 0.65;
        for (let e = 0; e < edgeLimit; e++) {
          const edge = edges[e];
          if (edge.shape !== toShape || edge.bright) continue;

          const da = projDepth[edge.a];
          const db = projDepth[edge.b];
          if (da < 0.45 || db < 0.45) continue;

          // For World Globe: cull back-facing edges ONLY for surface nodes (< 2060)
          // Outside orbital ring edges (>= 2060) connect all the way around the back side of Earth!
          const isSurface = edge.a < 2060 || edge.b < 2060;
          if (toShape === 1 && isSurface && projZ[edge.a] < -0.05 && projZ[edge.b] < -0.05) continue;

          ctx.moveTo(projX[edge.a], projY[edge.a]);
          ctx.lineTo(projX[edge.b], projY[edge.b]);
        }
        ctx.stroke();

        // Pass 2: Bright highlight synapse pulses & perimeter lines (Batched into 1 draw call)
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 45, 45, ${Math.min(0.98, 0.85 * edgeVisibility * (warMotionActive ? 0.8 + neonPulse * 0.4 : 1))})`;
        ctx.lineWidth = toShape === 1 ? 1.4 : warMotionActive ? 1.3 : 1.0;
        for (let e = 0; e < edgeLimit; e++) {
          const edge = edges[e];
          if (edge.shape !== toShape || !edge.bright) continue;

          const da = projDepth[edge.a];
          const db = projDepth[edge.b];
          if (da < 0.45 || db < 0.45) continue;

          // For World Globe: cull back-facing edges
          if (toShape === 1 && projZ[edge.a] < -0.05 && projZ[edge.b] < -0.05) continue;

          ctx.moveTo(projX[edge.a], projY[edge.a]);
          ctx.lineTo(projX[edge.b], projY[edge.b]);
        }
        ctx.stroke();
      }

      // World Globe Dedicated Motion Layers: Outer Atmospheric Corona, Rim Silhouette & Satellite Beacon
      if (toShape === 1 && edgeVisibility > 0.05) {
        const globeWeight = edgeVisibility * (toShape === 1 ? morphEased : 1 - morphEased);
        const globeR = GLOBE_R * scaleBase * (fov / (fov + scaleBase * 0.55));

        // 1. Luminous outer atmospheric corona
        const coronaGrad = ctx.createRadialGradient(cx, cy, globeR * 0.94, cx, cy, globeR * 1.07);
        coronaGrad.addColorStop(0, 'rgba(255, 37, 37, 0)');
        coronaGrad.addColorStop(0.5, `rgba(255, 45, 45, ${0.28 * globeWeight})`);
        coronaGrad.addColorStop(0.85, `rgba(255, 25, 25, ${0.14 * globeWeight})`);
        coronaGrad.addColorStop(1, 'rgba(255, 20, 20, 0)');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, globeR * 1.07, 0, Math.PI * 2);
        ctx.fill();

        // 2. Crisp neon red planetary boundary circle
        ctx.beginPath();
        ctx.arc(cx, cy, globeR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 45, 45, ${0.58 * globeWeight})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // 3. Crown illumination at top of the globe
        const crownGrad = ctx.createRadialGradient(cx, cy - globeR * 0.96, 0, cx, cy - globeR * 0.96, globeR * 0.35);
        crownGrad.addColorStop(0, `rgba(255, 140, 140, ${0.45 * globeWeight})`);
        crownGrad.addColorStop(0.45, `rgba(255, 40, 40, ${0.22 * globeWeight})`);
        crownGrad.addColorStop(1, 'rgba(255, 30, 30, 0)');
        ctx.fillStyle = crownGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, globeR, Math.PI, 0);
        ctx.fill();

        // 4. Glowing Satellite Beacons on the Orbital Rings (matches Target Image)
        // Beacon 1: Prominent lower-right orbital node on Orbit 1
        const satAngle1 = -0.65 + Math.sin(t * 0.25) * 0.15;
        const sR1 = 1.24;
        const sx0 = Math.cos(satAngle1) * sR1;
        const sz0 = Math.sin(satAngle1) * sR1;
        const sy1 = -sz0 * Math.sin(0.40);
        const sz1 = sz0 * Math.cos(0.40);
        const sx2 = sx0 * Math.cos(-0.38) - sy1 * Math.sin(-0.38);
        const sy2 = sx0 * Math.sin(-0.38) + sy1 * Math.cos(-0.38);

        const srx1 = sx2 * cosOY + sz1 * sinOY;
        const srz1 = -sx2 * sinOY + sz1 * cosOY;
        const sry2 = -sy2 * cosOX - srz1 * sinOX;
        const srz2 = -sy2 * sinOX + srz1 * cosOX;

        const sDepth1 = fov / (fov + srz2 * scaleBase + scaleBase * 0.55);
        const satScreenX = cx + srx1 * scaleBase * sDepth1;
        const satScreenY = cy + sry2 * scaleBase * sDepth1;
        const satFlare = (0.8 + 0.2 * Math.sin(t * 3.2)) * globeWeight;

        const satGrad = ctx.createRadialGradient(satScreenX, satScreenY, 0, satScreenX, satScreenY, 18);
        satGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * satFlare})`);
        satGrad.addColorStop(0.25, `rgba(255, 45, 45, ${0.88 * satFlare})`);
        satGrad.addColorStop(0.65, `rgba(255, 25, 25, ${0.35 * satFlare})`);
        satGrad.addColorStop(1, 'rgba(255, 20, 20, 0)');
        ctx.fillStyle = satGrad;
        ctx.beginPath();
        ctx.arc(satScreenX, satScreenY, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${0.98 * satFlare})`;
        ctx.beginPath();
        ctx.arc(satScreenX, satScreenY, 2.6, 0, Math.PI * 2);
        ctx.fill();

        // Beacon 2: Subtle secondary node on the left arc
        const satAngle2 = Math.PI - 0.45 + Math.sin(t * 0.2) * 0.12;
        const sx0_2 = Math.cos(satAngle2) * sR1;
        const sz0_2 = Math.sin(satAngle2) * sR1;
        const sy1_2 = -sz0_2 * Math.sin(0.40);
        const sz1_2 = sz0_2 * Math.cos(0.40);
        const sx2_2 = sx0_2 * Math.cos(-0.38) - sy1_2 * Math.sin(-0.38);
        const sy2_2 = sx0_2 * Math.sin(-0.38) + sy1_2 * Math.cos(-0.38);

        const srx1_2 = sx2_2 * cosOY + sz1_2 * sinOY;
        const srz1_2 = -sx2_2 * sinOY + sz1_2 * cosOY;
        const sry2_2 = -sy2_2 * cosOX - srz1_2 * sinOX;
        const srz2_2 = -sy2_2 * sinOX + srz1_2 * cosOX;

        const sDepth2 = fov / (fov + srz2_2 * scaleBase + scaleBase * 0.55);
        const sat2X = cx + srx1_2 * scaleBase * sDepth2;
        const sat2Y = cy + sry2_2 * scaleBase * sDepth2;

        const satGrad2 = ctx.createRadialGradient(sat2X, sat2Y, 0, sat2X, sat2Y, 10);
        satGrad2.addColorStop(0, `rgba(255, 255, 255, ${0.85 * globeWeight})`);
        satGrad2.addColorStop(0.35, `rgba(255, 45, 45, ${0.65 * globeWeight})`);
        satGrad2.addColorStop(1, 'rgba(255, 20, 20, 0)');
        ctx.fillStyle = satGrad2;
        ctx.beginPath();
        ctx.arc(sat2X, sat2Y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * globeWeight})`;
        ctx.beginPath();
        ctx.arc(sat2X, sat2Y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // War Symbol Dedicated Motion Layers: Radar Ring Sweep, Holographic Scan Beam & Network Motes
      if (toShape === 2 && edgeVisibility > 0.15) {
        const layerAlpha = edgeVisibility * warWeight;
        const warCenterY = cy - warFloatY * scaleBase;
        const ringR = scaleBase * 1.06 * warBreathScale * (fov / (fov + scaleBase * 0.55));

        if (warMotionActive) {
          // 1. Continuous Radar Ring Scanning Light + Slow Rotating Inner Tick Dots (4 markers stay fixed)
          const sweepAngle = t * 0.72;
          const sweepArc = 0.78;
          const sweepGrad = ctx.createLinearGradient(
            cx + Math.cos(sweepAngle) * ringR,
            warCenterY + Math.sin(sweepAngle) * ringR,
            cx + Math.cos(sweepAngle - sweepArc) * ringR,
            warCenterY + Math.sin(sweepAngle - sweepArc) * ringR
          );
          sweepGrad.addColorStop(0, `rgba(255, 255, 255, ${0.55 * layerAlpha})`);
          sweepGrad.addColorStop(0.35, `rgba(239, 68, 68, ${0.65 * layerAlpha})`);
          sweepGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.strokeStyle = sweepGrad;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.arc(cx, warCenterY, ringR, sweepAngle - sweepArc, sweepAngle);
          ctx.stroke();

          // Subtle rotating inner radar ticks (kept inside outer ring, never disturbing 4 fixed crosshairs)
          const tickRot = t * 0.18;
          ctx.fillStyle = `rgba(239, 68, 68, ${0.42 * layerAlpha})`;
          for (let k = 0; k < 24; k++) {
            const ang = tickRot + (k / 24) * Math.PI * 2;
            const tx = cx + Math.cos(ang) * ringR * 0.91;
            const ty = warCenterY + Math.sin(ang) * ringR * 0.91;
            ctx.beginPath();
            ctx.arc(tx, ty, k % 3 === 0 ? 1.35 : 0.8, 0, Math.PI * 2);
            ctx.fill();
          }

          // 2. Smooth Holographic Horizontal Scan Beam clipped inside the circular ring
          const scanScreenY = warCenterY - scanY * scaleBase * 0.92;
          const dyFromCenter = scanScreenY - warCenterY;
          if (Math.abs(dyFromCenter) < ringR * 0.94) {
            const halfSpan = Math.sqrt(Math.max(0, ringR * ringR * 0.88 - dyFromCenter * dyFromCenter));
            const beamGrad = ctx.createLinearGradient(cx - halfSpan, scanScreenY, cx + halfSpan, scanScreenY);
            beamGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
            beamGrad.addColorStop(0.5, `rgba(255, 160, 160, ${0.34 * layerAlpha})`);
            beamGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.strokeStyle = beamGrad;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(cx - halfSpan, scanScreenY);
            ctx.lineTo(cx + halfSpan, scanScreenY);
            ctx.stroke();
          }

          // 3. Tiny Digital-Network Red & White Particles + Subtle Neighbor Connections
          for (let m = 0; m < warMotes.length; m++) {
            const mote = warMotes[m];
            const ang = mote.angle + t * mote.speed;
            const mr = mote.radius * ringR;
            const mx = cx + Math.cos(ang) * mr;
            const my = warCenterY + Math.sin(ang) * mr * 0.94;
            const mAlpha = (0.35 + 0.35 * Math.sin(t * 2.6 + mote.phase)) * layerAlpha;

            ctx.fillStyle = mote.isWhite
              ? `rgba(255, 255, 255, ${mAlpha})`
              : `rgba(239, 68, 68, ${mAlpha})`;
            ctx.beginPath();
            ctx.arc(mx, my, mote.size, 0, Math.PI * 2);
            ctx.fill();

            if (m > 0 && m % 3 === 0) {
              const prev = warMotes[m - 1];
              const pAng = prev.angle + t * prev.speed;
              const px = cx + Math.cos(pAng) * prev.radius * ringR;
              const py = warCenterY + Math.sin(pAng) * prev.radius * ringR * 0.94;
              const dx = mx - px;
              const dy = my - py;
              if (dx * dx + dy * dy < ringR * ringR * 0.16) {
                ctx.strokeStyle = `rgba(239, 68, 68, ${mAlpha * 0.32})`;
                ctx.lineWidth = 0.55;
                ctx.beginPath();
                ctx.moveTo(mx, my);
                ctx.lineTo(px, py);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Holographic particle nodes (Adaptive sampling & batched high-performance rendering)
      const nodeStep = tierConfig.nodeSamplingStep;

      // Pass 1: Standard crimson nodes (Batched into 1 draw call)
      ctx.beginPath();
      ctx.fillStyle = toShape === 1 ? 'rgba(255, 37, 37, 0.82)' : 'rgba(239, 68, 68, 0.72)';
      for (let i = 0; i < COUNT; i += nodeStep) {
        if (nodes[i].bright) continue;
        const depth = projDepth[i];
        if (depth <= 0.28) continue;
        const z = projZ[i];
        if (toShape === 1 && i < 2060 && z < -0.06) continue;
        const r = toShape === 1
          ? Math.max(0.72, (z < 0 ? 0.6 : 0.88) * depth)
          : Math.max(0.65, nodes[i].size * depth * 0.72);
        ctx.moveTo(projX[i] + r, projY[i]);
        ctx.arc(projX[i], projY[i], r, 0, Math.PI * 2);
      }
      ctx.fill();

      // Pass 2: Soft red halo around bright nodes (Batched into 1 draw call)
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 45, 45, ${toShape === 1 ? 0.58 : toShape === 2 && warMotionActive ? 0.45 : 0.4})`;
      for (let i = 0; i < COUNT; i += nodeStep) {
        if (!nodes[i].bright) continue;
        const depth = projDepth[i];
        if (depth <= 0.28) continue;
        const z = projZ[i];
        // Only cull backface for surface nodes; outside orbital nodes (>= 2060) connect all the way around!
        if (toShape === 1 && i < 2060 && z < -0.04) continue;
        const isOrbitBack = toShape === 1 && i >= 2060 && z < 0;
        const r = toShape === 1
          ? Math.max(0.75, (isOrbitBack ? 0.85 : 1.1) * depth)
          : Math.max(0.7, nodes[i].size * depth * 0.76);
        ctx.moveTo(projX[i] + r * 2.3, projY[i]);
        ctx.arc(projX[i], projY[i], r * 2.3, 0, Math.PI * 2);
      }
      ctx.fill();

      // Pass 3: White-hot synapse cores (Batched into 1 draw call)
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
      for (let i = 0; i < COUNT; i += nodeStep) {
        if (!nodes[i].bright) continue;
        const depth = projDepth[i];
        if (depth <= 0.28) continue;
        const z = projZ[i];
        // Only cull backface for surface nodes; outside orbital nodes (>= 2060) connect all the way around!
        if (toShape === 1 && i < 2060 && z < -0.04) continue;
        const isOrbitBack = toShape === 1 && i >= 2060 && z < 0;
        const r = toShape === 1
          ? Math.max(0.75, (isOrbitBack ? 0.85 : 1.1) * depth)
          : Math.max(0.7, nodes[i].size * depth * 0.76);
        ctx.moveTo(projX[i] + r * 0.85, projY[i]);
        ctx.arc(projX[i], projY[i], r * 0.85, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      animId = window.requestAnimationFrame(draw);
    };

    animId = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateRect);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block pointer-events-none"
      aria-hidden="true"
    />
  );
};
