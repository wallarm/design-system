import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Tabs, TabsList, type TabsListProps, type TabsProps } from '../Tabs';

export type NotificationCenterTabsProps = Omit<TabsProps, 'size' | 'variant' | 'asChild'>;

/**
 * Small tabs that fill the panel below the header, so the active panel's
 * `NotificationCenterBody` scrolls while the header and tab list stay put.
 */
export const NotificationCenterTabs: FC<NotificationCenterTabsProps> = ({
  className,
  'data-testid': testIdProp,
  ...props
}) => (
  <Tabs
    {...props}
    size='small'
    data-testid={useTestId('tabs', testIdProp)}
    className={cn(
      'flex min-h-0 flex-1 flex-col',
      '[&>[data-part=content]:not([hidden])]:flex [&>[data-part=content]]:min-h-0 [&>[data-part=content]]:flex-1 [&>[data-part=content]]:flex-col',
      className,
    )}
  />
);

NotificationCenterTabs.displayName = 'NotificationCenterTabs';

export type NotificationCenterTabsListProps = TabsListProps;

export const NotificationCenterTabsList: FC<NotificationCenterTabsListProps> = ({
  className,
  ...props
}) => <TabsList {...props} className={cn('px-12', className)} />;

NotificationCenterTabsList.displayName = 'NotificationCenterTabsList';
