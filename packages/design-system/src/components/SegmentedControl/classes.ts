import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const segmentedControlVariants = cva(
  'flex bg-bg-primary p-4 gap-0 items-center rounded-12',
  {
    variants: {
      fullWidth: {
        true: 'w-full [&_label]:flex-1',
        false: '',
      },
    },
    defaultVariants: {
      fullWidth: false,
    },
  },
);

export const segmentedControlIndicatorClassNames = cn(
  'bg-bg-surface-3 rounded-8 shadow-sm w-(--width) h-(--height) top-(--top) left-(--left)',
);

export const segmentedControlItemClassNamesBase = cn(
  'relative flex items-center justify-center gap-6 min-h-28 min-w-28 px-12 py-4',
  'rounded-8 text-sm font-sans font-medium text-center transition-all cursor-pointer',
  // Default state, unselected
  'bg-transparent text-text-secondary',
  // Focus state
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
  'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
);
