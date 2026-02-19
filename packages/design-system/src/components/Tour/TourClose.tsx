import { forwardRef } from 'react';
import {
  Tour as ArkUiTour,
  type TourCloseTriggerProps as ArkUiTourCloseTriggerProps,
  useTourContext,
} from '@ark-ui/react';
import { X } from '../../icons';
import { cn } from '../../utils/cn';

export type TourCloseProps = ArkUiTourCloseTriggerProps;

export const TourClose = forwardRef<HTMLButtonElement, TourCloseProps>(
  ({ className, ...props }, ref) => {
    const { step } = useTourContext();

    return (
      <ArkUiTour.CloseTrigger
        ref={ref}
        className={cn(
          'absolute top-14 right-16',
          'flex items-center justify-center',
          'size-24 rounded-8',
          'cursor-pointer transition-colors outline-none',
          step?.type === 'dialog'
            ? 'text-text-primary hover:bg-states-on-fill-pressed focus-visible:bg-states-on-fill-pressed'
            : 'text-white hover:bg-states-primary-alt-hover focus-visible:bg-states-primary-alt-pressed',
          className,
        )}
        {...props}
      >
        <X className='icon-md' />
      </ArkUiTour.CloseTrigger>
    );
  },
);
