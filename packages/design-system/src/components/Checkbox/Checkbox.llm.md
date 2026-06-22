# Checkbox — usage

> One or more **independent yes/nos** — each box toggles on its own, with three states (unchecked / checked / indeterminate). A single `Checkbox` is a self-labelling control; `CheckboxGroup` is the **optional** engine for a multi-select set (owns the value **array** + `name` + `variant`). Built on Ark UI. Interactive.

## Reach for it when
A user answers an **independent** yes/no. Two shapes:
- **Standalone** — a single consent / terms / "remember me" / acknowledgement toggle. This is a **primary, canonical** case — a lone `Checkbox` is fully valid (unlike a lone `Radio`).
- **A `CheckboxGroup`** — a short, fixed multi-select set (~5 or fewer, every option worth showing) that answers one question and collects the checked options into a value **array** (zero, some, or all).

## Which part — route correctly
`CheckboxGroup` is **optional** — use it only for a multi-select set (it owns `value`/`defaultValue` as a string **array**, `name`, `variant`); **omit it entirely for a standalone checkbox**. Inside each `Checkbox`, in order: `CheckboxIndicator` (the box — place it manually, it's **not** auto-injected), `CheckboxLabel` (the option's own name), optional `CheckboxDescription` (per-option helper). A `value` is **required and unique only inside a group** (use a stable semantic value — `value="react"`, never the label text); a standalone checkbox needs no `value` — just `checked` + `onCheckedChange`.

## Indeterminate & select-all
`checked` is tri-state — `true | false | 'indeterminate'` (a dash, not a tick). Indeterminate is a **state you set** (`checked='indeterminate'`), never a value the engine computes. Its main use is the **select-all / parent** pattern: a parent that's `checked` when all children are, `'indeterminate'` when only some are. The component renders the dash; **you own the all/some/none wiring** (no shipped aggregation helper). The select-all checkbox sits **outside/above** the group as its own standalone `Checkbox` — a `CheckboxGroup` only tracks an array of fully-checked values and has no "partial" state.

## Self-labelling — no per-option Field label
Each `Checkbox` carries its own label via `CheckboxLabel`, so **never add a per-option `FieldLabel`** — that double-labels it. A **set's** accessible name comes from a `FieldSet` + `FieldLegend` (the legend *is* the name); a `Field`/`FieldSet` wrapper is for the group heading, a group-level description, or validation — never per-option labels. (A `CheckboxGroup` child also auto-swaps a plain `<Field>`'s root to a real `<fieldset>` — see Field.)

## Don't use it for
- **One-of-a-set, mutually exclusive** (picking one clears the rest) → `Radio` / `RadioGroup`.
- **A single on/off setting that applies immediately** (the state *is* the value — dark mode, notifications) → `Switch`. A checkbox is selection/consent inside a **submitted** form; a single consent / terms toggle is a `Checkbox`, not a `Switch` and not a one-option radio.
- **A longer multi-select list / saving vertical space** → multiselect `Select` (hides options in a dropdown; picked values become removable `Tag`s + "+N"). A checkbox set shows all options at once. Not a hard cutoff — judgment driven by form height; don't bury a short multi-pick in a dropdown, don't let a long one dominate the form.
- **A 2–4 inline view/mode toggle** → `SegmentedControl`. A set of independent toggles → a row of `ToggleButton`s.

## Locked — don't override
- **`CheckboxIndicator` is zero-prop** — box size, brand fill, focus ring, and tick-vs-dash glyph are all context-driven off the checked state. Don't restyle it or hand-pick the glyph.
- **`variant='default' | 'card'`, set on the group, never per `Checkbox`** — author every option identically (a standalone checkbox has no group, so no variant). `card` = bordered surface-2 box, brand border when checked **or** indeterminate; `default` is a plain list. Which to use is a **design-taste call** — *not* implied by whether options carry descriptions. `card` is text-only today (richer per-option content is a Figma-ahead change, not a prop).
- **Layout is presence-driven** — adding a `CheckboxDescription` silently switches the item to a 2-col grid so the description indents under the label, not the box. Typography/color are fixed; both parts (and `CheckboxGroup`) `Omit` `className`. To emphasize one option, put a `Badge` in its `CheckboxLabel` (it's a flex row built for it) — never recolor or bold the text.
- **A checkbox *set* is a vertical column only** — `CheckboxGroup` hardcodes a stacked column; there is **no horizontal layout for a set** (don't apply `orientation='horizontal'` to the group expecting a row — that's not what it does). `Field orientation='horizontal'` lays out a **single** checkbox beside its own label, not a row of options.
- **Validation lives on the wrapping `Field`/`FieldSet`** — no per-`Checkbox` error prop; a set-level (or single-consent) invalid message rides the wrapper, following the Field validation pattern.

## Pairs with
- `FieldSet` + `FieldLegend` — a checkbox **set's** accessible name + heading (the legend *is* the name); renders a real `<fieldset>`/`<legend>`. (A `CheckboxGroup` child also auto-swaps a plain `Field` to a fieldset.)
- `Field` — wraps a `CheckboxGroup` or standalone `Checkbox` for a description, `orientation='horizontal'`, or validation only — never a per-option label.
- `Radio` / `Switch` / `SegmentedControl` / `ToggleButton` — the rest of the picker family (one-of-a-set / single on-off / inline 2–4 toggle / independent toggles).
- `Select` — the boundary sibling: hides a longer multi-select in a dropdown with removable `Tag`s; Checkbox shows all options at once for short sets.
- `Badge` — drop one into a `CheckboxLabel` to flag/emphasize an option (Recommended, New, Beta). `Tooltip` — composes inside a `CheckboxLabel` (Info icon) for per-option help.

```tsx
// Standalone — the canonical case (no group, no value)
<Checkbox defaultChecked>
  <CheckboxIndicator />
  <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
</Checkbox>

// Multi-select set — value is an array
<CheckboxGroup name="framework" defaultValue={['vue']}>
  <Checkbox value="react">
    <CheckboxIndicator />
    <CheckboxLabel>React <Badge>New</Badge></CheckboxLabel>
  </Checkbox>
  <Checkbox value="vue">
    <CheckboxIndicator />
    <CheckboxLabel>Vue</CheckboxLabel>
  </Checkbox>
</CheckboxGroup>
```
