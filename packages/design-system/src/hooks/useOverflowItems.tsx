import {
  type ReactElement,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { calculateVisibleCount } from './useOverflowItems.helpers';
import { observeOverflowResize } from './useOverflowItems.observer';
import { scheduleOverflowMeasurement, type WritePhase } from './useOverflowItems.scheduler';

export interface UseOverflowItemsOptions<T> {
  /**
   * Invariant: measurements are cached by array identity, so changing the
   * renderers/reserveSpace to alter widths needs a fresh array.
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
  /** Last visible count — seeds state on remount. */
  lastCount: number;
}

// Survives unmount (virtualized rows remount constantly); an unstable items
// identity simply misses and re-measures.
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
    // Start minimal and let the measurement grow it — appends are cheap.
    return Math.min(items.length, 1);
  });

  // Lets a stable `recompute` reach the current items' cache entry.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Hidden measurement layer: a ref per item + a ref for the '+N' indicator.
  const measurementRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  // `display:none`d between measurements — imperatively, since React state
  // would re-render consumers and re-trigger the measure effect forever.
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

    const width = availableWidth ?? container.offsetWidth;
    // Hidden (display:none ancestor): keep the last good split until visible.
    if (width === 0) return;

    const { widths, gap, indicatorWidth } = cacheRef.current;
    if (widths.length === 0) return;

    const next = calculateVisibleCount({
      itemWidths: widths,
      gap,
      availableWidth: width,
      indicatorWidth,
    });
    const entry = crossMountCache.get(itemsRef.current);
    if (entry) {
      entry.lastCount = next;
    }
    setVisibleCount(prev => (prev === next ? prev : next));
  }, []);

  // Measurement requested while the subtree wasn't laid out (display:none
  // ancestor) — the ResizeObserver performs it once the element is shown.
  const pendingMeasureRef = useRef(false);

  // Shared read→write pass for the batch scheduler: reads the layer, returns
  // the write that commits the caches + state and drops the layer from layout.
  const measure = useCallback((): WritePhase => {
    // Read phase: DOM reads only, no state updates.
    const container = containerRef.current;

    // Hidden: every offsetWidth read is 0 — defer instead of poisoning the
    // caches. A null container is NOT deferred: without one the observer is
    // never attached, so a deferred measurement would never run.
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
      // Done — drop the duplicate content from layout.
      measurementLayerRef.current?.style.setProperty('display', 'none');
    };
  }, [items, reserveSpace, recompute]);

  // Latest-ref so the observer reaches `measure` without re-subscribing on
  // every items change.
  const measureRef = useRef(measure);
  measureRef.current = measure;

  // Read→write recompute for resize ticks and cached items.
  const recomputeRead = useCallback((): WritePhase => {
    const availableWidth = containerRef.current?.offsetWidth ?? 0;
    return () => recompute(availableWidth);
  }, [recompute]);

  // Measure on items/renderer change, batched via the scheduler.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the renderers decide what the measurement layer renders, so they must invalidate the cached widths
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
      return scheduleOverflowMeasurement(recomputeRead);
    }

    // Re-show the layer before any batched read so it has real widths.
    measurementLayerRef.current?.style.removeProperty('display');

    return scheduleOverflowMeasurement(measure);
  }, [
    items,
    renderItem,
    renderMeasurementItem,
    overflowRenderer,
    reserveSpace,
    recomputeRead,
    measure,
  ]);

  // Observe resize via the shared observer. It fires pre-paint and delivers
  // every instance in one callback, so measurements scheduled here flush in a
  // single batch before the frame paints — a reveal never shows a stale split.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelScheduled: (() => void) | undefined;
    const unobserve = observeOverflowResize(container, () => {
      // A hidden-time measure runs deferred; otherwise just recompute.
      cancelScheduled = pendingMeasureRef.current
        ? scheduleOverflowMeasurement(measureRef.current)
        : scheduleOverflowMeasurement(recomputeRead);
    });

    return () => {
      cancelScheduled?.();
      unobserve();
    };
  }, [recomputeRead]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);
  const hiddenCount = hiddenItems.length;

  // Measurement layer; skipped when widths are already cached cross-mount.
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
