import type { FC, ReactNode } from 'react';
import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cn } from '../../utils/cn';

interface TabsContentProps {
  children: ReactNode;
  value: string;
}

export const TabsContent: FC<TabsContentProps> = ({ children, value }) => {
  return (
    <ArkUiTabs.Content className={cn('outline-none')} value={value}>
      {children}
    </ArkUiTabs.Content>
  );
};

TabsContent.displayName = 'TabsContent';
