import { createContext, type RefObject, useContext } from 'react';
import type { TableLayoutColumnPresentation } from './types';

export interface TableLayoutContextValue {
  registerColumn: (id: string, meta: TableLayoutColumnPresentation) => void;
  unregisterColumn: (id: string) => void;
  getColumn: (id: string) => TableLayoutColumnPresentation | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
}

export const TableLayoutContext = createContext<TableLayoutContextValue | null>(null);

export const useTableLayoutContext = (): TableLayoutContextValue => {
  const ctx = useContext(TableLayoutContext);
  if (!ctx) {
    throw new Error('TableLayout primitives must be rendered inside <TableLayout>');
  }
  return ctx;
};
