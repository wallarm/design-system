import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/** Shared base styles for all table cells (head + body) */
const tableCellBase = cn(
  'border border-border-primary-light first:border-l-0 last:border-r-0',
  'overlay overflow-visible',
  'select-none font-sans',
);

/** Shared pinned shadow for the last pinned-left column */
const pinnedLeftShadow = 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]';

export const tableHeadCellVariants = cva(
  cn(
    tableCellBase,
    'pl-16 pr-4 py-8 text-left text-xs border-t-0 font-medium text-text-secondary',
    'bg-bg-light-primary',
    'whitespace-nowrap select-none',
  ),
  {
    variants: {
      interactive: {
        true: 'hover:overlay-states-primary-hover cursor-pointer',
        false: '',
      },
      sorted: {
        true: 'overlay-states-primary-hover text-text-primary',
        false: '',
      },
      pinned: {
        true: 'sticky z-20',
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
    },
    defaultVariants: {
      interactive: false,
      sorted: false,
      pinned: false,
      lastPinnedLeft: false,
      draggable: false,
    },
  },
);

export const tableBodyCellVariants = cva(
  cn(
    tableCellBase,
    'px-16 py-8 text-sm text-text-primary',
    'bg-bg-surface-2',
    'align-top',
    'group-hover/row:overlay-states-primary-hover group-data-[selected]/row:overlay-states-primary-active',
    'has-[>_[data-state=open]]:ring-2 has-[>_[data-state=open]]:ring-inset has-[>_[data-state=open]]:ring-border-strong-brand',
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
        true: 'border-b-0',
        false: '',
      },
    },
    defaultVariants: {
      pinned: false,
      lastPinnedLeft: false,
      expanded: false,
    },
  },
);

export const tableContainerVariants = cva(
  'overflow-x-auto rounded-12 border border-border-primary-light',
  {
    variants: {
      virtualized: {
        true: 'overflow-y-auto h-full',
        false: '',
      },
    },
    defaultVariants: {
      virtualized: false,
    },
  },
);

export const tableRowVariants = cva('transition-colors');
