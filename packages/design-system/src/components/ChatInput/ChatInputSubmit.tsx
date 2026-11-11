import { type ButtonHTMLAttributes, type FC, type MouseEvent, type Ref, useId } from 'react';
import { ArrowUp, CircleStop } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Kbd } from '../Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useChatInputContext } from './ChatInputContext';

export interface ChatInputSubmitProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children' | 'color'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /** Accessible name while idle. */
  sendLabel?: string;
  /** Accessible name and tooltip while `isRunning`. */
  stopLabel?: string;
}

export const ChatInputSubmit: FC<ChatInputSubmitProps> = ({
  ref,
  id,
  sendLabel = 'Send',
  stopLabel = 'Stop response',
  className,
  disabled: disabledProp,
  onClick,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('submit', testIdProp);
  const { value, isRunning, disabled, onStop } = useChatInputContext();
  const autoId = useId();
  // Ark anchors the tooltip to the trigger's id, so a consumer id must be shared with it.
  const triggerId = id ?? autoId;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !isRunning) return;
    // onStop flips isRunning before the click's activation step runs; without this the
    // re-rendered type='submit' button would submit the draft.
    event.preventDefault();
    onStop?.();
    // With an empty draft the button turns into a disabled Send, which would drop focus
    // to <body>; return it to the textarea like a send does.
    event.currentTarget.form?.querySelector('textarea')?.focus();
  };

  // The Tooltip wrapper is always rendered so the button keeps its DOM node (and focus)
  // across the send ↔ stop swap.
  return (
    <Tooltip disabled={!isRunning} ids={{ trigger: triggerId }} data-testid={testId}>
      <TooltipTrigger asChild>
        <Button
          aria-label={isRunning ? stopLabel : sendLabel}
          {...rest}
          ref={ref}
          id={triggerId}
          type={isRunning ? 'button' : 'submit'}
          variant={isRunning ? 'secondary' : 'primary'}
          color={isRunning ? 'neutral' : 'brand'}
          size='small'
          disabled={disabled || disabledProp || (!isRunning && !value.trim())}
          onClick={handleClick}
          data-slot='chat-input-submit'
          data-testid={testId}
          className={cn('ms-auto', className)}
        >
          {isRunning ? <CircleStop /> : <ArrowUp />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {stopLabel} <Kbd>Esc</Kbd>
      </TooltipContent>
    </Tooltip>
  );
};

ChatInputSubmit.displayName = 'ChatInputSubmit';
