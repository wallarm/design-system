import type { FunnelColor, FunnelShade } from './constants';

/**
 * Step column width, shared by the `FunnelStep` `<li>` and the `FunnelSkeleton` columns. The ribbon
 * splits the same track into equal columns itself (`FunnelRibbon`), so keep columns equal.
 */
export const funnelColumnClasses = 'flex-1 min-w-120';

// Hover dimming: 30% (`LINE_INACTIVE_OPACITY`, as in PieChart / HorizontalBarStack), 150ms ease-out.
// Entrance: `--funnel-i` is the step index; steps follow one another 120ms apart. Fill mode
// `backwards`, not `both`: a kept end frame would pin opacity / transform and beat the dimming.

/** A ribbon segment `<g>`: grows from its start edge, vertically centred; fades when another step is active. */
export const funnelBandClasses = [
  'origin-left [transform-box:fill-box]',
  'animate-[ds-funnel-band-in_600ms_cubic-bezier(0.85,0,0.15,1)_backwards]',
  '[animation-delay:calc(var(--funnel-i,0)*120ms)]',
  'transition-opacity duration-150 ease-out data-dimmed:opacity-30',
  // Set on the ribbon once the last band is in: resizes remount the shapes, the entrance must not replay.
  'in-data-entered:animate-none',
  'motion-reduce:animate-none motion-reduce:transition-none',
].join(' ');

/** On a step cell: its labels fade in 250ms after their band starts and fade when another step is active. */
export const funnelCellContentClasses = [
  '*:animate-[ds-chart-fade-in_350ms_ease-out_backwards]',
  '*:[animation-delay:calc(var(--funnel-i,0)*120ms_+_250ms)]',
  '*:transition-opacity *:duration-150 *:ease-out data-dimmed:*:opacity-30',
  'motion-reduce:*:animate-none motion-reduce:*:transition-none',
].join(' ');

/**
 * Ribbon fill per hue and light-theme shade; the dark theme flips to `1000 − shade`.
 * Written out in full on purpose: Tailwind only emits the palette variables it sees used
 * as utilities, so a `var(--color-teal-600)` built at runtime resolves to nothing and the
 * band paints black. Put these on a `<g>`/`<path>`, not the `<svg>` — the unlayered
 * `svg:not([fill])` reset would win there.
 */
