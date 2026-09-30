import { type ReactNode, useMemo, useRef, useState } from 'react';
import {
  type CollectionItem,
  createListCollection,
  type ListCollection,
} from '@ark-ui/react/collection';
import type { SelectHighlightChangeDetails, SelectValueChangeDetails } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { Select, type SelectProps } from '../Select/Select';
import { type UseSelectSearchOptions, useSelectSearch } from '../Select/useSelectSearch';
import { FilterDropdownContext, type FilterDropdownContextValue } from './FilterDropdownContext';
import {
  createAliasItem,
  createAllItem,
  isSpecialItem,
  toConsumerValue,
  toInternalValue,
} from './lib';

export interface FilterDropdownValueChangeDetails<T extends CollectionItem = CollectionItem> {
  /** Picked values; `[]` means unset («All» in single mode). */
  value: string[];
  items: T[];
}

export interface FilterDropdownOpenChangeDetails {
  open: boolean;
  value: string[];
}

/**
 * Select props FilterDropdown owns itself: the value model (alias and sentinel values must never
 * reach the consumer), the highlight (reset when the query changes), and form wiring (the hidden
 * select would submit internal values).
 */
type FilterDropdownOmittedSelectProps =
  | 'collection'
  | 'multiple'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onOpenChange'
  | 'highlightedValue'
  | 'defaultHighlightedValue'
  | 'onHighlightChange'
  | 'onSelect'
  | 'deselectable'
  | 'name'
  | 'form'
  | 'loading'
  | 'children';

export type FilterDropdownProps<T extends CollectionItem = CollectionItem> = Omit<
  SelectProps<T>,
  FilterDropdownOmittedSelectProps
> &
  TestableProps & {
    /** Attribute name: trigger text in multi mode, the trigger's aria-label, «Clear {label}». */
    label: string;
    /**
     * Single mode: trigger text while unset and the default text of `FilterDropdownAllOption`.
     * @default 'All'
     */
    allLabel?: string;
    /** Items to pick from. `groupBy` is supported. */
    collection: ListCollection<T>;
    /** Checkbox mode: several values, OR-ed, the menu stays open. */
    multiple?: boolean;
    /** Controlled picked values; `[]` = unset. */
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (details: FilterDropdownValueChangeDetails<T>) => void;
    onOpenChange?: (details: FilterDropdownOpenChangeDetails) => void;
    /**
     * Item count from which the search field and (multi) the "Selected" section appear. Counts
     * the collection's own items only.
     * @default 8
     */
    searchThreshold?: number;
    /** Overrides the default case-insensitive match on the item label. */
    filterFn?: UseSelectSearchOptions<T>['filterFn'];
    /**
     * Multi mode: pin the picked values under «Selected» on top of the list (from
     * `searchThreshold` items, hidden while searching). Render `FilterDropdownSelected` for it.
     * @default true
     */
    selectedOnTop?: boolean;
    children?: ReactNode;
  };

const DEFAULT_SEARCH_THRESHOLD = 8;
const EMPTY: string[] = [];

/**
 * A lightweight filter: a 36px trigger that opens a menu narrowing a list by one attribute.
 * Built on `Select`; the parts carry the filter rules, so composing them is enough.
 */
