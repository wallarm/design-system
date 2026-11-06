import type { FC } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { useTestId } from '../../utils/testId';

type SelectOptionTextProps = Omit<ArkUiSelect.ItemTextProps, 'className'>;

export const SelectOptionText: FC<SelectOptionTextProps> = props => {
  const testId = useTestId('option-text');

  return <ArkUiSelect.ItemText {...props} data-testid={testId} />;
};

SelectOptionText.displayName = 'SelectOptionText';
