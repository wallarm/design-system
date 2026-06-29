import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { Slider, type SliderProps } from './Slider';

const meta = {
  title: 'Inputs/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pick an approximate, bounded value — or a range — by dragging a handle along a track. Built on `@ark-ui/react/slider`. Single vs range is driven by the value length (`[n]` vs `[low, high]`); `marks` add ticks/labels, `tooltip` shows an on-drag bubble, and `input` pairs it with an inline numbers-only `Input`. Reads `Field` context, so wrapping it in `<Field>` is the "Slider input" form field (no bundled wrapper).',
      },
    },
  },
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    error: false,
  },
  argTypes: {
    defaultValue: { control: 'object' },
    value: { control: 'object' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    error: { control: 'boolean' },
    onValueChange: { control: false },
    onValueChangeEnd: { control: false },
    ref: { control: false },
  },
  decorators: [
    Story => (
      <div style={{ width: 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;

/** Default single-value control — drag the handle or use arrow / Home / End / Page keys. */
export const Basic: StoryFn<SliderProps> = args => <Slider aria-label='Value' {...args} />;

/**
 * Range — a 2-element value renders two thumbs (Figma `Double`). The thumbs
 * never cross (`thumbCollisionBehavior='none'`) and are labelled
 * `Minimum` / `Maximum` for screen readers. Pass `minStepsBetweenThumbs` to
 * enforce a gap between them.
 */
export const Range: StoryFn<SliderProps> = args => <Slider {...args} defaultValue={[20, 80]} />;

/**
 * Discrete with ticks — `marks` place ticks along the scale. Align `step` to the
 * mark spacing so drag and arrow-keys snap onto the ticks; click a tick to jump
 * the nearest thumb to it.
 */
export const Ticks: StoryFn<SliderProps> = args => (
  <Slider
    aria-label='Volume'
    {...args}
    step={25}
    defaultValue={[50]}
    marks={[
      { value: 0, label: '0' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
      { value: 75, label: '75' },
      { value: 100, label: '100' },
    ]}
  />
);

/**
 * Ticks as reference marks, without snapping — the same `marks` render for
 * orientation, but `step={1}` lets the thumb stop anywhere in between (here it
 * starts at `40`, between the 25 and 50 ticks). Use when the ticks are a visual
 * guide rather than the only allowed values. Clicking a tick still jumps to it.
 */
export const TicksWithoutSnapping: StoryFn<SliderProps> = args => (
  <Slider
    aria-label='Volume'
    {...args}
    step={1}
    defaultValue={[40]}
    marks={[
      { value: 0, label: '0' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
      { value: 75, label: '75' },
      { value: 100, label: '100' },
    ]}
  />
);

/**
 * Labeled / ordinal scale — marks carry text labels. The thumb snaps to mark
 * positions and announces the label (`aria-valuetext`) instead of the raw
 * number. Set `step` so each step lands on a mark.
 */
export const Labeled: StoryFn<SliderProps> = args => (
  <Slider
    aria-label='Risk level'
    {...args}
    min={0}
    max={100}
    step={50}
    defaultValue={[50]}
    marks={[
      { value: 0, label: 'Low' },
      { value: 50, label: 'Medium' },
      { value: 100, label: 'High' },
    ]}
  />
);

/**
 * On-drag tooltip — a value bubble appears above the thumb while dragging or
 * keyboard-focusing. Mutually exclusive with a persistent value readout.
 */
export const WithTooltip: StoryFn<SliderProps> = args => (
  <Slider aria-label='Value' {...args} tooltip />
);

/**
 * Paired input — the precision escape hatch. An inline numbers-only `Input` (a
 * plain box, no stepper); typing updates the slider live and clamps to
 * `[min, max]`; dragging updates the input.
 */
export const WithInput: StoryFn<SliderProps> = args => (
  <Slider aria-label='Value' {...args} input />
);

/** Range with two inputs — min on the left, max on the right; neither crosses. */
export const RangeWithInput: StoryFn<SliderProps> = args => (
  <Slider {...args} defaultValue={[20, 80]} input />
);

/** Disabled — the whole control renders at 50% opacity and is non-interactive. */
export const Disabled: StoryFn<SliderProps> = args => (
  <Slider aria-label='Value' {...args} disabled />
);

/**
 * In a `<Field>` — the "Slider input". Same composition order as every other DS
 * input: label on top → control → description below. The Slider reads Field
 * context, so `FieldLabel` names the thumb (`aria-labelledby`) and
 * `invalid` / `disabled` cascade. No bundled wrapper — pure composition.
 */
export const InField: StoryFn<SliderProps> = args => (
  <Field>
    <FieldLabel>Risk threshold</FieldLabel>
    <Slider {...args} />
    <FieldDescription>Approximate — fine-tune the exact value later.</FieldDescription>
  </Field>
);

/**
 * Field error — `invalid` on the `<Field>` cascades to the Slider (danger handle
 * border) and the `FieldError` message renders below the control, in the
 * description's place (same field order as the rest of the forms family).
 */
export const FieldWithError: StoryFn<SliderProps> = args => (
  <Field invalid>
    <FieldLabel>Risk threshold</FieldLabel>
    <Slider {...args} />
    <FieldError>Enter a value between 0 and 100.</FieldError>
  </Field>
);

/**
 * Value beside the label (Figma `Label value`) — the persistent value readout.
 * Controlled, rendered in the label row. Mutually exclusive with the on-drag
 * `tooltip` — never show both.
 */
export const FieldWithValue: StoryFn<SliderProps> = args => {
  const [value, setValue] = useState([40]);
  return (
    <Field>
      <div className='flex w-full items-center justify-between'>
        <FieldLabel>Risk threshold</FieldLabel>
        <span className='text-sm font-medium text-text-primary tabular-nums'>{value[0]}</span>
      </div>
      <Slider {...args} value={value} onValueChange={setValue} />
    </Field>
  );
};

/**
 * Range value beside the label — both ends shown, comma-separated
 * (`{low}, {high}`, e.g. `20, 80`), updating live as either thumb moves (Figma
 * `Label value` for `double`). Controlled.
 */
export const RangeFieldWithValue: StoryFn<SliderProps> = args => {
  const [value, setValue] = useState([20, 80]);
  return (
    <Field>
      <div className='flex w-full items-center justify-between'>
        <FieldLabel>Risk range</FieldLabel>
        <span className='text-sm font-medium text-text-primary tabular-nums'>
          {value.join(', ')}
        </span>
      </div>
      <Slider {...args} value={value} onValueChange={setValue} />
    </Field>
  );
};
