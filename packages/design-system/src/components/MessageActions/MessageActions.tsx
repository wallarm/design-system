import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { messageActionsVariants } from './classes';

export interface MessageActionsProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * Force-show the row (e.g. the latest answer). By default the row is revealed on
   * hover / focus-within of the nearest `group/message` parent, and always shown on
   * `hover: none` devices. Hidden rows keep their 30px height and stay tabbable.
   */
  visible?: boolean;
}

export const MessageActions: FC<MessageActionsProps> = ({
  ref,
  visible = false,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('actions', testIdProp);

  return (
    <div
      role='group'
      aria-label='Message actions'
      {...props}
      ref={ref}
      data-slot='message-actions'
      data-testid={testId}
      className={cn(messageActionsVariants({ visible }), className)}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </div>
  );
};

MessageActions.displayName = 'MessageActions';
