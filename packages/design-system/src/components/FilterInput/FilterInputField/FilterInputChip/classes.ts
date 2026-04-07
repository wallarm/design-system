import { cva } from 'class-variance-authority';

/** Selection highlight applied via Ctrl+A (parent data attr) and drag (wrapper data attr) */
const selectionHighlight = [
  'group-data-[selected-all]/filter-input:bg-bg-light-info group-data-[selected-all]/filter-input:border-border-info',
  '[[data-drag-selected]_&]:bg-bg-light-info [[data-drag-selected]_&]:border-border-info',
].join(' ');

/** Hide element when chip is in any selection state */
const hiddenWhenSelected = [
  'group-data-[selected-all]/filter-input:hidden',
  '[[data-drag-selected]_&]:hidden',
].join(' ');

/** Base chip container styles shared by FilterInputChip and FilterInputConnectorChip */
export const chipVariants = cva(
  `h-22 group/chip relative flex items-center justify-center px-5 py-0 border border-solid rounded-8 gap-4 ${selectionHighlight}`,
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
      disabled: {
        true: 'opacity-50 cursor-default',
        false: '',
      },
    },
    compoundVariants: [
      { interactive: false, error: false, className: 'border-border-strong-primary' },
    ],
    defaultVariants: {
      error: false,
      interactive: false,
      disabled: false,
    },
  },
);

/** Segment container */
export const segmentContainer = 'flex flex-col justify-center overflow-hidden leading-none';

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
  `absolute -right-[13px] top-[-1px] bottom-[-1px] flex items-center justify-center p-0 cursor-pointer w-[18px] border border-solid border-l-0 rounded-r-8 opacity-0 group-hover/chip:opacity-100 focus:opacity-100 transition-opacity ${hiddenWhenSelected}`,
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
