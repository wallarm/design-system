import { forwardRef } from 'react';
import { Tour as ArkUiTour, useTourContext } from '@ark-ui/react';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Text } from '../Text';

export type TourDescriptionProps = ArkUiTour.DescriptionProps;

export const TourDescription = forwardRef<HTMLDivElement, TourDescriptionProps>(
  ({ children, ...props }, ref) => {
    const { step } = useTourContext();

    return (
      <OverflowTooltip>
        <OverflowTooltipTrigger>
          <ArkUiTour.Description {...props} ref={ref} asChild>
            <Text
              size='sm'
              color={step?.type === 'dialog' ? 'primary' : 'primary-alt'}
              lineClamp={4}
            >
              {children}
            </Text>
          </ArkUiTour.Description>
        </OverflowTooltipTrigger>
        <OverflowTooltipContent>{children}</OverflowTooltipContent>
      </OverflowTooltip>
    );
  },
);
