import { cva } from 'class-variance-authority';
import type { ProgressColor } from './types';

const progressColorMap: Record<ProgressColor, string> = {
  slate: 'bg-badge-slate-strong',
  red: 'bg-badge-red-strong',
  'w-orange': 'bg-badge-w-orange-strong',
  amber: 'bg-badge-amber-strong',
  yellow: 'bg-badge-yellow-strong',
  lime: 'bg-badge-lime-strong',
  green: 'bg-badge-green-strong',
  emerald: 'bg-badge-emerald-strong',
  teal: 'bg-badge-teal-strong',
  cyan: 'bg-badge-cyan-strong',
  sky: 'bg-badge-sky-strong',
  blue: 'bg-badge-blue-strong',
  indigo: 'bg-badge-indigo-strong',
  violet: 'bg-badge-violet-strong',
  fuchsia: 'bg-badge-fuchsia-strong',
  pink: 'bg-badge-pink-strong',
  rose: 'bg-badge-rose-strong',
  gray: 'bg-badge-gray-strong',
  zinc: 'bg-badge-zinc-strong',
  neutral: 'bg-badge-neutral-strong',
  stone: 'bg-badge-stone-strong',
};

const trackColorMap: Record<ProgressColor, string> = {
  slate: 'bg-badge-slate-light',
  red: 'bg-badge-red-light',
  'w-orange': 'bg-badge-w-orange-light',
  amber: 'bg-badge-amber-light',
  yellow: 'bg-badge-yellow-light',
  lime: 'bg-badge-lime-light',
  green: 'bg-badge-green-light',
  emerald: 'bg-badge-emerald-light',
  teal: 'bg-badge-teal-light',
  cyan: 'bg-badge-cyan-light',
  sky: 'bg-badge-sky-light',
  blue: 'bg-badge-blue-light',
  indigo: 'bg-badge-indigo-light',
  violet: 'bg-badge-violet-light',
  fuchsia: 'bg-badge-fuchsia-light',
  pink: 'bg-badge-pink-light',
  rose: 'bg-badge-rose-light',
  gray: 'bg-badge-gray-light',
  zinc: 'bg-badge-zinc-light',
  neutral: 'bg-badge-neutral-light',
  stone: 'bg-badge-stone-light',
};

export const progressTrackVariants = cva('relative w-full overflow-hidden', {
  variants: {
    size: {
      sm: 'h-4 rounded-2',
      md: 'h-8 rounded-4',
      lg: 'h-12 rounded-6',
    },
    color: trackColorMap,
  },
  defaultVariants: {
    size: 'md',
    color: 'w-orange',
  },
});

export const progressRangeVariants = cva('h-full transition-all duration-300 ease-out', {
  variants: {
    size: {
      sm: 'rounded-2',
      md: 'rounded-4',
      lg: 'rounded-6',
    },
    color: progressColorMap,
  },
  defaultVariants: {
    size: 'md',
    color: 'w-orange',
  },
});
