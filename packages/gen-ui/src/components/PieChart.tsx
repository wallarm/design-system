import { z } from 'zod';
import {
  Chart,
  ChartHeader,
  ChartTitle,
  LegendDot,
  PieChart,
  PieChartCenter,
  PieChartCenterLabel,
  PieChartCenterValue,
  type PieChartDatum,
  PieChartDonut,
  PieChartLegend,
  PieChartLegendItem,
  PieChartLegendPercent,
  PieChartLegendValue,
} from '@wallarm-org/design-system/SimpleCharts';
import { defineComponent, unique } from '../define';
import { formatNumber, numberFormat } from '../format';
import { CHART_COLORS } from './BarList';

export const PieChartComponent = defineComponent({
  name: 'PieChart',
  description:
    'A donut with a legend for the share of a whole (attack types, response status codes, traffic sources) where the parts add up to a meaningful total; 2-6 slices read best. Use BarList instead to compare magnitudes or rank many rows. items: unique labels, values are counts (percents are computed). centerLabel names the total in the middle, e.g. "requests".',
  props: z.object({
    title: z.string(),
    format: numberFormat,
    centerLabel: z.string().optional(),
    items: z
      .array(
        z.object({
          label: z.string(),
          value: z.number(),
          color: z.enum(CHART_COLORS).optional(),
        }),
      )
      .refine(unique('label'), 'labels must be unique'),
  }),
  View: ({ props }) => {
    // A binding resolves to undefined until its data arrives.
    const items = props.items ?? [];
    const data: PieChartDatum[] = items.map(item => ({
      name: item.label,
      value: item.value,
      color: item.color,
    }));
    const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0); // DS coerces negatives to 0
    const formatHovered = (datum: PieChartDatum) => formatNumber(datum.value, props.format);
    return (
      <Chart>
        <ChartHeader>
          <ChartTitle>{props.title}</ChartTitle>
        </ChartHeader>
        <PieChart data={data}>
          <PieChartDonut>
            <PieChartCenter>
              <PieChartCenterValue formatHoveredValue={formatHovered}>
                {formatNumber(total, props.format)}
              </PieChartCenterValue>
              {props.centerLabel && (
                <PieChartCenterLabel className='whitespace-nowrap'>
                  {props.centerLabel}
                </PieChartCenterLabel>
              )}
            </PieChartCenter>
          </PieChartDonut>
          <PieChartLegend>
            {items.map(item => (
              <PieChartLegendItem key={item.label} name={item.label}>
                <span className='min-w-0 flex-1 truncate text-xs text-text-primary'>
                  {item.label}
                </span>
                <PieChartLegendValue>
                  {formatNumber(item.value, props.format)}
                  <LegendDot />
                  <PieChartLegendPercent />
                </PieChartLegendValue>
              </PieChartLegendItem>
            ))}
          </PieChartLegend>
        </PieChart>
      </Chart>
    );
  },
});
