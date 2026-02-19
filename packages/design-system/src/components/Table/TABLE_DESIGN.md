# Table Component — Design Document

## Purpose

Table is a component of the new design system (`@wallarm-org/design-system`) for displaying and interacting with tabular data.
It supports sorting, row selection, batch actions, column resizing and pinning, column and row drag & drop, grouping, row expanding, column visibility, column header context menu, cell context menu, table settings, sticky header, and virtualization.

Built on top of `@tanstack/react-table` as a headless core (suggest your alternatives).

---

## Conceptual Model

```
┌──────────────────────────────────────────────────────────────────────────┐
│  <Table data={[...]} columns={[...]}>                                    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  thead (sticky: position: sticky; top: 0)                          │  │
│  │  ┌───┬──────────┬─|─────────┬──────────┬────────┬──────────┬───┐  │  │
│  │  │ 📌│ Name ↕⋯⇔ │ Phone ↕⋯⇔│ Email ⋯⇔ │ Status │ Actions  │ ⚙│  │  │
│  │  │ ☐ │  drag    ↕│  drag   ↕│  drag    │        │          │   │  │  │
│  │  └───┴──────────┴─|─────────┴──────────┴────────┴──────────┴───┘  │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │  tbody                                             right-click →   │  │
│  │  ▼ Group: "Active" (3)                          context menu       │  │
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
│  │  TableEmptyState (compound, displayed when data=[])                │  │
│  │  "No results found"                                                │  │
│  │  "Try to apply different filter or reset it."                      │  │
│  │  [Reset filters]  [Refresh]                                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  TableActionBar (floating, appears on selection)                    │  │
│  │  "2 selected"  │  [Resend]  [Delete]  │  [✕ Close]                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  </Table>                                                                │
└──────────────────────────────────────────────────────────────────────────┘

📌 = pinned column    ↕ = sortable    ⇔ = resizable    drag = reorderable
⋯ = column header menu (hover)    ⚙ = table settings (sticky)
```

---

## Component Architecture

```
Table (root)
├── TableProvider              — React Context with TanStack Table instance
├── TableActionBarProvider     — Ark UI Popover.Root, manages action bar visibility
│   ├── TableActionBarAnchor   — Popover.Anchor, wrapper around the table container
│   │   └── <table>
│   │       ├── <thead>
│   │       │   ├── TableHeadCell — <th> with CVA variants (interactive / static)
│   │       │   │   ├── drag handle (column reorder)
│   │       │   │   ├── sort indicator
│   │       │   │   ├── resize handle (edge drag)
│   │       │   │   └── TableColumnHeaderMenu — dropdown menu (⋯): Sort, Pin, Hide, Move
│   │       │   │
│   │       │   └── TableSettingsButton — ⚙ icon, sticky, opens TableSettingsMenu
│   │       │       └── TableSettingsMenu — popover: search, toggle visibility, reorder, reset
│   │       │
│   │       └── <tbody>
│   │           ├── TableGroupRow    — group header row (collapsible)
│   │           ├── TableRow         — <tr> with smart click handling
│   │           │   └── TableBodyCell — <td>
│   │           ├── TableExpandedRow — expanded row content
│   │           └── TableLoadingState — skeleton rows
│   │
│   └── {children} — slot for compound components
│       ├── TableEmptyState          — empty state when data=[] (compound)
│       └── TableActionBar           — Popover.Content, floating panel
│           ├── TableActionBarSelection — "N selected"
│           ├── TableActionBarButton    — batch action buttons
│           └── TableActionBarClose     — deselect all

// Composable (used in column definition, cell renderer)
TableCellContextMenu        — cell wrapper, right-click → Copy, Show only, Exclude
```

---

## API

