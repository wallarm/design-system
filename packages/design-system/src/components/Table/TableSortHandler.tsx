import { type MouseEvent, useCallback } from 'react';
import type { Header } from '@tanstack/react-table';
import { MoveDown, MoveUp, MoveVertical } from '../../icons';
import { cn } from '../../utils/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { SORT_LABELS } from './lib';
import { useTableContext } from './TableContext';

interface TableSortHandler<T> {
  header: Header<T, unknown>;
}

const getSortTooltip = (
  sortType: string | undefined,
  sortDirection: false | 'asc' | 'desc',
): string => {
  const labels = (sortType && SORT_LABELS[sortType]) || SORT_LABELS.text!;
  const [ascLabel, descLabel] = labels;

  if (sortDirection === 'asc') return descLabel;
  return ascLabel;
};

export const TableSortHandler = <T,>({ header }: TableSortHandler<T>) => {
  const { column } = header;

  const ctx = useTableContext<T>();
  const { sortingEnabled } = ctx;

  const canSort = sortingEnabled && column.getCanSort();

  const handleSort = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (canSort) {
        column.toggleSorting(undefined, e.shiftKey);
      }
    },
    [canSort, column],
  );

  const sortDirection = column.getIsSorted();
  const sortType = column.columnDef.meta?.sortType;
  const tooltipText = getSortTooltip(sortType, sortDirection);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className={cn(
            'icon-sm shrink-0 hover:text-text-primary ',
            'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary rounded-2',
            'transition-colors cursor-pointer',
            'inline-flex items-center justify-center bg-transparent border-0 p-0',
          )}
          onClick={handleSort}
          aria-label={
            sortDirection === 'asc'
              ? 'Sorted ascending'
              : sortDirection === 'desc'
                ? 'Sorted descending'
                : 'Sort column'
          }
        >
          {sortDirection === 'asc' ? (
            <MoveUp size='sm' />
          ) : sortDirection === 'desc' ? (
            <MoveDown size='sm' />
          ) : (
            <MoveVertical size='sm' />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
};

TableSortHandler.displayName = 'TableSortHandler';
