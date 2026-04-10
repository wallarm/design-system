import { cva } from 'class-variance-authority';

export const splitButtonVariants = cva([
  'inline-flex items-center gap-1',
  '[&>:first-child]:rounded-r-none',
  '[&>:last-child]:rounded-l-none',
]);
