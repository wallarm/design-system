# Table — usage

> The **data grid** — the dense, columnar view of a *collection of objects*
> (rows × columns) with sorting, selection, and scale features. Config-driven
> (`data` + `columns`) with composed slot children, built on TanStack Table v8.
> Interactive.

## Reach for it when
A collection of records needs a **scannable, columnar view** — users compare
across columns, sort, select rows to act on them, and drill into a row. Security
events, endpoints, audit logs, API inventories. Build columns with
`createTableColumnHelper` and pass `data`; the rest (sort/select/scroll) is wired
through props + composed children.

## Don't use it for
- **One object's fields / key-value detail** → `Attribute` (a description list),
  not a 2-column table. Table is for *many rows of the same shape*.
- **A visual-first or few-attribute collection** → a **card / grid** view (a grid
  of `Card`s). A collection often offers *both* (a table↔card view toggle): reach
  for Table when columns, scanning, sorting, and density matter; cards when the
  objects read better as tiles. (Either view paginates the same way — see Pairs
  with.)
- **A short, non-tabular list** → a plain list. Don't force columns onto data
  that isn't naturally tabular.

## Building it — data, columns, and what goes in a cell
- **Config-driven:** pass `data` + a `columns` array from `createTableColumnHelper<T>()`
  (`.accessor('field', …)` for data columns, `.display({ id, … })` for custom/action
  columns). The grid renders rows; you compose `TableActionBar` / `TableEmptyState` /
  `TableSettingsMenu` / `TableScrollHandler` as children.
- **A cell renders the dedicated display component for its value — never
  hand-rolled text.** Status code → `ResponseCode`; method → `HttpMethod`; IP /
  country → `Ip` / `Country`; a date → `FormatDateTime`; a parameter → `ParameterPath`;
  the row's title → `Link type="table"` (navigates to the object's full page); long
  values wrap in `OverflowTooltip`. The table is where the whole display-component
  family lands.
- **`column.meta` carries the judgment:** `sortType` (`text`/`number`/`date`/`severity`/…
  — drives the *semantic* sort label "Most critical on top" and the default alignment),
  `align`, `resizeType` (`cut` truncates / `resize` adapts), `description` (header
  hint, text or tooltip).

## Scale & data source
- **Render performance:** turn on `virtualized="container"` (or `"window"`) for
  any large row set — *even one fully loaded in memory*. Virtualization is about
  *rendering*, separate from how rows arrive (you don't need `onEndReached` to
  virtualize).
- **Fetching more — infinite scroll is the house default:** wire `onEndReached`
  (+ `onStartReached` / `isLoadingPrevious` for bidirectional; `initialScrollToRowId`
  or the imperative `scrollToRow` to deep-link into the middle). "Lots of rows"
  alone means infinite scroll, **not** a pager.
- **Pagination is the deliberate alternative** when paged *navigation* genuinely
  helps (bounded set, stable position, page-size control) — composed below the
  table (Table does **not** render it; `useClientPagination` for client data). See
  `Pagination`.
- **Sort & filter follow the same client-vs-server split as pagination:** sorting
  is client-side by default (the table sorts the `data` you pass); for
  server-sorted data set **`manualSorting`** (the table just signals
  `onSortingChange`, the server returns ordered rows). Filtering always lives
  *above* the grid — you hand the table the already-filtered `data`.

## Selection & bulk actions
Make rows selectable by passing `onRowSelectionChange` (a checkbox column +
shift-click range are auto-added). To act on the selection, render
`TableActionBar` — the floating "N selected · Select all · Clear" bar, wired to
the table's selection state; the same bulk-bar pattern outside a table is
`Selection`. Don't hand-roll a selected-rows toolbar. **Per-row actions are *not*
this** — put a row menu (`meta.renderMenuAction`, the hover three-dots) or an
inline control in a `.display()` action column; the bar is only for acting on the
*selection*.

## Empty, loading & filtering
- **Empty state** — render `TableEmptyState` (shown when there are no rows).
  Distinguish the two cases with different copy: *no data yet* (first run — an
  onboarding/empty message) vs *no results* (a filter or search matched nothing —
  say so and offer a way to clear the filter).
- **Loading** — pass `isLoading` for skeleton rows (`skeletonCount`); keep prior
  rows visible while loading more.
- **Filtering / search is not part of the grid** — it lives in a toolbar *above*
  the table: a `FilterInput` (the query-builder pattern) for multi-attribute
  filtering, or a search `Input` for free text.

## Locked — don't override
- **Density is fixed** — header/row heights are locked; there is **no
  compact/comfortable prop** (don't shrink rows via `className`). For a dense
  context, the smaller knob lives on `Pagination` (`size="small"`), not the table.
- **Header styling, hover, and selected-row states are automatic, and the header
  stays sticky on vertical scroll.** The selection and expand columns are a fixed
  33px (can't resize or hide).
- **Sort labels are semantic per `sortType`** ("A → Z", "Newest on top", "Most
  critical on top") and default alignment is right for `number`/`score`/`size` —
  set `meta.sortType`, don't relabel.
- **The action bar:** surface + show/hide animation + the selection summary are
  automatic — you pass action buttons. Buttons are `large`; secondary =
  `ghost`/`neutral-alt`; emphasize **at most one** as `brand` with a leading icon
  (usually Delete). **Never the red `destructive` color** — even Delete is `brand`
  + `Trash2`. One line, no wrap.

## Advanced — off unless you wire it
Column **resize**, **pin** (freezes a column during horizontal scroll — e.g. a
sticky first column), **reorder**, and **hide** (via the column + `TableSettingsMenu`);
**row grouping** with collapsible group headers (`getSubRows` + `renderGroupRow`);
**expandable rows** (`renderExpandedRow` — detail *in place*). Reach for these
only when the use case asks — the basic grid needs none of them.

**Row interactions are independent and coexist** — a row has no default body
click; you opt into each: the checkbox **selects**; a **master-cell click**
(`onMasterCellClick` + `activeRowId`) highlights the row and opens a `Drawer`
*preview*; the row-title **`Link`** navigates to the full page. (Preview in a
Drawer, everything on a page — the overlay ladder.)

## Pairs with
- `Pagination` — the deliberate paged footer (composed below; not rendered by
  Table). The same pager serves a card/grid view of the collection.
- `FilterInput` / search `Input` — filtering lives in a toolbar above the grid,
  never inside it; the table renders the filtered `data`.
- `Selection` — the same bulk-action bar for card / list layouts (`BulkBar` is
  the shared surface beneath both).
- The display family in cells — `HttpMethod` / `ResponseCode` / `Ip` / `Country` /
  `Link` / `FormatDateTime` / `ParameterPath`, wrapped in `OverflowTooltip`.
- `Drawer` — the row-detail preview a master-cell click opens; `Card` — the tile
  for the grid/card view of the same collection.
```tsx
const columns = [
  col.accessor('name', { header: 'Object', meta: { sortType: 'text' },
    cell: ({ row }) => <Link type="table" href="#">{row.original.name}</Link> }),
  col.accessor('lastSeen', { header: 'Last seen', meta: { sortType: 'date' },
    cell: ({ getValue }) => <FormatDateTime value={getValue()} /> }),
]
<Table data={data} columns={columns} getRowId={r => r.id} onRowSelectionChange={setSel}>
  <TableActionBar><Button color="brand"><Trash2 /> Delete</Button></TableActionBar>
</Table>
```
