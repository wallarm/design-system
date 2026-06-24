# Breadcrumbs — usage

> The hierarchical **location trail** — where the user is in a nested structure, with
> each ancestor a link back up. Compound (`Breadcrumbs` + `BreadcrumbsItem` +
> auto-inserted `BreadcrumbsSeparator` + `BreadcrumbsEllipsis` + `BreadcrumbsScopeSwitcher`).
> Lives in the page header; in the app shell it's built from route segments, not by hand.

## Reach for it when
A page sits **deep in a hierarchy** (≈3+ levels) and the user benefits from seeing the
path and jumping to an ancestor — a drill-down like Attacks › … › this attack, or a
nested settings / resource page. It belongs in the **page header**. In `AppShell` /
`RemoteShell` the shell composes it from the route segments (you rarely hand-build it
per page); in a prototype, list the items directly.

## Don't use it for
- **A flat or shallow app (1–2 levels)** → skip it; there's no hierarchy to show.
- **Switching between peer / sibling views at the same level** → `Tabs` (or `SegmentedTabs`). Breadcrumbs show **vertical hierarchy only**, never lateral navigation.
- **Primary navigation or a back button** → breadcrumbs *complement* the sidebar / nav, they don't replace them.
- **Steps in a flow / wizard** → a stepper, not breadcrumbs.

## Locked — don't override
- **Structure is automatic**: `<nav aria-label="Breadcrumb">` › `<ol>`. The root **inserts the separators** between items and **auto-marks the last child as the current page** — list only your items; don't hand-place a `BreadcrumbsSeparator` between them.
- **The last item is the current page** — rendered as a non-link with `aria-current="page"`. **Don't give the last item an `href`.** Ancestors take an `href` (and navigate up). Icon + text both go inside an item.
- **The separator is a chevron (arrow) the root renders for you** — you never place a `BreadcrumbsSeparator` yourself (its only knob is a custom icon; the slash variant is Figma-ahead — don't hand-roll it).
- **Per-item truncation + a tooltip on long labels is drawn in Figma but not shipped** (items are `whitespace-nowrap` only) — don't rely on the breadcrumb to truncate a long label yet; keep labels short.

## Composition — the optional parts
- **`BreadcrumbsEllipsis`** — collapse a long trail: place it where the middle items fold, as a "show more" button. Keep the first and the (always-visible) current item; the middle collapses.
- **`BreadcrumbsScopeSwitcher`** — a breadcrumb item that's a `DropdownMenu` (a `ChevronUpDown` affordance) for switching the **scope / tenant** at that level (label + optional description per option, a check on the current). Use it when a level of the path is a switchable context rather than a fixed page. It can sit mid-trail or be the deepest (current) level — either way it stays a dropdown, not a plain current-page label.

## Sizing / judgment calls
- **When to collapse** — long trails (or a tight header) → `BreadcrumbsEllipsis`; always keep the first + current visible.
- **Leading icon** — optional on an item (a home / section glyph); labels are sentence case and short.

## Pairs with
- The **page header** of `AppShell` / `RemoteShell` — where breadcrumbs live (composed from route segments).
- `DropdownMenu` — what `BreadcrumbsScopeSwitcher` is built on; `Tabs` — the *lateral* counterpart (peer views), the other half of "where am I / how do I move."
