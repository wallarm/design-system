import type { FC, PropsWithChildren } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export const SelectGroup: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('group');

  return (
    <ArkUiSelect.ItemGroup data-testid={testId} className={cn('flex flex-col gap-1')}>
      {children}
    </ArkUiSelect.ItemGroup>
  );
};

SelectGroup.displayName = 'SelectGroup';
