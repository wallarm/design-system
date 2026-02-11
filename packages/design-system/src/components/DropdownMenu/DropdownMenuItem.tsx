import type { ComponentPropsWithoutRef, ElementRef, FC, Ref } from 'react';
import { Item } from '@radix-ui/react-dropdown-menu';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { dropdownMenuItemVariants } from './classes';

type DropdownMenuItemNativeProps = ComponentPropsWithoutRef<typeof Item>;

export type DropdownMenuItemVariantsProps = VariantProps<typeof dropdownMenuItemVariants>;

interface DropdownMenuItemBaseProps {
  inset?: boolean;
  ref?: Ref<ElementRef<typeof Item>>;
}

type DropdownMenuItemProps = DropdownMenuItemNativeProps &
  DropdownMenuItemVariantsProps &
  DropdownMenuItemBaseProps;

export const DropdownMenuItem: FC<DropdownMenuItemProps> = ({
  inset = false,
  variant = 'default',
  ...props
}) => <Item {...props} className={cn(dropdownMenuItemVariants({ variant, inset }))} />;

DropdownMenuItem.displayName = 'DropdownMenuItem';
