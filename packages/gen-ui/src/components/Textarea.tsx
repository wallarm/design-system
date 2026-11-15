import * as z from 'zod';
import {
  Field,
  FieldDescription,
  FieldIndicator,
  FieldLabel,
} from '@wallarm-org/design-system/Field';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { Textarea } from '@wallarm-org/design-system/Textarea';
import { defineComponent } from '../core/define';

export const TextareaComponent = defineComponent({
  name: 'Textarea',
  description:
    'A multi-line text field the user fills in: a comment, a reason for a change, a rule body. Use Input for one line. Bind value two-way to a path; the Button that submits sends that path in its action context.',
  props: z.object({
    label: z.string(),
    value: z.string().optional().describe('Bind two-way; a literal is the starting text'),
    placeholder: z.string().optional(),
    description: z.string().optional().describe('Help under the field'),
    required: z.boolean().optional(),
    rows: z.number().int().min(1).max(20).optional().describe('Visible lines'),
  }),
  bindable: ['value'],
  Skeleton: () => (
    <VStack gap={4} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='100%' height='76px' transparent={false} />
    </VStack>
  ),
  View: ({ props, set }) => (
    <Field required={props.required ?? false}>
      <FieldLabel>
        {props.label}
        {props.required && <FieldIndicator />}
      </FieldLabel>
      <Textarea
        value={props.value ?? ''}
        placeholder={props.placeholder}
        minRows={props.rows}
        onChange={event => set('value', event.target.value)}
      />
      {props.description && <FieldDescription>{props.description}</FieldDescription>}
    </Field>
  ),
});
