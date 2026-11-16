import * as z from 'zod';
import {
  Field,
  FieldDescription,
  FieldIndicator,
  FieldLabel,
} from '@wallarm-org/design-system/Field';
import { Input } from '@wallarm-org/design-system/Input';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { defineComponent } from '../core/define';

export const InputComponent = defineComponent({
  name: 'Input',
  description:
    'A one-line text field the user fills in: an IP, a host, a rule name. Bind value two-way to a path; the Button that submits sends that path in its action context.',
  props: z.object({
    label: z.string(),
    value: z.string().optional().describe('Bind two-way; a literal is the starting text'),
    placeholder: z.string().optional(),
    description: z.string().optional().describe('Help under the field'),
    required: z.boolean().optional(),
  }),
  bindable: ['value'],
  Skeleton: () => (
    <VStack gap={4} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='100%' height='32px' transparent={false} />
    </VStack>
  ),
  View: ({ props, set }) => (
    <Field required={props.required ?? false}>
      <FieldLabel>
        {props.label}
        {props.required && <FieldIndicator />}
      </FieldLabel>
      <Input
        value={props.value ?? ''}
        placeholder={props.placeholder}
        autoComplete='off'
        onChange={event => set('value', event.target.value)}
      />
      {props.description && <FieldDescription>{props.description}</FieldDescription>}
    </Field>
  ),
});
