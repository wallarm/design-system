import { cva } from 'class-variance-authority';

export const lineChartRootClasses = ['relative w-full flex flex-col min-h-0'].join(' ');

// `min-h-0` lets the body shrink inside a flex parent — without it recharts
// measures 0 height and bails on the first render.
// `[&_*]:outline-none` suppresses the browser focus outline that recharts'
// SVG path/active-dot pick up on click; the body is `aria-hidden` and never
// in the tab order.
export const lineChartBodyClasses = ['relative flex-1 min-h-0 min-w-0', '[&_*]:outline-none'].join(
  ' ',
);

// `recharts-wrapper` carries an inline `cursor: default`; Tailwind's `!`
// modifier wins the inline-style cascade so the crosshair reaches the wrapper
// (otherwise the cursor only changes in the 1px gap between body and wrapper).
export const lineChartBodyZoomEnabledClasses = [
  'select-none',
  '[&_.recharts-wrapper]:cursor-crosshair!',
].join(' ');

// `top`/`left` are applied inline so the popover tracks each mousemove frame.
export const lineChartZoomCursorPopoverClasses = ['fixed z-30 pointer-events-none'].join(' ');

// `[&:last-child]:pb-8` adds breathing room when the legend is placed below
// the body (last JSX child of `<LineChart>`); otherwise it sits ~2px from the
// chart's bottom border.
export const lineChartLegendVariants = cva('flex', {
  variants: {
    orientation: {
      horizontal: 'flex-row flex-wrap items-center gap-6 pl-12 py-2 [&:last-child]:pb-8',
      vertical: 'flex-col gap-6 px-12 py-2 max-w-160',
    },
    align: {
      start: '',
      center: '',
      end: '',
    },
  },
  compoundVariants: [
    { orientation: 'horizontal', align: 'start', class: 'justify-start' },
    { orientation: 'horizontal', align: 'center', class: 'justify-center' },
    { orientation: 'horizontal', align: 'end', class: 'justify-end' },
    { orientation: 'vertical', align: 'start', class: 'items-start' },
    { orientation: 'vertical', align: 'center', class: 'items-center' },
    { orientation: 'vertical', align: 'end', class: 'items-end' },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    align: 'start',
  },
});

export const lineChartLegendItemVariants = cva(
  [
    'group/line-chart-legend-item',
    'relative flex items-center gap-4 px-4 py-2',
    'rounded-4',
    'transition-colors',
    'outline-none',
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
      active: {
        true: 'bg-states-primary-hover',
        false: 'hover:bg-states-primary-hover',
      },
      selected: {
        true: '',
        false: 'opacity-40',
      },
      dimmed: {
        true: 'opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
      active: false,
      selected: true,
      dimmed: false,
    },
  },
);

export const lineChartHoverPopoverClasses = [
  'bg-bg-surface-2 border border-border-primary-light rounded-12 shadow-md',
  'px-12 py-8 min-w-160',
  'flex flex-col gap-4',
  'pointer-events-none',
].join(' ');

export const lineChartHoverPopoverTimestampClasses = ['text-xs font-medium text-text-primary'].join(
  ' ',
);

export const lineChartHoverPopoverRowClasses = [
  'relative h-16 w-full pl-12',
  'flex items-center gap-8',
  'text-xs font-mono text-text-primary',
].join(' ');

export const lineChartHoverPopoverRowDotClasses = ['absolute left-0 top-4'].join(' ');

export const lineChartHoverPopoverRowLabelClasses = ['truncate min-w-0', 'font-normal'].join(' ');

export const lineChartHoverPopoverRowValueClasses = ['ml-auto shrink-0', 'font-medium'].join(' ');

export const lineChartHoverPopoverDotClasses = ['inline-block size-8 rounded-2'].join(' ');

export const lineChartZoomPopoverClasses = [
  'bg-bg-surface-2 border border-border-primary-light rounded-12 shadow-md',
  'px-12 py-8 min-w-160',
  'flex flex-col gap-8',
].join(' ');

export const lineChartZoomPopoverRangeClasses = [
  'text-xs font-medium text-text-primary',
  'whitespace-nowrap',
].join(' ');

export const lineChartZoomPopoverConfirmClasses = [
  'inline-flex items-center justify-center',
  'h-24 px-8 w-full',
  'rounded-8',
  'bg-states-brand-default-alt text-text-brand',
  'text-sm font-medium',
  'transition-colors',
  'outline-none',
  'hover:bg-states-brand-hover',
  'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-brand',
].join(' ');

// Shifts the popover up by half its own height so the y-coordinate recharts
// hands us is the popover's visual centre — paired with the plot-area centre
// anchor in `<LineChartTooltip>` so the popover stays vertically locked
// between peaks and valleys.
export const lineChartTooltipCenterClasses = '-translate-y-1/2';

export const lineChartEmptyRootClasses = ['relative w-full'].join(' ');

export const lineChartEmptyMessageClasses = [
  'absolute top-0 left-0 right-0 flex items-center justify-center',
].join(' ');

// Opaque pill matching the chart card surface so the dashed grid line behind
// the message reads as broken rather than crossing through the text.
export const lineChartEmptyMessageTextClasses = [
  'px-8 bg-bg-surface-1',
  'text-xs font-mono text-text-secondary',
].join(' ');
