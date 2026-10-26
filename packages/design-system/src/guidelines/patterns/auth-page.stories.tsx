import { type ChangeEvent, type FormEvent, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Field, FieldAction, FieldError, FieldIndicator, FieldLabel } from '../../components/Field';
import { Heading } from '../../components/Heading';
import { Input } from '../../components/Input';
import { OTPInput } from '../../components/InputOTP';
import { Link } from '../../components/Link';
import { Logo } from '../../components/Logo';
import {
  PasswordComplexity,
  type PasswordComplexityItem,
  passwordValidators,
} from '../../components/PasswordComplexity';
import { PasswordInput } from '../../components/PasswordInput';
import { Radio, RadioGroup, RadioIndicator, RadioLabel } from '../../components/Radio';
import { Separator } from '../../components/Separator';
import { HStack, VStack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { Aws, Google } from '../../icons';

type SignInMethod = 'password' | 'aws' | 'google';

interface Organization {
  id: string;
  name: string;
}

const ORGANIZATIONS: Organization[] = [
  { id: 'org-acme-bank', name: 'Acme Bank' },
  { id: 'org-acme-bank-eu', name: 'Acme Bank EU' },
  { id: 'org-northwind-retail', name: 'Northwind Retail' },
  { id: 'org-globex-payments', name: 'Globex Payments' },
  { id: 'org-initech-staging', name: 'Initech Staging' },
  { id: 'org-umbrella-health', name: 'Umbrella Health' },
  { id: 'org-stark-logistics', name: 'Stark Logistics' },
];

// The app reads the last-used method from a cookie or localStorage.
const LAST_METHOD = 'aws' as SignInMethod;

const onSignIn = fn().mockName('onSignIn');
const onSsoContinue = fn().mockName('onSsoContinue');
const onOrganizationSelect = fn().mockName('onOrganizationSelect');
const onResend = fn().mockName('onResend');
const onPasswordReset = fn().mockName('onPasswordReset');

const meta = {
  title: 'Patterns/Auth page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building a sign-in, organization select, SSO choice or password reset screen that shows one centered card on the animated background.',
      },
    },
  },
} satisfies Meta;

export default meta;

// The browser window gives the auth page its height; 800px stands in for it on whole-page stories.
const hostShell: StoryFn['decorators'] = [
  Story => (
    <div className='h-800 w-full'>
      <Story />
    </div>
  ),
];

/**
 * The sign-in flow: an email step, then a password step with "Forgot password?", the OR row and
 * SSO buttons, one of them marked "LAST". There is no backend, so "Sign in" always shows the
 * wrong-credentials state; an SSO button shows its spinner on that button only.
 */
export const Default: StoryFn = () => {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failed, setFailed] = useState(false);
  const [ssoPending, setSsoPending] = useState<SignInMethod | null>(null);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setFailed(false);
  };
  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep('password');
  };
  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSignIn({ email, password });
    setFailed(true);
  };
  const handleBack = () => {
    setStep('email');
    setPassword('');
    setFailed(false);
  };
  const handleAws = () => {
    setSsoPending('aws');
    onSsoContinue('aws');
  };
  const handleGoogle = () => {
    setSsoPending('google');
    onSsoContinue('google');
  };

  return (
    <AnimatedBackground className='h-full w-full bg-component-app-shell-bg'>
      <div
        data-testid='sign-in-card'
        className='flex max-h-[calc(100dvh-64px)] w-[480px] flex-col gap-32 overflow-y-auto rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80'
      >
        <Logo type='full' size='md' className='mb-32 self-start' />
        <VStack gap={0} align='start'>
          <Heading size='2xl' weight='medium'>
            Welcome back!
          </Heading>
          <Text size='sm' color='secondary'>
            Sign in to your account
          </Text>
        </VStack>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <VStack gap={16}>
              <Field data-testid='sign-in-email' required>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type='email'
                  autoComplete='email'
                  placeholder='you@your-company.com'
                  value={email}
                  onChange={handleEmailChange}
                />
              </Field>
              <Button data-testid='sign-in-continue' type='submit' fullWidth disabled={!email}>
                Continue
              </Button>
            </VStack>
          </form>
        )}

        {step === 'password' && (
          <>
            <form onSubmit={handleSignIn}>
              <VStack gap={16}>
                <Field data-testid='sign-in-password' invalid={failed}>
                  <FieldLabel>
                    Password
                    <FieldAction asChild>
                      <a href='#forgot-password'>Forgot password?</a>
                    </FieldAction>
                  </FieldLabel>
                  <PasswordInput
                    autoComplete='current-password'
                    placeholder='Enter'
                    error={failed}
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  {failed && <FieldError>Email or password is incorrect.</FieldError>}
                </Field>
                <VStack gap={8}>
                  <Button data-testid='sign-in-submit' type='submit' fullWidth disabled={!password}>
                    Sign in
                  </Button>
                  <Button
                    data-testid='sign-in-back'
                    type='button'
                    variant='secondary'
                    color='neutral'
                    fullWidth
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                </VStack>
              </VStack>
            </form>

            <HStack gap={12}>
              <Separator className='flex-1' />
              <span className='text-xs text-text-tertiary'>OR</span>
              <Separator className='flex-1' />
            </HStack>

            <VStack gap={8} data-testid='sign-in-sso'>
              <div className='relative w-full'>
                <Button
                  variant='secondary'
                  color='neutral'
                  fullWidth
                  loading={ssoPending === 'aws'}
                  onClick={handleAws}
                >
                  <Aws />
                  Continue with AWS
                </Button>
                {LAST_METHOD === 'aws' && (
                  <Badge size='small' color='blue' className='absolute -top-6 -right-8 uppercase'>
                    Last
                  </Badge>
                )}
              </div>
              <div className='relative w-full'>
                <Button
                  variant='secondary'
                  color='neutral'
                  fullWidth
                  loading={ssoPending === 'google'}
                  onClick={handleGoogle}
                >
                  <Google />
                  Continue with Google
                </Button>
                {LAST_METHOD === 'google' && (
                  <Badge size='small' color='blue' className='absolute -top-6 -right-8 uppercase'>
                    Last
                  </Badge>
                )}
              </div>
            </VStack>
          </>
        )}
      </div>
    </AnimatedBackground>
  );
};

