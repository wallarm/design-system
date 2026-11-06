import type { FC, Ref } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import { useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Text } from '../Text';

export type TourDescriptionProps = ArkUiTour.DescriptionProps & { ref?: Ref<HTMLDivElement> };

export const TourDescription: FC<TourDescriptionProps> = ({ ref, children, ...props }) => {
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
};

TourDescription.displayName = 'TourDescription';
