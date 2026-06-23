# InputOTP — usage

> The one-time-code / PIN field — a short, fixed-length code typed box-by-box (built on Ark UI's PinInput). The boxes share the forms-family look (mono, uppercase, border-collapsed cells, one height) and the OTP keyboard logic — auto-advance, paste-a-whole-code, backspace — is built in. Interactive. **Naming heads-up:** the directory + import path are `InputOTP`, but the exported symbol is **`OTPInput`** → `import { OTPInput } from '@wallarm-org/design-system/InputOTP'`.

## Reach for it when
A user enters a **short, single-use verification code, split box-by-box** — an SMS / email 2FA code, an authenticator (TOTP) code, an email confirmation or an approval code. It's a **rare** control for these verification/approval moments only. The defining trait is **single-use**: a code the user *just received* and types once, not a number they keep. The existence cue: when you'd otherwise hand-roll N single-character inputs or a plain `Input` with `maxLength`, reach for this — it already owns focus-advance, paste-to-fill, and backspace. Ships **no label** — wrap it in a `Field` like the rest of the family.

## Don't use it for
- **A fixed-length number that's really a stored identifier** — credit-card / account / IBAN / ID / phone number → `Input`. Fixed length alone is **not** the cue: OTP is for a one-time code the user types once, never a value they hold and reuse.
- **Any other free-text or variable-length value** → `Input`.
- **A password / API token / long secret** → `Input type="password"`. (For a sensitive short *code*, keep InputOTP and set `mask`.)
- **A single number** (quantity, port, page size) → `NumberInput`; **picking from a list** → `Select`.

## Locked — don't override
- **The OTP keyboard logic is built in** — auto-advance on type, paste fills all boxes, backspace retreats, one character per box. Don't reimplement it or drop in raw inputs.
- **The cell look is baked** — mono, **uppercase**, centered, `h-36`, border-collapsed boxes with rounded group ends, em-dash (`—`) separator between groups. **One size**, no size axis; the focus / error / disabled states are identical to the text `Input` ("states as in text input").
- **`error` is one coordinated red palette** — maps to Ark's `invalid`, repaints the boxes red + sets the invalid bit, shows **no words**. Validation is the same double-wire as the family (`error` on the control + `<FieldError>` for the message, kept in sync).
- **Field context isn't auto-wired** — like `NumberInput`, InputOTP doesn't read `Field` context, so a `Field` gives the visual label / description / error chrome but nothing connects automatically: clicking the label won't focus the boxes, and `FieldError` isn't tied to them (`aria-describedby`), so a screen reader gets the invalid *state* without the *message*. Same known forms-family gap; don't hand-wire `id`/`htmlFor`.

## Composition — grouping & code type (product-case)
Length and grouping are yours to set per product case. Sanctioned layouts (here for a 6-digit code, em-dash separators):
- **`XX—XX—XX`** — `groupSize={2}` (the default)
- **`XXX—XXX`** — `groupSize={3}`
- **`XXXXXX`** — `groupSize={0}` (no grouping)

Set `count` to the real code length (4–8 typical; 6 default). Set **`type` explicitly**: `numeric` for digit codes, `alphanumeric` for letters+digits — the code default is `alphanumeric`, so a numeric SMS code needs `type="numeric"`. Also set **`otp`** for an SMS/auto-fillable code (enables one-time-code autofill), and **`mask`** when the code is sensitive. The value is a **`string[]`** (one char per box, not a single string); **`onValueComplete`** fires when the last box is filled — the natural trigger to submit/verify.

## Pairs with
- `Field` (+ `FieldLabel` / `FieldDescription` / `FieldError`, and `FieldAction` for a **"Resend code"** link in the label row) — the wrapper that supplies the label / description / error / action chrome, same as every input.
- `Input` / `NumberInput` / `Textarea` / `Select` — sibling controls; the boundaries above route between them.

```tsx
<Field required>
  <FieldLabel>
    Verification code
    <FieldAction onClick={resend}>Resend code</FieldAction>
  </FieldLabel>
  <OTPInput count={6} type="numeric" otp onValueComplete={verify} error={hasError} />
  {hasError && <FieldError>That code didn't match.</FieldError>}
</Field>
```
