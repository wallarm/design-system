import type { FC, PropsWithChildren } from 'react';

import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';

import { cn } from '../../utils/cn';
import {
  segmentedControlIndicatorClassNames,
  segmentedControlVariants,
} from '../SegmentedControl';

export const SegmentedTabsList: FC<PropsWithChildren> = ({ children }) => (
  <ArkUiTabs.List className={cn(segmentedControlVariants())}>
    {children}
    <ArkUiTabs.Indicator className={cn(segmentedControlIndicatorClassNames)} />
  </ArkUiTabs.List>
);
