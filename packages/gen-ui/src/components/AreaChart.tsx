import * as z from 'zod';
import {
  AreaChart,
  AreaChartArea,
  AreaChartBody,
  type AreaChartVariant,
  Chart,
  ChartHeader,
  ChartTitle,
  LineChartEmpty,
  LineChartGrid,
  LineChartHoverPopoverDot,
  LineChartLegend,
  LineChartLegendItem,
  LineChartTooltip,
  LineChartXAxis,
  LineChartYAxis,
} from '@wallarm-org/design-system/SimpleCharts';
import { allOf, defineComponent, seriesKey, unique } from '../core/define';
import { formatNumber, formatTime, numberFormat, timeFormat } from '../core/format';
import { ChartSkeleton } from '../render/ChartSkeleton';
import { CHART_COLORS } from './BarList';

const VARIANTS = allOf<AreaChartVariant>()(['stacked', 'standard']);

export const AreaChartComponent = defineComponent({
  name: 'AreaChart',
  description:
    'Volume over time drawn with filled areas: stacked to show how series add up to a total (traffic by verdict), standard to overlay series that should not be summed. ' +
    'series lists the areas; each point is { x: ISO time, <series key>: number }, sorted by x ascending. null means no value for that series at that x.',
  props: z.object({
    title: z.string(),
    variant: z
      .enum(VARIANTS)
      .optional()
      .describe('stacked (default) sums the series; standard overlays them from zero'),
    series: z
      .array(
        z.object({
          key: seriesKey.describe('The field in each point that holds this area’s value'),
          label: z.string(),
          color: z.enum(CHART_COLORS).optional(),
        }),
      )
      .refine(unique('key'), 'series keys must be unique'),
    points: z.array(z.object({ x: z.string() }).catchall(z.number().nullable())),
    xFormat: timeFormat,
    yFormat: numberFormat,
  }),
  Skeleton: ({ title }) => <ChartSkeleton title={title} />,
  View: ({ props }) => {
    const { series, points } = props;
    const formatX = (value: unknown) => formatTime(String(value), props.xFormat);
    const formatY = (value: unknown) =>
      typeof value === 'number' ? formatNumber(value, props.yFormat) : '—';
    return (
      <Chart className='h-full'>
        <ChartHeader>
          <ChartTitle>{props.title}</ChartTitle>
        </ChartHeader>
        {points.length === 0 || series.length === 0 ? (
          <LineChartEmpty>No data</LineChartEmpty>
        ) : (
          <AreaChart data={points} series={series} xKey='x' variant={props.variant}>
            <LineChartLegend>
              {series.map(s => (
                <LineChartLegendItem key={s.key} seriesKey={s.key}>
                  <LineChartHoverPopoverDot color={s.color} />
                  <span className='text-xs font-mono text-text-primary'>{s.label}</span>
                </LineChartLegendItem>
              ))}
            </LineChartLegend>
            <AreaChartBody>
              <LineChartGrid />
              <LineChartXAxis tickFormatter={formatX} density='normal' />
              <LineChartYAxis tickFormatter={formatY} />
              {series.map(s => (
                <AreaChartArea key={s.key} seriesKey={s.key} />
              ))}
              <LineChartTooltip xTickFormatter={formatX} />
            </AreaChartBody>
          </AreaChart>
        )}
      </Chart>
    );
  },
});
