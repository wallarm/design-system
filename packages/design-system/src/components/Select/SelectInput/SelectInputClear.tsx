import type { FC, MouseEvent } from 'react';
import { Select as ArkUiSelect, useSelectContext } from '@ark-ui/react/select';
import { X } from '../../../icons';
import { cn } from '../../../utils/cn';

export const SelectInputClear: FC = () => {
  const { selectedItems, multiple } = useSelectContext();

  const isEmpty = selectedItems.length <= 0;

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  if (isEmpty || !multiple) return null;

  return (
    <ArkUiSelect.ClearTrigger
      className={cn('icon-md text-icon-secondary cursor-pointer')}
      onClick={handleClear}
      asChild
    >
      <X />
    </ArkUiSelect.ClearTrigger>
  );
};
