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
import { HStack } from '../Stack';
import { PasswordInput } from './PasswordInput';

const meta = {
  title: 'Inputs/PasswordInput',
  component: PasswordInput,
  parameters: {
    layout: 'centered',
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

export const Basic: StoryObj<typeof meta> = {
  args: {
    placeholder: 'Enter',
  },
};

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
    <div className='flex flex-col gap-16 w-[320px]'>
      <Field>
        <FieldLabel>New password</FieldLabel>
        <PasswordInput
          placeholder='New password...'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel>Confirm password</FieldLabel>
        <PasswordInput
          placeholder='Confirm password...'
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </Field>
      <PasswordComplexity items={items} />
    </div>
  );
};

export const Disabled: StoryObj<typeof meta> = {
  args: {
    placeholder: 'Enter',
    disabled: true,
  },
};

export const Sizes: StoryFn<typeof meta> = () => (
  <HStack gap={16} align='start'>
    <PasswordInput placeholder='Default' size='default' />
    <PasswordInput placeholder='Medium' size='medium' />
    <PasswordInput placeholder='Small' size='small' />
  </HStack>
);
