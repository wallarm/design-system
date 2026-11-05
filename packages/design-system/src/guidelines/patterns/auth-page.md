---
title: Auth page
description: Use when building a sign-in, organization select, SSO choice or password reset screen that shows one centered card on the animated background.
components: [AnimatedBackground, UtilityPage, Logo, Heading, Text, Stack, VStack, HStack, Field, Input, PasswordInput, OTPInput, PasswordComplexity, Button, Badge, Separator, RadioGroup, Radio, Tag, Link, Toast, Toaster]
keywords: [auth, login, log in, sign in, sign-in, signin, sign up, password, forgot password, reset password, OTP, one-time code, verification code, SSO, single sign-on, continue with, OR separator, last used, organization select, tenant select, login card, AuthCard, AuthPage, LoginForm]
order: 100
---

# Auth page

An auth page is one 480px card, centered on `AnimatedBackground`, that holds one step of the sign-in flow.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Sign in with email and password | The auth card, variant A | A `Dialog` over the app |
| Pick one of several organizations after sign-in | The auth card, variant B, `RadioGroup variant='card'` | `Select` inside the card |
| Enter a reset code and set a new password | The auth card, variant C, `OTPInput` + `PasswordInput` + `PasswordComplexity` | Six separate `Input`s |
| Show a 404, 403, 500 or offline screen | `UtilityPage` | The auth card |
| Show an empty region inside the app | `EmptyState` | `UtilityPage` or the auth card |
| Show that the app is loading after sign-in | `SplashScreen` | A spinner inside the auth card |

- If the user is not signed in, render the auth card outside `AppShell`. **Never** render it inside `Page` or `AppShell`.
- If a step needs more than one decision, split it into two cards. One card asks one thing.
- If the email domain uses SSO, skip the password field and redirect. Do not show an empty password step.

There is no `AuthCard`, `AuthPage`, `AuthLayout` or `LoginForm` component in the design system. Compose the card from `AnimatedBackground`, `Logo`, `Heading` and `Text` as shown in the Example section.

**Never** use `UtilityPage` for an auth step. Its `title`, `subtitle` and `description` are required strings, and `title` renders as `font-mono text-6xl` for error codes such as "404".

**Never** copy the `LoginFlow` story in `AppShell.stories.tsx`. It is a `SplashScreen` shrink animation with `shadow-lg`; the auth card has no shadow.

## Anatomy

| Part | Component | Content |
| --- | --- | --- |
| Background | `AnimatedBackground` | Full viewport, `variant='pixel'` (the default). Centers its children |
| Card | Your own `div` with the card classes in the Layout and spacing section | One step of the flow |
| Logo | `Logo type='full' size='md'` | Left-aligned at the card top |
| Title | `Heading size='2xl' weight='medium'` | "Welcome back!", "Select organization", "Reset password" |
| Subtitle | `Text size='sm' color='secondary'` | One line under the title |
| Organization context (optional) | `Tag` + `Link type='muted' size='sm'` | The chosen organization and "Change" |
| Fields | `Field` + `FieldLabel` + `Input` / `PasswordInput` / `OTPInput` | Email, password, code |
| Label action | `FieldAction asChild` wrapping an `<a>`, inside `FieldLabel` | "Forgot password?" on the right of the label |
| Field error | `FieldError` inside the `Field` | "Email or password is incorrect." |
| Primary action | `Button type='submit' fullWidth` | "Sign in", "Continue" |
| OR separator | `HStack` with two `Separator`s and a `span` | "OR" between password and SSO |
| SSO buttons | `Button variant='secondary' color='neutral' fullWidth` | Provider icon + "Continue with {provider}" |
| Last-used marker | `Badge size='small' color='blue'`, absolutely positioned | "LAST" on the method used last time |
| Secondary action | `Button variant='secondary' color='neutral' fullWidth` | "Back" |

