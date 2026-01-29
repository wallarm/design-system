import type { ComponentPropsWithoutRef, FC, Ref } from 'react';

import { Root } from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const separatorVariants = cva('shrink-0 bg-border-primary', {
  variants: {
    orientation: {
      horizontal: 'h-[1px] w-full',
      vertical: 'w-[1px] self-stretch',
    },
    spacing: {
      1: '',
      2: '',
      4: '',
      6: '',
      8: '',
      12: '',
      16: '',
      20: '',
      24: '',
      28: '',
      32: '',
      36: '',
      40: '',
      44: '',
      48: '',
      56: '',
      64: '',
      80: '',
      96: '',
      112: '',
      128: '',
      144: '',
    },
  },
  compoundVariants: [
    { orientation: 'horizontal', spacing: 1, className: 'my-1' },
    { orientation: 'horizontal', spacing: 2, className: 'my-2' },
    { orientation: 'horizontal', spacing: 4, className: 'my-4' },
    { orientation: 'horizontal', spacing: 6, className: 'my-6' },
    { orientation: 'horizontal', spacing: 8, className: 'my-8' },
    { orientation: 'horizontal', spacing: 12, className: 'my-12' },
    { orientation: 'horizontal', spacing: 16, className: 'my-16' },
    { orientation: 'horizontal', spacing: 20, className: 'my-20' },
    { orientation: 'horizontal', spacing: 24, className: 'my-24' },
    { orientation: 'horizontal', spacing: 28, className: 'my-28' },
    { orientation: 'horizontal', spacing: 32, className: 'my-32' },
    { orientation: 'horizontal', spacing: 36, className: 'my-36' },
    { orientation: 'horizontal', spacing: 40, className: 'my-40' },
    { orientation: 'horizontal', spacing: 44, className: 'my-44' },
    { orientation: 'horizontal', spacing: 48, className: 'my-48' },
    { orientation: 'horizontal', spacing: 56, className: 'my-56' },
    { orientation: 'horizontal', spacing: 64, className: 'my-64' },
    { orientation: 'horizontal', spacing: 80, className: 'my-80' },
    { orientation: 'horizontal', spacing: 96, className: 'my-96' },
    { orientation: 'horizontal', spacing: 112, className: 'my-112' },
    { orientation: 'horizontal', spacing: 128, className: 'my-128' },
    { orientation: 'horizontal', spacing: 144, className: 'my-144' },

    { orientation: 'vertical', spacing: 1, className: 'mx-1' },
    { orientation: 'vertical', spacing: 2, className: 'mx-2' },
    { orientation: 'vertical', spacing: 4, className: 'mx-4' },
    { orientation: 'vertical', spacing: 6, className: 'mx-6' },
    { orientation: 'vertical', spacing: 8, className: 'mx-8' },
    { orientation: 'vertical', spacing: 12, className: 'mx-12' },
    { orientation: 'vertical', spacing: 16, className: 'mx-16' },
    { orientation: 'vertical', spacing: 20, className: 'mx-20' },
    { orientation: 'vertical', spacing: 24, className: 'mx-24' },
    { orientation: 'vertical', spacing: 28, className: 'mx-28' },
    { orientation: 'vertical', spacing: 32, className: 'mx-32' },
    { orientation: 'vertical', spacing: 36, className: 'mx-36' },
    { orientation: 'vertical', spacing: 40, className: 'mx-40' },
    { orientation: 'vertical', spacing: 44, className: 'mx-44' },
    { orientation: 'vertical', spacing: 48, className: 'mx-48' },
    { orientation: 'vertical', spacing: 56, className: 'mx-56' },
    { orientation: 'vertical', spacing: 64, className: 'mx-64' },
    { orientation: 'vertical', spacing: 80, className: 'mx-80' },
    { orientation: 'vertical', spacing: 96, className: 'mx-96' },
    { orientation: 'vertical', spacing: 112, className: 'mx-112' },
    { orientation: 'vertical', spacing: 128, className: 'mx-128' },
    { orientation: 'vertical', spacing: 144, className: 'mx-144' },
  ],
});

export type SeparatorProps = Omit<
  ComponentPropsWithoutRef<typeof Root>,
  'className'
> &
  VariantProps<typeof separatorVariants> & {
    ref?: Ref<HTMLHRElement>;
  };

export const Separator: FC<SeparatorProps> = ({
  orientation = 'horizontal',
  decorative = true,
  spacing,
  ...props
}) => (
  <Root
    decorative={decorative}
    orientation={orientation}
    className={cn(separatorVariants({ orientation, spacing }))}
    {...props}
  />
);

Separator.displayName = 'Separator';
