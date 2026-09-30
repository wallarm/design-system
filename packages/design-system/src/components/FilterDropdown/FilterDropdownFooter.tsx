import type { FC } from 'react';
import { type TestableProps, useTestId } from '../../utils/testId';
import { SelectFooter, type SelectFooterProps } from '../Select/SelectFooter';
import { useFilterDropdownContext } from './FilterDropdownContext';
import { FilterDropdownFooterClear } from './FilterDropdownFooterClear';

export type FilterDropdownFooterProps = Omit<SelectFooterProps, 'variant' | 'data-testid'> &
  TestableProps;

/**
 * Footer pinned under the list. Multi mode only, and only while something is picked; its default
 * content is `FilterDropdownFooterClear`.
 */
export const FilterDropdownFooter: FC<FilterDropdownFooterProps> = ({
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { multiple, value } = useFilterDropdownContext();
  const testId = useTestId('footer', testIdProp);

  if (!multiple || value.length === 0) return null;

  return (
    <SelectFooter
      {...props}
      variant='actions'
      data-slot='filter-dropdown-footer'
      data-testid={testId}
    >
      {children ?? <FilterDropdownFooterClear />}
    </SelectFooter>
  );
};

FilterDropdownFooter.displayName = 'FilterDropdownFooter';
