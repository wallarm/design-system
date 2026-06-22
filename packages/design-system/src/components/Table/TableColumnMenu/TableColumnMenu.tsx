import {
  type ButtonHTMLAttributes,
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'react';
import type { Column } from '@tanstack/react-table';
import { Check, ChevronsDown, Ellipsis } from '../../../icons';
import { cn } from '../../../utils/cn';
import { type TestableProps, useTestId } from '../../../utils/testId';
import { Button } from '../../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuTriggerItem,
} from '../../DropdownMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { SORT_LABELS } from '../lib';
import { useTableContext } from '../TableContext';
import { TableColumnMenuHideItem } from './TableColumnMenuHideItem';
import { TableColumnMenuMoveLeftItem } from './TableColumnMenuMoveLeftItem';
import { TableColumnMenuMoveRightItem } from './TableColumnMenuMoveRightItem';
import { TableColumnMenuPinItem } from './TableColumnMenuPinItem';
import { TableColumnMenuSortItem } from './TableColumnMenuSortItem';

interface TableColumnMenuContextValue {
  column: Column<unknown>;
}

const TableColumnMenuContext = createContext<TableColumnMenuContextValue | null>(null);

export const useTableColumnMenuContext = (): TableColumnMenuContextValue => {
  const ctx = useContext(TableColumnMenuContext);
  if (!ctx) {
    throw new Error('TableColumnMenu item components must be rendered inside <TableColumnMenu>');
  }
  return ctx;
};

export interface TableColumnMenuProps<T = unknown>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'type' | 'children'>,
    TestableProps {
  /** Column from the header render context. */
  column: Column<T>;
  /**
   * When omitted, the menu renders the default set of items (Move left / Move
   * right / Sort submenu / Pin / Hide) the same way the design system has
   * always rendered them. When provided, the consumer takes full control of
   * the menu's contents — typically a mix of the exported item sub-components
   * (`TableColumnMenuSortItem`, `TableColumnMenuPinItem`, etc.) for per-item
   * analytics, or arbitrary `DropdownMenuItem`s for custom actions.
   */
  children?: ReactNode;
}

/**
 * Per-column header menu ("…" trigger) with an optional consumer-controlled
 * item set. The trigger `<button>` accepts the full
 * `ButtonHTMLAttributes<HTMLButtonElement>` surface (minus `color` / `type` /
 * `children`) plus `TestableProps`, so `data-analytics-id`,
 * `data-analytics-props`, `aria-*`, `id`, `ref`, and any `data-*` reach the
 * underlying DOM node directly.
 *
 * The menu collapses to `null` when no action is available for the column
 * (sorting disabled, pinning disabled, hiding disabled, and DnD disabled) —
 * matching the behavior of the legacy `TableHeadCellMenu` it replaces.
 */
export const TableColumnMenu = <T,>({
  column,
  children,
  className,
  'data-testid': testIdProp,
  ...rest
}: TableColumnMenuProps<T>) => {
  const ctx = useTableContext<T>();
  const testId = useTestId('column-menu', testIdProp);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAlwaysPinned = ctx.alwaysPinnedLeft.includes(column.id);
  const canSort = ctx.sortingEnabled && column.getCanSort();
  const canPin = ctx.pinningEnabled && column.getCanPin() && !isAlwaysPinned;
  const canHide = ctx.visibilityEnabled && column.getCanHide();
  const canReorder = ctx.columnDndEnabled && !isAlwaysPinned;

  if (!canSort && !canPin && !canHide && !canReorder) return null;

  return (
    <TableColumnMenuContext.Provider value={{ column: column as Column<unknown> }}>
      <span className='shrink-0 inline-flex opacity-0 group-hover:opacity-100 has-[>_[data-state=open]]:opacity-100 transition-opacity'>
        <Tooltip disabled={menuOpen}>
          <DropdownMenu onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  {...rest}
                  type='button'
                  data-testid={testId}
                  variant='ghost'
                  color='neutral'
                  size='small'
                  aria-label={rest['aria-label'] ?? 'More'}
                  className={cn(className)}
                >
                  <Ellipsis />
                </Button>
              </TooltipTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent>{children ?? <DefaultTableColumnMenuItems />}</DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent>More</TooltipContent>
        </Tooltip>
      </span>
    </TableColumnMenuContext.Provider>
  );
};

TableColumnMenu.displayName = 'TableColumnMenu';

/**
 * Default item set — mirrors the legacy `TableHeadCellMenu` layout, with Sort
 * still nested in a submenu (`Sort >  A → Z / Z → A`). Each per-item
 * sub-component self-suppresses when its action isn't available, so the same
 * default tree works for every column.
 *
 * Consumers who want flat (no-submenu) sort items can pass children directly
 * to `<TableColumnMenu>` — see the WithAnalytics story for an example.
 */
const DefaultTableColumnMenuItems = () => {
  const { column } = useTableColumnMenuContext();
  const ctx = useTableContext();

  const isPinned = column.getIsPinned();
  const isAlwaysPinned = ctx.alwaysPinnedLeft.includes(column.id);
  const canReorder = ctx.columnDndEnabled && !isAlwaysPinned;
  const canSort = ctx.sortingEnabled && column.getCanSort();
  const canPin = ctx.pinningEnabled && column.getCanPin() && !isAlwaysPinned;
  const canHide = ctx.visibilityEnabled && column.getCanHide();

  const visibleColumns = ctx.table.getVisibleLeafColumns();
  const columnIdx = visibleColumns.findIndex(c => c.id === column.id);
  const isFirst = columnIdx === 0;
  const isLast = columnIdx === visibleColumns.length - 1;
  const canMoveLeft = canReorder && !isFirst && !isPinned;
  const canMoveRight = canReorder && !isLast && !isPinned;
  const hasMovement = canMoveLeft || canMoveRight;

  const sortType = column.columnDef.meta?.sortType;
  const [ascLabel, descLabel] = (sortType && SORT_LABELS[sortType]) || SORT_LABELS.text!;
  const sortDirection = column.getIsSorted();

  return (
    <>
      <TableColumnMenuMoveLeftItem />
      <TableColumnMenuMoveRightItem />
      {hasMovement && (canSort || canPin || canHide) && <DropdownMenuSeparator />}
      {canSort && (
        <DropdownMenu>
          <DropdownMenuTriggerItem>
            <ChevronsDown size='sm' />
            Sort
          </DropdownMenuTriggerItem>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => column.toggleSorting(false)}>
              {ascLabel}
              {sortDirection === 'asc' && <Check size='sm' className='ml-auto text-icon-primary' />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => column.toggleSorting(true)}>
              {descLabel}
              {sortDirection === 'desc' && (
                <Check size='sm' className='ml-auto text-icon-primary' />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <TableColumnMenuPinItem />
      <TableColumnMenuHideItem />
    </>
  );
};
