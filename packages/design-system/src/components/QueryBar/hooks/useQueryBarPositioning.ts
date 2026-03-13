import type { RefObject } from 'react';
import { useMemo } from 'react';
import { buildContainerAnchoredRect } from '../lib';

const QUERY_BAR_SELECTOR = '[data-slot="query-bar"]';

interface UseQueryBarPositioningProps {
  /** Ref to the trigger element (used for X anchor and container lookup via closest) */
  anchorRef?: RefObject<HTMLElement | null>;
  /** Explicit container ref (skips closest lookup) */
  containerRef?: RefObject<HTMLElement | null>;
  /** Override horizontal anchor calculation (receives containerRect, returns left px) */
  getAnchorLeft?: (containerRect: DOMRect) => number;
}

/**
 * Shared positioning hook for all QueryBar dropdowns.
 * Anchors vertically to the query bar container and horizontally to the trigger element.
 * @param deps - extra values that force positioning recalculation (e.g. insertIndex)
 */
export const useQueryBarPositioning = (
  { anchorRef, containerRef, getAnchorLeft }: UseQueryBarPositioningProps,
  deps: unknown[] = [],
) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(
    () => ({
      placement: 'bottom-start' as const,
      gutter: 4,
      getAnchorRect: () => {
        const containerEl =
          containerRef?.current ??
          anchorRef?.current?.closest<HTMLElement>(QUERY_BAR_SELECTOR);
        const containerRect = containerEl?.getBoundingClientRect();
        if (!containerRect) return null;

        const left = getAnchorLeft
          ? getAnchorLeft(containerRect)
          : (anchorRef?.current?.getBoundingClientRect().left ?? containerRect.left);

        return buildContainerAnchoredRect(containerRect, left);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [anchorRef, containerRef, getAnchorLeft, ...deps],
  );
