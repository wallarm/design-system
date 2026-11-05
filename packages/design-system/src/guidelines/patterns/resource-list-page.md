---
title: Resource list page
description: Use when building a page that lists one kind of entity (users, roles, SSO providers, channels) with a create action, search, status tabs and a table.
components: [Page, Breadcrumbs, Button, SearchInput, SegmentedTabs, NumericBadge, Table, EmptyState, AppShell, NavPanel]
keywords: [list page, index page, resource list, entity list, collection page, settings list, page header, breadcrumbs, toolbar, search, status tabs, segmented tabs, counts, create button, table page, CRUD]
order: 10
---

# Resource list page

A resource list page is `Page` with a header, a filter toolbar and one `Table`.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| A list of one entity with create, search and a status filter | This pattern | A `Card` grid, a hand-built `<table>` |
| One record with its fields | [Detail drawer](./detail-drawer.md) | A one-row table |
| Many filter dimensions, chips, scope | [Filtering](./filtering.md) in `PageToolbar` | Several `SegmentedTabs` side by side |
| Column, cell, row menu and bulk bar details | [Entity table](./entity-table.md) | Rules from this page |

If the page has no create action and no filter, still use `Page`, `PageHeader` and `PageContent`. Drop the parts you do not need.

## Anatomy

| # | Part | Component | Import |
| --- | --- | --- | --- |
| 1 | Shell, top header, 1st rail | `AppShell`, `AppShellHeader`, `AppShellRail` | `@wallarm-org/design-system` |
| 2 | Section nav (2nd rail) | `NavPanel`, `NavPanelItem` | `@wallarm-org/design-system/NavPanel` |
| 3 | Page frame | `Page` with `fullSize` and `fixedHeight` | `@wallarm-org/design-system` |
| 4 | Header row | `PageHeader` | `@wallarm-org/design-system` |
| 5 | Breadcrumbs | `Breadcrumbs`, `BreadcrumbsItem` as the first child of `PageHeader` | `@wallarm-org/design-system` |
| 6 | Title and one-line description | `PageHeaderGroup` (`className='flex-1'` with breadcrumbs), `PageTitle`, `PageDescription` | `@wallarm-org/design-system` |
| 7 | Create action | `PageActions` holding one `Button size='medium'` | `@wallarm-org/design-system` |
| 8 | Filter row | `PageToolbar` | `@wallarm-org/design-system` |
| 9 | Search | `SearchInput` with `className='w-[320px]'` | `@wallarm-org/design-system` |
| 10 | Status filter with counts | `SegmentedTabs`, `SegmentedTabsList`, `SegmentedTabsTrigger`, `NumericBadge` | `@wallarm-org/design-system` |
| 11 | Scrolling body | `PageContent` | `@wallarm-org/design-system` |
| 12 | The list | `Table` with `TableEmptyState` | `@wallarm-org/design-system` |

Parts 1 and 2 belong to the host shell. A page renders parts 3 to 12 only.

`NavPanel` is not exported from the package root. Import it from `@wallarm-org/design-system/NavPanel`.

## Layout and spacing

Spacing utilities count in pixels: `px-24` is 24px. See [Spacing](../foundations/spacing.md).

### Figma frame

| Element | Figma | Code |
| --- | --- | --- |
| Top header | 36 high | Host shell |
| 1st rail | 48 wide | Host shell |
| 2nd rail | 216 wide | Host shell |
| Side gutter | 24 | Built into `PageHeader`, `PageToolbar`, `PageContent` (`px-24`) |
| Breadcrumbs | y 8, 20 high, items offset −4 | `PageHeader` `py-8`; `Breadcrumbs className='basis-full -ml-4'` |
| Breadcrumbs to title | 6 | `PageHeader className='flex-wrap gap-y-6'`; `PageHeaderGroup className='flex-1'` |
| Title | 28 line height | `PageTitle` (`text-xl leading-28`) |
| Description | 20 line height, secondary color | `PageDescription` (`text-sm text-text-secondary`) |
| Header buttons | 32 high, 8 apart, centred on title and description | `Button size='medium'` in `PageActions` (`gap-8 ml-auto`) |
| Search | 320 × 36 | `SearchInput className='w-[320px]'`, default size (`h-36`) |
| Search to tabs | 12 | `PageToolbar` `gap-12` |
| Toolbar to table | 12 | `PageToolbar` `pb-6` + `PageContent` `pt-6`, automatic |

### Built-in spacing

