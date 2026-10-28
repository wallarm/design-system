import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const numberInputRootVariants = cva(
  cn(
    // Layout
    'relative flex w-full items-stretch rounded-8 border bg-component-input-bg has-[>textarea]:h-auto',

    // Static state
    'border border-border-primary shadow-xs transition-[color,border,box-shadow] outline-none',
    '[&:not([data-disabled]):not([data-focus])]:hover:border-component-border-input-hover',

    // Focus state.
    '[&[data-focus]:not([data-disabled])]:ring-3',
    '[&[data-focus]:not([data-disabled]):not([data-invalid])]:ring-focus-primary',
    '[&[data-focus]:not([data-disabled]):not([data-invalid])]:border-border-strong-primary',

    // Error state.
    'data-invalid:border-border-strong-danger data-invalid:ring-focus-destructive',
    '[&[data-invalid]:not([data-disabled])]:hover:border-border-strong-danger',
    '[&[data-invalid]:not([data-disabled]):not([data-focus])]:hover:ring-3',
    '[&[data-invalid]:not([data-disabled]):not([data-focus])]:hover:ring-focus-destructive-hover',
    '[&[data-invalid]:not([data-disabled])]:[&>input]:hover:ring-0',

    // Disabled state.
    'data-disabled:opacity-50',
    'data-disabled:cursor-not-allowed',
    'data-disabled:*:cursor-not-allowed',
  ),
  {
    // 24/28/32/36px scale, matching Input/Textarea/Select/DateInput/TimeInput.
    variants: {
      size: {
        default: 'h-36',
        medium: 'h-32',
        small: 'h-24',
        'inline-edit': 'h-28',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export const numberInputFieldVariants = cva(
  cn(
    'h-full flex-1 rounded-none border-0 bg-transparent shadow-none outline-none',
    'font-sans text-sm font-normal text-text-primary placeholder:text-text-secondary',
  ),
  {
    // Vertical padding is (height - 20) / 2 so the text-sm/20px-line-height
    // value stays vertically centered at every size — same formula as Input.
    variants: {
      size: {
        default: 'px-12 py-8',
        medium: 'px-12 py-6',
        small: 'px-12 py-2',
        'inline-edit': 'px-12 py-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export const numberInputControlVariants = cva(
  cn(
    'flex flex-col justify-center',
    'border-l border-border-primary bg-states-primary-default-alt',
    '[&_svg]:pointer-events-none',
  ),
  {
    variants: {
      size: {
        default: 'px-4 py-2 [&_svg]:icon-sm',
        medium: 'px-3 py-1 [&_svg]:icon-sm',
        small: 'px-2 py-0 [&_svg]:icon-xs',
        'inline-edit': 'px-2 py-0 [&_svg]:icon-xs',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export const numberInputTriggerVariants = cva(
  cn(
    'flex cursor-pointer items-center justify-center rounded-2 transition-colors',
    'hover:bg-states-primary-hover',
    '[&[data-disabled]]:pointer-events-none [&[data-disabled]]:cursor-not-allowed',
  ),
  {
    variants: {
      size: {
        // Flex centering is load-bearing: the icon utility renders SVGs as
        // inline-block with a baseline vertical-align, which drags the glyph
        // below center inside this fixed-size button under inherited
        // font-size/line-height.
        default: 'h-14 w-16 px-2 py-1',
        medium: 'h-12 w-14 px-2 py-1',
        small: 'h-10 w-12 px-1 py-0',
        'inline-edit': 'h-11 w-12 px-1 py-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);
