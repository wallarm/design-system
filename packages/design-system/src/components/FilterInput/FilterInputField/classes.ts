import { cva } from 'class-variance-authority';

// Collapsed query bar shows at most VISIBLE_ROWS chip rows.
const VISIBLE_ROWS = 3;
const CHIP_ROW_HEIGHT = 22; // chip h-22 (border-box)
const ROW_GAP = 4; // gap-y-4
const PADDING_Y = 16; // py-[8px] top + bottom
const EDGE_GAP = 8; // container edge → first/last row
const CONTAINER_BORDER = 2; // outer input border (1px × 2)

/** Max height (px) of the inner chip area when the query bar is collapsed. */
export const COLLAPSED_MAX_HEIGHT =
  VISIBLE_ROWS * CHIP_ROW_HEIGHT +
  (VISIBLE_ROWS - 1) * ROW_GAP +
  PADDING_Y +
  EDGE_GAP +
  CONTAINER_BORDER;

// Reserve horizontal space so chips don't render behind the absolutely-
// positioned action buttons (expand/collapse + clear).
const BUTTON_SIZE = 24; // Button size="small" icon-only
const BUTTON_COUNT = 2; // expand/collapse + clear
const BUTTON_GAP = 8;
const ACTIONS_RIGHT = 8;

/** Right padding (px) applied to the chip area when content is present. */
export const ACTIONS_PADDING = BUTTON_COUNT * BUTTON_SIZE + BUTTON_GAP + ACTIONS_RIGHT;

/** Outer filter-input container (combobox wrapper) */
export const filterInputContainerVariants = cva(
  'relative flex box-border min-h-40 w-full overflow-hidden px-0 focus-within:outline-none focus-within:ring-3',
  {
    variants: {
      error: {
        true: 'focus-within:ring-focus-destructive',
        false:
          'focus-within:not-disabled:border-border-strong-primary focus-within:ring-focus-primary',
      },
      multiRow: {
        true: 'items-start',
        false: 'items-stretch',
      },
    },
    defaultVariants: {
      error: false,
      multiRow: false,
    },
  },
);

/** Inner scrollable chip area that delegates clicks to the input */
export const filterInputInnerVariants = cva(
  'flex min-h-[40px] w-full cursor-text flex-wrap items-center gap-y-4 py-[8px]',
  {
    variants: {
      hasContent: {
        true: 'pl-8',
        false: 'pl-12 pr-4',
      },
    },
    defaultVariants: {
      hasContent: false,
    },
  },
);

/** Native input element inside the query bar */
export const filterInputInputVariants = cva(
  'h-24 border-none bg-transparent p-0 text-sm shadow-none outline-none ring-0',
  {
    variants: {
      hasContent: {
        true: 'ml-4 shrink-0',
        false: 'flex-1',
      },
    },
    defaultVariants: {
      hasContent: false,
    },
  },
);
