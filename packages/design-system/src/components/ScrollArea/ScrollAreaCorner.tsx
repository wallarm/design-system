import type { FC, Ref } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { type TestableProps, useTestId } from '../../utils/testId';

export type ScrollAreaCornerProps = ArkUiScrollArea.CornerProps &
  TestableProps & {
    ref?: Ref<HTMLDivElement>;
  };

export const ScrollAreaCorner: FC<ScrollAreaCornerProps> = ({
  ref,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('corner', testIdProp);

  return <ArkUiScrollArea.Corner {...props} ref={ref} data-testid={testId} />;
};

ScrollAreaCorner.displayName = 'ScrollAreaCorner';
