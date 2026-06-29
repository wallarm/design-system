import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Field, FieldLabel } from '../Field';
import { Slider } from './Slider';

// Ark renders each thumb as `[role="slider"]`, but keeps it `visibility:hidden`
// until it can measure layout — which never happens under jsdom. So we locate
// thumbs by `data-slot` (visibility-agnostic) rather than `getByRole`, matching
// the repo convention for Ark-based components (see NumberInput.test.tsx).
const getThumbs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="slider-thumb"]'));

describe('Slider — rendering & value model', () => {
  it('renders a single thumb (role="slider") for a 1-entry value', () => {
    const { container } = render(<Slider aria-label='Value' defaultValue={[50]} />);

    const thumbs = getThumbs(container);
    expect(thumbs).toHaveLength(1);
    expect(thumbs[0]).toHaveAttribute('role', 'slider');
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders two thumbs labelled Minimum / Maximum for a 2-entry (range) value', () => {
    const { container } = render(<Slider defaultValue={[20, 80]} />);

    const thumbs = getThumbs(container);
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Minimum');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Maximum');
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '20');
    expect(thumbs[1]).toHaveAttribute('aria-valuenow', '80');
  });

  it('clamps range thumbs so they cannot cross (no-cross bounds)', () => {
    const { container } = render(<Slider defaultValue={[20, 80]} />);

    const [low, high] = getThumbs(container);
    // The low thumb may not exceed the high thumb, and vice-versa.
    expect(low).toHaveAttribute('aria-valuemax', '80');
    expect(high).toHaveAttribute('aria-valuemin', '20');
  });

  it('accepts a custom aria-label as a string (single)', () => {
    const { container } = render(<Slider aria-label='Brightness' />);
    expect(getThumbs(container)[0]).toHaveAttribute('aria-label', 'Brightness');
  });

  it('accepts per-thumb aria-labels as an array (range)', () => {
    const { container } = render(
      <Slider defaultValue={[10, 90]} aria-label={['Floor', 'Ceiling']} />,
    );
    const thumbs = getThumbs(container);
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Floor');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Ceiling');
  });
});

describe('Slider — ordinal / labeled scale', () => {
  it('announces the mark label as aria-valuetext instead of the number', () => {
    const { container } = render(
      <Slider
        aria-label='Risk level'
        min={0}
        max={100}
        step={50}
        defaultValue={[50]}
        marks={[
          { value: 0, label: 'Low' },
          { value: 50, label: 'Medium' },
          { value: 100, label: 'High' },
        ]}
      />,
    );

    expect(getThumbs(container)[0]).toHaveAttribute('aria-valuetext', 'Medium');
  });

  it('renders a tick + label per mark', () => {
    const { container } = render(
      <Slider
        aria-label='Volume'
        marks={[
          { value: 0, label: '0' },
          { value: 50, label: '50' },
          { value: 100, label: '100' },
        ]}
      />,
    );

    const markers = container.querySelectorAll('[data-slot="slider-marker"]');
    expect(markers).toHaveLength(3);
    expect(markers[1]).toHaveTextContent('50');
  });
});

describe('Slider — states', () => {
  it('marks the root disabled (data-disabled)', () => {
    render(<Slider aria-label='Value' disabled data-testid='s' />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-disabled');
  });

  it('maps error → invalid (data-invalid) on the root', () => {
    render(<Slider aria-label='Value' error data-testid='s' />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-invalid');
  });
});

describe('Slider — Field context', () => {
  it('inherits invalid from a wrapping <Field invalid>', () => {
    render(
      <Field invalid>
        <FieldLabel>Risk</FieldLabel>
        <Slider data-testid='s' />
      </Field>,
    );
    expect(screen.getByTestId('s')).toHaveAttribute('data-invalid');
  });

  it('inherits disabled from a wrapping <Field disabled>', () => {
    render(
      <Field disabled>
        <FieldLabel>Risk</FieldLabel>
        <Slider data-testid='s' />
      </Field>,
    );
    expect(screen.getByTestId('s')).toHaveAttribute('data-disabled');
  });

  it('is labelled by the FieldLabel via aria-labelledby (single)', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Risk threshold</FieldLabel>
        <Slider />
      </Field>,
    );

    const labelledBy = getThumbs(container)[0].getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toHaveTextContent('Risk threshold');
  });
});

