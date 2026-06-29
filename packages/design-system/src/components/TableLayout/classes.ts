import { cn } from '../../utils/cn';
import type { TableLayoutColumnAlign } from './types';

/** Scroll container — owns horizontal overflow; `group/scroll` for pin shadows later. */
export const tableLayoutContainer = cn('group/scroll relative w-full overflow-x-auto');

export const tableLayoutTable = cn('w-full border-collapse text-sm text-text-primary');

/** Sticky header — stays put during vertical scroll. */
export const tableLayoutHead = cn('sticky top-0 z-30');

export const tableLayoutRow = cn('');

const cellBase = cn(
  'border-b border-r border-border-primary-light last:border-r-0 font-sans',
);

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
