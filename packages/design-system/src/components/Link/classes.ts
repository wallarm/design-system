import { cva } from 'class-variance-authority';

export const linkVariants = cva(
  'inline-flex cursor-pointer items-center gap-4 font-sans underline decoration-transparent transition-colors outline-none hover:decoration-current active:decoration-current [&_svg]:pointer-events-none [&_svg]:icon-md [&_svg]:shrink-0',
  {
    variants: {
      type: {
        default: 'active:text-link-default text-text-link-default hover:text-text-link-hover',
        alt: 'active:text-link-default-alt text-text-link-default-alt hover:text-text-link-hover-alt',
        muted: 'text-text-secondary hover:text-slate-700 active:text-slate-700',
        table: 'active:text-link-default text-text-primary hover:text-text-link-hover',
      },
      size: {
        xs: 'text-2xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg leading-xl',
      },
      weight: {
        regular: 'font-normal',
        medium: 'font-medium',
      },
      disabled: {
        true: '!cursor-not-allowed !text-text-tertiary !decoration-transparent hover:!decoration-transparent',
      },
    },
  },
);
