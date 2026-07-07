import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Textarea, type TextareaProps } from '../Textarea';
import { useInlineEdit } from './InlineEditContext';

export type InlineEditTextareaProps = Omit<TextareaProps, 'value' | 'onChange' | 'error'>;

export const InlineEditTextarea: FC<InlineEditTextareaProps> = ({
  size = 'small',
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, invalid } = useInlineEdit<string>();
  return (
    <Textarea
      {...props}
      data-testid={testId}
      value={value ?? ''}
      onChange={event => setValue(event.target.value)}
      error={invalid}
      size={size}
    />
  );
};

InlineEditTextarea.displayName = 'InlineEditTextarea';
