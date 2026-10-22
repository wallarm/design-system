# Table Component — Design Document

## Purpose

Table is a component of the new design system (`@wallarm-org/design-system`) for displaying and interacting with tabular data.
It supports sorting, row selection, batch actions, column resizing and pinning, column and row drag & drop, grouping, row expanding, full-width rows, column visibility, a column header menu, table settings, sticky header, bidirectional infinite scroll, and virtualization.

Built on top of `@tanstack/react-table` v9 as a headless core.

---

## Conceptual Model

```
┌──────────────────────────────────────────────────────────────────────────┐
│  <Table data={[...]} columns={[...]}>                                    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  thead (sticky: position: sticky; top: 0)                          │  │
│  │  ┌───┬──────────┬─|─────────┬──────────┬────────┬──────────┬───┐  │  │
│  │  │ ☐ │ Name  ⇄  │ Phone ↕⋯⇔│ Email ⋯⇔ │ Status │ Actions  │ ⚙│  │  │
│  │  │   │ (master) │  drag    │  drag    │        │          │   │  │  │
│  │  └───┴──────────┴─|─────────┴──────────┴────────┴──────────┴───┘  │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │  tbody                                                             │  │
│  │  ▼ Group: "Active" (3)                                             │  │
│  │  ┌───┬──────────┬──────────┬──────────┬────────┬──────────┐       │  │
│  │  │ ☑ │ John     │ +44 ...  │ j@...    │ ● OK   │ [Edit]   │       │  │
│  │  │ ☐ │ Jane     │ +44 ...  │ j@...    │ ● OK   │ [Edit]   │       │  │
│  │  │   │  ↳ expanded row detail                              │       │  │
│  │  │ ☑ │ Bob      │ +44 ...  │ b@...    │ ● OK   │ [Edit]   │       │  │
│  │  └───┴──────────┴──────────┴──────────┴────────┴──────────┘       │  │
│  │  ▶ Group: "Pending" (2) — collapsed                                │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  TableEmptyState (compound, displayed when there are no rows)      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  TableActionBar (floating, appears on selection)                   │  │
│  │  "2 selected · Select all | Clear"   │   [Resend]  [Delete]        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  </Table>                                                                │
└──────────────────────────────────────────────────────────────────────────┘

↕ = sortable    ⇔ = resizable    drag = reorderable    ⋯ = column header menu (hover)
⇄ = scroll handler (master column, on horizontal overflow)    ⚙ = table settings (sticky)
```

---

## Component Architecture

```
Table (root)
└── TableProvider                    — React context with the TanStack Table instance
    └── TableInner
        └── TableActionBarProvider   — Ark UI Popover.Root, open while rows are selected
            └── TableActionBarAnchor — root container (className, data-testid)
                └── TableInnerContainer (default / virtualized='container')
                    or TableInnerWindow (virtualized='window')
                    ├── <table>
                    │   ├── TableColGroup
                    │   ├── TableHead — sticky <thead>
                    │   │   └── TableHeadCell — <th> (CVA variants)
                    │   │       ├── TableSortHandler / consumer TableSortTrigger
                    │   │       ├── TableColumnMenu (⋯) — Move left/right, Sort, Pin, Hide
                    │   │       ├── TableScrollHandlerSlot — master column, on horizontal overflow
                    │   │       └── TableResizeHandler — edge drag
                    │   └── TableBody — or TableBodyVirtualizedContainer / ...Window
                    │       ├── TableRow — data, group and full-width rows
                    │       │   ├── TableBodyCell — <td>, master cell actions (meta.renderMenuAction)
                    │       │   └── TableRowExpanded — renderExpandedRow content
                    │       └── TableLoadingState — skeleton rows (start / end)
                    ├── {children} — compound components passed to <Table>
                    │   ├── TableEmptyState     — rendered when there are no rows and not loading
                    │   ├── TableActionBar      — Popover.Content, floating panel
                    │   │   └── TableActionBarSelection — "N selected · Select all | Clear"
                    │   ├── TableSettingsMenu   — consumer override (portalled into the slot)
                    │   └── TableScrollHandler  — consumer override (portalled into the slot)
                    └── TableSettingsMenuSlot — ⚙, renders TableSettingsMenu unless the consumer passes one

// Composable (used in column definitions)
TableSortTrigger, TableColumnMenu (+ TableColumnMenu*Item) — returned from a column `header`
EditableTextCell, EditableSelectCell                       — returned from a column `cell`
```

