import type { FC, Ref } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type ScrollAreaViewportProps = Omit<ArkUiScrollArea.ViewportProps, 'className'> & {
  ref?: Ref<HTMLDivElement>;
};

export const ScrollAreaViewport: FC<ScrollAreaViewportProps> = props => {
  const testId = useTestId('viewport');

  return (
    <ArkUiScrollArea.Viewport
      {...props}
      data-testid={testId}
      className={cn('h-full outline-none')}
    />
  );
};

ScrollAreaViewport.displayName = 'ScrollAreaViewport';
