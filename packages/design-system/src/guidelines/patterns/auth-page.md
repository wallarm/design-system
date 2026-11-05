---
title: Auth page
description: Use when building a sign-in, organization select, SSO choice or password reset screen that shows one centered card on the animated background.
components: [AnimatedBackground, Logo, Heading, Text, VStack, HStack, Field, FieldLabel, FieldError, FieldGroup, Input, PasswordInput, OTPInput, PasswordComplexity, Button, Badge, Separator, RadioGroup, Radio, RadioIndicator, RadioLabel, Tag, Link, UtilityPage, Card, Toaster]
keywords: [auth, login, log in, sign in, sign-in, signin, sign up, password, forgot password, reset password, OTP, one-time code, verification code, SSO, single sign-on, continue with, OR separator, last used, organization select, tenant select, login card, AuthCard, AuthPage, LoginForm]
order: 100
---

# Auth page

An auth page is one 480px card, centered on `AnimatedBackground`, that holds one step of the sign-in flow.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Sign in with email and password | Auth card: email step, then password step | A `Dialog` over the app |
| Pick one of several organizations | Auth card with `RadioGroup variant='card'` | `Select` inside the card |
| Enter a reset code and a new password | Auth card with `OTPInput`, `PasswordInput`, `PasswordComplexity` | Six separate `Input`s |
| Show a 404, 403, 500 or offline screen | `UtilityPage` | The auth card |
| Show that the app loads after sign-in | `SplashScreen` | A spinner inside the auth card |

There is no `AuthCard`, `AuthPage`, `AuthLayout` or `LoginForm` component; copy the first example into your app.

## Rules

### Layout and spacing

- **Never** render the card inside `Page` or `AppShell`.
- `AnimatedBackground` centers the card. **Never** center it yourself with `fixed`, `absolute` or `translate`.
- Card: `w-[480px] rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80 flex flex-col gap-32`.
- **Never** add a shadow. **Never** use `Card`: it owns 16px padding.
- **Never** use `UtilityPage` for an auth step: its title is styled as an error code. **Never** copy its `w-[482px]`.
- **Never** copy the `AppShell` `LoginFlow` story; it has a shadow.
- Logo: `Logo type='full' size='md' className='mb-32 self-start'` (64px to the title).
- Title block: `VStack gap={0} align='start'`, `Heading size='2xl' weight='medium'` over `Text size='sm' color='secondary'`.
- Form: `VStack gap={16}` or `FieldGroup`. **Never** wrap `Field` to add margins.
- SSO and "Back" buttons: `variant='secondary' color='neutral' fullWidth`, stacked with `VStack gap={8}`. OR row: `HStack gap={12}` with two `Separator className='flex-1'` around a `span className='text-xs text-text-tertiary'`.
- **Never** pass `size` to `Button`, `Input` or `PasswordInput` in the card. The 36px defaults are correct.
- **Never** pass `className` to `Field`, `Heading` or `Text`. It is not applied.
- If the card outgrows the viewport, add `max-h-[calc(100dvh-64px)] overflow-y-auto`.
- Background: `bg-component-app-shell-bg`. There is no `bg-card`, `bg-primary` or `bg-surface`.

### Flow

- One card asks one thing. If a step needs two decisions, split it into two cards.
- If the email domain uses SSO, redirect after the email step. **Never** show an empty password step.
- If there are 6 or more organizations, show 5 and a ghost "Show more" `Button` under the group.

### Form behavior

- Use one `<form onSubmit>` per card; the primary `Button` is `type='submit' fullWidth`.
- Give every other `Button` in the form `type='button'`; without it, the button submits.
- **Never** put a bare `FieldAction` in a `<form>`: it submits the form. Use `FieldAction asChild` with an `<a href>`.
- `autoComplete`: `email`, `current-password` (sign-in), `new-password` (reset).
- Pass `otp` and `groupSize={3}` to `OTPInput`. The default groups 2 + 2 + 2.
- **Never** add `disabled={pending}` next to `loading`; use `disabled` only for an incomplete form. Keep fields enabled while pending.
- If sign-in fails, show `FieldError` under the password and keep both values. **Never** use an `Alert`, `Banner` or toast.
- If the code is wrong, pass `error` to `OTPInput` and add a `FieldError` in the same `Field`.
- Show the "LAST" badge on at most one button.
- For the resend countdown, use `Link disabled`. `FieldAction` takes no `disabled`.
- Import `FieldAction` and `FieldIndicator` from `@wallarm-org/design-system/Field`, `useToast` from `@wallarm-org/design-system/Toast`, icons from `@wallarm-org/design-system/icons`.

### Copy

| Part | Write | Not |
| --- | --- | --- |
| Sign-in title / subtitle | "Welcome back!" / "Sign in to your account" | "Login" |
| Other titles | "Select organization", "Reset password" | "Choose org" |
| Credentials error | "Email or password is incorrect." | "Wrong password", "User not found" |
| Submit | "Sign in" on the password step, "Continue" elsewhere | "Log in", "Submit", "Next" |
| SSO button | "Continue with {provider}" | "Sign in with SSO" |
| Separator | "OR" | "or continue with" |
| Organization subtitle | "Choose which organization to sign in to." | "Select one" |
| Reset subtitle | "We've sent a code to {email}" | "Check your inbox" |
| Resend | "Resend in {n}s", then "Resend code" | "Didn't get it?" |
| Reset toast | "Password reset" | "Your password was reset successfully!" |
| Placeholders | "you@your-company.com", "Enter" | "Email", "Password" |

- **Never** say which credential is wrong. Use sentence case.

