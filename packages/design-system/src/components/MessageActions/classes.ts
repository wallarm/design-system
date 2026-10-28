import { cva } from 'class-variance-authority';

export const messageActionsVariants = cva('flex h-30 items-center gap-4', {
  variants: {
    visible: {
      false:
        'opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100 focus-within:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100',
      true: 'opacity-100',
    },
  },
  defaultVariants: { visible: false },
});

export const messageActionVariants = cva(
  // Figma draws these icons in the secondary icon colour (like the timestamp); overrides Button's text-text-primary.
  'text-icon-secondary aria-pressed:bg-states-primary-active',
);

export const messageTimestampVariants = cva(
  "font-mono [font-feature-settings:'liga'_0] text-xs leading-sm whitespace-nowrap text-text-secondary",
);
