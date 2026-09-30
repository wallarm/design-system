import type { FC } from 'react';
import { useSelectContext } from '@ark-ui/react/select';
import { type TestableProps, useTestId } from '../../utils/testId';
import { SelectSearchInput, type SelectSearchInputProps } from '../Select/SelectSearchInput';
import { useFilterDropdownContext } from './FilterDropdownContext';

export interface FilterDropdownSearchProps
  extends Omit<SelectSearchInputProps, 'value' | 'onChange' | 'data-testid'>,
    TestableProps {
  /** Called after the query changes; the root owns the query itself. */
  onChange?: (query: string) => void;
}

/**
 * The search field pinned above the list. Renders only once the collection reaches
 * `searchThreshold` items, and takes focus when the menu opens. Attributes land on the `<input>`.
 */
export const FilterDropdownSearch: FC<FilterDropdownSearchProps> = ({
  onChange,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const { label, query, setQuery, isSearchable } = useFilterDropdownContext();
  const testId = useTestId('search', testIdProp);
  const select = useSelectContext();

  if (!isSearchable) return null;

  const handleChange = (next: string) => {
    setQuery(next);
    onChange?.(next);
  };

  // Focus stays in the field while the arrows move Ark's highlight, so the field is the combobox
  // that names the highlighted row; Zag's own aria-activedescendant sits on the unfocused content.
  const highlighted = select.highlightedItem;
  const activeDescendant = highlighted ? select.getItemProps({ item: highlighted }).id : undefined;

  return (
    // The list's 8px top padding minus 3px reads as Figma's pb-4 + 1px row gap under the search.
    <div data-slot='filter-dropdown-search' className='-mb-3'>
      <SelectSearchInput
        // Zag's initial focus takes [data-autofocus] first: the menu opens with the caret here.
        data-autofocus=''
        role='combobox'
        aria-autocomplete='list'
        aria-expanded={select.open}
        aria-controls={select.getContentProps().id}
        aria-activedescendant={activeDescendant}
        {...props}
        aria-label={ariaLabel ?? `Search ${label}`}
        value={query}
        onChange={handleChange}
        data-testid={testId}
      />
    </div>
  );
};

FilterDropdownSearch.displayName = 'FilterDropdownSearch';
