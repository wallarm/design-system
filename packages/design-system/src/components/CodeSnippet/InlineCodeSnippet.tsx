import type { ComponentPropsWithRef, FC, MouseEventHandler } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { useCopyTooltip } from '../../hooks';
import { cn } from '../../utils/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export interface InlineCodeSnippetProps extends Omit<ComponentPropsWithRef<'code'>, 'children'> {
  /** The code content to display */
  code: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'inherit';
  /** Render as child element using Radix Slot */
  asChild?: boolean;
  /** Enable click to copy functionality (default: true) */
  copyable?: boolean;
}

type VariantStyles = {
  size: Record<NonNullable<InlineCodeSnippetProps['size']>, string>;
  copyable: Record<`${boolean}`, string>;
};

const inlineCodeSnippetVariants = cva(
  [
    'inline-flex items-center',
    'code-snippet-bg',
    'rounded-6',
    'font-mono font-normal',
    'text-syntax-no-syntax',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-xs px-4 py-2',
        md: 'text-sm px-4 py-2',
        lg: 'text-base leading-sm px-4 py-2',
        inherit: 'text-[1em] px-[0.25em] py-[0.125em]',
      },
      copyable: {
        true: 'cursor-pointer hover:bg-states-primary-hover active:bg-states-primary-pressed',
        false: '',
      },
    } satisfies VariantStyles,
  },
);

/**
 * InlineCodeSnippet - A simple inline code display component with optional copy functionality.
 *
 * @example
 * ```tsx
 * <p>
 *   Run <InlineCodeSnippet code="npm install" /> to install dependencies.
 * </p>
 * ```
 */
export const InlineCodeSnippet: FC<InlineCodeSnippetProps> = props => {
  const {
    code,
    size = 'inherit',
    asChild = false,
    copyable = true,
    className,
    onClick,
    ref,
    ...otherProps
  } = props;
  const { isSupported, copied, tooltipOpen, onTooltipOpenChange, handleCopy } = useCopyTooltip({
    text: code,
    enabled: copyable,
  });
  const Comp = asChild ? Slot : 'code';

  const isCopyable = copyable && isSupported;

  const handleClick: MouseEventHandler<HTMLElement> = event => {
    handleCopy(event);
    onClick?.(event);
  };

  const codeElement = (
    <Comp
      ref={ref}
      data-slot='inline-code-snippet'
      className={cn(inlineCodeSnippetVariants({ size, copyable: isCopyable }), className)}
      {...otherProps}
      onClick={handleClick}
    >
      {code}
    </Comp>
  );

  if (!isCopyable) {
    return codeElement;
  }

  return (
    <Tooltip open={tooltipOpen} onOpenChange={onTooltipOpenChange} closeOnPointerDown={false}>
      <TooltipTrigger asChild>{codeElement}</TooltipTrigger>
      <TooltipContent>{copied ? 'Copied' : 'Click to copy'}</TooltipContent>
    </Tooltip>
  );
};

InlineCodeSnippet.displayName = 'InlineCodeSnippet';
