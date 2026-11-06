import type { FC } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { useTestId } from '../../utils/testId';

type SelectOptionTextProps = Omit<ArkUiSelect.ItemTextProps, 'className'>;

export const SelectOptionText: FC<SelectOptionTextProps> = props => {
  const testId = useTestId('option-text');

  return <ArkUiSelect.ItemText data-testid={testId} {...props} />;
};

SelectOptionText.displayName = 'SelectOptionText';
