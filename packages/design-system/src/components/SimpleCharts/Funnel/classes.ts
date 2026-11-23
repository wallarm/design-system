import { cva } from 'class-variance-authority';
import type { ChartColor } from '../types';
import type { FunnelShade } from './constants';

export const funnelRootClasses = 'flex w-full overflow-hidden';

// One step: the title cell, then its slice of the ribbon, then the 16px bottom gap.
// The divider is the column's own left edge, drawn over the ribbon, from the top of
// the title row to the bottom of the card. The first column has none.
export const funnelStepClasses = [
  'relative flex min-w-120 flex-1 basis-0 flex-col pb-16',
  'not-first:after:pointer-events-none not-first:after:absolute not-first:after:inset-y-0 not-first:after:left-0',
  'not-first:after:w-px not-first:after:bg-border-primary-light',
].join(' ');

// The title row is always 100px tall; the cell inside hugs its content.
export const funnelStepTitleRowClasses = 'flex h-100 shrink-0 items-start';

export const funnelStepTitleVariants = cva(
  'relative flex w-full min-w-0 flex-col items-start gap-2 px-12 pt-8 pb-12 text-left',
  {
    variants: {
      interactive: {
        // The tint and the focus ring sit on a pseudo-element inset 6px left and right,
        // 2px top and bottom — the Figma `funnel-section-title` hover shape.
        true: [
          'cursor-pointer outline-none',
          'before:absolute before:inset-x-6 before:inset-y-2 before:rounded-10 before:transition-colors',
          'hover:before:bg-states-primary-hover',
          'focus-visible:before:bg-states-primary-hover',
          'focus-visible:before:ring-2 focus-visible:before:ring-inset focus-visible:before:ring-focus-primary',
        ].join(' '),
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
    },
  },
);

export const funnelStepNameClasses =
  'relative w-full truncate font-sans-display text-xs text-text-secondary';

export const funnelStepValueRowClasses = 'relative flex w-full min-w-0 items-center gap-4';

// Figma `heading/xl/medium`.
export const funnelStepValueClasses =
  'min-w-0 truncate font-sans-display text-xl leading-xl tracking-xl font-medium text-text-primary tabular-nums';

export const funnelStepDeltaClasses = 'flex shrink-0 items-center';

export const funnelStepCaptionClasses =
  'relative w-full line-clamp-2 font-sans-display text-xs text-text-secondary';

export const funnelStepRibbonClasses = 'block h-172 w-full shrink-0';

/**
 * Ribbon fill per hue and palette shade. The dark theme flips every shade to 1000 minus
 * it (600 → 400, 200 → 800) with a plain `[data-theme=dark]` selector, so the chart needs
 * no ThemeProvider.
 *
 * The classes are written out in full on purpose: Tailwind only ships the palette
 * variables it sees used as utilities, so a `var(--color-cyan-600)` built at runtime
 * resolves to nothing and the shape paints black.
 *
 * Apply them to a `<g>`, not to the `<svg>`: the global `svg:not([fill])` reset is
 * unlayered and would win over a utility there.
 */
export const funnelFillClasses: Record<ChartColor, Record<FunnelShade, string>> = {
  brand: {
    200: 'fill-w-orange-200 [[data-theme=dark]_&]:fill-w-orange-800',
    300: 'fill-w-orange-300 [[data-theme=dark]_&]:fill-w-orange-700',
    400: 'fill-w-orange-400 [[data-theme=dark]_&]:fill-w-orange-600',
    500: 'fill-w-orange-500 [[data-theme=dark]_&]:fill-w-orange-500',
    600: 'fill-w-orange-600 [[data-theme=dark]_&]:fill-w-orange-400',
    700: 'fill-w-orange-700 [[data-theme=dark]_&]:fill-w-orange-300',
  },
  blue: {
    200: 'fill-blue-200 [[data-theme=dark]_&]:fill-blue-800',
    300: 'fill-blue-300 [[data-theme=dark]_&]:fill-blue-700',
    400: 'fill-blue-400 [[data-theme=dark]_&]:fill-blue-600',
    500: 'fill-blue-500 [[data-theme=dark]_&]:fill-blue-500',
    600: 'fill-blue-600 [[data-theme=dark]_&]:fill-blue-400',
    700: 'fill-blue-700 [[data-theme=dark]_&]:fill-blue-300',
  },
  green: {
    200: 'fill-green-200 [[data-theme=dark]_&]:fill-green-800',
    300: 'fill-green-300 [[data-theme=dark]_&]:fill-green-700',
    400: 'fill-green-400 [[data-theme=dark]_&]:fill-green-600',
    500: 'fill-green-500 [[data-theme=dark]_&]:fill-green-500',
    600: 'fill-green-600 [[data-theme=dark]_&]:fill-green-400',
    700: 'fill-green-700 [[data-theme=dark]_&]:fill-green-300',
  },
  red: {
    200: 'fill-red-200 [[data-theme=dark]_&]:fill-red-800',
    300: 'fill-red-300 [[data-theme=dark]_&]:fill-red-700',
    400: 'fill-red-400 [[data-theme=dark]_&]:fill-red-600',
    500: 'fill-red-500 [[data-theme=dark]_&]:fill-red-500',
    600: 'fill-red-600 [[data-theme=dark]_&]:fill-red-400',
    700: 'fill-red-700 [[data-theme=dark]_&]:fill-red-300',
  },
  amber: {
    200: 'fill-amber-200 [[data-theme=dark]_&]:fill-amber-800',
    300: 'fill-amber-300 [[data-theme=dark]_&]:fill-amber-700',
    400: 'fill-amber-400 [[data-theme=dark]_&]:fill-amber-600',
    500: 'fill-amber-500 [[data-theme=dark]_&]:fill-amber-500',
    600: 'fill-amber-600 [[data-theme=dark]_&]:fill-amber-400',
    700: 'fill-amber-700 [[data-theme=dark]_&]:fill-amber-300',
  },
  purple: {
    200: 'fill-purple-200 [[data-theme=dark]_&]:fill-purple-800',
    300: 'fill-purple-300 [[data-theme=dark]_&]:fill-purple-700',
    400: 'fill-purple-400 [[data-theme=dark]_&]:fill-purple-600',
    500: 'fill-purple-500 [[data-theme=dark]_&]:fill-purple-500',
    600: 'fill-purple-600 [[data-theme=dark]_&]:fill-purple-400',
    700: 'fill-purple-700 [[data-theme=dark]_&]:fill-purple-300',
  },
  slate: {
    200: 'fill-slate-200 [[data-theme=dark]_&]:fill-slate-800',
    300: 'fill-slate-300 [[data-theme=dark]_&]:fill-slate-700',
    400: 'fill-slate-400 [[data-theme=dark]_&]:fill-slate-600',
    500: 'fill-slate-500 [[data-theme=dark]_&]:fill-slate-500',
    600: 'fill-slate-600 [[data-theme=dark]_&]:fill-slate-400',
    700: 'fill-slate-700 [[data-theme=dark]_&]:fill-slate-300',
  },
  teal: {
    200: 'fill-teal-200 [[data-theme=dark]_&]:fill-teal-800',
    300: 'fill-teal-300 [[data-theme=dark]_&]:fill-teal-700',
    400: 'fill-teal-400 [[data-theme=dark]_&]:fill-teal-600',
    500: 'fill-teal-500 [[data-theme=dark]_&]:fill-teal-500',
    600: 'fill-teal-600 [[data-theme=dark]_&]:fill-teal-400',
    700: 'fill-teal-700 [[data-theme=dark]_&]:fill-teal-300',
  },
  cyan: {
    200: 'fill-cyan-200 [[data-theme=dark]_&]:fill-cyan-800',
    300: 'fill-cyan-300 [[data-theme=dark]_&]:fill-cyan-700',
    400: 'fill-cyan-400 [[data-theme=dark]_&]:fill-cyan-600',
    500: 'fill-cyan-500 [[data-theme=dark]_&]:fill-cyan-500',
    600: 'fill-cyan-600 [[data-theme=dark]_&]:fill-cyan-400',
    700: 'fill-cyan-700 [[data-theme=dark]_&]:fill-cyan-300',
  },
  indigo: {
    200: 'fill-indigo-200 [[data-theme=dark]_&]:fill-indigo-800',
    300: 'fill-indigo-300 [[data-theme=dark]_&]:fill-indigo-700',
    400: 'fill-indigo-400 [[data-theme=dark]_&]:fill-indigo-600',
    500: 'fill-indigo-500 [[data-theme=dark]_&]:fill-indigo-500',
    600: 'fill-indigo-600 [[data-theme=dark]_&]:fill-indigo-400',
    700: 'fill-indigo-700 [[data-theme=dark]_&]:fill-indigo-300',
  },
  pink: {
    200: 'fill-pink-200 [[data-theme=dark]_&]:fill-pink-800',
    300: 'fill-pink-300 [[data-theme=dark]_&]:fill-pink-700',
    400: 'fill-pink-400 [[data-theme=dark]_&]:fill-pink-600',
    500: 'fill-pink-500 [[data-theme=dark]_&]:fill-pink-500',
    600: 'fill-pink-600 [[data-theme=dark]_&]:fill-pink-400',
    700: 'fill-pink-700 [[data-theme=dark]_&]:fill-pink-300',
  },
  rose: {
    200: 'fill-rose-200 [[data-theme=dark]_&]:fill-rose-800',
    300: 'fill-rose-300 [[data-theme=dark]_&]:fill-rose-700',
    400: 'fill-rose-400 [[data-theme=dark]_&]:fill-rose-600',
    500: 'fill-rose-500 [[data-theme=dark]_&]:fill-rose-500',
    600: 'fill-rose-600 [[data-theme=dark]_&]:fill-rose-400',
    700: 'fill-rose-700 [[data-theme=dark]_&]:fill-rose-300',
  },
};

export const funnelEmptyClasses = 'flex min-h-288 w-full';
