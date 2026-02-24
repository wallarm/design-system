import type { FC } from 'react';
import { TABLE_EXPAND_COLUMN_ID, TABLE_SELECT_COLUMN_ID } from './lib';
import { useTableContext } from './TableContext';

const SYSTEM_COLUMN_IDS = new Set([TABLE_SELECT_COLUMN_ID, TABLE_EXPAND_COLUMN_ID]);

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
  const { table } = useTableContext();
  const columns = table.getVisibleLeafColumns();

  const isFixed = (col: (typeof columns)[number]) =>
    SYSTEM_COLUMN_IDS.has(col.id) ||
    (!col.getCanResize() && col.columnDef.minSize === col.columnDef.maxSize);

  const fixedWidth = columns.filter(isFixed).reduce((sum, c) => sum + c.getSize(), 0);

  const totalFlexSize = columns.filter(c => !isFixed(c)).reduce((sum, c) => sum + c.getSize(), 0);

  const availableForFlex = tableWidth - fixedWidth;

  return (
    <colgroup>
      {columns.map(col => {
        if (isFixed(col)) {
          return <col key={col.id} style={{ width: col.getSize() }} />;
        }

        if (totalFlexSize === 0) return <col key={col.id} />;

        const pixelWidth = (col.getSize() / totalFlexSize) * availableForFlex;
        return <col key={col.id} style={{ width: pixelWidth }} />;
      })}
    </colgroup>
  );
};

TableColGroup.displayName = 'TableColGroup';
