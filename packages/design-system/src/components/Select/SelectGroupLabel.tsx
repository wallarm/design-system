import type { FC, Ref } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { dropdownMenuLabelVariants } from '../DropdownMenu';

type SelectGroupLabelProps = ArkUiSelect.ItemGroupLabelProps &
  TestableProps & { ref?: Ref<HTMLDivElement> };

export const SelectGroupLabel: FC<SelectGroupLabelProps> = ({
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('group-label', testIdProp);

  return (
    <ArkUiSelect.ItemGroupLabel
      {...props}
      data-testid={testId}
      className={cn(dropdownMenuLabelVariants({ inset: false }))}
    />
  );
};

SelectGroupLabel.displayName = 'SelectGroupLabel';
