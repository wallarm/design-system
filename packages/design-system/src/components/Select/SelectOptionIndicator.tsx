import type { FC } from 'react';

import {
  Select as ArkUiSelect,
  useSelectContext,
  useSelectItemContext,
} from '@ark-ui/react/select';

import { Check } from '../../icons';
import { Checkmark } from '../Checkmark';

type SelectOptionIndicatorProps = Omit<
  ArkUiSelect.ItemIndicatorProps,
  'className'
>;

export const SelectOptionIndicator: FC<SelectOptionIndicatorProps> = (
  props,
) => {
  const { multiple } = useSelectContext();
  const { selected } = useSelectItemContext();

  return (
    <div className="flex items-center justify-end h-20 absolute top-6 right-8">
      <ArkUiSelect.ItemIndicator
        {...props}
        className="flex items-center pointer-events-none"
        hidden={multiple ? false : undefined}
      >
        {multiple ? (
          <Checkmark checkedState={selected} />
        ) : (
          <Check className="icon-md" />
        )}
      </ArkUiSelect.ItemIndicator>
    </div>
  );
};

SelectOptionIndicator.displayName = 'SelectOptionIndicator';
