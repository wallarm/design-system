import type { FC } from 'react';
import { type DropdownMenuProps, Root } from '@radix-ui/react-dropdown-menu';

export const DropdownMenu: FC<DropdownMenuProps> = props => <Root {...props} />;
DropdownMenu.displayName = 'DropdownMenu';
