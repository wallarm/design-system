import type { ColumnDef, RowData } from '@tanstack/react-table';
import { GripVertical } from '../../../icons';
import { TABLE_DRAG_HANDLE_COLUMN_ID, TABLE_DRAG_HANDLE_COLUMN_WIDTH } from './constants';
import type { DSTableFeatures } from './dsTableFeatures';

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
      headerClassName: 'px-8 py-4',
      cellClassName: 'px-8 py-8',
    },
    header: () => null,
    cell: () => <GripVertical size='sm' className='text-text-tertiary' />,
  };
};
