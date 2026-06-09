import { cn } from '../../utils/cn';

export const otpInputGroupClassName = cn('flex items-center rounded-8 shadow-xs');

export const otpInputCellClassName = cn(
  // Size & layout
  'h-36 w-32 bg-component-input-bg',
  // Typography
  'font-mono text-sm text-text-primary text-center uppercase',
  // Border
  'border border-border-primary outline-none',
  // Collapse borders between adjacent cells
  '[&:not(:first-child)]:-ml-px',
  // Rounded corners on group edges
  'first:rounded-l-8 last:rounded-r-8',
  // Transition
  'transition-[color,border,box-shadow]',
  // Hover (non-disabled, non-focused, non-invalid)
  '[&:not([data-disabled]):not(:focus):not([data-invalid])]:hover:relative',
  '[&:not([data-disabled]):not(:focus):not([data-invalid])]:hover:z-10',
  '[&:not([data-disabled]):not(:focus):not([data-invalid])]:hover:border-component-border-input-hover',
  // Focus (non-disabled, non-invalid)
  '[&:not([data-disabled]):not([data-invalid])]:focus:relative',
  '[&:not([data-disabled]):not([data-invalid])]:focus:z-15',
  '[&:not([data-disabled]):not([data-invalid])]:focus:border-border-strong-primary',
  '[&:not([data-disabled]):not([data-invalid])]:focus:ring-3',
  '[&:not([data-disabled]):not([data-invalid])]:focus:ring-focus-primary',
  // Invalid
  'data-invalid:border-border-strong-danger',
  '[&[data-invalid]:not([data-disabled])]:focus:relative',
  '[&[data-invalid]:not([data-disabled])]:focus:z-10',
  '[&[data-invalid]:not([data-disabled])]:focus:ring-3',
  '[&[data-invalid]:not([data-disabled])]:focus:ring-focus-destructive',
  // Disabled
  'data-disabled:cursor-not-allowed data-disabled:opacity-50',
);

export const otpInputSeparatorClassName = cn('text-text-secondary text-sm select-none shrink-0');
