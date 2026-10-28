import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const segmentedControlVariants = cva(
  'flex items-center gap-0 overflow-visible rounded-12 bg-bg-primary p-4',
  {
    variants: {
      fullWidth: {
        true: 'w-full [&_label]:flex-1',
        false: 'w-fit',
      },
    },
    defaultVariants: {
      fullWidth: false,
    },
  },
);

export const segmentedControlIndicatorClassNames = cn(
  'top-(--top) left-(--left) h-(--height) w-(--width) rounded-8 bg-bg-surface-3 shadow-sm',
);

export const segmentedControlItemClassNamesBase = cn(
  'relative flex min-h-28 min-w-28 items-center justify-center gap-6 px-12 py-4',
  'cursor-pointer rounded-8 text-center font-sans text-sm font-medium transition-all',
  // Default state, unselected
  'bg-transparent text-text-secondary',
  // Focus state
  'focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:outline-none',
  'data-disabled:cursor-not-allowed data-disabled:opacity-50',
);
