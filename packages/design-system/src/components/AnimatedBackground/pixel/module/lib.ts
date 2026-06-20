import type { EngineOptions } from './types';

export const resolveOptions = (): EngineOptions => ({
  texture: 'halftone',
  spacing: 16,
  sweepPeriod: 12.5,
  bloomRadius: 80,
  anomalyInterval: 1.4,
  intensity: 0.9,
  bloomAlpha: 0.2,
  maxDotSize: 20,
  tilt: 16,
  dotColorVar: '--animated-bg-dot',
  accentColorVar: '--animated-bg-accent-dot',
  baseColorVar: '--color-component-app-shell-bg',
  caughtColorVar: '--animated-bg-caught-dot',
});
