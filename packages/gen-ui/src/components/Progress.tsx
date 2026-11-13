import * as z from 'zod';
import { Progress, type ProgressProps } from '@wallarm-org/design-system/Progress';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { Text } from '@wallarm-org/design-system/Text';
import { allOf, defineComponent, subsetOf, type Values } from '../core/define';

const COLORS = subsetOf<Values<ProgressProps['color']>>()([
  'brand',
  'slate',
  'red',
  'amber',
  'green',
  'blue',
]);
const SIZES = allOf<Values<ProgressProps['size']>>()(['xs', 'sm', 'md', 'lg']);

export const ProgressComponent = defineComponent({
  name: 'Progress',
  description:
    'One ratio toward a max: quota used, rollout or scan progress, coverage. For several categories use BarList or HorizontalBarStack.',
  props: z.object({
    // Required, so a binding whose data hasn't arrived shows the skeleton.
    value: z.number().min(0).describe('Current amount, 0..max'),
    max: z.number().positive().optional().describe('Default 100'),
    label: z.string().optional().describe('Caption above the bar'),
    showValue: z.boolean().optional().describe('Print the percent next to the bar'),
    color: z
      .enum(COLORS)
      .optional()
      .describe('Default brand; red/amber for a quota near its limit'),
    size: z.enum(SIZES).optional().describe('Bar thickness, default xs'),
  }),
  Skeleton: () => (
    <VStack gap={4} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='100%' height='8px' transparent={false} />
    </VStack>
  ),
  View: ({ props }) => {
    const max = props.max ?? 100;
    const value = Math.min(props.value, max);
    return (
      <VStack gap={4} align='stretch' fullWidth>
        {props.label && <Text color='secondary'>{props.label}</Text>}
        <Progress
          value={value}
          max={max}
          color={props.color ?? 'brand'}
          size={props.size ?? 'xs'}
          showLabel={props.showValue ?? false}
        />
      </VStack>
    );
  },
});
