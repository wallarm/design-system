# TableOfContents — Analytics Gaps

Single source of truth for `TableOfContents`' analytics decisions, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md) (Closed-Target Gaps).
It lists every interactive target, whether a consumer can put `data-analytics-id` /
`data-analytics-props` (or any `data-*` / `aria-*` / `ref`) on it, and, for the targets that
cannot take them yet, the callback-based workaround, the owner and the next decision point.

Audited: 2026-11-27 · Owner: Design System team (WDS-210)

No DS code in `TableOfContents` calls `stopPropagation()`, and `data-analytics-props` is never
parsed or rewritten. Tests: `TableOfContents.analytics.test.tsx`.

## Already covered (not gaps)

| Target | Seam | Node |
|---|---|---|
| Root (not a click target; kept across view toggles) | `TableOfContents` `{...props}` + `ref` | `<nav>` |
| Item row (Full view and popover) | `TableOfContentsItem` `{...props}` + `ref` | `<a>` |

The Minimized dashes are decorative copies of the items: the consumer's attributes stay on the
row `<a>` only, so they are never duplicated.

**Container-level attribution.** A click on the toggle or the dashes resolves
`closest('[data-analytics-id]')` to the id on the root `<nav>` if the consumer put one there.
Read a root-level id as "somewhere in this table of contents".

## Known gaps (closed targets)

### TOC-1 — View toggle (collapse / expand)

- **Where:** `TableOfContents.tsx`, the internal `Button` in the header row.
- **Why a gap:** the button is rendered by the root, not composed by the consumer, so no part is
  exported that could take `{...rest}`.
- **Workaround:** `onViewChange(view)` fires on every toggle with the new view. A click also
  resolves to the root id (container-level, see above).
- **Owner:** Design System team.
- **Next decision point:** when a consumer asks for attributes on the toggle itself. Export a
  composable `TableOfContentsToggle`; no `toggleProps` escape hatch.

### TOC-2 — Minimized dashes (popover trigger)

- **Where:** `TableOfContentsMinimized.tsx`, the `aria-hidden` dashes `<div>`.
- **Why a gap:** an internal hover / tap target with no accessible role. The popover opens on
  hover without any click, so there is often no DOM click to resolve.
- **Workaround:** none for the open itself — the popover open is not observable today. A pick
  from the popover is: it is a click on the item `<a>` (covered above) and reaches
  `onValueChange`.
- **Owner:** Design System team.
- **Next decision point:** when product needs to count popover opens. Add a typed callback (for
  example `onPopoverOpenChange(open)`) on the root, not attributes on the dashes.
