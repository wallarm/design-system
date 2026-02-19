import { forwardRef } from 'react';
import {
  Tour as ArkUiTour,
  type TourDescriptionProps as ArkUiTourDescriptionProps,
  useTourContext,
} from '@ark-ui/react';
import { cn } from '../../utils/cn';

export type TourDescriptionProps = ArkUiTourDescriptionProps;

export const TourDescription = forwardRef<HTMLDivElement, TourDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { step } = useTourContext();

    return (
      <ArkUiTour.Description
        ref={ref}
        className={cn(
          'font-sans font-regular text-sm leading-sm',
          'line-clamp-4',
          step?.type === 'dialog' ? 'text-text-secondary' : 'text-white',
          className,
        )}
        {...props}
      />
    );
  },
);
