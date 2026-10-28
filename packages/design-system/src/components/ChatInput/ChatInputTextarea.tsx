import {
  type ChangeEvent,
  type FC,
  type KeyboardEvent,
  type Ref,
  type TextareaHTMLAttributes,
  useEffect,
  useRef,
} from 'react';

import { composeRefs } from '@radix-ui/react-compose-refs';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useAutoResize } from '../Textarea/useAutoResize';
import { useChatInputContext } from './ChatInputContext';
import { chatInputTextareaVariants } from './classes';

export interface ChatInputTextareaProps
  extends
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue'>,
    TestableProps {
  ref?: Ref<HTMLTextAreaElement>;
}

export const ChatInputTextarea: FC<ChatInputTextareaProps> = ({
  ref,
  className,
  disabled: disabledProp,
  onChange,
  onKeyDown,
  'aria-describedby': ariaDescribedBy,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('textarea', testIdProp);
  const { value, onValueChange, isRunning, disabled, onStop, disclaimerId } = useChatInputContext();
  const { ref: autoResizeRef } = useAutoResize(true, 1, 8, value);
  const describedBy = [ariaDescribedBy, disclaimerId].filter(Boolean).join(' ') || undefined;
  const nodeRef = useRef<HTMLTextAreaElement>(null);

  // A Drawer/Dialog (zag dismissable layer) listens for Esc on `document` in the capture phase,
  // before any React handler. While running, claim Esc on `window` (capture runs earlier still):
  // `preventDefault` makes the layer skip its dismiss, and `handleKeyDown` then calls `onStop`.
  // No `onStop` → nothing to run, so Esc stays with the layer. `aria-expanded='true'` (a consumer
  // combobox popup anchored to the textarea) → that popup owns Esc.
  const claimsEscape = isRunning && !!onStop;
  useEffect(() => {
    const node = nodeRef.current;
    const view = node?.ownerDocument.defaultView;
    if (!claimsEscape || !node || !view) return;
    const claimEscape = (event: globalThis.KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !event.isComposing &&
        event.target === node &&
        node.getAttribute('aria-expanded') !== 'true'
      ) {
        event.preventDefault();
      }
    };
    view.addEventListener('keydown', claimEscape, true);
    return () => view.removeEventListener('keydown', claimEscape, true);
  }, [claimsEscape]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
    onValueChange(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    // 229: Safari reports IME composition keystrokes this way without isComposing.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;

    // Esc arrives already prevented by `claimEscape`, so `defaultPrevented` can't gate it.
    if (event.key === 'Escape') {
      if (claimsEscape && event.currentTarget.getAttribute('aria-expanded') !== 'true') onStop?.();
    } else if (event.key === 'Enter' && !event.shiftKey && !event.defaultPrevented) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <textarea
      placeholder='Ask Wally...'
      aria-label='Message Wally'
      {...rest}
      ref={composeRefs(autoResizeRef, nodeRef, ref)}
      rows={1}
      value={value}
      disabled={disabled || disabledProp}
      aria-describedby={describedBy}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      data-slot='chat-input-textarea'
      data-testid={testId}
      className={cn(chatInputTextareaVariants(), className)}
    />
  );
};

ChatInputTextarea.displayName = 'ChatInputTextarea';
