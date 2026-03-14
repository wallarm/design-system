import type { FC } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { TourInner } from './TourInner';

export interface TourProps extends Omit<ArkUiTour.RootProps, 'children'> {
  /** Base value for cascading `data-testid` attributes. */
  testId?: string;
}

export const Tour: FC<TourProps> = ({
  lazyMount = true,
  unmountOnExit = true,
  testId,
  ...props
}) => (
  <ArkUiTour.Root {...props} lazyMount={lazyMount} unmountOnExit={unmountOnExit}>
    <TourInner testId={testId} />
  </ArkUiTour.Root>
);

Tour.displayName = 'Tour';
