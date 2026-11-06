---
title: Entity table
description: Use when you render a list of users, roles, providers, channels or policies as a Table, with status badges, tags, a row menu and bulk actions.
components: [Table, TableActionBar, TableActionBarSelection, TableEmptyState, Badge, Tag, OverflowList, Avatar, AvatarContent, AvatarName, AvatarDescription, Code, FormatDateTime, DropdownMenu, DropdownMenuItem, Button, Tooltip, Switch, EmptyState]
keywords: [table, master cell, renderMenuAction, data table, grid, list, rows, columns, entity list, users table, cell, status badge, tags, +N, overflow, row menu, row actions, kebab, ellipsis, three dots, bulk actions, bulk bar, selection, checkbox, sort, empty value, em dash, column description, reorder]
order: 20
---

# Entity table

One `Table` with a fixed cell vocabulary, a row menu in the master cell and a bulk bar.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| A list of entities on a page | `Table` inside `PageContent` | A `div` grid, a `Card` per row |
| A list in a drawer or dialog | The same `Table` inside `DrawerBody` or `DialogBody` (from `@wallarm-org/design-system/Dialog`) | A custom bordered list |
| Actions on one row | `meta.renderMenuAction` on the master (first) column | A trailing actions column, buttons repeated in every row |
| Actions on many rows | `onRowSelectionChange` plus `TableActionBar` | Your own floating bar |
| Details of one entity | `Attribute` in a drawer | A two-column `Table` |
| Kanban, preference matrix | Product code | This pattern |

Use only these cells.

| Data | Cell | Not |
| --- | --- | --- |
| Person | `Avatar size='md'` with `AvatarName` | `img` plus `span` |
| Second line | `AvatarDescription` | Two `Text` lines |
| Status | `Badge variant='dotted' type='secondary' color=…` | Colored text, a raw dot |
| Locked row | `Badge` with `Lock` in a `Tooltip` | A bare lock icon |
| Groups, roles | `OverflowList` of `Tag` | Joined text, custom "+N" |
| ID, key, hash | `Code size='m'` | A monospace `span` |
| Recent time | `FormatDateTime format='relative'` | `toLocaleString()` |
| Exact time | `FormatDateTime format='datetime'` | Two cells |
| Count, metric | The raw number | `meta.align` |
| On/off setting | `Switch` with `SwitchControl` | `Checkbox` |
| Missing value | `'—'` (em dash) | `0`, `N/A`, an empty cell |

## Rules

**Layout and spacing**

- The first column is pinned and never hideable: put the entity name there.
- `Table` owns its frame, borders, padding and header. **Never** wrap it in a bordered `div` or restyle cells via `meta.cellClassName`.
- `PageContent`, `DrawerBody` and `DialogBody` own the gutter. **Never** add `p-24` or any padding around `Table`.
- Set widths with `size`: name `320`, email `240`, status `140`, timestamp `200` (the default minimum is 96px).
- If columns must keep their `size`, pass `stretch={false}`.
- Two-line cell: add a `Text size='xs' color='secondary'` line; there is no `rowHeight`.

**Row menu**

- Every contextual row action goes through the master cell: `meta: { renderMenuAction }` on the first column. Its `…` shows on row hover, while the menu is open and on the previewed row.
- **Never** add a trailing actions column or buttons in cells. There is no `actions` column type or `alwaysShowMenu`.
- Trigger: `Button variant='ghost' color='neutral' size='small'`, `Ellipsis` icon, `aria-label` naming the row.
- Order items: open, edit, reorder, state changes, `DropdownMenuSeparator`, destructive.
- Use `variant='destructive'` and name the entity: "Delete user", not "Delete". Confirm before deleting.
- Inherited or read-only row: only view and "Open at {scope}".

**Data and selection**

