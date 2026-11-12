import type { FC, ReactNode } from 'react';
import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Checkbox, CheckboxGroup, type CheckboxGroupProps, CheckboxLabel } from '../Checkbox';
import { Input } from '../Input';
import { Field } from './Field';
import { FieldDescription } from './FieldDescription';
import { FieldError } from './FieldError';
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

describe('Field description and error wiring', () => {
  it('points the control aria-describedby at FieldDescription', () => {
    render(
      <Field data-testid='name'>
        <FieldLabel>Name</FieldLabel>
        <Input />
        <FieldDescription>Shown on your profile</FieldDescription>
      </Field>,
    );

    const description = screen.getByTestId('name--description');
    expect(description.id).not.toBe('');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', description.id);
  });

  it('points the control aria-errormessage at FieldError when the Field is invalid', () => {
    render(
      <Field data-testid='name' invalid>
        <FieldLabel>Name</FieldLabel>
        <Input />
        <FieldError>Required</FieldError>
      </Field>,
    );

    const error = screen.getByRole('alert');
    expect(error).toBe(screen.getByTestId('name--error'));
    expect(error.id).not.toBe('');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-errormessage', error.id);
  });

  it('still renders FieldError in a valid Field, without wiring it', () => {
    render(
      <Field>
        <Input />
        <FieldError>Required</FieldError>
      </Field>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-errormessage');
  });

  it('describes a checkbox-group Field (fieldset) by its FieldDescription and FieldError', () => {
    render(
      <Field data-testid='regions' invalid>
        <FieldLegend>Regions</FieldLegend>
        <CheckboxGroup>{options}</CheckboxGroup>
        <FieldDescription>Pick at least one</FieldDescription>
        <FieldError>Required</FieldError>
      </Field>,
    );

    const describedBy = screen.getByTestId('regions').getAttribute('aria-describedby')?.split(' ');
    expect(describedBy).toEqual(
      expect.arrayContaining([
        screen.getByTestId('regions--description').id,
        screen.getByTestId('regions--error').id,
      ]),
    );
  });

  it('renders FieldDescription and FieldError outside a Field without an id', () => {
    render(
      <>
        <FieldDescription data-testid='description'>Help</FieldDescription>
        <FieldError data-testid='error'>Oops</FieldError>
      </>,
    );

    expect(screen.getByText('Help')).not.toHaveAttribute('id');
    expect(screen.getByRole('alert')).not.toHaveAttribute('id');
  });
});
