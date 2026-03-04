import type { FC } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { TourInner } from './TourInner';

export type TourProps = Omit<ArkUiTour.RootProps, 'children'>;

export const Tour: FC<TourProps> = ({ lazyMount = true, unmountOnExit = true, ...props }) => (
  <ArkUiTour.Root {...props} lazyMount={lazyMount} unmountOnExit={unmountOnExit}>
    <TourInner />
  </ArkUiTour.Root>
);

Tour.displayName = 'Tour';
