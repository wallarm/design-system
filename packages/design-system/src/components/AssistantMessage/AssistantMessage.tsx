import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { assistantMessageVariants } from './classes';

export interface AssistantMessageProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
}

/**
 * A message from Wally: an `<article>` named "Wally" that stacks an optional
 * `ChainOfThought`, an optional `ApprovalCard`, the `AssistantMessageContent` and a
 * `MessageActions` row. Set `aria-busy` while the answer streams. Inside a cascade its
 * test id is `<base>--assistant-message`.
 */
export const AssistantMessage: FC<AssistantMessageProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('assistant-message', testIdProp);

  return (
    <article
      aria-label='Wally'
      {...props}
      ref={ref}
      data-slot='assistant-message'
      data-testid={testId}
      className={cn(assistantMessageVariants(), className)}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </article>
  );
};

AssistantMessage.displayName = 'AssistantMessage';
