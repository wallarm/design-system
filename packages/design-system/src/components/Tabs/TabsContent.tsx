import type { FC, ReactNode } from 'react';
import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface TabsContentProps {
  children: ReactNode;
  value: string;
}

export const TabsContent: FC<TabsContentProps> = ({ children, value }) => {
  const testId = useTestId('content');

  return (
    <ArkUiTabs.Content className={cn('outline-none')} data-testid={testId} value={value}>
      {children}
    </ArkUiTabs.Content>
  );
};

TabsContent.displayName = 'TabsContent';
