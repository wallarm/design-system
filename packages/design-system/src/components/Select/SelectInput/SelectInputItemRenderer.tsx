import type { FC } from 'react';
import { useSelectContext } from '@ark-ui/react/select';
import { Tag, TagClose, type TagProps } from '../../Tag';
import type { SelectDataItem } from '../types';

type SelectInputItemRendererProps = {
  item: SelectDataItem;
  /** `SelectInput`'s own size — chips scale down with it, see `TAG_SIZE_BY_SELECT_SIZE`. */
  size?: 'small' | 'medium' | 'default';
};

// Tag's own scale (small=16px/medium=20px/large=24px) is unrelated to
// Select's (small=24px/medium=32px/default=36px) — at Select's `small`
// (24px container), a `large` (24px) tag leaves no margin, so it steps down
// to `medium` (20px). Select's `medium`/`default` containers (32px/36px)
// already fit a `large` tag with margin to spare, so those stay unchanged.
export const TAG_SIZE_BY_SELECT_SIZE: Record<'small' | 'medium' | 'default', TagProps['size']> = {
  small: 'medium',
  medium: 'large',
  default: 'large',
};

export const SelectInputItemRenderer: FC<SelectInputItemRendererProps> = ({
  item,
  size = 'default',
}) => {
  const { value, setValue } = useSelectContext();

  const handleRemove = () => {
    const nextValue = value.filter(v => v !== item.value);

    setValue(nextValue);
  };

  const Icon = item.icon;

  return (
    <Tag size={TAG_SIZE_BY_SELECT_SIZE[size]}>
      {Icon && <Icon />}

      {item.label}

      <TagClose onClick={handleRemove} />
    </Tag>
  );
};
