import type { ComponentType, ReactNode } from 'react';
import { collectDirectChildren } from './collectDirectChildren';

/**
 * Returns true when `node` has at least one direct child of the given component
 * type — transparently descending into `<>...</>` Fragments but not arbitrary
 * wrapper elements. Matches the "direct child" opt-out contract used by
 * Tour / Dialog / BulkBar and the Table sort / column-menu / settings seams.
 */
export const containsDirectChild = (node: ReactNode, target: ComponentType<unknown>): boolean =>
  collectDirectChildren(node, target).length > 0;
