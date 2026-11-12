import type { FC, InputHTMLAttributes, Ref } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { inputVariants } from './classes';

type InputNativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type InputVariantsProps = VariantProps<typeof inputVariants>;

export type InputProps = InputNativeProps &
  InputVariantsProps &
  TestableProps & {
    ref?: Ref<HTMLInputElement>;
  };

export const Input: FC<InputProps> = ({
  className,
  error,
  size = 'default',
  disabled,
  ref,
  ...props
}) => {
  // Explicit props win; otherwise the enclosing Field's state applies.
  const field = useFieldContext();
  const invalid = error ?? field?.invalid ?? false;
  const isDisabled = disabled ?? field?.disabled ?? false;

  return (
    <input
      {...field?.getInputProps()}
      {...props}
      className={cn(inputVariants({ error: invalid, size }), className)}
      disabled={isDisabled}
      aria-invalid={invalid}
      aria-disabled={isDisabled}
      ref={ref}
      data-slot='input'
    />
  );
};

Input.displayName = 'Input';
