import {
  type ReactElement,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { calculateVisibleCount } from './useOverflowItems.helpers';
import { scheduleOverflowMeasurement, type WritePhase } from './useOverflowItems.scheduler';

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
  const cacheRef = useRef<MeasurementCacheEntry>({
    widths: [],
    gap: 0,
    indicatorWidth: reserveSpace,
    lastCount: 0,
  });

  // Pure recompute from the cache — no DOM writes, safe per resize frame. Pass
  // `availableWidth` if already read in a batch to keep that phase read-only.
  const recompute = useCallback((availableWidth?: number) => {
    const container = containerRef.current;
    if (!container) return;

    // Not laid out (e.g. a `display:none` ancestor): offsetWidth is 0. Bail so we
    // neither expand to every item (calculateVisibleCount treats availableWidth<=0
    // as "everything fits") nor measure against a zero-width cache — keep the last
    // good split until the element is visible again.
    if (container.offsetWidth === 0) return;

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

  // True when a measurement was requested but the subtree wasn't laid out yet
  // (a `display:none` ancestor makes every offsetWidth read 0). The ResizeObserver
  // performs the deferred measurement once the element becomes visible — this hinges
  // on display:none firing a resize on hide/show (it does; visibility:hidden keeps a
  // real width so it never reaches this path, content-visibility is out of scope).
  const pendingMeasureRef = useRef(false);

  // Shared read→write pass for the batch scheduler: reads the layer, returns
  // the write that commits the caches + state and drops the layer from layout.
  // Not laid out (display:none ancestor: every offsetWidth read is 0) — the
  // write only flags the measurement as pending, so the caches are never
  // poisoned with zero widths. A null container is NOT deferred: without one
  // the observer is never attached, so a deferred measurement would never run.
  const measure = useCallback((): WritePhase => {
    // Read phase: DOM reads only, no state updates.
    const container = containerRef.current;

    if (container && container.offsetWidth === 0) {
      return () => {
        pendingMeasureRef.current = true;
      };
    }

    const gap = container ? Number.parseFloat(getComputedStyle(container).gap || '0') || 0 : 0;
    const widths = measurementRefs.current.slice(0, items.length).map(ref => ref?.offsetWidth ?? 0);
    const indicatorWidth = indicatorRef.current?.offsetWidth || reserveSpace;
    const availableWidth = container?.offsetWidth ?? 0;

    // Write phase: caches + state update, no DOM reads.
    return () => {
      pendingMeasureRef.current = false;
      const entry = { widths, gap, indicatorWidth, lastCount: items.length };
      cacheRef.current = entry;
      crossMountCache.set(items, entry);
      recompute(availableWidth); // also refreshes entry.lastCount
      // Done — drop the duplicate content from layout; recomputes use cache.
      measurementLayerRef.current?.style.setProperty('display', 'none');
    };
  }, [items, reserveSpace, recompute]);

  // Latest-ref so the ResizeObserver can reach `measure` without depending on its
  // identity: `measure` changes whenever `items` change, and listing it as an
  // effect dependency would tear down and re-subscribe the observer on every items
  // change — each re-subscribe firing a redundant initial callback.
  const measureRef = useRef(measure);
  measureRef.current = measure;

  // Measure on items/renderer change. Reads are batched into one pre-paint
  // microtask (see scheduler) — measuring sync here reflows per instance.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the renderers aren't called here but decide what the measurement layer renders, so they must invalidate the cached widths
  useLayoutEffect(() => {
    if (items.length === 0) {
      cacheRef.current = { widths: [], gap: 0, indicatorWidth: reserveSpace, lastCount: 0 };
      setVisibleCount(0);
      pendingMeasureRef.current = false;
      return;
    }

    const cached = crossMountCache.get(items);
    if (cached) {
      // Widths known — no layer rendered, only re-read the container width.
      cacheRef.current = cached;
      pendingMeasureRef.current = false;
      return scheduleOverflowMeasurement(() => {
        const availableWidth = containerRef.current?.offsetWidth ?? 0;
        return () => recompute(availableWidth);
      });
    }

    // Re-show the layer (commit-phase write, before any batched read) so the
    // reads below see real widths.
    measurementLayerRef.current?.style.removeProperty('display');

    return scheduleOverflowMeasurement(measure);
  }, [
    items,
    renderItem,
    renderMeasurementItem,
    overflowRenderer,
    reserveSpace,
    recompute,
    measure,
  ]);

  // Observe resize; coalesce notifications into one recompute per frame.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    let cancelDeferred: (() => void) | undefined;
    const observer = new ResizeObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        // First real layout after being measured while hidden: run the deferred
        // measurement through the shared batch so N instances revealed in the
        // same frame do all reads, then all writes — no interleaved reflows.
        // Its write phase recomputes; the queue dedupes by function identity,
        // so overlapping with a still-scheduled effect pass runs it once.
        if (pendingMeasureRef.current) {
          cancelDeferred = scheduleOverflowMeasurement(measureRef.current);
          return;
        }
        recompute();
      });
    });
    observer.observe(container);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      cancelDeferred?.();
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