export const FilterDropdown = <T extends CollectionItem>({
  label,
  allLabel = 'All',
  collection,
  multiple = false,
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  searchThreshold = DEFAULT_SEARCH_THRESHOLD,
  filterFn,
  selectedOnTop = true,
  disabled = false,
  className,
  children,
  'data-testid': testId,
  ...props
}: FilterDropdownProps<T>) => {
  const [valueState, setValueState] = useState<string[]>(defaultValue ?? EMPTY);
  const value = valueProp ?? valueState;

  const [openState, setOpenState] = useState(defaultOpen ?? false);
  const open = openProp ?? openState;

  const baseCollection = collection as ListCollection<CollectionItem>;
  const searchOptions = useMemo(
    () => ({ filterFn: filterFn as UseSelectSearchOptions<CollectionItem>['filterFn'] }),
    [filterFn],
  );
  const {
    searchValue: query,
    onSearchChange,
    filteredCollection,
  } = useSelectSearch(baseCollection, searchOptions);

  // "Selected" is a snapshot: taken on open and when the query is cleared, so ticking while the
  // menu is open never adds or removes rows under the cursor. While closed it simply follows the
  // value — that also makes Ark highlight the first alias row when the menu opens.
  const [snapshot, setSnapshot] = useState<string[]>(value);

  const [lockedWidth, setLockedWidth] = useState<number>();
  // `null` from Ark's own moves; `resetHighlight` makes the first row the highlight after a
  // query change, since Ark keeps a highlighted value even when the filter removes its row.
  const [highlightState, setHighlightState] = useState<string | null>(null);
  const [resetHighlight, setResetHighlight] = useState(false);

  // Every session starts from the full list, unlocked, with a fresh snapshot. Driven by the
  // effective `open` rather than Ark's onOpenChange, which does not fire for a controlled `open`.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    onSearchChange('');
    setLockedWidth(undefined);
    setResetHighlight(false);
    if (open) setSnapshot(value);
  }
  const selectedValues = open ? snapshot : value;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isSearchable = baseCollection.size >= searchThreshold;
  const isSearchActive = isSearchable && query.length > 0;
  const showAll = !multiple && !isSearchActive;
  const showSelected =
    selectedOnTop && multiple && isSearchable && !isSearchActive && selectedValues.length > 0;

  const allItem = useMemo(() => createAllItem(allLabel), [allLabel]);
  const groups = useMemo(() => filteredCollection.group(), [filteredCollection]);

  const aliasItems = useMemo(
    () =>
      showSelected
        ? baseCollection.findMany(selectedValues).map(item => createAliasItem(item, baseCollection))
        : [],
    [showSelected, baseCollection, selectedValues],
  );

  // The collection Ark navigates: rows in the order they render — «All», "Selected" aliases,
  // then the filtered items group by group.
  const arkCollection = useMemo(
    () =>
      createListCollection<CollectionItem>({
        items: [
          ...(showAll ? [allItem] : []),
          ...aliasItems,
          ...groups.flatMap(([, items]) => items),
        ],
        itemToValue: item =>
          isSpecialItem(item) ? item.value : (baseCollection.getItemValue(item) ?? ''),
        itemToString: item =>
          isSpecialItem(item) ? item.label : (baseCollection.stringifyItem(item) ?? ''),
        isItemDisabled: item => {
          if (!isSpecialItem(item)) return baseCollection.getItemDisabled(item);
          return item.source ? baseCollection.getItemDisabled(item.source) : false;
        },
      }),
    [showAll, allItem, aliasItems, groups, baseCollection],
  );

  const aliased = useMemo(
    () => new Set(aliasItems.map(item => baseCollection.getItemValue(item.source ?? null) ?? '')),
    [aliasItems, baseCollection],
  );
  const internalValue = useMemo(
    () => toInternalValue(value, { multiple, aliased, hasAll: showAll }),
    [value, multiple, aliased, showAll],
  );

  const highlightedValue = resetHighlight ? arkCollection.firstValue : highlightState;

  const commit = (next: string[]) => {
    if (valueProp === undefined) setValueState(next);
    onValueChange?.({ value: next, items: collection.findMany(next) });
  };

  const clear = () => {
    if (disabled || value.length === 0) return;
    commit([]);
  };

  const handleValueChange = (details: SelectValueChangeDetails<CollectionItem>) => {
    commit(
      toConsumerValue(details.value, {
        multiple,
        previousInternal: internalValue,
        previousValue: value,
      }),
    );
  };

  const handleOpenChange = ({ open: nextOpen }: { open: boolean }) => {
    setOpenState(nextOpen);
    onOpenChange?.({ open: nextOpen, value });
  };

  const handleHighlightChange = (details: SelectHighlightChangeDetails<CollectionItem>) => {
    setHighlightState(details.highlightedValue);
    setResetHighlight(false);
  };

  const setQuery = (next: string) => {
    // Pin the width the user first saw before rows start dropping out.
    if (!query && next) setLockedWidth(contentRef.current?.offsetWidth || undefined);
    // Clearing the query brings "Selected" back with what is picked now.
    if (query && !next) setSnapshot(value);
    onSearchChange(next);
    setResetHighlight(true);
  };

  const context: FilterDropdownContextValue = {
    label,
    allLabel,
    multiple,
    disabled,
    value,
    collection: baseCollection,
    filteredCollection,
    groups,
    query,
    setQuery,
    isSearchable,
    isSearchActive,
    showAll,
    allItem,
    showSelected,
    aliasItems,
    clear,
    triggerRef,
    contentRef,
    lockedWidth,
  };

  return (
    <FilterDropdownContext.Provider value={context}>
      <Select<CollectionItem>
        {...(props as Omit<SelectProps<CollectionItem>, 'collection'>)}
        data-slot='filter-dropdown'
        data-testid={testId}
        className={cn('inline-flex max-w-full', className)}
        collection={arkCollection}
        multiple={multiple}
        disabled={disabled}
        value={internalValue}
        onValueChange={handleValueChange}
        open={openProp}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
        highlightedValue={highlightedValue}
        onHighlightChange={handleHighlightChange}
      >
        {children}
      </Select>
    </FilterDropdownContext.Provider>
  );
};

FilterDropdown.displayName = 'FilterDropdown';
