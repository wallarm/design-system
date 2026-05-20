import type { FC, HTMLAttributes, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import type { VariantProps } from 'class-variance-authority';
import { Check } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { dropdownMenuItemVariants } from './classes';
import { DropdownMenuItemIndicator } from './DropdownMenuItemIndicator';

type DropdownMenuRadioItemVariantsProps = VariantProps<typeof dropdownMenuItemVariants>;

export interface DropdownMenuRadioItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id'>,
    DropdownMenuRadioItemVariantsProps {
  /** Required — identifies this radio within the group */
  value: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuRadioItem: FC<DropdownMenuRadioItemProps> = ({
  children,
  value,
  disabled,
  closeOnSelect,
  variant = 'default',
  className,
  ...props
}) => {
  const testId = useTestId('radio-item');

  return (
    <Menu.RadioItem
      {...props}
      value={value}
      disabled={disabled}
      closeOnSelect={closeOnSelect ?? false}
      data-testid={testId}
      className={cn(dropdownMenuItemVariants({ variant }), className)}
    >
      {children}
      <DropdownMenuItemIndicator>
        <Check />
      </DropdownMenuItemIndicator>
    </Menu.RadioItem>
  );
};

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';
