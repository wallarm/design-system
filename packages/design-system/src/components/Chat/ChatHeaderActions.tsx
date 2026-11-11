import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { chatHeaderActionsVariants } from './classes';

/** Trailing header slot (Figma 8:3078 / 44:1517): ghost icon buttons and vertical separators. */
export interface ChatHeaderActionsProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

export const ChatHeaderActions: FC<ChatHeaderActionsProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('actions', testIdProp);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chat-header-actions'
      data-testid={testId}
      className={cn(chatHeaderActionsVariants(), className)}
    />
  );
};

ChatHeaderActions.displayName = 'ChatHeaderActions';
