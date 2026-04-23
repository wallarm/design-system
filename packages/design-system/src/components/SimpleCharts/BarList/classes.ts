import { cva } from 'class-variance-authority';

export const barListRootClasses = ['flex flex-col w-full pb-2'].join(' ');

export const barListItemVariants = cva(
  [
    'group/bar-list-item',
    'relative flex items-center w-full h-32 px-12 gap-8',
    'transition-colors',
    'outline-none',
    'hover:bg-states-primary-hover',
  ].join(' '),
  {
    variants: {
      interactive: {
        true: [
          'cursor-pointer',
          'focus-visible:bg-states-primary-hover',
          'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-primary',
        ].join(' '),
        false: '',
      },
      selected: {
        true: 'bg-states-primary-active',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
      selected: false,
    },
  },
);

/**
 * Bar fill classes.
 *
 * Each `color` variant renders a 16% alpha overlay of the palette's `500` hue —
 * matching the default slate bar (`bg-states-primary-pressed` = slate-500 @ 16%).
 * Translucent fills let the row's hover / focus tint layer through the bar so the
 * row background stays legible during interaction.
 *
 * Callers may pass any Tailwind `bg-*` utility via `className` to override the palette
 * (`tailwind-merge` resolves the conflict in favour of the explicit class). Prefer the
 * same `/16` alpha modifier for visual consistency with the built-in palette, e.g.
 * `<BarListBar className='bg-sky-500/16' />`.
 */
export const barListBarVariants = cva(
  [
    'absolute left-8 top-1/2 -translate-y-1/2',
    'h-24 rounded-6',
    'origin-left',
    'transition-[width] duration-300 ease-out',
    'starting:w-0',
  ].join(' '),
  {
    variants: {
      color: {
        brand: 'bg-w-orange-500/16',
        blue: 'bg-blue-500/16',
        green: 'bg-green-500/16',
        red: 'bg-red-500/16',
        amber: 'bg-amber-500/16',
        purple: 'bg-purple-500/16',
        slate: 'bg-states-primary-pressed',
        teal: 'bg-teal-500/16',
        cyan: 'bg-cyan-500/16',
        indigo: 'bg-indigo-500/16',
        pink: 'bg-pink-500/16',
        rose: 'bg-rose-500/16',
      },
    },
    defaultVariants: {
      color: 'slate',
    },
  },
);

export const barListLabelClasses = [
  'relative flex-1 min-w-0',
  'text-xs font-mono text-text-primary',
  'truncate',
  'pointer-events-none',
].join(' ');

export const barListValueClasses = [
  'relative shrink-0',
  'flex items-baseline gap-4',
  'text-xs font-mono font-medium text-text-primary',
  'pointer-events-none',
].join(' ');

export const barListPercentVariants = cva(
  ['inline-block text-right min-w-32', 'font-medium'].join(' '),
  {
    variants: {
      variant: {
        split: 'text-text-primary',
        muted: 'text-text-secondary',
        inherit: 'text-inherit',
      },
    },
    defaultVariants: {
      variant: 'split',
    },
  },
);

export const barListPercentSymbolVariants = cva('', {
  variants: {
    variant: {
      split: 'text-text-secondary',
      muted: '',
      inherit: '',
    },
  },
  defaultVariants: {
    variant: 'split',
  },
});

export const barListSkeletonRowClasses = ['relative h-32 w-full', 'flex items-center px-8'].join(
  ' ',
);
