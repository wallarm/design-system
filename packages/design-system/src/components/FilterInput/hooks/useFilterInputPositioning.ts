import type { RefObject } from 'react';
import { useMemo } from 'react';
import { type AnchorBounds, buildAnchoredRect, QUERY_BAR_SELECTOR, toAnchorBounds } from '../lib';

interface UseFilterInputPositioningProps {
  /** Ref to the trigger element (used for X anchor and container lookup via closest) */
  anchorRef?: RefObject<HTMLElement | null>;
  /** Explicit container ref (skips closest lookup) */
  containerRef?: RefObject<HTMLElement | null>;
  /** Override anchor calculation (receives containerRect, returns vertical/left bounds) */
  getAnchorBounds?: (containerRect: DOMRect) => AnchorBounds;
}

/**
 * Shared positioning hook for all FilterInput dropdowns.
 * Anchors the dropdown to the active element (chip segment, building chip, input
 * or trigger) so it sits flush below the element being interacted with. Falls
 * back to the trigger element's rect, then to the query bar container.
 * @param deps - extra values that force positioning recalculation (e.g. insertIndex)
 */
export const useFilterInputPositioning = (
  { anchorRef, containerRef, getAnchorBounds }: UseFilterInputPositioningProps,
  deps: unknown[] = [],
) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(
    () => ({
      placement: 'bottom-start' as const,
      gutter: 4,
      getAnchorRect: () => {
        const containerEl =
          containerRef?.current ?? anchorRef?.current?.closest<HTMLElement>(QUERY_BAR_SELECTOR);
        const containerRect = containerEl?.getBoundingClientRect();
        if (!containerRect) return null;

        const anchor = getAnchorBounds
          ? getAnchorBounds(containerRect)
          : toAnchorBounds(anchorRef?.current?.getBoundingClientRect() ?? containerRect);

        return buildAnchoredRect(anchor, containerRect);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [anchorRef, containerRef, getAnchorBounds, ...deps],
  );
