import { cva } from 'class-variance-authority';

import { BadgeColorEnum } from './constants';
import { generateBadgeVariants } from './generateBadgeVariants';
import type { BadgeColor } from './types';

type BadgeVariantsColorMap = Partial<{
  [K in BadgeColor]: string;
}>;

export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-4 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: '',
        dotted: 'before:h-6 before:w-6 before:rounded-2 before:bg-current',
      },
      size: {
        small: 'h-16 rounded-6 px-4 py-2 [&_svg]:icon-xs',
        medium: 'h-20 rounded-8 px-6 py-2 [&_svg]:icon-sm',
        large: 'h-24 rounded-8 px-6 py-4 [&_svg]:icon-md',
      },
      isIconOnly: {
        true: 'justify-center p-2',
      },
      type: {
        solid: '',
        secondary: '',
        outline: 'border-1 bg-badge-badge-bg',
        text: 'bg-transparent',
        'text-color': 'bg-transparent',
      },
      color: Object.values(BadgeColorEnum).reduce<BadgeVariantsColorMap>(
        (acc, color) => ({
          ...acc,
          [color]: '',
        }),
        {},
      ),
      muted: {
        true: '',
        false: '',
      },
      textVariant: {
        default: 'font-sans-display text-xs font-medium',
        code: 'font-mono text-xs leading-sm font-medium',
      },
      isClickable: {
        true: 'cursor-pointer',
      },
    },
    compoundVariants: [
      ...generateBadgeVariants(),
      // IconOnly size variants
      {
        isIconOnly: true,
        size: 'large',
        className: 'w-24',
      },
      {
        isIconOnly: true,
        size: 'medium',
        className: 'w-20',
      },
    ],
    defaultVariants: {
      variant: 'default',
    },
  },
);
