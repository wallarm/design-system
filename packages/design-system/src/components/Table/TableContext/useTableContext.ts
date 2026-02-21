import { useContext } from 'react';
import { TableContext } from './TableContext';
import type { TableContextValue } from './types';

export const useTableContext = <T>(): TableContextValue<T> => {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error('useTableContext must be used within a <Table> component');
  }
  return ctx as TableContextValue<T>;
};
