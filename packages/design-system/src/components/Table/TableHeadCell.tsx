import { flexRender, type Header } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useHorizontalScrollState } from './hooks';
import {
  getAlignClass,
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

  const isLastColumn = column.getIsLastColumn();
  const hasSettingsMenu = visibilityEnabled || columnDndEnabled;
  const canSort = sortingEnabled && column.getCanSort();
  const canResize = resizingEnabled && column.getCanResize() && !isLastColumn;
  const isNotBasicColumn =
    column.columnDef.id === TABLE_SELECT_COLUMN_ID ||
    column.columnDef.id === TABLE_EXPAND_COLUMN_ID;

  const canPin = pinningEnabled && column.getCanPin();
  const canHide = visibilityEnabled && column.getCanHide();
  const hasMenu =
    isNotBasicColumn || isMasterColumn ? false : canPin || canHide || columnDndEnabled;

  const sortDirection = column.getIsSorted();

  const pinningStyles = getPinningStyles(column);
  const lastLeft = isLastPinnedLeft(column, allLeafColumns, column.id);

  const { canDnd, setNodeRef, dndStyle, attributes, listeners } = useColumnDnd(column);
  const { hasOverflow, atStart, atEnd } = useHorizontalScrollState(containerRef, isMasterColumn);

  const content = flexRender(header.column.columnDef.header, header.getContext());
  const alignClass = getAlignClass(meta);
  const isRightAligned = alignClass === 'text-right';

  const description = meta?.description;
  const isTextDescription = description?.type === 'text';
  const isTooltipDescription = description?.type === 'tooltip';
  const ariaSort =
    sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined;

  const titleNode = (
    <Text
      size='xs'
      weight='medium'
      truncate
      decoration={isTooltipDescription ? 'dashed' : undefined}
    >
      {content}
    </Text>
  );

  return (
    <Th
      ref={canDnd ? setNodeRef : undefined}
      className={cn(
        'group',
        alignClass,
        isRightAligned && 'pl-4 pr-16',
        isLastColumn && hasSettingsMenu && 'pr-[44px]',
        isTextDescription && 'py-8',
        meta?.headerClassName,
      )}
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
      onMouseDown={e => {
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          e.preventDefault();
        }
      }}
    >
      {isNotBasicColumn && content}

      {!header.isPlaceholder && !isNotBasicColumn && (
        <HStack
          align={isTextDescription ? 'start' : 'center'}
          justify={isRightAligned ? (hasMenu ? 'between' : 'end') : undefined}
        >
          {isRightAligned && hasMenu && (
            <span className='shrink-0 opacity-0 group-hover:opacity-100 has-[>_[data-state=open]]:opacity-100 transition-opacity'>
              <TableHeadCellMenu column={column} />
            </span>
          )}

          <VStack align={isRightAligned ? 'end' : undefined}>
            <HStack gap={2}>
              {isRightAligned && canSort && <TableSortHandler header={header} />}

              {isTooltipDescription ? (
                <Tooltip>
                  <TooltipTrigger asChild>{titleNode}</TooltipTrigger>
                  <TooltipContent>{description.content}</TooltipContent>
                </Tooltip>
              ) : (
                titleNode
              )}

              {!isRightAligned && canSort && <TableSortHandler header={header} />}
            </HStack>

            {isTextDescription && (
              <Text size='xs' weight='regular' color='secondary' truncate>
                {description.content}
              </Text>
            )}
          </VStack>

          {!isRightAligned && hasMenu && (
            <span className='shrink-0 ml-auto opacity-0 group-hover:opacity-100 has-[>_[data-state=open]]:opacity-100 transition-opacity'>
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
