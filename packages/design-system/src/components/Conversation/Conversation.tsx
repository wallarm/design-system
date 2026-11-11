import { type FC, type HTMLAttributes, type Ref, useState } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { conversationVariants } from './classes';
import { ConversationContext } from './ConversationContext';
import { useStickToBottom } from './useStickToBottom';

export interface ConversationProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Distance in px from the bottom that still counts as "at bottom". Default 70. */
  threshold?: number;
  /**
   * When it changes, re-stick and scroll to the bottom even if the reader scrolled up. Pass the
   * last user message id, so sending always reveals the answer. For a thread switch, remount
   * instead: `key={threadId}`.
   */
  autoScrollKey?: string | number;
}

/**
 * Stick-to-bottom for the chat log: takes `ChatBody`'s place between `ChatHeader` and `ChatFooter`
 * and holds a `ConversationContent` (the scroller) and a `ConversationScrollButton`.
 * Transparent in the test-id cascade: inside `<Chat data-testid='chat'>` the log stays `chat--body`.
 */
export const Conversation: FC<ConversationProps> = ({
  ref,
  threshold = 70,
  autoScrollKey,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId(undefined, testIdProp);
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  const { isAtBottom, scrollToBottom } = useStickToBottom(
    scrollEl,
    contentEl,
    threshold,
    autoScrollKey,
  );

  return (
    <div
      {...props}
      ref={ref}
      data-slot='conversation'
      data-testid={testIdProp}
      className={cn(conversationVariants(), className)}
    >
      <ConversationContext.Provider
        value={{ isAtBottom, scrollToBottom, scrollEl, setScrollEl, setContentEl }}
      >
        <TestIdProvider value={testId}>{children}</TestIdProvider>
      </ConversationContext.Provider>
    </div>
  );
};

Conversation.displayName = 'Conversation';
