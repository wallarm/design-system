import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TabsLineActionsProps {
  children: ReactNode;
}

export const TabsLineActions: FC<TabsLineActionsProps> = ({ children }) => (
  <div className={cn('flex items-center gap-4 ml-auto')}>{children}</div>
);

TabsLineActions.displayName = 'TabsLineActions';
