import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const resizableHandleVariants = cva(
  cn(
    'relative',
    'flex items-center justify-center',
    'outline-none',

    // Visible 1px line (light gray, always visible)
    'bg-border-primary',

    // Thicker brand bar via before: pseudo (shown on hover/active)
    'before:absolute before:content-[""]',
    'before:rounded-full',
    'before:bg-bg-fill-brand',
    'before:opacity-0',
    'before:transition-opacity before:duration-150',

    // Invisible hit area via after: pseudo
    'after:absolute after:content-[""]',
    'after:z-10',

    // Show brand bar on hover / active / focus
    'hover:before:opacity-100',
    'data-[separator=active]:before:opacity-100',
    'focus-visible:before:opacity-100',

    // Focus ring
    'focus-visible:ring-2 focus-visible:ring-focus-primary focus-visible:ring-offset-0',
  ),
  {
    variants: {
      orientation: {
        horizontal: cn(
          'w-px',
          'cursor-col-resize',
          'before:w-3 before:inset-y-0',
          'after:inset-y-0 after:-inset-x-6',
          '[&>[data-slot=resizable-handle-grip]]:rotate-0',
        ),
        vertical: cn(
          'h-px',
          'cursor-row-resize',
          'before:h-3 before:inset-x-0',
          'after:inset-x-0 after:-inset-y-6',
          '[&>[data-slot=resizable-handle-grip]]:rotate-90',
        ),
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
);

export const resizableHandleGripVariants = cva(
  cn(
    'z-20',
    'flex items-center justify-center',
    'size-12',
    'rounded-4',
    'border border-border-primary',
    'bg-bg-surface-2',
    'text-text-secondary',
  ),
);
