import { z } from 'zod';
import { Badge, type BadgeColor } from '@wallarm-org/design-system/Badge';
import { defineComponent, subsetOf } from '../define';

export const BadgeComponent = defineComponent({
  name: 'Badge',
  description: 'A short status label, e.g. a severity or an attack type.',
  props: z.object({
    text: z.string(),
    color: z.enum(subsetOf<BadgeColor>()(['slate', 'red', 'amber', 'green', 'blue'])).optional(),
  }),
  View: ({ props }) => (
    <Badge type='secondary' color={props.color ?? 'slate'}>
      {props.text}
    </Badge>
  ),
});
