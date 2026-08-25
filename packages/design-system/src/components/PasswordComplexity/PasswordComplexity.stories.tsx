import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Input } from '../Input';
import { PasswordComplexity, type PasswordComplexityItem } from './PasswordComplexity';
import { passwordValidators } from './validators';

const DESCRIPTION = [
  'The rules a password has to meet, ticked off as it meets them — show them from the moment the field appears rather than after a failed submit, and keep the same set everywhere a password is created.',
  "The component only paints: you compute each rule's `met` and pass it in, with `passwordValidators` shipped alongside for that. A satisfied rule is struck through and steps back, so what is left to do is what stands out.",
].join(' ');

const meta = {
  title: 'Data Display/PasswordComplexity',
  component: PasswordComplexity,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
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

/**
 * The opening state — every rule still outstanding, marked with a muted dot and left in
 * full-strength type.
 */
export const AllUnmet: StoryFn<typeof meta> = () => <PasswordComplexity items={defaultItems} />;

/**
 * Everything satisfied: green checks with the labels struck through, which reads as done
 * without needing a success message on top.
 */
export const AllMet: StoryFn<typeof meta> = () => (
  <PasswordComplexity items={defaultItems.map(item => ({ ...item, met: true }))} />
);

/**
 * The state actually seen most of the time. Three rules are struck through and two are not,
 * and the two are what the eye goes to.
 */
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

/**
 * Two fields wired to `passwordValidators`, `passwordsMatch` included, recomputed on every
 * keystroke — the real-time checking the rules are meant to be shown with.
 */
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
