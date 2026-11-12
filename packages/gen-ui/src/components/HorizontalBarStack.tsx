import { z } from 'zod';
import {
  Chart,
  ChartHeader,
  ChartTitle,
  HorizontalBarStack,
  MetricDelta,
  type MetricDeltaProps,
  MetricHeader,
  MetricValue,
} from '@wallarm-org/design-system/SimpleCharts';
import { allOf, defineComponent, type Values } from '../define';
import { formatNumber, numberFormat } from '../format';
import { CHART_COLORS } from './BarList';

const TRENDS = allOf<Values<MetricDeltaProps['trend']>>()(['up', 'down']);
const SENTIMENTS = allOf<Values<MetricDeltaProps['sentiment']>>()([
  'positive',
  'negative',
  'neutral',
]);

export const HorizontalBarStackComponent = defineComponent({
  name: 'HorizontalBarStack',
  description:
    'One total split into a few named parts in a single 100% bar with a legend (incidents by severity, traffic by verdict). Use 2-6 parts; for a ranked list where each part needs its own row use BarList. value is the optional headline number above the bar; total > sum of parts leaves a grey remainder.',
  props: z.object({
    title: z.string(),
    value: z.number().optional(),
    format: numberFormat,
    delta: z
      .object({
        value: z.number(),
        trend: z.enum(TRENDS).optional(),
        sentiment: z.enum(SENTIMENTS).optional(),
      })
      .optional(),
    total: z.number().optional(),
    legend: z.boolean().optional(),
    items: z.array(
      z.object({
        name: z.string(),
        value: z.number(),
        color: z.enum(CHART_COLORS).optional(),
      }),
    ),
  }),
  View: ({ props }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{props.title}</ChartTitle>
      </ChartHeader>
      <HorizontalBarStack
        // A binding resolves to undefined until its data arrives.
        data={props.items ?? []}
        total={props.total}
        legend={props.legend}
      >
        {props.value !== undefined && (
          <MetricHeader>
            <MetricValue>{formatNumber(props.value, props.format)}</MetricValue>
            {props.delta && <MetricDelta {...props.delta} />}
          </MetricHeader>
        )}
      </HorizontalBarStack>
    </Chart>
  ),
});
