import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { type TestableProps, useTestId } from '../../utils/testId';
import { SelectEmptyState } from '../Select/SelectEmptyState';
import { useFilterDropdownContext } from './FilterDropdownContext';

export interface FilterDropdownEmptyProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** @default 'Nothing matches' */
  children?: ReactNode;
}

/** Shown in place of the options when the query matches none of them. */
export const FilterDropdownEmpty: FC<FilterDropdownEmptyProps> = ({
  ref,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { filteredCollection } = useFilterDropdownContext();
  const testId = useTestId('empty', testIdProp);

  if (filteredCollection.size > 0) return null;

  return (
    <div {...props} ref={ref} data-slot='filter-dropdown-empty' data-testid={testId}>
      {/* Fit the hug-width (and width-locked) menu instead of the fixed 240px, up to 240px. */}
      <SelectEmptyState className='w-full max-w-240' description={children ?? 'Nothing matches'} />
    </div>
  );
};

FilterDropdownEmpty.displayName = 'FilterDropdownEmpty';
