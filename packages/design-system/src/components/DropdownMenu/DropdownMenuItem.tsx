import { type FC, type HTMLAttributes, type Ref, useId } from 'react';
import { Menu } from '@ark-ui/react/menu';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { dropdownMenuItemVariants } from './classes';

export type DropdownMenuItemVariantsProps = VariantProps<typeof dropdownMenuItemVariants>;

export interface DropdownMenuItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id'>,
    DropdownMenuItemVariantsProps {
  inset?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  /** Explicit value for programmatic highlighting via highlightedValue */
  value?: string;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuItem: FC<DropdownMenuItemProps> = ({
  inset = false,
  variant = 'default',
  onSelect,
  disabled,
  value,
  className,
  ...props
}) => {
  const autoId = useId();
  const testId = useTestId('item');

  return (
    <Menu.Item
      {...props}
      value={value ?? autoId}
      disabled={disabled}
      onSelect={onSelect}
      data-testid={testId}
      className={cn(dropdownMenuItemVariants({ variant, inset }), className)}
    />
  );
};

DropdownMenuItem.displayName = 'DropdownMenuItem';
