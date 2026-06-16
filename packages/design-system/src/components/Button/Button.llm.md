# Button — usage

> The action workhorse — fires a one-shot action on click. Text and/or icon, four emphasis variants × four intent colors. Interactive.

## Reach for it when
Any in-page action that *does* something — submit, save, open a dialog, run a scan, confirm, cancel, trigger a menu. **Use Button, never a raw `<button>` or a styled `Text`/`div`** — it carries the focus ring, loading, disabled, sizing and icon handling for you. It's what the rest of the system builds on: Dialog/Drawer footers, Alert/Banner/Toast actions, and Table/FilterInput controls are all Buttons. An icon-only control is just a Button with a lone icon child — there is no separate IconButton.

## Don't use it for — reach for a sibling
The action family has five members; route to the right one before hand-rolling:
- **Navigating to a page/URL** → `Link`. (Want link behavior with button looks? `<Button asChild><a href=…/></Button>` — renders an `<a>`, keeps the styling.)
- **An on/off or pressed state** → `ToggleButton`. Button is one-shot, not stateful.
- **Opening a dropdown / showing a chosen value** → `Select` (its `SelectButton` trigger) — don't wire a Button to a menu yourself.
- **One main action with an attached menu of related actions** → `SplitButton`.
- A count/notification is `NumericBadge`, not a button — though it can sit *inside* a Button as a child.

## Locked — don't override
- **The color × variant matrix is partial — stay on the grid.** Only these combinations exist:
  - `brand` → `primary` · `secondary` · `ghost` (no `outline`)
  - `neutral` / `neutral-alt` → `outline` · `secondary` · `ghost` (no `primary`)
  - `destructive` → all four
  An off-grid combo (e.g. `brand` + `outline`) renders unstyled — it falls through. Want an *outlined brand* button? That cell doesn't exist: use `secondary` `brand` to emphasize, or `outline` `neutral` for a plain secondary.
- **Destructive actions = `color='destructive'`** — never restyle a brand button red by hand. The main confirm/delete is `primary` `destructive`; an inline or secondary destructive action is `ghost` `destructive`.
- **Loading is automatic** — `loading` swaps the label for a centered spinner, holds the button's width, and disables it. Don't build a spinner-in-a-button or toggle `disabled` for loading yourself.
- **Icon-only is auto-detected** — a lone icon child squares the button; don't add manual width or padding.
- **Labels**: `<verb> <object>` in sentence case — "Add rule", "Delete API", not a bare "Add" or Title Case. Never "Click here" / "Learn more" / "Read more" — those are navigation, so reach for `Link`.

## Choosing variant + color
Set both explicitly — don't lean on the code defaults (`primary` / `brand`).
- **`variant` = emphasis · `color` = intent.**
- **One `primary` per view** — the single main call-to-action. The standard pairing is **Save = `primary` `brand`, Cancel = `ghost` `neutral`**; most non-primary actions are `ghost` `neutral` too.
- **Raising a neutral action's emphasis:** `ghost` (default, quietest) → `outline` (medium) → `secondary` (when it must stand out against the surface it sits on).
- **`neutral-alt`** = the neutral button for **dark / inverted surfaces** (white-under-opacity, vs neutral's gray-under-opacity). Reach for it only on a dark background — e.g. the action inside a `Toast`.
- **`destructive`** = delete / irreversible actions.

## Sizing
`large` is the default — roomy pages, primary page actions, and **form / dialog footers**. `medium` for compact layouts and toolbars; `small` for dense tables and secondary chrome. Match the density of neighbours — don't size in isolation.

## Pairs with
- The rest of the Actions family — `Link`, `ToggleButton`, `SplitButton`, `Select`'s `SelectButton` (see routing above).
- `NumericBadge` — drops in as a child to show a count: `<Button>Alerts<NumericBadge>3</NumericBadge></Button>`.
- Action slots of `Dialog`, `Drawer`, `Alert`, `Banner`, `Toast` — all Buttons; follow each component's own action recipe (e.g. Dialog's destructive recipe).
