import type { FC } from 'react';

import { RadioGroup as ArkUiRadioGroup } from '@ark-ui/react/radio-group';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const radioGroupVariants = cva('', {
  variants: {
    variant: {
      default: cn('[&_[data-part=item][data-disabled]]:opacity-50'),
      card: cn(
        '[&_[data-part=item]]:py-12 [&_[data-part=item]]:pl-12 [&_[data-part=item]]:pr-16',
        '[&_[data-part=item]]:rounded-8 [&_[data-part=item]]:border [&_[data-part=item]]:bg-bg-surface-2',
        '[&_[data-part=item]]:transition-colors [&_[data-part=item]]:overlay',

        // State ---- unchecked
        '[&_[data-part=item][data-state=unchecked]]:border-border-primary',
        '[&_[data-part=item][data-state=unchecked]:not([data-disabled])]:hover:overlay-states-primary-hover',
        '[&_[data-part=item][data-state=unchecked]:not([data-disabled])]:active:overlay-states-primary-pressed',

        // State ---- checked
        '[&_[data-part=item][data-state=checked]]:border-border-brand',
        '[&_[data-part=item][data-state=checked]:not([data-disabled])]:hover:overlay-states-brand-hover',
        '[&_[data-part=item][data-state=checked]:not([data-disabled])]:active:overlay-states-brand-pressed',

        // Disabled
        '[&_[data-part=item][data-disabled]]:[&_[data-part=item-text]]:opacity-50',
        '[&_[data-part=item][data-disabled]]:[&_[data-part=description]]:opacity-50',
        '[&_[data-part=item][data-disabled]]:[&_[data-part=item-control]]:opacity-50',
      ),
    },
  },
});

export type RadioGroupNativeProps = Omit<
  ArkUiRadioGroup.RootProps,
  'className'
>;

export type RadioGroupVariantsProps = VariantProps<typeof radioGroupVariants>;

export type RadioGroupProps = RadioGroupNativeProps & RadioGroupVariantsProps;

export const RadioGroup: FC<RadioGroupProps> = ({
  variant = 'default',
  ...props
}) => (
  <ArkUiRadioGroup.Root
    {...props}
    className={cn(radioGroupVariants({ variant }), 'flex flex-col gap-8')}
  />
);

RadioGroup.displayName = 'RadioGroup';
