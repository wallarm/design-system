/**
 * ConditionTree CVA Classes
 *
 * Variant definitions for condition tree components.
 */

import { cva } from 'class-variance-authority';

/**
 * Container for condition tree groups.
 */
export const conditionTreeVariants = cva('flex flex-col gap-8', {
  variants: {
    variant: {
      root: '',
      nested: 'rounded-12 border border-border-primary-light p-12 pl-16 relative',
    },
  },
  defaultVariants: {
    variant: 'root',
  },
});

/**
 * Condition card wrapper (for individual conditions).
 */
export const conditionCardVariants = cva(
  'flex items-start gap-8 rounded-12 border border-border-primary-light p-12',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-border-danger-light',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/**
 * Left border for nested groups (visual hierarchy).
 */
export const groupBorderVariants = cva('absolute left-0 top-0 bottom-0 w-4 rounded-l-12', {
  variants: {
    color: {
      primary: 'bg-bg-accent-primary',
      secondary: 'bg-bg-accent-secondary',
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

/**
 * Operator selector wrapper.
 */
export const operatorSelectVariants = cva('', {
  variants: {
    size: {
      default: 'w-96',
      compact: 'w-80',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

/**
 * Add condition button variants.
 */
export const addConditionButtonVariants = cva('', {
  variants: {
    state: {
      default: '',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});
