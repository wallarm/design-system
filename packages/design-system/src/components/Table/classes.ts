import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

/** Shared base styles for all table cells (head + body) */
const tableCellBase = cn(
  'border-r border-b border-border-primary-light last:border-r-0',
  'overlay overflow-visible',
  'font-sans',
);

/** Shared pinned shadow for the last pinned-left column */
const pinnedLeftShadow = cn(
  'group-data-[scrolled]/scroll:shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)]',
  'group-data-[scrolled]/scroll:[clip-path:inset(0px_-40px_0px_0px)]',
);

export const tableHeadCellVariants = cva(
  cn(
    tableCellBase,
    'py-4 pr-4 pl-16 text-xs font-medium text-text-secondary',
    'first:rounded-tl-12 last:rounded-tr-12',
    'bg-bg-light-primary',
    'whitespace-nowrap outline-none',
  ),
  {
    variants: {
      interactive: {
        true: 'hover:overlay-states-primary-hover',
        false: '',
      },
      sorted: {
        true: 'overlay-states-primary-hover text-text-primary',
        false: '',
      },
      pinned: {
        true: 'sticky z-40',
        false: '',
      },
      lastPinnedLeft: {
        true: pinnedLeftShadow,
        false: '',
      },
      draggable: {
        true: 'cursor-grab active:cursor-grabbing',
        false: '',
      },
      dragging: {
        true: 'select-none',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
      sorted: false,
      pinned: false,
      lastPinnedLeft: false,
      draggable: false,
      dragging: false,
    },
  },
);

export const tableBodyCellVariants = cva(
  cn(
    tableCellBase,
    'px-16 py-8 text-sm text-text-primary',
    'bg-bg-surface-2',
    'align-top',
    'group-hover/row:overlay-states-primary-hover',
    'group-data-[selected]/row:overlay-states-primary-active',
    'group-data-[selected]/row:group-hover/row:overlay-states-primary-hover',
    'group-data-[preview-active]/row:overlay-states-primary-hover',
    'group-has-[[data-state=open]]/row:overlay-states-primary-hover',
    '[&:has([data-state=open][data-part=context-trigger])]:ring-2',
    '[&:has([data-state=open][data-part=context-trigger])]:ring-inset',
    '[&:has([data-state=open][data-part=context-trigger])]:ring-border-strong-brand',
    '[&:has([data-part=context-trigger])]:p-0',
    '[&_[data-part=context-trigger]]:w-full',
    '[&_[data-part=context-trigger]]:px-16 [&_[data-part=context-trigger]]:py-8',
    '[&_[data-part=context-trigger]]:text-left [&_[data-part=context-trigger]]:outline-none',
  ),
  {
    variants: {
      pinned: {
        true: 'sticky z-10',
        false: '',
      },
      lastPinnedLeft: {
        true: pinnedLeftShadow,
        false: '',
      },
      expanded: {
        true: 'border-b-0 before:hidden',
        false: '',
      },
      /** Last row of the table: the container frame already draws the bottom edge */
      lastRow: {
        true: 'border-b-0',
        false: '',
      },
    },
    defaultVariants: {
      pinned: false,
      lastPinnedLeft: false,
      expanded: false,
      lastRow: false,
    },
  },
);

export const tableContainerVariants = cva(
  'overflow-clip rounded-12 border border-border-primary-light outline-none',
  {
    variants: {
      virtualized: {
        container: 'h-full',
        window: '',
      },
    },
  },
);

export const tableRowVariants = cva('transition-colors');

/**
 * Drop-indicator ::after pseudo-element (shared by TableBodyCell & filler Td).
 * Positioned above borders so the line is uninterrupted across columns.
 */
export const DROP_INDICATOR_BASE =
  "after:content-[''] after:absolute after:left-0 after:-right-px after:h-[2px] after:bg-[var(--color-border-strong-brand)] after:pointer-events-none after:z-[1]";

/** Small icon button used in table header (sort, scroll, menu triggers) */
export const tableHeaderButtonClass = cn(
  'h-16 w-16 shrink-0 hover:text-text-primary',
  'rounded-2 focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:outline-none',
  'cursor-pointer transition-colors',
  'inline-flex items-center justify-center border-0 bg-transparent p-0',
);
