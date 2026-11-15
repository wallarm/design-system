import * as z from 'zod';
import {
  Checkbox,
  CheckboxDescription,
  CheckboxIndicator,
  CheckboxLabel,
} from '@wallarm-org/design-system/Checkbox';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent } from '../core/define';

export const CheckboxComponent = defineComponent({
  name: 'Checkbox',
  description:
    'A yes/no choice in a form: "also block the subnet", "notify the team". Bind checked two-way to a path; a setting that switches something on is Switch.',
  props: z.object({
    label: z.string(),
    checked: z.boolean().optional().describe('Bind two-way; a literal is the starting state'),
    description: z.string().optional(),
  }),
  bindable: ['checked'],
  Skeleton: () => <Skeleton width='160px' height='20px' transparent={false} />,
  View: ({ props, set }) => (
    <Checkbox
      checked={props.checked ?? false}
      onCheckedChange={({ checked }) => set('checked', checked === true)}
    >
      <CheckboxIndicator />
      <CheckboxLabel>{props.label}</CheckboxLabel>
      {props.description && <CheckboxDescription>{props.description}</CheckboxDescription>}
    </Checkbox>
  ),
});
