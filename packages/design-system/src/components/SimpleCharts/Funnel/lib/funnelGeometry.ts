import { funnelFillClasses, funnelGrayFillClasses } from '../classes';
import {
  FUNNEL_BAND_HEIGHT,
  FUNNEL_MAX_BODY,
  FUNNEL_MIN_BODY,
  FUNNEL_RAMP,
  type FunnelColor,
  type FunnelShade,
  type FunnelStart,
} from '../constants';

const MID = FUNNEL_BAND_HEIGHT / 2;

/** Negative or non-finite values count as 0. */
export const sanitizeFunnelValue = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : 0;

/** Body thickness in px per step, scaled to the largest value; never below the minimum. */
export const funnelThicknesses = (values: readonly number[]): number[] => {
  const safe = values.map(sanitizeFunnelValue);
  const max = Math.max(0, ...safe);
  if (max === 0) return safe.map(() => FUNNEL_MIN_BODY);
  return safe.map(v => Math.max(FUNNEL_MIN_BODY, (v / max) * FUNNEL_MAX_BODY));
};

/**
 * Smooth segment path over one column `x..x+width` of a 172px-high band, body centred and grown
 * by `grow` px per side. Defaults to a `0..1` column (the unit tests' frame).
 */
export const funnelSegmentPath = (
  from: number,
  to: number,
  grow: number,
  x = 0,
  width = 1,
): string => {
  const a = from / 2 + grow;
  const b = to / 2 + grow;
  const [t0, t1, b1, b0] = [MID - a, MID - b, MID + b, MID + a].map(String);
  // Flat tangents: control points at 45% / 55% of the column.
  const [c0, c1, x1] = [x + 0.45 * width, x + 0.55 * width, x + width].map(String);
  return `M${x} ${t0}C${c0} ${t0} ${c1} ${t1} ${x1} ${t1}V${b1}C${c1} ${b1} ${c0} ${b0} ${x} ${b0}Z`;
};

/** Fill classes per step (light + dark). Dark mode mirrors the shade (`1000 − shade`). */
export const funnelStepFills = (
  count: number,
  color: FunnelColor,
  start: FunnelStart,
): string[] => {
  const ramp: readonly FunnelShade[] =
    count <= 1
      ? [600]
      : count > 6
        ? [...FUNNEL_RAMP[6], ...Array.from({ length: count - 6 }, () => 700 as const)]
        : FUNNEL_RAMP[count as 2 | 3 | 4 | 5 | 6];
  return ramp.map((shade, i) => {
    if (start === 'tint') return funnelFillClasses[color][shade];
    return i === 0 ? funnelGrayFillClasses : funnelFillClasses[color][600];
  });
};
