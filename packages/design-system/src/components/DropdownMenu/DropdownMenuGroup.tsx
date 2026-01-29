import { type FC } from 'react';

import {
  type DropdownMenuGroupProps,
  Group,
} from '@radix-ui/react-dropdown-menu';

export const DropdownMenuGroup: FC<DropdownMenuGroupProps> = (props) => (
  <Group {...props} />
);
DropdownMenuGroup.displayName = 'DropdownMenuGroup';