> **Feature activation principle:** there are no separate `enable*` flags. A feature is considered enabled if at least one of its props (callback or state) is provided. For example, column resizing is activated by passing `onColumnSizingChange`, pinning — by passing `columnPinning` or `onColumnPinningChange`, and so on.

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | **required** | Data array for rows |
| `columns` | `ColumnDef<T>[]` | **required** | Column definitions (TanStack) |
| `isLoading` | `boolean` | `false` | Show skeleton rows |
| `children` | `ReactNode` | — | Slot for `TableActionBar`, `TableEmptyState`, and other compound components |

### Sorting

Enabled by passing `onSortingChange`. Per-column control via `enableSorting` in column definition.

| Prop | Type | Description |
|------|------|-------------|
| `sorting` | `SortingState` | Sorting state (controlled) |
| `onSortingChange` | `OnChangeFn<SortingState>` | Callback on sorting change |

### Row Selection

Enabled by passing `onRowSelectionChange`. Checkbox column is added via `createSelectionColumn<T>()`.

| Prop | Type | Description |
|------|------|-------------|
| `rowSelection` | `RowSelectionState` | Row selection state (controlled) |
| `onRowSelectionChange` | `OnChangeFn<RowSelectionState>` | Callback on selection change |

### Column Resizing

Enabled by passing `onColumnSizingChange`.

| Prop | Type | Description |
|------|------|-------------|
| `columnSizing` | `ColumnSizingState` | Current column sizes (controlled) |
| `onColumnSizingChange` | `OnChangeFn<ColumnSizingState>` | Callback on resize |
| `columnResizeMode` | `'onChange' \| 'onEnd'` | When to apply new size (default `'onEnd'`) |

### Column Pinning

Enabled by passing `columnPinning` or `onColumnPinningChange`.

| Prop | Type | Description |
|------|------|-------------|
| `columnPinning` | `ColumnPinningState` | Pinned columns `{ left: [...], right: [...] }` |
| `onColumnPinningChange` | `OnChangeFn<ColumnPinningState>` | Callback on change |

### Column Reordering (Drag & Drop)

Enabled by passing `onColumnOrderChange`.

| Prop | Type | Description |
|------|------|-------------|
| `columnOrder` | `string[]` | Column order (controlled) |
| `onColumnOrderChange` | `OnChangeFn<string[]>` | Callback on order change |

### Grouping

Enabled by passing `grouping` or `onGroupingChange`.

| Prop | Type | Description |
|------|------|-------------|
| `grouping` | `GroupingState` | Columns for grouping (controlled) |
| `onGroupingChange` | `OnChangeFn<GroupingState>` | Callback on grouping change |
| `renderGroupRow` | `(group: GroupRow<T>) => ReactNode` | Custom group row renderer |

### Row Expanding

Enabled by passing `onExpandedChange` or `renderExpandedRow`.

| Prop | Type | Description |
|------|------|-------------|
| `expanded` | `ExpandedState` | Expanded state (controlled) |
| `onExpandedChange` | `OnChangeFn<ExpandedState>` | Callback on expand/collapse |
| `renderExpandedRow` | `(row: Row<T>) => ReactNode` | Custom expanded row content |

### Column Visibility

Enabled by passing `onColumnVisibilityChange`. Per-column control via `enableHiding` in column definition.

| Prop | Type | Description |
|------|------|-------------|
| `columnVisibility` | `VisibilityState` | Column visibility `{ [columnId]: boolean }` (controlled) |
| `onColumnVisibilityChange` | `OnChangeFn<VisibilityState>` | Callback on visibility change |
| `defaultColumnVisibility` | `VisibilityState` | Initial visibility for "Reset to default" in Settings Menu |
| `defaultColumnOrder` | `string[]` | Initial order for "Reset to default" in Settings Menu |

### Virtualization

Enabled by passing `virtualized`. Renders only visible rows for large datasets.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `virtualized` | `boolean` | `false` | Enable row virtualization |
| `estimateRowHeight` | `(index: number) => number` | — | Row height estimate for variable-size virtualization; if not provided, height is measured automatically |
| `overscan` | `number` | `5` | Number of rows rendered outside the visible area (buffer) |

### Controlled / Uncontrolled

