import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { userMessageVariants } from './classes';

export interface UserMessageProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
}

/**
 * A message the user sent: an `<article>` named "You" that right-aligns its bubble and an
 * optional `MessageActions` row. Inside a cascade its test id is `<base>--user-message`.
 */
export const UserMessage: FC<UserMessageProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('user-message', testIdProp);

  return (
    <article
      aria-label='You'
      {...props}
      ref={ref}
      data-slot='user-message'
      data-testid={testId}
      className={cn(userMessageVariants(), className)}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </article>
  );
};

UserMessage.displayName = 'UserMessage';
