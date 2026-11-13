import { type FC, useContext, useEffect, useId } from 'react';
import { DefaultZIndexes, ZIndexLayer } from 'recharts';
import { useTestId } from '../../../utils/testId';
import { useRangeEdges } from './hooks/useRangeEdges';
import { LineChartDataContext, LineChartRangeContext } from './LineChartContext';
import { layoutRangeLabels, type RangeX, rangeDataProblem } from './lib/rangeGeometry';
import { warnLineChartRange } from './lib/warn';

const LABEL_GAP = 4;
const LABEL_TOP = 4;
const LABEL_FONT_SIZE = 10;
// ponytail: char-count width estimate for 10px medium text; switch to getComputedTextLength if
// labels with wide glyphs get clipped or hidden too eagerly.
const LABEL_CHAR_WIDTH = 5.5;

const estimateWidth = (label: string | number | undefined): number =>
  label === undefined ? 0 : String(label).length * LABEL_CHAR_WIDTH;

export interface LineChartRangeProps {
  /** Range start, an `xKey` value. At or before the first datum the range clamps to the plot's left edge. */
  from: number | string;
  /** Range end, an `xKey` value. Omitted = ongoing (runs to the plot's right edge). */
  to?: number | string;
  /** Series recoloured inside the range. Omitted = nothing is recoloured. */
  seriesKey?: string;
  /**
   * Label outside the start edge (SVG text, so plain text only). Hidden when it would not fit or
   * 2+ ranges are visible.
   */
  startLabel?: string | number;
  /** Label outside the end edge. An ongoing range defaults to `"Ongoing"`, drawn inside the range. */
  endLabel?: string | number;
  /** Screen-reader text, listed in a visually hidden list on the chart root. */
  description?: string;
}

/**
 * Highlights an X range of the chart (an attack spike, an incident window): danger fill, dashed
 * edges and optional edge labels, above the grid and under the lines. Edges between two data
 * points are interpolated, so the range does not snap to buckets. Mount inside `<LineChartBody>`.
 */
export const LineChartRange: FC<LineChartRangeProps> = ({
  from,
  to,
  seriesKey,
  startLabel,
  endLabel,
  description,
}) => {
  const key = useId();
  const { ranges, registerRange } = useContext(LineChartRangeContext);
  const testId = useTestId('range');
  const startLabelTestId = useTestId('range-start-label');
  const endLabelTestId = useTestId('range-end-label');
  const geometry = useRangeEdges();
  const dataCtx = useContext(LineChartDataContext);
  const problem = dataCtx
    ? rangeDataProblem({ from, to }, dataCtx.data.map(d => d[dataCtx.xKey]) as RangeX[])
    : null;

  useEffect(
    () => registerRange({ key, from, to, seriesKey, description }),
    [registerRange, key, from, to, seriesKey, description],
  );

  useEffect(() => {
    if (problem) warnLineChartRange(`not drawn: ${problem}.`, { from, to });
  }, [problem, from, to]);

  if (!geometry) return null;

  const { edgesOf, plotArea } = geometry;
  const plotLeft = plotArea.x;
  const plotRight = plotArea.x + plotArea.width;

  const edges = edgesOf({ from, to });
  if (!edges) return null;

  const ongoing = to === undefined;
  const end = endLabel ?? (ongoing ? 'Ongoing' : undefined);
  const labels = layoutRangeLabels({
    edges,
    ongoing,
    visibleRangeCount: ranges.filter(range => edgesOf(range) !== null).length,
    startWidth: estimateWidth(startLabel),
    endWidth: estimateWidth(end),
    plotLeft,
    plotRight,
    gap: LABEL_GAP,
  });

  const top = plotArea.y;
  const bottom = plotArea.y + plotArea.height;
  const labelProps = {
    y: top + LABEL_TOP,
    dominantBaseline: 'hanging',
    fill: 'var(--color-text-danger)',
    fontSize: LABEL_FONT_SIZE,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
  } as const;
  const edgeProps = {
    y1: top,
    y2: bottom,
    stroke: 'var(--color-border-danger)',
    strokeWidth: 1,
    strokeDasharray: '3 3',
  } as const;

  return (
    <ZIndexLayer zIndex={DefaultZIndexes.area}>
      <g data-slot='line-chart-range' data-testid={testId} data-key={key}>
        <rect
          x={edges.x1}
          y={top}
          width={Math.max(0, edges.x2 - edges.x1)}
          height={plotArea.height}
          fill='var(--color-states-danger-hover)'
        />
        <line x1={edges.x1} x2={edges.x1} {...edgeProps} />
        <line x1={edges.x2} x2={edges.x2} {...edgeProps} />
        {startLabel != null && labels.start ? (
          <text
            {...labelProps}
            x={labels.start.x}
            textAnchor={labels.start.anchor}
            data-testid={startLabelTestId}
          >
            {startLabel}
          </text>
        ) : null}
        {end != null && labels.end ? (
          <text
            {...labelProps}
            x={labels.end.x}
            textAnchor={labels.end.anchor}
            data-testid={endLabelTestId}
          >
            {end}
          </text>
        ) : null}
      </g>
    </ZIndexLayer>
  );
};

LineChartRange.displayName = 'LineChartRange';
