import type { FC, Ref, TimeHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { messageTimestampVariants } from './classes';

export interface MessageTimestampProps extends TimeHTMLAttributes<HTMLTimeElement>, TestableProps {
  /** Children are the pre-formatted text; set `dateTime` to the ISO value. */
  ref?: Ref<HTMLTimeElement>;
}

export const MessageTimestamp: FC<MessageTimestampProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('timestamp', testIdProp);

  return (
    <time
      {...props}
      ref={ref}
      data-slot='message-timestamp'
      data-testid={testId}
      className={cn(messageTimestampVariants(), className)}
    />
  );
};

MessageTimestamp.displayName = 'MessageTimestamp';
