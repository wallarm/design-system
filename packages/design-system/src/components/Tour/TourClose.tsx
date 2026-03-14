import { forwardRef } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { X } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export type TourCloseProps = ArkUiTour.CloseTriggerProps;

export const TourClose = forwardRef<HTMLButtonElement, TourCloseProps>((props, ref) => {
  const testId = useTestId('close');

  return (
    <Tooltip>
      <ArkUiTour.CloseTrigger
        data-testid={testId}
        className={cn('absolute top-14 right-16')}
        ref={ref}
        asChild
      >
        <TooltipTrigger asChild>
          <Button variant='ghost' size='small' color='neutral'>
            <X />
          </Button>
        </TooltipTrigger>
      </ArkUiTour.CloseTrigger>

      <TooltipContent>Close</TooltipContent>
    </Tooltip>
  );
});

TourClose.displayName = 'TourClose';
