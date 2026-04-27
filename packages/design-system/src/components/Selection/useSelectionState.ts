// packages/design-system/src/components/Selection/useSelectionState.ts
import { useCallback, useMemo } from 'react';

export interface UseSelectionStateParams<T> {
  items: T[];
  getItemId: (item: T) => string;
  value: string[];
  onChange: (ids: string[]) => void;
  /** Set of itemIds that cannot be toggled and are excluded from selectAll. */
  disabledIds?: Set<string>;
}

export interface UseSelectionStateResult {
  itemIds: string[];
  enabledItemIds: string[];
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleItem: (id: string) => void;
  selectAll: () => void;
  clear: () => void;
}

const EMPTY_DISABLED: ReadonlySet<string> = new Set();

export const useSelectionState = <T>({
  items,
  getItemId,
  value,
  onChange,
  disabledIds,
}: UseSelectionStateParams<T>): UseSelectionStateResult => {
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId]);
  const itemIdSet = useMemo(() => new Set(itemIds), [itemIds]);
  const disabled = disabledIds ?? EMPTY_DISABLED;

  const enabledItemIds = useMemo(
    () => itemIds.filter(id => !disabled.has(id)),
    [itemIds, disabled],
  );

  const selectedIds = useMemo(() => new Set(value), [value]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const enabledSelectedCount = useMemo(() => {
    let n = 0;
    for (const id of enabledItemIds) if (selectedIds.has(id)) n++;
    return n;
  }, [enabledItemIds, selectedIds]);

  const isAllSelected = enabledItemIds.length > 0 && enabledSelectedCount === enabledItemIds.length;
  const isIndeterminate = enabledSelectedCount > 0 && enabledSelectedCount < enabledItemIds.length;

  const emitOrdered = useCallback(
    (ids: Set<string>) => {
      const next: string[] = [];
      for (const id of itemIds) if (ids.has(id)) next.push(id);
      for (const id of value) if (!itemIdSet.has(id) && ids.has(id)) next.push(id);
      onChange(next);
    },
    [itemIds, itemIdSet, value, onChange],
  );

  const toggleItem = useCallback(
    (id: string) => {
      if (!itemIdSet.has(id)) return;
      if (disabled.has(id)) return;
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      emitOrdered(next);
    },
    [itemIdSet, disabled, selectedIds, emitOrdered],
  );

  const selectAll = useCallback(() => {
    emitOrdered(new Set(enabledItemIds));
  }, [enabledItemIds, emitOrdered]);

  const clear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return {
    itemIds,
    enabledItemIds,
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    selectAll,
    clear,
  };
};
