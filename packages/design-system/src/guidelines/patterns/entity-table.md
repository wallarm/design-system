---
title: Entity table
description: Use when you render a list of users, roles, providers, channels or policies as a Table, with status badges, tags, a row menu and bulk actions.
components: [Table, TableActionBar, TableActionBarSelection, TableEmptyState, Badge, Tag, OverflowList, Avatar, AvatarContent, AvatarName, AvatarDescription, Code, FormatDateTime, DropdownMenu, DropdownMenuItem, Button, Tooltip, Switch, EmptyState]
keywords: [table, data table, grid, list, rows, columns, entity list, users table, cell, status badge, tags, +N, overflow, row menu, row actions, kebab, ellipsis, three dots, bulk actions, bulk bar, selection, checkbox, sort, empty value, em dash, column description, reorder]
order: 20
---

# Entity table

An entity table is one `Table` with a fixed cell vocabulary, a row menu and a bulk action bar.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| A list of entities on a page | `Table` inside `PageContent` | A `div` grid, `Card` per row |
| A list nested in a drawer or dialog | The same `Table` inside `DrawerBody` or `DialogBody` (import `Dialog*` from `@wallarm-org/design-system/Dialog`) | A custom list with borders |
| Actions on many rows at once | `onRowSelectionChange` plus `TableActionBar` | Your own floating bar |
| Actions on one row | A trailing `actions` display column with a `DropdownMenu` | Buttons repeated in every row |
| Key-value details of one entity | `Attribute` in a drawer | A two-column `Table` |

If the page also needs a header, search and status tabs, follow [Resource list page](./resource-list-page.md) for the page shell.

## Anatomy

| Part | What renders it | Notes |
| --- | --- | --- |
| Frame | `Table` | Draws `rounded-12 border border-border-primary-light`. Do not wrap it in a bordered `div`. |
| Header row | `Table` | Built in. Grows when a column has `meta.description` with `type: 'text'`. |
| Selection column | `Table`, when you pass `onRowSelectionChange` | Auto-injected, 33px, pinned left. You do not declare it. |
| Master column | The first entry in `columns` | Always pinned left, never hideable. Holds the hover menu and the master-cell click. |
| Data columns | Your `columns` entries | One entry per attribute. |
| Actions column | A display column `{ id: 'actions', … }` placed last | Holds the always-visible `…` row menu. |
| Bulk bar | `TableActionBar` as a child of `Table` | Pinned above the bottom edge of the viewport, within the table's width, while rows are selected. |
| Empty state | `TableEmptyState` as a child of `Table` | Renders only when there are no rows and `isLoading` is false. |

Cell vocabulary. Pick from this table; do not invent new cell styles.

| Data | Cell | Not |
| --- | --- | --- |
| Person | `Avatar size='md'` with `AvatarFallback name`, `AvatarContent`, `AvatarName` | An `img` plus a `span` |
| Person or provider with a second line | Add `AvatarDescription` inside `AvatarContent` | Two `Text` lines with your own gap |
| Status | `Badge variant='dotted' type='secondary' color=…` | Colored text, a raw dot |
| Built-in or locked row | `Badge` with a `Lock` icon inside a `Tooltip` | A lock icon alone with no explanation |
| Many short labels (groups, roles) | `OverflowList` of `Tag` | Comma-joined text, a custom "+N" |
| ID, key, hash | `Code size='m'` | Monospace `span` |
| Timestamp, recent | `FormatDateTime value={…} format='relative'` | `toLocaleString()` |
| Timestamp, exact | `FormatDateTime format='datetime'` (stacked date over time by default) | Two cells for date and time |
| Count, metric | The raw number; it aligns right on its own. If values can be missing, set `meta: { sortType: 'number' }` | `meta.align` on number columns |
| On/off setting | `Switch` with `SwitchControl` | `Checkbox`, a `Badge` |
| Missing value | The string `'—'` (em dash) | `0`, `N/A`, an empty cell |

Status colors:

| Status | `color` |
| --- | --- |
| Active, Enabled, Connected | `green` |
| Invited, Pending, Needs attention | `yellow` |
| Expired, Failed, Error | `red` |
| Deactivated, Disabled, Draft | `gray` |

## Layout and spacing

