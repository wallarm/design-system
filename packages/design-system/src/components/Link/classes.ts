import { cva } from 'class-variance-authority';

export const linkVariants = cva(
  'inline-flex items-center gap-4 font-sans transition-colors underline decoration-transparent hover:decoration-current active:decoration-current outline-none [&_svg]:pointer-events-none [&_svg]:icon-md [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      type: {
        default: 'text-text-link-default hover:text-text-link-hover active:text-link-default',
        alt: 'text-text-link-default-alt hover:text-text-link-hover-alt active:text-link-default-alt',
        muted: 'text-text-secondary hover:text-text-link-hover active:text-link-default',
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
    },
  },
);
