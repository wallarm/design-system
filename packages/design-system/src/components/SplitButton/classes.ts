import { cva } from 'class-variance-authority';

export const splitButtonVariants = cva([
  'inline-flex items-center gap-1',
  '[&>:first-child]:rounded-r-none',
  '[&>:last-child]:rounded-l-none',
  // Outline buttons (detected via unique bg class): no gap, collapse inner borders into single line
  'has-[>.bg-component-outline-button-bg]:gap-0',
  '[&:has(>.bg-component-outline-button-bg)>:not(:first-child)]:-ml-px',
]);
