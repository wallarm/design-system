import { createContext, useContext } from 'react';

import type { Column, RowData } from '@tanstack/react-table';

import type { DSTableFeatures } from '../lib/dsTableFeatures';

interface TableColumnMenuContextValue {
  column: Column<DSTableFeatures, RowData>;
}

export const TableColumnMenuContext = createContext<TableColumnMenuContextValue | null>(null);

export const useTableColumnMenuContext = (): TableColumnMenuContextValue => {
  const ctx = useContext(TableColumnMenuContext);
  if (!ctx) {
    throw new Error('TableColumnMenu item components must be rendered inside <TableColumnMenu>');
  }
  return ctx;
};
