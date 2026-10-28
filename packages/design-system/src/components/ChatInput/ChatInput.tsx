import {
  type FC,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactNode,
  type Ref,
  Children,
  useId,
} from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { ChatInputContext } from './ChatInputContext';
import {
  chatInputBoxVariants,
  chatInputContextChipsVariants,
  chatInputContextVariants,
  chatInputDisclaimerVariants,
  chatInputVariants,
} from './classes';

const DEFAULT_DISCLAIMER = 'Wally can make mistakes; always verify.';

export interface ChatInputProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>, TestableProps {
  ref?: Ref<HTMLFormElement>;
  /** Controlled only — the app owns the draft. */
  value: string;
  onValueChange: (value: string) => void;
  /**
   * Receives `value.trim()`. Not called when the value is empty, while `isRunning`, or when
   * `disabled`. The form's native submit is prevented and focus returns to the textarea.
   */
  onSubmit: (value: string) => void;
  /**
   * Stop-button click, and Esc in the textarea while `isRunning`.
   * Inside a Drawer/Dialog that Esc stops the run and doesn't close the layer; no host
   * `onEscapeKeyDown` is needed. While running, a consumer `onKeyDown` can't cancel the Esc
   * stop with `preventDefault` (the textarea has already claimed the key from the layer).
   * Without `onStop`, Esc is left to the layer. A consumer popup anchored to the textarea
   * (mention/autocomplete) keeps Esc while the textarea has `aria-expanded='true'`.
   */
  onStop?: () => void;
  /** Swaps Send for Stop and blocks submit. CopilotKit: `agent.isRunning`. */
  isRunning?: boolean;
  disabled?: boolean;
  /** Attached-context chips, shown in a bar behind the box. Nothing to render (`null`, `false`, `[]`) hides the bar. */
  context?: ReactNode;
  /** Line under the box. `null`/`false` hides it. */
  disclaimer?: ReactNode;
}

export const ChatInput: FC<ChatInputProps> = ({
  ref,
  value,
  onValueChange,
  onSubmit,
  onStop,
  isRunning = false,
  disabled = false,
  context,
  disclaimer = DEFAULT_DISCLAIMER,
  className,
  children,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('input', testIdProp);
  const slotTestId = (slot: string) => (testId ? `${testId}--${slot}` : undefined);
  const disclaimerDomId = useId();
  const hasDisclaimer = disclaimer !== null && disclaimer !== false;
  // Children.toArray drops null/undefined/booleans, so removing the last chip (an empty
  // `items.map(...)`) hides the bar too.
  const hasContext = Children.toArray(context).length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = value.trim();
    if (!text || isRunning || disabled) return;
    onSubmit(text);
    // Clearing the value disables Send; keep focus in the textarea instead of losing it.
    event.currentTarget.querySelector('textarea')?.focus();
  };

  const box = (
    <div
      data-slot='chat-input-box'
      data-testid={slotTestId('box')}
      className={chatInputBoxVariants({ withContext: hasContext, disabled })}
    >
      {children}
    </div>
  );

  return (
    <form
      {...rest}
      ref={ref}
      onSubmit={handleSubmit}
      aria-disabled={disabled || undefined}
      data-slot='chat-input'
      data-testid={testId}
      className={cn(chatInputVariants(), className)}
    >
      <ChatInputContext.Provider
        value={{
          value,
          onValueChange,
          isRunning,
          disabled,
          onStop,
          disclaimerId: hasDisclaimer ? disclaimerDomId : undefined,
        }}
      >
        <TestIdProvider value={testId}>
          {hasContext ? (
            <div
              data-slot='chat-input-context'
              data-testid={slotTestId('context')}
              className={chatInputContextVariants()}
            >
              <div className={chatInputContextChipsVariants()}>{context}</div>
              {box}
            </div>
          ) : (
            box
          )}
        </TestIdProvider>
      </ChatInputContext.Provider>
      {hasDisclaimer && (
        <p
          id={disclaimerDomId}
          data-slot='chat-input-disclaimer'
          data-testid={slotTestId('disclaimer')}
          className={chatInputDisclaimerVariants()}
        >
          {disclaimer}
        </p>
      )}
    </form>
  );
};

ChatInput.displayName = 'ChatInput';