export const funnelFillClasses: Record<FunnelColor, Record<FunnelShade, string>> = {
  brand: {
    200: 'fill-w-orange-200 in-data-[theme=dark]:fill-w-orange-800',
    300: 'fill-w-orange-300 in-data-[theme=dark]:fill-w-orange-700',
    400: 'fill-w-orange-400 in-data-[theme=dark]:fill-w-orange-600',
    500: 'fill-w-orange-500 in-data-[theme=dark]:fill-w-orange-500',
    600: 'fill-w-orange-600 in-data-[theme=dark]:fill-w-orange-400',
    700: 'fill-w-orange-700 in-data-[theme=dark]:fill-w-orange-300',
  },
  blue: {
    200: 'fill-blue-200 in-data-[theme=dark]:fill-blue-800',
    300: 'fill-blue-300 in-data-[theme=dark]:fill-blue-700',
    400: 'fill-blue-400 in-data-[theme=dark]:fill-blue-600',
    500: 'fill-blue-500 in-data-[theme=dark]:fill-blue-500',
    600: 'fill-blue-600 in-data-[theme=dark]:fill-blue-400',
    700: 'fill-blue-700 in-data-[theme=dark]:fill-blue-300',
  },
  red: {
    200: 'fill-red-200 in-data-[theme=dark]:fill-red-800',
    300: 'fill-red-300 in-data-[theme=dark]:fill-red-700',
    400: 'fill-red-400 in-data-[theme=dark]:fill-red-600',
    500: 'fill-red-500 in-data-[theme=dark]:fill-red-500',
    600: 'fill-red-600 in-data-[theme=dark]:fill-red-400',
    700: 'fill-red-700 in-data-[theme=dark]:fill-red-300',
  },
  green: {
    200: 'fill-green-200 in-data-[theme=dark]:fill-green-800',
    300: 'fill-green-300 in-data-[theme=dark]:fill-green-700',
    400: 'fill-green-400 in-data-[theme=dark]:fill-green-600',
    500: 'fill-green-500 in-data-[theme=dark]:fill-green-500',
    600: 'fill-green-600 in-data-[theme=dark]:fill-green-400',
    700: 'fill-green-700 in-data-[theme=dark]:fill-green-300',
  },
  amber: {
    200: 'fill-amber-200 in-data-[theme=dark]:fill-amber-800',
    300: 'fill-amber-300 in-data-[theme=dark]:fill-amber-700',
    400: 'fill-amber-400 in-data-[theme=dark]:fill-amber-600',
    500: 'fill-amber-500 in-data-[theme=dark]:fill-amber-500',
    600: 'fill-amber-600 in-data-[theme=dark]:fill-amber-400',
    700: 'fill-amber-700 in-data-[theme=dark]:fill-amber-300',
  },
  purple: {
    200: 'fill-purple-200 in-data-[theme=dark]:fill-purple-800',
    300: 'fill-purple-300 in-data-[theme=dark]:fill-purple-700',
    400: 'fill-purple-400 in-data-[theme=dark]:fill-purple-600',
    500: 'fill-purple-500 in-data-[theme=dark]:fill-purple-500',
    600: 'fill-purple-600 in-data-[theme=dark]:fill-purple-400',
    700: 'fill-purple-700 in-data-[theme=dark]:fill-purple-300',
  },
  teal: {
    200: 'fill-teal-200 in-data-[theme=dark]:fill-teal-800',
    300: 'fill-teal-300 in-data-[theme=dark]:fill-teal-700',
    400: 'fill-teal-400 in-data-[theme=dark]:fill-teal-600',
    500: 'fill-teal-500 in-data-[theme=dark]:fill-teal-500',
    600: 'fill-teal-600 in-data-[theme=dark]:fill-teal-400',
    700: 'fill-teal-700 in-data-[theme=dark]:fill-teal-300',
  },
  cyan: {
    200: 'fill-cyan-200 in-data-[theme=dark]:fill-cyan-800',
    300: 'fill-cyan-300 in-data-[theme=dark]:fill-cyan-700',
    400: 'fill-cyan-400 in-data-[theme=dark]:fill-cyan-600',
    500: 'fill-cyan-500 in-data-[theme=dark]:fill-cyan-500',
    600: 'fill-cyan-600 in-data-[theme=dark]:fill-cyan-400',
    700: 'fill-cyan-700 in-data-[theme=dark]:fill-cyan-300',
  },
  indigo: {
    200: 'fill-indigo-200 in-data-[theme=dark]:fill-indigo-800',
    300: 'fill-indigo-300 in-data-[theme=dark]:fill-indigo-700',
    400: 'fill-indigo-400 in-data-[theme=dark]:fill-indigo-600',
    500: 'fill-indigo-500 in-data-[theme=dark]:fill-indigo-500',
    600: 'fill-indigo-600 in-data-[theme=dark]:fill-indigo-400',
    700: 'fill-indigo-700 in-data-[theme=dark]:fill-indigo-300',
  },
  pink: {
    200: 'fill-pink-200 in-data-[theme=dark]:fill-pink-800',
    300: 'fill-pink-300 in-data-[theme=dark]:fill-pink-700',
    400: 'fill-pink-400 in-data-[theme=dark]:fill-pink-600',
    500: 'fill-pink-500 in-data-[theme=dark]:fill-pink-500',
    600: 'fill-pink-600 in-data-[theme=dark]:fill-pink-400',
    700: 'fill-pink-700 in-data-[theme=dark]:fill-pink-300',
  },
  rose: {
    200: 'fill-rose-200 in-data-[theme=dark]:fill-rose-800',
    300: 'fill-rose-300 in-data-[theme=dark]:fill-rose-700',
    400: 'fill-rose-400 in-data-[theme=dark]:fill-rose-600',
    500: 'fill-rose-500 in-data-[theme=dark]:fill-rose-500',
    600: 'fill-rose-600 in-data-[theme=dark]:fill-rose-400',
    700: 'fill-rose-700 in-data-[theme=dark]:fill-rose-300',
  },
};

/** Gray start: the first step in slate/300 (slate/700 on dark). */
export const funnelGrayFillClasses = 'fill-slate-300 in-data-[theme=dark]:fill-slate-700';
