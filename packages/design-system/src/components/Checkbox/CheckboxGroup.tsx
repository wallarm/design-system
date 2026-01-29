import type { FC } from 'react';

import { Checkbox as ArkUiCheckbox } from '@ark-ui/react/checkbox';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const checkboxGroupVariants = cva('flex flex-col gap-8', {
  variants: {
    variant: {
      default: cn('data-disabled:[&_[data-part=root]]:opacity-50'),
      card: cn(
        '[&_[data-part=root]]:py-12 [&_[data-part=root]]:pl-12 [&_[data-part=root]]:pr-16',
        '[&_[data-part=root]]:rounded-8 [&_[data-part=root]]:border [&_[data-part=root]]:bg-bg-surface-2',
        '[&_[data-part=root]]:transition-colors [&_[data-part=root]]:overlay',

        // State ---- unchecked
        '[&_[data-part=root][data-state=unchecked]]:border-border-primary',
        '[&_[data-part=root][data-state=unchecked]:not([data-disabled])]:hover:overlay-states-primary-hover',
        '[&_[data-part=root][data-state=unchecked]:not([data-disabled])]:active:overlay-states-primary-pressed',

        // State ---- checked
        '[&_[data-part=root][data-state=checked]]:border-border-brand',
        '[&_[data-part=root][data-state=checked]:not([data-disabled])]:hover:overlay-states-brand-hover',
        '[&_[data-part=root][data-state=checked]:not([data-disabled])]:active:overlay-states-brand-pressed',

        // State ---- indeterminate
        '[&_[data-part=root][data-state=indeterminate]]:border-border-brand',
        '[&_[data-part=root][data-state=indeterminate]:not([data-disabled])]:hover:overlay-states-brand-hover',
        '[&_[data-part=root][data-state=indeterminate]:not([data-disabled])]:active:overlay-states-brand-pressed',

        // Disabled
        '[&_[data-part=root][data-disabled]]:[&_[data-part=label]]:opacity-50',
        '[&_[data-part=root][data-disabled]]:[&_[data-part=description]]:opacity-50',
        '[&_[data-part=root][data-disabled]]:[&_[data-part=control]]:opacity-50',
      ),
    },
  },
});

type CheckboxGroupVariantsProps = VariantProps<typeof checkboxGroupVariants>;

type CheckboxGroupNativeProps = Omit<ArkUiCheckbox.GroupProps, 'className'>;

export type CheckboxGroupProps = CheckboxGroupNativeProps &
  CheckboxGroupVariantsProps;

export const CheckboxGroup: FC<CheckboxGroupProps> = ({
  variant = 'default',
  ...props
}) => (
  <ArkUiCheckbox.Group
    {...props}
    className={cn(checkboxGroupVariants({ variant }))}
  />
);

CheckboxGroup.displayName = 'CheckboxGroup';
