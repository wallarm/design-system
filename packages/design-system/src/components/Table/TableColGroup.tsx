import type { FC } from 'react';
import { TABLE_DRAG_HANDLE_COLUMN_ID, TABLE_EXPAND_COLUMN_ID, TABLE_SELECT_COLUMN_ID } from './lib';
import { useTableContext } from './TableContext';

const SYSTEM_COLUMN_IDS = new Set([
  TABLE_SELECT_COLUMN_ID,
  TABLE_EXPAND_COLUMN_ID,
  TABLE_DRAG_HANDLE_COLUMN_ID,
]);

interface TableColGroupProps {
  tableWidth: number;
}

/**
 * Renders a <colgroup> with exact pixel widths for every column.
 *
 * Fixed columns (system columns like _selection/_expand, and any column with
 * enableResizing: false + matching maxSize) get their exact pixel width.
 * Flexible columns share the remaining space proportionally by their TanStack sizes.
 *
 * All <col> widths sum to exactly tableWidth (matching the <table> inline width),
 * so table-fixed has zero leftover space to redistribute.
 */
export const TableColGroup: FC<TableColGroupProps> = ({ tableWidth }) => {
  const { table, stretch } = useTableContext();
  // Pinned first, exactly as the header row and the body cells are built
  // (`table_getHeaderGroups` / `row_getVisibleCells` both hoist the pinned
  // regions). `getVisibleLeafColumns` does NOT: it returns the column order
  // alone. The two agree until a `columnOrder` omits a pinned id — the
  // auto-injected `_selection` column is never in a caller's order — and then
  // TanStack appends that column at the end of the order while the header
  // still draws it first, so every <col> lands on the wrong header.
  const columns = [
    ...table.getStartVisibleLeafColumns(),
    ...table.getCenterVisibleLeafColumns(),
    ...table.getEndVisibleLeafColumns(),
  ];

  const isFixed = (col: (typeof columns)[number]) =>
    SYSTEM_COLUMN_IDS.has(col.id) ||
    (!col.getCanResize() && col.columnDef.minSize === col.columnDef.maxSize) ||
    col.columnDef.meta?.resizeType === 'cut';

  const fixedWidth = columns.filter(isFixed).reduce((sum, c) => sum + c.getSize(), 0);

  const totalFlexSize = columns.filter(c => !isFixed(c)).reduce((sum, c) => sum + c.getSize(), 0);

  const availableForFlex = tableWidth - fixedWidth;

  return (
    <colgroup>
      {columns.map(col => {
        if (isFixed(col) || !stretch) {
          return <col key={col.id} style={{ width: col.getSize() }} />;
        }

        if (totalFlexSize === 0) return <col key={col.id} />;

        const pixelWidth = (col.getSize() / totalFlexSize) * availableForFlex;
        return <col key={col.id} style={{ width: pixelWidth }} />;
      })}
      {!stretch && <col key='_filler' />}
    </colgroup>
  );
};

TableColGroup.displayName = 'TableColGroup';
