import type { FC, Ref } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { useTestId } from '../../utils/testId';
import { Heading } from '../Heading';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';

export type TourTitleProps = ArkUiTour.TitleProps & { ref?: Ref<HTMLHeadingElement> };

export const TourTitle: FC<TourTitleProps> = ({ ref, children, ...props }) => {
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
};

TourTitle.displayName = 'TourTitle';
