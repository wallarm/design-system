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
    'inline-flex shrink-0 items-center justify-center rounded-8',
    'font-sans text-sm font-medium text-text-primary',
    'cursor-pointer transition-colors',
    'border-1 border-transparent bg-transparent',
    'hover:bg-states-primary-hover active:bg-states-primary-pressed',
    'focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50 disabled:hover:bg-transparent',
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
  'inline-flex shrink-0 items-center justify-center text-text-secondary opacity-50 [&_svg]:icon-md',
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
