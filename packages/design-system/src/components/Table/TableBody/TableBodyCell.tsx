import { type Cell, flexRender } from '@tanstack/react-table';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { ACTIONS_GAP, ACTIONS_PL, ACTIONS_PR, ACTION_BUTTON_SIZE } from '../classes';
import {
  getAlignClass,
  getExpandBorderClass,
  getPinningStyles,
  isLastPinnedLeft,
  TABLE_EXPAND_COLUMN_ID,
  useColumnDnd,
} from '../lib';
import { Td } from '../primitives';
import { useTableContext } from '../TableContext';
import { TableMasterCellActions } from '../TableMasterCellActions';

interface TableBodyCellProps<T> {
  cell: Cell<T, unknown>;
  colSpan?: number;
  className?: string;
  disablePinnedShadow?: boolean;
}

export const TableBodyCell = <T,>({
  cell,
  colSpan,
  className,
  disablePinnedShadow,
}: TableBodyCellProps<T>) => {
  const { allLeafColumns } = useTableContext<T>();
  const testId = useTestId('body-cell');
  const column = cell.column;
  const isPinned = column.getIsPinned();
  const meta = column.columnDef.meta;
  const isExpandColumn = column.id === TABLE_EXPAND_COLUMN_ID;
  const isExpandedToggle = isExpandColumn && (cell.row.getIsExpanded() || cell.row.depth > 0);

  const { canDnd, setNodeRef, dndStyle } = useColumnDnd(column);

  const pinningStyles = getPinningStyles(column);
  const lastLeft = isLastPinnedLeft(column, allLeafColumns, column.id);

  const isCut = meta?.resizeType === 'cut';
  const content = flexRender(cell.column.columnDef.cell, cell.getContext());

  const hasRenderActions = !!meta?.renderActions;
  const hasRenderMenu = !!meta?.renderMenuForMoreAction;
  const hasActions = hasRenderActions || hasRenderMenu;

  // Right padding to prevent content from hiding behind absolutely-positioned actions.
  // Layout: ACTIONS_PL + buttons(ACTION_BUTTON_SIZE each) + ACTIONS_GAP between them + ACTIONS_PR
  const actionsPaddingRight = hasActions
    ? ACTIONS_PL
    + (hasRenderActions ? ACTION_BUTTON_SIZE : 0)
    + (hasRenderActions && hasRenderMenu ? ACTIONS_GAP : 0)
    + (hasRenderMenu ? ACTION_BUTTON_SIZE : 0)
    + ACTIONS_PR
    : undefined;

  return (
    <Td
      data-testid={testId}
      className={cn(
        getAlignClass(meta),
        getExpandBorderClass(isExpandColumn, cell.row.depth),
        hasActions && 'relative',
        meta?.cellClassName,
        className,
      )}
      pinned={isPinned === 'left'}
      lastPinnedLeft={disablePinnedShadow ? false : lastLeft}
      expanded={isExpandedToggle}
      ref={canDnd ? setNodeRef : undefined}
      style={{
        ...pinningStyles,
        width: cell.column.getSize(),
        ...dndStyle,
        ...(isCut && { overflow: 'hidden' }),
        ...(actionsPaddingRight && { paddingRight: actionsPaddingRight }),
      }}
      colSpan={colSpan}
    >
      {isCut ? (
        <div className='overflow-hidden' style={{ minWidth: column.columnDef.size }}>
          {content}
        </div>
      ) : (
        content
      )}
      {hasActions && (
        <TableMasterCellActions
          row={cell.row}
          renderActions={meta?.renderActions}
          renderMenuForMoreAction={meta?.renderMenuForMoreAction}
        />
      )}
    </Td>
  );
};

TableBodyCell.displayName = 'TableBodyCell';
