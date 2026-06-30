import { cn } from '../../utils/cn';
import type { TableLayoutColumnAlign } from './types';

/** Scroll container — owns horizontal overflow; `group/scroll` for pin shadows later. */
export const tableLayoutContainer = cn('group/scroll relative w-full overflow-x-auto');

export const tableLayoutTable = cn('w-full border-collapse text-sm text-text-primary');

/** Sticky header — stays put during vertical scroll. */
export const tableLayoutHead = cn('sticky top-0 z-30');

export const tableLayoutRow = cn('');

const cellBase = cn('border-b border-r border-border-primary-light last:border-r-0 font-sans');

export const tableLayoutHeaderCell = cn(
  cellBase,
  'bg-bg-light-primary px-16 py-4 text-left text-xs font-medium text-text-secondary whitespace-nowrap',
);

export const tableLayoutCell = cn(cellBase, 'px-16 py-8 align-middle');

export const cellAlignClass: Record<TableLayoutColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const tableLayoutPinned = cn('z-20 bg-bg-light-primary');
export const tableLayoutLastPinnedLeft = cn(
  'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)] [clip-path:inset(0_-8px_0_0)]',
);
export const tableLayoutFirstPinnedRight = cn('border-l border-border-primary-light');

export const tableLayoutResizeHandle = cn(
  'absolute top-0 bottom-0 right-0 w-8 translate-x-4 z-30',
  'cursor-col-resize select-none touch-none',
  'opacity-0 hover:opacity-100 data-[resizing]:opacity-100 transition-opacity',
  'before:absolute before:inset-y-4 before:right-4 before:w-2 before:rounded-2 before:bg-bg-fill-brand',
);
