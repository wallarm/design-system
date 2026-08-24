import { useState } from 'react';
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild';
import { Field } from '../Field/Field';
import { FieldAction } from '../Field/FieldAction';
import { FieldError } from '../Field/FieldError';
import { FieldIndicator } from '../Field/FieldIndicator';
import { FieldLabel } from '../Field/FieldLabel';
import {
  PasswordComplexity,
  type PasswordComplexityItem,
} from '../PasswordComplexity/PasswordComplexity';
import { passwordValidators } from '../PasswordComplexity/validators';
import { HStack, VStack } from '../Stack';
import { PasswordInput } from './PasswordInput';

const DESCRIPTION = [
  'A password field with a reveal toggle, which is the whole point of reaching for it over an `Input` of type password.',
  'Where rules are enforced, pair it with `PasswordComplexity` so the reader watches them being met rather than discovering them on submit.',
].join(' ');

const meta = {
  title: 'Inputs/PasswordInput',
  component: PasswordInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;

/**
 * Masked by default, with the eye toggling to plain text. The toggle is a real button, so it
 * is reachable by keyboard rather than being a mouse-only affordance.
 */
export const Basic: StoryObj<typeof meta> = {
  args: {
    placeholder: 'Enter',
  },
};

/**
 * Inside `Field`, which supplies the label and description above it.
 */
export const WithField: StoryFn<typeof meta> = () => (
  <Field required>
    <FieldLabel>
      Password
      <FieldIndicator />
      <FieldAction type='muted'>Forgot password?</FieldAction>
    </FieldLabel>
    <PasswordInput placeholder='Enter' />
  </Field>
);

/**
 * `error` on the field. Say what is wrong in `FieldError` — a red border on a masked field
 * leaves the reader guessing at something they cannot see.
 */
export const WithError: StoryFn<typeof meta> = () => (
  <Field required>
    <FieldLabel>
      Password
      <FieldIndicator />
    </FieldLabel>
    <PasswordInput placeholder='Enter' error />
    <FieldError>Password is incorrect</FieldError>
  </Field>
);

/**
 * `PasswordComplexity` fed by the exported `passwordValidators`, ticking off each rule as it
 * is met. Show the rules from the start rather than revealing them after a failure.
 */
export const WithRequirements: StoryFn<typeof meta> = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const items: PasswordComplexityItem[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: passwordValidators.minLength(8)(password),
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter (A\u2013Z)',
      met: passwordValidators.hasUppercase(password),
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter (a\u2013z)',
      met: passwordValidators.hasLowercase(password),
    },
    { id: 'number', label: 'One number (0\u20139)', met: passwordValidators.hasNumber(password) },
    {
      id: 'symbol',
      label: 'One symbol (e.g. ! ? @ #)',
      met: passwordValidators.hasSymbol(password),
    },
    {
      id: 'match',
      label: 'Both passwords match',
      met: passwordValidators.passwordsMatch(password, confirmPassword),
    },
  ];

  return (
    <VStack gap={16} className='w-[320px]'>
      <Field>
        <FieldLabel>New password</FieldLabel>
        <PasswordInput
          placeholder='New password...'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </Field>

      <VStack gap={6}>
        <Field>
          <FieldLabel>Confirm password</FieldLabel>
          <PasswordInput
            placeholder='Confirm password...'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </Field>
        <PasswordComplexity items={items} />
      </VStack>
    </VStack>
  );
};

/**
 * Dimmed, with the reveal toggle out as well — there is nothing to reveal that the reader can
 * act on.
 */
export const Disabled: StoryObj<typeof meta> = {
  args: {
    placeholder: 'Enter',
    disabled: true,
  },
};

/**
 * The same height scale as `Input`, so a password field lines up with the fields around it.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  <HStack gap={16} align='start'>
    <PasswordInput placeholder='Default' size='default' />
    <PasswordInput placeholder='Medium' size='medium' />
    <PasswordInput placeholder='Small' size='small' />
  </HStack>
);
