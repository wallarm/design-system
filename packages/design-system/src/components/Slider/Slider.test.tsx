import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Field, FieldLabel } from '../Field';
import { Slider } from './Slider';
import { SliderControl } from './SliderControl';
import { SliderInput } from './SliderInput';
import { SliderMarks } from './SliderMarks';
import { SliderThumb } from './SliderThumb';
import { SliderValue } from './SliderValue';

const MARKS = [
  { value: 0, label: 'Low' },
  { value: 50, label: 'Medium' },
  { value: 100, label: 'High' },
];

// Ark renders each thumb as `[role="slider"]`, but keeps it `visibility:hidden`
// until it can measure layout — which never happens under jsdom. So we locate
// thumbs by `data-slot` (visibility-agnostic) rather than `getByRole`, matching
// the repo convention for Ark-based components (see NumberInput.test.tsx).
const getThumbs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="slider-thumb"]'));

const Single = (props: ComponentProps<typeof Slider>) => (
  <Slider {...props}>
    <SliderControl>
      <SliderThumb aria-label='Value' />
    </SliderControl>
  </Slider>
);

const Range = (props: ComponentProps<typeof Slider>) => (
  <Slider defaultValue={[20, 80]} {...props}>
    <SliderControl>
      <SliderThumb index={0} />
      <SliderThumb index={1} />
    </SliderControl>
  </Slider>
);

describe('Slider — rendering & value model', () => {
  it('renders a single thumb (role="slider") for a 1-entry value', () => {
    const { container } = render(<Single defaultValue={[50]} />);
    const thumbs = getThumbs(container);
    expect(thumbs).toHaveLength(1);
    expect(thumbs[0]).toHaveAttribute('role', 'slider');
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '50');
  });

  it('accepts a custom aria-label as a string on the thumb', () => {
    const { container } = render(
      <Slider defaultValue={[40]}>
        <SliderControl>
          <SliderThumb aria-label='Brightness' />
        </SliderControl>
      </Slider>,
    );
    expect(getThumbs(container)[0]).toHaveAttribute('aria-label', 'Brightness');
  });
});

describe('Slider — states', () => {
  it('marks the root disabled (data-disabled)', () => {
    render(<Single disabled data-testid='s' />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-disabled');
  });

  it('maps error → invalid (data-invalid) on the root', () => {
    render(<Single error data-testid='s' />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-invalid');
  });
});

describe('Slider — Field context', () => {
  it('inherits invalid from a wrapping <Field invalid>', () => {
    render(
      <Field invalid>
        <FieldLabel>Risk</FieldLabel>
        <Slider data-testid='s'>
          <SliderControl>
            <SliderThumb />
          </SliderControl>
        </Slider>
      </Field>,
    );
    expect(screen.getByTestId('s')).toHaveAttribute('data-invalid');
  });

  it('inherits disabled from a wrapping <Field disabled>', () => {
    render(
      <Field disabled>
        <FieldLabel>Risk</FieldLabel>
        <Slider data-testid='s'>
          <SliderControl>
            <SliderThumb />
          </SliderControl>
        </Slider>
      </Field>,
    );
    expect(screen.getByTestId('s')).toHaveAttribute('data-disabled');
  });

  it('is labelled by the FieldLabel via aria-labelledby (single, no explicit label)', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Risk threshold</FieldLabel>
        <Slider>
          <SliderControl>
            <SliderThumb />
          </SliderControl>
        </Slider>
      </Field>,
    );
    const labelledBy = getThumbs(container)[0].getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toHaveTextContent('Risk threshold');
  });
});

describe('Slider — range', () => {
  it('renders two thumbs defaulting to Minimum / Maximum labels', () => {
    const { container } = render(<Range />);
    const thumbs = getThumbs(container);
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Minimum');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Maximum');
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '20');
    expect(thumbs[1]).toHaveAttribute('aria-valuenow', '80');
  });

  it('clamps range thumbs so they cannot cross', () => {
    const { container } = render(<Range />);
    const [low, high] = getThumbs(container);
    expect(low).toHaveAttribute('aria-valuemax', '80');
    expect(high).toHaveAttribute('aria-valuemin', '20');
  });

  it('accepts per-thumb aria-labels', () => {
    const { container } = render(
      <Slider defaultValue={[10, 90]}>
        <SliderControl>
          <SliderThumb index={0} aria-label='Floor' />
          <SliderThumb index={1} aria-label='Ceiling' />
        </SliderControl>
      </Slider>,
    );
    const thumbs = getThumbs(container);
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Floor');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Ceiling');
  });
});

