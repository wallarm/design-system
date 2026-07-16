import { useEffect } from 'react';
import { computeColumnLayout } from '../lib/computeColumnLayout';
import { useTableLayoutContext } from '../TableLayoutContext';
import type { TableLayoutColumnDef } from '../types';

export type TableLayoutColumnProps = TableLayoutColumnDef;

export const TableLayoutColumn = ({
  columnId,
  align,
  pin,
  width,
  minWidth,
  maxWidth,
  resizable,
  hidden,
}: TableLayoutColumnProps) => {
  const { registerColumn, unregisterColumn } = useTableLayoutContext();

  // Effect deps are PRIMITIVE props only — never a freshly-built resolved object
  // (which changes identity every render and would loop the registry). The resolved
  // is rebuilt inside the effect from the same primitives.
  useEffect(() => {
    const { resolved } = computeColumnLayout([
      { columnId, align, pin, width, minWidth, maxWidth, resizable, hidden },
    ]);
    // computeColumnLayout always produces an entry for every id in its input defs
    registerColumn(columnId, resolved[columnId]!);
    return () => unregisterColumn(columnId);
  }, [
    columnId,
    align,
    pin,
    width,
    minWidth,
    maxWidth,
    resizable,
    hidden,
    registerColumn,
    unregisterColumn,
  ]);

  if (hidden) return null;
  return <col data-column-id={columnId} style={width ? { width } : undefined} />;
};
TableLayoutColumn.displayName = 'TableLayoutColumn';
