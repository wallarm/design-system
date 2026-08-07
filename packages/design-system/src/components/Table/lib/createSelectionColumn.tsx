import type {
  CellContext,
  ColumnDef,
  HeaderContext,
  Row,
  RowData,
  RowSelectionState,
  Table,
} from '@tanstack/react-table';
import { useIsKeyPressed } from '../../../hooks';
import { Checkbox, CheckboxIndicator } from '../../Checkbox';
import { useTableContext } from '../TableContext';
import { TABLE_SELECT_COLUMN_ID, TABLE_SELECT_COLUMN_WIDTH } from './constants';
import type { DSTableFeatures } from './dsTableFeatures';

/**
 * Selects or deselects a range of rows between two indices.
 * The action (select/deselect) is determined by the clicked row's current state:
 * - Row was unselected → select the entire range
 * - Row was selected → deselect the entire range
 */
const applyRangeSelection = <T extends RowData>(
  rows: Row<DSTableFeatures, T>[],
  fromIndex: number,
  toIndex: number,
  table: Table<DSTableFeatures, T>,
  clickedRow: Row<DSTableFeatures, T>,
) => {
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  const selecting = !clickedRow.getIsSelected();

  const newSelection: RowSelectionState = { ...table.store.state.rowSelection };

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
const SelectionCell = <T extends RowData>({
  row,
  table,
}: CellContext<DSTableFeatures, T, unknown>) => {
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
 * Header component for the "select all" checkbox.
 *
 * v9 dropped a guard that v8's Page-variant selection getters used to have.
 * v8's `getIsSomePageRowsSelected()` short-circuited to `false` when
 * `getIsAllPageRowsSelected()` was already `true`
 * (`@tanstack/table-core@8.21.3/build/lib/features/RowSelection.js:214`).
 * v9's equivalent (`@tanstack/table-core@9.0.0/dist/features/row-selection/
 * rowSelectionFeature.utils.js:255-256`) has no such check — it just tests
 * "is any selectable row in `getPaginatedRowModel().flatRows` selected?" — so
 * it returns `true` even when *all* rows are selected. With
 * `checked={indeterminate ? 'indeterminate' : checked}`, that meant the
 * checkbox rendered `'indeterminate'` (never `true`) as soon as one row was
 * selected, including at full selection, so the native `.checked` DOM
 * property never became `true`.
 *
 * On top of that, `TableHeadCell` invokes function-shaped headers with a
 * plain synchronous call (`headerDef(headerCtx)`), so the `table` inside
 * `HeaderContext` is the framework-agnostic core `Table`, not the React
 * adapter's `ReactTable` — it has no `.state` at all (confirmed: reading
 * `table.state` there throws). That's real, but it isn't why the original
 * bug happened (the original code never read `.state`); it does mean a
 * one-line guard fix inside a bare closure would still be fragile long-term.
 * Rendering this as a real named component instead — mirroring `SelectionCell`
 * above — lets it call `useTableContext()` for the real, reactive `ReactTable`
 * and compute checked/indeterminate locally instead of depending on
 * `getIsSomePageRowsSelected()`/`getIsAllPageRowsSelected()` (or their
 * non-Page counterparts) at all.
 *
 * Checked/indeterminate is computed from `table.state.rowSelection` and
 * `getFilteredRowModel().flatRows` — the same row universe
 * `toggleAllRowsSelected()` (the click handler below) actually acts on, and
 * what `getIsAllRowsSelected()` itself iterates. `flatRows` (not the
 * top-level `rows` used by `SelectionCell`/`applyRangeSelection` for
 * index-based range selection) so grouped/nested sub-rows at any depth count
 * toward "all selected". `getFilteredRowModel()` rather than `getRowModel()`
 * matters once `grouping` is active: `getRowModel()` (post-grouping) includes
 * synthetic group-header rows that `getCanSelect()` still allows but that
 * `toggleAllRowsSelected()` never selects — using it here would leave the
 * checkbox stuck on indeterminate forever.
 */
const SelectAllHeaderCell = <T extends RowData>(
  _props: HeaderContext<DSTableFeatures, T, unknown>,
) => {
  const { table } = useTableContext<T>();

  const selectableRows = table.getFilteredRowModel().flatRows.filter(row => row.getCanSelect());
  const selectedCount = selectableRows.filter(row => table.state.rowSelection[row.id]).length;
  const checked = selectableRows.length > 0 && selectedCount === selectableRows.length;
  const indeterminate = selectedCount > 0 && !checked;

  return (
    <Checkbox
      checked={indeterminate ? 'indeterminate' : checked}
      onCheckedChange={() => table.toggleAllRowsSelected(!checked)}
      disabled={selectableRows.length === 0}
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
export const createSelectionColumn = <T extends RowData>(): ColumnDef<DSTableFeatures, T> => {
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
      headerClassName: 'px-8 py-4',
      cellClassName: 'px-8 py-8',
    },
    header: props => <SelectAllHeaderCell {...props} />,
    cell: props => <SelectionCell {...props} />,
  };
};
