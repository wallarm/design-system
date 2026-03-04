import { type FC, type ReactNode, useRef } from 'react';
import { Tour as ArkUiTour, useTourContext } from '@ark-ui/react';
import { cva } from 'class-variance-authority';

const positionerVariants = cva('focus-visible:outline-none', {
  variants: {
    type: {
      dialog: 'fixed inset-0 z-50 flex items-center justify-center',
      tooltip: '',
    },
  },
});

interface TourPositionerProps {
  children: ReactNode;
}

export const TourPositioner: FC<TourPositionerProps> = ({ children }) => {
  const { step } = useTourContext();

  const type = step?.type === 'dialog' ? 'dialog' : 'tooltip';

  return (
    <ArkUiTour.Positioner className={positionerVariants({ type })}>{children}</ArkUiTour.Positioner>
  );
};

TourPositioner.displayName = 'TourPositioner';
