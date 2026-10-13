import type { ColumnDef, Row, RowData } from '@tanstack/react-table';
import { GripVertical } from '../../../icons';
import { useTableContext } from '../TableContext/useTableContext';
import { TABLE_DRAG_HANDLE_COLUMN_ID, TABLE_DRAG_HANDLE_COLUMN_WIDTH } from './constants';
import type { DSTableFeatures } from './dsTableFeatures';
import { isGroupRow } from './isGroupRow';
import { useTableValue } from './tableReactivity';

/** The grip — not on group rows, which never move. */
const DragHandle = <T extends RowData>({ row }: { row: Row<DSTableFeatures, T> }) => {
  const { showEmptyGroups } = useTableContext<T>();
  const isGroup = useTableValue(() => isGroupRow(row, showEmptyGroups));
  return isGroup ? null : <GripVertical size='sm' className='text-text-secondary' />;
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