| Component | Classes | Notes |
| --- | --- | --- |
| `Page` | `flex flex-col`; `h-full` with `fixedHeight` | No padding |
| `PageHeader` | `flex items-center px-24 py-8 gap-12` | `pb-6` when `PageContent` follows directly |
| `PageHeaderGroup` | `flex flex-col min-w-0` | No gap |
| `PageActions` | `flex items-center gap-8 shrink-0 ml-auto` | Pushes itself to the right |
| `PageToolbar` | `flex items-center gap-12 px-24 pb-8` | `pb-6` when `PageContent` follows directly |
| `PageContent` | `flex-1 min-h-0 overflow-auto px-24 pt-8 pb-24` | `pt-6` after `PageHeader` or `PageToolbar` |
| `TableEmptyState` | `py-128` | Renders only when there are no rows and `isLoading` is false |

- If the page lists rows, pass `fixedHeight` to `Page`. `PageContent` then scrolls and the header and toolbar stay in place.
- If the page shows breadcrumbs, add `className='flex-wrap gap-y-6'` to `PageHeader` and `className='flex-1'` to `PageHeaderGroup`. Breadcrumbs then take their own line and the buttons centre on the title block.
- **Never** drop `flex-1` from `PageHeaderGroup` in a wrapping header. A long description then pushes `PageActions` onto a third line.
- If the page has no breadcrumbs, do not add `flex-wrap` to `PageHeader`.
- Put `Table` straight into `PageContent`. The table aligns to the 24px gutter.
- **Never** wrap `Page`, `PageHeader`, `PageToolbar` or `PageContent` in a padded container.
- **Never** add `px-*`, `py-*` or `gap-*` to `PageToolbar` or `PageContent`.
- **Never** put the search or the status tabs inside `PageHeader` or inside `PageContent`.

## States

| State | Do | Not |
| --- | --- | --- |
| First load | `<Table data={[]} isLoading />`; skeleton rows render under a real header | A `Loader` in place of the table |
| Loading more rows | Keep `data`, set `isLoading`; skeletons append below the rows | Clearing `data` while fetching |
| Nothing exists yet | `TableEmptyState` › `EmptyState type='collection-empty'` with no button; `PageActions` keeps "Create user" | A second create button in the empty state; hiding the toolbar or the header |
| Search or tab matched nothing | `TableEmptyState` › `EmptyState type='collection-empty'`, title "No results found", `Button variant='outline' color='neutral'` "Reset filters" | A create CTA; `type='no-results'` |
| Search active | Keep the typed value in `SearchInput`; its clear button calls `onChange('')` | A separate Clear button |
| Status counts | Recompute every `NumericBadge` when the data changes | Static counts |

- If the collection is empty, keep `PageHeader` with its create button and keep `PageToolbar`.
- If you show an empty state inside a table, use `type='collection-empty'` for both empty and no-results. `type='no-results'` is the compact treatment for a card or a menu.
- Show one create action per screen. The header has it, so the empty state has no button. See [Empty states](./empty-states.md).
- **Never** offer a create action in the no-results state.

## Rules

- Show one primary button in `PageActions`. Label it "Create" plus the entity: "Create user".
- If there is a code-first alternative ("Edit as code"), make it `variant='secondary'`. Keep it in the same `PageActions`.
- Use `size='medium'` for header buttons. The `Button` default is `large` (36), and Figma uses 32.
- Write `PageDescription` as one plain sentence. Say what the entity is and how it relates to sibling pages.
- Start the breadcrumbs at the 2nd-rail section: "Settings › Users". The title repeats the last crumb.
- Give `Breadcrumbs` only `BreadcrumbsItem` children. It inserts every separator and marks the last item current.
- **Never** add `BreadcrumbsSeparator` by hand. **Never** set `isCurrent`; `Breadcrumbs` sets it.
- Pass `href` to each `BreadcrumbsItem` except the last.
- Give `SearchInput` a `placeholder` that names the searched fields: "Search name or email".
- Use `SegmentedTabs` with `value` and `onChange` as the status filter. It takes `onChange(value: string)`, not `onValueChange`.
- Put the count in a `NumericBadge` inside each `SegmentedTabsTrigger`, after the label.
- **Never** add `SegmentedTabsContent` for a filter. The tabs change `data`; the one `Table` stays.
- If you need more filters than one status, use `FilterInput` or the filter components in [Filtering](./filtering.md).
- Pass `getRowId` to `Table` so selection and row state survive refetches.

There is no breadcrumbs prop or slot on `Page` or `PageHeader`. There is no `PageBreadcrumbs` component. There is no `size` prop on `PageTitle`. There is no `className` prop on `SegmentedTabs`. There is no `DRAWER_SIZES` or `DIALOG_SIZES` export.

## Example

