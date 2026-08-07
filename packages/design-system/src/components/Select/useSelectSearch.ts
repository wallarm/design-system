import { useMemo, useState } from 'react';
import type { CollectionItem, ListCollection } from '@ark-ui/react/collection';

export interface UseSelectSearchOptions<T extends CollectionItem> {
  /**
   * Overrides the default case-insensitive substring match against the
   * item's stringified label. Receives the same `itemString` `collection`
   * already computes via `itemToString`, plus the raw item for matching on
   * other fields (e.g. `description`).
   */
  filterFn?: (itemString: string, item: T, query: string) => boolean;
}

export interface UseSelectSearchResult<T extends CollectionItem> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filteredCollection: ListCollection<T>;
}

const defaultFilterFn = (itemString: string, query: string) =>
  itemString.toLowerCase().includes(query.toLowerCase());

export const useSelectSearch = <T extends CollectionItem>(
  collection: ListCollection<T>,
  options?: UseSelectSearchOptions<T>,
): UseSelectSearchResult<T> => {
  const [searchValue, setSearchValue] = useState('');
  const filterFn = options?.filterFn;

  const filteredCollection = useMemo(() => {
    if (!searchValue) return collection;
    return collection.filter((itemString, _index, item) =>
      filterFn ? filterFn(itemString, item, searchValue) : defaultFilterFn(itemString, searchValue),
    );
  }, [collection, searchValue, filterFn]);

  return { searchValue, onSearchChange: setSearchValue, filteredCollection };
};
