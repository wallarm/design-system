import { useContext } from 'react';
import { QueryBarContext } from './QueryBarContext';
import type { QueryBarContextValue } from './types';

export const useQueryBarContext = (): QueryBarContextValue => {
  const ctx = useContext(QueryBarContext);
  if (!ctx) {
    throw new Error('useQueryBarContext must be used within a <QueryBar> component');
  }
  return ctx;
};
