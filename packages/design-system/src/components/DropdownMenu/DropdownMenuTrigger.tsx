import { type FC } from 'react';

import {
  type DropdownMenuTriggerProps,
  Trigger,
} from '@radix-ui/react-dropdown-menu';

export const DropdownMenuTrigger: FC<DropdownMenuTriggerProps> = (props) => (
  <Trigger {...props} />
);

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
