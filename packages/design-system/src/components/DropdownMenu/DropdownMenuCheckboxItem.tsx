import { type FC, type HTMLAttributes, type Ref, useId } from 'react';
import { Menu } from '@ark-ui/react/menu';
import type { VariantProps } from 'class-variance-authority';
import { Check } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { dropdownMenuItemVariants } from './classes';
import { DropdownMenuItemIndicator } from './DropdownMenuItemIndicator';

type DropdownMenuCheckboxItemVariantsProps = VariantProps<typeof dropdownMenuItemVariants>;

export interface DropdownMenuCheckboxItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id'>,
    DropdownMenuCheckboxItemVariantsProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Optional — auto-generated via useId() if omitted */
  value?: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuCheckboxItem: FC<DropdownMenuCheckboxItemProps> = ({
  children,
  checked,
  onCheckedChange,
  value,
  disabled,
  closeOnSelect,
  variant = 'default',
  className,
  ...props
}) => {
  const autoId = useId();
  const testId = useTestId('checkbox-item');

  return (
    <Menu.CheckboxItem
      {...props}
      value={value ?? autoId}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      closeOnSelect={closeOnSelect ?? false}
      data-testid={testId}
      className={cn(dropdownMenuItemVariants({ variant }), className)}
    >
      {children}
      <DropdownMenuItemIndicator>
        <Check />
      </DropdownMenuItemIndicator>
    </Menu.CheckboxItem>
  );
};

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';
