import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface TabsLineActionsProps {
  children: ReactNode;
}

export const TabsLineActions: FC<TabsLineActionsProps> = ({ children }) => {
  const testId = useTestId('line-actions');

  return (
    <div className={cn('flex items-center gap-4 ml-auto')} data-testid={testId}>
      {children}
    </div>
  );
};

TabsLineActions.displayName = 'TabsLineActions';
