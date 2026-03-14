import type { FC } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { useTestId } from '../../utils/testId';
import { Overlay } from '../Overlay';

export const TourOverlay: FC = () => {
  const testId = useTestId('overlay');

  return (
    <ArkUiTour.Backdrop data-testid={testId} asChild>
      <Overlay />
    </ArkUiTour.Backdrop>
  );
};

TourOverlay.displayName = 'TourOverlay';
