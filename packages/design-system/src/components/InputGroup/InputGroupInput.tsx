import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Input, type InputProps } from '../Input';

export type InputGroupInputProps = InputProps;

export const InputGroupInput: FC<InputGroupInputProps> = props => {
  const testId = useTestId('input');

  return (
    <Input
      {...props}
      className={cn('flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0')}
      data-slot='input-group-control'
      data-testid={testId}
    />
  );
};

InputGroupInput.displayName = 'InputGroupInput';
