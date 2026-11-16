/**
 * Graphics Quality Tiering Engine for GeoSentinel
 * Dynamically detects device capabilities to optimize Canvas 2D/3D performance
 * across budget mobile, tablets, and high-end desktop hardware.
 */

export type GraphicsTier = 'high' | 'balanced' | 'performance';

export interface TierConfig {
  tier: GraphicsTier;
  dpr: number;
  nodeSamplingStep: number;
  maxEdges: number;
  ribbonLayers: number;
  dropletCount: number;
  targetFps: number;
  batchDraw: boolean;
}

export function detectGraphicsTier(): GraphicsTier {
  if (typeof window === 'undefined') return 'high';

  // 1. Accessibility preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'performance';
  }

  const width = window.innerWidth;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // 2. Hardware metrics
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

  if (isMobile) {
    // Low-end/budget mobile: 4 or fewer CPU cores, or <= 3GB RAM
    if (cores <= 4 || memory <= 3) {
      return 'performance';
    }
    return 'balanced';
  }

  if (isTablet) {
    return cores >= 6 && memory >= 4 ? 'high' : 'balanced';
  }

  return 'high';
}

export function getTierConfig(tier: GraphicsTier): TierConfig {
  switch (tier) {
    case 'performance':
      return {
        tier: 'performance',
        dpr: 1.0,
        nodeSamplingStep: 3, // Sample ~730 nodes with crisp silhouette
        maxEdges: 700,
        ribbonLayers: 1,
        dropletCount: 12,
        targetFps: 40,
        batchDraw: true
      };
    case 'balanced':
      return {
        tier: 'balanced',
        dpr: 1.0,
        nodeSamplingStep: 2, // Sample ~1,100 nodes (high fidelity, zero stutter)
        maxEdges: 1600,
        ribbonLayers: 2,
        dropletCount: 22,
        targetFps: 60,
        batchDraw: true
      };
    case 'high':
    default:
      return {
        tier: 'high',
        dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1.5,
        nodeSamplingStep: 1, // Full 2,200 nodes
        maxEdges: 3500,
        ribbonLayers: 4,
        dropletCount: 50,
        targetFps: 60,
        batchDraw: true
      };
  }
}

