import React, { useEffect, useRef } from 'react';

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

// Detailed continent coastline polygons (lat, lon) for a crisp recognizable World Globe
const CONTINENT_POLYS: [number, number][][] = [
  // North America
  [
    [70, -162], [71, -130], [68, -95], [62, -75], [53, -56], [44, -66],
    [35, -75], [25, -80], [29, -90], [21, -97], [15, -88], [9, -79],
    [15, -93], [22, -106], [32, -117], [48, -125], [60, -148], [65, -166]
  ],
  // Greenland
  [
    [82, -32], [76, -18], [68, -28], [60, -44], [68, -53], [78, -68]
  ],
  // South America
  [
    [11, -74], [10, -62], [2, -50], [-6, -35], [-18, -39], [-34, -53],
    [-46, -66], [-55, -68], [-45, -74], [-22, -70], [-5, -81], [5, -77]
  ],
  // Europe
  [
    [36, -9], [43, -9], [48, -4], [52, 4], [58, 6], [70, 20], [69, 40],
    [56, 38], [46, 30], [41, 28], [38, 22], [40, 16], [44, 8], [37, -2]
  ],
  // Africa
  [
    [35, -6], [37, 10], [31, 32], [20, 38], [12, 51], [0, 42], [-15, 40],
    [-34, 26], [-34, 18], [-18, 12], [-4, 9], [5, 2], [5, -8], [15, -17], [28, -13]
  ],
  // Asia + Middle East + India
  [
    [40, 28], [42, 42], [68, 42], [73, 85], [70, 135], [62, 165],
    [52, 142], [40, 128], [31, 121], [22, 114], [12, 109], [16, 98],
    [22, 90], [8, 77], [23, 68], [25, 56], [13, 44], [28, 34]
  ],
  // Australia
  [
    [-12, 130], [-14, 142], [-26, 153], [-38, 148], [-35, 136], [-34, 115], [-21, 114]
  ]
];

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
    if (pointInPoly(lat, lon, CONTINENT_POLYS[i])) return true;
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
  // SHAPE 1: 3D HOLOGRAPHIC WORLD GLOBE + ORBITAL RINGS (matches Image 2)
  // ===========================================================================
  const worldPts: { v: Vec3; bright: boolean }[] = [];
  const landIndices: number[] = [];

  // 1) Continent Coastline Outlines (360 crisp perimeter nodes + edges)
  for (let p = 0; p < CONTINENT_POLYS.length; p++) {
    const poly = CONTINENT_POLYS[p];
    const polyStart = worldPts.length;
    let count = 0;
    for (let k = 0; k < poly.length; k++) {
      const [la1, lo1] = poly[k];
      const [la2, lo2] = poly[(k + 1) % poly.length];
      const steps = 6;
      for (let st = 0; st < steps; st++) {
        if (worldPts.length >= 420) break;
        const f = st / steps;
        const v = latLonToSphere(la1 + (la2 - la1) * f, lo1 + (lo2 - lo1) * f, 0.94);
        landIndices.push(worldPts.length);
        worldPts.push({ v, bright: st === 0 });
        if (count > 0) {
          edges.push({ a: worldPts.length - 2, b: worldPts.length - 1, shape: 1, bright: true });
        }
        count++;
      }
    }
    if (count > 2) {
      edges.push({ a: worldPts.length - 1, b: polyStart, shape: 1, bright: true });
    }
  }

  // 2) Interior Landmass Triangulated Network + Ocean Sphere Grid (up to 1,840)
  while (worldPts.length < 1840) {
    const idx = worldPts.length - 420;
    const n = 1420;
    const gy = 1 - ((idx + 0.5) / n) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - gy * gy));
    const theta = idx * 2.39996323;
    const gx = Math.cos(theta) * rad;
    const gz = Math.sin(theta) * rad;
    const lat = Math.asin(gy) * (180 / Math.PI);
    const lon = Math.atan2(gx, gz) * (180 / Math.PI);
    const land = isWorldLand(lat, lon);
    const r = land ? 0.935 : 0.91;
    if (land) landIndices.push(worldPts.length);
    worldPts.push({
      v: { x: gx * r, y: gy * r, z: gz * r },
      bright: land && idx % 3 === 0
    });
  }

  // Connect nearby landmass nodes into a glowing red triangulated web
  for (let i = 0; i < landIndices.length; i += 2) {
    const aIdx = landIndices[i];
    const va = worldPts[aIdx].v;
    let linked = 0;
    for (let j = i + 1; j < Math.min(landIndices.length, i + 45); j++) {
      const bIdx = landIndices[j];
      const vb = worldPts[bIdx].v;
      const dx = va.x - vb.x;
      const dy = va.y - vb.y;
      const dz = va.z - vb.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < 0.048) {
        edges.push({ a: aIdx, b: bIdx, shape: 1, bright: linked === 0 });
        linked++;
        if (linked >= 2) break;
      }
    }
  }

  // 3) Three Tilted Orbital Satellite Rings (360 nodes = 3 rings x 120 nodes)
  const orbitTilts = [
    { rx: 0.42, rz: 0.25, r: 1.24 },
    { rx: -0.38, rz: -0.32, r: 1.3 },
    { rx: 0.15, rz: -0.58, r: 1.18 }
  ];
  for (let o = 0; o < orbitTilts.length; o++) {
    const cfg = orbitTilts[o];
    const ringStart = worldPts.length;
    for (let k = 0; k < 120; k++) {
      const ang = (k / 120) * Math.PI * 2;
      const x0 = Math.cos(ang) * cfg.r;
      const z0 = Math.sin(ang) * cfg.r;
      const y1 = -z0 * Math.sin(cfg.rx);
      const z1 = z0 * Math.cos(cfg.rx);
      const x2 = x0 * Math.cos(cfg.rz) - y1 * Math.sin(cfg.rz);
      const y2 = x0 * Math.sin(cfg.rz) + y1 * Math.cos(cfg.rz);
      worldPts.push({ v: { x: x2, y: y2, z: z1 }, bright: k % 24 === 0 });
      if (k > 0) edges.push({ a: ringStart + k - 1, b: ringStart + k, shape: 1, bright: true });
    }
    edges.push({ a: ringStart + 119, b: ringStart, shape: 1, bright: true });
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
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

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    const { nodes, edges } = buildHologramGeometry();
    const COUNT = nodes.length;
    const projX = new Float32Array(COUNT);
    const projY = new Float32Array(COUNT);
    const projDepth = new Float32Array(COUNT);

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
        : t * 0.32 + pointer.x * 0.5;
      const rotX = isWarTarget
        ? prefersReducedMotion
          ? 0
          : 0.04 + Math.sin(t * 0.5) * 0.03 + pointer.y * 0.12
        : 0.12 + Math.sin(t * 0.4) * 0.06 + pointer.y * 0.28;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

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

        const rx1 = lx * cosY + lz * sinY;
        const rz1 = -lx * sinY + lz * cosY;
        const ry2 = -ly * cosX - rz1 * sinX;
        const rz2 = -ly * sinX + rz1 * cosX;

        const depth = fov / (fov + rz2 * scaleBase + scaleBase * 0.55);
        projX[i] = cx + rx1 * scaleBase * depth;
        projY[i] = cy + ry2 * scaleBase * depth;
        projDepth[i] = depth;
      }

      // Additive holographic glow pass for wireframe edges & bright nodes
      ctx.globalCompositeOperation = 'lighter';

      const edgeVisibility =
        transitionProgress > 0.52 ? Math.min(1, (transitionProgress - 0.52) / 0.48) : 0;

      if (edgeVisibility > 0.02) {
        for (let e = 0; e < edges.length; e++) {
          const edge = edges[e];
          if (edge.shape !== toShape) continue;

          const da = projDepth[edge.a];
          const db = projDepth[edge.b];
          if (da < 0.45 || db < 0.45) continue;

          const avgD = (da + db) * 0.5;
          let alpha =
            Math.max(0.08, Math.min(edge.bright ? 0.65 : 0.28, (avgD - 0.5) * 0.8)) *
            edgeVisibility;
          let lineW = edge.bright ? 1.05 : 0.6;

          if (toShape === 2 && warMotionActive) {
            // Smooth neon glow pulse + holographic scanline illumination on edges
            const nodeY = nodes[edge.a].war.y;
            const scanHit = Math.max(0, 1 - Math.abs(nodeY - scanY) / 0.18);
            alpha *= 0.8 + neonPulse * 0.45 + scanHit * 0.55;
            lineW += neonPulse * 0.35 + scanHit * 0.45;
          }

          ctx.strokeStyle = edge.bright
            ? `rgba(239, 68, 68, ${Math.min(0.95, alpha)})`
            : `rgba(185, 28, 28, ${Math.min(0.7, alpha)})`;
          ctx.lineWidth = lineW;

          ctx.beginPath();
          ctx.moveTo(projX[edge.a], projY[edge.a]);
          ctx.lineTo(projX[edge.b], projY[edge.b]);
          ctx.stroke();
        }
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

      // Holographic particle nodes (crimson glow + white-hot synapse/vertex cores)
      for (let i = 0; i < COUNT; i++) {
        const depth = projDepth[i];
        if (depth <= 0.28) continue;

        const node = nodes[i];
        const pulse = node.bright
          ? prefersReducedMotion
            ? 0.88
            : 0.78 + 0.22 * Math.sin(t * 3.5 + node.phase)
          : 0.65;
        let alpha = Math.max(0.18, Math.min(0.95, (depth - 0.48) * 1.45)) * pulse;
        let r = Math.max(0.6, node.size * depth * 0.72);

        if (toShape === 2 && warMotionActive) {
          const scanHit = Math.max(0, 1 - Math.abs(node.war.y - scanY) / 0.16);
          alpha = Math.min(1, alpha * (0.85 + neonPulse * 0.3 + scanHit * 0.6));
          r *= 1 + scanHit * 0.32;
        }

        if (node.bright) {
          // Soft red halo around bright node
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha * (toShape === 2 && warMotionActive ? 0.42 + neonPulse * 0.16 : 0.42)})`;
          ctx.beginPath();
          ctx.arc(projX[i], projY[i], r * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // White-hot core
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(projX[i], projY[i], r * 0.85, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle =
            i % 3 === 0
              ? `rgba(239, 68, 68, ${alpha * 0.85})`
              : `rgba(252, 165, 165, ${alpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(projX[i], projY[i], r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      animId = window.requestAnimationFrame(draw);
    };

    animId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('resize', resize);
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
