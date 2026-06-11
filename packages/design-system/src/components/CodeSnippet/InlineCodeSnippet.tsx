import type { ComponentPropsWithRef, FC, MouseEventHandler, ReactElement } from 'react';
import { cloneElement, isValidElement } from 'react';
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
  /** Render as the React element passed via `children` instead of the default `<code>`. The `code` prop becomes the cloned element's content. */
  asChild?: boolean;
  /** Enable click to copy functionality (default: true) */
  copyable?: boolean;
  /** Used only when `asChild` is true. Must be a single React element; the `code` prop is rendered as its children. */
  children?: ReactElement;
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
    children,
    ...otherProps
  } = props;
  const { copied, tooltipOpen, onTooltipOpenChange, handleCopy } = useCopyTooltip({
    text: code,
    enabled: copyable,
  });

  const handleClick: MouseEventHandler<HTMLElement> = event => {
    handleCopy();
    onClick?.(event);
  };

  const sharedProps = {
    ref,
    'data-slot': 'inline-code-snippet',
    // The copyable affordance handles its own click but is not a native
    // interactive element, so it opts out of an enclosing clickable parent's
    // delegated click (e.g. a clickable Card) instead of relying on the
    // removed `stopPropagation()` that would block analytics click capture.
    'data-ds-suppress-parent-click': copyable ? '' : undefined,
    className: cn(inlineCodeSnippetVariants({ size, copyable }), className),
    ...otherProps,
    onClick: handleClick,
  };

  const codeElement =
    asChild && isValidElement(children) ? (
      <Slot {...sharedProps}>{cloneElement(children, {}, code)}</Slot>
    ) : (
      <code {...sharedProps}>{code}</code>
    );

  if (!copyable) {
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
