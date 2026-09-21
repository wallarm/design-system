import { memo, type Ref, useCallback } from 'react';
import type { Row, RowData } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { DROP_INDICATOR_BASE } from './classes';
import {
  type DSTableFeatures,
  TABLE_DRAG_HANDLE_COLUMN_ID,
  TABLE_EXPAND_COLUMN_ID,
  TABLE_SELECT_COLUMN_ID,
  useRowDnd,
} from './lib';
import { Td, Tr } from './primitives';
import { TableBodyCell } from './TableBody/TableBodyCell';
import { useRowDndIndicator } from './TableBody/TableBodyRowDndContext';
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
  const {
    table,
    expandingEnabled,
    activeRowId,
    isLoading,
    renderExpandedRow,
    stretch,
    hasSubRowGrouping,
    allLeafColumns,
  } = useTableContext<T>();
  const testId = useTestId('row');
  const { canDnd, isDragging, setNodeRef, style: dndStyle, attributes, listeners } = useRowDnd(row);
  const { activeId, overId } = useRowDndIndicator();
  const isGroupParent = row.subRows.length > 0;
  const isSelected = isGroupParent ? row.getIsAllSubRowsSelected() : row.getIsSelected();
  const isPreviewActive = activeRowId === row.id;

  // The container frame draws the table's bottom edge, so the last row must
  // not draw its own bottom border (otherwise 1px + 1px stack into a 2px line).
  // Not "last" while a loading skeleton follows, and when the last row is
  // expanded the edge belongs to its expanded content, not to the row itself.
  const flatRows = table.getRowModel().rows;
  const isLastTableRow = !isLoading && flatRows[flatRows.length - 1]?.id === row.id;
  const hasExpandedContent = expandingEnabled && !!renderExpandedRow && row.getIsExpanded();
  const isLastRow = isLastTableRow && !hasExpandedContent;
  const isLastRowExpanded = isLastTableRow && hasExpandedContent;

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

    // Make expanded group parent rows CSS-sticky so they pin instantly (no
    // frame delay). The JS overlay (StickyGroupParent, z-[21]) layers on top
    // for the push-up animation and virtualization fallback.
    const stickyStyle =
      hasSubRowGrouping && row.getIsExpanded()
        ? {
            position: 'sticky' as const,
            top: allLeafColumns.some(c => c.columnDef.meta?.description?.type === 'text') ? 48 : 32,
            zIndex: 20,
          }
        : undefined;

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
          style={stickyStyle}
        >
          {systemCells.map(cell => (
            <TableBodyCell key={cell.id} cell={cell} disablePinnedShadow lastRow={isLastRow} />
          ))}
          {firstDataCell && (
            <TableBodyCell
              cell={firstDataCell}
              className='border-r-0'
              disablePinnedShadow
              lastRow={isLastRow}
            />
          )}
          {dataCells.slice(1).map(cell => (
            <Td
              key={cell.id}
              className={cn(
                'border-b border-border-primary-light bg-bg-surface-2 overlay',
                'group-hover/row:overlay-states-primary-hover group-data-[selected]/row:overlay-states-primary-active',
                'group-data-[preview-active]/row:overlay-states-primary-hover group-has-[[data-state=open]]/row:overlay-states-primary-hover',
                isLastRow && 'border-b-0',
              )}
              style={{ width: cell.column.getSize() }}
              aria-hidden='true'
            />
          ))}
          {!stretch && <Td pinned={false} aria-hidden />}
        </Tr>
        {expandingEnabled && <TableRowExpanded row={row} lastRow={isLastRowExpanded} />}
      </>
    );
  }

  // Compute orange drop indicator position for this row.
  // When hovering over a row while dragging, the indicator shows where the
  // dragged row will be inserted: above if dragging downward-to-here,
  // below if dragging upward-to-here.
  let dropIndicator: 'above' | 'below' | undefined;
  if (overId === row.id && activeId != null && activeId !== row.id) {
    const activeIndex = flatRows.findIndex(r => r.id === activeId);
    const overIndex = flatRows.findIndex(r => r.id === row.id);
    if (activeIndex !== -1 && overIndex !== -1) {
      dropIndicator = activeIndex < overIndex ? 'below' : 'above';
    }
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
              lastRow={isLastRow}
              dropIndicator={dropIndicator}
            />
          );
        })}
        {!stretch && (
          <Td
            pinned={false}
            aria-hidden
            className={cn(
              dropIndicator && DROP_INDICATOR_BASE,
              dropIndicator === 'above' && 'after:top-0',
              dropIndicator === 'below' && 'after:-bottom-px',
            )}
            style={dropIndicator ? { overflow: 'visible' } : undefined}
          />
        )}
      </Tr>
      {expandingEnabled && (
        <TableRowExpanded row={row} dndStyle={dndStyle} lastRow={isLastRowExpanded} />
      )}
    </>
  );
};

TableRowInner.displayName = 'TableRow';

export const TableRow = memo(TableRowInner) as typeof TableRowInner;
