import { cn } from '../../utils/cn';

export const otpInputCellClassName = cn(
  // Size & layout
  'size-40 rounded-8 border bg-component-input-bg',
  // Typography
  'font-mono text-sm text-text-primary text-center',
  // Effects
  'shadow-xs transition-[color,border,box-shadow]',
  'outline-none',
  // Default border
  'border-border-primary',
  // Hover (non-disabled, non-focused, non-invalid)
  '[&:not([data-disabled]):not(:focus):not([data-invalid])]:hover:border-component-border-input-hover',
  // Focus (non-disabled, non-invalid)
  '[&:not([data-disabled]):not([data-invalid])]:focus:border-border-strong-primary',
  '[&:not([data-disabled]):not([data-invalid])]:focus:ring-3',
  '[&:not([data-disabled]):not([data-invalid])]:focus:ring-focus-primary',
  // Invalid
  'data-invalid:border-border-strong-danger',
  '[&[data-invalid]:not([data-disabled])]:focus:ring-3',
  '[&[data-invalid]:not([data-disabled])]:focus:ring-focus-destructive',
  '[&[data-invalid]:not([data-disabled]):not(:focus)]:hover:ring-3',
  '[&[data-invalid]:not([data-disabled]):not(:focus)]:hover:ring-focus-destructive-hover',
  // Disabled
  'data-disabled:cursor-not-allowed data-disabled:opacity-50',
);

export const otpInputSeparatorClassName = cn('text-text-secondary text-sm select-none shrink-0');