All interactive states work in two modes via the `useControlled` hook:
- **Uncontrolled** — only the callback is passed, state is managed internally
- **Controlled** — value + callback are passed, state is managed externally

---

## Feature Descriptions

### 1. Sorting
- Enabled per-column via `enableSorting: true` in column definition
- **Disabled** by default for all columns
- Visual indication in the header: asc / desc / unsorted icons
- Header with sorting becomes clickable (interactive variant via CVA)
- Client-side sorting out of the box; server-side — via controlled state (consumer fetches data on `onSortingChange`)

### 2. Row Selection
- Implemented via a checkbox column — manually or through the `createSelectionColumn<T>()` helper
- Support for Select All with indeterminate state
- TableActionBar automatically appears when rows are selected

### 3. Action Bar (Batch Actions)
- Floating panel based on Ark UI Popover, slide-up animation
- Automatically appears when `selectedCount > 0`
- Contains: selected count, custom action buttons, close button
- Escape deselects all and hides the panel
- Custom actions are passed via `<TableActionBarButton>` as children

### 4. Loading / Empty State
- `isLoading={true}` shows skeleton rows (using the `Skeleton` component)
- If data already exists — skeletons are appended at the bottom
- If no data exists — skeletons replace the empty state
- When `data=[]` and `isLoading=false`, the empty state is shown spanning the full table width
- Empty state is implemented via the compound component `<TableEmptyState>`, passed as a child similar to `<TableActionBar>`
- `TableEmptyState` accepts arbitrary `children: ReactNode` — full control over content
- Design variants: text ("No results found"), text + description + buttons (Reset filters, Refresh), text + illustration
- Default (without `<TableEmptyState>`): standard template "No results found" + "Try to apply different filter or reset it."
- The table automatically finds `<TableEmptyState>` among children and renders it when data is empty

### 5. Column Resizing
- Drag handle on the right edge of the column header to change width
- Two modes: `onChange` (live preview while dragging) and `onEnd` (apply on release)
- Visual indication: vertical line indicator during resize
- Minimum / maximum width is set in column definition (`minSize`, `maxSize`)
- Implemented via native `getResizeHandler()` from TanStack Table

### 6. Column Pinning
- Pin columns to the left or right of the scrollable area
- Pinned columns remain visible during horizontal scrolling
- Visual shadow / divider at the boundary of pinned and scrollable zones
- Control: via column definition (`enablePinning`) or programmatically via props
- Pinned columns are excluded from column reorder

### 7. Column Drag & Drop
- Drag columns to change their order
- Drag handle in the header (or the entire header as a drag handle)
- Visual feedback: ghost element while dragging, drop indicator at the target position
- Pinned columns do not participate in reorder
- DnD library: `@dnd-kit/core`

### 8. Grouping
- Group rows by value of one or more columns
- Group header row with expand / collapse toggle
- Aggregation in group row (count, sum, etc.) — via `aggregationFn` in column definition
- Custom group row rendering via `renderGroupRow`
- TanStack Table: `getGroupedRowModel()` + `getExpandedRowModel()`

### 9. Row Expanding
- Expand individual rows to show additional content
- Expand / collapse button (chevron) in the first or a custom column
- `renderExpandedRow` — full control over expanded area content
- Expanded row is rendered as a `<tr>` with `colSpan` across all columns
- Works alongside grouping — groups and rows expand independently

### 10. Column Visibility
- Hide/show columns without removing them from `columns`
- Managed via Table Settings Menu (built-in automatically), Column Header Menu ("Hide" option), or programmatically via props
- Per-column control: `enableHiding: false` in column definition prevents hiding a specific column
- TanStack Table: native `getVisibleLeafColumns()`
- Controlled/Uncontrolled via `useControlled` — same as all other interactive states

