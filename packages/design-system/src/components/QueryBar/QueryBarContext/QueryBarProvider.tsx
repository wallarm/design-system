import type { FC, ReactNode } from 'react';
import { QueryBarContext } from './QueryBarContext';
import type { QueryBarContextValue } from './types';

interface QueryBarProviderProps {
  value: QueryBarContextValue;
  children: ReactNode;
}

export const QueryBarProvider: FC<QueryBarProviderProps> = ({ value, children }) => (
  <QueryBarContext.Provider value={value}>{children}</QueryBarContext.Provider>
);

QueryBarProvider.displayName = 'QueryBarProvider';
