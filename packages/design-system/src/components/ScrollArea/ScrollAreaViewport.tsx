import type { FC, Ref } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';

export type ScrollAreaViewportProps = Omit<ArkUiScrollArea.ViewportProps, 'className'> &
  TestableProps & {
    ref?: Ref<HTMLDivElement>;
  };

export const ScrollAreaViewport: FC<ScrollAreaViewportProps> = ({
  ref,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('viewport', testIdProp);

  return (
    <ArkUiScrollArea.Viewport
      {...props}
      ref={ref}
      data-testid={testId}
      className={cn('h-full outline-none')}
    />
  );
};

ScrollAreaViewport.displayName = 'ScrollAreaViewport';
