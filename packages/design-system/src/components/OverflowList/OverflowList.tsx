import {
  type HTMLAttributes,
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useOverflowItems } from '../../hooks';
import { cn } from '../../utils/cn';

type CollapseDirection = 'start' | 'end';

export interface OverflowListProps<T> extends HTMLAttributes<HTMLDivElement> {
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
  // Memoize render functions to prevent unnecessary re-renders
  const memoizedItemRenderer = useCallback(
    (item: T) => {
      const index = items.indexOf(item);
      return itemRenderer(item, index);
    },
    [items, itemRenderer],
  );

  const memoizedMeasurementRenderer = useCallback(
    (item: T) => {
      const index = items.indexOf(item);
      return itemRenderer(item, index) as ReactElement;
    },
    [items, itemRenderer],
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

  // Call onOverflow when hidden items change
  useMemo(() => {
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
      <div ref={containerRef} className={cn('flex min-w-0', className)} {...props}>
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
