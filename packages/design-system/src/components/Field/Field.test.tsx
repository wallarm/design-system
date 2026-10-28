import type { FC, ReactNode } from 'react';

import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { Checkbox, CheckboxGroup, type CheckboxGroupProps, CheckboxLabel } from '../Checkbox';
import { Field } from './Field';
import { FieldLabel } from './FieldLabel';
import { FieldLegend } from './FieldLegend';

const options = ['us1', 'eu1'].map(value => (
  <Checkbox key={value} value={value}>
    <CheckboxLabel>{value}</CheckboxLabel>
  </Checkbox>
));

// Stands in for CheckboxGroup loaded from another bundle (e.g. a Module
// Federation container): same behaviour and tag, different function identity.
const ForeignCheckboxGroup: FC<CheckboxGroupProps> = props => <CheckboxGroup {...props} />;
Object.assign(ForeignCheckboxGroup, { fieldSlot: 'checkbox-group' as const });

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => <div>{children}</div>;

const hiddenInputIds = () =>
  screen.getAllByRole('checkbox', { hidden: true }).map(input => input.id);

describe('Field with a CheckboxGroup', () => {
  it('renders a fieldset for a direct CheckboxGroup child', () => {
    render(
      <Field data-testid='regions'>
        <FieldLegend>Regions</FieldLegend>
        <CheckboxGroup>{options}</CheckboxGroup>
      </Field>,
    );

    expect(screen.getByTestId('regions').tagName).toBe('FIELDSET');
  });

  it('detects a CheckboxGroup from another bundle by its slot tag', () => {
    render(
      <Field data-testid='regions'>
        <FieldLegend>Regions</FieldLegend>
        <ForeignCheckboxGroup>{options}</ForeignCheckboxGroup>
      </Field>,
    );

    expect(screen.getByTestId('regions').tagName).toBe('FIELDSET');
  });

  it.each([
    ['a direct group', (children: ReactNode) => <CheckboxGroup>{children}</CheckboxGroup>],
    [
      'a wrapped group',
      (children: ReactNode) => (
        <Wrapper>
          <CheckboxGroup>{children}</CheckboxGroup>
        </Wrapper>
      ),
    ],
  ])('gives each checkbox its own hidden input in %s', async (_, group) => {
    const user = userEvent.setup();
    render(<Field>{group(options)}</Field>);

    const ids = hiddenInputIds();
    expect(new Set(ids).size).toBe(ids.length);

    await user.click(screen.getByText('eu1'));
    const [us1, eu1] = screen.getAllByRole('checkbox', { hidden: true }) as HTMLInputElement[];
    expect(us1?.checked).toBe(false);
    expect(eu1?.checked).toBe(true);
  });

  it('still wires a single Checkbox to the Field label', () => {
    render(
      <Field>
        <FieldLabel>Accept terms</FieldLabel>
        <Checkbox value='accept' />
      </Field>,
    );

    expect(screen.getByLabelText('Accept terms')).toBe(
      screen.getByRole('checkbox', { hidden: true }),
    );
  });
});
