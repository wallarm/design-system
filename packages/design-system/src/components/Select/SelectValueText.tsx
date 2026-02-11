import type { FC } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';

export type SelectValueTextProps = Omit<ArkUiSelect.ValueTextProps, 'className'>;

export const SelectValueText: FC<SelectValueTextProps> = props => (
  <ArkUiSelect.ValueText {...props} className={cn('truncate')} />
);

SelectValueText.displayName = 'SelectValueText';
