import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const searchModalContentVariants = cva(
  cn(
    'w-[560px] max-h-[70vh]',
    'bg-bg-surface-2',
    'rounded-12',
    'shadow-xl',
    'border border-border-primary-light',
    'overflow-hidden',
    'flex flex-col',
    'outline-none',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
    'data-[state=open]:slide-in-from-bottom-[25%]',
    'data-[state=closed]:slide-out-to-bottom-[25%]',
    'data-[state=open]:duration-300 data-[state=closed]:duration-150',
  ),
);

export const searchModalInputVariants = cva(
  cn('flex items-center gap-12 px-16', 'border-b border-border-primary-light'),
);

export const searchModalItemVariants = cva(
  cn(
    'flex items-center gap-8 w-full',
    'px-8 py-6 rounded-6',
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

export const searchModalBodyVariants = cva(cn('overflow-y-auto flex-1 px-8 py-8'));

export const searchModalGroupLabelVariants = cva(cn('px-8 pt-8 pb-2'));

export const searchModalFooterVariants = cva(
  cn('flex items-center gap-16 px-16 py-8', 'border-t border-border-primary-light'),
);
