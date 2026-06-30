import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field, FieldLabel } from '../Field';
import { Slider } from './Slider';
import { SliderControl } from './SliderControl';
import { SliderThumb } from './SliderThumb';

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
