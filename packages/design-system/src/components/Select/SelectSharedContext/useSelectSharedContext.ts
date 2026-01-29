import { useContext } from 'react';

import {
  SelectSharedContext,
  type SelectSharedContextValue,
} from './SelectSharedContext';

export const useSelectSharedContext = (): SelectSharedContextValue => {
  const context = useContext(SelectSharedContext);

  if (!context) {
    throw new Error(
      'useSelectSharedContext must be used within a SelectSharedProvider',
    );
  }

  return context;
};
