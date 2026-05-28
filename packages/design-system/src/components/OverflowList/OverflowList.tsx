import {
  type HTMLAttributes,
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useOverflowItems } from '../../hooks';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import {
  areItemsShallowEqual,
  OVERFLOW_RESERVE_SPACE,
  resolveVisibleItems,
} from './OverflowList.helpers';

type CollapseDirection = 'start' | 'end';

export interface OverflowListProps<T> extends HTMLAttributes<HTMLDivElement>, TestableProps {
  items: T[];
  itemRenderer: (item: T, index: number) => ReactNode;
  overflowRenderer: (items: T[]) => ReactNode;
  minVisibleItems?: number;
  onOverflow?: (items: T[]) => void;
  collapseFrom?: CollapseDirection;
  alwaysRenderOverflow?: boolean;
}

const OverflowListComponent = <T,>({
  items,
  itemRenderer,
  overflowRenderer,
  className,
  collapseFrom = 'end',
  minVisibleItems = 0,
  alwaysRenderOverflow = false,
  onOverflow,
  ...props
}: OverflowListProps<T>) => {
  // Build an item→index map once so the renderer is O(1) instead of O(n) per
  // item (the old items.indexOf made rendering O(n²)). Duplicate items map to
  // their first occurrence — same semantics as the previous indexOf.
  const indexMap = useMemo(() => {
    const map = new Map<T, number>();
    items.forEach((item, index) => {
      if (!map.has(item)) map.set(item, index);
    });
    return map;
  }, [items]);

  const memoizedItemRenderer = useCallback(
    (item: T) => itemRenderer(item, indexMap.get(item) ?? 0),
    [indexMap, itemRenderer],
  );

  const memoizedMeasurementRenderer = useCallback(
    (item: T) => itemRenderer(item, indexMap.get(item) ?? 0) as ReactElement,
    [indexMap, itemRenderer],
  );

  const { containerRef, visibleItems, hiddenItems, MeasurementContainer } = useOverflowItems({
    items,
    renderItem: memoizedMeasurementRenderer,
    overflowRenderer: items => overflowRenderer(items) as ReactElement,
    reserveSpace: OVERFLOW_RESERVE_SPACE,
  });

  // Apply the minVisibleItems floor to the engine's split.
  const { visibleItems: finalVisibleItems, hiddenItems: finalHiddenItems } = useMemo(
    () => resolveVisibleItems({ items, visibleItems, hiddenItems, minVisibleItems }),
    [items, visibleItems, hiddenItems, minVisibleItems],
  );

  const finalHiddenCount = finalHiddenItems.length;

  // Notify about overflow as a side-effect, not during render. `finalHiddenItems`
  // gets a fresh array identity every render (it derives from `items.slice(...)`),
  // so guard against re-invoking `onOverflow` unless the hidden set actually
  // changed — otherwise a consumer that sets state in `onOverflow` would loop.
  const prevHiddenRef = useRef<T[] | null>(null);
  useEffect(() => {
    if (!onOverflow || finalHiddenItems.length === 0) {
      prevHiddenRef.current = finalHiddenItems;
      return;
    }
    if (!areItemsShallowEqual(prevHiddenRef.current, finalHiddenItems)) {
      onOverflow(finalHiddenItems);
    }
    prevHiddenRef.current = finalHiddenItems;
  }, [finalHiddenItems, onOverflow]);

  // Render overflow element
  const overflowElement = useMemo(() => {
    if (finalHiddenCount === 0 && !alwaysRenderOverflow) {
      return null;
    }
    return overflowRenderer(finalHiddenItems);
  }, [finalHiddenCount, alwaysRenderOverflow, overflowRenderer, finalHiddenItems]);

  // Render visible items
  const visibleElements = useMemo(
    () => finalVisibleItems.map(memoizedItemRenderer),
    [finalVisibleItems, memoizedItemRenderer],
  );

  return (
    <>
      <MeasurementContainer />
      {/*
       * `w-full` pins the container width to its parent track. Without it the
       * container is content-sized: once items collapse into the overflow
       * indicator the container stays narrow even when the surrounding column
       * expands, so `useOverflowItems` never observes a size change and never
       * reflows visible items back. `min-w-0` keeps it shrinkable below content.
       */}
      <div
        ref={containerRef}
        data-slot='overflow-list'
        className={cn('flex w-full min-w-0', className)}
        {...props}
      >
        {collapseFrom === 'start' && overflowElement}
        {visibleElements}
        {collapseFrom === 'end' && overflowElement}
      </div>
    </>
  );
};

// Export with memo to prevent unnecessary re-renders
export const OverflowList = memo(OverflowListComponent) as <T>(
  props: OverflowListProps<T>,
) => ReactElement;
