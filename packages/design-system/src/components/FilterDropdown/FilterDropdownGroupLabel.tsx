import type { ComponentProps, FC } from 'react';
import { SelectGroupLabel } from '../Select/SelectGroupLabel';

export type FilterDropdownGroupLabelProps = ComponentProps<typeof SelectGroupLabel>;

export const FilterDropdownGroupLabel: FC<FilterDropdownGroupLabelProps> = props => (
  <SelectGroupLabel {...props} data-slot='filter-dropdown-group-label' />
);

FilterDropdownGroupLabel.displayName = 'FilterDropdownGroupLabel';
