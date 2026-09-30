import type { FC, Ref } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';

type SelectGroupProps = Omit<ArkUiSelect.ItemGroupProps, 'className'> &
  TestableProps & { ref?: Ref<HTMLDivElement> };

export const SelectGroup: FC<SelectGroupProps> = ({
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('group', testIdProp);

  return (
    <ArkUiSelect.ItemGroup {...props} data-testid={testId} className={cn('flex flex-col gap-1')}>
      {children}
    </ArkUiSelect.ItemGroup>
  );
};

SelectGroup.displayName = 'SelectGroup';
