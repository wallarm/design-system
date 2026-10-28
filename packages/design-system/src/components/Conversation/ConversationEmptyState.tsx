import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { ChatGreeting } from '../Chat/ChatGreeting';
import { conversationEmptyStateVariants } from './classes';

export interface ConversationEmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Greeting heading. Default 'How can I help you today?'. */
  title?: ReactNode;
  /** Under the heading, e.g. `<ChatSuggestions placement='greeting'>`. */
  children?: ReactNode;
}

/**
 * The greeting for an empty conversation. Render it inside `ConversationContent`: it is not
 * centered, `ChatGreeting`'s top padding assumes the log's. To replace the greeting entirely,
 * render your own node instead.
 */
export const ConversationEmptyState: FC<ConversationEmptyStateProps> = ({
  ref,
  title = 'How can I help you today?',
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('empty-state', testIdProp);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='conversation-empty-state'
      data-testid={testId}
      className={cn(conversationEmptyStateVariants(), className)}
    >
      <ChatGreeting title={title}>{children}</ChatGreeting>
    </div>
  );
};

ConversationEmptyState.displayName = 'ConversationEmptyState';
