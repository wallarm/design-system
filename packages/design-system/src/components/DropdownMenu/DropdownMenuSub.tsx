import { type FC } from 'react';

import { type DropdownMenuSubProps, Sub } from '@radix-ui/react-dropdown-menu';

export const DropdownMenuSub: FC<DropdownMenuSubProps> = (props) => (
  <Sub {...props} />
);

DropdownMenuSub.displayName = 'DropdownMenuSub';
