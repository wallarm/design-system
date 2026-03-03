import type { FC, ReactNode } from 'react';
import { FilterContext } from './FilterContext';
import type { FilterContextValue } from './types';

interface FilterProviderProps {
  value: FilterContextValue;
  children: ReactNode;
}

export const FilterProvider: FC<FilterProviderProps> = ({ value, children }) => (
  <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
);

FilterProvider.displayName = 'FilterProvider';
