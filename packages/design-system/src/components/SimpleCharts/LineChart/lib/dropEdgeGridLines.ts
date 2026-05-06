import { createElement, type ReactElement } from 'react';
import type { GridLineTypeFunctionProps } from 'recharts/types/cartesian/CartesianGrid';

// When the topmost grid line sits closer to the chart's top edge than this
// fraction of one tick-to-tick spacing, it visually crowds the chart card's
// inner border and is dropped. A larger residual gap reads as deliberate
// whitespace and the line is kept so callers retain a value-reading rail.
const TOP_LINE_GAP_THRESHOLD = 0.5;

type YAxis = NonNullable<GridLineTypeFunctionProps['yAxis']>;

const collectTickYs = (yAxis: YAxis): number[] => {
  const { scale } = yAxis;
  const tickValues = yAxis.niceTicks ?? yAxis.ticks;
  if (!scale || !tickValues?.length) return [];
  const ys: number[] = [];
  for (const tick of tickValues) {
    const y = scale.map(tick);
    if (typeof y === 'number') ys.push(y);
  }
  ys.sort((a, b) => a - b);
  return ys;
};

// `GridLineType`'s function form declares `ReactElement<SVGElement>` — its
// `P` generic is the DOM element type, not the props shape. `createElement`
// returns `ReactSVGElement` (props = `SVGAttributes<SVGElement>`), so we
// reshape via this helper rather than scatter casts across every return.
const asSvgElement = (el: ReactElement): ReactElement<SVGElement> =>
  el as unknown as ReactElement<SVGElement>;

interface DropEdgeGridLinesOptions {
  /** Keep the topmost horizontal grid line unconditionally. */
  keepTop?: boolean;
  /** Keep the bottommost horizontal grid line unconditionally. */
  keepBottom?: boolean;
}

/**
 * `<CartesianGrid horizontal>` render function that conditionally omits the
 * topmost and bottommost horizontal grid lines.
 *
 * - **Top** — implements the Figma "no top x-line" rule (anatomy node
 *   `7533-3334`). Dropped only when the gap from the chart's top edge to the
 *   topmost grid line is less than {@link TOP_LINE_GAP_THRESHOLD} of one
 *   tick-to-tick spacing; above that ratio the gap reads as deliberate
 *   whitespace and the line stays (useful for axes whose nice-tick max sits
 *   well below the data max).
 * - **Bottom** — dropped unconditionally so the solid X-axis line owns the
 *   bottom rail (otherwise the dashed grid line and the solid axis line stack
 *   on top of each other and read as a double line).
 *
 * Either drop can be suppressed via `keepTop` / `keepBottom` (e.g. when the
 * caller hides the X-axis line and wants the grid to draw the bottom rail).
 *
 * Returning an empty `<g/>` (rather than `null`) keeps the type contract:
 * `GridLineType`'s function form requires a `ReactElement<SVGElement>`.
 */
export const dropEdgeGridLines = ({
  keepTop = false,
  keepBottom = false,
}: DropEdgeGridLinesOptions = {}) => {
  // Per-render cache: `<CartesianGrid horizontal>` invokes this once per grid
  // line, passing the same `yAxis` each time. Without the cache, `collectTickYs`
  // re-iterates and re-sorts the tick array for every line. The cache lives
  // inside the closure, so it dies with the render that created it.
  let cachedYs: number[] | null = null;
  let cachedAxis: YAxis | null = null;

  return (props: GridLineTypeFunctionProps): ReactElement<SVGElement> => {
    const { offset, x1, x2, y1, y2, key, index: _index, yAxis, ...rest } = props;
    const line = asSvgElement(createElement('line', { ...rest, x1, x2, y1, y2 }));

    if (typeof y1 !== 'number' || !yAxis) return line;
    if (cachedAxis !== yAxis) {
      cachedAxis = yAxis;
      cachedYs = collectTickYs(yAxis);
    }
    const ys = cachedYs as number[];

    // `noUncheckedIndexedAccess`: re-prove non-undefined before use.
    const [topY, secondY] = ys;
    const bottomY = ys[ys.length - 1];
    if (topY === undefined || secondY === undefined || bottomY === undefined) return line;
    const spacing = secondY - topY;

    if (!keepBottom && Math.abs(y1 - bottomY) < 0.5) {
      return asSvgElement(createElement('g', { key }));
    }
    if (keepTop || spacing <= 0 || Math.abs(y1 - topY) >= 0.5) return line;
    if (topY - offset.top < spacing * TOP_LINE_GAP_THRESHOLD) {
      return asSvgElement(createElement('g', { key }));
    }
    return line;
  };
};
