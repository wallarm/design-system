import { useContext } from 'react';

import { TabsSharedContext } from './TabsSharedContext';

export const useTabsSharedContext = () => {
  const ctx = useContext(TabsSharedContext);

  if (!ctx) {
    throw new Error(
      'useTabsSharedContext components must be used inside TabsSharedContentProvider',
    );
  }

  return ctx;
};
