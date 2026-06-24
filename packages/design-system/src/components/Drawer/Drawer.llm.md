# Drawer — usage

> A right-anchored **side panel** for viewing or editing an object's detail, a preview,
> or a contextual task **while keeping the page in view** — it can even stay non-modal
> so the page behind it remains usable. Compound (many parts), built on Ark UI's Dialog
> primitive — and our `Dialog` is in turn built on *this* Drawer (centered + modal, minus
> resize). Side-anchored, **resizable**, and optionally **non-modal**. The
> middle-to-heavy rung of the overlay / layout ladder.

## Reach for it when
You're showing or editing **an object's details, a preview, or a contextual task**
beside the current page without navigating away — a row's detail / quick-edit, a
filters or settings panel, supplemental reference or help. It slides in from the right,
keeps the page visible behind it (optionally still interactive), and is **resizable**.
Open it with `DrawerTrigger` (or a controlled `open`).

## Don't use it for — the overlay / layout ladder
- **A short, focused decision or one-field task that should interrupt** (confirm, delete, rename) → `Dialog` (centered, modal, no resize). Drawer is for *context beside the page*; Dialog for a small task that should block.
- **All of an object's detail, or a complex multi-section flow** → a **full page** (the drill-down from the drawer's title link).
- **A small bit of contextual info or a few controls anchored to a trigger** → `Popover` (lighter, no side panel).
- **A transient confirmation** → `Toast`; **an inline message** → `Alert`; **a page-wide notice** → `Banner`.

Rule of thumb: anchored hint → `Popover` · short blocking decision → `Dialog` · **object detail / preview / contextual edit beside the page → `Drawer`** · full detail → **page**.

## Locked — don't override
- **Right-anchored, portaled, slides in from the right** — there is no left/top/bottom placement. Don't hand-place it.
- **The look is fixed** — `bg-surface-2`, rounded-12, border, shadow-xl. Don't restyle.
- **Structure**: `DrawerContent` › `DrawerHeader` (`DrawerTitle` + a **close `X` that renders automatically** unless you pass your own `DrawerClose`) · `DrawerBody` (scrolls; scroll-position separators appear automatically) · `DrawerFooter`. An info `Tooltip` is the default header affordance.
- **Footer = optional left cluster + right buttons** via `DrawerFooterControls`: `placement='left'` for a secondary control (a "Don't ask again" `Checkbox` / `Switch`), `placement='right'` for the buttons (Cancel `ghost`/`neutral` + **one** primary confirm — `brand`, or red for a destructive delete). One primary action, never two.
- **Tabs in the header is a shipped pattern** — a tabbed drawer (the body's top border drops automatically). Other second-line content (segmented / progress / stepper / alert) and prev-next object paging are **Figma-ahead — don't build them yet**.

## Sizing / judgment calls
- **`width`** (not a `size` enum) — a pixel number or a `'%'` string; the house presets are **640 / 960 / 1130**, clamped **400–1130** via `minWidth` / `maxWidth`. Pick the smallest that fits.
- **`modal` (default `true`) + `overlay` (default `true`)** — by default the Drawer **blocks the page** behind a scrim (page stays *visible*, not interactive). Set **`modal={false}` + `overlay={false}`** together for a *non-blocking* drawer the user works alongside — e.g. a preview beside a `Table` they keep using. **This non-modal mode is the thing `Dialog` can't do** — it's the main reason to pick Drawer over Dialog for a preview.
- **Resizable** — add a `DrawerResizeHandle` (hover-revealed left-edge drag, "Drag to resize"); width clamps to min/max. Use when more room helps (wide tables / detail).
- **`closeOnOutsideClick` / `closeOnEscape`** (both default `true`) — set `false` for an in-progress edit that shouldn't dismiss by accident.
- **Nesting pushes back** (the parent scales / shifts) — but reaching a 2nd level usually means the task outgrew a drawer → a full page.

## Pairs with
- `DrawerTrigger` (opener) + the content you compose — a `Field`-based form, an `Attribute` detail grid, a `Table`, `Tabs` in the header.
- `Dialog` — the centered, always-modal, non-resizable variant **built on this Drawer** (same parts + `…FooterControls`; dialog sizes + a centered positioner).
- `Popover` (lighter) / a full page (heavier) — the ladder neighbours; `Toast` / `Alert` / `Banner` — messaging siblings.
