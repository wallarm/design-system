import type { FC } from 'react';
import { useSelectContext } from '@ark-ui/react/select';
import { Tag, TagClose } from '../../Tag';
import type { SelectDataItem } from '../types';

type SelectInputItemRendererProps = {
  item: SelectDataItem;
};

export const SelectInputItemRenderer: FC<SelectInputItemRendererProps> = ({ item }) => {
  const { value, setValue } = useSelectContext();

  const handleRemove = () => {
    const nextValue = value.filter(v => v !== item.value);

    setValue(nextValue);
  };

  const Icon = item.icon;

  return (
    <Tag size='large'>
      {Icon && <Icon />}

      {item.label}

      <TagClose onClick={handleRemove} />
    </Tag>
  );
};
