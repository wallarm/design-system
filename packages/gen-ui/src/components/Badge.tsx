import * as z from 'zod';
import { Badge, type BadgeColor } from '@wallarm-org/design-system/Badge';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent, subsetOf } from '../core/define';

export const BadgeComponent = defineComponent({
  name: 'Badge',
  description: 'A short status label, e.g. a severity or an attack type.',
  props: z.object({
    text: z.string(),
    color: z.enum(subsetOf<BadgeColor>()(['slate', 'red', 'amber', 'green', 'blue'])).optional(),
  }),
  Skeleton: () => <Skeleton width='64px' height='20px' transparent={false} />,
  View: ({ props }) => (
    <Badge type='secondary' color={props.color ?? 'slate'}>
      {props.text}
    </Badge>
  ),
});
