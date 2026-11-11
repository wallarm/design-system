import { useState } from 'react';

import { ChatInput, type ChatInputProps } from './ChatInput';
import { ChatInputSubmit, type ChatInputSubmitProps } from './ChatInputSubmit';
import { ChatInputTextarea, type ChatInputTextareaProps } from './ChatInputTextarea';

export interface ComposerProps extends Partial<Omit<ChatInputProps, 'children'>> {
  initialValue?: string;
  textareaProps?: ChatInputTextareaProps;
  submitProps?: ChatInputSubmitProps;
}

/** Stateful ChatInput that owns its draft, the way an app would. */
export const Composer = ({
  initialValue = '',
  onValueChange,
  onSubmit,
  textareaProps,
  submitProps,
  ...props
}: ComposerProps) => {
  const [value, setValue] = useState(initialValue);
  return (
    <ChatInput
      {...props}
      value={props.value ?? value}
      onValueChange={next => {
        setValue(next);
        onValueChange?.(next);
      }}
      onSubmit={text => {
        setValue('');
        onSubmit?.(text);
      }}
    >
      <ChatInputTextarea {...textareaProps} />
      <ChatInputSubmit {...submitProps} />
    </ChatInput>
  );
};