These values are built into `Table`. **Never** override them with `className`, `meta.cellClassName` or wrappers.

| Element | Built-in value | Figma |
| --- | --- | --- |
| Body cell | `px-16 py-8`, `text-sm`, `bg-bg-surface-2` | 36px single-line row |
| Header cell | `pl-16 pr-4 py-4`, `text-xs font-medium text-text-secondary`, `bg-bg-light-primary` | 32px header |
| Header with `description.type: 'text'` | Second line under the title | 48px header |
| Cell borders | `border-b border-r border-border-primary-light` | 1px grid |
| Selection column | 33px | 32px plus border |
| Drag handle column | 24px, auto-injected with `onRowReorder` | |
| Minimum column width | 96px unless you set `minSize` | |
| Bulk bar | `pl-12 pr-8 py-8 rounded-16`, 40px between summary and actions, 8px between actions | |
| Empty state wrapper | `py-128` | |

Set column widths with `size` in pixels:

| Column | `size` |
| --- | --- |
| Name with avatar | `320` |
| Email | `240` |
| Status | `140` |
| Timestamp | `200` |
| Actions | `60` with `minSize: 60` |

- If you omit `minSize` on the actions column, it renders 96px wide. Set `minSize: 60`.
- If columns should keep their `size` and leave empty space on the right, pass `stretch={false}`. The default `stretch` fills the container.
- If a two-line cell is needed, use `AvatarDescription` or a `Text size='xs' color='secondary'` second line. **Never** set a row height.
- Put the `Table` straight into `PageContent`, `DrawerBody` or `DialogBody`. **Never** add padding around it. See [Spacing](../foundations/spacing.md).

## States

| State | Do | Not |
| --- | --- | --- |
| First load | `isLoading` (12 skeleton rows by default; change with `skeletonCount`) | A `Loader` over the table |
| Nothing created yet | `TableEmptyState` with `EmptyState type='collection-empty'`. No button when `PageActions` already holds Create | An empty frame; a second create button |
| Filters match nothing | `TableEmptyState` with `EmptyState type='collection-empty'`, title "No results found" and a `Button variant='outline' color='neutral'` "Reset filters" | A create button; `type='no-results'` (the compact card or menu treatment) |
| Rows selected | `TableActionBar` appears on its own | Showing the bar yourself |
| Row open in a drawer | `activeRowId={openId}` highlights the row | `className` on a row |
| Switch saving | Keep the `Switch`, show a `Loader` in a reserved slot next to it | Replacing the `Switch` with a spinner |
| Row locked by a higher scope | Disable the control and show `Lock` with a `Tooltip` that names the scope | Hiding the row |

- If the collection is empty, keep the page header and toolbar. See [Empty states](./empty-states.md).
- If a value is `null`, `FormatDateTime` renders `—` on its own. Do not wrap it in a check.

## Rules

- If the table has row actions, add a trailing display column `{ id: 'actions', header: '', size: 60, minSize: 60, enableHiding: false, cell }`. A display column has an `id` and no `accessorKey`.
- **Never** rely on `meta.renderMenuAction` for an entity table. Its menu is hidden until the row is hovered, and Figma requires an always-visible menu.
- If you still use `meta.renderMenuAction`, put it on the first column. On other columns it renders nothing unless the column has `meta.resizeType: 'cut'`.
- Render the row menu trigger as `<Button variant='ghost' color='neutral' size='small' aria-label=…>` with the `Ellipsis` icon.
- Order row menu items: view or open, edit, reorder, state changes, then `DropdownMenuSeparator`, then destructive items.
- Use `DropdownMenuItem variant='destructive'` for destructive items. Name the entity: "Delete user", not "Delete".
- If a row is inherited or read-only, show only the view item and an "Open at {scope}" item.
- If a destructive item is selected, open a confirmation dialog. See [Confirmation dialogs](./confirmation-dialogs.md).
- Pass `getRowId={row => row.id}`. Selection, `activeRowId` and reordering key on this id.
- If you need selection, pass both `rowSelection` and `onRowSelectionChange`. Without `onRowSelectionChange` there is no checkbox column.
- If you need sorting, pass `sorting` and `onSortingChange`. If the server sorts, also pass `manualSorting`.
- Put bulk actions inside `TableActionBar` as `Button variant='ghost' color='neutral-alt'`. Put a destructive action last with `color='destructive'`.
- If a bulk action has several options, use a `DropdownMenu` with a `Button` trigger inside `TableActionBar`.
- If you need different selection text, pass `TableActionBarSelection` with `BulkBarSummaryCount`, `BulkBarSummarySelectAll` and `BulkBarSummaryClear` as its direct children.
- If a header needs an explanation, use `meta.description: { type: 'tooltip', content }`. The title gets a dashed underline.
- If the explanation must stay visible, use `meta.description: { type: 'text', content }`.
- Show a missing metric as `'—'`. **Never** show `0` for data that does not exist.
- If a column holds numbers, do not set `meta.align`. Number columns detected from the first row align right on their own.
- If the first row's value can be `null` or `'—'`, detection fails and the column aligns left. Set `meta: { sortType: 'number' }` on that column.
- If rows can be dragged, pass `onRowReorder={({ activeRowId, overRowId }) => …}`. Pass `getRowCanDrag` to pin rows in place.
- Keep the `items` array of `OverflowList` referentially stable. Pass `row.original.groups`, not a new array per render.
- **Never** use `data-slot` in tests. Pass `data-testid` to `Table`; parts derive from it.

