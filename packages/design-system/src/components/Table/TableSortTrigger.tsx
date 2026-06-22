import { type ButtonHTMLAttributes, type MouseEvent, type ReactNode, useCallback } from 'react';
import type { Column } from '@tanstack/react-table';
import { MoveDown, MoveUp, MoveVertical } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { HStack } from '../Stack';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { tableHeaderButtonClass } from './classes';
import { getAlignClass, SORT_LABELS } from './lib';
import { useTableContext } from './TableContext';

export interface TableSortTriggerProps<T = unknown>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'type' | 'children'>,
    TestableProps {
  /**
   * Column from the header render context — wires the trigger to TanStack's
   * sort state. Pass `header.column` directly:
   *
   * ```tsx
   * header: ({ column }) => (
   *   <TableSortTrigger column={column} data-analytics-id='users.sort.name'>
   *     Name
   *   </TableSortTrigger>
   * )
   * ```
   */
  column: Column<T, unknown>;
  /** Label rendered next to the sort icon. Visual styling matches the default header text. */
  children?: ReactNode;
}

const getSortTooltip = (
  sortType: string | undefined,
  sortDirection: false | 'asc' | 'desc',
): string => {
  const labels = (sortType && SORT_LABELS[sortType]) || SORT_LABELS.text!;
  const [ascLabel, descLabel] = labels;
  return sortDirection === 'asc' ? descLabel : ascLabel;
};

const getAriaLabel = (sortDirection: false | 'asc' | 'desc'): string => {
  if (sortDirection === 'asc') return 'Sorted ascending';
  if (sortDirection === 'desc') return 'Sorted descending';
  return 'Sort column';
};

const renderSortIcon = (sortDirection: false | 'asc' | 'desc') => {
  if (sortDirection === 'asc') return <MoveUp size='sm' />;
  if (sortDirection === 'desc') return <MoveDown size='sm' />;
  return <MoveVertical size='sm' />;
};

/**
 * Consumer-rendered sort trigger. Replaces the auto-rendered sort icon when
 * present as a direct child of the column's `header` render return — the
 * `TableHeadCell` children-scan suppresses the default `TableSortHandler` and
 * does not wrap the label in its own `<Text>`.
 *
 * All native button attributes (including `data-analytics-id`,
 * `data-analytics-props`, `aria-*`, `id`, `ref`, and any `data-*`) reach the
 * underlying `<button>` so analytics SDKs that walk up via
 * `closest('[data-analytics-id]')` resolve clicks on the icon to the
 * consumer-supplied id.
 *
 * Consumer-passed `onClick` runs first; if it calls `event.preventDefault()`,
 * the internal `toggleSorting` is skipped.
 */
export const TableSortTrigger = <T,>({
  column,
  children,
  'data-testid': testIdProp,
  className,
  onClick,
  ...rest
}: TableSortTriggerProps<T>) => {
  const ctx = useTableContext<T>();
  const testId = useTestId('sort', testIdProp);

  const canSort = ctx.sortingEnabled && column.getCanSort();
  const sortDirection = column.getIsSorted();
  const sortType = column.columnDef.meta?.sortType;
  const tooltipText = getSortTooltip(sortType, sortDirection);
  const isRightAligned = getAlignClass(column.columnDef.meta) === 'text-right';

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (canSort) column.toggleSorting(undefined, e.shiftKey);
    },
    [canSort, column, onClick],
  );

  const iconButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          {...rest}
          type='button'
          data-testid={testId}
          className={cn(tableHeaderButtonClass, className)}
          onClick={handleClick}
          aria-label={getAriaLabel(sortDirection)}
        >
          {renderSortIcon(sortDirection)}
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );

  const label = children ? (
    <Text size='xs' weight='medium' truncate>
      {children}
    </Text>
  ) : null;

  return (
    <HStack gap={2} align='center'>
      {isRightAligned ? iconButton : null}
      {label}
      {isRightAligned ? null : iconButton}
    </HStack>
  );
};

TableSortTrigger.displayName = 'TableSortTrigger';
