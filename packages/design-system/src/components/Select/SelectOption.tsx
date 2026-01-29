import type { FC } from 'react';

import {
  type CollectionItem,
  Select as ArkUiSelect,
} from '@ark-ui/react/select';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { dropdownMenuItemVariants } from '../DropdownMenu';

type SelectOptionNativeProps = Omit<ArkUiSelect.ItemProps, 'className'>;

type SelectOptionVariantsProps = VariantProps<typeof dropdownMenuItemVariants>;

interface SelectOptionBaseProps {
  item: CollectionItem;
}

type SelectOptionProps = SelectOptionNativeProps &
  SelectOptionVariantsProps &
  SelectOptionBaseProps;

export const SelectOption: FC<SelectOptionProps> = ({
  variant = 'default',
  ...props
}) => {
  return (
    <ArkUiSelect.Item
      {...props}
      persistFocus
      className={cn(
        dropdownMenuItemVariants({ variant, inset: false }),
        'flex-wrap relative gap-y-0 gap-x-8 pr-32',
        'data-[state=checked]:bg-states-primary-active',
        'data-highlighted:bg-states-primary-hover',
      )}
    />
  );
};

SelectOption.displayName = 'SelectOption';