### React Compiler

The whole Table tree is compiled by the React Compiler. TanStack Table v9 keeps
`row` / `column` / `header` / `cell` objects at a stable identity while their
getter results (`getIsSelected()`, `getIsSorted()`, `getSize()`, ...) change, so
a compiled component must never call a getter on those objects directly in
render — it would memoize the first result. `lib/tableReactivity.ts` and
`lib/useRenderEveryTime.ts` provide the sanctioned reads:

- `useTableValue(() => column.getIsSorted())` — scalar reads (or references
  TanStack memoizes, like `row.getVisibleCells()`); subscribes to the table
  store, the documented v9 pattern.
- `useRenderEveryTime(() => ...)` — consumer callbacks: the `cell` renderer,
  a function `header` (called inline, not as an element), `meta.renderMenuAction`
  and `renderExpandedRow`. They may call hooks or read context, so they run on
  every render, exactly as before the compiler. The hook lives in its own file
  with a file-level `'use no memo'`; a compiled caller never skips a hook call,
  so the callback cannot be cached (a cached call would break the consumer's
  hook order and leave context reads stale).
- `withTableState(table.state, () => ...)` — internal output that cannot be
  compared by value: lists whose items read getters (filler cells, skeleton
  rows, the drag overlay, the settings menu column lists). Re-runs on every
  table state change.

Getter calls inside event handlers and effects run at call time and need
neither. Components that create a `@tanstack/react-virtual` instance are left
uncompiled by the compiler itself; they pass plain values
(`getVirtualItems()`, `getTotalSize()`) to `TableBodyVirtualizedCore`. Check
for bailouts with `pnpm compiler:audit`.

---

## API

> **Feature activation principle:** there are no separate `enable*` flags. A feature is considered enabled if at least one of its props (callback or state) is provided. For example, column resizing is activated by passing `onColumnSizingChange`, pinning — by passing `columnPinning` or `onColumnPinningChange`, and so on.

Column definitions use the DS types (`TableColumnDef<T>`), usually built with `createTableColumnHelper<T>()` (`accessor(key, options)` / `display(options)`). Per-column options: `header`, `cell`, `size`, `minSize`, `maxSize`, `enableSorting`, `enableResizing`, `enableColumnPinning`, `enableHiding`, `meta`.

The first data column is the **master column**: always pinned left, cannot be hidden, pinned or reordered.

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | **required** | Data array for rows |
| `columns` | `TableColumnDef<T>[]` | **required** | Column definitions |
| `isLoading` | `boolean` | `false` | Show skeleton rows |
| `skeletonCount` | `number` | `12` | Number of skeleton rows while loading |
| `getRowId` | `(row: T, index: number) => string` | — | Stable row identity |
| `stretch` | `boolean` | `true` | Columns stretch proportionally to fill the container width |
| `aria-label` | `string` | — | Accessible label for the `<table>` |
| `className` | `string` | — | Root container class |
| `children` | `ReactNode` | — | Slot for `TableActionBar`, `TableEmptyState`, `TableSettingsMenu`, `TableScrollHandler` |

### Sorting

Enabled by passing `onSortingChange`. Per-column control via `enableSorting` in column definition.

| Prop | Type | Description |
|------|------|-------------|
| `sorting` | `TableSortingState` | Sorting state (controlled) |
| `onSortingChange` | `TableOnChangeFn<TableSortingState>` | Callback on sorting change |
| `manualSorting` | `boolean` | Disable client-side sort; render `data` as-is and only fire `onSortingChange`. Use for server-side sorting. Default: `false` |

### Row Selection

Enabled by passing `onRowSelectionChange` — the checkbox column is then added automatically.

