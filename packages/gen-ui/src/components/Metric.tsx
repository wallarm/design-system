import { z } from 'zod';
import {
  Chart,
  ChartHeader,
  ChartTitle,
  Metric,
  MetricCaption,
  MetricDelta,
  type MetricDeltaProps,
  MetricHeader,
  MetricSparkline,
  type MetricSparklineColor,
  MetricValue,
} from '@wallarm-org/design-system/SimpleCharts';
import { allOf, defineComponent, type Values } from '../define';
import { formatNumber, numberFormat } from '../format';

const TRENDS = allOf<Values<MetricDeltaProps['trend']>>()(['up', 'down']);
const SPARKLINE_COLORS = allOf<MetricSparklineColor>()([
  'brand',
  'positive',
  'negative',
  'neutral',
]);
const SENTIMENTS = allOf<Values<MetricDeltaProps['sentiment']>>()([
  'positive',
  'negative',
  'neutral',
]);

export const MetricComponent = defineComponent({
  name: 'Metric',
  description:
    'One headline number on a card (a KPI tile), optionally with its change. sentiment is the meaning (an increase in attacks is negative), trend is the arrow. Add sparkline for the trend over the period.',
  props: z.object({
    title: z.string(),
    value: z.number(),
    format: numberFormat,
    caption: z.string().optional(),
    delta: z
      .object({
        value: z.number(),
        trend: z.enum(TRENDS).optional(),
        sentiment: z.enum(SENTIMENTS).optional(),
      })
      .optional(),
    sparkline: z
      .array(z.object({ x: z.string(), y: z.number() }))
      .optional()
      .describe('Trend over the period: points oldest first, x is an ISO time, y the value'),
    sparklineColor: z
      .enum(SPARKLINE_COLORS)
      .optional()
      .describe('Match it to the delta sentiment; brand by default'),
  }),
  View: ({ props }) => (
    <div className='min-w-0 flex-1'>
      <Chart>
        <ChartHeader>
          <ChartTitle>{props.title}</ChartTitle>
        </ChartHeader>
        <Metric>
          <MetricHeader>
            <MetricValue>{formatNumber(props.value, props.format)}</MetricValue>
            {props.delta && <MetricDelta {...props.delta} />}
          </MetricHeader>
          {props.caption && <MetricCaption>{props.caption}</MetricCaption>}
        </Metric>
        {props.sparkline && (
          <MetricSparkline
            data={props.sparkline.map(p => ({ x: p.x, value: p.y }))}
            color={props.sparklineColor}
            label={props.title}
            formatValue={v => formatNumber(v, props.format)}
          />
        )}
      </Chart>
    </div>
  ),
});
