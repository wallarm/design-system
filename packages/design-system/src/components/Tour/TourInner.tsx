import type { FC } from 'react';
import { Portal, useTourContext } from '@ark-ui/react';
import { TestIdProvider } from '../../utils/testId';
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

export interface TourInnerProps {
  testId?: string;
}

export const TourInner: FC<TourInnerProps> = ({ testId }) => {
  const { step } = useTourContext();

  const overlayIsVisible = !!step && step.backdrop !== false;

  return (
    <TestIdProvider value={testId}>
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
    </TestIdProvider>
  );
};

TourInner.displayName = 'TourInner';
