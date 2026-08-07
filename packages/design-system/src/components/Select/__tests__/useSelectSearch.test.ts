import { createListCollection } from '@ark-ui/react/collection';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSelectSearch } from '../useSelectSearch';

interface Item {
  value: string;
  label: string;
  description?: string;
}

const items: Item[] = [
  { value: 'js', label: 'JavaScript', description: 'Scripting language' },
  { value: 'ts', label: 'TypeScript', description: 'Typed superset' },
  { value: 'py', label: 'Python', description: 'General purpose' },
];

const buildCollection = () => createListCollection({ items, itemToString: item => item.label });

describe('useSelectSearch', () => {
  it('returns the original collection when searchValue is empty', () => {
    const collection = buildCollection();
    const { result } = renderHook(() => useSelectSearch(collection));

    expect(result.current.searchValue).toBe('');
    expect(result.current.filteredCollection).toBe(collection);
  });

  it('filters by case-insensitive substring match on the stringified label', () => {
    const collection = buildCollection();
    const { result } = renderHook(() => useSelectSearch(collection));

    act(() => {
      result.current.onSearchChange('script');
    });

    expect(result.current.searchValue).toBe('script');
    expect(result.current.filteredCollection.items.map(item => item.value)).toEqual(['js', 'ts']);
  });

  it('returns an empty collection when nothing matches', () => {
    const collection = buildCollection();
    const { result } = renderHook(() => useSelectSearch(collection));

    act(() => {
      result.current.onSearchChange('rust');
    });

    expect(result.current.filteredCollection.size).toBe(0);
  });

  it('supports a custom filterFn matching against the raw item', () => {
    const collection = buildCollection();
    const { result } = renderHook(() =>
      useSelectSearch(collection, {
        filterFn: (_itemString, item, query) =>
          item.description?.toLowerCase().includes(query.toLowerCase()) ?? false,
      }),
    );

    act(() => {
      result.current.onSearchChange('typed');
    });

    expect(result.current.filteredCollection.items.map(item => item.value)).toEqual(['ts']);
  });
});
