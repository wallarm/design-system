import { forwardRef } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { X } from '../../icons';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export type TourCloseProps = ArkUiTour.CloseTriggerProps;

export const TourClose = forwardRef<HTMLButtonElement, TourCloseProps>((props, ref) => {
  return (
    <Tooltip>
      <ArkUiTour.CloseTrigger className={cn('absolute top-14 right-16')} ref={ref} asChild>
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
