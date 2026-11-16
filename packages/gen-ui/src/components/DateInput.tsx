import { parseDate } from '@internationalized/date';
import * as z from 'zod';
import { DateInput } from '@wallarm-org/design-system/DateInput';
import {
  Field,
  FieldDescription,
  FieldIndicator,
  FieldLabel,
} from '@wallarm-org/design-system/Field';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { defineComponent, type GenUiViewProps } from '../core/define';

const schema = z.object({
  label: z.string(),
  value: z.iso.date().optional().describe('Bind two-way; an ISO date, "2026-11-15"'),
  description: z.string().optional().describe('Help under the field'),
  required: z.boolean().optional(),
  min: z.iso.date().optional().describe('Earliest date allowed, ISO'),
  max: z.iso.date().optional().describe('Latest date allowed, ISO'),
});

/** An ISO date as the DS value, or null for one it can't read. */
export const toDate = (iso: string | undefined) => {
  if (!iso) return null;
  try {
    return parseDate(iso);
  } catch {
    return null;
  }
};

/** A named component so React Compiler keeps the parsed value stable between renders. */
const DateInputView = ({ props, set }: GenUiViewProps<z.infer<typeof schema>>) => {
  const { value, min, max } = props;
  const outOfRange = !!value && ((!!min && value < min) || (!!max && value > max));
  return (
    <Field required={props.required ?? false}>
      <FieldLabel>
        {props.label}
        {props.required && <FieldIndicator />}
      </FieldLabel>
      <DateInput
        value={toDate(value)}
        minValue={toDate(min) ?? undefined}
        maxValue={toDate(max) ?? undefined}
        isRequired={props.required}
        error={outOfRange}
        // ISO strings compare in date order; `slice` drops a time part the DS may add.
        onChange={next => set('value', next?.toString().slice(0, 10))}
      />
      {props.description && <FieldDescription>{props.description}</FieldDescription>}
    </Field>
  );
};

export const DateInputComponent = defineComponent({
  name: 'DateInput',
  description:
    'A calendar date the user enters: when a rule starts, a report day. Bind value two-way to a path; it holds an ISO date like "2026-11-15", and the Button that submits sends that path in its action context.',
  props: schema,
  bindable: ['value'],
  Skeleton: () => (
    <VStack gap={4} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='100%' height='32px' transparent={false} />
    </VStack>
  ),
  View: DateInputView,
});
