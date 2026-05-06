import { useEffect } from 'react';

/**
 * Window-level drag follower. While `enabled` is `true` the chart's zoom drag
 * is in progress: mousemove updates the cursor coordinates, mouseup releases
 * into the pending state, Escape cancels outright. Listeners live on `window`
 * rather than the chart body so the popover keeps tracking when the cursor
 * leaves the SVG and a release outside the chart still commits.
 *
 * Pulled out of `<LineChart>` so the keyboard contract has a single source of
 * truth that can be tested in isolation.
 */
export const useZoomDragListeners = ({
  enabled,
  onMove,
  onEnd,
  onEscape,
}: {
  enabled: boolean;
  onMove: (clientX: number, clientY: number) => void;
  onEnd: () => void;
  onEscape: () => void;
}): void => {
  useEffect(() => {
    if (!enabled) return;
    const handleMove = (event: MouseEvent) => onMove(event.clientX, event.clientY);
    const handleUp = () => onEnd();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onEscape();
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('keydown', handleKey);
    };
  }, [enabled, onMove, onEnd, onEscape]);
};
