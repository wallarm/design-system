import type { ChartColor } from '../types';

export const FUNNEL_BAND_HEIGHT = 172;
export const FUNNEL_INSET = 4;
export const FUNNEL_MAX_BODY = 140;
export const FUNNEL_MIN_BODY = 4;

/** Halo growth per side in px, outer first (drawn first). */
export const FUNNEL_HALOS = [12, 6] as const;
export const FUNNEL_HALO_OPACITY = { 12: 0.16, 6: 0.32 } as const;

export type FunnelColor = Exclude<ChartColor, 'slate'>;
export type FunnelStart = 'tint' | 'gray';

/** Palette steps per step count; dark mode uses `1000 − step`. */
export const FUNNEL_RAMP: Record<2 | 3 | 4 | 5 | 6, readonly number[]> = {
  2: [500, 600],
  3: [400, 500, 600],
  4: [400, 500, 600, 700],
  5: [300, 400, 500, 600, 700],
  6: [200, 300, 400, 500, 600, 700],
};
