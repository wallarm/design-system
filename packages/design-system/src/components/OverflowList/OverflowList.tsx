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
import { type OverflowListContextValue, OverflowListProvider } from './OverflowListContext';
import { OverflowListMore } from './OverflowListMore';

type CollapseDirection = 'start' | 'end';

export interface OverflowListOverflowMeta<T> {
  /** Full source list, in order. */
  allItems: T[];
  /** Items rendered in the row. Empty in the hidden measurement layer. */
  visibleItems: T[];
}

export type OverflowListRenderer<T> = (
  hiddenItems: T[],
  meta: OverflowListOverflowMeta<T>,
) => ReactNode;

export interface OverflowListProps<T> extends HTMLAttributes<HTMLDivElement>, TestableProps {
  /** Measurements are cached by array identity — keep it referentially stable. */
  items: T[];
  itemRenderer: (item: T, index: number) => ReactNode;
  /**
   * Renders the overflow indicator. Also called once in the hidden measurement
   * layer with every item hidden, so it must be pure. Compose it from the
   * `OverflowListMore` parts; defaults to `<OverflowListMore />`.
   */
  overflowRenderer?: OverflowListRenderer<T>;
  /** Keep at least this many items visible however narrow the row gets. */
  minVisibleItems?: number;
  onOverflow?: (hiddenItems: T[]) => void;
  collapseFrom?: CollapseDirection;
  /**
   * Call `overflowRenderer` even when nothing is hidden. `OverflowListMore`
   * itself renders nothing at zero hidden items.
   */
  alwaysRenderOverflow?: boolean;
}

const NO_ITEMS: never[] = [];

const renderDefaultOverflow = () => <OverflowListMore />;

const OverflowListComponent = <T,>({
  items,
  itemRenderer,
  overflowRenderer = renderDefaultOverflow,
  className,
  collapseFrom = 'end',
  minVisibleItems = 0,
  alwaysRenderOverflow = false,
  onOverflow,
  'data-testid': testId,
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

  // The engine measures the indicator with every item hidden — the widest
  // "+N" it can show — so the reserved space never undershoots.
  const measurementOverflowRenderer = useCallback(
    (allItems: T[]) =>
      overflowRenderer(allItems, { allItems, visibleItems: NO_ITEMS }) as ReactElement,
    [overflowRenderer],
  );

  const { containerRef, visibleItems, hiddenItems, MeasurementContainer } = useOverflowItems({
    items,
    renderItem: memoizedMeasurementRenderer,
    overflowRenderer: measurementOverflowRenderer,
    reserveSpace: OVERFLOW_RESERVE_SPACE,
  });

  // Apply the minVisibleItems floor to the engine's split.
  const { visibleItems: finalVisibleItems, hiddenItems: finalHiddenItems } = useMemo(
    () => resolveVisibleItems({ items, visibleItems, hiddenItems, minVisibleItems }),
    [items, visibleItems, hiddenItems, minVisibleItems],
  );

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

  const context = useMemo<OverflowListContextValue<T>>(
    () => ({
      allItems: items,
      visibleItems: finalVisibleItems,
      hiddenItems: finalHiddenItems,
      itemRenderer,
      containerRef,
      measuring: false,
      testId,
    }),
    [items, finalVisibleItems, finalHiddenItems, itemRenderer, containerRef, testId],
  );

  const measurementContext = useMemo<OverflowListContextValue<T>>(
    () => ({
      allItems: items,
      visibleItems: NO_ITEMS,
      hiddenItems: items,
      itemRenderer,
      containerRef,
      measuring: true,
      testId: undefined,
    }),
    [items, itemRenderer, containerRef],
  );

  const overflowElement = useMemo(() => {
    if (finalHiddenItems.length === 0 && !alwaysRenderOverflow) return null;
    return overflowRenderer(finalHiddenItems, {
      allItems: items,
      visibleItems: finalVisibleItems,
    });
  }, [alwaysRenderOverflow, overflowRenderer, items, finalVisibleItems, finalHiddenItems]);

  // Render visible items
  const visibleElements = useMemo(
    () => finalVisibleItems.map(memoizedItemRenderer),
    [finalVisibleItems, memoizedItemRenderer],
  );

  // The list's test id travels in context, not a TestIdProvider: wrapping the
  // renderer output would hand any bare `Tag` in a custom renderer the row's id.
  const overflow = overflowElement && (
    <OverflowListProvider value={context as OverflowListContextValue}>
      {overflowElement}
    </OverflowListProvider>
  );

  return (
    <>
      <OverflowListProvider value={measurementContext as OverflowListContextValue}>
        <MeasurementContainer />
      </OverflowListProvider>
      {/*
       * `w-full` pins the container width to its parent track. Without it the
       * container is content-sized: once items collapse into the overflow
       * indicator the container stays narrow even when the surrounding column
       * expands, so `useOverflowItems` never observes a size change and never
       * reflows visible items back. `min-w-0` keeps it shrinkable below content.
       */}
      <div
        {...props}
        ref={containerRef}
        data-slot='overflow-list'
        data-testid={testId}
        className={cn('flex w-full min-w-0', className)}
      >
        {collapseFrom === 'start' && overflow}
        {visibleElements}
        {collapseFrom === 'end' && overflow}
      </div>
    </>
  );
};

// Export with memo to prevent unnecessary re-renders
export const OverflowList = memo(OverflowListComponent) as <T>(
  props: OverflowListProps<T>,
) => ReactElement;
