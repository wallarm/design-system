import { cva } from 'class-variance-authority';

// ── Collapsed max-height calculation ──────────────────────
// The query bar collapses to show at most VISIBLE_ROWS rows of chips.
// Each value maps to a CSS dimension used in the inner chip container.

const VISIBLE_ROWS = 3;
const CHIP_ROW_HEIGHT = 22; // chip min-h-[20px] + 1px border top + 1px border bottom
const ROW_GAP = 4; // gap-y-4 between rows
const PADDING_Y = 8; // py-4 top (4px) + py-4 bottom (4px)
const EDGE_GAP = 8; // visual gap from container edges to first/last chip row
const CONTAINER_BORDER = 2; // outer input border: 1px top + 1px bottom
const BOTTOM_REVEAL = 6; // extra space so the bottom padding is visually apparent

/** Max height (px) of the inner chip area when the query bar is collapsed. */
export const COLLAPSED_MAX_HEIGHT =
  VISIBLE_ROWS * CHIP_ROW_HEIGHT +
  (VISIBLE_ROWS - 1) * ROW_GAP +
  PADDING_Y +
  EDGE_GAP +
  CONTAINER_BORDER +
  BOTTOM_REVEAL;

// ── Action buttons padding ────────────────────────────────
// Reserve horizontal space so chips don't render behind the
// absolutely-positioned action buttons (expand/collapse + clear).

const BUTTON_SIZE = 24; // Button size="small" icon-only = 24×24
const BUTTON_COUNT = 2; // expand/collapse + clear
const BUTTON_GAP = 8; // gap-8 between buttons
const ACTIONS_RIGHT = 8; // right-8 offset of the actions container

/** Right padding (px) applied to the chip area when content is present. */
export const ACTIONS_PADDING =
  BUTTON_COUNT * BUTTON_SIZE + BUTTON_GAP + ACTIONS_RIGHT;

// ── CVA variants ──────────────────────────────────────────

/** Outer query-bar container (combobox wrapper) */
export const queryBarContainerVariants = cva(
  'relative flex min-h-40 w-full overflow-hidden px-0 focus-within:outline-none focus-within:ring-3',
  {
    variants: {
      error: {
        true: 'focus-within:ring-focus-destructive',
        false:
          'focus-within:not-disabled:border-border-strong-primary focus-within:ring-focus-primary',
      },
      multiRow: {
        true: 'items-start',
        false: 'items-center',
      },
    },
    defaultVariants: {
      error: false,
      multiRow: false,
    },
  },
);

/** Inner scrollable chip area that delegates clicks to the input */
export const queryBarInnerVariants = cva(
  'flex min-h-full w-full cursor-text flex-wrap items-center gap-y-4 py-4',
  {
    variants: {
      hasContent: {
        true: 'pl-4',
        false: 'pl-12 pr-4',
      },
    },
    defaultVariants: {
      hasContent: false,
    },
  },
);

/** Wrapper that visually groups the building chip and the filter input */
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
