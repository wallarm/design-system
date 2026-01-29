import { cva } from 'class-variance-authority';

import { BadgeColorEnum } from './constants';
import { generateBadgeVariants } from './generateBadgeVariants';
import { type BadgeColor } from './types';

type BadgeVariantsColorMap = Partial<{
  [K in BadgeColor]: string;
}>;

export const badgeVariants = cva('inline-flex items-center gap-4 rounded-8', {
  variants: {
    variant: {
      default: '',
      dotted: 'before:w-6 before:h-6 before:bg-current before:rounded-2',
    },
    size: {
      medium: 'h-20 py-2 px-6 [&_svg]:icon-sm',
      large: 'h-24 py-4 px-6 [&_svg]:icon-md',
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
      code: 'font-mono leading-sm text-xs font-medium',
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
});
