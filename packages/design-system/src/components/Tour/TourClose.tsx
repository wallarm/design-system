import type { FC, Ref } from 'react';
import { Tour as ArkUiTour, useTourContext } from '@ark-ui/react';
import { X } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export interface TourCloseProps
  extends Omit<ArkUiTour.CloseTriggerProps, 'children' | 'color'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
}

export const TourClose: FC<TourCloseProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('close', testIdProp);
  const { step } = useTourContext();
  const type = step?.type === 'dialog' ? 'dialog' : 'tooltip';

  return (
    <Tooltip>
      <ArkUiTour.CloseTrigger
        {...rest}
        ref={ref}
        data-testid={testId}
        className={cn('absolute top-14 right-16', className)}
        asChild
      >
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='small'
            color={type === 'tooltip' ? 'neutral-alt' : 'neutral'}
          >
            <X />
          </Button>
        </TooltipTrigger>
      </ArkUiTour.CloseTrigger>

      <TooltipContent>Close</TooltipContent>
    </Tooltip>
  );
};

TourClose.displayName = 'TourClose';