### 11. Column Header Menu
- "⋯" icon in the column header, visible on hover
- Appears **automatically** if at least one feature is available for the column: sorting, pinning, visibility, column reorder
- Menu items (conditional, depending on available features):
  - **Move left / Move right** — move column one position; unavailable for the first/last column respectively
  - **Sort** — submenu: Sort ascending, Sort descending, Clear sort; for complex sorting — select menu with multiple selection
  - **Pin / Unpin** — toggles depending on current pinning state
  - **Hide** — hides the column (calls `onColumnVisibilityChange`)
- Built on `@ark-ui/react/menu`

### 12. Cell Context Menu (`TableCellContextMenu`)
- Composable component: the consumer wraps cell content in the `cell` renderer of the column definition
- Right-click on a cell opens the context menu
- Menu items:
  - **Copy value** — copies the cell value
  - **Show only** — "Filter to matching rows"
  - **Exclude** — "Filter out matching rows"
- Built on `@ark-ui/react/menu`

**Component API:**

| Prop | Type | Description |
|------|------|-------------|
| `value` | `unknown` | Value for Copy / filtering |
| `onCopy` | `(value: unknown) => void` | Callback on "Copy value" |
| `onFilter` | `(value: unknown, mode: 'include' \| 'exclude') => void` | Callback on "Show only" / "Exclude" |
| `children` | `ReactNode` | Cell content |

### 13. Virtualization
- Renders only visible rows — critical for tables with 1000+ rows
- Enabled by passing `virtualized={true}`
- The `<tbody>` container gets a fixed height and `overflow-y: auto`; rows are positioned absolutely inside a spacer element
- Row height is determined by content; for optimization, pass `estimateRowHeight`
- `overscan` — buffer rows outside the viewport for smooth scrolling
- Implemented via `@tanstack/react-virtual` — native integration with TanStack Table
- Sticky header works natively — `<thead>` is outside the virtualized area
- Column pinning is compatible — sticky columns work orthogonally to row virtualization

**Limitations:**
- Row Expanding: ⚠️ — works, but requires `estimateRowHeight` for correct height calculation
- Grouping: ⚠️ — works, group header rows participate in virtualization alongside regular rows

### 14. Table Settings Menu
- ⚙ icon in the top-right corner of the header, sticky (visible even during horizontal scroll)
- Appears **automatically** when `onColumnVisibilityChange` or `onColumnOrderChange` is provided
- Popover panel contains:
  - Search by column name
  - Column list: drag-reorder (grip icon) + toggle visibility (switch)
  - "Pinned" section — separate group of pinned columns (when `columnPinning` is provided)
  - "Reset to default" button — resets to `defaultColumnVisibility` and `defaultColumnOrder`
- Changes are applied on-the-fly (no "Apply" button)

---

## Feature Compatibility Matrix

| | Sorting | Selection | Resize | Pin | Col DnD | Grouping | Expanding | Visibility | HeaderMenu | ContextMenu | SettingsMenu | Virtual |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Sorting** | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Selection** | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Resize** | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pin** | ✅ | ✅ | ✅ | — | ⚠️* | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Col DnD** | ✅ | ✅ | ✅ | ⚠️* | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Grouping** | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️** |
| **Expanding** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ⚠️*** |
| **Visibility** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| **HeaderMenu** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| **ContextMenu** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| **SettingsMenu** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **Virtual** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️** | ⚠️*** | ✅ | ✅ | ✅ | ✅ | — |

\* Pin + Col DnD — pinned columns are excluded from reorder
\*\* Virtual + Grouping — works, group header rows participate in virtualization
\*\*\* Virtual + Expanding — works, but requires `estimateRowHeight` for correct heights

---

## Styling

- **Tailwind CSS** for all styles
- **CVA** (class-variance-authority) for variants in TableHeadCell (interactive / static)
- **Column meta** for individual column customization:
  - `meta.headerClassName` — additional classes on `<th>`
  - `meta.cellClassName` — additional classes on `<td>`
