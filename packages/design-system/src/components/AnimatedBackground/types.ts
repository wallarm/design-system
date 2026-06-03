export type Texture = 'clean' | 'halftone';

export interface EngineOptions {
  texture: Texture;
  /** Grid cell size in px. */
  spacing: number;
  /** Seconds for one L→R sweep pass. */
  sweepPeriod: number;
  /** How far from the scan line (px) dots react. */
  bloomRadius: number;
  /** Minimum seconds between accent events. */
  anomalyInterval: number;
  /** Global opacity multiplier (0–1). */
  intensity: number;
  /** Peak alpha of bloomed dots before `intensity`. */
  bloomAlpha: number;
  /** Halftone only: cap on a bloomed pixel's edge length (px). */
  maxDotSize: number;
  /** Sweep-line tilt in degrees (0 = vertical). */
  tilt: number;
  /** CSS custom-property names resolved at runtime. */
  dotColorVar: string;
  accentColorVar: string;
  baseColorVar: string;
}
