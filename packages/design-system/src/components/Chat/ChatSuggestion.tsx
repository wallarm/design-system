import type { ButtonHTMLAttributes, FC, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useChatSuggestionsContext } from './ChatSuggestionsContext';
import { chatSuggestionVariants } from './classes';

/** A suggested prompt pill. Sized by its `ChatSuggestions` placement (Medium when standalone). */
export interface ChatSuggestionProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, TestableProps {
  ref?: Ref<HTMLButtonElement>;
}

export const ChatSuggestion: FC<ChatSuggestionProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('suggestion', testIdProp);
  const { size } = useChatSuggestionsContext();

  return (
    <button
      type='button'
      {...props}
      ref={ref}
      data-slot='chat-suggestion'
      data-testid={testId}
      className={cn(chatSuggestionVariants({ size }), className)}
    />
  );
};

ChatSuggestion.displayName = 'ChatSuggestion';
