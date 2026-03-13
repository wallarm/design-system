import { useCallback, useEffect, useRef, useState } from 'react';
import { COLLAPSED_MAX_HEIGHT } from './classes';

/**
 * Manages the expand/collapse state for the query bar chip area.
 *
 * Uses a ResizeObserver on the inner container to detect when chip content
 * exceeds `COLLAPSED_MAX_HEIGHT`. Automatically collapses back when chips
 * are removed and the content fits within the limit.
 */
export const useExpandCollapse = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const check = () => {
      const wouldOverflow = el.scrollHeight > COLLAPSED_MAX_HEIGHT;
      if (isExpanded) {
        // Auto-collapse when content fits after chip removal
        if (!wouldOverflow) {
          setIsExpanded(false);
          setIsOverflowing(false);
        }
      } else {
        setIsOverflowing(wouldOverflow);
      }
    };

    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isExpanded]);

  const toggleExpand = useCallback(() => setIsExpanded(prev => !prev), []);
  const multiRow = isOverflowing || isExpanded;

  return { isExpanded, isOverflowing, innerRef, toggleExpand, multiRow } as const;
};
