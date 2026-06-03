import {
  type ReactElement,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { calculateVisibleCount } from './useOverflowItems.helpers';
import { scheduleOverflowMeasurement } from './useOverflowItems.scheduler';

export interface UseOverflowItemsOptions<T> {
  /**
   * Invariant: a given `items` array identity must always render to the same
   * widths. Measurements are cached by array identity regardless of the
   * renderers/reserveSpace, so changing those to alter widths needs a fresh
   * array.
   */
  items: T[];
  renderItem: (item: T) => ReactElement;
  renderMeasurementItem?: (item: T) => ReactElement;
  overflowRenderer?: (items: T[]) => ReactElement;
  reserveSpace?: number;
}

export interface UseOverflowItemsResult<T> {
  containerRef: RefObject<HTMLDivElement | null>;
  visibleItems: T[];
  hiddenItems: T[];
  visibleCount: number;
  hiddenCount: number;
  MeasurementContainer: () => ReactElement | null;
}

interface MeasurementCacheEntry {
  widths: number[];
  gap: number;
  indicatorWidth: number;
  /** Last visible count — seeds state on remount so a returning cell renders
   * its final shape immediately. */
  lastCount: number;
}

// Measurements survive unmount, keyed by items identity — virtualized rows
// remount constantly, and re-measuring each on re-entry costs hundreds of DOM
// mutations per scroll. An unstable identity simply misses and re-measures.
const crossMountCache = new WeakMap<readonly unknown[], MeasurementCacheEntry>();

export function useOverflowItems<T>({
  items,
  renderItem,
  renderMeasurementItem,
  overflowRenderer,
  reserveSpace = 60,
}: UseOverflowItemsOptions<T>): UseOverflowItemsResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(() => {
    const cached = items.length > 0 ? crossMountCache.get(items) : undefined;
    if (cached) return Math.min(cached.lastCount, items.length);
    // Corrected pre-paint, so never seen — but starting expanded builds the
    // full list just to collapse it (thousands of insert+remove per scroll).
    // Start minimal and let the measurement grow it: appends are cheap.
    return Math.min(items.length, 1);
  });

  // Lets a stable `recompute` reach the current items' cache entry.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Hidden measurement layer: a ref per item + a ref for the '+N' indicator.
  const measurementRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  // `visibility:hidden` still costs layout and the layer duplicates every item,
  // so it's `display:none`d between measurements — imperatively, since React
  // state would re-render consumers and re-trigger the measure effect forever.
  const measurementLayerRef = useRef<HTMLDivElement | null>(null);

  // Measurement cache — read once when items/renderers change, never per resize tick.
  const cacheRef = useRef<{ widths: number[]; gap: number; indicatorWidth: number }>({
    widths: [],
    gap: 0,
    indicatorWidth: reserveSpace,
  });

  // Pure recompute from the cache — no DOM writes, safe per resize frame. Pass
  // `availableWidth` if already read in a batch to keep that phase read-only.
  const recompute = useCallback((availableWidth?: number) => {
    const container = containerRef.current;
    if (!container) return;

    const { widths, gap, indicatorWidth } = cacheRef.current;
    if (widths.length === 0) return;

    const next = calculateVisibleCount({
      itemWidths: widths,
      gap,
      availableWidth: availableWidth ?? container.offsetWidth,
      indicatorWidth,
    });
    const entry = crossMountCache.get(itemsRef.current);
    if (entry) {
      entry.lastCount = next;
    }
    setVisibleCount(prev => (prev === next ? prev : next));
  }, []);

  // Measure on items/renderer change. Reads are batched into one pre-paint
  // microtask (see scheduler) — measuring sync here reflows per instance.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the renderers aren't called here but decide what the measurement layer renders, so they must invalidate the cached widths
  useLayoutEffect(() => {
    if (items.length === 0) {
      cacheRef.current = { widths: [], gap: 0, indicatorWidth: reserveSpace };
      setVisibleCount(0);
      return;
    }

    const cached = crossMountCache.get(items);
    if (cached) {
      // Widths known — no layer rendered, only re-read the container width.
      cacheRef.current = cached;
      return scheduleOverflowMeasurement(() => {
        const availableWidth = containerRef.current?.offsetWidth ?? 0;
        return () => recompute(availableWidth);
      });
    }

    // Re-show the layer (commit-phase write, before any batched read) so the
    // reads below see real widths.
    measurementLayerRef.current?.style.removeProperty('display');

    return scheduleOverflowMeasurement(() => {
      // Read phase: DOM reads only, no state updates.
      const container = containerRef.current;
      const gap = container ? Number.parseFloat(getComputedStyle(container).gap || '0') || 0 : 0;
      const widths = measurementRefs.current
        .slice(0, items.length)
        .map(ref => ref?.offsetWidth ?? 0);
      const indicatorWidth = indicatorRef.current?.offsetWidth || reserveSpace;
      const availableWidth = container?.offsetWidth ?? 0;

      // Write phase: cache + state update, no DOM reads.
      return () => {
        const entry = { widths, gap, indicatorWidth, lastCount: items.length };
        cacheRef.current = entry;
        crossMountCache.set(items, entry);
        recompute(availableWidth); // also refreshes entry.lastCount
        // Done — drop the duplicate content from layout; recomputes use cache.
        measurementLayerRef.current?.style.setProperty('display', 'none');
      };
    });
  }, [items, renderItem, renderMeasurementItem, overflowRenderer, reserveSpace, recompute]);

  // Observe resize; coalesce notifications into one recompute per frame.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        recompute();
      });
    });
    observer.observe(container);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [recompute]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);
  const hiddenCount = hiddenItems.length;

  // Measurement-layer component. Skipped entirely when widths are already
  // known from a previous mount of the same items array.
  const MeasurementContainer = useCallback(() => {
    if (items.length === 0 || crossMountCache.has(items)) return null;

    const renderMeasure = renderMeasurementItem || renderItem;

    return (
      <div
        ref={measurementLayerRef}
        className='absolute invisible pointer-events-none'
        aria-hidden='true'
      >
        {items.map((item, index) => {
          const key = `${index}`;
          return (
            <div
              key={key}
              ref={el => {
                measurementRefs.current[index] = el;
              }}
              className='inline-flex'
            >
              {renderMeasure(item)}
            </div>
          );
        })}
        {overflowRenderer && (
          <div ref={indicatorRef} className='inline-flex'>
            {overflowRenderer(items)}
          </div>
        )}
      </div>
    );
  }, [items, renderItem, renderMeasurementItem, overflowRenderer]);

  return {
    containerRef,
    visibleItems,
    hiddenItems,
    visibleCount,
    hiddenCount,
    MeasurementContainer,
  };
}
