# Dialog — usage

> A centered modal overlay for a short, focused task or decision — confirm, delete,
> a one-field create / rename. Composed from sub-components; the lightest rung of the
> overlay ladder (built on `Drawer`, minus resize).

## Reach for it when
A **short, self-contained task or decision that should interrupt and block** the page
until the user acts: a confirmation, a destructive delete, a one-field create /
rename, a quick form or settings. It's the lightest, most focused overlay — centered
and modal. Open it with `DialogTrigger` (or a controlled `open`).

## Don't use it for — the overlay / layout ladder
- **An object's preview or contextual detail beside the page** → `Drawer` (side panel,
  keeps the page behind it, resizable).
- **All of an object's details / a complex multi-section flow** → a **full page** (the
  drill-down from a drawer).
- **A transient "it worked" confirmation** → `Toast`; **an inline contextual message**
  → `Alert`; **a page-wide notice** → `Banner`.
- **A multi-step product tour / onboarding** → the dedicated `Tour`.

Rule of thumb (escalate as the content grows): lightweight decision / single field →
**Dialog** · object preview → **Drawer** · full detail → **page**.

## Locked — don't override
- **Centered, modal, portaled** — the overlay backdrop blocks the page by default and
  the positioner centers it. Don't hand-place it or restyle the overlay. (`Drawer` is
  the side-anchored sibling — it can also run **non-modal** so the page stays usable, and
  it **resizes**; Dialog is always modal and centered, with no resize.)
- **Structure**: `DialogContent` › `DialogHeader` (`DialogTitle` + close; an info
  `Tooltip` is the default header affordance) · `DialogBody` (scrolls, with scroll
  separators) · `DialogFooter` (`DialogFooterControls`). Footer buttons are **large**.
  Richer header content — a second line of tabs / segmented / progress / stepper, header
  action buttons, or prev-next object paging — is **Figma-ahead; don't build it yet** (a
  task that wants tabs / multiple sections is usually a `Drawer` or a page).
- **Footer recipe**: `DialogFooterControls` holds the buttons (`placement='right'`) —
  Cancel = `ghost` / `neutral`; the confirm = `primary` (`brand` normally, **red
  destructive for a delete**). **One** primary action, never two. An optional **left**
  cluster (`placement='left'`) can carry a secondary control beside the buttons — a
  "Don't ask again" `Checkbox` or a `Switch`.

## Sizing / judgment calls
- **size** — `small` (400) for a confirm / single field; `medium` (560, default) for a
  typical form; `large` (960) for richer content (tabs, columns). Custom width
  (% or px, clamped 400–1130) only when no preset fits. Smallest that fits the content.
- **force an explicit choice** — for a destructive or must-answer dialog, set
  `closeOnOutsideClick={false}` (± `closeOnEscape={false}`) so it can't be dismissed by
  accident.
- **nesting** is supported (push-back effect), but reaching a 2nd level usually means
  the task outgrew a dialog → move to a `Drawer` or a page.

## Writing the message
Confirmation / destructive **wording is WIP — don't fix a house phrasing yet**. For now:
the title states the action or question; the confirm button **names the action**
("Delete", "Rename"), never "OK" / "Yes".

## Pairs with
- `DialogTrigger` (opener) + `Button` in `DialogFooter` (large; ghost-neutral Cancel +
  primary confirm).
- `Drawer` — the side-panel twin (same composition, different anchor); `Toast` /
  `Alert` / `Banner` — messaging siblings; `Tour` — guided tours.
