import { type MouseEvent, useCallback } from 'react';
import { flexRender, type Header } from '@tanstack/react-table';
import { MoveDown, MoveUp, MoveVertical } from '../../icons';
import { cn } from '../../utils/cn';
import { HStack } from '../Stack';
import { Text } from '../Text';
import {
  getPinningStyles,
  isLastPinnedLeft,
  TABLE_EXPAND_COLUMN_ID,
  TABLE_SELECT_COLUMN_ID,
  useColumnDnd,
} from './lib';
import { Th } from './primitives';
import { useTableContext } from './TableContext';
import { TableHeadCellMenu } from './TableHeadCellMenu';
import { TableResizeHandler } from './TableResizeHandler';

interface TableHeadCellProps<T> {
  header: Header<T, unknown>;
}

export const TableHeadCell = <T,>({ header }: TableHeadCellProps<T>) => {
  const ctx = useTableContext<T>();
  const {
    sortingEnabled,
    resizingEnabled,
    pinningEnabled,
    visibilityEnabled,
    columnDndEnabled,
    allLeafColumns,
  } = ctx;

  const { column } = header;
  const isPinned = column.getIsPinned();
  const meta = column.columnDef.meta;

  const canSort = sortingEnabled && column.getCanSort();
  const canResize = resizingEnabled && column.getCanResize() && !column.getIsLastColumn();
  const isNotBasicColumn =
    column.columnDef.id === TABLE_SELECT_COLUMN_ID ||
    column.columnDef.id === TABLE_EXPAND_COLUMN_ID;

  const hasMenu = isNotBasicColumn
    ? false
    : canSort ||
      (pinningEnabled && column.getCanPin()) ||
      (visibilityEnabled && column.getCanHide()) ||
      columnDndEnabled;

  const sortDirection = column.getIsSorted();

  const pinningStyles = getPinningStyles(column);
  const lastLeft = isLastPinnedLeft(column, allLeafColumns, column.id);

  const { canDnd, setNodeRef, dndStyle, attributes, listeners } = useColumnDnd(column);

  // Handle sorting click
  const handleSort = useCallback(
    (e: MouseEvent) => {
      if (canSort) {
        column.toggleSorting(undefined, e.shiftKey);
      }
    },
    [canSort, column],
  );

  const content = flexRender(header.column.columnDef.header, header.getContext());

  const ariaSort =
    sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined;

  return (
    <Th
      ref={canDnd ? setNodeRef : undefined}
      className={cn('group', meta?.headerClassName)}
      interactive={canSort}
      sorted={!!sortDirection}
      pinned={isPinned === 'left'}
      lastPinnedLeft={lastLeft}
      draggable={canDnd}
      style={{
        ...pinningStyles,
        ...dndStyle,
        width: header.getSize(),
      }}
      colSpan={header.colSpan}
      aria-sort={ariaSort}
      {...(canDnd ? { ...listeners, ...attributes } : {})}
    >
      {isNotBasicColumn && content}

      {!header.isPlaceholder && !isNotBasicColumn && (
        <div className='flex items-center'>
          <HStack spacing={2}>
            <Text size='xs' weight='medium' truncate>
              {content}
            </Text>

            {canSort && (
              <button
                type='button'
                className={cn(
                  'shrink-0 hover:text-text-primary transition-colors cursor-pointer',
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
                  <MoveUp size='xs' />
                ) : sortDirection === 'desc' ? (
                  <MoveDown size='xs' />
                ) : (
                  <MoveVertical size='xs' />
                )}
              </button>
            )}
          </HStack>

          {hasMenu && (
            <span className='shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity'>
              <TableHeadCellMenu column={column} />
            </span>
          )}
        </div>
      )}

      {/* Resize handle */}
      {canResize && <TableResizeHandler header={header} />}
    </Th>
  );
};

TableHeadCell.displayName = 'TableHeadCell';
