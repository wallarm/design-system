import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const accordionRootVariants = cva('flex flex-col w-full', {
  variants: {
    variant: {
      primary: '',
      secondary: '',
      section: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export const accordionItemVariants = cva('flex flex-col w-full', {
  variants: {
    variant: {
      primary: '',
      secondary: '',
      section: 'border-b-1 border-border-primary pl-16 pr-8 py-8',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export const accordionTriggerVariants = cva(
  cn(
    // Layout
    'group/accordion-trigger flex items-center w-full cursor-pointer',
    // Behavior
    'transition-[background-color,opacity] duration-150 ease-out motion-reduce:transition-none',
    'rounded-12 bg-transparent',
    // Hover/active
    'hover:bg-states-primary-hover',
    'active:bg-states-primary-pressed',
    // Focus
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
    // Disabled
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
    // Typography defaults
    'font-sans text-text-primary',
  ),
  {
    variants: {
      variant: {
        primary: 'h-40 gap-4 px-12 text-base font-normal',
        secondary:
          'h-24 gap-4 px-0 text-sm font-medium text-text-secondary hover:bg-transparent active:bg-transparent',
        section:
          'justify-between gap-8 px-0 py-0 text-sm font-medium hover:bg-transparent active:bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export const accordionIndicatorVariants = cva(
  cn(
    'inline-flex items-center justify-center shrink-0',
    'rounded-8 size-24',
    'transition-transform duration-200 ease-out',
    'motion-reduce:transition-none',
  ),
  {
    variants: {
      variant: {
        primary: 'text-text-primary data-[state=open]:rotate-90',
        secondary: 'text-text-secondary data-[state=open]:rotate-90',
        section: 'text-text-primary data-[state=open]:rotate-180',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export const accordionContentVariants = cva(
  cn(
    'overflow-hidden',
    'data-[state=open]:animate-[accordion-down_180ms_ease-out]',
    'data-[state=closed]:animate-[accordion-up_140ms_ease-in]',
    'motion-reduce:animate-none',
  ),
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
        section: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export const accordionContentInnerVariants = cva('', {
  variants: {
    variant: {
      primary: 'pt-8',
      secondary: 'pt-8',
      section: 'pt-8 pb-8',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