| Prop | Type | Description |
|------|------|-------------|
| `rowSelection` | `TableRowSelectionState` | Row selection state (controlled) |
| `onRowSelectionChange` | `TableOnChangeFn<TableRowSelectionState>` | Callback on selection change |
| `enableSelectAllRows` | `boolean` | Render the master checkbox in the selection column header. Default: `true` |
| `onSelectAllRows` | `(selected: boolean) => void` | Fired when the master checkbox is toggled (in addition to `onRowSelectionChange`) |

### Column Resizing

Enabled by passing `onColumnSizingChange`. Sizes apply live while dragging (`columnResizeMode: 'onChange'`, not configurable).

| Prop | Type | Description |
|------|------|-------------|
| `columnSizing` | `TableColumnSizingState` | Current column sizes (controlled) |
| `onColumnSizingChange` | `TableOnChangeFn<TableColumnSizingState>` | Callback on resize |

### Column Pinning

Enabled by passing `columnPinning` or `onColumnPinningChange`.

| Prop | Type | Description |
|------|------|-------------|
| `columnPinning` | `TableColumnPinningState` | Pinned columns `{ left: [...], right: [...] }` |
| `onColumnPinningChange` | `TableOnChangeFn<TableColumnPinningState>` | Callback on change |

### Column Reordering (Drag & Drop)

Enabled by passing `onColumnOrderChange`.

| Prop | Type | Description |
|------|------|-------------|
| `columnOrder` | `string[]` | Column order (controlled) |
| `onColumnOrderChange` | `TableOnChangeFn<string[]>` | Callback on order change |

### Grouping

Column grouping is enabled by passing `grouping` or `onGroupingChange`. Sub-row grouping is enabled by passing `getSubRows` + `renderGroupRow`.

| Prop | Type | Description |
|------|------|-------------|
| `grouping` | `TableGroupingState` | Columns for grouping (controlled) |
| `onGroupingChange` | `TableOnChangeFn<TableGroupingState>` | Callback on grouping change |
| `getSubRows` | `(row: T) => T[] \| undefined` | Sub-row grouping: top-level rows with sub-rows render as group rows |
| `showEmptyGroups` | `boolean` | Render a top-level row whose `getSubRows` returns `[]` as an empty group row |
| `renderGroupRow` | `(row: TableRow<T>) => ReactNode` | Sub-row grouping mode (with `getSubRows`): drops the expand column; the content owns its expand toggle (`row.getToggleExpandedHandler()`). Rendered only with `groupRowSpan: 'full'` |
| `groupRowSpan` | `'master' \| 'full'` | `'master'` (default): group row shows the master column cell + fillers. `'full'`: `renderGroupRow` in one cell spanning every data column |
| `groupExpandColumn` | `boolean` | Sub-row grouping mode: keep the expand column (first, ahead of the drag handle) with a toggle on group rows only, instead of leaving the toggle to `renderGroupRow` |
| `renderFullWidthRow` | `(row: TableRow<T>) => ReactNode \| undefined` | Render a non-group row as one cell spanning the data columns (banner rows); `undefined` renders the row normally |

### Row Reordering (Drag & Drop)

Enabled by passing `onRowReorder` (auto-injects a drag-handle column). Under `getSubRows` grouping a row moves only within its own group; group rows never move.

| Prop | Type | Description |
|------|------|-------------|
| `onRowReorder` | `(event: TableRowReorderEvent) => void` | Called with `{ activeRowId, overRowId }` on drop |
| `getRowCanDrag` | `(row: TableRow<T>) => boolean` | Per-row lock: `false` → disabled grip (none on a `renderFullWidthRow` banner), not draggable, not a drop target. Default: every non-group row |

### Row Expanding

Enabled by passing `onExpandedChange` or `renderExpandedRow` (auto-injects the expand column).

| Prop | Type | Description |
|------|------|-------------|
| `expanded` | `TableExpandedState` | Expanded state (controlled) |
| `onExpandedChange` | `TableOnChangeFn<TableExpandedState>` | Callback on expand/collapse |
| `renderExpandedRow` | `(row: TableRow<T>) => ReactNode` | Custom expanded row content |

