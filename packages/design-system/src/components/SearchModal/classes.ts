import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const searchModalContentVariants = cva(
  cn(
    'w-[560px] max-h-[70vh]',
    'bg-bg-surface-1',
    'rounded-12',
    'shadow-lg',
    'border border-border-primary',
    'overflow-hidden',
    'flex flex-col',
    'outline-none',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
    'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
    'data-[state=open]:slide-in-from-top-[2%]',
    'data-[state=closed]:slide-out-to-top-[2%]',
    'data-[state=open]:duration-200 data-[state=closed]:duration-150',
  ),
);

export const searchModalInputVariants = cva(
  cn('flex items-center gap-8 px-16', 'border-b border-border-primary'),
);

export const searchModalItemVariants = cva(
  cn(
    'flex items-center gap-12 w-full',
    'px-16 py-8 rounded-6',
    'cursor-pointer text-left no-underline',
    'transition-colors',
  ),
  {
    variants: {
      active: {
        true: 'bg-states-primary-hover',
        false: 'hover:bg-states-primary-hover',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
    },
  },
);

export const searchModalBodyVariants = cva(cn('overflow-y-auto flex-1 py-8'));

export const searchModalGroupLabelVariants = cva(cn('px-16 pt-8'));

export const searchModalFooterVariants = cva(
  cn('flex items-center gap-16 px-16 py-8', 'border-t border-border-primary'),
);
