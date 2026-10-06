import { type FC, type KeyboardEvent, useEffect, useRef } from 'react';
import { mergeRefs } from '../../utils/mergeRefs';
import { type TestableProps, useTestId } from '../../utils/testId';
import { SelectSearchInput, type SelectSearchInputProps } from '../Select/SelectSearchInput';
import { useFilterCascadeContext } from './FilterCascadeContext';

export interface FilterCascadeSearchProps
  extends Omit<SelectSearchInputProps, 'value' | 'onChange' | 'data-testid'>,
    TestableProps {
  /** Called after the query changes; the root owns the query itself. */
  onChange?: (query: string) => void;
}

/**
 * The search field pinned above the levels. Narrows the top level by label; renders only once the
 * top level reaches `searchThreshold` items, and takes focus when the menu opens. Attributes land
 * on the `<input>`.
 */
export const FilterCascadeSearch: FC<FilterCascadeSearchProps> = ({
  ref,
  onChange,
  onKeyDown,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api, label, query, setQuery, isSearchable } = useFilterCascadeContext();
  const testId = useTestId('search', testIdProp);
  const inputRef = useRef<HTMLInputElement>(null);

  // Zag focuses the content on open; the caret belongs here. A frame later, after its own focus.
  useEffect(() => {
    if (!api.open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [api.open]);

  if (!isSearchable) return null;

  // Zag's keymap listens on the content itself, not on a field inside it: ↓ hands the list over,
  // highlighting its first option and moving focus to it, from where the arrows go on as usual.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'ArrowDown') return;
    const first = api.collection.getNodeChildren(api.collection.rootNode)[0];
    if (!first) return;
    event.preventDefault();
    api.setHighlightValue([api.collection.getNodeValue(first)]);
    document.getElementById(api.getContentProps().id ?? '')?.focus();
  };

  return (
    <div data-slot='filter-cascade-search' className='border-b border-border-primary-light p-8'>
      <SelectSearchInput
        {...props}
        ref={mergeRefs(ref, inputRef)}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel ?? `Search ${label}`}
        value={query}
        onChange={next => {
          setQuery(next);
          onChange?.(next);
        }}
        data-testid={testId}
      />
    </div>
  );
};

FilterCascadeSearch.displayName = 'FilterCascadeSearch';
