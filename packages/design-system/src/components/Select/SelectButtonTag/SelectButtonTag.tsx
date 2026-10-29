import type { FC, PropsWithChildren } from 'react';

import { Select as ArkUiSelect, useSelectContext } from '@ark-ui/react/select';

import { Tag, type TagProps } from '../../Tag';
import { SelectArrow } from '../SelectArrow';

type SelectButtonProps = Omit<TagProps, 'disabled'>;

export const SelectButtonTag: FC<PropsWithChildren<SelectButtonProps>> = ({
  children,
  ...props
}) => {
  const { disabled } = useSelectContext();

  return (
    <ArkUiSelect.Control>
      <ArkUiSelect.Trigger asChild>
        <Tag {...props} disabled={disabled}>
          {children}

          <SelectArrow />
        </Tag>
      </ArkUiSelect.Trigger>
    </ArkUiSelect.Control>
  );
};

SelectButtonTag.displayName = 'SelectButtonTag';
