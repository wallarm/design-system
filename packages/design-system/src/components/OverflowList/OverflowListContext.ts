import { createContext, type ReactNode, type RefObject, useContext } from 'react';

export interface OverflowListContextValue<T = unknown> {
  /** Full source list, in order. */
  allItems: T[];
  /** Items rendered in the row. */
  visibleItems: T[];
  /** Items folded into the overflow indicator. */
  hiddenItems: T[];
  /** The list's own `itemRenderer`, reused by `OverflowListMoreItems`. */
  itemRenderer: (item: T, index: number) => ReactNode;
  /** The row element — the anchor for `OverflowListMore placement='cover'`. */
  containerRef: RefObject<HTMLDivElement | null>;
  /**
   * True inside the hidden measurement layer. `OverflowListMore` parts render
   * only the bare trigger chip there — no popover, no refs, no test ids.
   */
  measuring: boolean;
  /** The list's `data-testid` — the base `OverflowListMore` derives `--more` from. */
  testId: string | undefined;
}

const OverflowListContext = createContext<OverflowListContextValue | null>(null);

export const OverflowListProvider = OverflowListContext.Provider;

export const useOverflowListContext = <T = unknown>(): OverflowListContextValue<T> => {
  const context = useContext(OverflowListContext);
  if (!context) {
    throw new Error(
      'OverflowListMore parts must be rendered inside an OverflowList overflowRenderer',
    );
  }
  return context as OverflowListContextValue<T>;
};

const OverflowListMoreTriggerRefContext = createContext<RefObject<HTMLButtonElement | null> | null>(
  null,
);

export const OverflowListMoreTriggerRefProvider = OverflowListMoreTriggerRefContext.Provider;

/** The `OverflowListMore` trigger ref — `cover` placement anchors to its top edge. */
export const useOverflowListMoreTriggerRef = () => useContext(OverflowListMoreTriggerRefContext);