## Examples

The card shell every step renders inside.

```tsx
import type { ReactNode } from 'react';
import { AnimatedBackground, Heading, Logo, Text, VStack } from '@wallarm-org/design-system';

export const AuthCard = ({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) => (
  <AnimatedBackground className='min-h-screen w-full bg-component-app-shell-bg'>
    <div className='flex max-h-[calc(100dvh-64px)] w-[480px] flex-col gap-32 overflow-y-auto rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80'>
      <Logo type='full' size='md' className='mb-32 self-start' />
      <VStack gap={0} align='start'>
        <Heading size='2xl' weight='medium'>{title}</Heading>
        <Text size='sm' color='secondary'>{subtitle}</Text>
      </VStack>
      {children}
    </div>
  </AnimatedBackground>
);
```

A password field with "Forgot password?" as a link and the failed state.

```tsx
<Field invalid={failed}>
  <FieldLabel>
    Password
    <FieldAction asChild>
      <a href={forgotPasswordHref}>Forgot password?</a>
    </FieldAction>
  </FieldLabel>
  <PasswordInput autoComplete='current-password' placeholder='Enter' error={failed} value={password} onChange={handlePasswordChange} />
  {failed && <FieldError>Email or password is incorrect.</FieldError>}
</Field>
<Button type='submit' fullWidth loading={pending}>Sign in</Button>
```

The OR row and an SSO button carrying the "LAST" badge.

```tsx
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
      <Badge size='small' color='blue' className='absolute -top-6 -right-8 uppercase'>Last</Badge>
    )}
  </div>
</VStack>
```

Organization select, collapsed to 5 rows with "Show more".

```tsx
<VStack gap={8}>
  <RadioGroup variant='card' value={value} onValueChange={handleValueChange}>
    {visible.map(org => (
      <Radio key={org.id} value={org.id}>
        <RadioIndicator />
        <RadioLabel>{org.name}</RadioLabel>
      </Radio>
    ))}
  </RadioGroup>
  {organizations.length > 5 && (
    <Button variant='ghost' color='neutral' onClick={handleToggle}>
      {expanded ? 'Show less' : 'Show more'}
    </Button>
  )}
</VStack>
```

The reset code field with a resend countdown, and the full password rule list from `passwordValidators`.

```tsx
<Field required>
  <FieldLabel>
    Code
    <FieldIndicator />
    <Link asChild size='sm' weight='medium' disabled={secondsLeft > 0} onClick={onResend} className='ml-auto'>
      <button type='button'>{secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}</button>
    </Link>
  </FieldLabel>
  <OTPInput otp groupSize={3} onValueChange={handleCodeChange} />
</Field>
<PasswordComplexity
  items={[
    { id: 'length', label: 'At least 8 characters', met: passwordValidators.minLength(8)(password) },
    { id: 'uppercase', label: 'One uppercase letter (A–Z)', met: passwordValidators.hasUppercase(password) },
    { id: 'lowercase', label: 'One lowercase letter (a–z)', met: passwordValidators.hasLowercase(password) },
    { id: 'number', label: 'One number (0–9)', met: passwordValidators.hasNumber(password) },
    { id: 'symbol', label: 'One symbol (e.g. ! ? @ #)', met: passwordValidators.hasSymbol(password) },
    { id: 'match', label: 'Both passwords match', met: passwordValidators.passwordsMatch(password, confirm) },
  ]}
/>
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Email step | Email field and "Continue" | `Field` + `Input type='email'` |
| Password step | Password, "Forgot password?", OR, SSO | `PasswordInput`, `FieldAction asChild` |
| Submitting | Spinner on "Sign in" | `Button loading` |
| Wrong credentials | Red password border, error line | `Field invalid`, `PasswordInput error`, `FieldError` |
| Last used method | "LAST" on one button | `Badge size='small' color='blue'` |
| SSO redirect | Spinner on the clicked button only | `Button loading` |
| Organization chosen | Building icon, name, "Change" above the fields | `Tag` + `Link type='muted' size='sm'` |
| 6+ organizations | 5 rows, then "Show more" / "Show less" | Ghost `Button` |
| Resend countdown | "Resend in 55s", disabled | `Link disabled` |
| Password rules | Dot for unmet, check and strike-through for met | `PasswordComplexity` |
| Reset done | Sign-in card, then a toast | `toast.create({ title: 'Password reset', type: 'default' })` |

## What your app owns

- Step routing, the password-or-SSO lookup, credential checks, `pending` and error state, SSO redirects, the resend timer, code verification and the reset email.
- Storing the last-used method (cookie or `localStorage`).
- One `Toaster` at the app root.

These do not exist:

- A `variant` on `UtilityPage`.
- A `label` prop on `Separator`, or a badge prop on `Button`.
- A "Show more" row in `RadioGroup`. The card variant shows separate cards, not one joined list.
- A clear (X) button on `Input`, or a tertiary `Text color`.
- An outline for the last-used button. Render the badge only.
- A non-focusable `Tag`. Accept the extra tab stop.

## Related

- [Feedback toasts](./feedback-toasts.md): the "Password reset" toast and the single `Toaster`.
- [Create and edit forms](./create-edit-forms.md): `Field`, `FieldError` and required markers.
- [Spacing](../foundations/spacing.md): px utilities and stack gaps.
- [Typography](../foundations/typography.md): `Heading` and `Text` sizes.
- [Color](../foundations/color.md): surface, border and text tokens.
- [Radius and elevation](../foundations/radius-elevation.md): `rounded-12` and why the card has no shadow.
