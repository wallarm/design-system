import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

// Disclaimer sits 4px under the box (Figma 90 → 94).
export const chatInputVariants = cva('flex flex-col gap-4');

// Figma Variant2: blue bar behind the box; the box is the bar's last child.
export const chatInputContextVariants = cva(
  'flex flex-col rounded-16 border border-border-info bg-bg-light-info',
);

// 34px chips strip (Figma 26:656).
export const chatInputContextChipsVariants = cva(
  'flex flex-wrap items-center gap-6 px-12 pt-8 pb-6',
);

// Empty height: 1 + 9 + 20 + 24 + 24 + 11 + 1 = 90 (Figma). The ring shows only while the
// textarea is focused, so tabbing to a button inside doesn't double the ring (as in InputGroup).
export const chatInputBoxVariants = cva(
  cn(
    'flex flex-wrap items-center gap-x-6 gap-y-24 rounded-16 border border-border-primary px-11 pt-9 pb-11',
    'transition-[border-color,box-shadow] motion-reduce:transition-none',
    'hover:border-component-border-input-hover',
    'has-[textarea:focus]:border-component-border-input-hover has-[textarea:focus]:shadow-none has-[textarea:focus]:ring-3 has-[textarea:focus]:ring-focus-primary',
  ),
  {
    variants: {
      withContext: {
        false: 'bg-component-input-bg shadow-xs',
        true: '-mx-px -mb-px bg-bg-surface-1 shadow-sm',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
      },
    },
    defaultVariants: { withContext: false },
  },
);

export const chatInputTextareaVariants = cva(
  cn(
    'w-full basis-full resize-none bg-transparent text-sm text-text-primary outline-none',
    '[scrollbar-width:thin] placeholder:text-text-secondary disabled:cursor-not-allowed',
  ),
);

export const chatInputDisclaimerVariants = cva('text-center text-xs text-text-secondary');
