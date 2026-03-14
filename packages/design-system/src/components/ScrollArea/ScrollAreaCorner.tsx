import type { FC } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { useTestId } from '../../utils/testId';

export type ScrollAreaCornerProps = ArkUiScrollArea.CornerProps;

export const ScrollAreaCorner: FC<ScrollAreaCornerProps> = props => {
  const testId = useTestId('corner');

  return <ArkUiScrollArea.Corner {...props} data-testid={testId} />;
};

ScrollAreaCorner.displayName = 'ScrollAreaCorner';
