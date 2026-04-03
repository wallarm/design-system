import { type Cell, flexRender } from '@tanstack/react-table';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { usePreviewCell } from '../hooks';
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
import { TablePreviewToggle } from '../TablePreviewToggle';

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
  const { allLeafColumns, masterColumnId } = useTableContext<T>();
  const testId = useTestId('body-cell');
  const column = cell.column;
  const isPinned = column.getIsPinned();
  const meta = column.columnDef.meta;
  const isExpandColumn = column.id === TABLE_EXPAND_COLUMN_ID;
  const isExpandedToggle = isExpandColumn && (cell.row.getIsExpanded() || cell.row.depth > 0);

  const { canDnd, setNodeRef, dndStyle } = useColumnDnd(column);
  const pinningStyles = getPinningStyles(column);
  const lastLeft = isLastPinnedLeft(column, allLeafColumns, column.id);
  const { isMasterTrigger, isButtonTrigger, isActive, togglePreview, tooltipText } =
    usePreviewCell<T>(column.id, cell.row.id);

  const isCut = column.id === masterColumnId || meta?.resizeType === 'cut';
  const content = flexRender(cell.column.columnDef.cell, cell.getContext());
  const hasActions = isButtonTrigger || !!meta?.renderPreviewAction || !!meta?.renderMenuAction;

  const renderContent = () => {
    const wrappedContent = tooltipText ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='min-w-0 [&>*]:block [&>*]:truncate'>{content}</span>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    ) : (
      <span className='min-w-0 [&>*]:block [&>*]:truncate'>{content}</span>
    );

    if (isCut && hasActions) {
      return (
        <div className='flex items-center justify-between gap-2'>
          {wrappedContent}
          <TableMasterCellActions>
            {isButtonTrigger && <TablePreviewToggle active={isActive} onClick={togglePreview} />}
            {meta?.renderPreviewAction?.(cell.row)}
            {meta?.renderMenuAction?.(cell.row)}
          </TableMasterCellActions>
        </div>
      );
    }

    if (isCut) {
      return (
        <div className='overflow-hidden' style={{ minWidth: column.columnDef.size }}>
          {tooltipText ? wrappedContent : content}
        </div>
      );
    }

    return tooltipText ? wrappedContent : content;
  };

  return (
    <Td
      data-testid={testId}
      className={cn(
        getAlignClass(meta),
        getExpandBorderClass(isExpandColumn, cell.row.depth),
        isCut && 'pr-0',
        isMasterTrigger && 'cursor-pointer',
        meta?.cellClassName,
        className,
      )}
      pinned={isPinned === 'left'}
      lastPinnedLeft={disablePinnedShadow ? false : lastLeft}
      expanded={isExpandedToggle}
      ref={canDnd ? setNodeRef : undefined}
      onClick={isMasterTrigger ? togglePreview : undefined}
      style={{
        ...pinningStyles,
        width: cell.column.getSize(),
        ...dndStyle,
        ...(isCut && { overflow: 'hidden' }),
      }}
      colSpan={colSpan}
    >
      {renderContent()}
    </Td>
  );
};

TableBodyCell.displayName = 'TableBodyCell';
