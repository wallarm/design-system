# SegmentedControl — usage

> A compact, **inline single-select** control — a horizontal row of mutually-exclusive segments where exactly **one** wins, used to switch a view/mode *now* (or hold a compact form value). `SegmentedControl` is the engine; each `SegmentedControlItem` is one segment. Built on Ark UI `SegmentGroup` (radio semantics) — it emits a value and owns **no** content panels. Interactive.

## Reach for it when
A user picks **exactly one** of a **small, known set** (2–4, practically up to ~7) and the pick takes effect **in place, now** — a view/mode switch in a toolbar or header (List/Grid, Day/Week/Month, Headers/Parameters/Schema), or a compact form value. Every segment is visible at once on one line. It's a **selection** control, not navigation: choosing a segment emits a value via `onChange` — **you** decide what that value shows.

## Which part — route correctly
One `SegmentedControl` wraps N `SegmentedControlItem` (the only selectable child — `value` required and **unique**; use a stable semantic value like `value="grid"`, never the label text; `disabled` goes per-item). The sliding active indicator is auto-rendered by the root — **don't hand-build the highlight** or hand-toggle checked styling; selection derives from `value` matching an item. The overflow "More" is manual: `SegmentedControlSeparator` + `SegmentedControlButton` (a real action button with `onClick`, **not** a selectable segment) — assemble it yourself when the set runs long.

## A Field note
Unlike `Checkbox` / `Radio` / `Switch`, SegmentedControl is **not** individually self-labelling. Segments label themselves, but the control *as a whole* is one compact form value — so in a form, wrap the **whole control** in a `Field` for the label/description (`FieldLabel` + `FieldDescription`). Never add a `FieldLabel` per segment. As chrome (a switcher above a table), it stands alone with no `Field`.

## Don't use it for
- **One-of-a-set answered in a form column** (longer labels, per-option descriptions, vertical list) → **`Radio`**. Decider: reads like a question in a form → `Radio`; reads like a compact inline view/mode toggle → SegmentedControl.
- **Page-level navigation between content panels** → **`Tabs`** (it owns the panels). SegmentedControl owns none. Never render segments as links or change the URL.
- **The same pill that also renders content panels** → **`SegmentedTabs`** (visual twin, built on Ark Tabs, owns `…Content`). Decider: does it manage the panel? Yes → `SegmentedTabs`; value only → SegmentedControl.
- **Independent toggles** where any number can be on at once → a **row of `ToggleButton`s** (no group component; each holds its own state). SegmentedControl is single-select — exactly one wins.
- **Binary on/off** → `Switch`. **A long list** → `Select` (past ~7, overflow to More or switch to `Select`).

## Locked — don't override
- **Value-only, single-select** — no multi-select; `onChange` swallows empty, so there's no "nothing selected" after the first pick — exactly one stays lit (ship one pre-selected).
- **No size, color, or card variant** — there's no size prop (item height floors at 28px); the only knobs are `fullWidth` (equal-fill) and per-item `disabled`. Indicator, track, and state colors are token-driven — don't restyle per-item, don't hand-build the indicator.
- **No built-in outer margin** — the control adds no space around itself; the surrounding layout owns its spacing.

## Pairs with
- `NumericBadge` — counts inside a segment (e.g. `Headers 33`); badge only the segments that need it.
- An icon — leading / trailing / icon-only inside a segment. **Icon-only segments need a `Tooltip` / `aria-label`** — the component won't name them for you.
- `SegmentedControlSeparator` + `SegmentedControlButton` + `DropdownMenu` — the manual More-overflow pattern.
- `Field` / `FieldLabel` / `FieldDescription` — wraps the whole control as one form value (never per-segment).
- `Radio` / `Checkbox` / `Switch` / `ToggleButton` — the rest of the picker family. `SegmentedTabs` — the panel-owning twin.

```tsx
<SegmentedControl defaultValue="grid" onChange={setView}>
  <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
  <SegmentedControlItem value="list">List</SegmentedControlItem>
</SegmentedControl>
```
