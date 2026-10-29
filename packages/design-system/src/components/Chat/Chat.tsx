import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { BlurBackground } from '../AnimatedBackground/blur';
import { chatBackgroundVariants, chatVariants } from './classes';

export type ChatBackground = 'strong' | 'subtle' | 'none';

export interface ChatProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
  /**
   * Decorative mesh behind the panel (Figma chat-bg 67:1254). `'strong'` is Main (12%, for an
   * empty chat), `'subtle'` is Chat (5%, for a running conversation), `'none'` renders nothing.
   */
  background?: ChatBackground;
}

export const Chat: FC<ChatProps> = ({
  ref,
  background = 'subtle',
  className,
  children,
  'data-testid': testId,
  ...props
}) => (
  <section
    aria-label='Wally chat'
    {...props}
    ref={ref}
    data-slot='chat'
    data-testid={testId}
    className={cn(chatVariants(), className)}
  >
    {background !== 'none' && (
      <div
        aria-hidden
        data-slot='chat-background'
        data-testid={testId && `${testId}--background`}
        className={chatBackgroundVariants({ background })}
      >
        <BlurBackground palette='chat' className='size-full [--lg-frame-bg:transparent]' />
      </div>
    )}
    <TestIdProvider value={testId}>{children}</TestIdProvider>
  </section>
);

Chat.displayName = 'Chat';
