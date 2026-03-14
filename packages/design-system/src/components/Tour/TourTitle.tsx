import { forwardRef } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { useTestId } from '../../utils/testId';
import { Heading } from '../Heading';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';

export type TourTitleProps = ArkUiTour.TitleProps;

export const TourTitle = forwardRef<HTMLHeadingElement, TourTitleProps>(
  ({ children, ...props }, ref) => {
    const testId = useTestId('title');

    return (
      <OverflowTooltip>
        <OverflowTooltipTrigger>
          <ArkUiTour.Title {...props} data-testid={testId} ref={ref} asChild>
            <Heading size='lg' weight='medium' lineClamp={2}>
              {children}
            </Heading>
          </ArkUiTour.Title>
        </OverflowTooltipTrigger>
        <OverflowTooltipContent>{children}</OverflowTooltipContent>
      </OverflowTooltip>
    );
  },
);

TourTitle.displayName = 'TourTitle';