- Container: `overflow-x-auto` for horizontal scroll
- Pinned columns: `position: sticky` + `z-index` + box-shadow at the boundary
- **Sticky header**: `<thead>` sticks during vertical scroll (`position: sticky; top: 0`)
- **Layout**: table takes full available width; 24px padding from container edges
- **Row height**: determined by cell content height; header — 32px
- **Table Settings Button**: sticky in the top-right corner, z-index above content

---

## Dependencies

| Dependency | Role |
|------------|------|
| `@tanstack/react-table` | Headless core: data models, sorting, selection, grouping, expanding, resizing, pinning, visibility |
| `@ark-ui/react/popover` | Action bar: positioning and animations for the floating panel |
| `@ark-ui/react/menu` | Column Header Menu and Cell Context Menu: positioning and animations |
| `@tanstack/react-virtual` | Row virtualization: rendering only the visible area |
| `@dnd-kit/core` | Drag & Drop for columns |
| `class-variance-authority` | Component style variants |
| Internal components | `Checkbox`, `Button`, `Skeleton`, `Separator`, `TextLabel`, `HStack`, `Switch`, icons |

---

## Public Exports

```typescript
// Components
Table
TableActionBar, TableActionBarButton
TableEmptyState
TableGroupRow, TableExpandedRow
TableCellContextMenu
TableSettingsMenu
createSelectionColumn

// Re-export from @tanstack/react-table
createColumnHelper, ColumnDef, Row,
RowSelectionState, SortingState, ColumnSizingState,
ColumnPinningState, GroupingState, ExpandedState,
VisibilityState,
OnChangeFn, CoreOptions
```

---

## Usage Patterns

```tsx
// Basic table
<Table data={users} columns={columns} />

// Sorting + selection + batch actions
<Table data={users} columns={columnsWithSelection}>
  <TableActionBar>
    <TableActionBarButton><TrashOutline /> Delete</TableActionBarButton>
  </TableActionBar>
</Table>

// Column resizing (activated by passing onColumnSizingChange)
<Table
  data={users}
  columns={columns}
  onColumnSizingChange={(sizing) => setSizing(sizing)}
/>

// Column pinning (activated by passing columnPinning)
<Table
  data={users}
  columns={columns}
  columnPinning={{ left: ['name'], right: ['actions'] }}
/>

// Grouping + row expanding
<Table
  data={users}
  columns={columns}
  grouping={['status']}
  renderGroupRow={(group) => <>{group.getValue()} ({group.subRows.length})</>}
  renderExpandedRow={(row) => <UserDetails user={row.original} />}
/>

// Column drag & drop (activated by passing onColumnOrderChange)
<Table
  data={users}
  columns={columns}
  onColumnOrderChange={(order) => saveColumnOrder(order)}
/>

// Column Visibility + Settings Menu (automatic)
<Table
  data={users}
  columns={columns}
  onColumnVisibilityChange={(vis) => setVisibility(vis)}
  onColumnOrderChange={(order) => setOrder(order)}
  defaultColumnVisibility={initialVisibility}
  defaultColumnOrder={initialOrder}
/>

// Custom Empty State (compound component, like TableActionBar)
<Table data={[]} columns={columns}>
  <TableEmptyState>
    <EmptyState
      title="No results found"
      description="Try to apply different filter or reset it."
      actions={<Button onClick={resetFilters}>Reset filters</Button>}
    />
  </TableEmptyState>
</Table>

// Cell Context Menu (in column definition)
const columns = [
  columnHelper.accessor('name', {
    cell: ({ getValue, row }) => (
      <TableCellContextMenu
        value={getValue()}
        onCopy={(v) => navigator.clipboard.writeText(String(v))}
        onFilter={(v, mode) => applyFilter('name', v, mode)}
      >
        {getValue()}
      </TableCellContextMenu>
    ),
  }),
]

// Virtualized Table (1000+ rows)
<Table data={largeDataset} columns={columns} virtualized />

// Virtualized + variable row heights
<Table
  data={largeDataset}
  columns={columns}
  virtualized
  estimateRowHeight={(index) => (hasExpandedContent(index) ? 120 : 56)}
  overscan={10}
/>
```
