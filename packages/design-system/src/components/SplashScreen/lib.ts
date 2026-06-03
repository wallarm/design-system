import type { CSSProperties } from 'react';
import type { ContentPhase, PhaseType, SplashScreenShrinkTarget } from './types';

export const SPLASH_PHASES: Record<ContentPhase, boolean> = {
  'enter-start': true,
  entered: true,
  'content-fading': true,
  exiting: true,
};

export function getContainerStyle(
  phase: PhaseType,
  shrinkTarget?: SplashScreenShrinkTarget,
): CSSProperties | undefined {
  if (!shrinkTarget) return undefined;

  const { width, height, borderRadius = 0 } = shrinkTarget;

  switch (phase) {
    case 'content-fading':
      return {
        clipPath: 'inset(0 0 round 0px)',
        transition: 'clip-path 500ms ease-in-out',
      };
    case 'shrinking':
      return {
        clipPath: `inset(calc(50% - ${height / 2}px) calc(50% - ${width / 2}px) round ${borderRadius}px)`,
        transition: 'clip-path 500ms ease-in-out',
      };
    case 'settled':
      return { width, height, borderRadius };
    default:
      return undefined;
  }
}
