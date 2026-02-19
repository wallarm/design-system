import type { CSSProperties, FC } from 'react';
import { Tour as ArkUiTour, useTourContext } from '@ark-ui/react';
import {
  TOUR_SPOTLIGHT_OFFSET,
  TOUR_SPOTLIGHT_RADIUS,
  TOUR_SPOTLIGHT_RING_WIDTH,
  TOUR_Z_INDEX,
} from './const';

const SPOTLIGHT_BORDER_WIDTH = 2;

const rectStyles: CSSProperties = {
  borderRadius: TOUR_SPOTLIGHT_RADIUS,
  border: `${SPOTLIGHT_BORDER_WIDTH}px solid var(--color-border-strong-brand)`,
  outline: `${TOUR_SPOTLIGHT_RING_WIDTH}px solid var(--color-states-brand-pressed)`,
  outlineOffset: TOUR_SPOTLIGHT_OFFSET.x - TOUR_SPOTLIGHT_RING_WIDTH,
};

const circleStyles: CSSProperties = {
  width: 16,
  height: 16,
  margin: 10,
  borderRadius: '50%',
  border: `${SPOTLIGHT_BORDER_WIDTH}px solid var(--color-border-strong-brand)`,
  outline: `${TOUR_SPOTLIGHT_RING_WIDTH}px solid var(--color-states-brand-pressed)`,
  outlineOffset: TOUR_SPOTLIGHT_OFFSET.x - TOUR_SPOTLIGHT_RING_WIDTH,
};

export const TourOverlay: FC = () => {
  const { step } = useTourContext();
  const backdrop = !!step && step.backdrop !== false;
  const shape = (step?.meta?.shape as 'rect' | 'circle') ?? 'rect';

  return (
    <>
      {backdrop && (
        <ArkUiTour.Backdrop
          className='fixed inset-0 bg-component-dialog-overlay backdrop-blur-xs overflow-hidden'
          style={{ zIndex: TOUR_Z_INDEX }}
        />
      )}
      <ArkUiTour.Spotlight
        className='animate-pulse'
        style={{
          ...(shape === 'circle' ? circleStyles : rectStyles),
          zIndex: TOUR_Z_INDEX,
        }}
      />
    </>
  );
};