Default.decorators = hostShell;

/**
 * The failed password step: the error names neither credential, the password stays in the field,
 * and editing it clears the error.
 */
export const WrongCredentials: StoryFn = () => {
  const [password, setPassword] = useState('Winter2026');
  const [failed, setFailed] = useState(true);

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setFailed(false);
  };
  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSignIn({ email: 'maria.lopez@acme-bank.com', password });
    setFailed(true);
  };

  return (
    <div
      data-testid='wrong-credentials-card'
      className='flex max-h-[calc(100dvh-64px)] w-[480px] flex-col gap-32 overflow-y-auto rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80'
    >
      <form onSubmit={handleSignIn}>
        <VStack gap={16}>
          <Field data-testid='wrong-credentials-password' invalid={failed}>
            <FieldLabel>
              Password
              <FieldAction asChild>
                <a href='#forgot-password'>Forgot password?</a>
              </FieldAction>
            </FieldLabel>
            <PasswordInput
              autoComplete='current-password'
              placeholder='Enter'
              error={failed}
              value={password}
              onChange={handlePasswordChange}
            />
            {failed && <FieldError>Email or password is incorrect.</FieldError>}
          </Field>
          <Button
            data-testid='wrong-credentials-submit'
            type='submit'
            fullWidth
            disabled={!password}
          >
            Sign in
          </Button>
        </VStack>
      </form>
    </div>
  );
};

/** A clicked SSO button shows its spinner; the other buttons stay as they are. */
export const SsoButtons: StoryFn = () => {
  const [ssoPending, setSsoPending] = useState<SignInMethod | null>(null);

  const handleAws = () => {
    setSsoPending('aws');
    onSsoContinue('aws');
  };
  const handleGoogle = () => {
    setSsoPending('google');
    onSsoContinue('google');
  };

  return (
    <div
      data-testid='sso-card'
      className='flex max-h-[calc(100dvh-64px)] w-[480px] flex-col gap-32 overflow-y-auto rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80'
    >
      <HStack gap={12}>
        <Separator className='flex-1' />
        <span className='text-xs text-text-tertiary'>OR</span>
        <Separator className='flex-1' />
      </HStack>
      <VStack gap={8} data-testid='sso-buttons'>
        <div className='relative w-full'>
          <Button
            variant='secondary'
            color='neutral'
            fullWidth
            loading={ssoPending === 'aws'}
            onClick={handleAws}
          >
            <Aws />
            Continue with AWS
          </Button>
          {LAST_METHOD === 'aws' && (
            <Badge size='small' color='blue' className='absolute -top-6 -right-8 uppercase'>
              Last
            </Badge>
          )}
        </div>
        <div className='relative w-full'>
          <Button
            variant='secondary'
            color='neutral'
            fullWidth
            loading={ssoPending === 'google'}
            onClick={handleGoogle}
          >
            <Google />
            Continue with Google
          </Button>
          {LAST_METHOD === 'google' && (
            <Badge size='small' color='blue' className='absolute -top-6 -right-8 uppercase'>
              Last
            </Badge>
          )}
        </div>
      </VStack>
    </div>
  );
};

