import type { ChartColor } from '../../types';
import { funnelFillClasses } from '../classes';
import {
  FUNNEL_ANCHOR_SHADE,
  FUNNEL_GRAY_START_SHADE,
  FUNNEL_MAX_STEPS,
  FUNNEL_TINT_RAMP,
  type FunnelShade,
} from '../constants';

export type FunnelStart = 'tint' | 'gray';

/**
 * Palette shades for a tint funnel of `count` steps. More than six steps is out of
 * range: the six-step ramp is used and the extra steps stay on its darkest shade.
 */
export const funnelTintShades = (count: number): FunnelShade[] => {
  if (count <= 0) return [];
  const ramp = FUNNEL_TINT_RAMP[Math.min(count, FUNNEL_MAX_STEPS)] ?? [FUNNEL_ANCHOR_SHADE];
  const last = ramp[ramp.length - 1] ?? FUNNEL_ANCHOR_SHADE;
  return Array.from({ length: count }, (_, index) => ramp[index] ?? last);
};

/** The fill classes of every step, in order. Palette primitives only, both themes. */
export const resolveFunnelFills = (
  color: ChartColor,
  count: number,
  start: FunnelStart = 'tint',
): string[] => {
  if (start === 'gray') {
    return Array.from({ length: Math.max(count, 0) }, (_, index) =>
      index === 0
        ? funnelFillClasses.slate[FUNNEL_GRAY_START_SHADE]
        : funnelFillClasses[color][FUNNEL_ANCHOR_SHADE],
    );
  }

  return funnelTintShades(count).map(shade => funnelFillClasses[color][shade]);
};
