import type { ComponentType, ReactNode } from 'react';
import { flexRender, type Header } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useHorizontalScrollState } from './hooks';
import {
  containsDirectChild,
  getAlignClass,
  getPinningStyles,
  isLastPinnedLeft,
  TABLE_EXPAND_COLUMN_ID,
  TABLE_SELECT_COLUMN_ID,
  useColumnDnd,
} from './lib';
import { Th } from './primitives';
import { TableColumnMenu } from './TableColumnMenu';
import { useTableContext } from './TableContext';
import { TableResizeHandler } from './TableResizeHandler';
import { TableScrollHandlerSlot } from './TableScrollHandlerSlot';
import { TableSortHandler } from './TableSortHandler';
import { TableSortTrigger } from './TableSortTrigger';

interface TableHeadCellProps<T> {
  header: Header<T, unknown>;
  hasTextDescription?: boolean;
}

export const TableHeadCell = <T,>({ header, hasTextDescription }: TableHeadCellProps<T>) => {
  const ctx = useTableContext<T>();
  const testId = useTestId('head-cell');
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
  const { hasOverflow } = useHorizontalScrollState(containerRef, isMasterColumn);

  // Call a functional header inline (instead of `flexRender`) so we can
  // introspect what the consumer returned — `flexRender` wraps the function
  // in `React.createElement()`, which hides the rendered tree behind another
  // component layer and would defeat the `<TableSortTrigger>` opt-out scan.
  // Header functions in TanStack are pure (props in, ReactNode out), so an
  // inline call has no side effects.
  const headerDef = header.column.columnDef.header;
  const headerCtx = header.getContext();
  const content: ReactNode =
    typeof headerDef === 'function' ? headerDef(headerCtx) : flexRender(headerDef, headerCtx);
  const hasCustomSortTrigger = containsDirectChild(
    content,
    TableSortTrigger as ComponentType<unknown>,
  );
  const hasCustomColumnMenu = containsDirectChild(
    content,
    TableColumnMenu as ComponentType<unknown>,
  );
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
      data-testid={testId}
      className={cn(
        'group',
        hasTextDescription ? 'align-top py-8' : 'align-middle',
        alignClass,
        isRightAligned && 'pl-4 pr-16',
        isLastColumn && hasSettingsMenu && 'pr-[44px]',
        meta?.headerClassName,
      )}
      interactive={canSort || hasMenu}
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
          {isRightAligned && hasMenu && !hasCustomColumnMenu && <TableColumnMenu column={column} />}

          <VStack gap={0} align={isRightAligned ? 'end' : undefined}>
            {hasCustomSortTrigger || hasCustomColumnMenu ? (
              content
            ) : (
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
            )}

            {isTextDescription && (
              <Text size='xs' weight='regular' color='secondary' truncate>
                {description.content}
              </Text>
            )}
          </VStack>

          {!isRightAligned && hasMenu && !hasCustomColumnMenu && (
            <span className='ml-auto inline-flex'>
              <TableColumnMenu column={column} />
            </span>
          )}

          {isMasterColumn && hasOverflow && <TableScrollHandlerSlot />}
        </HStack>
      )}

      {canResize && <TableResizeHandler header={header} />}
    </Th>
  );
};

TableHeadCell.displayName = 'TableHeadCell';
