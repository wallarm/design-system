import { cva } from 'class-variance-authority';

/** Base chip container styles shared by QueryBarChip and QueryBarConnectorChip */
export const chipVariants = cva(
  'group/chip relative flex items-center justify-center px-4 py-0 min-h-[20px] border border-solid rounded-8',
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

/** Segment container */
export const segmentContainer = 'flex flex-col justify-center overflow-hidden p-2 leading-none';

/** Segment text styles by variant */
export const segmentTextVariants = cva('truncate text-sm', {
  variants: {
    variant: {
      attribute: 'font-normal',
      operator: 'font-normal',
      value: 'font-medium',
    },
    error: {
      true: 'text-text-danger',
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'attribute', error: false, className: 'text-text-primary' },
    { variant: 'operator', error: false, className: 'text-text-secondary' },
    { variant: 'value', error: false, className: 'text-text-info' },
  ],
  defaultVariants: {
    error: false,
  },
});

/** Remove button styles — hidden by default, shown on chip hover or button focus */
export const removeButtonVariants = cva(
  'absolute -right-12 top-[-1px] bottom-[-1px] flex items-center justify-center p-0 cursor-pointer w-[18px] border border-solid border-l-0 rounded-r-8 opacity-0 group-hover/chip:opacity-100 focus:opacity-100 transition-opacity',
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
