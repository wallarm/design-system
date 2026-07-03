import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Input, type InputProps } from '../Input';
import { useInlineEdit } from './InlineEditContext';

export type InlineEditInputProps = Omit<InputProps, 'value' | 'onChange' | 'error'>;

export const InlineEditInput: FC<InlineEditInputProps> = ({
  className,
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
      className={cn('h-28 px-8', className)}
    />
  );
};

InlineEditInput.displayName = 'InlineEditInput';
