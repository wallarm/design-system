import type { FC } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type ScrollAreaContentProps = ArkUiScrollArea.ContentProps;

export const ScrollAreaContent: FC<ScrollAreaContentProps> = ({ className, ...props }) => {
  const testId = useTestId('content');

  return (
    <ArkUiScrollArea.Content
      {...props}
      data-testid={testId}
      className={cn('h-full outline-none', className)}
    />
  );
};

ScrollAreaContent.displayName = 'ScrollAreaContent';
