import { useContext } from 'react';
import { FilterContext } from './FilterContext';
import type { FilterContextValue } from './types';

export const useFilterContext = (): FilterContextValue => {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilterContext must be used within a <FilterField> component');
  }
  return ctx;
};
