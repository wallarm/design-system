import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { chatBodyVariants } from './classes';

/**
 * The scrolling message log. Pass `aria-busy={isRunning}` while the assistant streams, and
 * attach stick-to-bottom behaviour through `ref` (it lands on the scroll element).
 *
 * For stick-to-bottom and a scroll button use `Conversation`; `ConversationContent` renders ChatBody.
 */
export interface ChatBodyProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

export const ChatBody: FC<ChatBodyProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('body', testIdProp);

  return (
    <div
      role='log'
      aria-label='Chat messages'
      {...props}
      ref={ref}
      data-slot='chat-body'
      data-testid={testId}
      className={cn(chatBodyVariants(), className)}
    />
  );
};

ChatBody.displayName = 'ChatBody';
