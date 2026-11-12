import { z } from 'zod';
import {
  BarList,
  BarListBar,
  BarListItem,
  BarListLabel,
  BarListPercent,
  BarListSkeleton,
  BarListValue,
  Chart,
  type ChartColor,
  ChartHeader,
  ChartTitle,
} from '@wallarm-org/design-system/SimpleCharts';
import { defineComponent, subsetOf, unique } from '../core/define';
import { formatNumber, numberFormat } from '../core/format';
import { ChartSkeleton } from '../render/ChartSkeleton';

/** The chart palette the catalog offers; shared by every chart entry. */
export const CHART_COLORS = subsetOf<ChartColor>()([
  'brand',
  'blue',
  'green',
  'red',
  'amber',
  'purple',
  'slate',
]);

export const BarListComponent = defineComponent({
  name: 'BarList',
  description: 'A ranked top-N breakdown (endpoints, IPs, attack types). Send rows sorted.',
  props: z.object({
    title: z.string(),
    format: numberFormat,
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
  Skeleton: ({ title }) => (
    <ChartSkeleton title={title}>
      <BarListSkeleton />
    </ChartSkeleton>
  ),
  View: ({ props }) => {
    const { items } = props;
    return (
      <Chart className='h-full'>
        <ChartHeader>
          <ChartTitle>{props.title}</ChartTitle>
        </ChartHeader>
        <BarList max={items.reduce((sum, item) => sum + item.value, 0)}>
          {items.map(item => (
            <BarListItem key={item.label} value={item.value}>
              <BarListBar color={item.color} />
              <BarListLabel>{item.label}</BarListLabel>
              <BarListValue>
                {formatNumber(item.value, props.format)}
                <BarListPercent />
              </BarListValue>
            </BarListItem>
          ))}
        </BarList>
      </Chart>
    );
  },
});
