import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { chatHeaderVariants } from './classes';

export interface ChatHeaderProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
}

export const ChatHeader: FC<ChatHeaderProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('header', testIdProp);

  return (
    <header
      {...props}
      ref={ref}
      data-slot='chat-header'
      data-testid={testId}
      className={cn(chatHeaderVariants(), className)}
    />
  );
};

ChatHeader.displayName = 'ChatHeader';
