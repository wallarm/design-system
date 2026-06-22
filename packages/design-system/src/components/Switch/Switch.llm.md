# Switch — usage

> A single **on/off setting** whose toggle applies **immediately** — the state *is* the value (dark mode, enable notifications), with no submit step. A self-labelling control (`SwitchControl` / `SwitchLabel` / `SwitchDescription`) — same shape as `Checkbox` and `Radio`. Built on Ark UI. Interactive.

## Reach for it when
A user flips **one binary setting that takes effect now** — turn a feature on, enable notifications. The on/off state *is* the value; there's no Save/Submit. Conceptually the *instant* sibling of `Checkbox`: a checkbox is "I agree / include this, **applied on submit**"; a switch is "this is on, **effective immediately**." A **single** Switch is the common, canonical case — one independent setting, not a group (unlike a lone `Radio`, which is meaningless).

## Which part — route correctly
`SwitchControl` (the track + thumb — place it manually **first**, it's not auto-injected and takes no props), then `SwitchLabel` (the setting's own name), then optional `SwitchDescription` (one helper line). State lives on the root: controlled via `checked` + `onCheckedChange`, or uncontrolled via `defaultChecked` — never wired to a submit handler. The default arrangement is **control-left / label-right** (ordinary forms); right-aligning the control in an **advanced/extended layout** (a full-width settings row, label left + control at the far edge) is a design-taste choice done through the surrounding **layout** — there's no right-alignment prop on the Switch (the Figma variant isn't wired in code), and it's not for ordinary forms.

## Self-labelling — no Field label
Switch carries its own label via `SwitchLabel`, so **never wrap it in a `Field` to add a label** — that double-labels it. A `Field`/`FieldSet` wrapper is only for a row description, validation, or a group heading (`FieldSet` + `FieldLegend` for a *set* of related settings) — never the control's own name. (Mirrors `Checkbox` / `Radio`.)

## Don't use it for
- **A choice applied on submit / part of a multi-select** → `Checkbox`. A single **consent / terms** toggle is a `Checkbox`, not a `Switch`. Rule of thumb: if toggling it should do *nothing* until the user clicks **Save**, it's a `Checkbox` — don't bolt a Save step onto a Switch; reconsider the control.
- **A button you *press* to flip a state or view now** (toolbar, formatting, show/hide a panel) → `ToggleButton`. `Switch` = a setting that *is* on/off; `ToggleButton` = press-to-flip.
- **One-of-a-set, mutually exclusive** → `Radio` / `RadioGroup`. A **2–4 inline view/mode toggle** → `SegmentedControl`.

## Locked — don't override
- **`SwitchControl` is zero-prop** — track size, thumb, brand fill when on, and focus ring are all context-driven off the on/off state. Don't restyle it or hand-toggle the on styling.
- **No size or style variant** — one fixed size, one look. There is no "small switch" and no bordered/card form; don't parameterize size or variant.
- **Layout is presence-driven** — adding a `SwitchDescription` silently switches the row to a 2-col grid so the description indents under the label. Child order is `SwitchControl` → `SwitchLabel` → `SwitchDescription`. Typography/color are fixed; `SwitchDescription` even rejects `className`. To emphasize a setting, drop a `Badge` in the `SwitchLabel` (it's a flex row built for it) — never recolor or bold the text.
- **`disabled` goes on the root only** — it auto-dims the whole row and blocks pointer events. Validation lives on the wrapping `Field` — there's no per-`Switch` error prop.
- **`a11yMode`** (opt-in, off by default) overlays a redundant ✕/✓ glyph in the track so on/off reads without relying on the brand color alone — turn it on where the on/off distinction is critical (e.g. a settings screen where color alone shouldn't carry the state).

## Pairs with
- `Field` — wraps a Switch for a row description, validation, or `orientation='horizontal'` layout only — never a label.
- `FieldSet` + `FieldLegend` — the accessible name + heading for a *set* of related switches (the legend *is* the name); the switches self-label. There is **no `SwitchGroup`** — stack independent switches yourself.
- `Checkbox` / `Radio` / `SegmentedControl` / `ToggleButton` — the rest of the picker family (submit / multi-pick / one-of-a-set / inline 2–4 toggle / press-to-flip).
- `Badge` — flag/emphasize a setting in its `SwitchLabel` (New, Beta). `Tooltip` — composes inside a `SwitchLabel` (Info icon) for inline help.
- `VStack` — stack several independent switches in a settings list.

```tsx
<Switch defaultChecked onCheckedChange={({ checked }) => save(checked)}>
  <SwitchControl />
  <SwitchLabel>Enable notifications <Badge>Beta</Badge></SwitchLabel>
  <SwitchDescription>Receive updates about new features.</SwitchDescription>
</Switch>
```
