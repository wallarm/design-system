import { cva } from 'class-variance-authority';

export const horizontalBarStackRootClasses = ['flex flex-col w-full'].join(' ');

export const horizontalBarStackBarWrapperClasses = ['px-16 py-8 w-full'].join(' ');

export const horizontalBarStackBarClasses = ['flex h-8 w-full overflow-hidden rounded-4'].join(' ');

export const horizontalBarStackRemainderClasses = ['bg-bg-strong-primary'].join(' ');

export const horizontalBarStackLegendClasses = [
  'flex flex-row flex-wrap items-center gap-6 px-12 py-2',
].join(' ');

export const horizontalBarStackLegendDotClasses = ['inline-block size-8 rounded-2 shrink-0'].join(
  ' ',
);

export const horizontalBarStackLegendLabelClasses = ['text-xs font-mono text-text-primary'].join(
  ' ',
);

// Segment opacity mirrors PieChart's slice dim: only the active (or selected) series stays
// bright; the rest fade to 30%. Hover wins over selection.
export const horizontalBarStackSegmentVariants = cva('h-full min-w-px transition-opacity', {
  variants: {
    dimmed: { true: 'opacity-30', false: 'opacity-100' },
  },
  defaultVariants: { dimmed: false },
});

// Legend-item state treatment mirrors PieChart's legend row (same tokens): hover/active →
// states-primary-hover, selected → states-primary-active, dimmed → opacity-60, plus the
// focus-visible ring when interactive.
export const horizontalBarStackLegendItemVariants = cva(
  ['inline-flex items-center gap-4 px-4 py-2 rounded-4', 'transition-colors outline-none'].join(
    ' ',
  ),
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
      active: { true: 'bg-states-primary-hover', false: 'hover:bg-states-primary-hover' },
      selected: { true: 'bg-states-primary-active', false: '' },
      dimmed: { true: 'opacity-60', false: '' },
    },
    defaultVariants: { interactive: false, active: false, selected: false, dimmed: false },
  },
);

// Neutralise the dark DS TooltipContent surface (bg / padding / radius / clip) so the shared
// white `ChartHoverCard` rendered inside it is the only visible surface. twMerge lets these win.
export const horizontalBarStackTooltipClasses = [
  'bg-transparent p-0 shadow-none rounded-none overflow-visible',
].join(' ');
