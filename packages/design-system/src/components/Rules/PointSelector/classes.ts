import { cva } from 'class-variance-authority';

/**
 * WhereBar CVA variants
 *
 * Chips-based point builder with inline input.
 */
export const whereBarVariants = cva(
  [
    'flex min-h-40 w-full flex-wrap items-center gap-6 rounded-8 border px-8 py-6 shadow-xs',
    'transition-[color,border,box-shadow]',
    'border-border-primary',
  ],
  {
    variants: {
      editable: {
        true: 'bg-component-input-bg',
        false: 'bg-bg-surface-2',
      },
    },
    defaultVariants: {
      editable: true,
    },
  },
);

/**
 * WhereBar chip separator
 */
export const chipSeparatorClasses = 'text-text-tertiary';

/**
 * WhereBar pending label (during multi-select)
 */
export const pendingLabelClasses =
  'rounded-6 border border-dashed border-border-strong-brand bg-bg-light-brand px-8 py-2 text-sm text-text-brand';

/**
 * WhereBar input field
 */
export const whereBarInputClasses =
  'h-24 min-w-160 flex-1 border-none bg-transparent p-0 text-sm text-text-primary shadow-none outline-none ring-0 placeholder:text-text-secondary';

/**
 * PointSelectorError message
 */
export const errorMessageClasses = 'mt-1 text-sm text-text-error';

/**
 * MenuFooterHints container
 */
export const menuFooterHintsClasses =
  'flex flex-wrap items-center gap-12 text-xs text-text-secondary';
