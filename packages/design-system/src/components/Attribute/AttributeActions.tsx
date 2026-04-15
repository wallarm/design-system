import type { ComponentProps, FC } from 'react';
import { DropdownMenu } from '../DropdownMenu';

export type AttributeActionsProps = ComponentProps<typeof DropdownMenu>;

export const AttributeActions: FC<AttributeActionsProps> = props => <DropdownMenu {...props} />;

AttributeActions.displayName = 'AttributeActions';
