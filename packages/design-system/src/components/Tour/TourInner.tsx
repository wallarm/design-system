import type { FC, PropsWithChildren } from 'react';
import { Portal, useTourContext } from '@ark-ui/react';
import { TourBody } from './TourBody';
import { TourClose } from './TourClose';
import { TourContent } from './TourContent';
import { TourDescription } from './TourDescription';
import { TourFooter } from './TourFooter';
import { TourMedia } from './TourMedia';
import { TourOverlay } from './TourOverlay';
import { TourPositioner } from './TourPositioner';
import { TourSpotlight } from './TourSpotlight';
import { TourTitle } from './TourTitle';

export const TourInner: FC<PropsWithChildren> = () => {
  const { step } = useTourContext();

  const overlayIsVisible = !!step && step.backdrop !== false;

  return (
    <Portal>
      {overlayIsVisible && <TourOverlay />}
      <TourSpotlight />

      <TourPositioner>
        <TourContent>
          <TourMedia />

          <TourBody>
            {step?.title && <TourTitle>{step.title}</TourTitle>}
            {step?.description && <TourDescription>{step.description}</TourDescription>}
          </TourBody>
          <TourFooter />

          <TourClose />
        </TourContent>
      </TourPositioner>
    </Portal>
  );
};

TourInner.displayName = 'TourInner';
