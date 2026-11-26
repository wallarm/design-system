import { cva } from 'class-variance-authority';

export const pieChartRootClasses = ['relative flex flex-row items-start w-full'].join(' ');

export const pieChartDonutClasses = ['relative shrink-0 overflow-visible', 'px-24 py-8'].join(' ');

export const pieChartCenterClasses = [
  'pointer-events-none',
  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  'flex flex-col items-center text-center',
  'w-58',
].join(' ');

export const pieChartCenterValueClasses = [
  'font-mono font-medium text-text-primary',
  'text-base leading-sm',
  'w-full',
].join(' ');

export const pieChartCenterLabelClasses = [
  'font-mono font-normal text-text-secondary',
  'text-xs leading-xs',
  'w-full',
].join(' ');

export const pieChartLegendClasses = ['flex flex-1 min-w-0 flex-col', 'pt-0 pr-4 pb-0 pl-0'].join(
  ' ',
);

/**
 * A legend row is 32px and pressable whole, but its hover, focus and selected fill is a
 * 24px band centred in it (the BarList bar's height) that stops short of the card's
 * right edge: drawn full-height, the fifth row's fill touched the card's border. The
 * fill is a `::before` behind the row's content (`isolate` keeps it above the card).
 */
export const pieChartLegendItemVariants = cva(
  [
    'group/pie-chart-legend-item',
    'relative isolate flex items-center w-full h-32 px-8 gap-8',
    'rounded-8',
    'outline-none',
    "before:content-[''] before:absolute before:-z-1 before:inset-y-4 before:left-0 before:right-3",
    'before:rounded-6 before:transition-colors',
  ].join(' '),
  {
    variants: {
      interactive: {
        true: [
          'cursor-pointer',
          'focus-visible:before:bg-states-primary-hover',
          'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-primary',
        ].join(' '),
        false: '',
      },
      active: {
        true: 'before:bg-states-primary-hover',
        false: 'hover:before:bg-states-primary-hover',
      },
      selected: {
        true: 'before:bg-states-primary-active',
        false: '',
      },
      dimmed: {
        true: 'opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
      active: false,
      selected: false,
      dimmed: false,
    },
  },
);

export const pieChartLegendValueClasses = [
  'ml-auto shrink-0',
  'flex items-center gap-2',
  'text-xs font-mono font-medium text-text-primary',
  'whitespace-nowrap',
  'pointer-events-none',
].join(' ');

export const pieChartLegendPercentClasses = ['inline-flex items-center gap-2', 'font-medium'].join(
  ' ',
);

export const legendDotClasses = ['text-text-tertiary', 'leading-xs'].join(' ');

export const pieChartLegendPercentValueVariants = cva('inline-flex items-center', {
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
});

export const pieChartLegendPercentSymbolVariants = cva('', {
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

export const pieChartSkeletonRowClasses = ['relative h-24 w-full'].join(' ');
