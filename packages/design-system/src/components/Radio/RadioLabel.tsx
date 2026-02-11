import type { FC } from 'react';
import { RadioGroup as ArkUiRadioGroup } from '@ark-ui/react';

export type RadioLabelProps = Omit<ArkUiRadioGroup.ItemTextProps, 'className'>;

export const RadioLabel: FC<RadioLabelProps> = props => (
  <ArkUiRadioGroup.ItemText
    {...props}
    className='flex gap-4 font-sans text-sm font-normal text-text-primary'
  />
);

RadioLabel.displayName = 'RadioLabel';
