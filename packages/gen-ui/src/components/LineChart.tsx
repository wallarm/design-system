import * as z from 'zod';
import {
  Chart,
  ChartHeader,
  ChartTitle,
  LineChart,
  LineChartBody,
  LineChartEmpty,
  LineChartGrid,
  LineChartHoverPopover,
  LineChartHoverPopoverDot,
  LineChartHoverPopoverRow,
  LineChartHoverPopoverTimestamp,
  LineChartLegend,
  LineChartLegendItem,
  LineChartLine,
  type LineChartSeries,
  LineChartTooltip,
  type LineChartTooltipRenderArgs,
  LineChartXAxis,
  LineChartYAxis,
} from '@wallarm-org/design-system/SimpleCharts';
import { allOf, defineComponent, seriesKey, unique, type Values } from '../core/define';
import { formatNumber, formatTime, numberFormat, timeFormat } from '../core/format';
import { ChartSkeleton } from '../render/ChartSkeleton';
import { CHART_COLORS } from './BarList';

const VARIANTS = allOf<Values<LineChartSeries['variant']>>()(['solid', 'dashed']);

export const LineChartComponent = defineComponent({
  name: 'LineChart',
  description:
    'A time series: one or more lines over time (requests per hour, attacks per day). ' +
    'series lists the lines; each point is { x: ISO time, <series key>: number }, sorted by x ascending. ' +
    'A missing or null value leaves a gap. Use BarList for a ranking, Metric for a single number.',
  props: z.object({
    title: z.string(),
    series: z
      .array(
        z.object({
          key: seriesKey.describe('The field in each point that holds this line’s value'),
          label: z.string(),
          color: z.enum(CHART_COLORS).optional(),
          variant: z.enum(VARIANTS).optional().describe('dashed for a baseline or forecast'),
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
    const tooltip = ({ rows, xValue }: LineChartTooltipRenderArgs) => (
      <LineChartHoverPopover>
        <LineChartHoverPopoverTimestamp>{formatX(xValue)}</LineChartHoverPopoverTimestamp>
        {rows.map(row => (
          <LineChartHoverPopoverRow
            key={row.series.key}
            series={row.series}
            value={row.value}
            formatValue={formatY}
          />
        ))}
      </LineChartHoverPopover>
    );
    return (
      <Chart className='h-full'>
        <ChartHeader>
          <ChartTitle>{props.title}</ChartTitle>
        </ChartHeader>
        {points.length === 0 || series.length === 0 ? (
          <LineChartEmpty>No data</LineChartEmpty>
        ) : (
          <LineChart data={points} series={series} xKey='x'>
            {series.length > 1 && (
              <LineChartLegend>
                {series.map(s => (
                  <LineChartLegendItem key={s.key} seriesKey={s.key}>
                    <LineChartHoverPopoverDot color={s.color} />
                    <span className='font-mono text-xs text-text-primary'>{s.label}</span>
                  </LineChartLegendItem>
                ))}
              </LineChartLegend>
            )}
            <LineChartBody>
              <LineChartGrid />
              <LineChartXAxis tickFormatter={formatX} density='normal' />
              <LineChartYAxis tickFormatter={formatY} />
              {series.map(s => (
                <LineChartLine key={s.key} seriesKey={s.key} />
              ))}
              <LineChartTooltip>{tooltip}</LineChartTooltip>
            </LineChartBody>
          </LineChart>
        )}
      </Chart>
    );
  },
});
