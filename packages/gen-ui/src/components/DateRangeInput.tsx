import * as z from 'zod';
import { DateRangeInput } from '@wallarm-org/design-system/DateRangeInput';
import {
  Field,
  FieldDescription,
  FieldIndicator,
  FieldLabel,
} from '@wallarm-org/design-system/Field';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { defineComponent, type GenUiViewProps } from '../core/define';
import { toDate } from './DateInput';

const schema = z.object({
  label: z.string(),
  value: z
    .object({ start: z.iso.date().optional(), end: z.iso.date().optional() })
    .optional()
    .describe('Bind two-way; ISO dates, {start: "2026-11-01", end: "2026-11-15"}'),
  description: z.string().optional().describe('Help under the field'),
  required: z.boolean().optional(),
});

/** Both ends as the DS range; the DS shows only a complete one. */
const toRange = (value: z.infer<typeof schema>['value']) => {
  const start = toDate(value?.start);
  const end = toDate(value?.end);
  return start && end ? { start, end } : null;
};

/** A named component so React Compiler keeps the parsed range stable between renders. */
const DateRangeInputView = ({ props, set }: GenUiViewProps<z.infer<typeof schema>>) => (
  <Field required={props.required ?? false}>
    <FieldLabel>
      {props.label}
      {props.required && <FieldIndicator />}
    </FieldLabel>
    <DateRangeInput
      value={toRange(props.value)}
      // The DS reports a range only once both ends are complete, and null after either is cleared.
      onChange={next =>
        set(
          'value',
          next
            ? { start: next.start.toString().slice(0, 10), end: next.end.toString().slice(0, 10) }
            : undefined,
        )
      }
    />
    {props.description && <FieldDescription>{props.description}</FieldDescription>}
  </Field>
);

export const DateRangeInputComponent = defineComponent({
  name: 'DateRangeInput',
  description:
    'A period the user picks by its first and last day: a report window, how far back to look for attacks. Bind value two-way to a path; it holds {start, end} ISO dates like {start: "2026-11-01", end: "2026-11-15"}, and the Button that submits sends that path in its action context.',
  props: schema,
  bindable: ['value'],
  Skeleton: () => (
    <VStack gap={4} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='100%' height='32px' transparent={false} />
    </VStack>
  ),
  View: DateRangeInputView,
});
