import type { FC } from 'react';
import { useCheckboxContext } from '@ark-ui/react/checkbox';
import { Checkmark } from '../Checkmark';

export const CheckboxIndicator: FC = () => {
  const { getControlProps, checkedState } = useCheckboxContext();

  const controlProps = getControlProps();

  return (
    <div className='flex items-center justify-center self-start'>
      <Checkmark {...controlProps} checkedState={checkedState} />
    </div>
  );
};

CheckboxIndicator.displayName = 'CheckboxIndicator';