### Column Visibility

Enabled by passing `onColumnVisibilityChange`. Per-column control via `enableHiding` in column definition.

| Prop | Type | Description |
|------|------|-------------|
| `columnVisibility` | `TableVisibilityState` | Column visibility `{ [columnId]: boolean }` (controlled) |
| `onColumnVisibilityChange` | `TableOnChangeFn<TableVisibilityState>` | Callback on visibility change |
| `defaultColumnVisibility` | `TableVisibilityState` | Initial visibility for "Reset to default" in Settings Menu |
| `defaultColumnOrder` | `string[]` | Initial order for "Reset to default" in Settings Menu |
| `columnGroups` | `TableColumnGroup[]` | Labeled, flat (non-reorderable) sections in the Settings Menu instead of the pinned/unpinned drag list |
| `deferColumnVisibility` | `boolean` | Hold visibility toggles until the Settings Menu closes, then apply them as one change |
| `onSettingsOpenChange` | `(open: boolean) => void` | Fired when the built-in Settings Menu opens / closes |

### Master Cell

| Prop | Type | Description |
|------|------|-------------|
| `onMasterCellClick` | `(rowId: string) => void` | Fired when the master cell is clicked |
| `activeRowId` | `string \| null` | Highlighted row (`data-preview-active`) |

### Virtualization

Enabled by passing `virtualized`. Renders only visible rows for large datasets.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `virtualized` | `'container' \| 'window'` | — (off) | `'container'` virtualizes inside the table's own scroll container; `'window'` follows the page scroll (nearest scrollable ancestor or the browser window) |
| `estimateRowHeight` | `(index: number) => number` | `() => 40` | Row height estimate; rendered rows are measured |
| `overscan` | `number` | `6` | Number of rows rendered outside the visible area (buffer) |

### Infinite Scroll

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onEndReached` | `() => void` | — | Fired when the user scrolls near the bottom |
| `onEndReachedThreshold` | `number` | `200` | Distance from the bottom (px) |
| `onStartReached` | `() => void` | — | Fired when the user scrolls near the top (bidirectional) |
| `onStartReachedThreshold` | `number` | `200` | Distance from the top (px) |
| `isLoadingPrevious` | `boolean` | `false` | Skeleton rows above the first row while a previous page loads |
| `initialScrollToRowId` | `string` | — | Row to scroll to on mount; edge detectors arm after that scroll settles |

### Imperative handle (`ref`)

`<Table>` accepts a `ref` of type `TableHandle` that exposes a single method:

```ts
interface TableHandle {
  scrollToRow(
    id: string,
    opts?: {
      align?: 'start' | 'center' | 'end' | 'auto'; // default 'auto'
      behavior?: 'auto' | 'smooth';                // default 'auto'
    },
  ): boolean;
}
```

The method returns `true` when the row is found in the current row model and a scroll is initiated, `false` when the id is not in the current rows or the virtualizer has not yet mounted. Callers own retry/pagination — Table does not try to load more pages on its behalf.

In virtualized mode (`virtualized='container'` or `'window'`) the method calls `virtualizer.scrollToIndex` on the underlying TanStack instance — this is the only reliable way to scroll to a row that is outside the currently rendered window. In non-virtualized mode it falls back to a `scrollIntoView` lookup by `[data-row-id]` on the `<tr>` element.

```tsx
const tableRef = useRef<TableHandle>(null);

useEffect(() => {
  if (!targetId) return;
  // Retries on the next frame if the virtualizer hasn't mounted yet.
  if (!tableRef.current?.scrollToRow(targetId, { align: 'auto' })) {
    const r = requestAnimationFrame(() => tableRef.current?.scrollToRow(targetId));
    return () => cancelAnimationFrame(r);
  }
}, [targetId]);