Import `FieldAction` and `FieldIndicator` from `@wallarm-org/design-system/Field`. They are not exported from the package root. Import provider icons (`Aws`, `Google`) and `Building` from `@wallarm-org/design-system/icons`. Import `useToast` from `@wallarm-org/design-system/Toast`.

### Variants

| Variant | Title | Body | Actions |
| --- | --- | --- | --- |
| A. Sign in, email step | "Welcome back!" | Email `Field` | "Continue" |
| A. Sign in, password step | "Welcome back!" | Email + password `Field`s, OR separator, SSO buttons | "Sign in", SSO buttons |
| A. Sign in, with organization | "Welcome back!" | Organization `Tag` + "Change", then the password step | Same as the password step |
| B. Select organization | "Select organization" | `RadioGroup variant='card'`, "Show more" at 6 or more | "Continue", "Back" |
| C. Reset password | "Reset password" | Code `OTPInput`, new password, confirm password, `PasswordComplexity` | "Continue" |

## Layout and spacing

Numbers are pixels: `px-48` is 48px, `gap-32` is 32px. Figma values come from the Platform "Auth flow" page.

| Part | Classes or props | Figma |
| --- | --- | --- |
| Background | `AnimatedBackground className='min-h-screen w-full bg-component-app-shell-bg'` | Full frame, slate-100 with pixel dots |
| Card | `w-[480px] rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80` | 480 wide, 48 sides, 32 top, 80 bottom |
| Card content column | Set by the padding: 480 − 2 × 48 | 384 wide |
| Card stack | `flex flex-col gap-32` | 32 between logo, title block and form |
| Logo | `Logo type='full' size='md' className='mb-32 self-start'` (16px high) | 64 from logo to title (`mb-32` + `gap-32`) |
| Title block | `VStack gap={0} align='start'` | Title and subtitle touch |
| Title | `Heading size='2xl' weight='medium'` (24px, line height 32) | 24px |
| Subtitle | `Text size='sm' color='secondary'` (14px, line height 20) | 14px secondary |
| Form stack | `VStack gap={16}` | 16 between fields and buttons |
| Label to control | Built into `Field` (`gap-4`) | 4 |
| Input height | `Input` / `PasswordInput` default `size` (`h-36`) | 36 |
| Button height | `Button` default `size='large'` (36px) | 36 |
| OR row | `HStack gap={12}`, each `Separator className='flex-1'`, `span className='text-xs text-text-tertiary'` | 12px tertiary "OR", 12 to each line, 16 above and below |
| SSO stack | `VStack gap={8}` | 8 between SSO buttons |
| Last-used badge | Wrapper `relative w-full`; `Badge className='absolute -top-6 -right-8 uppercase'` | Badge 16 high, overhangs the top-right corner |
| Organization rows | Built into `RadioGroup variant='card'` (`py-12`, `gap-8`) | 44-high rows |
| Card height | Content height. Cap with `max-h-[calc(100dvh-64px)] overflow-y-auto` | At most 32 from the viewport top and bottom |

- **Never** add a shadow to the card. Figma draws border only.
- **Never** use `Card` for the auth card. `Card` owns a 16px padding; the auth card needs 48px sides.
- **Never** pass `size` to `Button`, `Input` or `PasswordInput` in the card. The defaults are 36px and match Figma.
- **Never** wrap `Field` to add margins. Space fields with the parent `VStack gap={16}` or `FieldGroup`.
- **Never** pass `className` to `Field`, `Heading` or `Text`. `Field` and `Text` omit it from their types; `Heading` drops it.
- **Never** center the card yourself with `fixed`, `absolute` or `translate`. `AnimatedBackground` centers its children.
- Use `w-[480px]` from Figma. `UtilityPage` uses `w-[482px]`; do not copy that value.

There is no `bg-primary`, `bg-card` or `bg-surface` token. Use `bg-bg-surface-1` for the card and `bg-component-app-shell-bg` for the background. `Text color` has no tertiary value, so the "OR" label is a `span` with `text-xs text-text-tertiary`.

## States

