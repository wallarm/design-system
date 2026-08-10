import { cva } from 'class-variance-authority';

// The shell fills the whole body cell. The host column zeroes the body-cell
// padding and gives the cell a resolvable height via EDITABLE_CELL_COLUMN_META,
// so `h-full` fills the row and the shell re-applies `px-16 py-8` itself — the
// text still lines up with the read-only columns at 16px. Square, edge-to-edge:
// a permanent transparent border only changes color when active, so entering /
// leaving edit never reflows by 1px.
export const editableCellVariants = cva(
  [
    'group/cell flex h-full w-full items-center gap-8 px-16 py-8',
    'border border-transparent',
    'text-left text-sm text-text-primary',
    'cursor-pointer outline-none transition-colors',
  ].join(' '),
  {
    variants: {
      state: {
        // Idle: the whole cell highlights on hover.
        idle: 'hover:bg-states-primary-hover active:bg-states-primary-pressed',
        // Active (text focused / select open): brand-orange border on a solid surface.
        active: 'border-border-strong-brand bg-bg-surface-1',
      },
    },
    defaultVariants: {
      state: 'idle',
    },
  },
);

/** Value slot — truncates, takes the free space, leaves room for the trailing icon. */
export const editableCellValue = 'min-w-0 flex-1 truncate';

/** Same as the value slot but muted, for the empty-state placeholder. */
export const editableCellPlaceholder = 'min-w-0 flex-1 truncate text-text-secondary';

/** Trailing affordance icon (pencil / chevron). */
export const editableCellIcon = 'size-16 shrink-0 text-text-secondary';

/** Borderless in-place text editor — inherits the cell's typography and inset. */
export const editableCellInput =
  'min-w-0 flex-1 bg-transparent p-0 text-sm text-text-primary outline-none';
