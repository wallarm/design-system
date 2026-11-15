import * as z from 'zod';
import { List, ListItem } from '@wallarm-org/design-system/List';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent } from '../core/define';

export const ListComponent = defineComponent({
  name: 'List',
  description:
    'A list of short plain-text items: findings, recommended steps, affected hosts. ordered: true numbers them, for steps done in sequence.',
  props: z.object({
    items: z.array(z.string()).min(1),
    ordered: z.boolean().optional(),
  }),
  Skeleton: () => (
    <div className='flex flex-col gap-4'>
      <Skeleton width='60%' height='20px' transparent={false} />
      <Skeleton width='45%' height='20px' transparent={false} />
      <Skeleton width='55%' height='20px' transparent={false} />
    </div>
  ),
  View: ({ props }) => (
    <List
      variant={props.ordered ? 'ordered' : 'unordered'}
      marker={props.ordered ? 'decimal' : 'disc'}
    >
      {props.items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: plain strings, duplicates allowed
        <ListItem key={i}>{item}</ListItem>
      ))}
    </List>
  ),
});