| State | What the user sees | How to build it |
| --- | --- | --- |
| Email step | Email field and "Continue" | Render only the email `Field` |
| Password step | Email, password, "Forgot password?", "Sign in", OR, SSO buttons | Render after the email step resolves to a password account |
| Submitting | "Sign in" shows a spinner and is disabled | `loading={pending}` on the submit `Button` |
| Wrong credentials | Red border on the password input; error line under it | `Field invalid`, `PasswordInput error`, `FieldError` "Email or password is incorrect." |
| Last used method | "LAST" badge on one button | Render one `Badge` on the button that matches the stored method |
| SSO redirect | The clicked SSO button shows a spinner | `loading` on that one `Button`; keep the others enabled |
| Organization chosen | `Tag` with `Building` icon and the name, then "Change" | `Tag` + `Link type='muted' size='sm'` above the fields |
| 6 or more organizations | First 5 rows, then "Show more" | Slice the list; toggle with a ghost `Button` |
| Expanded organizations | All rows, then "Show less" | Show the full list; the card scrolls when taller than the viewport |
| Resend countdown | "Resend in 55s", disabled | `Link disabled` while seconds remain |
| Resend available | "Resend code", clickable | `Link` with `onClick` |
| Password rules | Unmet rules show a dot; met rules show a check and strike-through | `PasswordComplexity items` with `met` from `passwordValidators` |
| Password reset done | The sign-in card, then a "Password reset" toast | Navigate to sign-in, then `toast.create({ title: 'Password reset', type: 'default' })` |

- If sign-in fails, show the error under the password field. **Never** show it in an `Alert`, `Banner` or toast.
- If sign-in fails, keep the email and clear nothing. The user fixes one field and submits again.
- If the request is pending, keep every field enabled. Only the submit button is disabled through `loading`.
- `loading` also disables the `Button`. **Never** add `disabled={pending}` next to it. Use `disabled` only for an incomplete form, as in variant C.

## Rules

### Copy

| Part | Write | Not |
| --- | --- | --- |
| Sign-in title | "Welcome back!" | "Login", "Sign In to Wallarm" |
| Sign-in subtitle | "Sign in to your account" | A paragraph about the product |
| Credentials error | "Email or password is incorrect." | "Wrong password", "User not found" |
| Submit, password step | "Sign in" | "Log in", "Submit" |
| Submit, other steps | "Continue" | "Next", "OK" |
| SSO button | "Continue with {provider}" | "Sign in with SSO", "{provider}" |
| Separator label | "OR" | "or continue with" |
| Organization subtitle | "Choose which organization to sign in to." | "Select one" |
| Reset subtitle | "We've sent a code to {email}" | "Check your inbox" |
| Resend link | "Resend in {n}s", then "Resend code" | "Didn't get it?" |
| Reset success toast | "Password reset" | "Your password was reset successfully!" |
| Email placeholder | "you@your-company.com" | "Email" |
| Password placeholder | "Enter" | "Password" |

- **Never** say which credential is wrong. The error names both email and password.
- Write titles and labels in sentence case.

### Behavior

- Use one `<form>` per card with `onSubmit`. Enter submits the step.
- Give the primary `Button` `type='submit'`. Give every other button in the form an explicit action.
- **Never** put a bare `FieldAction` inside a `<form>`. It renders a `<button>` with no `type`, which submits the form. Use `FieldAction asChild` with an `<a href>`.
- Set `autoComplete`: `email`, `current-password` on sign-in, `new-password` on reset. Pass `otp` to `OTPInput`.
- Pass `groupSize={3}` to `OTPInput`. The default `groupSize` is 2; Figma groups the six cells as 3 + 3.
- Show the "LAST" badge on at most one button.
- If there are 5 or fewer organizations, show them all and no "Show more".
- If the code is wrong, pass `error` to `OTPInput` and add a `FieldError` in the same `Field`.
- Render one `Toaster` at the app root for the reset toast. See [Feedback toasts](feedback-toasts.md).

