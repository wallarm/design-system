import { parseTime } from '@internationalized/date';
import * as z from 'zod';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldIndicator,
  FieldLabel,
} from '@wallarm-org/design-system/Field';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { TimeInput } from '@wallarm-org/design-system/TimeInput';
import { defineComponent, type GenUiViewProps } from '../core/define';
import { NOT_BEFORE_AFTER, rangeError } from '../core/validate';

const time = z.iso.time({ precision: -1 });

const schema = z.object({
  label: z.string(),
  value: time.optional().describe('Bind two-way; a 24-hour time, "14:30"'),
  description: z.string().optional().describe('Help under the field'),
  required: z.boolean().optional(),
  min: time.optional().describe('Earliest time allowed, "HH:MM"'),
  max: time.optional().describe('Latest time allowed, "HH:MM"'),
});

/** "HH:MM" as the DS value, or null for one it can't read. */
const toTime = (iso: string | undefined) => {
  if (!iso) return null;
  try {
    return parseTime(iso);
  } catch {
    return null;
  }
};

/** A named component so React Compiler keeps the parsed value stable between renders. */
const TimeInputView = ({ props, set, error }: GenUiViewProps<z.infer<typeof schema>>) => {
  const { value, min, max } = props;
  return (
    <Field required={props.required ?? false} invalid={!!error}>
      <FieldLabel>
        {props.label}
        {props.required && <FieldIndicator />}
      </FieldLabel>
      <TimeInput
        value={toTime(value)}
        minValue={toTime(min) ?? undefined}
        maxValue={toTime(max) ?? undefined}
        isRequired={props.required}
        error={!!error}
        // The DS writes "HH:MM:SS"; minute granularity, so the seconds are always 00.
        onChange={next => set('value', next?.toString().slice(0, 5))}
      />
      {props.description && <FieldDescription>{props.description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
};

export const TimeInputComponent = defineComponent({
  name: 'TimeInput',
  description:
    'A time of day the user enters, without a date: when a maintenance window opens, a daily report time. Bind value two-way to a path; it holds a 24-hour time like "14:30", and the Button that submits sends that path in its action context.',
  props: schema,
  bindable: ['value'],
  validate: props => rangeError(props, NOT_BEFORE_AFTER),
  Skeleton: () => (
    <VStack gap={4} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='100%' height='32px' transparent={false} />
    </VStack>
  ),
  View: TimeInputView,
});
