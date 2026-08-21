# DS `Table` — feature inventory (foundation for the new component)

> Source: `@wallarm-org/design-system` → `src/components/Table` (docs `TABLE_DESIGN.md`,
> `types.ts`, `index.ts`, subcomponents). The project uses version `0.66.1`.
> The purpose of this document is to capture what the current config/data-driven `Table`
> can do, so that we can deliberately design a new, more flexible, layout-driven component
> with a different API.

## Architecture of the current component
- Core — **`@tanstack/react-table`** (headless): data models, sorting, selection,
  grouping, expand, resize, pinning, visibility.
- **Data-driven API**: `<Table data={[...]} columns={[...]} />`. Cell content is provided
  via `cell` render callbacks in the column definitions, not via JSX markup.
- **Feature activation principle**: there are no `enable*` flags; a feature is turned on by
  passing the corresponding prop (callback/state).
- **Controlled / Uncontrolled** for all interactive states (the `useControlled` hook).
- Compound slots among `children`: `TableActionBar`, `TableEmptyState`,
  `TableSettingsMenu`, `TableScrollHandler`.
- Its own type facade on top of TanStack (`TableColumnDef`, `TableRow`, `TableProps`…).

## Feature list
1. **Sorting** — `onSortingChange`; per-column `enableSorting`; client-side
   (`getSortedRowModel`) or server-side (`manualSorting`); `meta.sortType`
   (text/number/date/duration/score/boolean/version/severity/size); `TableSortTrigger`.
2. **Row selection** — `onRowSelectionChange`; `createSelectionColumn<T>()`; Select All +
   indeterminate.
3. **Batch actions / Action Bar** — floating panel built on Ark UI Popover; auto-appears
   when `selectedCount > 0`; Escape clears the selection; `BulkBar*` summary components.
4. **Loading / Empty State** — `isLoading` + `skeletonCount`; `isLoadingPrevious`
   (skeletons on top); compound `<TableEmptyState>`.
5. **Column resize** — `onColumnSizingChange`; `columnResizeMode` (`onChange`/`onEnd`);
   `minSize`/`maxSize`; `meta.resizeType` (`resize`/`cut`).
6. **Column pinning** — `{ left, right }`; sticky + shadow at the boundary; excluded from reorder.
7. **Column DnD (reorder)** — `onColumnOrderChange`; `@dnd-kit/core`.
8. **Grouping** — `grouping`/`onGroupingChange`; `renderGroupRow`; tree data via
   `getSubRows`; `aggregationFn`.
9. **Row expansion** — `expanded`/`onExpandedChange`; `renderExpandedRow`; `<tr colSpan>`.
10. **Column visibility** — `columnVisibility`/`onColumnVisibilityChange`; `enableHiding`;
    `defaultColumnVisibility`/`defaultColumnOrder` for reset.
11. **Column Header Menu (⋯)** — auto on hover; Move left/right, Sort, Pin/Unpin, Hide
    (`@ark-ui/react/menu`); exports `TableColumnMenu*`.
12. **Cell Context Menu** — composable; right click → Copy / Show only / Exclude;
    `value`, `onCopy`, `onFilter`.
13. **Virtualization** — `virtualized: 'container' | 'window'` (`@tanstack/react-virtual`);
    `estimateRowHeight`, `overscan`; auto-reset when the data changes.
14. **Table Settings Menu (⚙)** — sticky; search, drag-reorder + visibility toggle, Pinned
    section, Reset to default; exports `TableSettingsMenu*`.
15. **Imperative API (`ref: TableHandle`)** — `scrollToRow(id, { align, behavior })`.
16. **Bidirectional Infinite Scroll** — `onEndReached`/`onStartReached` + thresholds;
    `initialScrollToRowId`.
17. **Master Cell Click** — `onMasterCellClick(rowId)` (tooltip "Open details");
    `activeRowId` → highlight via `data-preview-active`.
18. **Horizontal Scroll Handler** — `<TableScrollHandler>` (+ Left/Right buttons),
    portaled into the master column header, shown only on overflow.

## Customization
- Tailwind + CVA (`TableHeadCell` variants: interactive/static).
- Per-column `meta`: `headerClassName`, `cellClassName`, `align`, `description`
  (text/tooltip), `renderMenuAction(row)`.
- Sticky header (32px), `overflow-x-auto`, row height by content, `getRowId`,
  `aria-label`, testId props.

## Dependencies
`@tanstack/react-table` · `@tanstack/react-virtual` · `@ark-ui/react` (popover/menu/portal) ·
`@dnd-kit/core` · `class-variance-authority` · internal DS components.

## Pain points of the current API (from real usage in this repo)
> See `src/pages/schema-based-testing/ui/PoliciesPage/PoliciesTable/`.
- Cell content is written as **callbacks in the columns array**, not as JSX markup — lots
  of boilerplate, poor readability, hard to inline conditional layout.
- Fighting the cell's built-in styles: `cellClassName: 'p-0'`, `select-text` on top of the
  `select-none` baked into the component (`ExpandableCell`).
- A narrow fixed actions column requires the hack `size === minSize === maxSize` +
  `enableResizing: false`, otherwise `TableColGroup` stretches it.
- A single-open accordion is implemented via verbose parsing of the `updater` in
  `onExpandedChange`.
- Clicking the entire cell to expand a row has to be wrapped manually
  (`ExpandableCell`).
