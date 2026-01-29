import { createContext } from 'react';

export interface SelectSharedContextValue {
  loading?: boolean;
}

export const SelectSharedContext = createContext<SelectSharedContextValue>({});
