import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type InputGroupProps = HTMLAttributes<HTMLDivElement>;

export const InputGroup: FC<InputGroupProps> = props => (
  <div
    data-slot='input-group'
    role='group'
    className={cn(
      'group/input-group',

      // Dimensions
      'w-full h-36 has-[>textarea]:h-auto',

      // Layout
      'flex items-center border rounded-8 bg-component-input-bg relative',

      // Static state
      'border border-border-primary outline-none shadow-xs transition-[color,border,box-shadow]',
      'has-[[data-slot=input-group-control]:not(:disabled):not(:focus-visible)]:hover:border-component-border-input-hover',

      // Focus state.
      'focus-visible:ring-focus-primary',
      'has-[[data-slot=input-group-control]:focus-visible]:ring-3',
      'has-[[data-slot=input-group-control]:focus-visible]:ring-focus-primary',
      'has-[[data-slot=input-group-control]:focus-visible]:border-border-strong-primary',

      // Error state.
      'has-[[data-slot][aria-invalid=true]]:border-border-strong-danger',
      'has-[[data-slot][aria-invalid=true]]:ring-focus-destructive',
      'has-[[data-slot][aria-invalid=true]:not(:disabled)]:hover:border-border-strong-danger',
      'has-[[data-slot][aria-invalid=true]:not(:disabled)]:hover:ring-3',
      'has-[[data-slot][aria-invalid=true]:not(:disabled)]:hover:ring-focus-destructive-hover',
      'has-[[data-slot][aria-invalid=true]:not(:disabled)]:[&>input]:hover:ring-0',

      // Disabled state.
      'has-[[data-slot=input-group-control]:disabled]:opacity-50',
      'has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed',
    )}
    {...props}
  />
);

InputGroup.displayName = 'InputGroup';
