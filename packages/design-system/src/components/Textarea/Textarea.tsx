import type { FC, Ref, TextareaHTMLAttributes } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import { composeRefs } from '@radix-ui/react-compose-refs';
import type { VariantProps } from 'class-variance-authority';
import { SvgIcon } from '../../icons/SvgIcon';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { inputVariants } from '../Input';
import { textareaHeightVariants, textareaPaddingVariants } from './classes';
import { useAutoResize } from './useAutoResize';

type TextareaNativeProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className' | 'children'
>;

type TextareaVariantsProps = VariantProps<typeof textareaPaddingVariants>;

type InputVariantsProps = VariantProps<typeof inputVariants>;

export interface TextareaProps
  extends TextareaNativeProps,
    TextareaVariantsProps,
    InputVariantsProps,
    TestableProps {
  ref?: Ref<HTMLTextAreaElement>;
  minRows?: number;
  maxRows?: number;
}

export const Textarea: FC<TextareaProps> = ({
  error,
  disabled,
  size = 'default',
  minRows,
  maxRows,
  ref,
  ...props
}) => {
  // Explicit props win; otherwise the enclosing Field's state applies.
  const field = useFieldContext();
  const invalid = error ?? field?.invalid ?? false;
  const isDisabled = disabled ?? field?.disabled ?? false;

  const autoResize = maxRows != null;
  const effectiveMinRows = minRows ?? (autoResize ? 1 : undefined);

  const { ref: autoResizeRef, adjustHeight } = useAutoResize(
    autoResize,
    effectiveMinRows ?? 1,
    maxRows ?? 1,
    props.value,
  );

  return (
    <div className='relative' data-slot='textarea'>
      <textarea
        {...field?.getTextareaProps()}
        {...props}
        ref={composeRefs(autoResizeRef, ref)}
        disabled={isDisabled}
        aria-invalid={invalid}
        aria-disabled={isDisabled}
        rows={effectiveMinRows}
        {...(autoResize && {
          onInput: (e: React.InputEvent<HTMLTextAreaElement>) => {
            adjustHeight();
            props.onInput?.(e);
          },
        })}
        className={cn(
          inputVariants({ error: invalid }),
          textareaPaddingVariants({ size }),
          '[scrollbar-width:thin]',
          !autoResize && textareaHeightVariants({ size }),
          autoResize && 'resize-none',
        )}
      />

      {!autoResize && (
        <SvgIcon
          className='w-12 h-12 absolute bottom-0 right-0 text-icon-secondary pointer-events-none'
          viewBox='0 0 12 12'
        >
          <path d='M6 8L8 6M8 3L3 8' stroke='currentColor' strokeLinecap='round' />
        </SvgIcon>
      )}
    </div>
  );
};

Textarea.displayName = 'Textarea';
