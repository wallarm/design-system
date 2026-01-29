import type { FC } from 'react';

import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cva } from 'class-variance-authority';

import { cn } from '../../../utils/cn';
import { useTabsSharedContext } from '../TabsSharedContext';

const tabsListIndicatorVariants = cva(
  cn(
    // Positioning
    'bottom-[-1px]',
    // Sizing
    'h-2',
    'left-(--left)',
    'w-(--width)',
  ),
  {
    variants: {
      variant: {
        default: 'bg-border-strong-brand',
        grayscale: 'bg-border-strong-primary',
      },
    },
  },
);

export const TabsListIndicator: FC = () => {
  const { variant } = useTabsSharedContext();

  return (
    <ArkUiTabs.Indicator
      className={cn(tabsListIndicatorVariants({ variant }))}
    />
  );
};
