import type { FC } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';

type SelectOptionTextProps = Omit<ArkUiSelect.ItemTextProps, 'className'>;

export const SelectOptionText: FC<SelectOptionTextProps> = props => (
  <ArkUiSelect.ItemText {...props} />
);

SelectOptionText.displayName = 'SelectOptionText';