return <Table ref={tableRef} ... />;
```


### Controlled / Uncontrolled

All interactive states work in two modes (via `useTableState`; pinning via `useControlled`):
- **Uncontrolled** — only the callback is passed, state is managed internally
- **Controlled** — value + callback are passed, state is managed externally

---

## Feature Descriptions

### 1. Sorting
- Enabled per-column via `enableSorting` in column definition once `onSortingChange` is passed
- Visual indication in the header: asc / desc / unsorted icons; sort labels depend on `meta.sortType` (`text`, `number`, `date`, …; numeric accessor columns get `number` automatically)
- Header with sorting becomes interactive (CVA variant)
- Client-side sorting out of the box via TanStack's sorted row model
- Server-side sorting: pass `manualSorting` (with controlled `sorting` + `onSortingChange`). Sort UI fires `onSortingChange`, the consumer fetches pre-sorted data, and the table renders it unchanged
- `TableSortTrigger` returned from a column `header` replaces the built-in sort icon (consumer-owned `<button>`)

### 2. Row Selection
- Checkbox column is injected automatically when `onRowSelectionChange` is passed
- Select All with indeterminate state (hide it with `enableSelectAllRows={false}`); shift-click selects a range
- TableActionBar appears automatically when rows are selected

### 3. Action Bar (Batch Actions)
- Floating panel based on Ark UI Popover, pinned to the bottom of the viewport within the table's horizontal bounds
- Open while at least one row is selected
- Contains the selection summary (`TableActionBarSelection`: count, Select all, Clear — composed from `BulkBarSummary*`) and consumer action controls (any children, e.g. `<Button>`)
- Escape deselects all and hides the panel

### 4. Loading / Empty State
- `isLoading` shows `skeletonCount` skeleton rows (using the `Skeleton` component); with data, they are appended at the bottom
- `isLoadingPrevious` shows skeleton rows above the first row (prepend loader)
- When there are no rows and `isLoading` is `false`, `<TableEmptyState>` renders its `children` below the header
- There is no default empty template — without `<TableEmptyState>` only the header is shown. Typically wrap an `EmptyState`

### 5. Column Resizing
- Drag handle on the right edge of the column header (not on the last column)
- Sizes apply live while dragging
- Minimum / maximum width via `minSize` / `maxSize` (default `minSize` is 96px)
- `meta.resizeType`: `'resize'` (default) adapts content, `'cut'` truncates it

### 6. Column Pinning
- Pin columns to the left or right of the scrollable area
- Pinned columns remain visible during horizontal scrolling
- Shadow at the boundary of the last left-pinned column once the table is scrolled
- System columns (expand, selection, drag handle) and the master column are always pinned left
- Control: column header menu (Pin / Unpin), `enableColumnPinning` in column definition, or props
- Pinned columns are excluded from column reorder

### 7. Column Drag & Drop
- Drag a column header to change the order (the whole header cell is the handle)
- Pinned columns do not participate in reorder
- DnD library: `@dnd-kit/core` + `@dnd-kit/sortable`

### 8. Grouping
- Column grouping: group rows by value of one or more columns (`grouping`)
- Sub-row grouping: `getSubRows` + `renderGroupRow` — group header row with expand / collapse toggle; `groupRowSpan='full'` spans the content across all data columns
- Sub-row grouping: the parent group row sticks under the header while its rows scroll (`StickyGroupParent`)

### 9. Row Expanding
- Expand individual rows to show additional content
- Expand / collapse button in the auto-injected expand column (first column)
- `renderExpandedRow` — full control over expanded area content
- Expanded row is rendered as a `<tr>` spanning all columns

### 10. Column Visibility
- Hide/show columns without removing them from `columns`
- Managed via the Table Settings Menu, the Column Header Menu ("Hide"), or props
- Per-column control: `enableHiding: false` in column definition prevents hiding a specific column

### 11. Column Header Menu (`TableColumnMenu`)
- "⋯" button in the column header, visible on hover
- Rendered automatically for non-master data columns when pinning, hiding or column reorder is available
- Default items (each hidden when not available):
  - **Move left / Move right** — move the column one position
  - **Sort** — submenu with the two `sortType` labels (e.g. `A → Z` / `Z → A`)
  - **Pin / Unpin**
  - **Hide**
- Returning `<TableColumnMenu column={column}>` from a column `header` replaces the default; its children (`TableColumnMenuSortItem`, `TableColumnMenuPinItem`, `TableColumnMenuHideItem`, `TableColumnMenuMoveLeftItem`, `TableColumnMenuMoveRightItem`, or any `DropdownMenuItem`) replace the default items
- Built on the DS `DropdownMenu`

### 12. Virtualization
- Renders only visible rows — for tables with 1000+ rows
- `virtualized='container'`: rows scroll inside the table's own container — give the table a height. `virtualized='window'`: rows follow the page scroll
- Spacer rows above and below the rendered window keep the scroll height; rows are measured after render, `estimateRowHeight` improves the initial estimate
- Implemented via `@tanstack/react-virtual`
- Sticky header and column pinning work as in non-virtualized mode
- Programmatic scroll to an off-screen row: `ref.scrollToRow(id)` (see Imperative handle)

### 13. Table Settings Menu (`TableSettingsMenu`)
- ⚙ button in the top-right corner of the header, sticky (visible even during horizontal scroll)
- Appears **automatically** when `onColumnVisibilityChange` or `onColumnOrderChange` is provided
- Dropdown contains:
  - Search by column name
  - Column list: drag-reorder (grip icon) + toggle visibility (switch); with `columnGroups` — labeled flat sections instead
  - "Pinned" section — user-pinned columns
  - "Reset to default" — resets to `defaultColumnVisibility` and `defaultColumnOrder`
- Changes apply immediately (or on close with `deferColumnVisibility`)
- Passing `<TableSettingsMenu>` as a child of `<Table>` replaces the default; `TableSettingsMenuItem` (by `columnId`), `TableSettingsMenuSearch` and `TableSettingsMenuReset` children override single slots

### 14. Scroll Handler (`TableScrollHandler`)
- Left / right scroll buttons in the master column header, shown only on horizontal overflow
- Passing `<TableScrollHandler>` (with `TableScrollHandlerLeft` / `TableScrollHandlerRight`) as a child of `<Table>` replaces the default buttons

---

## Feature Compatibility Matrix

| | Sorting | Selection | Resize | Pin | Col DnD | Grouping | Expanding | Visibility | HeaderMenu | SettingsMenu | Virtual |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Sorting** | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Selection** | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Resize** | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pin** | ✅ | ✅ | ✅ | — | ⚠️* | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Col DnD** | ✅ | ✅ | ✅ | ⚠️* | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Grouping** | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Expanding** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| **Visibility** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| **HeaderMenu** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| **SettingsMenu** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **Virtual** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

\* Pin + Col DnD — pinned columns are excluded from reorder

---

## Styling

- **Tailwind CSS** for all styles; **CVA** variants in `classes.ts` (head cell, body cell, row, container)
- **Column meta** for individual column customization:
  - `meta.headerClassName` — additional classes on `<th>`
  - `meta.cellClassName` — additional classes on `<td>`
  - `meta.align` — `'left' | 'center' | 'right'` (defaults to right for `number` / `score` / `size` sort types)
  - `meta.description` — text under the title or a tooltip (`{ type: 'text' | 'tooltip', content }`)
- Container: DS `ScrollArea` with horizontal and vertical scrollbars, rounded border
- Pinned columns: `position: sticky` + `z-index` + shadow at the boundary
- **Sticky header**: `<thead>` sticks during vertical scroll (`position: sticky; top: 0`)
- **Header height**: 32px, 48px when a column has a text description
- **Table Settings Button**: sticky in the top-right corner, above content

---

## Dependencies

| Dependency | Role |
|------------|------|
| `@tanstack/react-table` | Headless core: data models, sorting, selection, grouping, expanding, resizing, pinning, visibility |
| `@tanstack/react-virtual` | Row virtualization: rendering only the visible area |
| `@ark-ui/react/popover` | Action bar: positioning of the floating panel |
| `@dnd-kit/core`, `@dnd-kit/sortable` | Drag & drop for columns, rows, and the settings menu list |
| `class-variance-authority` | Component style variants |
| Internal components | `BulkBar`, `Button`, `Checkbox`, `DropdownMenu`, `ScrollArea`, `Select`, `Separator`, `Skeleton`, `Stack`, `Switch`, `Text`, `ToggleButton`, `Tooltip`, icons |

---

## Public Exports

From `Table/index.ts`:

```typescript
// Components
Table
TableActionBar, TableActionBarSelection
TableEmptyState
TableColumnMenu,
  TableColumnMenuSortItem, TableColumnMenuPinItem, TableColumnMenuHideItem,
  TableColumnMenuMoveLeftItem, TableColumnMenuMoveRightItem
