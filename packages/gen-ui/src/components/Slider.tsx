import * as z from 'zod';
import { Field, FieldDescription, FieldLabel } from '@wallarm-org/design-system/Field';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import {
  Slider,
  SliderControl,
  SliderMarks,
  SliderThumb,
  SliderValue,
} from '@wallarm-org/design-system/Slider';
import { HStack, VStack } from '@wallarm-org/design-system/Stack';
import { defineComponent, unique } from '../core/define';

export const SliderComponent = defineComponent({
  name: 'Slider',
  description:
    'A number on a bounded scale where the position matters more than the exact figure: a sensitivity, a percentage, a risk level. Use NumberInput for an exact count or limit. Bind value two-way to a path; it holds a number. Marks label points on the scale (Low, Medium, High); set step so the handle snaps onto them.',
  props: z.object({
    label: z.string(),
    value: z.number().optional().describe('Bind two-way; a literal is the starting position'),
    min: z.number().optional().describe('Default 0'),
    max: z.number().optional().describe('Default 100'),
    step: z.number().positive().optional().describe('Default 1'),
    showValue: z.boolean().optional().describe('Show the current value beside the label'),
    marks: z
      .array(z.object({ value: z.number(), label: z.string().optional() }))
      .refine(unique('value'), 'mark values must be unique')
      .optional(),
    description: z.string().optional().describe('Help under the field'),
  }),
  bindable: ['value'],
  Skeleton: () => (
    <VStack gap={4} align='stretch' fullWidth>
      <Skeleton width='120px' height='16px' transparent={false} />
      <Skeleton width='100%' height='16px' transparent={false} />
    </VStack>
  ),
  View: ({ props, set }) => {
    const min = props.min ?? 0;
    return (
      <Field>
        <Slider
          value={[props.value ?? min]}
          min={min}
          max={props.max ?? 100}
          step={props.step ?? 1}
          onValueChange={([next]) => next !== undefined && set('value', next)}
        >
          <HStack justify='between' fullWidth>
            <FieldLabel>{props.label}</FieldLabel>
            {props.showValue && <SliderValue />}
          </HStack>
          <SliderControl>
            <SliderThumb />
            {props.marks && <SliderMarks marks={props.marks} />}
          </SliderControl>
        </Slider>
        {props.description && <FieldDescription>{props.description}</FieldDescription>}
      </Field>
    );
  },
});
