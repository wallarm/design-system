import type { FC } from 'react';

import { Tour as ArkUiTour, useTourContext } from '@ark-ui/react';
import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export const tourSpotlightVariants = cva(
  cn([
    'border-2 border-border-strong-brand',
    'outline outline-[5px] outline-offset-[3px] outline-states-brand-pressed',
    'pointer-events-none z-50 animate-pulse',
  ]),
  {
    variants: {
      shape: {
        rect: 'rounded-md',
        circle: 'rounded-full!',
      },
    },
  },
);

export const TourSpotlight: FC = () => {
  const { step } = useTourContext();
  const testId = useTestId('spotlight');

  const shape = (step?.meta?.shape as 'rect' | 'circle') ?? 'rect';

  return (
    <ArkUiTour.Spotlight data-testid={testId} className={cn(tourSpotlightVariants({ shape }))} />
  );
};

TourSpotlight.displayName = 'TourSpotlight';
