import { cva } from 'class-variance-authority';

/** Outer query-bar container (combobox wrapper) */
export const queryBarContainerVariants = cva(
  'relative flex min-h-40 w-full items-center overflow-hidden px-0 focus-within:outline-none focus-within:ring-3',
  {
    variants: {
      error: {
        true: 'focus-within:ring-focus-destructive',
        false: 'focus-within:not-disabled:border-border-strong-primary focus-within:ring-focus-primary',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);

/** Inner chip row that delegates clicks to the input */
export const queryBarInnerVariants = cva(
  'flex min-h-full flex-1 cursor-text flex-wrap items-center py-4 pr-4',
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

/** Native input element inside the query bar */
export const queryBarInputVariants = cva(
  'h-auto border-none bg-transparent p-0 text-sm shadow-none outline-none ring-0',
  {
    variants: {
      hasContent: {
        true: 'mx-8',
        false: 'flex-1',
      },
    },
    defaultVariants: {
      hasContent: false,
    },
  },
);

/** Insertion gap button */
export const insertionGapButton = 'group relative z-20 flex h-28 w-8 shrink-0 cursor-text items-center justify-center';

/** Insertion gap divider indicator */
export const insertionGapDivider = 'h-16 w-1 rounded-full bg-transparent transition-colors group-hover:bg-border-primary/50';

/** Connector chip text */
export const connectorTextVariants = cva(
  'text-sm font-normal truncate',
  {
    variants: {
      error: {
        true: 'text-text-danger',
        false: 'text-text-secondary',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);

/** Segment text styles by variant */
export const segmentTextVariants = cva(
  'truncate text-sm',
  {
    variants: {
      variant: {
        attribute: 'font-normal text-text-primary',
        operator: 'font-normal text-text-secondary',
        value: 'font-medium text-text-info',
      },
    },
  },
);

/** Segment container */
export const segmentContainer = 'flex flex-col justify-center overflow-hidden p-2 leading-none';
