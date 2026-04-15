import type { ComponentProps, FC, ReactNode } from 'react';
import { DropdownMenuItem, DropdownMenuItemIcon, DropdownMenuItemText } from '../DropdownMenu';

export interface AttributeActionsItemProps extends ComponentProps<typeof DropdownMenuItem> {
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Item label text. */
  children: ReactNode;
}

export const AttributeActionsItem: FC<AttributeActionsItemProps> = ({
  icon,
  children,
  ...props
}) => (
  <DropdownMenuItem {...props}>
    {icon && <DropdownMenuItemIcon>{icon}</DropdownMenuItemIcon>}
    <DropdownMenuItemText>{children}</DropdownMenuItemText>
  </DropdownMenuItem>
);

AttributeActionsItem.displayName = 'AttributeActionsItem';
