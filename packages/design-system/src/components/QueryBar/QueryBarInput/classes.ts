import { cva } from 'class-variance-authority';

/** Outer query-bar container (combobox wrapper) */
export const queryBarContainerVariants = cva(
  'relative flex min-h-40 w-full items-center overflow-hidden px-0 focus-within:outline-none focus-within:ring-3',
  {
    variants: {
      error: {
        true: 'focus-within:ring-focus-destructive',
        false:
          'focus-within:not-disabled:border-border-strong-primary focus-within:ring-focus-primary',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);

/** Inner chip row that delegates clicks to the input */
export const queryBarInnerVariants = cva(
  'flex min-h-full flex-1 cursor-text flex-wrap items-center gap-y-4 py-4 pr-4',
  {
    variants: {
      hasContent: {
        true: 'pl-4',
        false: 'pl-12',
      },
    },
    defaultVariants: {
      hasContent: false,
    },
  },
);

/** Wrapper that visually groups the building chip and the input as one unit */
export const buildingChipWrapperClass =
  'flex items-center gap-2 min-w-0 rounded-8 border border-solid border-border-strong-primary bg-badge-badge-bg';

/** Native input element inside the query bar */
export const queryBarInputVariants = cva(
  'h-auto border-none bg-transparent p-0 text-sm shadow-none outline-none ring-0',
  {
    variants: {
      hasContent: {
        true: 'mx-4',
        false: 'flex-1',
      },
    },
    defaultVariants: {
      hasContent: false,
    },
  },
);
