import {
  type FC,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';

/** Pins recharts' tooltip wrapper to the chart's top-left corner — the anchor's origin. */
export const CHART_TOOLTIP_ORIGIN = { x: 0, y: 0 };

/** recharts' default tooltip offset from the hovered point. */
const OFFSET = 10;
/** Minimum gap between the popover and the viewport edge. */
const VIEWPORT_MARGIN = 8;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ChartTooltipFloatProps {
  /** Hovered point in chart coordinates (recharts' tooltip `coordinate`). */
  coordinate?: { x?: number; y?: number };
  /** The plot rectangle in chart coordinates — the popover prefers to stay over it. */
  plot?: Box;
  /** Vertical centre of the popover in chart coordinates. Omit to open beside the point. */
  centerY?: number;
  children: ReactNode;
}

// recharts' placement along one axis: after the point, or before it when that would overflow
// the plot — but never before the plot start.
const place = (point: number, size: number, start: number, length: number) => {
  const after = point + OFFSET;
  return after + size > start + length
    ? Math.max(point - OFFSET - size, start)
    : Math.max(after, start);
};

const clamp = (value: number, size: number, viewport: number) =>
  Math.max(VIEWPORT_MARGIN, Math.min(value, viewport - size - VIEWPORT_MARGIN));

/**
 * A chart's hover popover, lifted out of the card. Render it as the recharts `Tooltip` content
 * with `position={CHART_TOOLTIP_ORIGIN}`: a 1px anchor stays inside the plot to locate the chart,
 * and the popover is portalled to `body` as a fixed layer. A card's `overflow-clip` (or any
 * clipping ancestor) would otherwise cut a popover taller or wider than the plot.
 */
export const ChartTooltipFloat: FC<ChartTooltipFloatProps> = ({
  coordinate,
  plot,
  centerY,
  children,
}) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  // The fixed popover can't follow a scroll or resize on its own — re-measure on either.
  const [, remeasure] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    window.addEventListener('scroll', remeasure, { capture: true, passive: true });
    window.addEventListener('resize', remeasure);
    return () => {
      window.removeEventListener('scroll', remeasure, { capture: true });
      window.removeEventListener('resize', remeasure);
    };
  }, []);

  // recharts dismisses its tooltip on Escape by hiding its own wrapper, which the portalled
  // popover is not inside — mirror it: hidden at this point until the pointer moves on.
  const pointKey = `${coordinate?.x},${coordinate?.y}`;
  const [dismissedAt, setDismissedAt] = useState<string | null>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissedAt(pointKey);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pointKey]);

  // No deps: the popover's size and the hovered point change on every recharts frame.
  useLayoutEffect(() => {
    const anchor = anchorRef.current?.getBoundingClientRect();
    const floating = floatingRef.current?.getBoundingClientRect();
    if (!anchor || !floating || coordinate?.x == null || !plot) return;

    const x = place(coordinate.x, floating.width, plot.x, plot.width);
    const y =
      centerY !== undefined
        ? centerY - floating.height / 2
        : place(coordinate.y ?? 0, floating.height, plot.y, plot.height);
    const left = clamp(anchor.left + x, floating.width, window.innerWidth);
    const top = clamp(anchor.top + y, floating.height, window.innerHeight);

    setPosition(prev => (prev?.left === left && prev.top === top ? prev : { left, top }));
  });

  return (
    <>
      <span ref={anchorRef} className='block size-px' />
      {createPortal(
        <div
          ref={floatingRef}
          className={cn(
            'pointer-events-none fixed top-0 left-0 z-(--tooltip-z-index)',
            (!position || dismissedAt === pointKey) && 'invisible',
          )}
          style={position ?? undefined}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
};

ChartTooltipFloat.displayName = 'ChartTooltipFloat';
