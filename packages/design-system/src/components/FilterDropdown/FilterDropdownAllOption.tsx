import type { ComponentProps, FC, ReactNode, Ref } from 'react';
import { useTestId } from '../../utils/testId';
import { SelectOption } from '../Select/SelectOption';
import { SelectOptionIndicator } from '../Select/SelectOptionIndicator';
import { SelectOptionText } from '../Select/SelectOptionText';
import { useFilterDropdownContext } from './FilterDropdownContext';

export interface FilterDropdownAllOptionProps
  extends Omit<ComponentProps<typeof SelectOption>, 'item' | 'children'> {
  ref?: Ref<HTMLDivElement>;
  /** @default the root's `allLabel` */
  children?: ReactNode;
}

/**
 * The «All …» row of single mode: first in the list, picked while the filter is unset, and
 * picking it resets the filter to `[]`. Hidden in multi mode and while a query is active.
 * Always render it in single mode: the row is part of keyboard navigation whenever the menu is
 * open in single mode.
 */
export const FilterDropdownAllOption: FC<FilterDropdownAllOptionProps> = ({
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { showAll, allItem, allLabel } = useFilterDropdownContext();
  const testId = useTestId('all-option', testIdProp);

  if (!showAll) return null;

  return (
    <SelectOption
      {...props}
      item={allItem}
      data-slot='filter-dropdown-all-option'
      data-testid={testId}
    >
      <SelectOptionText>{children ?? allLabel}</SelectOptionText>
      <SelectOptionIndicator />
    </SelectOption>
  );
};

FilterDropdownAllOption.displayName = 'FilterDropdownAllOption';
