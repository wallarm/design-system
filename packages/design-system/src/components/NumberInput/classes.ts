import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const numberInputRootVariants = cva(
  cn(
    // Layout
    'flex items-stretch border rounded-8 bg-component-input-bg relative w-full has-[>textarea]:h-auto',

    // Static state
    'border border-border-primary outline-none shadow-xs transition-[color,border,box-shadow]',
    '[&:not([data-disabled]):not([data-focus])]:hover:border-component-border-input-hover ',

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
    'flex-1 h-full rounded-none border-0 bg-transparent shadow-none outline-none',
    'font-sans font-normal text-sm text-text-primary placeholder:text-text-secondary',
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
    'bg-states-primary-default-alt border-l border-border-primary',
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
    'flex items-center justify-center rounded-2 transition-colors cursor-pointer',
    'hover:bg-states-primary-hover',
    '[&[data-disabled]]:cursor-not-allowed [&[data-disabled]]:pointer-events-none',
  ),
  {
    variants: {
      size: {
        // Flex centering is load-bearing: the icon utility renders SVGs as
        // inline-block with a baseline vertical-align, which drags the glyph
        // below center inside this fixed-size button under inherited
        // font-size/line-height.
        default: 'w-16 h-14 px-2 py-1',
        medium: 'w-14 h-12 px-2 py-1',
        small: 'w-12 h-10 px-1 py-0',
        'inline-edit': 'w-12 h-11 px-1 py-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);
