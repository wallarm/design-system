import { useContext } from 'react';
import { FilterInputContext } from './FilterInputContext';
import type { FilterInputContextValue } from './types';

export const useFilterInputContext = (): FilterInputContextValue => {
  const ctx = useContext(FilterInputContext);
  if (!ctx) {
    throw new Error('useFilterInputContext must be used within a <FilterInput> component');
  }
  return ctx;
};
