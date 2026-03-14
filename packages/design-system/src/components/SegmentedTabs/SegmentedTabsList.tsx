import type { FC, PropsWithChildren } from 'react';
import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { segmentedControlIndicatorClassNames, segmentedControlVariants } from '../SegmentedControl';

export const SegmentedTabsList: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('list');

  return (
    <ArkUiTabs.List className={cn(segmentedControlVariants())} data-testid={testId}>
      {children}
      <ArkUiTabs.Indicator className={cn(segmentedControlIndicatorClassNames)} />
    </ArkUiTabs.List>
  );
};
