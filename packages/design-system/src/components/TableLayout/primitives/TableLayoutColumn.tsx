import { useEffect } from 'react';
import { useTableLayoutContext } from '../TableLayoutContext';
import type { TableLayoutColumnAlign, TableLayoutColumnPin } from '../types';

export interface TableLayoutColumnProps {
  /** Column identity; cells bind to it via the same `columnId`. */
  columnId: string;
  /** Text alignment inherited by this column's cells. */
  align?: TableLayoutColumnAlign;
  /** Pin side (sticky offsets wired up by the column-engine plan). */
  pin?: TableLayoutColumnPin;
  /** Column width in px (applied to the underlying `<col>`). */
  width?: number;
}

export const TableLayoutColumn = ({ columnId, align, pin, width }: TableLayoutColumnProps) => {
  const { registerColumn, unregisterColumn } = useTableLayoutContext();

  useEffect(() => {
    registerColumn(columnId, { align, pin, width });
    return () => unregisterColumn(columnId);
  }, [columnId, align, pin, width, registerColumn, unregisterColumn]);

  return <col data-column-id={columnId} style={width ? { width } : undefined} />;
};
TableLayoutColumn.displayName = 'TableLayoutColumn';
