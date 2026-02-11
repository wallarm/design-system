import type { FC, ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import { useTabsSharedContext } from '../TabsSharedContext';

interface TabsListScrollAreaProps {
  children: ReactNode;
}

export const TabsListScrollArea: FC<TabsListScrollAreaProps> = ({ children }) => {
  const { scrollRef } = useTabsSharedContext();

  return (
    <div
      ref={scrollRef}
      className={cn(
        // Overflow & scrolling
        'overflow-x-auto',
        // Hide scrollbar
        '[&::-webkit-scrollbar]:hidden',
        '[-ms-overflow-style:none]',
        '[scrollbar-width:none]',
      )}
    >
      {children}
    </div>
  );
};

TabsListScrollArea.displayName = 'TabsListScrollArea';
