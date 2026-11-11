import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { AgentGlyph } from '../AgentGlyph';
import { chatHeaderTitleVariants } from './classes';

/**
 * Without children: the Figma Default title, "Ask Wally". With children (e.g. a thread `Select`):
 * Figma Variant2, the Wally glyph, a "/" joint, then the children.
 */
export interface ChatHeaderTitleProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** The title shown when there are no children (e.g. a translation). Default: "Ask Wally". */
  label?: ReactNode;
}

export const ChatHeaderTitle: FC<ChatHeaderTitleProps> = ({
  ref,
  className,
  children,
  label,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('title', testIdProp);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chat-header-title'
      data-testid={testId}
      className={cn(chatHeaderTitleVariants(), className)}
    >
      {/* Wally's character glyph at 24 px (D4), lifted to the text line */}
      <AgentGlyph
        agent='wally'
        size={24}
        align='optical'
        data-testid={testId && `${testId}--wally`}
      />
      {children == null ? (
        <span className='ml-8 truncate text-sm text-text-primary'>
          {label ?? (
            <>
              Ask <span className='font-mono font-medium text-text-brand'>Wally</span>
            </>
          )}
        </span>
      ) : (
        <>
          <span aria-hidden className='pr-4 pl-12 text-sm font-medium text-text-secondary'>
            /
          </span>
          {children}
        </>
      )}
    </div>
  );
};

ChatHeaderTitle.displayName = 'ChatHeaderTitle';
