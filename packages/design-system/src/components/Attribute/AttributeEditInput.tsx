import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Input, type InputProps } from '../Input';
import { useAttributeEdit } from './AttributeEditContext';

export type AttributeEditInputProps = Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'error'
>;

export const AttributeEditInput: FC<AttributeEditInputProps> = ({
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('edit-input', testIdProp);
  const { value, setValue, invalid } = useAttributeEdit<string>();
  return (
    <Input
      {...props}
      data-testid={testId}
      defaultValue={value ?? ''}
      onChange={event => setValue(event.target.value)}
      error={invalid}
      className={cn('h-28 px-8', className)}
    />
  );
};

AttributeEditInput.displayName = 'AttributeEditInput';
