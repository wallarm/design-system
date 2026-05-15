import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const accordionRootVariants = cva('flex flex-col w-full');

export const accordionItemVariants = cva('w-full', {
  variants: {
    variant: {
      primary: 'flex flex-col',
      secondary: 'flex flex-col',
      section: cn(
        'grid grid-cols-[minmax(0,1fr)_auto] items-center',
        'border-b-1 border-border-primary last:border-b-0',
        'pl-16 pr-8 py-8',
      ),
    },
  },
  defaultVariants: { variant: 'primary' },
});

export const accordionTriggerVariants = cva(
  cn(
    'group/accordion-trigger flex items-center w-full cursor-pointer min-w-0',
    'transition-[background-color,opacity] duration-150 ease-out motion-reduce:transition-none',
    'rounded-12 bg-transparent',
    'hover:bg-states-primary-hover',
    'active:bg-states-primary-pressed',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
    'font-sans text-text-primary',
  ),
  {
    variants: {
      variant: {
        primary: 'h-40 gap-4 px-12 text-base font-normal',
        secondary: cn(
          'h-24 gap-4 px-0 text-sm font-medium text-text-secondary',
          'hover:bg-transparent active:bg-transparent',
        ),
        section: cn(
          'col-start-1 row-start-1 justify-between gap-8 px-0 py-0 text-sm font-medium',
          'hover:bg-transparent active:bg-transparent',
        ),
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

export const accordionActionsVariants = cva(
  cn('flex items-center gap-4 col-start-2 row-start-1 pl-8 shrink-0'),
);

export const accordionTriggerTitleVariants = cva('block flex-1 min-w-0 truncate text-left');

export const accordionIndicatorVariants = cva(
  cn(
    'inline-flex items-center justify-center shrink-0',
    'rounded-8 size-24',
    'transition-transform duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
  ),
  {
    variants: {
      variant: {
        primary: 'text-text-primary data-[state=open]:rotate-90',
        secondary: 'text-text-secondary data-[state=open]:rotate-90',
        section: 'text-text-primary data-[state=open]:rotate-180',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

export const accordionContentVariants = cva(
  cn(
    'overflow-hidden',
    'data-[state=open]:animate-[accordion-down_220ms_cubic-bezier(0.4,0,0.2,1)]',
    'data-[state=closed]:animate-[accordion-up_220ms_cubic-bezier(0.4,0,0.2,1)]',
    'motion-reduce:animate-none',
  ),
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
        section: 'col-span-2 row-start-2',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

export const accordionContentInnerVariants = cva('', {
  variants: {
    variant: {
      primary: 'pt-8',
      secondary: 'pt-8',
      section: 'pt-8',
    },
  },
  defaultVariants: { variant: 'primary' },
});
