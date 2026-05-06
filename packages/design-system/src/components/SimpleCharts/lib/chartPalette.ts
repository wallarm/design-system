import type { ChartColor } from '../types';

// Shared palette tokens for every member of `SimpleCharts/` (BarList strokes,
// PieChart slice fills, LineChart line strokes, legend dots, popover dots).
// `slate` intentionally maps to the badge "dark-alt" token so it reads as a
// legible mid-grey on white surfaces instead of disappearing into a neutral.
export const CHART_PALETTE_FILL: Record<ChartColor, string> = {
  brand: 'var(--color-w-orange-500)',
  blue: 'var(--color-blue-500)',
  green: 'var(--color-green-500)',
  red: 'var(--color-red-500)',
  amber: 'var(--color-amber-500)',
  purple: 'var(--color-purple-500)',
  slate: 'var(--color-badge-slate-dark-alt)',
  teal: 'var(--color-teal-500)',
  cyan: 'var(--color-cyan-500)',
  indigo: 'var(--color-indigo-500)',
  pink: 'var(--color-pink-500)',
  rose: 'var(--color-rose-500)',
};

/**
 * Resolve a chart colour to a CSS color string. A `ChartColor` palette key is
 * looked up in `CHART_PALETTE_FILL`; any other string is returned verbatim so
 * callers can pass `var(--color-violet-500)`, `#8b5cf6`, `oklch(…)`, etc.
 * Returns `undefined` only when `color` is undefined — the caller decides the
 * fallback (line/slice fall back to slate; popover dots stay transparent).
 */
export const resolveChartColor = (color: ChartColor | string | undefined): string | undefined => {
  if (color === undefined) return undefined;
  if (color in CHART_PALETTE_FILL) return CHART_PALETTE_FILL[color as ChartColor];
  return color;
};
