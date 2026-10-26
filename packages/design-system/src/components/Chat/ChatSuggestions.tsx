import { type FC, type HTMLAttributes, type ReactNode, type Ref, useId } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { ChatSuggestionsProvider } from './ChatSuggestionsContext';
import { chatSuggestionsLabelVariants, chatSuggestionsVariants } from './classes';

export type ChatSuggestionsPlacement = 'footer' | 'greeting';

export interface ChatSuggestionsProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * `'footer'` (default, Figma 91:1167): right-aligned Medium pills above the input.
   * `'greeting'` (Figma 44:1706): centered Large pills under the greeting.
   */
  placement?: ChatSuggestionsPlacement;
  /** Visible label (Figma "Suggestions"); also becomes the group's accessible name. */
  label?: ReactNode;
}

export const ChatSuggestions: FC<ChatSuggestionsProps> = ({
  ref,
  placement = 'footer',
  label,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('suggestions', testIdProp);
  const labelId = useId();
  const hasLabel = label != null && label !== false && label !== '';

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- The group names suggested actions; their buttons own focus and activation.
      role='group'
      aria-label={hasLabel ? undefined : 'Suggestions'}
      aria-labelledby={hasLabel ? labelId : undefined}
      {...props}
      ref={ref}
      data-slot='chat-suggestions'
      data-testid={testId}
      className={cn(chatSuggestionsVariants({ placement }), className)}
    >
      {hasLabel && (
        <p id={labelId} className={chatSuggestionsLabelVariants()}>
          {label}
        </p>
      )}
      <ChatSuggestionsProvider value={{ size: placement === 'greeting' ? 'lg' : 'md' }}>
        {children}
      </ChatSuggestionsProvider>
    </div>
  );
};

ChatSuggestions.displayName = 'ChatSuggestions';
