import * as z from 'zod';
import { Field, FieldError, FieldIndicator, FieldLabel } from '@wallarm-org/design-system/Field';
import {
  Radio,
  RadioDescription,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
} from '@wallarm-org/design-system/Radio';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { defineComponent, unique } from '../core/define';
import { REQUIRED } from '../core/validate';

export const RadioGroupComponent = defineComponent({
  name: 'RadioGroup',
  description:
    'One answer from 2-5 options the user should compare at once, each with an optional description: a blocking mode, a retention policy. Bind value two-way to a path; it holds the chosen option value. A longer list or one where the options need no explanation is Select; switching a view is SegmentedControl; a yes/no is Checkbox.',
  props: z.object({
    label: z.string(),
    options: z
      .array(z.object({ value: z.string(), label: z.string(), description: z.string().optional() }))
      .min(2)
      .max(5)
      .refine(unique('value'), 'option values must be unique'),
    value: z.string().optional().describe('Bind two-way; an option value'),
    required: z.boolean().optional(),
  }),
  bindable: ['value'],
  validate: props => (props.required && !props.value ? REQUIRED : undefined),
  Skeleton: () => (
    <VStack gap={8} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='160px' height='20px' transparent={false} />
      <Skeleton width='160px' height='20px' transparent={false} />
    </VStack>
  ),
  View: ({ props, set, error }) => (
    <Field required={props.required ?? false} invalid={!!error}>
      <FieldLabel>
        {props.label}
        {props.required && <FieldIndicator />}
      </FieldLabel>
      <RadioGroup
        aria-label={props.label}
        value={props.value ?? null}
        onValueChange={({ value }) => set('value', value ?? undefined)}
      >
        {props.options.map(option => (
          <Radio key={option.value} value={option.value}>
            <RadioIndicator />
            <RadioLabel>{option.label}</RadioLabel>
            {option.description && <RadioDescription>{option.description}</RadioDescription>}
          </Radio>
        ))}
      </RadioGroup>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  ),
});
