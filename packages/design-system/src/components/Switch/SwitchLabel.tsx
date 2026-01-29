import type { FC } from 'react';

import { Switch as ArkUiSwitch } from '@ark-ui/react/switch';

import { cn } from '../../utils/cn';

export type SwitchLabelProps = Omit<ArkUiSwitch.LabelProps, 'className'>;

export const SwitchLabel: FC<SwitchLabelProps> = (props) => (
  <ArkUiSwitch.Label
    {...props}
    className={cn(
      'flex items-center gap-4',
      'font-sans text-sm font-normal text-text-primary',
    )}
  />
);

SwitchLabel.displayName = 'SwitchLabel';