There is no `maxItems` prop on `OverflowList`; it hides what does not fit the cell width. There is no `rowHeight` prop on `Table`. There is no `actions` column type and no `alwaysShowMenu` option. There is no `TableRow` component to render rows by hand. There is no `status` prop on `Badge`; map status to `color` yourself.

## Example

```tsx
import { useState } from 'react';
import {
  Avatar,
  AvatarContent,
  AvatarDescription,
  AvatarFallback,
  AvatarName,
  Badge,
  type BadgeProps,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  EmptyStateDescription,
  EmptyStateMessage,
  EmptyStateTitle,
  FormatDateTime,
  Table,
  TableActionBar,
  type TableColumnDef,
  TableEmptyState,
  type TableRowSelectionState,
  type TableSortingState,
  Tag,
} from '@wallarm-org/design-system';
import { Ellipsis, Pencil, Trash2 } from '@wallarm-org/design-system/icons';
import { OverflowList } from '@wallarm-org/design-system/OverflowList';

type UserStatus = 'active' | 'invited' | 'expired' | 'deactivated';

interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  groups: string[];
  lastActiveAt: string | null;
}

const STATUS: Record<UserStatus, { label: string; color: BadgeProps['color'] }> = {
  active: { label: 'Active', color: 'green' },
  invited: { label: 'Invited', color: 'yellow' },
  expired: { label: 'Invite expired', color: 'red' },
  deactivated: { label: 'Deactivated', color: 'gray' },
};

interface UserRowMenuProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserRowMenu = ({ user, onEdit, onDelete }: UserRowMenuProps) => {
  const handleEdit = () => onEdit(user);
  const handleDelete = () => onDelete(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' color='neutral' size='small' aria-label={`Actions for ${user.name}`}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={handleEdit}>
          <DropdownMenuItemIcon>
            <Pencil />
          </DropdownMenuItemIcon>
          <DropdownMenuItemText>Edit</DropdownMenuItemText>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onSelect={handleDelete}>
          <DropdownMenuItemIcon>
            <Trash2 />
          </DropdownMenuItemIcon>
          <DropdownMenuItemText>Delete user</DropdownMenuItemText>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const renderGroup = (group: string) => <Tag key={group}>{group}</Tag>;

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onBulkDelete: (ids: string[]) => void;
}

export const UsersTable = ({
  users,
  isLoading,
  onEdit,
  onDelete,
  onBulkDelete,
}: UsersTableProps) => {
  const [sorting, setSorting] = useState<TableSortingState>([{ id: 'name', desc: false }]);
  const [selection, setSelection] = useState<TableRowSelectionState>({});

  const columns: TableColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 320,
      cell: ({ row }) => (
        <Avatar size='md'>
          <AvatarFallback name={row.original.name} />
          <AvatarContent>
            <AvatarName>{row.original.name}</AvatarName>
            <AvatarDescription>{row.original.email}</AvatarDescription>
          </AvatarContent>
        </Avatar>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 140,
      cell: ({ row }) => (
        <Badge variant='dotted' type='secondary' color={STATUS[row.original.status].color}>
          {STATUS[row.original.status].label}
        </Badge>
      ),
    },
    {
      accessorKey: 'groups',
      header: 'Groups',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.groups.length > 0 ? (
          <OverflowList className='gap-4' items={row.original.groups} itemRenderer={renderGroup} />
        ) : (
          '—'
        ),
    },
    {
      accessorKey: 'lastActiveAt',
      header: 'Last active',
      size: 200,
      meta: { description: { type: 'tooltip', content: 'Last sign-in or API call' } },
      cell: ({ row }) => <FormatDateTime value={row.original.lastActiveAt} format='relative' />,
    },
    {
      id: 'actions',
      header: '',
      size: 60,
      minSize: 60,
      enableHiding: false,
      cell: ({ row }) => <UserRowMenu user={row.original} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];

  const handleBulkDelete = () => onBulkDelete(Object.keys(selection));

  return (
    <Table
      aria-label='Users'
      data={users}
      columns={columns}
      getRowId={user => user.id}
      isLoading={isLoading}
      sorting={sorting}
      onSortingChange={setSorting}
      rowSelection={selection}
      onRowSelectionChange={setSelection}
    >
      <TableActionBar>
        <Button variant='ghost' color='neutral-alt'>
          Assign role
        </Button>
        <Button color='destructive' onClick={handleBulkDelete}>
          <Trash2 /> Delete
        </Button>
      </TableActionBar>
      <TableEmptyState>
        <EmptyState type='collection-empty'>
          <EmptyStateMessage>
            <EmptyStateTitle>No users yet</EmptyStateTitle>
            <EmptyStateDescription>Invite people to sign in to your organization.</EmptyStateDescription>
          </EmptyStateMessage>
        </EmptyState>
      </TableEmptyState>
    </Table>
  );
};
```

