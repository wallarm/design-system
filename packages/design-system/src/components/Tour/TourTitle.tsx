import { forwardRef } from 'react';
import {
  Tour as ArkUiTour,
  type TourTitleProps as ArkUiTourTitleProps,
  useTourContext,
} from '@ark-ui/react';
import { cn } from '../../utils/cn';

export type TourTitleProps = ArkUiTourTitleProps;

export const TourTitle = forwardRef<HTMLHeadingElement, TourTitleProps>(
  ({ className, ...props }, ref) => {
    const { step } = useTourContext();

    return (
      <ArkUiTour.Title
        ref={ref}
        className={cn(
          'font-sans-display font-medium text-lg leading-xl',
          'line-clamp-2',
          step?.type === 'dialog' ? 'text-text-primary' : 'text-white',
          className,
        )}
        {...props}
      />
    );
  },
);