/**
 * Organization select for a user in 7 organizations: card radios collapsed to 5 rows, with a
 * ghost "Show more" button under the group.
 */
export const SelectOrganization: StoryFn = () => {
  const [value, setValue] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? ORGANIZATIONS : ORGANIZATIONS.slice(0, 5);

  const handleValueChange = (details: { value: string | null }) => setValue(details.value);
  const handleToggle = () => setExpanded(!expanded);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onOrganizationSelect(value);
  };

  return (
    <AnimatedBackground className='h-full w-full bg-component-app-shell-bg'>
      <div
        data-testid='organization-card'
        className='flex max-h-[calc(100dvh-64px)] w-[480px] flex-col gap-32 overflow-y-auto rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80'
      >
        <Logo type='full' size='md' className='mb-32 self-start' />
        <VStack gap={0} align='start'>
          <Heading size='2xl' weight='medium'>
            Select organization
          </Heading>
          <Text size='sm' color='secondary'>
            Choose which organization to sign in to.
          </Text>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack gap={16}>
            <VStack gap={8} data-testid='organization-list'>
              <RadioGroup variant='card' value={value} onValueChange={handleValueChange}>
                {visible.map(org => (
                  <Radio key={org.id} value={org.id}>
                    <RadioIndicator />
                    <RadioLabel>{org.name}</RadioLabel>
                  </Radio>
                ))}
              </RadioGroup>
              {ORGANIZATIONS.length > 5 && (
                <Button
                  data-testid='organization-show-more'
                  type='button'
                  variant='ghost'
                  color='neutral'
                  onClick={handleToggle}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </VStack>
            <Button data-testid='organization-continue' type='submit' fullWidth disabled={!value}>
              Continue
            </Button>
          </VStack>
        </form>
      </div>
    </AnimatedBackground>
  );
};

SelectOrganization.decorators = hostShell;

/**
 * Password reset: a 6-digit code with a resend countdown, a new password with its confirmation,
 * and the full rule list from `passwordValidators`. "Continue" stays disabled until the code is
 * complete and every rule is met; it then shows the "Password reset" toast.
 */
export const ResetPassword: StoryFn = () => {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // The app owns the resend timer; the story freezes it at 55 seconds.
  const secondsLeft = 55;

  const rules: PasswordComplexityItem[] = [
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
      met: passwordValidators.passwordsMatch(password, confirm),
    },
  ];
  const complete = code.length === 6 && rules.every(rule => rule.met);

  const handleCodeChange = (details: { valueAsString: string }) => setCode(details.valueAsString);
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);
  const handleConfirmChange = (event: ChangeEvent<HTMLInputElement>) =>
    setConfirm(event.target.value);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onPasswordReset();
    toast.create({ id: 'password-reset', title: 'Password reset', type: 'default' });
  };

  return (
    <AnimatedBackground className='h-full w-full bg-component-app-shell-bg'>
      <div
        data-testid='reset-password-card'
        className='flex max-h-[calc(100dvh-64px)] w-[480px] flex-col gap-32 overflow-y-auto rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80'
      >
        <Logo type='full' size='md' className='mb-32 self-start' />
        <VStack gap={0} align='start'>
          <Heading size='2xl' weight='medium'>
            Reset password
          </Heading>
          <Text size='sm' color='secondary'>
            We've sent a code to maria.lopez@acme-bank.com
          </Text>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack gap={16}>
            <Field data-testid='reset-password-code' required>
              <FieldLabel>
                Code
                <FieldIndicator />
                <Link
                  asChild
                  size='sm'
                  weight='medium'
                  disabled={secondsLeft > 0}
                  onClick={onResend}
                  className='ml-auto'
                >
                  <button type='button'>
                    {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
                  </button>
                </Link>
              </FieldLabel>
              <OTPInput otp groupSize={3} onValueChange={handleCodeChange} />
            </Field>
            <Field data-testid='reset-password-new' required>
              <FieldLabel>
                New password
                <FieldIndicator />
              </FieldLabel>
              <PasswordInput
                autoComplete='new-password'
                placeholder='Enter'
                value={password}
                onChange={handlePasswordChange}
              />
            </Field>
            <Field data-testid='reset-password-confirm' required>
              <FieldLabel>
                Confirm password
                <FieldIndicator />
              </FieldLabel>
              <PasswordInput
                autoComplete='new-password'
                placeholder='Enter'
                value={confirm}
                onChange={handleConfirmChange}
              />
            </Field>
            <PasswordComplexity data-testid='reset-password-rules' items={rules} />
            <Button
              data-testid='reset-password-submit'
              type='submit'
              fullWidth
              disabled={!complete}
            >
              Continue
            </Button>
          </VStack>
        </form>
      </div>
    </AnimatedBackground>
  );
};

ResetPassword.decorators = hostShell;
