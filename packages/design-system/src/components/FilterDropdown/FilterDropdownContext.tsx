import { createContext, type RefObject, useContext } from 'react';
import type { CollectionItem, ListCollection } from '@ark-ui/react/collection';
import type { FilterDropdownSpecialItem } from './lib';

export interface FilterDropdownContextValue {
  /** Attribute name: trigger text in multi, aria labels, «Clear {label}». */
  label: string;
  /** Single mode: trigger text while unset and the default «All» option text. */
  allLabel: string;
  multiple: boolean;
  disabled: boolean;
  /** The consumer value (base values only, `[]` = unset). */
  value: string[];
  /** The consumer's collection, unfiltered. */
  collection: ListCollection<CollectionItem>;
  /** The consumer's collection narrowed by the search query. */
  filteredCollection: ListCollection<CollectionItem>;
  /** `filteredCollection.group()` — groups with no matches are absent. */
  groups: [string, CollectionItem[]][];
  query: string;
  setQuery: (query: string) => void;
  /** The search field is shown: the collection has at least `searchThreshold` items. */
  isSearchable: boolean;
  /** A non-empty query is narrowing the list. */
  isSearchActive: boolean;
  /** Single mode and no query: «All» is part of the list. */
  showAll: boolean;
  allItem: FilterDropdownSpecialItem;
  /**
   * Multi mode, `selectedOnTop`, searchable, no query and something was picked when the menu
   * opened.
   */
  showSelected: boolean;
  /** Alias rows of the "Selected" snapshot, in pick order. */
  aliasItems: FilterDropdownSpecialItem[];
  clear: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  /** Width the menu is pinned to while a query is active, so it does not jump as rows drop. */
  lockedWidth: number | undefined;
}

export const FilterDropdownContext = createContext<FilterDropdownContextValue | null>(null);

export const useFilterDropdownContext = (): FilterDropdownContextValue => {
  const context = useContext(FilterDropdownContext);
  if (!context) {
    throw new Error('FilterDropdown parts must be rendered inside <FilterDropdown>');
  }
  return context;
};

/** Set by `FilterDropdownSelected` around each of its rows: the alias that row stands for. */
export const FilterDropdownAliasContext = createContext<FilterDropdownSpecialItem | null>(null);

export interface UseFilterDropdownResult<T extends CollectionItem = CollectionItem> {
  /** The collection narrowed by the current query (the whole collection when it is empty). */
  filteredCollection: ListCollection<T>;
  /** `filteredCollection.group()`; render these so the list follows the search. */
  groups: [string, T[]][];
  query: string;
  isSearchActive: boolean;
  multiple: boolean;
  value: string[];
  clear: () => void;
}

/**
 * Reads the state of the surrounding `FilterDropdown` — chiefly the filtered items and groups
 * to render inside `FilterDropdownContent`.
 */
export const useFilterDropdown = <
  T extends CollectionItem = CollectionItem,
>(): UseFilterDropdownResult<T> => {
  const { filteredCollection, groups, query, isSearchActive, multiple, value, clear } =
    useFilterDropdownContext();

  return {
    filteredCollection: filteredCollection as ListCollection<T>,
    groups: groups as [string, T[]][],
    query,
    isSearchActive,
    multiple,
    value,
    clear,
  };
};
