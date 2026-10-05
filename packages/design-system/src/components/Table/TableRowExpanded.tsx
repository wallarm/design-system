import type { CSSProperties } from 'react';
import type { Row, RowData } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  type DSTableFeatures,
  RenderCallback,
  TABLE_EXPAND_COLUMN_ID,
  useRenderEveryTime,
  useTableValue,
} from './lib';
import { Td, Tr } from './primitives';
import { useTableContext } from './TableContext';

interface TableRowExpandedProps<T extends RowData> {
  row: Row<DSTableFeatures, T>;
  /** When row DnD is active, pass the same transform style so expanded content moves with its parent row. */
  dndStyle?: CSSProperties;
  /** Expanded content is the table's bottom edge — drop its bottom border, the frame draws it */
  lastRow?: boolean;
}

export const TableRowExpanded = <T extends RowData>({
  row,
  dndStyle,
  lastRow,
}: TableRowExpandedProps<T>) => {
  const { table, stretch, renderExpandedRow } = useTableContext<T>();
  const testId = useTestId('row-expanded');

  const isExpanded = useTableValue(() => row.getIsExpanded());
  const visibleColumns = useTableValue(() => table.getVisibleLeafColumns());
  // Consumer renderer — may call hooks, read context or read any row getter,
  // so it runs on every render (see useRenderEveryTime), as its own component
  // so its hooks do not join this component's hook list only while expanded.
  const content = useRenderEveryTime(() =>
    isExpanded && renderExpandedRow ? (
      <RenderCallback render={renderExpandedRow} arg={row} />
    ) : null,
  );

  if (!isExpanded || !renderExpandedRow) return null;

  const hasExpandColumn = visibleColumns.some(col => col.id === TABLE_EXPAND_COLUMN_ID);
  const fillerOffset = stretch ? 0 : 1;

  // Expand column stays empty, content spans the remaining columns
  const contentColSpan =
    (hasExpandColumn ? visibleColumns.length - 1 : visibleColumns.length) + fillerOffset;

  return (
    <Tr data-testid={testId} style={dndStyle}>
      {hasExpandColumn && (
        <Td className='border-b-0 border-r border-border-primary-light bg-bg-surface-2 sticky left-0' />
      )}
      <Td
        colSpan={contentColSpan}
        className={cn(
          'border-b border-border-primary-light bg-bg-primary p-0',
          lastRow && 'border-b-0',
        )}
      >
        <div className='px-16 py-12'>{content}</div>
      </Td>
    </Tr>
  );
};

TableRowExpanded.displayName = 'Expanded';
