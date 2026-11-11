import { type FC, useContext } from 'react';

import { Bar, type BarShapeProps, BarStack, usePlotArea } from 'recharts';

import { useTestId } from '../../../utils/testId';
import { CHART_PALETTE_FILL, resolveChartColor } from '../lib/chartPalette';
import { LineChartActiveContext, LineChartDataContext } from '../LineChart/LineChartContext';
import { COLUMN_INACTIVE_OPACITY, COLUMN_PART_GAP, COLUMN_RADIUS } from './constants';
import { resolveColumnWidth } from './lib/resolveColumnWidth';

interface ColumnChartPartProps extends BarShapeProps {
  seriesKey: string;
  active: boolean;
  dimmed: boolean;
  testId: string | undefined;
}

const ColumnChartPart: FC<ColumnChartPartProps> = ({
  x,
  y,
  width,
  height,
  value,
  fill,
  seriesKey,
  active,
  dimmed,
  testId,
}) => {
  // The 1px gap is cut from the bottom of every part that sits on another one, so the
  // column top and the baseline stay on their real values.
  const base = Array.isArray(value) ? Number(value[0]) : 0;
  const partHeight = height - (base > 0 ? COLUMN_PART_GAP : 0);
  if (!(width > 0) || !(partHeight > 0)) return null;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={partHeight}
      fill={fill}
      opacity={dimmed ? COLUMN_INACTIVE_OPACITY : 1}
      data-slot='column-chart-part'
      data-testid={testId}
      data-key={seriesKey}
      data-active={active ? 'true' : undefined}
    />
  );
};

/**
 * The columns: every `series` entry stacked into one column per datum, in legend order with the
 * first series on top. Mount once inside `<ColumnChartBody>`. Column width follows the step
 * (see `resolveColumnWidth`); hovering a legend item fades the other parts out.
 */
export const ColumnChartStack: FC = () => {
  const dataCtx = useContext(LineChartDataContext);
  const { activeKey } = useContext(LineChartActiveContext);
  // Inner plot rectangle (post-axes) — undefined on the first frame, before recharts measures.
  const plotArea = usePlotArea();
  const testId = useTestId('part');

  if (!dataCtx) return null;

  const steps = dataCtx.data.length;
  const barSize = plotArea && steps > 0 ? resolveColumnWidth(plotArea.width / steps) : undefined;
  // Recharts stacks bottom-up in render order — reverse so the first series lands on top.
  const stacked = [...dataCtx.series].reverse();

  return (
    <BarStack radius={COLUMN_RADIUS}>
      {stacked.map(s => {
        const active = activeKey === s.key;
        const dimmed = activeKey !== null && !active;
        return (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            barSize={barSize}
            fill={resolveChartColor(s.color) ?? CHART_PALETTE_FILL.slate}
            activeBar={false}
            isAnimationActive={false}
            shape={(props: BarShapeProps) => (
              <ColumnChartPart
                {...props}
                seriesKey={s.key}
                active={active}
                dimmed={dimmed}
                testId={testId}
              />
            )}
          />
        );
      })}
    </BarStack>
  );
};

ColumnChartStack.displayName = 'ColumnChartStack';
