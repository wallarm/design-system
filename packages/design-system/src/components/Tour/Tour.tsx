import type { FC } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import type { TestableProps } from '../../utils/testId';
import { TourInner } from './TourInner';

export interface TourProps extends Omit<ArkUiTour.RootProps, 'children'>, TestableProps {}

export const Tour: FC<TourProps> = ({
  lazyMount = true,
  unmountOnExit = true,
  'data-testid': testId,
  ...props
}) => (
  <ArkUiTour.Root {...props} lazyMount={lazyMount} unmountOnExit={unmountOnExit}>
    <TourInner testId={testId} />
  </ArkUiTour.Root>
);

Tour.displayName = 'Tour';
