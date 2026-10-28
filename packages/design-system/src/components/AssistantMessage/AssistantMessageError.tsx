import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { OctagonAlert } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { assistantMessageErrorVariants } from './classes';

export interface AssistantMessageErrorProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Trailing control, e.g. a Retry Button (yours, so analytics land on it). Rendered inside the error's
   *  test-id cascade: read `useTestId('<slot>')` in the action to get `<error>--<slot>` — `Button` doesn't. */
  action?: ReactNode;
}

/**
 * A failed answer, announced as `role='alert'`: a danger icon, the message and an optional
 * trailing `action` such as Retry. Inside a cascade its test id is `<base>--error`.
 */
export const AssistantMessageError: FC<AssistantMessageErrorProps> = ({
  ref,
  className,
  children,
  action,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('error', testIdProp);

  return (
    <div
      role='alert'
      {...props}
      ref={ref}
      data-slot='assistant-message-error'
      data-testid={testId}
      className={cn(assistantMessageErrorVariants(), className)}
    >
      <OctagonAlert size='md' aria-hidden className='mt-2 shrink-0 text-icon-danger' />
      <div className='min-w-0 flex-1 break-words'>{children}</div>
      <TestIdProvider value={testId}>{action}</TestIdProvider>
    </div>
  );
};

AssistantMessageError.displayName = 'AssistantMessageError';
