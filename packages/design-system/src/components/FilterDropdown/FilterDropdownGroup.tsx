import type { ComponentProps, FC } from 'react';
import { SelectGroup } from '../Select/SelectGroup';

export type FilterDropdownGroupProps = ComponentProps<typeof SelectGroup>;

/** A labelled run of options. Render one per entry of `useFilterDropdown().groups`. */
export const FilterDropdownGroup: FC<FilterDropdownGroupProps> = props => (
  <SelectGroup {...props} data-slot='filter-dropdown-group' />
);

FilterDropdownGroup.displayName = 'FilterDropdownGroup';
