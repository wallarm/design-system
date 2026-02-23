import type { Column } from '@tanstack/react-table';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronsDown,
  Ellipsis,
  EyeOff,
  Pin,
  PinOff,
} from '../../icons';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuTriggerItem,
} from '../DropdownMenu';
import { useTableContext } from './TableContext';

interface TableColumnHeaderMenuProps<T> {
  column: Column<T, unknown>;
}

const SORT_LABELS: Record<string, [string, string]> = {
  text: ['A \u2192 Z', 'Z \u2192 A'],
  number: ['Highest on top', 'Lowest on top'],
  date: ['Newest on top', 'Oldest on top'],
  duration: ['Longest on top', 'Shortest on top'],
  score: ['Highest on top', 'Lowest on top'],
  boolean: ['Yes on top', 'No on top'],
  version: ['Latest on top', 'Earliest on top'],
  severity: ['Most critical on top', 'Least critical on top'],
  size: ['Largest on top', 'Smallest on top'],
};

const getSortLabels = (column: Column<unknown, unknown>): [string, string] => {
  const sortType = column.columnDef.meta?.sortType;
  if (sortType && SORT_LABELS[sortType]) return SORT_LABELS[sortType];
  return SORT_LABELS.text!;
};

export const TableHeadCellMenu = <T,>({ column }: TableColumnHeaderMenuProps<T>) => {
  const ctx = useTableContext<T>();
  const { table, sortingEnabled, pinningEnabled, visibilityEnabled, columnDndEnabled } = ctx;

  const isPinned = column.getIsPinned();
  const isAlwaysPinned = ctx.alwaysPinnedLeft.includes(column.id);
  const canSort = sortingEnabled && column.getCanSort();
  const canPin = pinningEnabled && column.getCanPin() && !isAlwaysPinned;
  const canHide = visibilityEnabled && column.getCanHide();
  const canReorder = columnDndEnabled && !isAlwaysPinned;

  if (!canSort && !canPin && !canHide && !canReorder) return null;

  const allColumns = table.getAllLeafColumns();
  const visibleColumns = table.getVisibleLeafColumns();
  const columnIdx = visibleColumns.findIndex(c => c.id === column.id);
  const isFirst = columnIdx === 0;
  const isLast = columnIdx === visibleColumns.length - 1;
  const canMoveLeft = canReorder && !isFirst && !isPinned;
  const canMoveRight = canReorder && !isLast && !isPinned;

  const sortDirection = column.getIsSorted();
  const [ascLabel, descLabel] = getSortLabels(column as unknown as Column<unknown>);

  const handleSort = (desc: boolean) => {
    column.toggleSorting(desc);
  };

  const handlePin = (position: 'left' | false) => {
    column.pin(position);
  };

  const handleHide = () => {
    column.toggleVisibility(false);
  };

  const handleMove = (direction: 'left' | 'right') => {
    const currentOrder = table.getState().columnOrder.length
      ? table.getState().columnOrder
      : allColumns.map(c => c.id);

    const fromIdx = currentOrder.indexOf(column.id);
    const toIdx = direction === 'left' ? fromIdx - 1 : fromIdx + 1;

    if (toIdx < 0 || toIdx >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const temp = newOrder[fromIdx];
    newOrder[fromIdx] = newOrder[toIdx]!;
    newOrder[toIdx] = temp!;
    ctx.setColumnOrder(newOrder);
  };

  const hasMovement = canMoveLeft || canMoveRight;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' color='neutral' size='small' aria-label='Column menu'>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Move left / Move right */}
        {canMoveLeft && (
          <DropdownMenuItem onSelect={() => handleMove('left')}>
            <ArrowLeft size='sm' />
            Move left
          </DropdownMenuItem>
        )}
        {canMoveRight && (
          <DropdownMenuItem onSelect={() => handleMove('right')}>
            <ArrowRight size='sm' />
            Move right
          </DropdownMenuItem>
        )}

        {hasMovement && (canSort || canPin || canHide) && <DropdownMenuSeparator />}

        {/* Sort submenu */}
        {canSort && (
          <DropdownMenu>
            <DropdownMenuTriggerItem>
              <ChevronsDown size='sm' />
              Sort
            </DropdownMenuTriggerItem>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleSort(false)}>
                {ascLabel}
                {sortDirection === 'asc' && (
                  <Check size='sm' className='ml-auto text-icon-primary' />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleSort(true)}>
                {descLabel}
                {sortDirection === 'desc' && (
                  <Check size='sm' className='ml-auto text-icon-primary' />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Pin / Unpin */}
        {canPin && isPinned && (
          <DropdownMenuItem onSelect={() => handlePin(false)}>
            <PinOff size='sm' />
            Unpin
          </DropdownMenuItem>
        )}
        {canPin && !isPinned && (
          <DropdownMenuItem onSelect={() => handlePin('left')}>
            <Pin size='sm' />
            Pin
          </DropdownMenuItem>
        )}

        {/* Hide */}
        {canHide && (
          <DropdownMenuItem onSelect={handleHide}>
            <EyeOff size='sm' />
            Hide
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

TableHeadCellMenu.displayName = 'TableHeadCellMenu';