To override the selection summary, import from the subpath. `TableActionBarSelection` is not in the root barrel.

```tsx
import {
  BulkBarSummaryClear,
  BulkBarSummaryCount,
  TableActionBarSelection,
} from '@wallarm-org/design-system/Table';
```

## What your app owns

| You own | The DS owns |
| --- | --- |
| The `columns` array, column order and widths | Cell padding, borders, header styling, row hover and selected backgrounds |
| Mapping each status to a `Badge` `color` and label | The `Badge` dot, size and colors |
| The row menu items, their order and their handlers | `DropdownMenu` positioning, focus and keyboard |
| Fetching, filtering, server sorting and pagination | Client sorting when `manualSorting` is not set |
| Which bulk actions exist and what they do | Bar placement, open state, "Select all" and "Clear" wiring |
| Confirmation before destructive actions | Nothing; compose it from `Dialog` parts |
| The "Open at {scope}" link for inherited rows | Nothing; there is no scope marker component |

Known gaps. Use the recipe; do not invent props.

- **Always-visible row menu.** `meta.renderMenuAction` shows the menu only on row hover, while a menu is open, or while the row is `activeRowId`. Figma wants it always visible. Use the trailing `actions` display column. There is no Table option for this yet.
- **Scope marker.** The level dot with owner and lock from Deployment designs has no component. Compose `Badge variant='dotted'` with a `Lock` icon locally.
- **Metric cell.** A large percentage over a muted "x of y" has no component. Compose `FormatNumber` and `Text size='xs' color='secondary'` in the cell.
- **Grouped, orderable tables, kanban boards and preference matrices** stay in your product. Build them from `Table` with `getSubRows`, `renderGroupRow` and `onRowReorder`.

## Related

- [Resource list page](./resource-list-page.md): the page shell around the table.
- [Detail drawer](./detail-drawer.md): what opens from a row; pair with `activeRowId`.
- [Confirmation dialogs](./confirmation-dialogs.md): confirm destructive row and bulk actions.
- [Feedback toasts](./feedback-toasts.md): report the result of a row or bulk action.
- [Empty states](./empty-states.md): empty collection versus no results.
- [Filtering](./filtering.md): filters that feed `data`.
- [Spacing](../foundations/spacing.md) and [Color](../foundations/color.md).