There is no `label` prop on `Separator`. There is no clear button on `Input`. There is no badge prop on `Button`. There is no "Show more" built into `RadioGroup`. There is no `variant` on `UtilityPage`.

## Example

### Card shell

```tsx
import type { ReactNode } from 'react';
import { AnimatedBackground, Heading, Logo, Text, VStack } from '@wallarm-org/design-system';

interface AuthCardProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
  <AnimatedBackground className='min-h-screen w-full bg-component-app-shell-bg'>
    <div className='flex max-h-[calc(100dvh-64px)] w-[480px] flex-col gap-32 overflow-y-auto rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80'>
      <Logo type='full' size='md' className='mb-32 self-start' />

      <VStack gap={0} align='start'>
        <Heading size='2xl' weight='medium'>
          {title}
        </Heading>
        <Text size='sm' color='secondary'>
          {subtitle}
        </Text>
      </VStack>

      {children}
    </div>
  </AnimatedBackground>
);
```

Keep this component in your app. Every step renders inside it.

### Sign in (variant A)

```tsx
import { type ChangeEvent, type FormEvent, useState } from 'react';
import {
  Badge,
  Button,
  Field,
  FieldError,
  FieldLabel,
  HStack,
  Input,
  PasswordInput,
  Separator,
  VStack,
} from '@wallarm-org/design-system';
import { FieldAction } from '@wallarm-org/design-system/Field';
import { Aws, Google } from '@wallarm-org/design-system/icons';
import { AuthCard } from './AuthCard';

interface SignInPageProps {
  lastMethod?: 'password' | 'aws' | 'google';
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSso: (provider: 'aws' | 'google') => void;
  forgotPasswordHref: string;
}

export const SignInPage = ({
  lastMethod,
  onSignIn,
  onSso,
  forgotPasswordHref,
}: SignInPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const ok = await onSignIn(email, password);
    setPending(false);
    setFailed(!ok);
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);
  const handleAws = () => onSso('aws');
  const handleGoogle = () => onSso('google');

  return (
    <AuthCard title='Welcome back!' subtitle='Sign in to your account'>
      <form onSubmit={handleSubmit}>
        <VStack gap={16}>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              type='email'
              autoComplete='email'
              placeholder='you@your-company.com'
              value={email}
              onChange={handleEmailChange}
            />
          </Field>

          <Field invalid={failed}>
            <FieldLabel>
              Password
              <FieldAction asChild>
                <a href={forgotPasswordHref}>Forgot password?</a>
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

          <div className='relative w-full'>
            <Button type='submit' fullWidth loading={pending}>
              Sign in
            </Button>
            {lastMethod === 'password' && (
              <Badge size='small' color='blue' className='absolute -top-6 -right-8 uppercase'>
                Last
              </Badge>
            )}
          </div>

          <HStack gap={12}>
            <Separator className='flex-1' />
            <span className='text-xs text-text-tertiary'>OR</span>
            <Separator className='flex-1' />
          </HStack>

          <VStack gap={8}>
            <div className='relative w-full'>
              <Button variant='secondary' color='neutral' fullWidth onClick={handleAws}>
                <Aws />
                Continue with AWS
              </Button>
              {lastMethod === 'aws' && (
                <Badge size='small' color='blue' className='absolute -top-6 -right-8 uppercase'>
                  Last
                </Badge>
              )}
            </div>
            <div className='relative w-full'>
              <Button variant='secondary' color='neutral' fullWidth onClick={handleGoogle}>
                <Google />
                Continue with Google
              </Button>
              {lastMethod === 'google' && (
                <Badge size='small' color='blue' className='absolute -top-6 -right-8 uppercase'>
                  Last
                </Badge>
              )}
            </div>
          </VStack>
        </VStack>
      </form>
    </AuthCard>
  );
};
```

For the email step, render only the email `Field` and a `Button type='submit' fullWidth` labelled "Continue".

### Organization context

