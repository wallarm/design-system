import type { FC, Ref } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';

export type ScrollAreaContentProps = ArkUiScrollArea.ContentProps &
  TestableProps & {
    ref?: Ref<HTMLDivElement>;
  };

export const ScrollAreaContent: FC<ScrollAreaContentProps> = ({
  className,
  ref,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('content', testIdProp);

  return (
    <ArkUiScrollArea.Content
      {...props}
      ref={ref}
      data-testid={testId}
      className={cn('h-full outline-none', className)}
    />
  );
};

ScrollAreaContent.displayName = 'ScrollAreaContent';
