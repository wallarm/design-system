import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Input, type InputProps } from '../Input';
import { useInlineEdit } from './InlineEditContext';

export type InlineEditInputProps = Omit<InputProps, 'value' | 'onChange' | 'error'>;

export const InlineEditInput: FC<InlineEditInputProps> = ({
  size = 'inline-edit',
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, invalid } = useInlineEdit<string>();
  return (
    <Input
      {...props}
      data-testid={testId}
      value={value ?? ''}
      onChange={event => setValue(event.target.value)}
      error={invalid}
      size={size}
    />
  );
};

InlineEditInput.displayName = 'InlineEditInput';
