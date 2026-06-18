# ToggleButton — usage

> Button's stateful sibling — a single control that holds an on/off (pressed) state. Two variants × two colors; same base as Button. Interactive.

## Reach for it when
You need a button-shaped **on/off** that stays pressed: a toolbar toggle (bold, grid↔list view), show/hide a panel, a filter pill that stays active. Reach for it whenever a `Button` would fit *except that the control has to remember it's "on."* For several related toggles, lay out a **row of ToggleButtons** — there's no group component, you compose them and each holds its own state.

## Don't use it for
- A **setting / preference** that's simply on or off → `Switch`. Rule of thumb: `Switch` = a setting that *is* on/off; `ToggleButton` = a control you *press* to flip a state or view now.
- **Mutually-exclusive** options where exactly one wins → `SegmentedControl` (or `Tabs` to switch views). A set of *independent* toggles is a row of ToggleButtons, **not** SegmentedControl.
- A selection inside a form or list → `Checkbox` / `Radio`.
- A one-shot action that doesn't stay pressed → `Button`.

## Locked — don't override
- **Smaller matrix than Button** — `variant` is only `outline` | `ghost`, `color` is only `brand` | `neutral`. No `primary` / `secondary` / `destructive` / `neutral-alt`; stay on this grid.
- **It fires `onToggle(active, event)`, not `onClick`.** State is the `active` prop (Figma calls it "Selected") — controlled via `active` + `onToggle`, or uncontrolled via `defaultValue`. Don't wire `onClick` or hand-toggle the pressed styling.
- **Icon-only needs an `aria-label`.** Icon-only is auto-detected (squares the button); the accessible name is not — without text there's nothing to announce.
- **`loading` disables it** and holds its size — don't also toggle `disabled`.

## Choosing variant + color
Default to **`ghost` + `neutral`, and set both explicitly** — the code defaults (`outline` / `brand`) are not the common case. Emphasis follows Button's ladder: `ghost` (quiet, default) → `outline` when the toggle needs a visible container. Use `color="brand"` only to emphasize a key toggle or make its active state stand out. Sizing matches Button — `large` default, `medium` compact, `small` dense; match neighbours.

## Pairs with
- `NumericBadge` — optional count inside the toggle: `<ToggleButton>Filters<NumericBadge>3</NumericBadge></ToggleButton>`.
- An icon — left, right, or both, to reinforce meaning or direction; icon-only for compact toggles (+ `aria-label`).
- `Button` — the one-shot sibling on the same base; see Button for the shared emphasis logic.
