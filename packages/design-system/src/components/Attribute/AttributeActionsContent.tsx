import type { ComponentProps, FC } from 'react';
import { DropdownMenuContent } from '../DropdownMenu';

export type AttributeActionsContentProps = ComponentProps<typeof DropdownMenuContent>;

export const AttributeActionsContent: FC<AttributeActionsContentProps> = props => (
  <DropdownMenuContent {...props} />
);

AttributeActionsContent.displayName = 'AttributeActionsContent';
