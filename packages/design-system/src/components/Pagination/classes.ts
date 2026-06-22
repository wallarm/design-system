import { cva } from 'class-variance-authority';

export const paginationVariants = cva('flex w-full items-center gap-6', {
  variants: {
    align: {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    },
  },
  defaultVariants: { align: 'left' },
});

export const paginationItemVariants = cva(
  [
    'inline-flex items-center justify-center shrink-0 rounded-8',
    'text-sm font-medium font-sans text-text-primary',
    'cursor-pointer transition-colors',
    'border-1 border-transparent bg-transparent',
    'hover:bg-states-primary-hover active:bg-states-primary-pressed',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
    'disabled:opacity-50 disabled:pointer-events-none disabled:hover:bg-transparent',
    'data-[selected]:bg-states-primary-active',
  ],
  {
    variants: {
      size: {
        medium: 'size-32',
        small: 'size-24',
      },
    },
    defaultVariants: { size: 'medium' },
  },
);

export const paginationEllipsisVariants = cva(
  'inline-flex items-center justify-center shrink-0 text-text-secondary opacity-50 [&_svg]:icon-md',
  {
    variants: {
      size: {
        medium: 'size-32',
        small: 'size-24',
      },
    },
    defaultVariants: { size: 'medium' },
  },
);
