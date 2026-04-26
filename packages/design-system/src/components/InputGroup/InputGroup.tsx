import type { FC, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';

export const inputGroupVariants = cva(
  cn(
    'group/input-group',

    // Layout
    'w-full flex items-center border rounded-8 bg-component-input-bg relative',

    // Textarea escape hatch — let the textarea control its own height
    'has-[>textarea]:h-auto',

    // Base Input override
    '**:data-[slot=input]:flex-1',
    '**:data-[slot=input]:rounded-none',
    '**:data-[slot=input]:border-0',
    '**:data-[slot=input]:bg-transparent',
    '**:data-[slot=input]:shadow-none',
    '**:data-[slot=input]:focus-visible:ring-0',
    '**:data-[slot=input]:focus-within:ring-0',

    // Static state
    'border border-border-primary outline-none shadow-xs transition-[color,border,box-shadow]',
    'has-[[data-slot=input]:not(:disabled):not([aria-disabled=true]):not([data-readonly=true]):not(:focus-visible)]:hover:border-component-border-input-hover',

    // Focus state.
    'focus-visible:ring-focus-primary',
    'has-[[data-slot=input]:not([data-readonly=true]):focus-visible]:ring-3',
    'has-[[data-slot=input]:not([data-readonly=true]):focus-visible]:ring-focus-primary',
    'has-[[data-slot=input]:not([data-readonly=true]):focus-visible]:border-border-strong-primary',

    'focus-within:ring-focus-primary',
    'has-[[data-slot=input]:not([data-readonly=true]):focus-within]:ring-3',
    'has-[[data-slot=input]:not([data-readonly=true]):focus-within]:ring-focus-primary',
    'has-[[data-slot=input]:not([data-readonly=true]):focus-within]:border-border-strong-primary',

    // Error state.
    'has-[[data-slot][aria-invalid=true]]:border-border-strong-danger',
    'has-[[data-slot][aria-invalid=true]]:ring-focus-destructive',
    'has-[[data-slot][aria-invalid=true]:not(:disabled):not([aria-disabled=true]):not([data-readonly=true])]:hover:border-border-strong-danger',
    'has-[[data-slot][aria-invalid=true]:not(:disabled):not([aria-disabled=true]):not([data-readonly=true])]:hover:ring-3',
    'has-[[data-slot][aria-invalid=true]:not(:disabled):not([aria-disabled=true]):not([data-readonly=true])]:hover:ring-focus-destructive-hover',
    'has-[[data-slot][aria-invalid=true]:not(:disabled):not([aria-disabled=true]):not([data-readonly=true])]:*:data-[slot=input]:hover:ring-0',

    // Disabled state.
    'has-[[data-slot=input]:disabled]:opacity-50',
    'has-[[data-slot=input][aria-disabled=true]]:opacity-50',
    'has-[[data-slot=input]:disabled]:cursor-not-allowed',
    'has-[[data-slot=input][aria-disabled=true]]:cursor-not-allowed',
  ),
  {
    variants: {
      size: {
        default: 'h-36',
        medium: 'h-32',
        small: 'h-24',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export type InputGroupSize = NonNullable<VariantProps<typeof inputGroupVariants>['size']>;

type InputGroupProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof inputGroupVariants> &
  TestableProps;

export const InputGroup: FC<InputGroupProps> = ({
  'data-testid': testId,
  size = 'default',
  className,
  ...props
}) => (
  <TestIdProvider value={testId}>
    <div
      data-slot='input-group'
      data-testid={testId}
      data-size={size}
      role='group'
      className={cn(inputGroupVariants({ size }), className)}
      {...props}
    />
  </TestIdProvider>
);

InputGroup.displayName = 'InputGroup';
