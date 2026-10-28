import type { FC } from 'react';

import {
  Select as ArkUiSelect,
  useSelectContext,
  useSelectItemContext,
} from '@ark-ui/react/select';

import { Check } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Checkmark } from '../Checkmark';

type SelectOptionIndicatorProps = Omit<ArkUiSelect.ItemIndicatorProps, 'className'>;

export const SelectOptionIndicator: FC<SelectOptionIndicatorProps> = props => {
  const { multiple } = useSelectContext();
  const { selected } = useSelectItemContext();
  const testId = useTestId('option-indicator');

  return (
    <div data-testid={testId} className='absolute top-6 right-8 flex h-20 items-center justify-end'>
      <ArkUiSelect.ItemIndicator
        {...props}
        className='pointer-events-none flex items-center'
        hidden={multiple ? false : undefined}
      >
        {multiple ? <Checkmark checkedState={selected} /> : <Check className='icon-md' />}
      </ArkUiSelect.ItemIndicator>
    </div>
  );
};

SelectOptionIndicator.displayName = 'SelectOptionIndicator';
