import { memo, type Ref, useCallback } from 'react';
import type { Row, RowData } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  type DSTableFeatures,
  TABLE_DRAG_HANDLE_COLUMN_ID,
  TABLE_EXPAND_COLUMN_ID,
  TABLE_SELECT_COLUMN_ID,
  useRowDnd,
} from './lib';
import { Td, Tr } from './primitives';
import { TableBodyCell } from './TableBody/TableBodyCell';
import { useTableContext } from './TableContext';
import { TableRowExpanded } from './TableRowExpanded';

const SYSTEM_COLUMN_IDS = new Set([
  TABLE_EXPAND_COLUMN_ID,
  TABLE_SELECT_COLUMN_ID,
  TABLE_DRAG_HANDLE_COLUMN_ID,
]);

interface TableRowProps<T extends RowData> {
  row: Row<DSTableFeatures, T>;
  ref?: Ref<HTMLTableRowElement>;
  'data-index'?: number;
}

const TableRowInner = <T extends RowData>({
  row,
  ref,
  'data-index': dataIndex,
}: TableRowProps<T>) => {
  const { expandingEnabled, activeRowId } = useTableContext<T>();
  const testId = useTestId('row');
  const { canDnd, isDragging, setNodeRef, style: dndStyle, attributes, listeners } = useRowDnd(row);
  const isGroupParent = row.subRows.length > 0;
  const isSelected = isGroupParent ? row.getIsAllSubRowsSelected() : row.getIsSelected();
  const isPreviewActive = activeRowId === row.id;

  // Compose the external ref (virtualizer's measureElement or consumer ref) with dnd-kit's setNodeRef
  const composedRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (canDnd) setNodeRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLTableRowElement | null }).current = node;
    },
    [canDnd, setNodeRef, ref],
  );

  if (isGroupParent) {
    const cells = row.getVisibleCells();
    const systemCells = cells.filter(c => SYSTEM_COLUMN_IDS.has(c.column.id));
    const dataCells = cells.filter(c => !SYSTEM_COLUMN_IDS.has(c.column.id));
    const firstDataCell = dataCells[0];

    return (
      <>
        <Tr
          ref={composedRef}
          data-index={dataIndex}
          data-row-id={row.id}
          data-testid={testId}
          className='group/row'
          data-selected={isSelected || undefined}
          data-preview-active={isPreviewActive || undefined}
          aria-selected={isSelected || undefined}
        >
          {systemCells.map(cell => (
            <TableBodyCell key={cell.id} cell={cell} disablePinnedShadow />
          ))}
          {firstDataCell && (
            <TableBodyCell cell={firstDataCell} className='border-r-0' disablePinnedShadow />
          )}
          {dataCells.slice(1).map(cell => (
            <Td
              key={cell.id}
              className={cn(
                'border-b border-border-primary-light bg-bg-surface-2 overlay',
                'group-hover/row:overlay-states-primary-hover group-data-[selected]/row:overlay-states-primary-active',
              )}
              style={{ width: cell.column.getSize() }}
              aria-hidden='true'
            />
          ))}
        </Tr>
        {expandingEnabled && <TableRowExpanded row={row} />}
      </>
    );
  }

  return (
    <>
      <Tr
        ref={composedRef}
        data-index={dataIndex}
        data-row-id={row.id}
        data-testid={testId}
        className='group/row'
        data-selected={isSelected || undefined}
        data-preview-active={isPreviewActive || undefined}
        data-dragging={isDragging || undefined}
        aria-selected={isSelected || undefined}
        data-depth={row.depth > 0 ? row.depth : undefined}
        style={dndStyle}
      >
        {row.getVisibleCells().map(cell => {
          const isDragHandle = cell.column.id === TABLE_DRAG_HANDLE_COLUMN_ID;
          return (
            <TableBodyCell
              key={cell.id}
              cell={cell}
              dragListeners={isDragHandle ? listeners : undefined}
              dragAttributes={isDragHandle ? attributes : undefined}
            />
          );
        })}
      </Tr>
      {expandingEnabled && <TableRowExpanded row={row} dndStyle={dndStyle} />}
    </>
  );
};

TableRowInner.displayName = 'TableRow';

export const TableRow = memo(TableRowInner) as typeof TableRowInner;
