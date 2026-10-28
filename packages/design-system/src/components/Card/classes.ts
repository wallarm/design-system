import { cva } from 'class-variance-authority';

export const cardVariants = cva(
  'flex h-full min-w-[240px] flex-col gap-8 overflow-hidden rounded-8 border-1 py-16 text-sm shadow-sm transition-colors duration-200',
  {
    variants: {
      color: {
        primary: 'border-border-primary-light bg-bg-surface-1',
        secondary: 'border-border-primary-light bg-bg-light-primary',
      },
      interactive: {
        true: [
          'overlay cursor-pointer',
          'hover:not-disabled:overlay-states-primary-hover',
          '[&:active:not(:has(a:active,button:active,input:active,select:active,textarea:active))]:not-disabled:overlay-states-primary-pressed',
          'focus-visible:ring-2 focus-visible:ring-focus-primary focus-visible:outline-none',
        ],
        false: '',
      },
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      color: 'primary',
      interactive: false,
      disabled: false,
    },
  },
);
