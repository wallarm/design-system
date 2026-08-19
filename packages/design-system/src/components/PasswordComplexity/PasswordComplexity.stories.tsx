import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Input } from '../Input';
import { PasswordComplexity, type PasswordComplexityItem } from './PasswordComplexity';
import { passwordValidators } from './validators';

const meta = {
  title: 'Data Display/PasswordComplexity',
  component: PasswordComplexity,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Presentation-only password-rule checklist built on List/ListItem/ListIcon. ' +
          'The consumer passes pre-computed items with `met` booleans; the component ' +
          'handles only the visual states (checked vs unchecked).',
      },
    },
  },
} satisfies Meta<typeof PasswordComplexity>;

export default meta;

const defaultItems: PasswordComplexityItem[] = [
  { id: 'length', label: 'At least 8 characters', met: false },
  { id: 'uppercase', label: 'Contains an uppercase letter', met: false },
  { id: 'lowercase', label: 'Contains a lowercase letter', met: false },
  { id: 'number', label: 'Contains a number', met: false },
  { id: 'symbol', label: 'Contains a special character', met: false },
];

export const AllUnmet: StoryFn<typeof meta> = () => <PasswordComplexity items={defaultItems} />;

export const AllMet: StoryFn<typeof meta> = () => (
  <PasswordComplexity items={defaultItems.map(item => ({ ...item, met: true }))} />
);

export const PartiallyMet: StoryFn<typeof meta> = () => (
  <PasswordComplexity
    items={[
      { id: 'length', label: 'At least 8 characters', met: true },
      { id: 'uppercase', label: 'Contains an uppercase letter', met: true },
      { id: 'lowercase', label: 'Contains a lowercase letter', met: true },
      { id: 'number', label: 'Contains a number', met: false },
      { id: 'symbol', label: 'Contains a special character', met: false },
    ]}
  />
);

export const Interactive: StoryFn<typeof meta> = () => {
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
      label: 'One uppercase letter (A–Z)',
      met: passwordValidators.hasUppercase(password),
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter (a–z)',
      met: passwordValidators.hasLowercase(password),
    },
    { id: 'number', label: 'One number (0–9)', met: passwordValidators.hasNumber(password) },
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
      <Input
        type='password'
        placeholder='New password...'
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Input
        type='password'
        placeholder='Confirm password...'
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
      />
      <PasswordComplexity items={items} />
    </div>
  );
};
