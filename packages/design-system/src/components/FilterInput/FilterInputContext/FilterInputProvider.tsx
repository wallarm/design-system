import type { FC, ReactNode } from 'react';
import { FilterInputContext } from './FilterInputContext';
import type { FilterInputContextValue } from './types';

interface FilterInputProviderProps {
  value: FilterInputContextValue;
  children: ReactNode;
}

export const FilterInputProvider: FC<FilterInputProviderProps> = ({ value, children }) => (
  <FilterInputContext.Provider value={value}>{children}</FilterInputContext.Provider>
);

FilterInputProvider.displayName = 'FilterInputProvider';
