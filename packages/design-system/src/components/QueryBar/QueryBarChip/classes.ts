import { cva } from 'class-variance-authority';

/** Base chip container styles shared by QueryBarChip and QueryBarConnectorChip */
export const chipVariants = cva(
  'relative flex items-center justify-center px-4 py-0 min-h-[20px] border border-solid rounded-8',
  {
    variants: {
      error: {
        true: 'bg-bg-light-danger border-border-danger',
        false: 'bg-badge-badge-bg border-border-primary',
      },
      interactive: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      error: false,
      interactive: false,
    },
  },
);

/** Remove button styles */
export const removeButtonVariants = cva(
  'absolute -right-12 top-[-1px] bottom-[-1px] flex items-center justify-center p-0 cursor-pointer w-[18px] border border-solid border-l-0 rounded-r-8',
  {
    variants: {
      error: {
        true: 'border-border-danger bg-bg-light-danger text-text-danger',
        false: 'border-border-primary bg-badge-badge-bg text-text-secondary',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);
