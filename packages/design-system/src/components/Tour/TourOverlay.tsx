import type { FC } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { Overlay } from '../Overlay';

export const TourOverlay: FC = () => {
  return (
    <ArkUiTour.Backdrop asChild>
      <Overlay />
    </ArkUiTour.Backdrop>
  );
};

TourOverlay.displayName = 'TourOverlay';
