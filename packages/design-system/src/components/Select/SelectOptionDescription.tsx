import type { FC } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { useTestId } from '../../utils/testId';

type SelectOptionDescriptionProps = Omit<ArkUiSelect.ItemTextProps, 'className'>;

export const SelectOptionDescription: FC<SelectOptionDescriptionProps> = props => {
  const testId = useTestId('option-description');

  return (
    <ArkUiSelect.ItemText
      {...props}
      data-testid={testId}
      className='grow basis-full font-sans text-xs text-text-secondary'
    />
  );
};

SelectOptionDescription.displayName = 'SelectOptionDescription';
