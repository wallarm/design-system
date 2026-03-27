import type { BadgeColor } from '../Badge/types';
import type { ChartColor } from './types';

export const CHART_COLORS: Record<ChartColor, string> = {
  brand: 'var(--color-bg-fill-brand)',
  blue: 'var(--color-bg-fill-info)',
  green: 'var(--color-bg-fill-success)',
  red: 'var(--color-bg-fill-danger)',
  amber: 'var(--color-bg-fill-warning)',
  purple: 'var(--color-bg-fill-ai)',
  slate: 'var(--color-slate-400)',
  teal: 'var(--color-teal-500)',
  cyan: 'var(--color-cyan-500)',
  indigo: 'var(--color-indigo-500)',
  pink: 'var(--color-pink-500)',
  rose: 'var(--color-rose-500)',
};

export const CHART_BADGE_COLORS: Record<ChartColor, BadgeColor> = {
  brand: 'w-orange',
  blue: 'blue',
  green: 'green',
  red: 'red',
  amber: 'amber',
  purple: 'violet',
  slate: 'slate',
  teal: 'teal',
  cyan: 'cyan',
  indigo: 'indigo',
  pink: 'pink',
  rose: 'rose',
};