- Always pass `getRowId={row => row.id}`; selection, `activeRowId` and reordering key on it.
- For selection, pass `rowSelection` and `onRowSelectionChange`; without the handler there are no checkboxes.
- Sorting: `sorting` and `onSortingChange`, plus `manualSorting` if the server sorts.
- Bulk actions: `Button variant='ghost' color='neutral-alt'` in `TableActionBar`; destructive last with `color='destructive'`; options go in a `DropdownMenu`.
- Custom selection text: `TableActionBarSelection` (from `@wallarm-org/design-system/Table`) with `BulkBarSummaryCount`, `BulkBarSummarySelectAll`, `BulkBarSummaryClear` as direct children.
- Drag to reorder: `onRowReorder`; pin rows with `getRowCanDrag`.

**Values**

- Status `color`: Active, Enabled, Connected `green`; Invited, Pending, Needs attention `yellow`; Expired, Failed, Error `red`; Deactivated, Disabled, Draft `gray`. `Badge` has no `status` prop.
- **Never** show `0` for missing data; show `'—'`. `FormatDateTime` renders `—` for `null` itself.
- **Never** set `meta.align` on numbers; they align right on their own. If the first row can be `null` or `'—'`, set `meta: { sortType: 'number' }`.
- Header explanation: `meta.description: { type: 'tooltip', content }`; `type: 'text'` keeps it visible.
- Import `OverflowList` from `@wallarm-org/design-system/OverflowList`; pass it a stable `items` array (`row.original.groups`). There is no `maxItems`.
- Tests: pass `data-testid` to `Table`; **never** select by `data-slot`.

## Examples

The whole table: the cell vocabulary, the row menu in the master cell, sorting and a bulk bar for selected rows.

```story
Default
```

A person with a second line, a status badge, groups as tags, and a number whose header explains it.

```story
Cells
```

The row menu: the trigger names the row, and the destructive item comes last and names the entity.

```story
RowMenu
```

First load keeps the header and fills the body with placeholder rows.

```story
Loading
```

Nothing created yet: an empty state under the header.

```story
Empty
```

## States

| State | Show | Example component |
| --- | --- | --- |
| First load | `isLoading` (12 skeleton rows; `skeletonCount`), not a `Loader` | `Table` |
| Nothing created | `EmptyState type='collection-empty'`; no button if `PageActions` has Create; keep header and toolbar | `TableEmptyState` |
| No matches | `type='collection-empty'`, "No results found", `Button variant='outline' color='neutral'` "Reset filters"; not `type='no-results'` | `TableEmptyState` |
| Rows selected | The bar appears on its own | `TableActionBar` |
| Row open in a drawer | `activeRowId={openId}`; not a row `className` | `Table` |
| Switch saving | Keep the `Switch`, `Loader` in a reserved slot beside it | `Switch`, `Loader` |
| Locked by scope | Disabled control, `Lock` with a `Tooltip` naming the scope; never hide the row | `Tooltip` |

## What your app owns

| You own | The DS owns |
| --- | --- |
| `columns`, order, widths | Cell padding, borders, header, hover and selected backgrounds |
| Status-to-`color` mapping and labels | `Badge` dot, size and colors |
| Row menu items and handlers | Menu focus and keyboard |
| Fetching, filtering, server sorting, pagination | Client sorting |
| Which bulk actions exist | Bar placement, "Select all", "Clear" |
| Delete confirmation | Nothing; compose `Dialog` |
| Scope marker | Nothing; compose `Badge variant='dotted'` with `Lock` |
| Metric cell (% over "x of y") | Nothing; compose `FormatNumber` and `Text size='xs'` |
| Grouped or orderable tables | `getSubRows`, `renderGroupRow`, `onRowReorder` |

## Related

- [Resource list page](./resource-list-page.md): the page shell.
- [Detail drawer](./detail-drawer.md): opens from a row.
- [Confirmation dialogs](./confirmation-dialogs.md): confirm deletes.
- [Feedback toasts](./feedback-toasts.md): report results.
- [Empty states](./empty-states.md), [Filtering](./filtering.md), [Spacing](../foundations/spacing.md).
