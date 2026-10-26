import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { WallyIcon } from '../WallyIcon';
import { chatGreetingVariants } from './classes';

export interface ChatGreetingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Heading under the Wally mark, e.g. "How can I help you today?". */
  title: ReactNode;
}

export const ChatGreeting: FC<ChatGreetingProps> = ({
  ref,
  title,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('greeting', testIdProp);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chat-greeting'
      data-testid={testId}
      className={cn(chatGreetingVariants(), className)}
    >
      <div className='flex flex-col items-center gap-12'>
        <WallyIcon variant='circle' size='xl' aria-hidden />
        <Text asChild size='xl' weight='medium' color='primary' align='center'>
          <h2>{title}</h2>
        </Text>
      </div>
      {children}
    </div>
  );
};

ChatGreeting.displayName = 'ChatGreeting';
