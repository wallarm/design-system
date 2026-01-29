import type { FC, Ref, TextareaHTMLAttributes } from 'react';

import { type HTMLProps } from '@ark-ui/react/factory';
import { useFieldContext } from '@ark-ui/react/field';
import { mergeProps } from '@ark-ui/react/utils';
import { cva, type VariantProps } from 'class-variance-authority';

import { SvgIcon } from '../../icons/SvgIcon';
import { cn } from '../../utils/cn';
import { inputVariants } from '../Input';

const textareaVariants = cva('min-h-[60px]', {
  variants: {
    size: {
      small: 'py-0 min-h-[60px]',
      medium: 'py-6 min-h-[72px]',
      default: 'py-8 min-h-[76px]',
    },
  },
});

type TextareaNativeProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
>;

type TextareaVariantsProps = VariantProps<typeof textareaVariants>;

type InputVariantsProps = VariantProps<typeof inputVariants>;

export type TextareaProps = TextareaNativeProps &
  TextareaVariantsProps &
  InputVariantsProps & { ref?: Ref<HTMLTextAreaElement> };

export const Textarea: FC<TextareaProps> = ({
  error = false,
  disabled = false,
  size = 'default',
  ...props
}) => {
  const field = useFieldContext();
  const mergedProps = mergeProps<HTMLProps<'textarea'>>(
    field?.getTextareaProps(),
  );

  return (
    <div className="relative">
      <textarea
        {...mergedProps}
        {...props}
        className={cn(inputVariants({ error }), textareaVariants({ size }))}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-disabled={disabled}
      />

      <SvgIcon
        className="w-12 h-12 absolute bottom-0 right-0 text-icon-secondary pointer-events-none"
        viewBox="0 0 12 12"
      >
        <path
          d="M6 8L8 6M8 3L3 8"
          stroke="currentColor"
          strokeLinecap="round"
        />
      </SvgIcon>
    </div>
  );
};

Textarea.displayName = 'Textarea';
