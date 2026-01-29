import { useSelectContext } from '@ark-ui/react/select';

import { Tag, TagClose } from '../../Tag';
import type { SelectDataItem } from '../types';

export const SelectInputItemRenderer = (item: SelectDataItem) => {
  const { value, setValue } = useSelectContext();

  const handleRemove = () => {
    const nextValue = value.filter((v) => v !== item.value);

    setValue(nextValue);
  };

  const Icon = item.icon;

  return (
    <Tag key={item.value} size="large">
      {Icon && <Icon />}

      {item.label}

      <TagClose onClick={handleRemove} />
    </Tag>
  );
};
