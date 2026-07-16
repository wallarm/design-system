# TableLayout — Analytics Readiness Gaps

Single source of truth for `TableLayout`'s analytics-readiness, per `docs/metrics/contract.md`.

## Model

`TableLayout` is a markup-driven, composable table. The consumer writes the cells, so the
dominant seam is **consumer-owned content**: any interactive element placed inside
`TableLayoutCell` / `TableLayoutHeaderCell` carries its own `data-analytics-*` and is
captured directly. The DS primitives spread `{...props}` onto their native nodes, so
consumer `data-*` always reach the real element.

## Layout / display targets (exempt)

`TableLayout`, `TableLayoutHead`, `TableLayoutBody`, `TableLayoutRow`,
`TableLayoutHeaderCell`, `TableLayoutCell`, `TableLayoutColumnGroup`, `TableLayoutColumn`
— containers/display targets with no intrinsic click action. Exempt per the decision tree.
Pinning is pure sticky styling — no interactive target.

## Closed / drag targets (callback workaround)

- **CG-1 — Column resize (`TableLayoutResizeHandle`).** Pointer-drag with no DOM click,
  so a `data-analytics-id` on the handle would never resolve via the SDK click walk-up.
  **Seam:** the `onColumnSizingChange` option of `useTableLayoutColumns` — the consumer
  records the resize there. The handle still forwards `{...rest}` (consumer `data-*` are
  not dropped), but the callback is the canonical analytics path. Mirrors the existing
  `Table` CG-1.

## Derive-from-callback

- **Column visibility** — `onColumnVisibilityChange` option of `useTableLayoutColumns`.
- **Column pinning** — declared on the column def or via `onColumnPinningChange`.

## Open

None for Layer 2. Sort/selection/expand seams arrive with their layers (each as an
exported sub-component carrying `{...rest}`) and will be listed here as they land.
