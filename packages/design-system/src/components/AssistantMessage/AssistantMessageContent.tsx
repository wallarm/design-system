import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { assistantMessageContentVariants } from './classes';

export interface AssistantMessageContentProps
  extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/**
 * The answer body: spaces and styles markdown blocks (14/24 paragraphs, 16/24 headings, lists).
 * Put `AssistantMessageMarkdown` inside it (WallyAssistant's default), or your own renderer's blocks.
 */
export const AssistantMessageContent: FC<AssistantMessageContentProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('content', testIdProp);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='assistant-message-content'
      data-testid={testId}
      className={cn(assistantMessageContentVariants(), className)}
    />
  );
};

AssistantMessageContent.displayName = 'AssistantMessageContent';
