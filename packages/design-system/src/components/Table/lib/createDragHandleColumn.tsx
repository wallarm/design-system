import type { ColumnDef, Row, RowData } from '@tanstack/react-table';

import { GripVertical } from '../../../icons';
import { cn } from '../../../utils/cn';
import { useTableContext } from '../TableContext/useTableContext';
import { TABLE_DRAG_HANDLE_COLUMN_ID, TABLE_DRAG_HANDLE_COLUMN_WIDTH } from './constants';
import type { DSTableFeatures } from './dsTableFeatures';
import { isGroupRow } from './isGroupRow';
import { useTableValue } from './tableReactivity';
import { useRowCanDrag } from './useRowDnd';

/** The grip — disabled on rows locked by `getRowCanDrag`, none on group rows. */
const DragHandle = <T extends RowData>({ row }: { row: Row<DSTableFeatures, T> }) => {
  const { showEmptyGroups } = useTableContext<T>();
  const canDrag = useRowCanDrag(row);
  const isGroup = useTableValue(() => isGroupRow(row, showEmptyGroups));
  if (isGroup) return null;
  return (
    <GripVertical
      size='sm'
      className={cn('text-text-secondary', !canDrag && 'cursor-not-allowed opacity-50')}
    />
  );
};

/**
 * Creates a drag-handle column for row reordering.
 * Automatically injected by Table when `onRowReorder` is provided.
 * The actual drag listeners are applied by `TableRow` on the cell, not here.
 */
export const createDragHandleColumn = <T extends RowData>(): ColumnDef<
  DSTableFeatures,
  T,
  unknown
> => {
  return {
    id: TABLE_DRAG_HANDLE_COLUMN_ID,
    size: TABLE_DRAG_HANDLE_COLUMN_WIDTH,
    minSize: TABLE_DRAG_HANDLE_COLUMN_WIDTH,
    maxSize: TABLE_DRAG_HANDLE_COLUMN_WIDTH,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    enablePinning: false,
    meta: {
      headerClassName: 'px-4 py-4',
      cellClassName: 'px-4 py-8 align-middle text-center',
    },
    header: () => null,
    cell: ({ row }) => <DragHandle row={row} />,
  };
};
