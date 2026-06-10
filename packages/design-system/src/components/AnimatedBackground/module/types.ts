import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type Texture = 'clean' | 'halftone';

export interface AnimatedBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Content rendered centered above the animated canvas. */
  children?: ReactNode;
  /** Variant A (`clean`) vs Variant B (`halftone`). */
  texture?: Texture;
  /** Grid cell size in px. */
  spacing?: number;
  /** Seconds for one L->R sweep pass. */
  sweepPeriod?: number;
  /** How far from the scan line (px) dots react. */
  bloomRadius?: number;
  /** Minimum seconds between orange events. Higher = rarer. */
  anomalyInterval?: number;
  /** Global opacity/strength multiplier (0-1). */
  intensity?: number;
  /** Peak alpha of fully-bloomed (emphasized) dots, before intensity. */
  bloomAlpha?: number;
  /** Halftone only: cap on a bloomed pixel's full edge length (px). */
  maxDotSize?: number;
  /** Sweep-line tilt in degrees (0 = vertical; positive leans the top right). */
  tilt?: number;
  /** CSS custom-property name for the dot color. */
  dotColorVar?: string;
  /** CSS custom-property name for the "caught" accent. */
  accentColorVar?: string;
  /** CSS custom-property name for the base fill. */
  baseColorVar?: string;
  /** CSS custom-property name for the "neutralised" (caught) color. */
  caughtColorVar?: string;
  /** Force a single static frame (also auto-true under reduced motion). */
  paused?: boolean;
  /** Enable the interactive shooter easter egg (halftone only). Default: false. */
  game?: boolean;
  /** Card dimensions for spawn-exclusion when game is enabled. */
  excludeCardSize?: { width: number; height: number };
}

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
  /** CSS custom-property name for the "caught" (neutralised) color. */
  caughtColorVar: string;
}

export interface GameStats {
  /** Lifetime catches — drives the arming gate (≥ 5); reset only by exitGame. */
  kills: number;
  /** Threats stopped THIS round (HIT numerator). */
  stopped: number;
  /** Threats that timed out unshot THIS round. */
  escaped: number;
  /** Attacks spawned this round (caps at ROUND_ATTACKS). */
  spawned: number;
  /** Round complete — full wave spawned AND field cleared. */
  done: boolean;
}
