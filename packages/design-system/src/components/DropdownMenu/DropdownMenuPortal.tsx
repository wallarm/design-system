import { type FC } from 'react';

import {
  type DropdownMenuPortalProps,
  Portal,
} from '@radix-ui/react-dropdown-menu';

export const DropdownMenuPortal: FC<DropdownMenuPortalProps> = (props) => (
  <Portal {...props} />
);
DropdownMenuPortal.displayName = 'DropdownMenuPortal';
