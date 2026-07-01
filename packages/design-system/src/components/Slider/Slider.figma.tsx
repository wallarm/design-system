import figma from '@figma/code-connect';
import { Field, FieldLabel } from '../Field';
import { Slider } from './Slider';
import { SliderControl } from './SliderControl';
import { SliderInput } from './SliderInput';
import { SliderMarks } from './SliderMarks';
import { SliderThumb } from './SliderThumb';

// WADS Components → Slider page. The Figma component exposes Double / Ticks /
// Input variant toggles; in code range is driven by a 2-element value (one
// SliderThumb per thumb) and ticks by SliderMarks (see Slider.llm.md), so those
// map to tailored compound examples per variant rather than to props.
const SLIDER_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11354-181';
const SLIDER_INPUT_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11358-1807';

// Single value (default variant).
figma.connect(Slider, SLIDER_URL, {
  example: () => (
    <Slider aria-label='Value' defaultValue={[50]}>
      <SliderControl>
        <SliderThumb aria-label='Value' />
      </SliderControl>
    </Slider>
  ),
});

// Range — Double=On. Two thumbs come from a 2-element value (no `double` prop).
figma.connect(Slider, SLIDER_URL, {
  variant: { Double: 'On' },
  example: () => (
    <Slider defaultValue={[20, 80]}>
      <SliderControl>
        <SliderThumb index={0} />
        <SliderThumb index={1} />
      </SliderControl>
    </Slider>
  ),
});

// Discrete / ticks — Ticks=On. Ticks come from SliderMarks plus a matching `step`.
figma.connect(Slider, SLIDER_URL, {
  variant: { Ticks: 'On' },
  example: () => (
    <Slider aria-label='Value' step={25} defaultValue={[50]}>
      <SliderControl>
        <SliderThumb aria-label='Value' />
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
  ),
});

// Input variant — On = inline SliderInput beside the control.
figma.connect(Slider, SLIDER_URL, {
  variant: { Input: 'On' },
  example: () => (
    <Slider aria-label='Value' defaultValue={[50]}>
      <SliderControl>
        <SliderThumb aria-label='Value' />
      </SliderControl>
      <SliderInput />
    </Slider>
  ),
});

// The "Slider input" field — Slider reads Field context, so the field is the
// standard Field composition (no bundled wrapper component).
figma.connect(Slider, SLIDER_INPUT_URL, {
  example: () => (
    <Field>
      <FieldLabel>Risk threshold</FieldLabel>
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderThumb />
        </SliderControl>
      </Slider>
    </Field>
  ),
});
