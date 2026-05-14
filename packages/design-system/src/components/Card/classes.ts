import { cva } from 'class-variance-authority';

export const cardVariants = cva(
  'flex flex-col gap-8 rounded-8 border-1 shadow-sm min-w-[240px] overflow-hidden py-16 transition-colors duration-200 h-full text-sm',
  {
    variants: {
      color: {
        primary: 'bg-bg-surface-1 border-border-primary-light',
        secondary: 'bg-bg-light-primary border-border-primary-light',
      },
      interactive: {
        true: [
          'cursor-pointer overlay',
          'hover:not-disabled:overlay-states-primary-hover',
          '[&:active:not(:has(a:active,button:active,input:active,select:active,textarea:active))]:not-disabled:overlay-states-primary-pressed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary',
        ],
        false: '',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none cursor-not-allowed',
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
