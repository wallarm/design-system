import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/** Shared base styles for all table cells (head + body) */
const tableCellBase = cn(
  'border-b border-r border-border-primary-light last:border-r-0',
  'overlay overflow-visible',
  'select-none font-sans',
);

/** Shared pinned shadow for the last pinned-left column */
const pinnedLeftShadow = 'group-data-[scrolled]/scroll:shadow-[2px_0_3px_0_rgba(0,0,0,0.1)]';

export const tableHeadCellVariants = cva(
  cn(
    tableCellBase,
    'pl-16 pr-4 py-4 text-left text-xs font-medium text-text-secondary',
    'first:rounded-tl-12 last:rounded-tr-12',
    'bg-bg-light-primary',
    'whitespace-nowrap select-none outline-none',
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
    'has-[>_[data-state=open][data-part=context-trigger]]:ring-2',
    'has-[>_[data-state=open][data-part=context-trigger]]:ring-inset',
    'has-[>_[data-state=open][data-part=context-trigger]]:ring-border-strong-brand',
    'has-[>_[data-part=context-trigger]]:p-0',
    '[&>[data-part=context-trigger]]:w-full',
    '[&>[data-part=context-trigger]]:px-16 [&>[data-part=context-trigger]]:py-8',
    '[&>[data-part=context-trigger]]:text-left [&>[data-part=context-trigger]]:outline-none',
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
  'rounded-12 border border-border-primary-light outline-none overflow-clip',
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
