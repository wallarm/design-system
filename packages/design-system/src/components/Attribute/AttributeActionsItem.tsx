import { Children, type ComponentProps, type FC, isValidElement, type ReactNode } from 'react';
import { DropdownMenuItem, DropdownMenuItemIcon, DropdownMenuItemText } from '../DropdownMenu';

export interface AttributeActionsItemProps extends ComponentProps<typeof DropdownMenuItem> {
  /** Icon element followed by label text — icon is auto-detected. */
  children: ReactNode;
}

const isIconLike = (child: ReactNode): boolean => {
  if (!isValidElement(child)) return false;
  return typeof child.type === 'function' || child.type === 'svg';
};

export const AttributeActionsItem: FC<AttributeActionsItemProps> = ({ children, ...props }) => {
  const items = Children.toArray(children);
  const icon = items.find(isIconLike);
  const rest = icon ? items.filter(item => item !== icon) : items;

  return (
    <DropdownMenuItem {...props}>
      {icon && <DropdownMenuItemIcon>{icon}</DropdownMenuItemIcon>}
      <DropdownMenuItemText>{rest}</DropdownMenuItemText>
    </DropdownMenuItem>
  );
};

AttributeActionsItem.displayName = 'AttributeActionsItem';