```tsx
import { useState } from 'react';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  createTableColumnHelper,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
  NumericBadge,
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
  PageToolbar,
  SearchInput,
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
  Table,
  type TableColumnDef,
  TableEmptyState,
} from '@wallarm-org/design-system';
import { FilterX, SearchX, Users } from '@wallarm-org/design-system/icons';

type UserStatus = 'active' | 'deactivated' | 'invited';
type StatusFilter = 'all' | UserStatus;

interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
}

const columnHelper = createTableColumnHelper<User>();

const columns: TableColumnDef<User>[] = [
  columnHelper.accessor('name', { header: 'Name', size: 240 }),
  columnHelper.accessor('email', { header: 'Email', size: 280 }),
  columnHelper.accessor('status', { header: 'Status', size: 140 }),
];

interface UsersPageProps {
  users: User[];
  isLoading: boolean;
  onCreate: () => void;
}

export const UsersPage = ({ users, isLoading, onCreate }: UsersPageProps) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const countOf = (value: StatusFilter) =>
    value === 'all' ? users.length : users.filter(user => user.status === value).length;

  const needle = query.trim().toLowerCase();
  const rows = users.filter(
    user =>
      (status === 'all' || user.status === status) &&
      (user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle)),
  );

  const isFiltered = needle !== '' || status !== 'all';

  const handleStatusChange = (value: string) => setStatus(value as StatusFilter);

  const handleReset = () => {
    setQuery('');
    setStatus('all');
  };

  return (
    <Page name='settings-users' fullSize fixedHeight>
      <PageHeader className='flex-wrap gap-y-6'>
        <Breadcrumbs className='basis-full -ml-4'>
          <BreadcrumbsItem href='/settings'>Settings</BreadcrumbsItem>
          <BreadcrumbsItem>Users</BreadcrumbsItem>
        </Breadcrumbs>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Users</PageTitle>
          <PageDescription>
            People who can sign in to your organization, with access set by roles and groups.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={onCreate}>
            Create user
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or email'
          className='w-[320px]'
        />
        <SegmentedTabs value={status} onChange={handleStatusChange}>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{countOf('all')}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>{countOf('active')}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='deactivated'>
              Deactivated <NumericBadge>{countOf('deactivated')}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='invited'>
              Invited <NumericBadge>{countOf('invited')}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='Users'
          data={rows}
          columns={columns}
          getRowId={row => row.id}
          isLoading={isLoading}
        >
          <TableEmptyState>
            {isFiltered ? (
              <EmptyState type='collection-empty'>
                <EmptyStateIllustration>
                  <SearchX />
                </EmptyStateIllustration>
                <EmptyStateMessage>
                  <EmptyStateTitle>No results found</EmptyStateTitle>
                  <EmptyStateDescription>
                    No users match your search or status. Try resetting them.
                  </EmptyStateDescription>
                </EmptyStateMessage>
                <EmptyStateActions>
                  <Button size='medium' variant='outline' color='neutral' onClick={handleReset}>
                    <FilterX />
                    Reset filters
                  </Button>
                </EmptyStateActions>
              </EmptyState>
            ) : (
              <EmptyState type='collection-empty'>
                <EmptyStateIllustration>
                  <Users />
                </EmptyStateIllustration>
                <EmptyStateMessage>
                  <EmptyStateTitle>No users yet</EmptyStateTitle>
                  <EmptyStateDescription>
                    Invite people so they can sign in to your organization.
                  </EmptyStateDescription>
                </EmptyStateMessage>
              </EmptyState>
            )}
          </TableEmptyState>
        </Table>
      </PageContent>
    </Page>
  );
};
```

## What your app owns

| Concern | Owner | Recipe with the current API |
| --- | --- | --- |
| Shell, top header, rails | Host shell | `AppShell` and `NavPanel`; the page renders `Page` only |
| Breadcrumbs placement | App | No slot exists. Put `Breadcrumbs className='basis-full -ml-4'` first in `PageHeader className='flex-wrap gap-y-6'`, and give `PageHeaderGroup` `className='flex-1'` |
| Fetching, search and status filtering | App | Pass the filtered array as `data`; set `isLoading` while fetching |
| Status counts | App | Compute them from the server or the full array; render in `NumericBadge` |
| Always-visible row menu | App | `meta.renderMenuAction` shows the `…` only on row hover, open menu or preview. Figma shows it always. See [Entity table](./entity-table.md) for the display-column recipe |
| Create flow container | App | Short form: `Dialog` from `@wallarm-org/design-system/Dialog`. Long form: `Drawer`. See [Create and edit forms](./create-edit-forms.md) |
| Detail drawer width | App | Figma uses 700. The presets are 640, 960 and 1130. Pass `width={640}` unless design confirms 700. See [Detail drawer](./detail-drawer.md) |
| URL state | App | Sync `query` and `status` to the URL yourself. The DS has no router integration |
| Error state | App | No table error state exists. Render your own message in `PageContent` |

## Related

- [Spacing](../foundations/spacing.md)
- [Entity table](./entity-table.md)
- [Filtering](./filtering.md)
- [Empty states](./empty-states.md)
- [Create and edit forms](./create-edit-forms.md)
- [Detail drawer](./detail-drawer.md)
- [Confirmation dialogs](./confirmation-dialogs.md)