```tsx
import { HStack, Link, Tag } from '@wallarm-org/design-system';
import { Building } from '@wallarm-org/design-system/icons';

interface OrganizationContextProps {
  organizationName: string;
  changeHref: string;
}

export const OrganizationContext = ({ organizationName, changeHref }: OrganizationContextProps) => (
  <HStack gap={8}>
    <Tag>
      <Building />
      {organizationName}
    </Tag>
    <Link type='muted' size='sm' href={changeHref}>
      Change
    </Link>
  </HStack>
);
```

Render it as the first child of the form `VStack`, above the email `Field`.

### Select organization (variant B)

```tsx
import { useState } from 'react';
import {
  Button,
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  VStack,
} from '@wallarm-org/design-system';
import { AuthCard } from './AuthCard';

interface Organization {
  id: string;
  name: string;
}

interface SelectOrganizationStepProps {
  organizations: Organization[];
  onContinue: (organizationId: string) => void;
  onBack: () => void;
}

const COLLAPSED_COUNT = 5;

export const SelectOrganizationStep = ({
  organizations,
  onContinue,
  onBack,
}: SelectOrganizationStepProps) => {
  const [value, setValue] = useState<string | null>(organizations[0]?.id ?? null);
  const [expanded, setExpanded] = useState(false);

  const collapsible = organizations.length > COLLAPSED_COUNT;
  const visible =
    collapsible && !expanded ? organizations.slice(0, COLLAPSED_COUNT) : organizations;

  const handleValueChange = (details: { value: string | null }) => setValue(details.value);
  const handleToggle = () => setExpanded(prev => !prev);
  const handleContinue = () => {
    if (value) onContinue(value);
  };

  return (
    <AuthCard title='Select organization' subtitle='Choose which organization to sign in to.'>
      <VStack gap={16}>
        <VStack gap={8}>
          <RadioGroup variant='card' value={value} onValueChange={handleValueChange}>
            {visible.map(org => (
              <Radio key={org.id} value={org.id}>
                <RadioIndicator />
                <RadioLabel>{org.name}</RadioLabel>
              </Radio>
            ))}
          </RadioGroup>
          {collapsible && (
            <Button variant='ghost' color='neutral' onClick={handleToggle}>
              {expanded ? 'Show less' : 'Show more'}
            </Button>
          )}
        </VStack>

        <VStack gap={8}>
          <Button fullWidth disabled={!value} onClick={handleContinue}>
            Continue
          </Button>
          <Button variant='secondary' color='neutral' fullWidth onClick={onBack}>
            Back
          </Button>
        </VStack>
      </VStack>
    </AuthCard>
  );
};
```

### Reset password (variant C)

```tsx
import { type ChangeEvent, type FormEvent, useState } from 'react';
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Link,
  OTPInput,
  PasswordComplexity,
  type PasswordComplexityItem,
  PasswordInput,
  passwordValidators,
  VStack,
} from '@wallarm-org/design-system';
import { FieldIndicator } from '@wallarm-org/design-system/Field';
import { AuthCard } from './AuthCard';

interface ResetPasswordStepProps {
  email: string;
  resendSecondsLeft: number;
  pending: boolean;
  onResend: () => void;
  onSubmit: (code: string, password: string) => void;
}

export const ResetPasswordStep = ({
  email,
  resendSecondsLeft,
  pending,
  onResend,
  onSubmit,
}: ResetPasswordStepProps) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

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
      met: passwordValidators.passwordsMatch(password, confirm),
    },
  ];
  const canSubmit = code.length === 6 && items.every(item => item.met);

  const handleCodeChange = (details: { valueAsString: string }) => setCode(details.valueAsString);
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);
  const handleConfirmChange = (event: ChangeEvent<HTMLInputElement>) =>
    setConfirm(event.target.value);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(code, password);
  };

  return (
    <AuthCard title='Reset password' subtitle={`We've sent a code to ${email}`}>
      <form onSubmit={handleSubmit}>
        <VStack gap={16}>
          <FieldGroup>
            <Field required>
              <FieldLabel>
                Code
                <FieldIndicator />
                <Link
                  asChild
                  size='sm'
                  weight='medium'
                  disabled={resendSecondsLeft > 0}
                  onClick={onResend}
                  className='ml-auto'
                >
                  <button type='button'>
                    {resendSecondsLeft > 0 ? `Resend in ${resendSecondsLeft}s` : 'Resend code'}
                  </button>
                </Link>
              </FieldLabel>
              <OTPInput groupSize={3} otp onValueChange={handleCodeChange} />
            </Field>

            <Field required>
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

            <Field required>
              <FieldLabel>
                Confirm new password
                <FieldIndicator />
              </FieldLabel>
              <PasswordInput
                autoComplete='new-password'
                placeholder='Enter'
                value={confirm}
                onChange={handleConfirmChange}
              />
              <PasswordComplexity items={items} />
            </Field>
          </FieldGroup>

          <Button type='submit' fullWidth loading={pending} disabled={!canSubmit}>
            Continue
          </Button>
        </VStack>
      </form>
    </AuthCard>
  );
};
```

After a successful reset, navigate to sign-in and fire the toast there:

```tsx
import { useToast } from '@wallarm-org/design-system/Toast';

