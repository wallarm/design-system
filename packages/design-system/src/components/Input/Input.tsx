import type { FC, InputHTMLAttributes, Ref } from 'react';

import { type HTMLProps } from '@ark-ui/react/factory';
import { useFieldContext } from '@ark-ui/react/field';
import { mergeProps } from '@ark-ui/react/utils';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

import { inputVariants } from './classes';

type InputNativeProps = InputHTMLAttributes<HTMLInputElement>;

type InputVariantsProps = VariantProps<typeof inputVariants>;

export type InputProps = InputNativeProps &
  InputVariantsProps & {
    ref?: Ref<HTMLInputElement>;
  };

export const Input: FC<InputProps> = ({
  className,
  error = false,
  disabled = false,
  ...props
}) => {
  const field = useFieldContext();
  const mergedProps = mergeProps<HTMLProps<'input'>>(
    field?.getInputProps(),
    props,
  );

  return (
    <input
      {...mergedProps}
      {...props}
      className={cn('h-36 py-8', inputVariants({ error }), className)}
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-disabled={disabled}
    />
  );
};

Input.displayName = 'Input';
