# NavRail — usage

> The **global product rail** — the slim, icon-first vertical nav down the left of the platform (the first-level "which product am I in"), living in `AppShell`'s rail slot. Structural / navigation; one per app, collapsible to an icon-only strip.

## Reach for it when
You need the platform's **top-level product switcher** — the column of icon (+ label) entries that jump between products / major areas (Home, each product, settings), the current one marked, with a collapsed icon-only mode. It goes in `AppShellRail` — one NavRail per app (the rail of the single `AppShell`).

For a prototype, hardcode the entries as `NavRailItem`s — the real list comes from runtime config (the host builds it from registered products).

## Don't use it for
- **In-product section nav** (a product's Overview / Settings / Reports, drill-down) → `NavPanel` inside `RemoteShell`. The rail is *global*; the panel is *in-product* — and the rail hands focus off to the panel (ArrowRight).
- **Switching content panels on a page** → `Tabs` / `SegmentedControl`. NavRail entries *navigate* (real links / routes); they don't swap an in-page panel.
- **A recent / account / settings menu** → compose a `DropdownMenu` (it sits in the footer; the host's Recent + Account menus are app-level compositions, not shipped NavRail parts).
- **A generic vertical sidebar / list** → this is the app's single global-nav landmark, not a layout primitive.

## Locked — don't override
- **It's the global nav landmark** (`<nav aria-label="Global navigation">`) and belongs in `AppShellRail` — one per app.
- **Structure = `NavRailBody` (scrolls) + `NavRailFooter` (pins to the bottom)** — products / areas in the body, utilities + account in the footer. Footer utilities (settings, theme toggle, help) are plain `NavRailItem`s; only the Recent / Account *menus* are app-composed `DropdownMenu`s (not shipped NavRail parts).
- **`NavRailItem` is a navigation link** (an `<a href>`, or `asChild`) with a **required `icon`**; `active` sets `aria-current="page"`. It auto-wraps in a right-placed `Tooltip` showing the label + shortcut — **essential in collapsed mode** (the label text is hidden), so don't strip it or add your own.
- **Collapse is a width toggle** (full ↔ icon-only) driven by `collapsed`; the label fades, the icon stays. Don't hand-build the collapse.
- **Roving arrow-key nav is built in**, and **ArrowRight hands focus into the product's `NavPanel`** — the rail↔panel keyboard seam is automatic.

## Sizing / judgment calls
- **`collapsed`** — the house pattern is **adaptive: expanded on Home, collapsed once you're inside a product** (the consumer computes the bool; NavRail just takes it). Keep it expanded for a standalone prototype with no product context.
- **`shortcut`** (per item) — a key *sequence* like `['G','H']` (type G then H) that jumps **straight** to a product; add it for top products, surfaced automatically in the item's tooltip. (Distinct from the built-in arrow-key roving, which only moves focus item-to-item — Enter activates, ArrowRight crosses into `NavPanel`.)
- **`active`** — mark the current product / area.

## Pairs with
- `AppShell` — `NavRail` is what goes in `AppShellRail`; `NavPanel` (second-level, inside `RemoteShell`) is the nav it hands focus off to.
- `NavRailItem` / `NavRailBody` / `NavRailFooter` / `NavRailSeparator` / `NavRailSkeleton` (the loading placeholder for the product list).
- `DropdownMenu` — compose Recent / Account / settings menus from it (app-level, not shipped NavRail parts).
- `Tooltip` + `Kbd` — built into every item; don't add your own.
