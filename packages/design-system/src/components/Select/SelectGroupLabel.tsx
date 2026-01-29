import type { FC } from 'react';

import { Select as ArkUiSelect } from '@ark-ui/react/select';

import { cn } from '../../utils/cn';
import { dropdownMenuLabelVariants } from '../DropdownMenu';

type SelectGroupLabelProps = ArkUiSelect.ItemGroupLabelProps;

export const SelectGroupLabel: FC<SelectGroupLabelProps> = (props) => (
  <ArkUiSelect.ItemGroupLabel
    {...props}
    className={cn(dropdownMenuLabelVariants({ inset: false }))}
  />
);

SelectGroupLabel.displayName = 'SelectGroupLabel';
