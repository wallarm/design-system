import type { FC, PropsWithChildren } from 'react';

import {
  SelectSharedContext,
  type SelectSharedContextValue,
} from './SelectSharedContext';

interface SelectSharedProviderProps {
  value: SelectSharedContextValue;
}

export const SelectSharedProvider: FC<
  PropsWithChildren<SelectSharedProviderProps>
> = ({ children, value }) => {
  return (
    <SelectSharedContext.Provider value={value}>
      {children}
    </SelectSharedContext.Provider>
  );
};
