import { type ButtonHTMLAttributes, type FC, type MouseEvent, type Ref, useId } from 'react';

import { ArrowDown } from '../../icons';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { conversationScrollButtonVariants } from './classes';
import { useConversationInternal } from './ConversationContext';

export interface ConversationScrollButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>, TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /** Accessible name and tooltip. Default 'Scroll to latest message'. */
  label?: string;
}

/**
 * The scroll-to-latest button: shown only while the reader is scrolled up. A click scrolls to the
 * bottom and hands focus to the end of the log. The stock small icon-only Button (outline, neutral),
 * floated at the bottom centre — not customised.
 */
export const ConversationScrollButton: FC<ConversationScrollButtonProps> = ({
  ref,
  id,
  label = 'Scroll to latest message',
  className,
  onClick,
  'data-testid': testIdProp,
  ...props
}) => {
  const { isAtBottom, scrollToBottom, scrollEl } = useConversationInternal(
    'ConversationScrollButton',
  );
  const testId = useTestId('scroll-button', testIdProp);
  const fallbackId = useId();
  const triggerId = id ?? fallbackId;

  // After every hook: no Tab stop while pinned.
  if (isAtBottom) return null;

  return (
    <div
      data-slot='conversation-scroll-button-anchor'
      className={conversationScrollButtonVariants()}
    >
      <Tooltip ids={{ trigger: triggerId }} data-testid={testId}>
        <TooltipTrigger asChild>
          <Button
            type='button'
            aria-label={label}
            {...props}
            ref={ref}
            id={triggerId}
            variant='outline'
            color='neutral'
            size='small'
            data-slot='conversation-scroll-button'
            data-testid={testId}
            className={className}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              onClick?.(event);
              if (event.defaultPrevented) return;
              scrollToBottom('smooth');
              // The button unmounts at the bottom: keep focus off <body>. The log's last child is
              // ConversationContent's end marker, so the next Tab moves on past the thread.
              const end = scrollEl?.lastElementChild;
              (end instanceof HTMLElement ? end : scrollEl)?.focus({ preventScroll: true });
            }}
          >
            <ArrowDown />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </div>
  );
};

ConversationScrollButton.displayName = 'ConversationScrollButton';
