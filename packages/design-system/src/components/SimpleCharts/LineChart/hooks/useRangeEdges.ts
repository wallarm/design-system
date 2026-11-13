import { useContext } from 'react';
import { usePlotArea, useXAxisScale } from 'recharts';
import { LineChartDataContext } from '../LineChartContext';
import { type RangeEdges, type RangeX, resolveRangeEdges } from '../lib/rangeGeometry';

type PlotArea = NonNullable<ReturnType<typeof usePlotArea>>;

/**
 * Pixel edges of a range on the current chart. The range fill and the in-range line clip both
 * use this, so the line switches colour at exactly the fill's edge. `null` until recharts has
 * measured the plot.
 */
export const useRangeEdges = (): {
  edgesOf: (range: { from: RangeX; to?: RangeX }) => RangeEdges | null;
  plotArea: PlotArea;
} | null => {
  const dataCtx = useContext(LineChartDataContext);
  const scale = useXAxisScale();
  const plotArea = usePlotArea();
  if (!dataCtx || !scale || !plotArea) return null;

  const xs = dataCtx.data.map(datum => datum[dataCtx.xKey]) as RangeX[];
  const edgesOf = (range: { from: RangeX; to?: RangeX }) =>
    resolveRangeEdges({
      from: range.from,
      to: range.to,
      xs,
      pixelOf: index => scale(xs[index], { position: 'middle' }),
      plotLeft: plotArea.x,
      plotRight: plotArea.x + plotArea.width,
    });
  return { edgesOf, plotArea };
};
