import { flexRender, type Header } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { HStack } from '../Stack';
import { Text } from '../Text';
import { useHorizontalScrollState } from './hooks';
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
import { TableScrollHandler } from './TableScrollHandler';
import { TableSortHandler } from './TableSortHandler';

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
    masterColumnId,
    containerRef,
  } = ctx;

  const { column } = header;
  const isPinned = column.getIsPinned();
  const isMasterColumn = column.id === masterColumnId;
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
  const { hasOverflow, atStart, atEnd } = useHorizontalScrollState(containerRef, isMasterColumn);

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
      tabIndex={-1}
    >
      {isNotBasicColumn && content}

      {!header.isPlaceholder && !isNotBasicColumn && (
        <HStack align='center'>
          <HStack gap={2} fullWidth>
            <Text size='xs' weight='medium' truncate>
              {content}
            </Text>

            {canSort && <TableSortHandler header={header} />}
          </HStack>

          {hasMenu && (
            <span className='shrink-0 ml-auto opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 has-[>_[data-state=open]]:opacity-100 transition-opacity'>
              <TableHeadCellMenu column={column} />
            </span>
          )}

          {isMasterColumn && hasOverflow && <TableScrollHandler atStart={atStart} atEnd={atEnd} />}
        </HStack>
      )}

      {canResize && <TableResizeHandler header={header} />}
    </Th>
  );
};

TableHeadCell.displayName = 'TableHeadCell';
