import * as z from 'zod';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import {
  Switch,
  SwitchControl,
  SwitchDescription,
  SwitchLabel,
} from '@wallarm-org/design-system/Switch';
import { defineComponent } from '../core/define';

export const SwitchComponent = defineComponent({
  name: 'Switch',
  description:
    'An on/off setting that takes effect when submitted: a mode, a trigger, a notification. Bind checked two-way to a path; for a yes/no answer in a form use Checkbox.',
  props: z.object({
    label: z.string(),
    checked: z.boolean().optional().describe('Bind two-way; a literal is the starting state'),
    description: z.string().optional(),
  }),
  bindable: ['checked'],
  Skeleton: () => <Skeleton width='160px' height='20px' transparent={false} />,
  View: ({ props, set }) => (
    <Switch
      checked={props.checked ?? false}
      onCheckedChange={({ checked }) => set('checked', checked)}
    >
      <SwitchControl />
      <SwitchLabel>{props.label}</SwitchLabel>
      {props.description && <SwitchDescription>{props.description}</SwitchDescription>}
    </Switch>
  ),
});
