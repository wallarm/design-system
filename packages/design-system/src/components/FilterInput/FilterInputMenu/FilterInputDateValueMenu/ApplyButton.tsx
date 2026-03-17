import type { FC } from 'react';
import { DatePicker, type UseDatePickerReturn } from '@ark-ui/react';
import { Button } from '../../../Button';
import type { DateValue } from '../../../Calendar';

/** Apply button that reads current calendar value and emits the selection */
export const ApplyButton: FC<{
  range: boolean;
  onApply: (values: DateValue[]) => void;
}> = ({ range, onApply }) => (
  <DatePicker.Context>
    {(api: UseDatePickerReturn) => (
      <Button
        variant='primary'
        color='brand'
        size='small'
        disabled={range ? api.value.length < 2 : api.value.length < 1}
        onClick={() => onApply(api.value)}
      >
        Apply
      </Button>
    )}
  </DatePicker.Context>
);

ApplyButton.displayName = 'ApplyButton';
