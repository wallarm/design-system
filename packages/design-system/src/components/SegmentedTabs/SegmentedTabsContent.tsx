import type { FC, ReactNode } from 'react';
import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cn } from '../../utils/cn';

interface SegmentedTabsContentProps {
  value: string;
  children: ReactNode;
  asChild?: boolean;
}

export const SegmentedTabsContent: FC<SegmentedTabsContentProps> = ({
  value,
  children,
  asChild = false,
}) => (
  <ArkUiTabs.Content className={cn('outline-none')} value={value} asChild={asChild}>
    {children}
  </ArkUiTabs.Content>
);
