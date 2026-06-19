# Input — usage

> The single-line free-text control. A bare, label-less `<input>` that owns only its own box — border, height, padding, focus ring, placeholder, and the red error paint — and nothing else. No built-in label, description, error message, icon, prefix, or suffix; those live in `Field` (chrome) and `InputGroup` (adornments). It's a native `<input>` that reads Ark's `Field` context.

## Reach for it when
A user types **one line of free-form text** into a form — a name, domain, token, email, search string, password. Set `type` to match the data (`email` / `password` / `url` / `search` / `tel`) so they get the right keyboard, validation, and autofill. Input ships **no label** — it **requires** a `Field` for its label/description/error and reads that Field's context to auto-wire the a11y. The lone exception is a deliberately self-evident, label-less control: a search box that leans on its placeholder.

## Don't use it for
- **Multi-line / wrapping prose** → `Textarea`. The rule is the expected length of the answer: single line → Input, multi-row → Textarea.
- **A numeric value with steppers or min/max** → `NumberInput` (it ships the increment/decrement stepper). `<Input type="number">` is not the house pattern.
- **Picking from a predefined, finite list** → `Select` / `SelectInput` — free text vs pick-from-list (a *single* creatable value not in any list is still a free-text Input). **Many values as removable chips:** picking several from a known list → multiselect `Select` (renders removable `Tag`s); a *filter* that produces a result set → `FilterInput` (owns its own chips). There is **no free-text tag/token input** — don't hand-roll one on top of Input.
- **A fixed-length code in discrete boxes** (2FA / OTP / verification code) → `InputOTP`, never a plain Input with `maxLength`.
- **An icon, prefix, suffix, inline button/Select, ⌘K hint, clear button, or password toggle** — none of these are props on Input; they don't exist on it by design. Wrap it in `InputGroup` + `InputGroupAddon` / `InputGroupText`. There is **no Search and no Password component** — a search field is a plain Input (placeholder-only is fine) optionally dressed with a leading icon via `InputGroup`; a password field is `<Input type="password">` with any show/hide toggle composed in `InputGroup`.
- **The label** — the placeholder is not a label and never carries required/critical instructions (it vanishes on input). Keep the placeholder to an action-oriented example (`"Search endpoints"`); persistent guidance goes in `FieldDescription`.

## Locked — don't override
- **The box look is fully baked** — height (`h-36`), padding, `rounded-8`, border, background, shadow, and the focus ring all come from `inputVariants`. `className` appends last for targeted overrides, not for rebuilding the baseline. **There is no size axis** — `error` is the only variant; smaller sizes are unresolved in Figma and not built, so don't shrink it via `className` for a dense row (a compact context is a layout decision, not an Input prop).
- **`error` is one coordinated red palette, not a color choice** — it repaints the whole interaction set (border, focus + hover ring) red **and** sets `aria-invalid` on the same prop, so the look and the a11y bit never drift. It shows **no words** (see Validation).
- **`disabled` sets both `disabled` and `aria-disabled`** — the dim look is gated on both, so it always shows. You pass one prop.
- **Width is `w-full`** — the input fills its container; sizing is the parent layout's job, never a prop.
- **Field wiring is automatic** — inside a `<Field>` the id / label association / `required` ride in via context. **Never hand-set `id`/`htmlFor`** — placing it in a Field *is* the mechanism. Outside a Field it degrades to a plain styled input (no label association).

## Validation — two wires you sync yourself
`<Input error />` paints the field red + sets `aria-invalid` but shows **no words**; `<FieldError>` shows the words but does **not** turn the field red. Set **both**, kept in sync, and render `FieldError` *in place of* `FieldDescription` when invalid. *(Known rough edge — same as the rest of the forms family; document the shipped reality.)*

## Pairs with
- `Field` (+ `FieldLabel` / `FieldDescription` / `FieldError` / `FieldIndicator`) — the **required** wrapper; supplies the label/description/error/required chrome and auto-wires a11y. Input supplies only the input look.
- `InputGroup` (+ `InputGroupAddon` / `InputGroupText`) — where every icon / prefix / suffix / inline addon / clear / password-toggle affordance lives.
- `Textarea` / `NumberInput` / `InputOTP` / `Select` (`SelectInput`) — sibling controls under the same Field contract; the boundaries above route to them.

```tsx
<Field required>
  <FieldLabel>
    Endpoint
    <FieldIndicator />
  </FieldLabel>
  <Input type="url" placeholder="https://api.example.com" error={hasError} />
  {hasError
    ? <FieldError>Enter a valid URL.</FieldError>
    : <FieldDescription>The base URL we'll send requests to.</FieldDescription>}
</Field>
```
