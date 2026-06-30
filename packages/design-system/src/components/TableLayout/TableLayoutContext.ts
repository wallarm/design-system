import { createContext, type RefObject, useContext } from 'react';
import type { TableLayoutColumnResizeMode, TableLayoutColumnResolved } from './types';

export interface TableLayoutContextValue {
  registerColumn: (id: string, meta: TableLayoutColumnResolved) => void;
  unregisterColumn: (id: string) => void;
  getColumn: (id: string) => TableLayoutColumnResolved | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
  resizeMode: TableLayoutColumnResizeMode;
  /** Present only when a controller engine is attached (`<TableLayout controller>`). */
  setColumnSize?: (columnId: string, width: number) => void;
}

export const TableLayoutContext = createContext<TableLayoutContextValue | null>(null);

export const useTableLayoutContext = (): TableLayoutContextValue => {
  const ctx = useContext(TableLayoutContext);
  if (!ctx) {
    throw new Error('TableLayout primitives must be rendered inside <TableLayout>');
  }
  return ctx;
};
