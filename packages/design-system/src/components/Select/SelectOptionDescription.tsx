import type { FC } from 'react';

import { Select as ArkUiSelect } from '@ark-ui/react/select';

type SelectOptionDescriptionProps = Omit<
  ArkUiSelect.ItemTextProps,
  'className'
>;

export const SelectOptionDescription: FC<SelectOptionDescriptionProps> = (
  props,
) => (
  <ArkUiSelect.ItemText
    {...props}
    className="grow basis-full font-sans text-xs text-text-secondary"
  />
);

SelectOptionDescription.displayName = 'SelectOptionDescription';
