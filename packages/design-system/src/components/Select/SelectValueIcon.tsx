import type { FC } from 'react';
import { useSelectContext } from '@ark-ui/react/select';

interface SelectValueIconProps {
  index?: number;
}

export const SelectValueIcon: FC<SelectValueIconProps> = ({ index = 0 }) => {
  const { selectedItems } = useSelectContext();

  const Icon = selectedItems.length ? selectedItems[index].icon : null;

  if (!Icon) return null;

  return <Icon />;
};
