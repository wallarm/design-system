# Table — Analytics Gaps

This file is the single source of truth for `Table`'s analytics-readiness gaps, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md) (Closed-Target Gaps and
Wrapper-Level Exceptions). It records every interactive target that a consumer **cannot yet**
attach `data-analytics-id` / `data-analytics-props` (or arbitrary `data-*` / `aria-*` / `ref`) to,
why it is not reachable, the callback-based workaround, the owner, and the next decision point.

Audited: 2026-06-09 · Owner: Design System team — metrics rollout (WDS-114)

## Already covered (not gaps)

These seams are exported and forward the full attribute surface to the real interactive node —
listed here so the gaps below are not mistaken for the whole inventory:

| Target | Seam | Node |
| --- | --- | --- |
| Header sort trigger | `TableSortTrigger` | `<button>` |
| Column menu trigger + items | `TableColumnMenu`, `TableColumnMenu*Item` | `<button>` / items |
| Settings menu trigger | `TableSettingsMenu` | `<button>` |
| Settings menu search | `TableSettingsMenuSearch` | `<input>` |
| Column visibility toggle | `TableSettingsMenuItem` → `Switch` (`...rest`) | switch |
| Settings menu reset | `TableSettingsMenuReset` | `<button>` |
| Horizontal scroll controls (← / →) | `TableScrollHandler` (Table child) + `TableScrollHandlerLeft` / `TableScrollHandlerRight` | `<button>` |
| Bulk action-bar "Select all" / "Clear" | `TableActionBarSelection` override + `BulkBarSummarySelectAll` / `BulkBarSummaryClear` | `<button>` |

Arbitrary action buttons passed as `TableActionBar` `children` are owned and instrumented by the
consumer — not a gap.

---

## Must-fix violations

Real click targets that have **no** composition seam today. Per the contract these are reachability
violations (not drag-only closed targets) and should get an exported sub-component or attribute
pass-through in a follow-up phase.

### MF-1 — Horizontal scroll buttons (← / →) — ✅ RESOLVED (2026-06-09)

Closed via a table-level composition seam (anchor + portal, mirroring `TableSettingsMenu`): the
consumer renders `<TableScrollHandler>` as a `Table` child with `TableScrollHandlerLeft` /
`TableScrollHandlerRight` sub-components, and their attributes land on the real `<button>`s. See the
"Already covered" table above. ID kept for reference stability.

### MF-2 — Bulk action-bar "Select all" — ✅ RESOLVED (2026-06-09)

Closed via a block-level composition seam (mirrors `TableScrollHandler`): the consumer renders
`<TableActionBarSelection>` as a `TableActionBar` child and composes the summary from the exported
`BulkBarSummary*` primitives. `TableActionBarSelection` injects the table state/action
(`toggleAllRowsSelected`, `disabled`) into `BulkBarSummarySelectAll` while forwarding the consumer's
attributes verbatim to the real `<button>`; the consumer `onClick` runs first and may
`preventDefault()` to opt out of the DS action. See the "Already covered" table above.

### MF-3 — Bulk action-bar "Clear" — ✅ RESOLVED (2026-06-09)

Closed by the same `TableActionBarSelection` seam as MF-2: `BulkBarSummaryClear` receives the DS
`resetRowSelection` action (composed with the consumer `onClick`) and forwards all consumer
attributes to the real `<button>`. See the "Already covered" table above.

### MF-4 — "Select all" header checkbox

- **Where:** `lib/createSelectionColumn.tsx` (`header` render — internal `Checkbox`).
- **Why unreachable:** column is auto-injected when `onRowSelectionChange` is provided; cell/header
  renderers are DS-internal with no attribute seam.
- **Workaround:** `onRowSelectionChange` callback (consumer derives select-all from state).
- **Owner:** Design System team — metrics rollout (WDS-114).
- **Next decision point:** row-selection composition phase (see ROW-1/ROW-2 below — solved together).

---

## Accepted closed-target gaps (drag / no DOM click)

These are custom interactions with **no** click target. Per the contract's decision tree the correct
seam is a typed callback; the consumer tracks the outcome outside the DS. Accepted as gaps, recorded here.

### CG-1 — Column resize handle

- **Where:** `TableResizeHandler.tsx` (`<div>` with `onMouseDown` / `onTouchStart`).
- **Why a gap:** drag interaction, no DOM click for an SDK to resolve via `closest('[data-analytics-id]')`.
- **Workaround:** `onColumnSizingChange` — consumer observes final column sizes.
- **Owner:** Design System team — metrics rollout (WDS-114).
- **Next decision point:** revisit only if product needs per-resize attribution beyond the callback.

### CG-2 — Settings-menu drag handle (reorder)

- **Where:** `TableSettingsMenu/TableSettingsMenuItem.tsx` (`<span>` with `@dnd-kit` listeners).
- **Why a gap:** drag interaction, no DOM click.
- **Workaround:** `onColumnOrderChange` — consumer observes the resulting column order.
- **Owner:** Design System team — metrics rollout (WDS-114).
- **Next decision point:** revisit only if per-drag attribution is required beyond the order callback.

### CG-3 — Column header drag-to-reorder

- **Where:** `TableHeadCell.tsx` (`useColumnDnd` listeners spread onto `<Th>`).
- **Why a gap:** drag interaction on the whole header, no DOM click.
- **Workaround:** `onColumnOrderChange` (same callback as CG-2).
- **Owner:** Design System team — metrics rollout (WDS-114).
- **Next decision point:** revisit only if per-drag attribution is required beyond the order callback.

---

## Row-level gaps

Auto-injected system columns whose interactive cells are DS-internal. Real click targets, but solved
as one composition phase because they share the same auto-injection mechanism.

### ROW-1 — Per-row selection checkbox

- **Where:** `lib/createSelectionColumn.tsx` (`SelectionCell` — internal `Checkbox`).
- **Why unreachable:** column auto-injected via `onRowSelectionChange`; cell renderer is DS-internal,
  no attribute seam.
- **Workaround:** `onRowSelectionChange` callback (per-row selection observable in state).
- **Owner:** Design System team — metrics rollout (WDS-114).
- **Next decision point:** row-selection composition phase (solved with MF-4 / ROW-2).

### ROW-2 — Per-row expand / collapse toggle

- **Where:** `lib/createExpandColumn.tsx` (internal `ToggleButton`).
- **Why unreachable:** column auto-injected via `renderExpandedRow`; cell renderer is DS-internal,
  no attribute seam.
- **Workaround:** `onExpandedChange` / `row.getToggleExpandedHandler()` (expanded state observable).
- **Owner:** Design System team — metrics rollout (WDS-114).
- **Next decision point:** row-system composition phase.

> Row click itself is **not** a DS target: `<Tr>` (`TableRow.tsx`) has no `onClick`; row activation is
> driven by consumer-rendered cell content, which the consumer instruments directly.
