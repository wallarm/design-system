import { forwardRef } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Text } from '../Text';

export type TourDescriptionProps = ArkUiTour.DescriptionProps;

export const TourDescription = forwardRef<HTMLDivElement, TourDescriptionProps>(
  ({ children, ...props }, ref) => {
    const testId = useTestId('description');

    return (
      <OverflowTooltip>
        <OverflowTooltipTrigger>
          <ArkUiTour.Description {...props} data-testid={testId} ref={ref} asChild>
            <Text size='sm' lineClamp={4}>
              {children}
            </Text>
          </ArkUiTour.Description>
        </OverflowTooltipTrigger>
        <OverflowTooltipContent>{children}</OverflowTooltipContent>
      </OverflowTooltip>
    );
  },
);
