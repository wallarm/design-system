# Field — usage

> The form-row wrapper — label, description, error, required marker, and the accessibility wiring around exactly **one** control (or one group of controls). Field is not a control itself. One compound family: the single labelled field plus the grouping parts (`FieldSet`/`FieldLegend`, `FieldGroup`, `FieldTitle`/`FieldSeparator`). Built on Ark UI.

## Reach for it when
You put a labelled control in a form. Pair `FieldLabel` + a **bare** control (`Input` / `Textarea` / `NumberInput` / `Select`) + optional `FieldDescription` + `FieldError`, all inside one `<Field>`. Field owns the label / description / error / required chrome — the control owns only its own look. **Every form control lives in a Field**; the lone exception is a deliberately label-less control (a search box that leans on its placeholder).

## Which part — route correctly
- **Single labelled field** (the common case) → `<Field>` › `FieldLabel` + control + optional `FieldDescription` / `FieldError`.
- **Grouped controls under one question** (a radio set, a checkbox set, related toggles) → `FieldSet` + `FieldLegend`. Renders a real `<fieldset>`/`<legend>` — the legend *is* the accessible group name ("Choose a plan"); the controls self-label. Use it whenever **2+ controls answer one question**.
- **Multi-field layout** (stack rows, section headings, dividers) → `FieldGroup` stacks `<Field>`s with consistent rhythm (and is the container-query host `orientation='responsive'` needs); `FieldTitle` is a decorative section heading; `FieldSeparator` is a divider. **Layout only — no group semantics.**
- **The test:** do the controls answer ONE shared question? Yes → `FieldSet` + `FieldLegend`. Independent fields that merely sit together? → `FieldGroup`. (Picking `FieldGroup` for a radio set silently drops the accessible group name; wrapping unrelated fields in a `FieldSet` invents a meaningless one.)

## Don't use it for
- **A self-labelling control** (`Checkbox` / `Radio` / `Switch`) — don't add a `FieldLabel`; they carry their own (`CheckboxLabel`, etc.). A `Field` around them is only for `orientation='horizontal'` layout, a `FieldSet`/`FieldLegend` group heading, a `FieldDescription`, or validation. A `FieldLabel` here **double-labels** them.
- **Styling the input** — turning a control red is the control's own `error` prop (`<Input error />`, `<SelectInput error />`), never anything on Field. Field owns the chrome; the control owns its look (prefix/suffix, icons, the numeric stepper are the control's, not Field's).
- **A message wider than one field** — `FieldError` is the **bottom rung** of the messaging ladder. Climb it: a form-level error (e.g. a failed save) → `Alert` near the form; page/platform-wide → `Banner`; transient confirmation → `Toast`; blocking decision → `Dialog`. Don't repurpose `FieldError` (hardcoded danger + alert role) for non-validation copy.
- **A group heading where you mean a control label** (or vice versa) — pick by **semantics**: a set answering one question → `FieldSet` + `FieldLegend`; one control's name → `FieldLabel`. Don't pick `FieldLegend variant='label'` because it *looks* like a small label — it's still a `<legend>`. `FieldTitle` is decorative, never a control's accessible name.

## Locked — don't override
- **The label↔control association is automatic for `Input` / `Textarea` — never hand-wire `id`/`htmlFor`.** Ark mints one shared id per `<Field>`; `FieldLabel` and a context-aware control both take it, in any order. **`NumberInput` is the exception** — it still needs a Field (it ships no label) but doesn't read field context yet, so its label-association and `required` aren't automatic (a known gap — pass `id`/`htmlFor` manually meanwhile). (A manual `id`+`htmlFor` pair is otherwise an escape hatch, not the default — and the pair must match or the link breaks silently.)
- **`required` is one prop on `<Field>`** — single source; it drives the marker AND the control's native `required`. Don't set it on the control too.
- **`FieldIndicator` is zero-prop and context-driven** — it renders `*` when the Field is `required`, `(Optional)` when it isn't. You don't write its text; you only choose whether to place it. (Placing it on a non-required field showing `(Optional)` is intentional, not a bug.)
- **`FieldError` is fixed** — always `role='alert'` + `OctagonAlert` icon + danger `Text`. Supply the message string only.
- **`FieldSet`/`FieldLegend` are the group-accessibility contract** — native `<fieldset>`/`<legend>`; a `<div>`+heading can't reproduce it. `variant` changes size only, never the element. A `CheckboxGroup` child also auto-swaps `<Field>`'s root to a `<fieldset>` — you don't choose this.
- **Spacing is emergent** — `orientation` (`vertical` default, `horizontal`, `responsive`), description margins, and `FieldSet`'s gap around a radio/checkbox group are baked in. Don't hand-manage margins or roll your own flex-row; reordering or wrapping children in an extra `<div>` can silently drop the auto-spacing.
- **`FieldAction`** is a fixed link-styled button pinned right **inside** `FieldLabel` (the "Generate new" / "Forgot password?" slot) — not restylable, never a primary button.

## Validation, marking & the message
- **Invalid state is two wires you sync yourself.** `<Input error />` paints the field red + sets `aria-invalid` but shows **no words**; `<FieldError>` shows the words but does **not** turn the field red (Field's own `invalid` doesn't reach the control). Set **both**, kept in sync. *(Known rough edge — flagged for the FE side; document the shipped reality.)*
- **The error replaces the description — don't stack both.** When the field is invalid, render `FieldError` *in place of* `FieldDescription` (the design intent; the component won't swap them for you, so do it conditionally).
- **Required vs optional marking** — both glyphs are sanctioned (`*` required, `(Optional)` optional); pick one convention and apply it **consistently across a form** — don't mark every field. Label is **on top**; `horizontal` is for a control beside its label (checkbox/switch rows), not text inputs.
- **Microcopy** — `FieldError` follows the house content rules: sentence case, name the field + the constraint, say how to fix it, no "please" (see the content guidelines).

## Not shipped — don't build yet
A **character counter** (`0/100`) and a **success / positive-validation** state are drawn in Figma but **not in code** — don't hand-roll either; revisit when they ship.

## Pairs with
- `Input` / `Textarea` — the bare controls that **require** a Field for label/description/error and read its context to auto-wire a11y. `NumberInput` also needs a Field but doesn't consume context yet (label / `required` not auto-wired — known gap).
- `Select` (`SelectInput`) — supplies the input *look*; Field supplies the label/error chrome around it.
- `Checkbox` / `Radio` / `Switch` (+ `CheckboxGroup`, which triggers the auto-fieldset) — self-labelling; Field wraps them for layout, a group heading, or validation only.
- `Alert` / `Banner` / `Toast` / `Dialog` — the messaging ladder; `FieldError` is its bottom rung.
- `Tooltip` — composes inside a `FieldLabel` for inline help. `Link` — `FieldAction` reuses its styling. `Separator` — `FieldSeparator` wraps it.

```tsx
<Field required>
  <FieldLabel>
    Username
    <FieldIndicator />
  </FieldLabel>
  <Input placeholder="Choose a username" error={hasError} />
  {hasError
    ? <FieldError>Username is already taken.</FieldError>
    : <FieldDescription>Letters, numbers, and dashes.</FieldDescription>}
</Field>
```
