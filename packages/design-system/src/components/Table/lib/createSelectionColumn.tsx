import type { CellContext, ColumnDef, Row, RowSelectionState, Table } from '@tanstack/react-table';
import { useIsKeyPressed } from '../../../hooks';
import { Checkbox, CheckboxIndicator } from '../../Checkbox';
import { useTableContext } from '../TableContext';
import { TABLE_SELECT_COLUMN_ID, TABLE_SELECT_COLUMN_WIDTH } from './constants';

/**
 * Selects or deselects a range of rows between two indices.
 * The action (select/deselect) is determined by the clicked row's current state:
 * - Row was unselected → select the entire range
 * - Row was selected → deselect the entire range
 */
const applyRangeSelection = <T,>(
  rows: Row<T>[],
  fromIndex: number,
  toIndex: number,
  table: Table<T>,
  clickedRow: Row<T>,
) => {
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  const selecting = !clickedRow.getIsSelected();

  const newSelection: RowSelectionState = { ...table.getState().rowSelection };

  for (let i = start; i <= end; i++) {
    const row = rows[i];

    if (!row?.getCanSelect()) continue;

    if (selecting) {
      newSelection[row.id] = true;
    } else {
      delete newSelection[row.id];
    }
  }

  table.setRowSelection(newSelection);
};

/**
 * Cell component that handles shift-click range selection.
 * Uses useIsKeyPressed hook to detect Shift key state.
 */
const SelectionCell = <T,>({ row, table }: CellContext<T, unknown>) => {
  const { lastSelectedRowIndexRef } = useTableContext<T>();
  const shiftRef = useIsKeyPressed('Shift');
  const hasSubRows = row.subRows.length > 0;

  const handleCheckedChange = () => {
    if (hasSubRows) {
      // Parent row: toggle all sub-rows
      const allSelected = row.getIsAllSubRowsSelected();
      row.subRows.forEach(subRow => subRow.toggleSelected(!allSelected));
      return;
    }

    const rows = table.getRowModel().rows;
    const currentIndex = rows.findIndex(r => r.id === row.id);

    if (shiftRef.current && lastSelectedRowIndexRef.current !== null) {
      applyRangeSelection(rows, lastSelectedRowIndexRef.current, currentIndex, table, row);
    } else {
      row.toggleSelected(!row.getIsSelected());
    }

    lastSelectedRowIndexRef.current = currentIndex;
  };

  // Parent row: derive checked state from sub-rows
  const checked = hasSubRows
    ? row.getIsAllSubRowsSelected()
      ? true
      : row.getIsSomeSelected()
        ? 'indeterminate'
        : false
    : row.getIsSelected();

  return (
    <Checkbox
      checked={checked}
      disabled={!hasSubRows && !row.getCanSelect()}
      onCheckedChange={handleCheckedChange}
    >
      <CheckboxIndicator />
    </Checkbox>
  );
};

/**
 * Creates a checkbox selection column for use in Table.
 * Automatically injected by Table when `onRowSelectionChange` is provided.
 * Supports shift-click range selection.
 */
export const createSelectionColumn = <T,>(): ColumnDef<T> => {
  return {
    id: TABLE_SELECT_COLUMN_ID,
    size: TABLE_SELECT_COLUMN_WIDTH,
    minSize: TABLE_SELECT_COLUMN_WIDTH,
    maxSize: TABLE_SELECT_COLUMN_WIDTH,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    enablePinning: false,
    meta: {
      headerClassName: 'px-8 py-10',
      cellClassName: 'px-8 py-10',
    },
    header: ({ table }) => {
      const checked = table.getIsAllPageRowsSelected();
      const indeterminate = table.getIsSomePageRowsSelected();

      return (
        <Checkbox
          checked={indeterminate ? 'indeterminate' : checked}
          onCheckedChange={() => table.toggleAllPageRowsSelected(!checked)}
        >
          <CheckboxIndicator />
        </Checkbox>
      );
    },
    cell: props => <SelectionCell {...props} />,
  };
};