export const usePasswordResetToast = () => {
  const toast = useToast();

  return () => toast.create({ title: 'Password reset', type: 'default' });
};
```

## What your app owns

| Concern | Owned by | Recipe with the current API |
| --- | --- | --- |
| The card shell | App | The `AuthCard` component in the Example section |
| Step routing (email → password → organization → reset) | App | Your router or a `step` state; one `AuthCard` per step |
| Domain lookup that decides password or SSO | App | Call your API on the email step, then render the password step or redirect |
| Credential check, `pending` and the error flag | App | `useState` + `loading` on the submit `Button` |
| Which method was used last | App | Store it (cookie or `localStorage`), pass it as `lastMethod` |
| SSO redirects | App | `onClick` on each SSO `Button` |
| The resend countdown | App | A timer that passes `resendSecondsLeft` |
| Code verification and password rules | App | `passwordValidators` for the rules; your API for the code |
| Transactional emails (reset code) | App | Out of scope for the design system |

Gaps in the design system today:

- There is no auth card component. `UtilityPage` has the same shell but a 404-style title. Copy the `AuthCard` recipe.
- There is no labelled separator. Use two `Separator className='flex-1'` around a `span` in an `HStack`.
- There is no corner badge slot on `Button`. Wrap the button in `relative w-full` and position the `Badge`.
- Figma draws a 1px outline around the last-used button. There is no token-backed recipe for it; render the badge only.
- There is no clear (X) button on `Input`. Figma shows one in the email field; leave it out.
- `RadioGroup variant='card'` renders separate cards 8px apart. Figma draws one joined list with dividers. Use the card variant.
- There is no "Show more" row in `RadioGroup`. Use a ghost `Button` under the group.
- Figma scrolls only the organization list. The recipe scrolls the whole card with `max-h-[calc(100dvh-64px)] overflow-y-auto`.
- `Tag` is always focusable (`tabIndex` 0), even without `onClick`. Figma uses it as a static chip; accept the extra tab stop.
- `FieldAction` omits `type` and `disabled` from the native button props. Use `Link disabled` for the resend countdown.
- `Text color` has no tertiary value, and `Text` takes no `className`. Use a `span` for the "OR" label.

## Related

- [Feedback toasts](feedback-toasts.md): the "Password reset" toast and the single `Toaster`.
- [Create and edit forms](create-edit-forms.md): `Field`, `FieldError` and required markers in other forms.
- [Spacing](../foundations/spacing.md): px utilities and `VStack` / `HStack` gaps.
- [Typography](../foundations/typography.md): `Heading` and `Text` sizes.
- [Color](../foundations/color.md): `bg-bg-surface-1`, `border-border-primary-light` and text colors.
- [Radius and elevation](../foundations/radius-elevation.md): `rounded-12` and why the card has no shadow.
