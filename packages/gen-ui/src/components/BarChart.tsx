import * as z from 'zod';
import {
  BarChart,
  BarChartBody,
  BarChartEmpty,
  BarChartStack,
  BarChartTooltip,
  type BarChartTooltipRenderArgs,
  BarChartXAxis,
  BarChartYAxis,
  Chart,
  ChartHeader,
  ChartTitle,
  type LineChartDatum,
  LineChartHoverPopover,
  LineChartHoverPopoverDot,
  LineChartHoverPopoverRow,
  LineChartHoverPopoverTimestamp,
  LineChartLegend,
  LineChartLegendItem,
} from '@wallarm-org/design-system/SimpleCharts';
import { defineComponent, seriesKey, unique } from '../core/define';
import { formatNumber, numberFormat } from '../core/format';
import { ChartSkeleton } from '../render/ChartSkeleton';
import { CHART_COLORS } from './BarList';

// The category label, under a key no series can take.
const CATEGORY_KEY = '__category';

// The label column follows the longest label: 7.2px a character at the row's 12px mono font,
// plus the 12px gap to the bar. Past 240px the label is cut and the popover shows it in full.
const LABEL_CHAR_WIDTH = 7.2;
const LABEL_GAP = 12;
const MIN_LABEL_WIDTH = 96;
const MAX_LABEL_WIDTH = 240;

const labelWidthFor = (labels: readonly string[]) => {
  const longest = labels.reduce((max, label) => Math.max(max, label.length), 0);
  return Math.min(
    MAX_LABEL_WIDTH,
    Math.max(MIN_LABEL_WIDTH, Math.ceil(longest * LABEL_CHAR_WIDTH) + LABEL_GAP),
  );
};

export const BarChartComponent = defineComponent({
  name: 'BarChart',
  description:
    'Horizontal bars, one per category (attacks per application, requests per host, findings per endpoint), each split into its series stacked left to right in series order and ending with the row total; one series gives plain bars. ' +
    'Pick it over ColumnChart when the categories are not time and their labels are long. ' +
    'series lists the stacks; each point is { x: category label, <series key>: number }, listed top to bottom in the order to show (usually largest total first). ' +
    'A missing or null value counts as 0.',
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
    format: numberFormat,
  }),
  Skeleton: ({ title }) => <ChartSkeleton title={title} />,
  View: ({ props }) => {
    const { series, points } = props;
    const formatValue = (value: unknown) => formatNumber(Number(value ?? 0), props.format);
    const valueAt = (point: (typeof points)[number], key: string) => {
      const value = point[key];
      return typeof value === 'number' ? value : 0;
    };
    const data = points.map(point => {
      const datum: LineChartDatum = { [CATEGORY_KEY]: point.x };
      for (const s of series) datum[s.key] = valueAt(point, s.key);
      return datum;
    });
    const renderTooltip = ({ rows, category }: BarChartTooltipRenderArgs) => (
      <LineChartHoverPopover>
        <LineChartHoverPopoverTimestamp>{String(category)}</LineChartHoverPopoverTimestamp>
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
          <BarChart data={data} series={series} yKey={CATEGORY_KEY}>
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
              <BarChartEmpty>No data</BarChartEmpty>
            ) : (
              <BarChartBody>
                <BarChartXAxis hide />
                <BarChartYAxis
                  width={labelWidthFor(points.map(p => p.x))}
                  totalFormatter={formatValue}
                />
                <BarChartStack />
                <BarChartTooltip>{renderTooltip}</BarChartTooltip>
              </BarChartBody>
            )}
          </BarChart>
        </Chart>
      </div>
    );
  },
});
