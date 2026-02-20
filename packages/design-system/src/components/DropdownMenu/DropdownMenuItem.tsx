import { type FC, type HTMLAttributes, type Ref, useId } from 'react';
import { Menu } from '@ark-ui/react/menu';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { dropdownMenuItemVariants } from './classes';

export type DropdownMenuItemVariantsProps = VariantProps<typeof dropdownMenuItemVariants>;

interface DropdownMenuItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id'>,
    DropdownMenuItemVariantsProps {
  inset?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuItem: FC<DropdownMenuItemProps> = ({
  inset = false,
  variant = 'default',
  onSelect,
  disabled,
  ...props
}) => {
  const id = useId();

  return (
    <Menu.Item
      {...props}
      value={id}
      disabled={disabled}
      onSelect={onSelect}
      className={cn(dropdownMenuItemVariants({ variant, inset }))}
    />
  );
};

DropdownMenuItem.displayName = 'DropdownMenuItem';
