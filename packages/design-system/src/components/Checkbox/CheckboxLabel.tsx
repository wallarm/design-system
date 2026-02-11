import type { FC } from 'react';
import { Checkbox as ArkUiCheckbox } from '@ark-ui/react/checkbox';
import { cn } from '../../utils/cn';

export type CheckboxLabelProps = Omit<ArkUiCheckbox.LabelProps, 'className'>;

export const CheckboxLabel: FC<CheckboxLabelProps> = props => (
  <ArkUiCheckbox.Label
    {...props}
    className={cn(
      // Layout
      'flex gap-4',
      // Text
      'font-sans text-sm font-normal text-text-primary',
    )}
  />
);

CheckboxLabel.displayName = 'CheckboxLabel';
