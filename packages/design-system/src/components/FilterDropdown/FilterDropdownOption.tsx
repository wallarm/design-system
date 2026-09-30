import { type ComponentProps, type ReactNode, type Ref, useContext } from 'react';
import type { CollectionItem } from '@ark-ui/react/collection';
import { useTestId } from '../../utils/testId';
import { SelectOption } from '../Select/SelectOption';
import { SelectOptionHint } from '../Select/SelectOptionHint';
import { SelectOptionIndicator } from '../Select/SelectOptionIndicator';
import { SelectOptionText } from '../Select/SelectOptionText';
import { FilterDropdownAliasContext, useFilterDropdownContext } from './FilterDropdownContext';

export interface FilterDropdownOptionProps<T extends CollectionItem = CollectionItem>
  extends Omit<ComponentProps<typeof SelectOption>, 'item' | 'children'> {
  ref?: Ref<HTMLDivElement>;
  item: T;
  /** Secondary text at the right end of the row, such as a count. */
  hint?: ReactNode;
  /** Row text. Defaults to the item's label from the collection. */
  children?: ReactNode;
}

/**
 * One value of the filter: a check (single) or a checkbox (multi) on the right, optional `hint`
 * before it. Inside `FilterDropdownSelected` the same markup renders the row's "Selected" copy.
 */
export const FilterDropdownOption = <T extends CollectionItem>({
  item,
  hint,
  children,
  'data-testid': testIdProp,
  ...props
}: FilterDropdownOptionProps<T>) => {
  const { collection } = useFilterDropdownContext();
  const alias = useContext(FilterDropdownAliasContext);
  const value = collection.getItemValue(item);
  const isCopy = alias?.source !== undefined && collection.getItemValue(alias.source) === value;
  const copyTestId = useTestId('selected-option');

  return (
    <SelectOption
      {...props}
      item={isCopy && alias ? alias : item}
      data-slot='filter-dropdown-option'
      data-testid={testIdProp ?? (isCopy ? copyTestId : undefined)}
    >
      <SelectOptionText>{children ?? collection.stringifyItem(item)}</SelectOptionText>
      {hint !== undefined && hint !== null && <SelectOptionHint>{hint}</SelectOptionHint>}
      <SelectOptionIndicator />
    </SelectOption>
  );
};

FilterDropdownOption.displayName = 'FilterDropdownOption';
