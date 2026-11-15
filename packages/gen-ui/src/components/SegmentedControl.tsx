import * as z from 'zod';
import { Field, FieldLabel } from '@wallarm-org/design-system/Field';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@wallarm-org/design-system/SegmentedControl';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent, unique } from '../core/define';

export const SegmentedControlComponent = defineComponent({
  name: 'SegmentedControl',
  description:
    'A compact pick of 2-4 short options shown side by side: a period ("24h", "7d", "30d"), a view mode. Bind value two-way to a path; it holds the chosen option value. Options that need a description are RadioGroup; a longer list is Select; separate sections of content are Tabs.',
  props: z.object({
    label: z.string(),
    options: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .min(2)
      .max(4)
      .refine(unique('value'), 'option values must be unique'),
    value: z.string().optional().describe('Bind two-way; an option value'),
  }),
  bindable: ['value'],
  Skeleton: () => <Skeleton width='200px' height='32px' transparent={false} />,
  View: ({ props, set }) => (
    <Field>
      <FieldLabel>{props.label}</FieldLabel>
      <SegmentedControl
        aria-label={props.label}
        value={props.value ?? ''}
        onChange={value => set('value', value)}
      >
        {props.options.map(option => (
          <SegmentedControlItem key={option.value} value={option.value}>
            {option.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </Field>
  ),
});
