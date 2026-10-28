import { cva } from 'class-variance-authority';

export const userMessageVariants = cva('group/message flex flex-col items-end pr-16');

export const userMessageBubbleVariants = cva(
  'relative max-w-375 rounded-16 bg-bg-light-brand px-16 text-sm text-text-primary',
  {
    variants: {
      /** The text overflows 11 lines and a toggle is rendered under it. */
      withToggle: { true: 'pt-12 pb-28', false: 'py-12' },
    },
    defaultVariants: { withToggle: false },
  },
);

export const userMessageTextVariants = cva('break-words whitespace-pre-wrap outline-none', {
  variants: {
    // 11 lines × 20px. A height cap, not line-clamp: Figma cuts the text with no ellipsis.
    clamped: { true: 'max-h-220 overflow-hidden' },
  },
});

export const userMessageFadeVariants = cva(
  'pointer-events-none absolute inset-x-0 bottom-0 h-36 rounded-b-16',
  {
    variants: {
      expanded: {
        false: 'bg-linear-to-t from-bg-light-brand from-60% to-transparent',
      },
    },
    defaultVariants: { expanded: false },
  },
);

export const userMessageShowMoreVariants = cva(
  'pointer-events-auto absolute top-8 left-16 cursor-pointer rounded-4 text-xs text-text-secondary transition-colors outline-none hover:text-text-primary focus-visible:ring-3 focus-visible:ring-focus-primary',
);
