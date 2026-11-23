import {
  FUNNEL_BAND_HEIGHT,
  FUNNEL_MAX_BODY,
  FUNNEL_MIN_BODY,
  FUNNEL_RAMP,
  type FunnelColor,
  type FunnelStart,
} from '../constants';

const MID = FUNNEL_BAND_HEIGHT / 2;

/** Body thickness in px per step, scaled to the largest value; never below the minimum. */
export const funnelThicknesses = (values: readonly number[]): number[] => {
  const safe = values.map(v => (Number.isFinite(v) && v > 0 ? v : 0));
  const max = Math.max(0, ...safe);
  if (max === 0) return safe.map(() => FUNNEL_MIN_BODY);
  return safe.map(v => Math.max(FUNNEL_MIN_BODY, (v / max) * FUNNEL_MAX_BODY));
};

/** Smooth segment path in a `0..1 × 0..172` viewBox, body centred and grown by `grow` px per side. */
export const funnelSegmentPath = (from: number, to: number, grow: number): string => {
  const a = from / 2 + grow;
  const b = to / 2 + grow;
  const [t0, t1, b1, b0] = [MID - a, MID - b, MID + b, MID + a].map(String);
  return `M0 ${t0}C0.45 ${t0} 0.55 ${t1} 1 ${t1}V${b1}C0.55 ${b1} 0.45 ${b0} 0 ${b0}Z`;
};

/** Light/dark fill per step. Dark mode mirrors the step (`1000 − step`). */
export const funnelStepFills = (
  count: number,
  color: FunnelColor,
  start: FunnelStart,
): { light: string; dark: string }[] => {
  const hue = color === 'brand' ? 'w-orange' : color;
  const ramp: readonly number[] =
    count <= 1
      ? [600]
      : count > 6
        ? [...FUNNEL_RAMP[6], ...Array.from({ length: count - 6 }, () => 700)]
        : FUNNEL_RAMP[count as 2 | 3 | 4 | 5 | 6];
  return ramp.map((step, i) => {
    const gray = start === 'gray' && i === 0;
    const h = gray ? 'slate' : hue;
    const s = gray ? 300 : start === 'gray' ? 600 : step;
    return { light: `var(--color-${h}-${s})`, dark: `var(--color-${h}-${1000 - s})` };
  });
};
