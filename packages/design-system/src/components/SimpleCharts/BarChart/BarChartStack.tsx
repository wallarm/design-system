import { type FC, useContext } from 'react';
import { Bar, type BarShapeProps, BarStack } from 'recharts';
import { useTestId } from '../../../utils/testId';
import { LineChartActiveContext, LineChartDataContext } from '../LineChart/LineChartContext';
import { CHART_PALETTE_FILL, resolveChartColor } from '../lib/chartPalette';
import { BAR_INACTIVE_OPACITY, BAR_PART_GAP, BAR_RADIUS, BAR_THICKNESS } from './constants';

interface BarChartPartProps extends BarShapeProps {
  seriesKey: string;
  active: boolean;
  dimmed: boolean;
  testId: string | undefined;
}

const BarChartPart: FC<BarChartPartProps> = ({
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
  // The 1px gap is cut from the left of every part that sits after another one, so the
  // bar end and the axis stay on their real values.
  const base = Array.isArray(value) ? Number(value[0]) : 0;
  const gap = base > 0 ? BAR_PART_GAP : 0;
  const partWidth = width - gap;
  if (!(height > 0) || !(partWidth > 0)) return null;
  return (
    <rect
      x={x + gap}
      y={y}
      width={partWidth}
      height={height}
      fill={fill}
      opacity={dimmed ? BAR_INACTIVE_OPACITY : 1}
      data-slot='bar-chart-part'
      data-testid={testId}
      data-key={seriesKey}
      data-active={active ? 'true' : undefined}
    />
  );
};

/**
 * The bars: every `series` entry stacked into one bar per datum, in legend order from the left —
 * the first series starts the bar. Mount once inside `<BarChartBody>`. Hovering a
 * legend item fades the other parts out.
 */
export const BarChartStack: FC = () => {
  const dataCtx = useContext(LineChartDataContext);
  const { activeKey } = useContext(LineChartActiveContext);
  const testId = useTestId('part');

  if (!dataCtx) return null;

  return (
    <BarStack radius={BAR_RADIUS}>
      {dataCtx.series.map(s => {
        const active = activeKey === s.key;
        const dimmed = activeKey !== null && !active;
        return (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            barSize={BAR_THICKNESS}
            fill={resolveChartColor(s.color) ?? CHART_PALETTE_FILL.slate}
            activeBar={false}
            isAnimationActive={false}
            shape={(props: BarShapeProps) => (
              <BarChartPart
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

BarChartStack.displayName = 'BarChartStack';
