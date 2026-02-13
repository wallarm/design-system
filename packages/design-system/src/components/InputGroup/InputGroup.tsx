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
      'has-[[data-slot=input]:not(:disabled):not([aria-disabled=true]):not(:focus-visible)]:hover:border-component-border-input-hover',

      // Focus state.
      'focus-visible:ring-focus-primary',
      'has-[[data-slot=input]:focus-visible]:ring-3',
      'has-[[data-slot=input]:focus-visible]:ring-focus-primary',
      'has-[[data-slot=input]:focus-visible]:border-border-strong-primary',

      'focus-within:ring-focus-primary',
      'has-[[data-slot=input]:focus-within]:ring-3',
      'has-[[data-slot=input]:focus-within]:ring-focus-primary',
      'has-[[data-slot=input]:focus-within]:border-border-strong-primary',

      // Error state.
      'has-[[data-slot][aria-invalid=true]]:border-border-strong-danger',
      'has-[[data-slot][aria-invalid=true]]:ring-focus-destructive',
      'has-[[data-slot][aria-invalid=true]:not(:disabled):not([aria-disabled=true])]:hover:border-border-strong-danger',
      'has-[[data-slot][aria-invalid=true]:not(:disabled):not([aria-disabled=true])]:hover:ring-3',
      'has-[[data-slot][aria-invalid=true]:not(:disabled):not([aria-disabled=true])]:hover:ring-focus-destructive-hover',
      'has-[[data-slot][aria-invalid=true]:not(:disabled):not([aria-disabled=true])]:*:data-[slot=input]:hover:ring-0',

      // Disabled state.
      'has-[[data-slot=input]:disabled]:opacity-50',
      'has-[[data-slot=input][aria-disabled=true]]:opacity-50',
      'has-[[data-slot=input]:disabled]:cursor-not-allowed',
      'has-[[data-slot=input][aria-disabled=true]]:cursor-not-allowed',
    )}
    {...props}
  />
);

InputGroup.displayName = 'InputGroup';