TableSettingsMenu, TableSettingsMenuItem, TableSettingsMenuSearch, TableSettingsMenuReset
TableScrollHandler, TableScrollHandlerLeft, TableScrollHandlerRight
TableSortTrigger
EditableTextCell, EditableSelectCell, editableCellVariants, EDITABLE_CELL_COLUMN_META
BulkBarSummary, BulkBarSummaryCount, BulkBarSummarySelectAll,
  BulkBarSummarySeparator, BulkBarSummaryClear   // re-exported from BulkBar

// Helpers
createTableColumnHelper, TableColumnHelper

// Types (DS-owned; consumers do not import from @tanstack/react-table)
TableProps, TableHandle, TableScrollToRowOptions, TableVirtualized,
TableColumnDef, TableAccessorColumnDef, TableDisplayColumnDef, TableColumnBase,
TableColumnMeta, TableColumnGroup, TableCellContext, TableRow, TableRowReorderEvent,
TableSortingState, TableRowSelectionState, TableColumnSizingState,
TableColumnPinningState, TableGroupingState, TableExpandedState, TableVisibilityState,
TableOnChangeFn, TableUpdater, DSTableFeatures
// plus the *Props types of the sub-components above (no TableEmptyState / TableActionBar props type)
```

The selection, expand and drag-handle columns are internal (`lib/create*Column`) and injected automatically.

---

## Usage Patterns

```tsx
const columnHelper = createTableColumnHelper<User>();
const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email', enableSorting: true }),
];

