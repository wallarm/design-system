import { useState } from 'react';
import * as z from 'zod';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldIndicator,
  FieldLabel,
} from '@wallarm-org/design-system/Field';
import { NumberInput } from '@wallarm-org/design-system/NumberInput';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { defineComponent } from '../core/define';
import { rangeError } from '../core/validate';

/** What a field's text means on the path: a number, or nothing while it is empty or half-typed. */
const numberOf = (text: string) => {
  const value = Number.parseFloat(text);
  return text.trim() === '' || Number.isNaN(value) ? undefined : value;
};

export const NumberInputComponent = defineComponent({
  name: 'NumberInput',
  description:
    'An exact number the user sets: a rate limit in requests per minute, a threshold, a count. Use Slider when a rough position on a scale is enough. Bind value two-way to a path; it holds a number, or nothing while the field is empty.',
  props: z.object({
    label: z.string(),
    value: z.number().optional().describe('Bind two-way; a literal is the starting number'),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().positive().optional(),
    description: z.string().optional().describe('Help under the field'),
    required: z.boolean().optional(),
  }),
  bindable: ['value'],
  validate: props => rangeError(props),
  Skeleton: () => (
    <VStack gap={4} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='100%' height='32px' transparent={false} />
    </VStack>
  ),
  View: ({ props, set, error }) => {
    // The typed text stays while it means the bound number ("-", "1." mid-typing); a new value
    // from the app replaces it.
    const [text, setText] = useState('');
    const shown =
      numberOf(text) === props.value ? text : props.value === undefined ? '' : String(props.value);
    return (
      <Field required={props.required ?? false} invalid={!!error}>
        <FieldLabel>
          {props.label}
          {props.required && <FieldIndicator />}
        </FieldLabel>
        <NumberInput
          value={shown}
          min={props.min}
          max={props.max}
          step={props.step}
          onValueChange={({ value }) => {
            setText(value);
            set('value', numberOf(value));
          }}
        />
        {props.description && <FieldDescription>{props.description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
});
