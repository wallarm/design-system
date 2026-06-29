import { useCallback, useState } from 'react';
import type { TableLayoutColumnPresentation } from './types';

export const useColumnRegistry = () => {
  const [columns, setColumns] = useState<Record<string, TableLayoutColumnPresentation>>({});

  const registerColumn = useCallback((id: string, meta: TableLayoutColumnPresentation) => {
    setColumns(prev => ({ ...prev, [id]: meta }));
  }, []);

  const unregisterColumn = useCallback((id: string) => {
    setColumns(prev => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const getColumn = useCallback((id: string) => columns[id], [columns]);

  return { columns, registerColumn, unregisterColumn, getColumn };
};
