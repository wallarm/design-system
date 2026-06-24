# Popover — usage

> A **non-modal overlay anchored to a trigger** that holds rich, custom content — the
> page stays live behind it and it dismisses on outside-click / Esc. Compound
> (`Popover` + `PopoverTrigger` + `PopoverContent`), built on Ark UI. A **layout**
> component: the middle rung between `Tooltip` and `Dialog` / `Drawer`.

## Reach for it when
You need **more than a passive label but less than a full modal or panel**, anchored to
the element the user clicked, without taking over the screen. It's deliberately
general-purpose — contextual detail or **stats on a chart point** (opened on **click** —
a passive *hover* readout, even a rich one, is a `Tooltip`), a small form or filter
cluster, a few secondary controls, a summary with a "go deeper" link. Opened by **user
action** from a trigger; the page behind stays interactive. Reach for it by its
**place on the ladder** (richer than `Tooltip`, lighter and non-blocking vs `Dialog` /
`Drawer`) rather than a single fixed use-case.

## Don't use it for
- **A passive one-line label / hint / shortcut** (hover, no interaction) → `Tooltip`. No rich markup and nothing actionable → it's a tooltip.
- **A list of commands / actions / navigation** → `DropdownMenu` — it owns menu semantics, item roles, and keyboarding. A Popover is a freeform container, not a menu; don't rebuild a menu inside one.
- **A blocking decision, or a flow that must be completed / confirmed** → `Dialog` (modal, traps focus). Popover is non-modal — the page stays usable — so don't gate critical or destructive task-completion behind it.
- **An object's full detail, or a long / multi-section panel** → `Drawer` (side panel) → full page. Popover is bounded (defaults clamp to ~560×560, scrolls internally); if the content wants persistence or more room, climb the ladder.
- **Picking a form-field value from a list** → `Select` (the labelled field control), not a hand-built popover.
- **Anything that should be inline by default, or shown on page load** — a popover is user-triggered; never auto-open one (to *promote* a feature on load, that's `Tour` / a beacon).

## Locked — don't override
- **Non-modal + user-triggered** — the page stays interactive behind it; it opens from its trigger and dismisses on outside-click / Esc. Don't use it where you must block the page (→ `Dialog`), and don't auto-open it.
- **Anchored via `PopoverTrigger`** — wrap your real control with `asChild` (it defaults to **not** `asChild`, so pass `asChild` to use your own `Button` / element). Positioning (gutter + offset, auto-flip to stay in view) is automatic — don't hand-position.
- **The look is fixed** — `bg-surface-2`, rounded-12, border, shadow, 12px padding, portal, fade/zoom animation. Don't restyle it.
- **Content is a raw slot you compose** — Popover ships **no** `PopoverTitle` / `Description` / `Close` / arrow sub-parts (those are design-TBD — don't expect or invent them). Build the inner layout yourself (`VStack` + `Text`, an `Alert`, a form…). Dismissal is automatic, so add a close button only if the content genuinely needs one.
- **Built-in internal scroll + size clamp** — content scrolls inside (a `ScrollArea`) and the box clamps between its min/max against available space; don't add your own scroll container.

## Sizing / judgment calls
- **`minWidth` / `maxWidth` / `minHeight` / `maxHeight`** on `PopoverContent` (each `'<n>px'` | `'auto'` | `'unset'`; defaults ~256–560 wide, 156–560 tall) — size to the content but keep it **bounded**. If it wants to exceed ~560 or hold a long flow, that's a `Drawer` / `Dialog`, not a bigger Popover.
- **Controlled `open` / `onOpenChange`** — optional; use to drive it programmatically (open from an action, close on submit/success). Otherwise it's uncontrolled via the trigger.
- **Nesting works but use sparingly** — deep stacks of popovers get hard to track and dismiss.

## Pairs with
- `PopoverTrigger` (`asChild`) + a `Button` or other control — the anchor.
- The content you compose — `Text` / `VStack`, `Alert`, a `Field`-based form, `Button`s, chart / stat widgets.
- Ladder neighbors: `Tooltip` (lighter, passive), `DropdownMenu` (command menus), `Dialog` / `Drawer` (heavier, modal / persistent), `Select` (form-field value).
