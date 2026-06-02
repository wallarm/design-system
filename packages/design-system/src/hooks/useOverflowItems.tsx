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
  /** Last computed visible count — seeds state on remount so a returning
   * cell renders its final shape immediately instead of all items. */
  lastCount: number;
}

// Measurements survive unmount, keyed by the items array identity. In a
// virtualized table rows constantly leave and re-enter the render window;
// without this cache every re-entering cell re-renders its full item list
// plus a hidden measurement copy, measures, then collapses — hundreds of
// wasted DOM mutations per scroll step. Item data lives in stable stores
// (SWR et al.), so array identity is a reliable key; an unstable identity
// just misses the cache and measures again. Widths are content-derived, so
// a renderer that draws the same items differently would hit a stale entry —
// DS renderers are static in practice, and the pre-cache behavior re-measured
// on every consumer render only because inline renderer props made identity
// meaningless as a change signal anyway.
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
    return cached ? Math.min(cached.lastCount, items.length) : items.length;
  });

  // Lets `recompute` update the cache entry of whatever items are current,
  // without being recreated (it's a dependency of both effects below).
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Hidden measurement layer: a ref per item + a ref for the '+N' indicator.
  const measurementRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  // The layer's wrapper. `visibility: hidden` content still participates in
  // every layout pass, and the layer duplicates each item — on large tables
  // it dwarfs the visible content. So outside of an actual measurement the
  // layer is `display: none`d (imperatively — React state here would re-render
  // consumers, whose inline renderer props would re-trigger the measurement
  // effect, looping forever).
  const measurementLayerRef = useRef<HTMLDivElement | null>(null);

  // Measurement cache — read once when items/renderers change, never per resize tick.
  const cacheRef = useRef<{ widths: number[]; gap: number; indicatorWidth: number }>({
    widths: [],
    gap: 0,
    indicatorWidth: reserveSpace,
  });

  // Pure recompute from the cache + container width. No DOM writes — safe to
  // run on every resize frame. Pass `availableWidth` when it was already read
  // in a batched read phase to keep that phase free of interleaved reads.
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

  // Measure when items/renderers change. Reads are deferred into a shared
  // pre-paint microtask batch: measuring synchronously here forces a reflow
  // per hook instance, because each instance's setState flushes before the
  // next instance's layout effect reads the DOM (see the scheduler module).
  // biome-ignore lint/correctness/useExhaustiveDependencies: renderItem/renderMeasurementItem/overflowRenderer are not called inside the effect but determine what the hidden measurement layer renders, so a change to them must invalidate the cached DOM widths and re-measure
  useLayoutEffect(() => {
    if (items.length === 0) {
      cacheRef.current = { widths: [], gap: 0, indicatorWidth: reserveSpace };
      setVisibleCount(0);
      return;
    }

    const cached = crossMountCache.get(items);
    if (cached) {
      // Widths are known from a previous mount — no measurement layer in the
      // tree, nothing to measure. Only the container width is needed, and even
      // that read goes through the batch to stay clear of commit-time writes.
      cacheRef.current = cached;
      return scheduleOverflowMeasurement(() => {
        const availableWidth = containerRef.current?.offsetWidth ?? 0;
        return () => recompute(availableWidth);
      });
    }

    // Re-enable layout for the layer so the reads below see real widths. This
    // is a DOM write, but it happens in the commit phase — strictly before any
    // instance's batched read phase runs.
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
        // Measurement done — exclude the duplicate content from subsequent
        // layout passes. Resize recomputes run off the cache and never need
        // this DOM again until items/renderers change.
        measurementLayerRef.current?.style.setProperty('display', 'none');
      };
    });
  }, [items, renderItem, renderMeasurementItem, overflowRenderer, reserveSpace, recompute]);

  // Observe container resize; defer heavy work into a single rAF, coalescing
  // multiple notifications per frame into one recompute.
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
