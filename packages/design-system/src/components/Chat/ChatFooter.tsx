import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { chatFooterVariants } from './classes';

/** Bottom gutter for suggestions, a docked approval card and the input. */
export interface ChatFooterProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

export const ChatFooter: FC<ChatFooterProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('footer', testIdProp);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chat-footer'
      data-testid={testId}
      className={cn(chatFooterVariants(), className)}
    />
  );
};

ChatFooter.displayName = 'ChatFooter';
