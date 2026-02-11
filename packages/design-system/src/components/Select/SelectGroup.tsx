import type { FC, PropsWithChildren } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';

export const SelectGroup: FC<PropsWithChildren> = ({ children }) => (
  <ArkUiSelect.ItemGroup className={cn('flex flex-col gap-1')}>{children}</ArkUiSelect.ItemGroup>
);

SelectGroup.displayName = 'SelectGroup';
