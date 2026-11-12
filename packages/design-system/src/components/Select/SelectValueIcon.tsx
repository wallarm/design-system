import type { FC } from 'react';
import { useSelectContext } from '@ark-ui/react/select';
import type { SelectDataItem } from './types';

interface SelectValueIconProps {
  index?: number;
}

export const SelectValueIcon: FC<SelectValueIconProps> = ({ index = 0 }) => {
  const { selectedItems } = useSelectContext();

  const item: SelectDataItem | undefined = selectedItems[index];

  if (item?.leading) return item.leading;

  const Icon = item?.icon;

  if (!Icon) return null;

  return <Icon />;
};