describe('Slider — analytics pass-through (each thumb is the real node, CG-1 closed)', () => {
  it('forwards a distinct data-analytics-id to each range thumb', () => {
    const { container } = render(
      <Slider defaultValue={[20, 80]} data-testid='s'>
        <SliderControl>
          <SliderThumb index={0} data-analytics-id='PRICE_MIN' />
          <SliderThumb index={1} data-analytics-id='PRICE_MAX' />
        </SliderControl>
      </Slider>,
    );
    const thumbs = getThumbs(container);
    expect(thumbs[0]).toHaveAttribute('role', 'slider');
    expect(thumbs[0]).toHaveAttribute('data-analytics-id', 'PRICE_MIN');
    expect(thumbs[1]).toHaveAttribute('data-analytics-id', 'PRICE_MAX');
    // The Ark Root wrapper must NOT strand the id (the gap NumberInput has).
    expect(screen.getByTestId('s')).not.toHaveAttribute('data-analytics-id');
  });

  it('forwards data-analytics-props byte-for-byte to the thumb', () => {
    const payload = '{"feature":"risk","unit":"score"}';
    const { container } = render(
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderThumb aria-label='Risk' data-analytics-id='RISK' data-analytics-props={payload} />
        </SliderControl>
      </Slider>,
    );
    expect(getThumbs(container)[0]).toHaveAttribute('data-analytics-props', payload);
  });

  it('resolves a thumb click to its analytics-id via closest()', () => {
    const captured = captureAnalyticsClicks();
    const { container } = render(
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderThumb aria-label='Risk' data-analytics-id='RISK_THRESHOLD' />
        </SliderControl>
      </Slider>,
    );
    // fireEvent (not userEvent) so the visibility:hidden thumb still dispatches.
    fireEvent.click(getThumbs(container)[0]);
    expect(captured).toHaveBeenCalledWith('RISK_THRESHOLD');
  });
});

describe('Slider — data-testid cascade', () => {
  it('derives the single thumb id as `{base}--thumb`', () => {
    const { container } = render(<Single data-testid='risk' />);
    expect(getThumbs(container)[0]).toHaveAttribute('data-testid', 'risk--thumb');
  });

  it('derives indexed thumb ids for a range (`{base}--thumb-0/1`)', () => {
    const { container } = render(<Range data-testid='price' />);
    const thumbs = getThumbs(container);
    expect(thumbs[0]).toHaveAttribute('data-testid', 'price--thumb-0');
    expect(thumbs[1]).toHaveAttribute('data-testid', 'price--thumb-1');
  });

  it('stays clean (no derived ids) when no data-testid is passed', () => {
    const { container } = render(<Single />);
    expect(getThumbs(container)[0]).not.toHaveAttribute('data-testid');
  });
});

describe('Slider — marks / ordinal scale', () => {
  it('renders a tick + label per mark', () => {
    const { container } = render(
      <Slider defaultValue={[50]} min={0} max={100} step={50}>
        <SliderControl>
          <SliderThumb aria-label='Volume' />
          <SliderMarks marks={MARKS} />
        </SliderControl>
      </Slider>,
    );
    const markers = container.querySelectorAll('[data-slot="slider-marker"]');
    expect(markers).toHaveLength(3);
    expect(markers[1]).toHaveTextContent('Medium');
  });

  it('announces the mark label as aria-valuetext instead of the number', () => {
    const { container } = render(
      <Slider defaultValue={[50]} min={0} max={100} step={50}>
        <SliderControl>
          <SliderThumb aria-label='Risk level' />
          <SliderMarks marks={MARKS} />
        </SliderControl>
      </Slider>,
    );
    expect(getThumbs(container)[0]).toHaveAttribute('aria-valuetext', 'Medium');
  });

  it('wires each marker as a clickable tick (click-to-jump value change is E2E-only)', () => {
    // Ark's slider value machine needs real layout rects, so value mutation via
    // setThumbValue is inert under jsdom — verified to be E2E territory (see
    // Slider.e2e.ts "Should jump the nearest thumb when a tick label is clicked").
    // Here we only assert the markers render as interactive targets.
    render(
      <Slider defaultValue={[50]} min={0} max={100} step={50}>
        <SliderControl>
          <SliderThumb aria-label='Risk level' />
          <SliderMarks marks={MARKS} />
        </SliderControl>
      </Slider>,
    );
    const high = screen.getByText('High');
    expect(high).toHaveAttribute('data-slot', 'slider-marker');
    expect(() => fireEvent.click(high)).not.toThrow();
  });
});

describe('Slider — thumb tooltip', () => {
  it('renders a thumb with the tooltip affordance enabled', () => {
    // The bubble opens only on api.dragging, which jsdom can't drive (Ark's value/drag
    // machine needs real layout); we assert the thumb still renders as the real control
    // with tooltip enabled. Open-on-drag is verified visually via the WithTooltip story.
    const { container } = render(
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderThumb aria-label='Value' tooltip />
        </SliderControl>
      </Slider>,
    );
    expect(getThumbs(container)[0]).toHaveAttribute('role', 'slider');
  });
});