// Basic table
<Table data={users} columns={columns} />

// Sorting + selection + batch actions (selection column is injected automatically)
<Table
  data={users}
  columns={columns}
  sorting={sorting}
  onSortingChange={setSorting}
  rowSelection={rowSelection}
  onRowSelectionChange={setRowSelection}
>
  <TableActionBar>
    <Button variant='ghost' color='neutral'>Delete</Button>
  </TableActionBar>
</Table>

// Column resizing (activated by passing onColumnSizingChange)
<Table data={users} columns={columns} onColumnSizingChange={setSizing} />

// Column pinning (activated by passing columnPinning)
<Table data={users} columns={columns} columnPinning={{ left: ['email'], right: ['actions'] }} />

// Row expanding
<Table
  data={users}
  columns={columns}
  renderExpandedRow={row => <UserDetails user={row.original} />}
/>

// Sub-row grouping with a full-width group row
<Table
  data={groups}
  columns={columns}
  getSubRows={group => group.items}
  groupRowSpan='full'
  renderGroupRow={row => <GroupHeader row={row} />}
/>

// Column Visibility + Settings Menu (automatic)
<Table
  data={users}
  columns={columns}
  onColumnVisibilityChange={setVisibility}
  onColumnOrderChange={setOrder}
  defaultColumnVisibility={initialVisibility}
  defaultColumnOrder={initialOrder}
/>

// Custom Empty State (compound component, like TableActionBar)
<Table data={[]} columns={columns}>
  <TableEmptyState>
    <EmptyState>
      <EmptyStateTitle>No results found</EmptyStateTitle>
    </EmptyState>
  </TableEmptyState>
</Table>

// Virtualized Table (1000+ rows) — give the table a height
<Table data={largeDataset} columns={columns} virtualized='container' className='h-600' />

// Virtualized with the page scroll + infinite loading
<Table
  data={largeDataset}
  columns={columns}
  virtualized='window'
  estimateRowHeight={() => 56}
  onEndReached={loadMore}
  isLoading={isFetchingMore}
/>
```
