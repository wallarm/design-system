import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const chatVariants = cva(
  'relative isolate flex h-full min-h-0 flex-col overflow-hidden bg-bg-page-bg',
);

export const chatBackgroundVariants = cva('pointer-events-none absolute inset-0 -z-1', {
  variants: {
    background: {
      strong: 'opacity-12',
      subtle: 'opacity-5',
    },
  },
  defaultVariants: {
    background: 'subtle',
  },
});

export const chatHeaderVariants = cva(
  'flex h-48 shrink-0 items-center justify-between gap-8 border-b border-border-primary-light bg-bg-page-bg pr-12 pl-16',
);

export const chatHeaderTitleVariants = cva('flex min-w-0 items-center');

export const chatHeaderActionsVariants = cva(
  cn(
    'flex shrink-0 items-center gap-4',
    '*:data-[orientation=vertical]:mx-2 *:data-[orientation=vertical]:h-16 *:data-[orientation=vertical]:self-center',
  ),
);

export const chatBodyVariants = cva(
  'flex min-h-0 flex-1 flex-col overflow-y-auto px-16 pt-12 pb-16',
);

export const chatFooterVariants = cva('flex shrink-0 flex-col gap-16 px-20 pb-4');

export const chatGreetingVariants = cva('flex flex-col items-center gap-24 pt-103');

export const chatSuggestionsVariants = cva('flex flex-col', {
  variants: {
    placement: {
      footer: 'items-end gap-8',
      greeting: 'items-center gap-12',
    },
  },
  defaultVariants: {
    placement: 'footer',
  },
});

export const chatSuggestionsLabelVariants = cva(
  "font-mono [font-feature-settings:'liga'_0] text-xs text-text-secondary",
);

export const chatSuggestionVariants = cva(
  cn(
    'inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap',
    "border border-border-primary bg-transparent font-mono [font-feature-settings:'liga'_0] font-normal text-text-primary transition-colors outline-none",
    'not-disabled:hover:border-border-brand not-disabled:hover:bg-bg-light-brand not-disabled:hover:text-text-brand',
    'focus-visible:ring-3 focus-visible:ring-focus-brand',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ),
  {
    variants: {
      size: {
        md: 'h-20 rounded-8 px-8 text-xs',
        lg: 'h-28 rounded-12 px-12 text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);
