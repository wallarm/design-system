import type { FC } from 'react';

import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { useTestId } from '../../utils/testId';
import { ChatBody, type ChatBodyProps } from '../Chat/ChatBody';
import {
  conversationContentVariants,
  conversationEndVariants,
  conversationScrollerVariants,
} from './classes';
import { useConversationInternal } from './ConversationContext';

/**
 * The scroller: renders the built `ChatBody` (role=log; `ref`, `className`, `aria-*`, `tabIndex`
 * land on it) around an inner measured column.
 */
export interface ConversationContentProps extends ChatBodyProps {
  /** Classes for the inner column (`flex flex-col`, no gap — v1 §3.1). */
  contentClassName?: string;
}

export const ConversationContent: FC<ConversationContentProps> = ({
  ref,
  className,
  contentClassName,
  children,
  ...props
}) => {
  const { setScrollEl, setContentEl } = useConversationInternal('ConversationContent');
  const endTestId = useTestId('end');

  return (
    // tabIndex -1: focusable, not a Tab stop. A consumer's wins.
    <ChatBody
      tabIndex={-1}
      {...props}
      ref={mergeRefs(ref, setScrollEl)}
      className={cn(conversationScrollerVariants(), className)}
    >
      <div
        ref={setContentEl}
        data-slot='conversation-content'
        className={cn(conversationContentVariants(), contentClassName)}
      >
        {children}
      </div>
      {/* The scroll button's focus target: after the thread, so the next Tab moves forward. */}
      <span
        tabIndex={-1}
        data-slot='conversation-end'
        data-testid={endTestId}
        className={conversationEndVariants()}
      />
    </ChatBody>
  );
};

ConversationContent.displayName = 'ConversationContent';
