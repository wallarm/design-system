import { createContext, type RefObject } from 'react';

import type { TabsSize, TabsVariant } from '../types';

export interface TabsSharedContextValue {
  scrollRef: RefObject<HTMLDivElement | null>;
  variant?: TabsVariant;
  size?: TabsSize;
}

export const TabsSharedContext = createContext<TabsSharedContextValue>({
  scrollRef: { current: null },
  size: 'medium',
  variant: 'default',
});
