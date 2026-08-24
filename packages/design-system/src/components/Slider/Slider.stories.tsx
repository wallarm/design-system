import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { Slider, type SliderProps } from './Slider';
import { SliderControl } from './SliderControl';
import { SliderInput } from './SliderInput';
import { SliderMarks } from './SliderMarks';
import { SliderThumb } from './SliderThumb';
import { SliderValue } from './SliderValue';

const DESCRIPTION = [
  'Sets an approximate, bounded value by dragging along a track — reach for `NumberInput` when the exact figure matters, since a slider is faster to move than it is to land.',
  'A slider should always show its value: pair it with `SliderInput` for entry, or `SliderValue` for a readout.',
].join(' ');

const meta = {
  title: 'Inputs/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
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

/**
 * One handle on a track. Arrow keys move by `step`, Page keys jump further, and Home and End go
 * to the bounds — worth knowing before reaching for a paired input.
 */
export const Basic: StoryFn<SliderProps> = args => (
  <Slider {...args}>
    <SliderControl>
      <SliderThumb aria-label='Value' />
    </SliderControl>
  </Slider>
);

/**
 * Two entries in the value make two thumbs; render one `SliderThumb` per entry. The thumbs
 * cannot cross, so the pair always reads as a valid range.
 */
export const Range: StoryFn<SliderProps> = args => (
  <Slider {...args} defaultValue={[20, 80]}>
    <SliderControl>
      <SliderThumb index={0} />
      <SliderThumb index={1} />
    </SliderControl>
  </Slider>
);

/**
 * `SliderMarks` draws ticks along the scale. Keep `step` aligned to the marks, or the handle
 * lands between them and the ticks stop meaning anything.
 */
export const Ticks: StoryFn<SliderProps> = args => (
  <Slider {...args} step={25} defaultValue={[50]}>
    <SliderControl>
      <SliderThumb aria-label='Volume' />
      <SliderMarks
        marks={[
          { value: 0, label: '0' },
          { value: 25, label: '25' },
          { value: 50, label: '50' },
          { value: 75, label: '75' },
          { value: 100, label: '100' },
        ]}
      />
    </SliderControl>
  </Slider>
);

/**
 * The same marks used purely for orientation, with `step` finer than their spacing. Choose this
 * when the marks are a guide rather than the only valid answers.
 */
export const TicksWithoutSnapping: StoryFn<SliderProps> = args => (
  <Slider {...args} step={1} defaultValue={[40]}>
    <SliderControl>
      <SliderThumb aria-label='Volume' />
      <SliderMarks
        marks={[
          { value: 0, label: '0' },
          { value: 25, label: '25' },
          { value: 50, label: '50' },
          { value: 75, label: '75' },
          { value: 100, label: '100' },
        ]}
      />
    </SliderControl>
  </Slider>
);

/**
 * Marks carrying text, for a scale whose steps are named rather than numeric. The handle snaps
 * to the labelled positions, so this is a choice among rungs rather than a magnitude.
 */
export const Labeled: StoryFn<SliderProps> = args => (
  <Slider {...args} min={0} max={100} step={50} defaultValue={[50]}>
    <SliderControl>
      <SliderThumb aria-label='Risk level' />
      <SliderMarks
        marks={[
          { value: 0, label: 'Low' },
          { value: 50, label: 'Medium' },
          { value: 100, label: 'High' },
        ]}
      />
    </SliderControl>
  </Slider>
);

/**
 * `tooltip` on a `SliderThumb` shows the value while dragging, then hides it. It suits a value
 * only checked mid-gesture; anything needed afterwards wants a persistent readout.
 */
export const WithTooltip: StoryFn<SliderProps> = args => (
  <Slider {...args}>
    <SliderControl>
      <SliderThumb aria-label='Value' tooltip />
    </SliderControl>
  </Slider>
);

/**
 * `SliderInput` is the precision escape hatch: the track for approximate moves, the field for
 * an exact figure. Typing commits on blur or Enter rather than live, so clamping never fights a
 * half-typed number.
 */
export const WithInput: StoryFn<SliderProps> = args => (
  <Slider {...args}>
    <SliderControl>
      <SliderThumb aria-label='Value' />
    </SliderControl>
    <SliderInput />
  </Slider>
);

/**
 * A field at each end, low on the left and high on the right. Neither crosses the other, so the
 * fields cannot produce a range the track could not.
 */
export const RangeWithInput: StoryFn<SliderProps> = args => (
  <Slider {...args} defaultValue={[20, 80]}>
    <SliderInput index={0} />
    <SliderControl>
      <SliderThumb index={0} />
      <SliderThumb index={1} />
    </SliderControl>
    <SliderInput index={1} />
  </Slider>
);

/**
 * The whole control dims and stops responding, handle included. The value stays legible,
 * because a locked setting is usually one the reader still needs to read.
 */
export const Disabled: StoryFn<SliderProps> = args => (
  <Slider {...args} disabled>
    <SliderControl>
      <SliderThumb aria-label='Value' />
    </SliderControl>
  </Slider>
);

/**
 * Wrapped in `Field`, which is the form-field shape. The slider reads that context, so the
 * label and error attach without being passed anything.
 */
export const InField: StoryFn<SliderProps> = args => (
  <Field>
    <FieldLabel>Risk threshold</FieldLabel>
    <Slider {...args}>
      <SliderControl>
        <SliderThumb />
      </SliderControl>
    </Slider>
    <FieldDescription>Approximate — fine-tune the exact value later.</FieldDescription>
  </Field>
);

/**
 * `invalid` on the `Field` cascades to the handle. The message is `FieldError`'s job, and it
 * matters here because a slider cannot show a wrong value the way a text field can.
 */
export const FieldWithError: StoryFn<SliderProps> = args => (
  <Field invalid>
    <FieldLabel>Risk threshold</FieldLabel>
    <Slider {...args}>
      <SliderControl>
        <SliderThumb />
      </SliderControl>
    </Slider>
    <FieldError>Enter a value between 0 and 100.</FieldError>
  </Field>
);

/**
 * The value beside the label, which is the readout Figma draws for a slider in a form — value
 * beside label is the drawn default, not one option among several.
 */
export const FieldWithValue: StoryFn<SliderProps> = args => {
  const [value, setValue] = useState([40]);
  return (
    <Field>
      <div className='flex w-full items-center justify-between'>
        <FieldLabel>Risk threshold</FieldLabel>
        <span className='text-sm font-medium text-text-primary tabular-nums'>{value[0]}</span>
      </div>
      <Slider {...args} value={value} onValueChange={setValue}>
        <SliderControl>
          <SliderThumb />
        </SliderControl>
      </Slider>
    </Field>
  );
};

/**
 * Both ends beside the label, comma-separated. For a range this is the only way to read the
 * value without hovering each thumb.
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
      <Slider {...args} value={value} onValueChange={setValue}>
        <SliderControl>
          <SliderThumb index={0} />
          <SliderThumb index={1} />
        </SliderControl>
      </Slider>
    </Field>
  );
};

/**
 * `SliderValue` reads the slider's own context, so a live readout needs no controlled state of
 * its own.
 */
export const WithValueReadout: StoryFn<SliderProps> = args => (
  <Slider {...args} defaultValue={[60]}>
    <SliderControl>
      <SliderThumb aria-label='Volume' />
    </SliderControl>
    <SliderValue className='w-32 shrink-0 text-right font-medium' />
  </Slider>
);
