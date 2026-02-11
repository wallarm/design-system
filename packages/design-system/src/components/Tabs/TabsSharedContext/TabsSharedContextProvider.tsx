import { type FC, type PropsWithChildren, useRef } from 'react';
import type { TabsSize, TabsVariant } from '../types';
import { TabsSharedContext } from './TabsSharedContext';

interface TabsSharedContextProviderProps extends PropsWithChildren {
  size?: TabsSize;
  variant?: TabsVariant;
}

export const TabsSharedContextProvider: FC<TabsSharedContextProviderProps> = ({
  children,
  size = 'medium',
  variant = 'default',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <TabsSharedContext.Provider value={{ scrollRef, size, variant }}>
      {children}
    </TabsSharedContext.Provider>
  );
};
