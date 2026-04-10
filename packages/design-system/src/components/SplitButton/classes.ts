import { cva } from 'class-variance-authority';

export const splitButtonVariants = cva([
  'inline-flex items-center',
  '[&>:first-child]:rounded-r-none',
  '[&>:last-child]:rounded-l-none',
  '[&>:not(:first-child)]:-ml-px',
]);
