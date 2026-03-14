import type { FC } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { dropdownMenuLabelVariants } from '../DropdownMenu';

type SelectGroupLabelProps = ArkUiSelect.ItemGroupLabelProps;

export const SelectGroupLabel: FC<SelectGroupLabelProps> = props => {
  const testId = useTestId('group-label');

  return (
    <ArkUiSelect.ItemGroupLabel
      {...props}
      data-testid={testId}
      className={cn(dropdownMenuLabelVariants({ inset: false }))}
    />
  );
};

SelectGroupLabel.displayName = 'SelectGroupLabel';
