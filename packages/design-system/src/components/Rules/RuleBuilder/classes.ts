/**
 * RuleBuilder CVA variants
 */

import { cva } from 'class-variance-authority';

/**
 * Main RuleBuilder container variants
 */
export const ruleBuilderVariants = cva('flex flex-col gap-20', {
  variants: {},
  defaultVariants: {},
});

/**
 * Summary container variants (for read-only views)
 */
export const summaryVariants = cva('flex flex-col gap-12', {
  variants: {},
  defaultVariants: {},
});

/**
 * Summary card variants (for individual condition/action display)
 */
export const summaryCardVariants = cva(
  'rounded-8 border border-border-primary-light p-12 flex flex-col gap-8',
  {
    variants: {},
    defaultVariants: {},
  },
);

/**
 * Summary nested group variants (for nested condition groups)
 */
export const summaryNestedVariants = cva(
  'border-l-2 border-border-primary-light pl-12 ml-8 flex flex-col gap-8',
  {
    variants: {},
    defaultVariants: {},
  },
);
