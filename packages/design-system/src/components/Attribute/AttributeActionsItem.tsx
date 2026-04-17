import { Children, type ComponentProps, type FC, isValidElement, type ReactNode } from 'react';
import { DropdownMenuItem, DropdownMenuItemIcon, DropdownMenuItemText } from '../DropdownMenu';

export interface AttributeActionsItemProps extends ComponentProps<typeof DropdownMenuItem> {
  /** First child element is rendered as the leading icon; the rest becomes label text. */
  children: ReactNode;
}

export const AttributeActionsItem: FC<AttributeActionsItemProps> = ({ children, ...props }) => {
  const [first, ...rest] = Children.toArray(children);
  const hasIcon = isValidElement(first);

  return (
    <DropdownMenuItem {...props}>
      {hasIcon && <DropdownMenuItemIcon>{first}</DropdownMenuItemIcon>}
      <DropdownMenuItemText>{hasIcon ? rest : children}</DropdownMenuItemText>
    </DropdownMenuItem>
  );
};

AttributeActionsItem.displayName = 'AttributeActionsItem';