describe('Slider — inline SliderInput', () => {
  const getInputBoxes = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLInputElement>('input[data-slot="input"]'));

  it('gives the two range inputs distinct, non-empty ids', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Price range</FieldLabel>
        <Slider defaultValue={[20, 80]}>
          <SliderInput index={0} />
          <SliderControl>
            <SliderThumb index={0} />
            <SliderThumb index={1} />
          </SliderControl>
          <SliderInput index={1} />
        </Slider>
      </Field>,
    );
    const ids = getInputBoxes(container).map(input => input.id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBeTruthy();
    expect(ids[1]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('keeps the FieldLabel naming the thumb, not the input box', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Risk threshold</FieldLabel>
        <Slider defaultValue={[50]}>
          <SliderControl>
            <SliderThumb />
          </SliderControl>
          <SliderInput />
        </Slider>
      </Field>,
    );
    const labelledBy = getThumbs(container)[0].getAttribute('aria-labelledby');
    expect(document.getElementById(labelledBy as string)).toHaveTextContent('Risk threshold');
    const [box] = getInputBoxes(container);
    expect(box).toHaveAttribute('aria-label', 'Value');
    expect(box.id).toBeTruthy();
  });

  it('reflects the current thumb value in the box', () => {
    const { container } = render(
      <Slider defaultValue={[42]}>
        <SliderControl>
          <SliderThumb aria-label='Value' />
        </SliderControl>
        <SliderInput />
      </Slider>,
    );
    expect(getInputBoxes(container)[0]).toHaveValue('42');
  });

  it('inherits disabled from a wrapping <Field disabled>', () => {
    const { container } = render(
      <Field disabled>
        <FieldLabel>Risk</FieldLabel>
        <Slider defaultValue={[50]}>
          <SliderControl>
            <SliderThumb />
          </SliderControl>
          <SliderInput />
        </Slider>
      </Field>,
    );
    expect(getInputBoxes(container)[0]).toBeDisabled();
  });
});

describe('Slider — SliderValue readout', () => {
  it('shows a single value', () => {
    render(
      <Slider defaultValue={[42]}>
        <SliderControl>
          <SliderThumb aria-label='V' />
        </SliderControl>
        <SliderValue />
      </Slider>,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows both ends of a range joined by an en-dash', () => {
    render(
      <Slider defaultValue={[20, 80]}>
        <SliderControl>
          <SliderThumb index={0} />
          <SliderThumb index={1} />
        </SliderControl>
        <SliderValue />
      </Slider>,
    );
    expect(screen.getByText('20 – 80')).toBeInTheDocument();
  });

  it('shows the ordinal mark label for the current value', () => {
    // The tick label is also "Medium", so scope to the readout slot to disambiguate.
    const { container } = render(
      <Slider defaultValue={[50]} min={0} max={100} step={50}>
        <SliderControl>
          <SliderThumb aria-label='Risk' />
          <SliderMarks marks={MARKS} />
        </SliderControl>
        <SliderValue />
      </Slider>,
    );
    expect(container.querySelector('[data-slot="slider-value"]')).toHaveTextContent('Medium');
  });
});

describe('Slider — accessible naming (no dangling aria-labelledby)', () => {
  // Ark/zag injects a fallback aria-labelledby pointing at a Label element this DS never
  // renders; the thumb must override it so the name resolves (or falls to aria-label).
  const labelledbyIsSafe = (thumb: HTMLElement) => {
    const lb = thumb.getAttribute('aria-labelledby');
    // safe = absent, empty, or resolves to a real element — never a non-empty dangling ref.
    return lb === null || lb === '' || document.getElementById(lb) !== null;
  };

  it('names a bare single thumb (no Field, no explicit label) without a dangling ref', () => {
    const { container } = render(
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderThumb />
        </SliderControl>
      </Slider>,
    );
    const thumb = getThumbs(container)[0];
    expect(thumb).toHaveAttribute('aria-label', 'Value');
    expect(labelledbyIsSafe(thumb)).toBe(true);
  });

  it('keeps range Minimum/Maximum names with no dangling ref', () => {
    const { container } = render(<Range />);
    const thumbs = getThumbs(container);
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Minimum');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Maximum');
    for (const thumb of thumbs) expect(labelledbyIsSafe(thumb)).toBe(true);
  });

  it('resolves the single-in-Field aria-labelledby to the real FieldLabel', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Risk threshold</FieldLabel>
        <Slider>
          <SliderControl>
            <SliderThumb />
          </SliderControl>
        </Slider>
      </Field>,
    );
    const thumb = getThumbs(container)[0];
    const lb = thumb.getAttribute('aria-labelledby');
    expect(lb).toBeTruthy();
    expect(document.getElementById(lb as string)).toHaveTextContent('Risk threshold');
  });

  it('forwards a consumer aria-describedby to the thumb (not clobbered by Field wiring)', () => {
    const { container } = render(
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderThumb aria-label='V' aria-describedby='ext-hint' />
        </SliderControl>
      </Slider>,
    );
    expect(getThumbs(container)[0]).toHaveAttribute('aria-describedby', 'ext-hint');
  });
});

describe('Slider — dev thumb-count guard', () => {
  it('warns when the rendered thumb count does not match the value length', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Slider defaultValue={[20, 80]}>
        <SliderControl>
          <SliderThumb index={0} />
        </SliderControl>
      </Slider>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Rendered 1 <SliderThumb>'));
    warn.mockRestore();
  });

  it('stays silent when thumb count matches', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Range />);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
