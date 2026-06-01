import {
  type ReactElement,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { calculateVisibleCount } from './useOverflowItems.helpers';

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

export function useOverflowItems<T>({
  items,
  renderItem,
  renderMeasurementItem,
  overflowRenderer,
  reserveSpace = 60,
}: UseOverflowItemsOptions<T>): UseOverflowItemsResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  // Hidden measurement layer: a ref per item + a ref for the '+N' indicator.
  const measurementRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  // Measurement cache — read once when items/renderers change, never per resize tick.
  const cacheRef = useRef<{ widths: number[]; gap: number; indicatorWidth: number }>({
    widths: [],
    gap: 0,
    indicatorWidth: reserveSpace,
  });

  // Pure recompute from the cache + current container width. No DOM writes —
  // safe to run on every resize frame.
  const recompute = useCallback(() => {
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
      availableWidth: container.offsetWidth,
      indicatorWidth,
    });
    setVisibleCount(prev => (prev === next ? prev : next));
  }, []);

  // True when a measurement was requested but the subtree wasn't laid out yet
  // (a `display:none` ancestor makes every offsetWidth read 0). The ResizeObserver
  // performs the deferred measurement once the element becomes visible — this hinges
  // on display:none firing a resize on hide/show (it does; visibility:hidden keeps a
  // real width so it never reaches this path, content-visibility is out of scope).
  const pendingMeasureRef = useRef(false);

  // Read the hidden measurement layer into the cache. DOM reads only. Returns
  // false (without touching the cache) when the subtree isn't laid out, so we
  // never poison the cache with zero widths.
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container || container.offsetWidth === 0) return false;

    const gap = Number.parseFloat(getComputedStyle(container).gap || '0') || 0;
    const widths = measurementRefs.current.slice(0, items.length).map(ref => ref?.offsetWidth ?? 0);
    const indicatorWidth = indicatorRef.current?.offsetWidth || reserveSpace;

    cacheRef.current = { widths, gap, indicatorWidth };
    return true;
  }, [items, reserveSpace]);

  // Latest-ref so the ResizeObserver can reach `measure` without depending on its
  // identity: `measure` changes whenever `items` change, and listing it as an
  // effect dependency would tear down and re-subscribe the observer on every items
  // change — each re-subscribe firing a redundant initial callback.
  const measureRef = useRef(measure);
  measureRef.current = measure;

  // Measure once when items/renderers change. DOM reads only.
  // biome-ignore lint/correctness/useExhaustiveDependencies: renderItem/renderMeasurementItem/overflowRenderer are not called inside the effect but determine what the hidden measurement layer renders, so a change to them must invalidate the cached DOM widths and re-measure
  useLayoutEffect(() => {
    if (items.length === 0) {
      cacheRef.current = { widths: [], gap: 0, indicatorWidth: reserveSpace };
      setVisibleCount(0);
      pendingMeasureRef.current = false;
      return;
    }

    if (measure()) {
      pendingMeasureRef.current = false;
      recompute();
    } else {
      // Measured while hidden — keep the previous cache and defer the real
      // measurement to the ResizeObserver, which fires when the element is shown.
      pendingMeasureRef.current = true;
    }
  }, [
    items,
    renderItem,
    renderMeasurementItem,
    overflowRenderer,
    reserveSpace,
    recompute,
    measure,
  ]);

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
        // First real layout after being measured while hidden: capture the widths
        // now (offsetWidth is non-zero again) before recomputing.
        if (pendingMeasureRef.current && measureRef.current()) {
          pendingMeasureRef.current = false;
        }
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

  // Stable measurement-layer component — not recreated on every render.
  const MeasurementContainer = useCallback(() => {
    if (items.length === 0) return null;

    const renderMeasure = renderMeasurementItem || renderItem;

    return (
      <div className='absolute invisible pointer-events-none' aria-hidden='true'>
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
