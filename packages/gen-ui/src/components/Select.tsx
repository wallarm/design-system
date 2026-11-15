import * as z from 'zod';
import { Field, FieldIndicator, FieldLabel } from '@wallarm-org/design-system/Field';
import {
  createListCollection,
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '@wallarm-org/design-system/Select';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { defineComponent, unique } from '../core/define';

export const SelectComponent = defineComponent({
  name: 'Select',
  description:
    'One choice from a short list the agent knows: an action, a period, an application. Bind value two-way to a path; it holds the chosen option value.',
  props: z.object({
    label: z.string(),
    options: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .min(1)
      .refine(unique('value'), 'option values must be unique'),
    value: z.string().optional().describe('Bind two-way; an option value'),
    placeholder: z.string().optional(),
    required: z.boolean().optional(),
  }),
  bindable: ['value'],
  Skeleton: () => (
    <VStack gap={4} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='100%' height='32px' transparent={false} />
    </VStack>
  ),
  View: ({ props, set }) => {
    const collection = createListCollection({ items: props.options });
    return (
      <Field required={props.required ?? false}>
        <FieldLabel>
          {props.label}
          {props.required && <FieldIndicator />}
        </FieldLabel>
        <Select
          collection={collection}
          value={props.value === undefined ? [] : [props.value]}
          onValueChange={({ value }) => set('value', value[0])}
        >
          <SelectButton placeholder={props.placeholder} />
          <SelectPositioner>
            <SelectContent>
              {collection.items.map(option => (
                <SelectOption key={option.value} item={option}>
                  <SelectOptionText>{option.label}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </Select>
      </Field>
    );
  },
});
