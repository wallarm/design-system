import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const tabsTriggerVariants = cva(
  cn(
    // Layout & positioning
    'relative inline-flex items-center justify-center',
    // Background & colors
    'rounded-lg bg-transparent',

    // Border
    'border-b-1 border-transparent',

    // Behavior
    'transition-all cursor-pointer',
    // Typography
    'text-text-secondary font-medium font-sans whitespace-nowrap',

    // States ---- selected
    'not-data-disabled:data-selected:text-text-primary',

    // States ---- hover
    'not-data-disabled:hover:bg-states-primary-hover not-data-disabled:not-data-selected:hover:text-text-primary',

    // States ---- active
    'not-data-disabled:active:bg-states-primary-pressed',
    'not-data-disabled:not-data-selected:active:text-text-secondary',

    // States ---- focused
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:bg-states-primary-hover',
    'data-[focus=true]:outline-none data-[focus=true]:bg-bg-primary data-[focus=true]:text-text-primary',

    // States ---- disabled
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ),
  {
    variants: {
      size: {
        medium: cn(
          // Sizing
          'h-32',
          // Spacing
          'px-8 py-6 mt-4 mb-6 gap-6',
          // Typography
          'text-sm',
        ),
        small: cn(
          // Sizing
          'h-24',
          // Spacing
          'px-6 py-4 mt-4 mb-4 gap-4',
          // Typography
          'text-xs',
        ),
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  },
);
