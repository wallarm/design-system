# EmptyState — usage

> The house "nothing here" state for any empty region — a centered icon + message
> (+ optional action / link) that says **what's empty and what to do next**. Compound,
> `role="status"` (announced to screen readers). One component, two `type`s
> (`collection-empty` / `no-results`). Reach for it instead of ad-hoc "No data" text.

## Reach for it when
**Any container or region has nothing to show** and you'd otherwise drop in bare "No
data" text — a `Table` / list / `Card` grid with no rows, a search or filter that
matched nothing, an empty `Select` / `DropdownMenu` option list, a chart with no data,
or a first-use zero-state page/section. It's the single sanctioned empty pattern; it
scales from a full page-level state (≤560 wide, icon + CTA) down to a one-line filler
inside a menu.

## Pick the type — the decision that drives everything
The `type`, the copy, **and whether there's a CTA** all depend on *why* it's empty:
- **Nothing here yet / first use** (the user hasn't created any; the feature works, it's just unpopulated) → **`collection-empty`** + a **primary "Create…" CTA** (+ optional "Learn more" `EmptyStateLink`). Encouraging, value-forward. *The highest-leverage case — an unhandled first-use empty is a silent activation drop-off.* (For a multi-widget surface like a dashboard, use **one** page-level first-use state until the user activates — not an EmptyState per widget.)
- **A genuinely empty, cleared, or completed collection** → **`collection-empty`**, usually **CTA-light**. Tone follows the situation: **neutral** for a plain never-filled list, **celebratory** for a *completed/cleared* one ("You're all caught up"). Add an action only if there's a sensible next step.
- **A search / filter matched nothing** (the data exists — the query excluded it) → **`no-results`** (the compact form). Tell them to **adjust or clear the filter — never a "Create" CTA.** *(A create button on a no-results screen is the #1 documented empty-state mistake.)*
- **Error / failed to load** → compose `collection-empty` with an **alert icon + calm, blame-free copy + a "Retry"**. *Rule of thumb:* a *reachable* region that came back empty, or a single failed panel → EmptyState + Retry; a whole-page / auth / server (5xx) failure → an `Alert` or a dedicated error page, not an EmptyState. Never a cheerful first-use illustration on an error.
- **No permission / higher tier** → no create CTA; state the restriction + the unlock path (request access / upgrade).

Only `collection-empty` and `no-results` ship as `type`s — **error / permission are the same component with a different icon, copy, and action**, not a separate type.

## Don't use it for
- **A still-loading region** → `Skeleton` / `Loader` (data status unknown ≠ empty).
- **A momentary "it worked / nothing to load" flash** → `Toast`.
- **A hard load failure that isn't really "empty"** → `Alert` or an error page (see the error type above for the call).
- **A form field with no value** → that's a placeholder, not an EmptyState.

## Locked — don't override
- **Composed parts, centered column**: `EmptyState` (`role="status"`) › `EmptyStateIllustration` (an **icon in a circle** — small, decorative) · `EmptyStateMessage` (`EmptyStateTitle` + `EmptyStateDescription`) · `EmptyStateActions` (centered buttons) · `EmptyStateLink` (learn-more). Compose these; don't hand-roll "No data" markup. (A richer multi-ring illustration is Figma-ahead — the shipped illustration is one icon in a circle.)
- **`type` sets width / density** — `collection-empty` 256–560 wide (full), `no-results` a compact 240. It centers itself and scales to its container (down to a one-line filler in a `Select` / chart). **A compact in-container empty (a `Select` / `DropdownMenu` option list, a chart cell) is CTA-light no matter *why* it's empty** — the "Create…" rule above is for a page/section-level first-use, never a one-liner inside a control.
- **The illustration is decorative, never load-bearing** — an icon (or nothing in tight space), matching the system icon set; an **alert** icon for errors, never a playful one. The message must stand on its own without it.
- **One primary action** in `EmptyStateActions` (a secondary may follow); documentation links go in `EmptyStateLink`, not a button.

## Writing the copy (the heart — house rules; full per-type formula in the content guidelines)
- **Title** — short (≈≤5 words, no ending period). **Verb-led for create / first-use** ("Explore your API", "Create your first rule"); a **neutral statement** for no-results ("No attacks found") / restricted ("Feature not available") / completion ("You're all caught up").
- **Description** — 1–2 sentences: what happened + **how** to act on it (not just *what*); for first-use lead with the **value**, for no-results give the fix ("Try a different filter or reset it"). Don't repeat the title; plain language.
- **Action** — verb + noun, **one** primary; **no "Create" CTA on a no-results / restricted / completed state** (there it's "Clear filters" / "Retry" / nothing).
- **Tone by type** — encouraging (first-use) · neutral-helpful (no-results) · calm-blameless (error) · celebratory (completion). **Avoid cute-when-inappropriate** ("Whoops, nothing here").

## Pairs with
- `TableEmptyState` — the `Table` wrapper that picks no-data-yet vs no-results for a grid; a `Card` grid / list is the same collection-empty home.
- `Select` / `DropdownMenu` (empty option lists), `SimpleCharts` (no data) — the compact in-container empties.
- `Button` (the CTA) + `EmptyStateLink` (learn-more); `Tour` / `Banner` for a larger "what's next"; `Alert` / an error page for a true load failure.
