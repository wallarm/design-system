import * as z from 'zod';
import {
  Chart,
  ChartHeader,
  ChartTitle,
  ColumnChart,
  ColumnChartBody,
  ColumnChartStack,
  ColumnChartXAxis,
  type LineChartDatum,
  LineChartEmpty,
  LineChartGrid,
  LineChartHoverPopover,
  LineChartHoverPopoverDot,
  LineChartHoverPopoverRow,
  LineChartHoverPopoverTimestamp,
  LineChartLegend,
  LineChartLegendItem,
  LineChartTooltip,
  type LineChartTooltipRenderArgs,
  LineChartYAxis,
} from '@wallarm-org/design-system/SimpleCharts';
import { defineComponent, seriesKey, unique } from '../core/define';
import { formatNumber, formatTime, numberFormat, timeFormat } from '../core/format';
import { ChartSkeleton } from '../render/ChartSkeleton';
import { CHART_COLORS } from './BarList';

// Each datum's x is its point index, under a key no series can take: the DS warns when x is not
// ascending, and category labels rarely sort alphabetically. The axis maps the index back to x.
const X_KEY = '__x';

export const ColumnChartComponent = defineComponent({
  name: 'ColumnChart',
  description:
    'Vertical columns, one per time bucket or category (attacks per hour, requests per day), each split into its series stacked with the first series on top; one series gives plain columns. ' +
    'series lists the stacks; each point is { x: ISO time or category label, <series key>: number }, sorted by x. ' +
    'A missing or null value counts as 0. Set xFormat when x is an ISO time; leave it out for category labels.',
  props: z.object({
    title: z.string(),
    series: z
      .array(
        z.object({
          key: seriesKey.describe('The field in each point that holds this series’ value'),
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
    const formatX = (index: unknown) => {
      const x = points[Number(index)]?.x ?? '';
      return props.xFormat ? formatTime(x, props.xFormat) : x;
    };
    const formatValue = (value: unknown) => formatNumber(Number(value ?? 0), props.yFormat);
    const valueAt = (point: (typeof points)[number], key: string) => {
      const value = point[key];
      return typeof value === 'number' ? value : 0;
    };
    const data = points.map((point, index) => {
      const datum: LineChartDatum = { [X_KEY]: index };
      for (const s of series) datum[s.key] = valueAt(point, s.key);
      return datum;
    });
    const renderTooltip = ({ rows, xValue }: LineChartTooltipRenderArgs) => (
      <LineChartHoverPopover>
        <LineChartHoverPopoverTimestamp>{formatX(xValue)}</LineChartHoverPopoverTimestamp>
        {rows.map(row => (
          <LineChartHoverPopoverRow
            key={row.series.key}
            series={row.series}
            value={formatValue(row.value)}
          />
        ))}
      </LineChartHoverPopover>
    );
    return (
      <div className='h-full min-w-0 flex-1'>
        <Chart className='h-full'>
          <ChartHeader>
            <ChartTitle>{props.title}</ChartTitle>
          </ChartHeader>
          <ColumnChart data={data} series={series} xKey={X_KEY}>
            <LineChartLegend>
              {series.map(s => (
                <LineChartLegendItem key={s.key} seriesKey={s.key}>
                  <LineChartHoverPopoverDot color={s.color} />
                  <span className='text-xs font-mono text-text-primary'>{s.label}</span>
                  <span className='text-xs font-mono font-medium text-text-primary'>
                    {formatValue(points.reduce((sum, p) => sum + valueAt(p, s.key), 0))}
                  </span>
                </LineChartLegendItem>
              ))}
            </LineChartLegend>
            {data.length === 0 ? (
              <LineChartEmpty>No data</LineChartEmpty>
            ) : (
              <ColumnChartBody>
                <LineChartGrid />
                <ColumnChartXAxis tickFormatter={formatX} />
                <LineChartYAxis tickFormatter={formatValue} />
                <ColumnChartStack />
                <LineChartTooltip>{renderTooltip}</LineChartTooltip>
              </ColumnChartBody>
            )}
          </ColumnChart>
        </Chart>
      </div>
    );
  },
});
