import {
  type HTMLAttributes,
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useOverflowItems } from '../../hooks';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';

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
  // item (the old items.indexOf made rendering O(n²)).
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
    reserveSpace: 80,
  });

  // Adjust visible items based on minVisibleItems
  const finalVisibleItems = useMemo(() => {
    if (visibleItems.length < minVisibleItems && items.length >= minVisibleItems) {
      return items.slice(0, minVisibleItems);
    }
    return visibleItems;
  }, [visibleItems, minVisibleItems, items]);

  const finalHiddenItems = useMemo(() => {
    if (finalVisibleItems.length !== visibleItems.length) {
      return items.slice(finalVisibleItems.length);
    }
    return hiddenItems;
  }, [finalVisibleItems.length, visibleItems.length, items, hiddenItems]);

  const finalHiddenCount = finalHiddenItems.length;

  // Notify about overflow as a side-effect, not during render.
  useEffect(() => {
    if (onOverflow && finalHiddenItems.length > 0) {
      onOverflow(finalHiddenItems);
    }
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
      <div ref={containerRef} className={cn('flex w-full min-w-0', className)} {...props}>
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
