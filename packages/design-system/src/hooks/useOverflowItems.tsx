import { type ReactElement, type RefObject, useLayoutEffect, useRef, useState } from 'react';

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
  const [measurements, setMeasurements] = useState<number[]>([]);
  const measurementRefs = useRef<(HTMLElement | null)[]>([]);

  // Measure items
  useLayoutEffect(() => {
    if (items.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleCount(0);
      setMeasurements([]);
      return;
    }

    // Collect measurements from refs
    const widths = measurementRefs.current.slice(0, items.length).map(ref => ref?.offsetWidth || 0);

    setMeasurements(widths);
  }, [items]);

  // Calculate visible items based on measurements
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || measurements.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleCount(items.length);
      return;
    }

    const calculateVisibleItems = () => {
      const availableWidth = container.offsetWidth;
      if (availableWidth <= 0) {
        setVisibleCount(items.length);
        return;
      }

      // Get computed styles to extract gap automatically
      const computedStyles = window.getComputedStyle(container);
      const gap = parseFloat(computedStyles.gap || '0');

      let accumulatedWidth = 0;
      let count = 0;

      // Check how many items fit
      for (let i = 0; i < measurements.length; i++) {
        const itemWidth = measurements[i];
        if (!itemWidth) continue;

        const widthWithGap = itemWidth + (i > 0 ? gap : 0);

        // Check if we need space for indicator
        const needsIndicator = i < measurements.length - 1;

        // Dynamically calculate overflow space if renderer provided
        let dynamicReserveSpace = reserveSpace;
        if (needsIndicator && overflowRenderer) {
          try {
            // Create a temporary element to measure overflow renderer
            const tempDiv = document.createElement('div');
            tempDiv.style.cssText = 'position: absolute; visibility: hidden; top: -9999px;';
            tempDiv.style.font = computedStyles.font;
            document.body.appendChild(tempDiv);

            // Render the overflow element temporarily
            const overflowItem = items[0];

            if (overflowItem) {
              const overflowElement = overflowRenderer([overflowItem]); // Use first item as sample
              if (overflowElement && typeof overflowElement === 'object') {
                // Extract text for measurement
                tempDiv.textContent = '+1'; // Simple estimation
              }
            }

            dynamicReserveSpace = tempDiv.offsetWidth + gap;
            document.body.removeChild(tempDiv);
          } catch {
            // Fallback to static reserveSpace
          }
        }

        const maxWidth = availableWidth - (needsIndicator ? dynamicReserveSpace : 0);

        if (accumulatedWidth + widthWithGap <= maxWidth || i === 0) {
          count++;
          accumulatedWidth += widthWithGap;
        } else {
          break;
        }
      }

      setVisibleCount(count || 1); // Always show at least one
    };

    calculateVisibleItems();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateVisibleItems);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [measurements, items, reserveSpace, overflowRenderer]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);
  const hiddenCount = hiddenItems.length;

  // Measurement container component
  const MeasurementContainer = () => {
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
      </div>
    );
  };

  return {
    containerRef,
    visibleItems,
    hiddenItems,
    visibleCount,
    hiddenCount,
    MeasurementContainer,
  };
}
