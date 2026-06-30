import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { Slider, type SliderProps } from './Slider';
import { SliderControl } from './SliderControl';
import { SliderInput } from './SliderInput';
import { SliderMarks } from './SliderMarks';
import { SliderThumb } from './SliderThumb';
import { SliderValue } from './SliderValue';

const meta = {
  title: 'Inputs/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pick an approximate, bounded value — or a range — by dragging a handle along a track. Built on `@ark-ui/react/slider`. A lean compound: the root owns the machine, and you compose `SliderControl` (renders the track + range) with one `SliderThumb` per thumb (the real interactive node — consumer `data-*` / analytics / `ref` land there). Add `SliderMarks` for ticks, `tooltip` on a `SliderThumb` for an on-drag bubble, `SliderInput` for inline numeric entry, and `SliderValue` for a live readout. Single vs range is driven by the value length (`[n]` vs `[low, high]`); render one thumb per entry. Reads `Field` context, so wrapping it in `<Field>` is the "Slider input" form field (no bundled wrapper).',
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
export const Basic: StoryFn<SliderProps> = args => (
  <Slider {...args}>
    <SliderControl>
      <SliderThumb aria-label='Value' />
    </SliderControl>
  </Slider>
);

/**
 * Range — a 2-element value renders two thumbs (Figma `Double`). Render one
 * `SliderThumb` per thumb; they never cross (`thumbCollisionBehavior='none'`) and default
 * to `Minimum` / `Maximum` for screen readers. Pass `minStepsBetweenThumbs` to enforce a
 * gap. Each thumb carries its own `data-*` / analytics, so a range attributes its low and
 * high handles independently.
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
 * Discrete with ticks — `SliderMarks` places ticks along the scale. Align `step` to the
 * mark spacing so drag and arrow-keys snap onto the ticks; click a tick to jump the
 * nearest thumb to it.
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
 * Ticks as reference marks, without snapping — the same marks render for orientation, but
 * `step={1}` lets the thumb stop anywhere in between (here it starts at `40`, between the
 * 25 and 50 ticks). Use when the ticks are a visual guide rather than the only allowed
 * values. Clicking a tick still jumps to it.
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
 * Labeled / ordinal scale — marks carry text labels. The thumb snaps to mark positions
 * and announces the label (`aria-valuetext`) instead of the raw number. Set `step` so each
 * step lands on a mark.
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
 * On-drag tooltip — `tooltip` on a `SliderThumb` shows a value bubble above the handle
 * while dragging. Mutually exclusive with a persistent value readout.
 */
export const WithTooltip: StoryFn<SliderProps> = args => (
  <Slider {...args}>
    <SliderControl>
      <SliderThumb aria-label='Value' tooltip />
    </SliderControl>
  </Slider>
);

/**
 * Paired input — the precision escape hatch. `SliderInput` is an inline numbers-only
 * `Input` (a plain box, no stepper); typing updates the slider live and clamps to
 * `[min, max]`; dragging updates the input. The root lays the input out beside the control.
 */
export const WithInput: StoryFn<SliderProps> = args => (
  <Slider {...args}>
    <SliderControl>
      <SliderThumb aria-label='Value' />
    </SliderControl>
    <SliderInput />
  </Slider>
);

/** Range with two inputs — min on the left, max on the right; neither crosses. */
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

/** Disabled — the whole control renders at 50% opacity and is non-interactive. */
export const Disabled: StoryFn<SliderProps> = args => (
  <Slider {...args} disabled>
    <SliderControl>
      <SliderThumb aria-label='Value' />
    </SliderControl>
  </Slider>
);

/**
 * In a `<Field>` — the "Slider input". Same composition order as every other DS input:
 * label on top → control → description below. The Slider reads Field context, so
 * `FieldLabel` names the thumb (`aria-labelledby`) and `invalid` / `disabled` cascade. No
 * bundled wrapper — pure composition.
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
 * Field error — `invalid` on the `<Field>` cascades to the Slider (danger handle border)
 * and the `FieldError` message renders below the control (same field order as the rest of
 * the forms family).
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
 * Value beside the label (Figma `Label value`) — the persistent value readout. Controlled,
 * rendered in the label row. Mutually exclusive with the on-drag `tooltip` — never both.
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
 * Range value beside the label — both ends shown, comma-separated (`{low}, {high}`),
 * updating live as either thumb moves (Figma `Label value` for `double`). Controlled.
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
 * `SliderValue` part — a live readout that reads the slider context (no controlled state
 * needed just to display). Single shows the number; a range shows `low – high`; ordinal
 * scales show the mark label. The root is a horizontal row, so `SliderValue` sits to the
 * right of the track (like `SliderInput`, but read-only).
 */
export const WithValueReadout: StoryFn<SliderProps> = args => (
  <Slider {...args} defaultValue={[60]}>
    <SliderControl>
      <SliderThumb aria-label='Volume' />
    </SliderControl>
    <SliderValue className='w-32 shrink-0 text-right font-medium' />
  </Slider>
);
