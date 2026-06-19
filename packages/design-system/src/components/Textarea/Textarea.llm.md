# Textarea — usage

> The multi-line free-text control — the sibling of `Input`. A bare, label-less native `<textarea>` that owns only its own box: border, padding, focus ring, placeholder, and the red error paint. No built-in label, description, or error message — those live in `Field` (a character counter is drawn in Figma but isn't shipped anywhere yet). It reuses Input's exact box look and reads Ark's `Field` context to auto-wire the a11y.

## Reach for it when
A user types **wrapping, free-form prose that can run to multiple rows** — a description, comment, note, message, payload/body, or multi-line config. The single-vs-multi-line decision is the whole call: **single line → `Input`, multi-row → Textarea** — the rule is the expected length of the answer. Textarea ships **no label** — it **requires** a `Field` for its label/description/error and reads that Field's context to auto-wire the a11y.

## Don't use it for
- **A one-line answer** (name, domain, token, email) → `Input`.
- **Rich text or formatting** — Textarea is plain text only; there is no formatted / rich-text editor here.
- **An icon, prefix, suffix, or any inline affordance** — Textarea takes **no `InputGroup` adornments** (those are the single-line `Input`-in-`InputGroup` pattern).
- **A character counter / limit** (`0/100`) — not shipped; don't hand-roll one on Textarea. (`maxLength` passes through natively but only hard-caps silently, with no affordance.)
- **The label** — the placeholder is not a label and never carries required instructions (it vanishes on input). Keep it an action-oriented example; persistent guidance goes in `FieldDescription`.

## Locked — don't override
- **The box look is shared with `Input`, not its own** — border, background, `rounded-8`, padding, shadow, focus ring, placeholder color, and the whole error palette come from `inputVariants`. Textarea adds only vertical rhythm. Don't restyle the box, and don't expect Input's fixed `h-36` height — a textarea is floored by a per-size `min-h`, not a single-line height.
- **Resize is the native browser default (`both`) and can't be constrained** — there's **no prop to limit it and no `className` escape hatch** (className isn't accepted), so you can't lock it to vertical-only or cap its width today; dragging the corner can stretch it wider than its column. There's also **no auto-grow, no component-set `rows`, and no max-height** — only a per-size `min-h` floor. The bottom-right grip is a **decorative** glyph (`pointer-events-none`) over the suppressed native resizer; resize still works by dragging. *(Vertical-only / a width cap is the likely intent but isn't built — flagged for the FE side; don't hand-hack it.)*
- **`size` changes how tall it *starts*, not the text size** — it only adjusts vertical padding + the `min-h` floor; all sizes share the same text size. Don't reach for `size` expecting a denser or smaller-text control — there's no compact/dense Textarea variant.
- **`error` is one coordinated red palette** — repaints border + focus/hover ring red **and** sets `aria-invalid` on the same prop. It shows **no words** (see Validation).
- **`disabled` sets both `disabled` and `aria-disabled`**; width is **`w-full`** (sizing is the parent layout's job, never a prop).
- **Field wiring is automatic** — inside a `<Field>` the id / label association / `required` ride in via context. **Never hand-set `id`/`htmlFor`.** Outside a Field it degrades to a plain styled textarea.

## Validation — two wires you sync yourself
`<Textarea error />` paints the field red + sets `aria-invalid` but shows **no words**; `<FieldError>` shows the words but does **not** turn the field red. Set **both**, kept in sync, and render `FieldError` *in place of* `FieldDescription` when invalid. *(Same rough edge as the rest of the forms family — document the shipped reality.)*

## Pairs with
- `Field` (+ `FieldLabel` / `FieldDescription` / `FieldError` / `FieldIndicator`) — the **required** wrapper; supplies the label/description/error chrome and auto-wires a11y. Textarea supplies only the box.
- `Input` — the single-line sibling under the same Field contract and the same `inputVariants` box; the boundary is answer length.
- `NumberInput` / `InputOTP` / `Select` (`SelectInput`) — sibling controls under the same Field contract.

```tsx
<Field required>
  <FieldLabel>
    Description
    <FieldIndicator />
  </FieldLabel>
  <Textarea placeholder="Describe what this key is for" error={hasError} />
  {hasError
    ? <FieldError>Description is required.</FieldError>
    : <FieldDescription>Optional context for your teammates.</FieldDescription>}
</Field>
```
