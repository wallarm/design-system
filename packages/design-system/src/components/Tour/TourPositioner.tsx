import type { FC, ReactNode } from 'react';
import { Tour as ArkUiTour, useTourContext } from '@ark-ui/react';
import { cva } from 'class-variance-authority';
import { useTestId } from '../../utils/testId';

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
  const testId = useTestId('positioner');

  const type = step?.type === 'dialog' ? 'dialog' : 'tooltip';

  return (
    <ArkUiTour.Positioner data-testid={testId} className={positionerVariants({ type })}>
      {children}
    </ArkUiTour.Positioner>
  );
};

TourPositioner.displayName = 'TourPositioner';
