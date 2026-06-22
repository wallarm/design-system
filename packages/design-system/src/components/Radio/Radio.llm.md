# Radio — usage

> A single-select, one-of-a-set picker — a vertical group of options where exactly **one** wins. `RadioGroup` is the engine (owns the value + `name` + `variant`); each `Radio` is one self-labelling option. Built on Ark UI. Interactive.

## Reach for it when
A user picks **exactly one** option from a **short, fixed set** (~5 or fewer) where every option is worth showing at once and the set answers one question. Reach for it as the always-visible counterpart to `Select`. **Always a group** — `RadioGroup` owns the selected value; a lone `Radio` has no value owner and is meaningless (a single radio in product UI is almost always wrong — use `Checkbox` or `Switch`).

## Which part — route correctly
`RadioGroup` (holds the value) wraps N `Radio`s. Inside each `Radio`, in order: `RadioIndicator` (the dot — place it manually, it's not auto-injected), `RadioLabel` (the option's own name), optional `RadioDescription` (per-option helper text). Selection lives on the **group**, not the option — set `RadioGroup`'s `value`/`defaultValue` and the matching `Radio` lights up; there's no per-`Radio` "checked" control. Each `Radio`'s `value` is required and must be unique — use a stable semantic value (`value="pro"`), never the label text.

## Self-labelling — no Field label
Each `Radio` carries its own label via `RadioLabel`, so **never wrap a `RadioGroup` in a `Field` to add a label** — that double-labels it. The set's accessible name comes from **`FieldSet` + `FieldLegend`** (the legend *is* the name — "Choose a plan"); picking `FieldGroup` or omitting the fieldset silently drops it. A `Field`/`FieldSet` wrapper is only for the group heading, a group-level description, or validation — never a per-option label.

## Don't use it for
- **Multi-select** (independent yes/nos) → `Checkbox` / `CheckboxGroup`.
- **A longer list / saving vertical space** → `Select`. Not a hard cutoff — judgment driven by the form's height; don't bury a short choice in a dropdown, don't let a long one dominate the form.
- **A single on/off setting** → `Switch` (and a single consent / terms checkbox is a `Checkbox`, not a one-option radio).
- **A 2–4 inline view/mode toggle** → `SegmentedControl`. A set of *independent* toggles is a **row of `ToggleButton`s** (no group component — each holds its own state).

## Locked — don't override
- **Vertical column only** — `RadioGroup` hardcodes a stacked column; there is no horizontal/inline layout at this layer. Don't hand-manage the spacing.
- **`variant='default' | 'card'`, set on the group, never per `Radio`** — author every option identically. `card` = a bordered, surface-2 box per option with a brand border when checked; `default` is plain. Which to use is a **design-taste call** (a higher-emphasis selection target vs a plain list) — *not* driven by whether options carry descriptions (descriptions appear in either). Don't roll a custom card. (`card` is text-only today — richer per-option content like images/icons is a Figma-ahead change, not a prop.)
- **`RadioIndicator` is zero-prop** — the dot, size, fill, and focus ring are context-driven; don't restyle it or hand-toggle the checked state. Selection is derived from the group's value matching the `Radio`'s — exactly one at a time, always.
- **Layout is presence-driven** — adding a `RadioDescription` silently switches the item to a 2-col grid so the description indents under the label (not the dot). Label/description typography and color are fixed — no `className` recolor or emphasis per option. To flag or emphasize one option (a "Recommended" / "New" / "Popular" / "Beta" marker), put a `Badge` in its `RadioLabel` (it's a flex row built for it) — never recolor or bold the text.
- **Validation lives on the group** — there's no per-`Radio` error prop; a set-level invalid message belongs on the `FieldSet` / `Field` wrapper, following the Field validation pattern.

## Pairs with
- `FieldSet` + `FieldLegend` — the group's accessible name + heading (whenever the set answers one shared question); renders a real `<fieldset>`/`<legend>` a `<div>`+heading can't reproduce.
- `Field` — wraps a `RadioGroup` for a group description or validation only (never a label).
- `Select` — the boundary sibling: hides a value in a dropdown for longer lists; Radio shows all options at once for short sets.
- `Checkbox` / `Switch` / `SegmentedControl` / `ToggleButton` — the rest of the picker family (multi-pick / single on-off / inline 2–4 toggle / independent toggles).
- `Badge` — drop one into a `RadioLabel` to flag or emphasize an option (Recommended, New, Beta…).
- `Tooltip` — composes inside a `RadioLabel` (Info icon) for per-option help.

```tsx
<RadioGroup name="plan" defaultValue="pro" variant="card">
  <Radio value="free">
    <RadioIndicator />
    <RadioLabel>Free</RadioLabel>
    <RadioDescription>Up to 3 projects.</RadioDescription>
  </Radio>
  <Radio value="pro">
    <RadioIndicator />
    <RadioLabel>Pro</RadioLabel>
    <RadioDescription>Unlimited projects and history.</RadioDescription>
  </Radio>
</RadioGroup>
```
