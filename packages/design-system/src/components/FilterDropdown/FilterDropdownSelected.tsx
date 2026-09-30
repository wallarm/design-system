import type { ComponentProps, ReactNode } from 'react';
import type { CollectionItem } from '@ark-ui/react/collection';
import { useTestId } from '../../utils/testId';
import { SelectGroup } from '../Select/SelectGroup';
import { SelectGroupLabel } from '../Select/SelectGroupLabel';
import { SelectSeparator } from '../Select/SelectSeparator';
import { FilterDropdownAliasContext, useFilterDropdownContext } from './FilterDropdownContext';
import { FilterDropdownOption } from './FilterDropdownOption';

export interface FilterDropdownSelectedProps<T extends CollectionItem = CollectionItem>
  extends Omit<ComponentProps<typeof SelectGroup>, 'children'> {
  /** @default 'Selected' */
  label?: ReactNode;
  /**
   * Renders one row; return the same `FilterDropdownOption` as in the list (hint included) and it
   * becomes this row's copy. Defaults to a plain option with the item's label.
   */
  children?: (item: T) => ReactNode;
}

/**
 * Multi mode: the values picked when the menu opened, repeated on top of the list. A snapshot —
 * rows do not come and go while the menu is open, and unticking a copy unticks the original.
 * Shown only from `searchThreshold` items and while no query is active. Turn it off with the
 * root's `selectedOnTop={false}` rather than by leaving this part out.
 */
export const FilterDropdownSelected = <T extends CollectionItem>({
  label = 'Selected',
  children,
  'data-testid': testIdProp,
  ...props
}: FilterDropdownSelectedProps<T>) => {
  const { showSelected, aliasItems } = useFilterDropdownContext();
  const testId = useTestId('selected', testIdProp);

  if (!showSelected) return null;

  return (
    <>
      <SelectGroup {...props} data-slot='filter-dropdown-selected' data-testid={testId}>
        <SelectGroupLabel>{label}</SelectGroupLabel>
        {aliasItems.map(alias => {
          const source = alias.source as T;
          return (
            <FilterDropdownAliasContext.Provider key={alias.value} value={alias}>
              {children ? children(source) : <FilterDropdownOption item={source} />}
            </FilterDropdownAliasContext.Provider>
          );
        })}
      </SelectGroup>
      <SelectSeparator />
    </>
  );
};

FilterDropdownSelected.displayName = 'FilterDropdownSelected';
