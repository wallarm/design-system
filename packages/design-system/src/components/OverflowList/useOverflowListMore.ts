import { useOverflowListContext } from './OverflowListContext';

export interface OverflowListMoreState<T> {
  allItems: T[];
  visibleItems: T[];
  hiddenItems: T[];
  hiddenCount: number;
  totalCount: number;
}

/**
 * Read the list split from inside an `OverflowList` overflow renderer — e.g.
 * to pluralize a localized header: `t('tags', { count: totalCount })`.
 */
export const useOverflowListMore = <T = unknown>(): OverflowListMoreState<T> => {
  const { allItems, visibleItems, hiddenItems } = useOverflowListContext<T>();
  return {
    allItems,
    visibleItems,
    hiddenItems,
    hiddenCount: hiddenItems.length,
    totalCount: allItems.length,
  };
};
