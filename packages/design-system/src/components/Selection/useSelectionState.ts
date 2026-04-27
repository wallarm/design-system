import { useCallback, useMemo } from 'react';

export interface UseSelectionStateParams<T> {
  items: T[];
  getItemId: (item: T) => string;
  value: string[];
  onChange: (ids: string[]) => void;
}

export interface UseSelectionStateResult {
  itemIds: string[];
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleItem: (id: string) => void;
  selectAll: () => void;
  clear: () => void;
}

export const useSelectionState = <T>({
  items,
  getItemId,
  value,
  onChange,
}: UseSelectionStateParams<T>): UseSelectionStateResult => {
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId]);
  const itemIdSet = useMemo(() => new Set(itemIds), [itemIds]);
  const selectedIds = useMemo(() => new Set(value), [value]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const validSelectedCount = useMemo(() => {
    let n = 0;
    for (const id of selectedIds) if (itemIdSet.has(id)) n++;
    return n;
  }, [selectedIds, itemIdSet]);

  const isAllSelected = itemIds.length > 0 && validSelectedCount === itemIds.length;
  const isIndeterminate = validSelectedCount > 0 && validSelectedCount < itemIds.length;

  const emitOrdered = useCallback(
    (ids: Set<string>) => {
      const next: string[] = [];
      for (const id of itemIds) if (ids.has(id)) next.push(id);
      // preserve any "stale" ids that were already in `value` but not in items
      for (const id of value) if (!itemIdSet.has(id) && ids.has(id)) next.push(id);
      onChange(next);
    },
    [itemIds, itemIdSet, value, onChange],
  );

  const toggleItem = useCallback(
    (id: string) => {
      if (!itemIdSet.has(id)) return;
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      emitOrdered(next);
    },
    [itemIdSet, selectedIds, emitOrdered],
  );

  const selectAll = useCallback(() => {
    emitOrdered(new Set(itemIds));
  }, [itemIds, emitOrdered]);

  const clear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return {
    itemIds,
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    selectAll,
    clear,
  };
};
