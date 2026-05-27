/** Fallback width (px) reserved for the "+N" overflow indicator until the real
 * indicator has been measured. Passed to `useOverflowItems.reserveSpace`. */
export const OVERFLOW_RESERVE_SPACE = 80;

/**
 * Shallow item-by-item equality for two lists. Order-sensitive — items must
 * match at the same index. Used to guard `onOverflow` from re-firing when the
 * hidden set keeps a fresh array identity but the same contents. A `null`
 * previous list is treated as "not equal".
 */
export function areItemsShallowEqual<T>(prev: T[] | null, next: T[]): boolean {
  if (!prev || prev.length !== next.length) return false;
  return next.every((item, index) => item === prev[index]);
}

export interface ResolveVisibleItemsParams<T> {
  /** Full source list, in order. */
  items: T[];
  /** Items the overflow engine decided are visible. */
  visibleItems: T[];
  /** Items the overflow engine collapsed into the indicator. */
  hiddenItems: T[];
  /** Minimum number of items to keep visible regardless of available space. */
  minVisibleItems: number;
}

/**
 * Applies the `minVisibleItems` floor to the overflow engine's output. When the
 * engine collapses below the floor (and the list is long enough), force the
 * first `minVisibleItems` to stay visible and recompute the hidden tail.
 * Otherwise the engine's split is returned untouched (same references).
 */
export function resolveVisibleItems<T>({
  items,
  visibleItems,
  hiddenItems,
  minVisibleItems,
}: ResolveVisibleItemsParams<T>): { visibleItems: T[]; hiddenItems: T[] } {
  if (visibleItems.length < minVisibleItems && items.length >= minVisibleItems) {
    return {
      visibleItems: items.slice(0, minVisibleItems),
      hiddenItems: items.slice(minVisibleItems),
    };
  }
  return { visibleItems, hiddenItems };
}
