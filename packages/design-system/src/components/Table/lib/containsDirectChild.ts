import { Children, type ComponentType, Fragment, isValidElement, type ReactNode } from 'react';

/**
 * Returns true when `node` has at least one direct child of the given component
 * type — transparently descending into `<>...</>` Fragments but not arbitrary
 * wrapper elements. Matches the "direct child" opt-out contract used by
 * Tour / Dialog / BulkBar and the Table sort / column-menu / settings seams.
 *
 * Short-circuits on the first match and allocates nothing, since callers like
 * `TableHeadCell` run it per column on every header re-render (e.g. horizontal
 * scroll) — see `collectDirectChildren` when the actual elements are needed.
 */
export const containsDirectChild = (node: ReactNode, target: ComponentType<unknown>): boolean => {
  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) continue;
    if (child.type === target) return true;
    if (child.type === Fragment) {
      const fragmentChildren = (child.props as { children?: ReactNode }).children;
      if (containsDirectChild(fragmentChildren, target)) return true;
    }
  }
  return false;
};
