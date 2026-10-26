import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useEffect, useRef } from 'react';
import { getRuntime } from '../../lib/agent-characters/runtime';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { AgentAvatar, type AgentAvatarHandle } from '../AgentAvatar';
import { Text } from '../Text';
import { chatGreetingVariants } from './classes';

export interface ChatGreetingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Heading under Wally, e.g. "How can I help you today?". */
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
  const wally = useRef<SVGSVGElement>(null);
  const handle = useRef<AgentAvatarHandle>(null);

  // Hello once, 250 ms after the empty chat first comes into view, as the reference does (D9; line 2475).
  // Under reduced motion or the off switch Wally stays on its static frame: no Hello.
  useEffect(() => {
    const el = wally.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        io.disconnect();
        timer = setTimeout(() => {
          if (getRuntime().motionOn()) handle.current?.play('hello');
        }, 250);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chat-greeting'
      data-testid={testId}
      className={cn(chatGreetingVariants(), className)}
    >
      <div className='flex flex-col items-center gap-12'>
        <AgentAvatar
          ref={wally}
          handleRef={handle}
          agent='wally'
          seed='wally'
          size={120}
          live
          shadow
          data-testid={testId && `${testId}--wally`}
        />
        <Text asChild size='xl' weight='medium' color='primary' align='center'>
          <h2>{title}</h2>
        </Text>
      </div>
      {children}
    </div>
  );
};

ChatGreeting.displayName = 'ChatGreeting';
