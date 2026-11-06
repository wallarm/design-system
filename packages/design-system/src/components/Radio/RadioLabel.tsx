import type { FC } from 'react';
import { RadioGroup as ArkUiRadioGroup } from '@ark-ui/react';
import { useTestId } from '../../utils/testId';

export type RadioLabelProps = Omit<ArkUiRadioGroup.ItemTextProps, 'className'>;

export const RadioLabel: FC<RadioLabelProps> = props => {
  const testId = useTestId('label');

  return (
    <ArkUiRadioGroup.ItemText
      {...props}
      data-testid={testId}
      className='flex gap-4 font-sans text-sm font-normal text-text-primary'
    />
  );
};

RadioLabel.displayName = 'RadioLabel';