describe('Slider — data-testid cascade', () => {
  it('derives the single thumb id as `{base}--thumb`', () => {
    const { container } = render(<Slider aria-label='Value' data-testid='risk' />);
    expect(getThumbs(container)[0]).toHaveAttribute('data-testid', 'risk--thumb');
  });

  it('derives indexed thumb ids for a range (`{base}--thumb-0/1`)', () => {
    const { container } = render(<Slider data-testid='price' defaultValue={[20, 80]} />);
    const thumbs = getThumbs(container);
    expect(thumbs[0]).toHaveAttribute('data-testid', 'price--thumb-0');
    expect(thumbs[1]).toHaveAttribute('data-testid', 'price--thumb-1');
  });

  it('stays clean (no derived ids) when no data-testid is passed', () => {
    const { container } = render(<Slider aria-label='Value' />);
    expect(getThumbs(container)[0]).not.toHaveAttribute('data-testid');
  });
});

describe('Slider — inline input inside a Field', () => {
  const getInputs = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLInputElement>('[data-slot="input"]'));

  it('gives the two range inline inputs distinct, non-empty ids (no duplicate field id)', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Price range</FieldLabel>
        <Slider defaultValue={[20, 80]} input />
      </Field>,
    );

    const inputs = getInputs(container);
    expect(inputs).toHaveLength(2);

    const [minId, maxId] = inputs.map(input => input.id);
    expect(minId).toBeTruthy();
    expect(maxId).toBeTruthy();
    // A range inside a Field must not strand the field control id on both boxes.
    expect(minId).not.toBe(maxId);
  });

  it('keeps the FieldLabel naming the thumb, not the inline input box', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Risk threshold</FieldLabel>
        <Slider defaultValue={[50]} input />
      </Field>,
    );

    // The thumb (role="slider") is the real control and carries the field label.
    const labelledBy = getThumbs(container)[0].getAttribute('aria-labelledby');
    expect(document.getElementById(labelledBy as string)).toHaveTextContent('Risk threshold');
    // The inline box keeps its own explicit name and a unique id.
    const [box] = getInputs(container);
    expect(box).toHaveAttribute('aria-label', 'Value');
    expect(box.id).toBeTruthy();
  });
});

describe('Slider — analytics pass-through (thumb is the real node)', () => {
  it('forwards data-analytics-id to the thumb (role="slider"), not the root wrapper', () => {
    const { container } = render(
      <Slider aria-label='Risk' data-testid='s' data-analytics-id='RISK_THRESHOLD' />,
    );

    const thumb = getThumbs(container)[0]; // locate by data-slot, not by analytics-id
    expect(thumb).toHaveAttribute('role', 'slider');
    expect(thumb).toHaveAttribute('data-analytics-id', 'RISK_THRESHOLD');

    // The Ark Root wrapper must NOT strand the id (the gap NumberInput has).
    const root = screen.getByTestId('s');
    expect(root).not.toBe(thumb);
    expect(root).not.toHaveAttribute('data-analytics-id');
  });

  it('forwards data-analytics-props to the thumb byte-for-byte', () => {
    const payload = '{"feature":"risk","unit":"score"}';
    const { container } = render(
      <Slider
        aria-label='Risk'
        data-analytics-id='RISK_THRESHOLD'
        data-analytics-props={payload}
      />,
    );

    expect(getThumbs(container)[0]).toHaveAttribute('data-analytics-props', payload);
  });

  it('resolves thumb clicks to the analytics-id via closest()', () => {
    const captured = captureAnalyticsClicks();
    const { container } = render(<Slider aria-label='Risk' data-analytics-id='RISK_THRESHOLD' />);

    // fireEvent (not userEvent) so the visibility:hidden thumb still dispatches.
    fireEvent.click(getThumbs(container)[0]);
    expect(captured).toHaveBeenCalledWith('RISK_THRESHOLD');
  });
});
