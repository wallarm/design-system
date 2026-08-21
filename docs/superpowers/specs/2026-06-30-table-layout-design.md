# Design: new `TableLayout` table component for design-system

**Date:** 2026-06-29
**Status:** design under review
**Context:** we design this as a design-system component (`@wallarm-org/design-system`)
that sits **alongside** the existing `Table` rather than replacing it. The basis is
`2026-06-30-table-layout-feature-inventory.md` (an inventory of the current `Table`'s features).

---

## 1. Goal and philosophy

The existing `Table` is a powerful **data-driven** engine on top of `@tanstack/react-table`:
`<Table data={[]} columns={[]} />`, with cell content supplied through `cell` callbacks. It
covers heavy data-grid scenarios well, but it is a poor fit when you just want to
**lay out a table by hand**: content is described by callbacks in a columns array, you have
to fight the cell's built-in styles (`p-0`, `select-text`), hack column widths, and implement
an accordion verbosely (see the "Pain points" section in the inventory).

The new component is an **alternative, not a replacement**. Both live in the DS:

- `Table` — when you need a data engine (sorting/grouping/virtualization "out of the
  box" driven by a column config).
- `TableLayout` — when you need **layout freedom**: you write the JSX for rows and cells directly.

**Philosophy: "easy things easy, hard things possible".**

> You can put together a table quickly and simply with plain primitives. When you need more, we
> provide tools (engine hooks, sugar subcomponents), and every enabled feature costs exactly as
> much code as it is worth — nothing superfluous in the tree.

**Non-goals (YAGNI):**

- We do not duplicate the `Table` engine in an "everything by config" mode.
- We do not pull a mandatory runtime (`@tanstack/*`, `@dnd-kit`) into Tier 0 — primitives
  must work without a single hook.

---

## 2. Architecture: 4 layers

```
┌─ Layer 4 — Compound facade (optional, "sugar on top of sugar") ───────────┐
│   <TableLayoutRoot data columns> + declarative <TableColumn> + render-prop  │
│   For those who need it fast and declarative. Assembled from layers 1–3.    │
├─ Layer 3 — Sugar subcomponents ────────────────────────────────────────────┤
│   SortableTableHeader, TableSelectionCell, TableSelectAll, TableExpandTrigger, │
│   TableEmptyState, TableActionBar, TableScrollHandler, TableColumnMenu,    │
│   TableCellContextMenu, TableSettingsMenu — common patterns on top of hooks.│
├─ Layer 2 — Engine hooks (opt in as needed) ────────────────────────────────┤
│   useTableSort, useTableRowSelection, useTableExpanded, useTableColumns,   │
│   useTableColumnReorder, useTableVirtualRows, useTableInfiniteScroll, …    │
│   Independent; share a lightweight optional context (TableLayoutContext).  │
├─ Layer 1 — Primitives (foundation, always work raw) ───────────────────────┤
│   Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell,       │
│   TableColumnGroup, TableColumn. Semantics + styles + sticky + scroll + a11y.│
└────────────────────────────────────────────────────────────────────────────┘
```

Principle: **each upper layer is assembled from the lower ones**. You can stop at any layer.
Layer 1 knows nothing about layers 2–4; layer 2 knows nothing about 3–4.

---

## 3. The `columnId` link: the cell ↔ column contract

Some features are **column-dependent** (sorting, pinning, resize, visibility, reorder):
the engine needs to know a column's identity, its width, its pinned state. Hand-written
markup (`<TableRow><TableCell>…`) does not carry this link on its own.

**The solution is an explicit `columnId` attribute, identical on the column and on the cell:**

```tsx
<TableColumn columnId="status" … />     // column declaration (identity/width/pin)
…
<TableCell columnId="status">…</TableCell>  // the cell references the column
```

**Why `columnId`** (and not `name`/`field`/`id`): one shared vocabulary with the existing `Table`
(it is built on TanStack, where everything is `column.id`); unambiguous; not confused with the
HTML `id`; works honestly for display columns too (`actions`, selection), where `field` would lie.
(A detailed comparison of alternatives is in the discussion history; the decision has been made.)

**The linking mechanism is a context registry, not a DOM attribute.** `columnId` is consumed by a
React component and is **not forwarded** onto `<td>`/`<th>` (otherwise a non-standard
`name`/`id` noise would land on `<td>`). The registry lives in `TableLayoutContext`:

- a column declaration registers `{ columnId, width, pin, align, resizable, … }`;
- `TableLayoutCell columnId="x"` obtains its `style`/`className` (sticky-offset for pin, width,
  align) through the context, plus data attributes for tests (`data-column-id="x"`).

Tier 0 without an engine: `columnId` is optional, the registry is empty — the cell simply renders `<td>`.

---

## 4. Naming

Rules (fixed): **no abbreviations** (`TableLayoutColumn`, not `Col`), **no
dot notation** (`TableLayoutColumn`, not `TableLayout.Column`), flat PascalCase.

**The entire family carries a continuous `TableLayout*` prefix** — otherwise it would collide with the existing
`Table`, which already exports `Table`, `TableHandle`, `TableProps`,
`TableScrollToRowOptions` and all the sugar (`TableActionBar`, `TableEmptyState`,
`TableColumnMenu`, `TableSettingsMenu`, `TableScrollHandler`, `TableSortTrigger`).

### Primitives (layer 1) — DOM mapping

| Component | DOM | Purpose |
|-----------|-----|-----------|
| `TableLayout` | `<table>` (+ scroll container) | Root, sticky context, horizontal scroll, `aria-label`, `ref: TableLayoutHandle` |
| `TableLayoutHead` | `<thead>` | Header (sticky by default) |
| `TableLayoutBody` | `<tbody>` | Body |
| `TableLayoutRow` | `<tr>` | Row; `rowId` prop → `data-row-id` |
| `TableLayoutHeaderCell` | `<th>` | Header cell |
| `TableLayoutCell` | `<td>` | Body cell; accepts `columnId` |
| `TableLayoutColumnGroup` | `<colgroup>` | Column declaration zone |
| `TableLayoutColumn` | `<col>` + registration | Column declaration: `columnId`, width, pin, align, feature flags |

Types: `TableLayoutHandle`, `TableLayoutScrollToRowOptions`, `TableLayoutColumnAlign`,
`TableLayoutColumnPin`, `TableLayoutColumnPresentation`, `TableLayoutProps`,
`TableLayoutRowProps`, `TableLayoutCellProps`, `TableLayoutColumnProps`.

### Hooks (layer 2)

`useTableLayoutSort`, `useTableLayoutRowSelection`, `useTableLayoutExpanded`,
`useTableLayoutColumns` (pin/resize/visibility), `useTableLayoutColumnReorder`,
`useTableLayoutGrouping`, `useTableLayoutVirtualRows`, `useTableLayoutInfiniteScroll`,
`useTableLayoutScrollState`.

### Sugar (layer 3)

`SortableTableLayoutHeaderCell`, `TableLayoutSelectionCell`, `TableLayoutSelectAll`,
`TableLayoutExpandTrigger`, `TableLayoutExpandedRow`, `TableLayoutGroupRow`,
`TableLayoutEmptyState`, `TableLayoutActionBar`, `TableLayoutScrollHandler`,
`TableLayoutColumnMenu`, `TableLayoutCellContextMenu`, `TableLayoutSettingsMenu`,
`TableLayoutSkeletonRows`.

### Facade (layer 4)

`TableLayoutRoot`, `TableLayoutColumns`, `TableLayoutColumn`, `TableLayoutDataBody`.

---

## 5. Primitive contract (spread props)

Hooks return **ready-made props bags** that you spread into a primitive. A primitive
must:

1. **extract** the service props (`columnId`, etc.) before forwarding to the DOM;
2. **merge** incoming `className`/`style`/`onClick` with its own (tailwind-merge +
   handler composition, by analogy with `TableScrollHandler` in the current `Table`:
   first call the user's `onClick`, and skip our own on `defaultPrevented`);
3. support `ref` and pass through arbitrary `data-*`/`aria-*`.

```tsx
const sort = useTableLayoutSort(sorting, onSortingChange);
<TableLayoutHeaderCell {...sort.getHeaderProps('name')}>Name</TableLayoutHeaderCell>
// getHeaderProps → { onClick, 'aria-sort', 'data-sortable': true, children-icon slot }
```

---

## 6. Mapping every original feature onto the layers

Layer legend: **[1]** primitive · **[2]** hook · **[3]** sugar · **[4]** facade.

| # | Feature | Layer | API |
|---|------|------|-----|
| 1 | Sorting | 2+3 | `useTableSort` → `getHeaderProps(columnId)`; sugar `SortableTableHeader`; `manualSorting` |
| 2 | Row selection | 2+3 | `useTableRowSelection` → `getRowProps`, `getCellProps`, `getSelectAllProps`; sugar `TableSelectionCell`, `TableSelectAll` |
| 3 | Action bar | 3 | `TableActionBar` (shown on selection), `TableActionBarSelection` |
| 4 | Loading / Empty | 1+3 | `TableEmptyState`, `TableSkeletonRows`; `isLoading`/`isLoadingPrevious` on the facade |
| 5 | Column resize | 2+3 | `useTableColumns` (`resizable`); sugar `TableColumnResizer`; `onChange`/`onEnd` mode |
| 6 | Pinning | 2 | `useTableColumns` (`pin`) → sticky `getColumnProps(columnId)` |
| 7 | Reorder (DnD) | 2+3 | `useTableColumnReorder` + drag-handle sugar; `@dnd-kit` is loaded only here |
| 8 | Grouping | 2+3 | `useTableGrouping`; sugar `TableGroupRow` |
| 9 | Row expansion | 2+3 | `useTableExpanded` → `getToggleProps`; sugar `TableExpandTrigger`, `TableExpandedRow` |
| 10 | Column visibility | 2+3 | `useTableColumns` (`visibility`); sugar `TableSettingsMenu`/`TableColumnMenu` |
| 11 | Column header menu | 3 | `TableColumnMenu` (+`…SortItem/PinItem/HideItem/MoveItem`) |
| 12 | Cell context menu | 3 | `TableCellContextMenu` (`value`, `onCopy`, `onFilter`) |
| 13 | Virtualization | 2+3 | `useTableVirtualRows` → `getBodyProps`, `items[]`; sugar `TableVirtualBody` (`container`/`window`) |
| 14 | Settings menu | 3 | `TableSettingsMenu` (search, toggle, reorder, reset) |
| 15 | Imperative `scrollToRow` | 1+2 | `ref: TableHandle` on `Table`; under virtualization it delegates to `useTableVirtualRows` |
| 16 | Infinite scroll | 2 | `useTableInfiniteScroll` (`onEndReached`/`onStartReached` + thresholds, `initialScrollToRowId`) |
| 17 | Master-cell click | 1+3 | `onActivate`/`activeRowId` context; sugar `TableActivatableCell` ("Open details" tooltip) |
| 18 | Horizontal scroll handler | 2+3 | `useTableScrollState`; sugar `TableScrollHandler` (+`Left`/`Right`) |
| — | Sticky header / horizontal scroll / a11y | 1 | built into the primitives |
| — | `align` (left/center/right) | 1 | `align` prop on `TableColumn` → inherited by cells via the `columnId` registry |

---

## 7. Layout examples (what the user writes)

> **The naming in the examples below and in §6 is illustrative (short forms `Table`/`TableRow`/
> `TableCell`/…).** The canonical names carry the `TableLayout*` prefix (see §4):
> `TableLayout`, `TableLayoutHead`, `TableLayoutBody`, `TableLayoutRow`,
> `TableLayoutHeaderCell`, `TableLayoutCell`, `TableLayoutColumnGroup`,
> `TableLayoutColumn`, the `useTableLayout*` hooks, the `TableLayout*` sugar. The exact names and code
> are in the implementation plan `../plans/2026-06-30-table-layout-foundation.md`.

### Tier 0 — pure layout, zero hooks

```tsx
<Table aria-label="Policies">
  <TableHead>
    <TableRow>
      <TableHeaderCell>Name</TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {policies.map((policy) => (
      <TableRow key={policy.id}>
        <TableCell>{policy.title}</TableCell>
        <TableCell><Badge>{policy.status}</Badge></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Tier 1 — sorting + selection + action bar (hooks + sugar)

```tsx
const sort = useTableSort(sorting, onSortingChange);
const selection = useTableRowSelection(rowSelection, onRowSelectionChange, policies);

<Table aria-label="Policies">
  <TableHead>
    <TableRow>
      <TableHeaderCell><TableSelectAll {...selection.getSelectAllProps()} /></TableHeaderCell>
      <SortableTableHeader {...sort.getHeaderProps('title')}>Name</SortableTableHeader>
      <SortableTableHeader {...sort.getHeaderProps('status')}>Status</SortableTableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    {policies.map((policy) => (
      <TableRow key={policy.id} {...selection.getRowProps(policy.id)}>
        <TableCell><TableSelectionCell {...selection.getCellProps(policy.id)} /></TableCell>
        <TableCell>{policy.title}</TableCell>
        <TableCell><Badge>{policy.status}</Badge></TableCell>
      </TableRow>
    ))}
  </TableBody>

  <TableActionBar>
    <Button color="destructive" onClick={bulkDelete}>Delete</Button>
  </TableActionBar>
</Table>
```

### Tier 2 — column-dependent features: pin + resize + virtualization

`TableColumn` declares identity/width/pin; `TableCell columnId` inherits the
sticky styles and width through the registry.

Columns are declared **once** — with declarative `<TableColumn>` (carrying `columnId`,
width, pin, resizable). This is the registry source; `useTableColumns()` below is a
low-level alternative (a config array), not an addition.

```tsx
const rows = useTableVirtualRows(policies, { estimateRowHeight });

<Table aria-label="Policies" ref={tableRef}>
  <TableColumnGroup>
    <TableColumn columnId="title"   width={240} pin="left" resizable>Name</TableColumn>
    <TableColumn columnId="status"  width={160}>Status</TableColumn>
    <TableColumn columnId="actions" width={48}  pin="right" />
  </TableColumnGroup>

  <TableVirtualBody {...rows.getBodyProps()}>
    {rows.items.map(({ row, style }) => (
      <TableRow key={row.id} style={style}>
        <TableCell columnId="title">{row.title}</TableCell>
        <TableCell columnId="status"><Badge>{row.status}</Badge></TableCell>
        <TableCell columnId="actions"><RowMenu policy={row} /></TableCell>
      </TableRow>
    ))}
  </TableVirtualBody>
</Table>
```

> `TableColumnGroup` renders `<colgroup>` (widths) **and** registers the columns in
> the context, plus renders the header from its `TableColumn` children. Body cells
> pull sticky styles (pin) and width from the registry via `columnId`. Declarative `<TableColumn>`
> is the canonical way to populate the registry; the `useTableColumns([{ columnId, … }])` hook is the
> imperative alternative for dynamic columns (see §10.2).

### Tier 1 — row expansion with a single-open accordion (closes the `PoliciesTable` pain)

```tsx
const expanded = useTableExpanded({ mode: 'single', value: expandedId, onChange: onToggleExpand });

<TableBody>
  {policies.map((policy) => (
    <Fragment key={policy.id}>
      <TableRow {...expanded.getRowProps(policy.id)}>
        <TableCell columnId="title">
          {/* clicking anywhere in the cell expands the row — built in, no ExpandableCell wrapper */}
          <TableExpandTrigger {...expanded.getTriggerProps(policy.id)}>
            {policy.title}
          </TableExpandTrigger>
        </TableCell>
        <TableCell columnId="status">{policy.status}</TableCell>
      </TableRow>
      {expanded.isExpanded(policy.id) && (
        <TableExpandedRow><PolicyRowDetails policyId={policy.id} /></TableExpandedRow>
      )}
    </Fragment>
  ))}
</TableBody>
```

### Layer 4 — compound facade (for those who need it fast and declarative)

```tsx
<TableLayoutRoot data={policies} sorting={sorting} onSortingChange={setSorting} isLoading={isLoading}>
  <TableColumns>
    <TableColumn columnId="title"  sortable pin="left" width={240}>Name</TableColumn>
    <TableColumn columnId="status" sortable>Status</TableColumn>
    <TableColumn columnId="actions" width={48} />
  </TableColumns>

  <TableLayoutBody>
    {(policy) => (
      <TableRow key={policy.id}>
        <TableCell columnId="title">{policy.title}</TableCell>
        <TableCell columnId="status"><Badge>{policy.status}</Badge></TableCell>
        <TableCell columnId="actions"><RowMenu policy={policy} /></TableCell>
      </TableRow>
    )}
  </TableLayoutBody>

  <TableEmptyState>No policies</TableEmptyState>
</TableLayoutRoot>
```

---

## 8. Relationship to the existing `Table` (decided)

**An independent implementation with the same visual design.** Layer 1 (the `TableLayout`
primitives) is written separately from `Table/primitives/` — we do not create a shared package and
do not import the other component's primitives. The reason: `Table` is tailored to a TanStack
instance, and its primitives carry that coupling; mixing the lifecycles of two components through
shared code = coupling their releases and risking mutual regressions. `TableLayout` stays self-contained.

**What we keep in sync is the design, not the code:** header height (32px), cell/row styles,
sticky behavior, pin-border shadows, and spacing must **visually match** `Table`.
This is achieved with the DS's shared Tailwind tokens (one theme), not with shared React components.
If the visuals drift, that is caught by design review / visual tests, not by a shared import.

> The algorithms (pin styles, horizontal scroll state, infinite scroll, virtualization)
> are rewritten against the new props contract. You may look at the implementation in `Table/lib`
> and `Table/hooks` as a reference, but we copy deliberately, without a hard dependency.

---

## 9. Dependencies by layer

| Layer | Runtime dependencies |
|------|---------------------|
| 1 — primitives | none (only React + Tailwind + `cn`) |
| 2 — hooks | per feature: virtualization → `@tanstack/react-virtual`; reorder → `@dnd-kit/core`; sorting/selection/expand — no external deps (own lightweight state) |
| 3 — sugar | `@ark-ui/react` (popover/menu) for menus/bar/tooltips |
| 4 — facade | the same as 1–3 |

The key: **Tier 0 with no external runtime**; heavy dependencies are loaded only by those
who enable the corresponding feature.

---

## 10. Resolved questions

1. **Relationship to `Table`** — an independent implementation with the same visual design
   (see §8). No shared code; we sync the design through the DS Tailwind tokens.
2. **Column registration** — the canonical way is **declarative** (`<TableColumn>`).
   There is one registry with two entry points: declarative (primary) and imperative `useTableColumns`
   (for dynamic columns that cannot be written as static JSX). On a `columnId`
   collision, the **declarative form overrides** the hook's values, and in dev there is a warning about
   double registration.
3. **Imperative `scrollToRow`** — a single `ref: TableHandle` on `Table`. Under virtualization it
   delegates to `useTableVirtualRows` through the context; otherwise a DOM query
   `[data-row-id]` + `scrollIntoView`. For this, `TableRow` accepts an optional
   `rowId` that stamps `data-row-id` (the selection/expand hooks stamp it themselves).
   The behavior is best-effort: it finds only a mounted row, and the caller itself decides
   on retry/fetch (as in the current `Table`).
4. **State controllability** — all stateful hooks use `useControlled` from the DS.
   Uncontrolled by default (drop-in), controlled when value+onChange are passed — as in
   `Table`.
5. **`meta.description`** — not needed (the user lays out the description/tooltip themselves in
   children). **`align`** (left/center/right) — needed: a prop on `TableColumn`,
   inherited by cells via the `columnId` registry (convenient, no duplication on every cell).
6. **Publication (after Layer 1)** — `TableLayout` is **not re-exported** from the package's root
   `src/index.ts`: it stays accessible only via a local import from the component directory,
   until the next layers mature. We do not expose an incomplete API to the outside.

---

## 11. Design completion criteria

- [x] API paradigm chosen: C (primitives + hooks) + sugar layer B, facade optional.
- [x] Cell↔column link: explicit `columnId`, via a context registry, not in the DOM.
- [x] Naming: flat PascalCase, no abbreviations and no dot notation.
- [x] All 18 original features mapped onto the layers with examples.
- [x] Open questions resolved (see §10).
- [x] Design review by the user.
- [ ] Implementation plan (skill writing-plans).
