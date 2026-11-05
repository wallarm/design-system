---
title: Resource list page
description: Use when building a page that lists one kind of entity (users, roles, SSO providers, channels) with a create action, search, status tabs and a table.
components: [Page, PageHeader, PageHeaderGroup, PageTitle, PageDescription, PageActions, PageToolbar, PageContent, Breadcrumbs, BreadcrumbsItem, Button, SearchInput, SegmentedTabs, SegmentedTabsList, SegmentedTabsTrigger, NumericBadge, Table, TableEmptyState, EmptyState, EmptyStateIllustration, EmptyStateMessage, EmptyStateTitle, EmptyStateDescription, EmptyStateActions, AppShell, NavPanel]
keywords: [list page, index page, resource list, entity list, collection page, settings list, page header, breadcrumbs, toolbar, search, status tabs, segmented tabs, counts, create button, table page, CRUD]
order: 10
---

# Resource list page

A resource list page is `Page` with a header, a filter toolbar and one `Table`. All parts import from `@wallarm-org/design-system`, except `NavPanel` (`@wallarm-org/design-system/NavPanel`).

## When to use

| Need | Use | Not |
| --- | --- | --- |
| A list of one entity with create, search and a status filter | This pattern | A `Card` grid, a hand-built `<table>` |
| A list with no create action and no filter | `Page`, `PageHeader`, `PageContent`; drop the rest | A bare `Table` with a custom heading |
| One record with its fields | [Detail drawer](./detail-drawer.md) | A one-row table |
| Many filter dimensions, chips, scope | [Filtering](./filtering.md) in `PageToolbar` | Several `SegmentedTabs` side by side |
| Column, cell, row menu and bulk bar rules | [Entity table](./entity-table.md) | Rules from this page |
| Shell, top header, rails | Host shell (`AppShell`, `NavPanel`) | Rendering them inside the page |

## Rules

Spacing counts in pixels: `px-24` is 24px. See [Spacing](../foundations/spacing.md).

**Frame and spacing**

- If the page lists rows, use `<Page fullSize fixedHeight>`. The body scrolls; header and toolbar stay put.
- `PageHeader`, `PageToolbar` and `PageContent` own the 24px side gutter. **Never** wrap `Page` or them in a padded container, and **never** add `px-*`, `py-*` or `gap-*` to `PageToolbar` or `PageContent`.
- Toolbar to table is 12px, and search to tabs is 12px. Both are automatic; add nothing.
- Put `Table` straight into `PageContent`. It aligns to the gutter.
- **Never** put the search or the status tabs inside `PageHeader` or `PageContent`. They go in `PageToolbar`.

**Header**

- If the page shows breadcrumbs, render `<Breadcrumbs className='basis-full -ml-4'>` as the first child of `<PageHeader className='flex-wrap gap-y-6'>`, and give `PageHeaderGroup` `className='flex-1'`.
- **Never** drop `flex-1` from `PageHeaderGroup` in a wrapping header: a long description pushes the buttons onto a third line.
- If the page has no breadcrumbs, do not add `flex-wrap` to `PageHeader`.
- Start breadcrumbs at the 2nd-rail section ("Settings › Users"). The title repeats the last crumb.
- Give `Breadcrumbs` only `BreadcrumbsItem` children, with `href` on every item except the last. **Never** add `BreadcrumbsSeparator` or set `isCurrent`; `Breadcrumbs` does both.
- Write `PageDescription` as one plain sentence: what the entity is and how it relates to sibling pages.
- Show one primary button in `PageActions`, labelled "Create" plus the entity: "Create user".
- Use `Button size='medium'` (32px) in `PageActions`. The default `large` is 36px.
- If there is a code-first alternative ("Edit as code"), make it `variant='secondary'` in the same `PageActions`.

**Toolbar**

- Give `SearchInput` `className='w-[320px]'` and a placeholder naming the searched fields: "Search name or email". Keep the default size.
- `SearchInput` has a built-in clear button that calls `onChange('')`. **Never** add a separate Clear button.
- Use `SegmentedTabs` with `value` and `onChange(value: string)` as the status filter. It has no `onValueChange`.
- Put the count in a `NumericBadge` inside each `SegmentedTabsTrigger`, after the label. Recompute counts when data changes.
- **Never** add `SegmentedTabsContent` for a filter. The tabs change `data`; the one `Table` stays.
- If you need filters beyond the one status filter, use `FilterInput` or [Filtering](./filtering.md).

**Table**

- Pass `getRowId` so selection and row state survive refetches.
- **Never** use `meta.renderMenuAction` for entity actions you expect to be always visible: its `…` shows only on row hover, an open menu or preview. Add a trailing actions column; see [Entity table](./entity-table.md).

**What does not exist**

There is no breadcrumbs prop or slot on `Page` or `PageHeader`, no `PageBreadcrumbs`, no `size` prop on `PageTitle`, no `className` on `SegmentedTabs`, and no `DRAWER_SIZES` or `DIALOG_SIZES` export.

## Examples

The page frame: a fixed-height `Page` with the table directly in `PageContent`.

```story
Default
```

A header with breadcrumbs, a title block and one create action.

```story
Header
```

A toolbar with search and status tabs that carry counts.

```story
Toolbar
```

No results: `type='collection-empty'` with a button that resets filters.

```story
NoResults
```

Nothing exists yet: the same `type='collection-empty'`, with no button.

```story
Empty
```

## States

| State | Show | Example component |
| --- | --- | --- |
| First load | Skeleton rows under a real header. **Never** a `Loader` in place of the table | `<Table data={[]} isLoading />` |
| Loading more | Keep `data`, set `isLoading`; skeletons append below. **Never** clear `data` while fetching | `Table isLoading` |
| Nothing exists yet | Header with its create button, toolbar, empty state with no button (one create action per screen) | `TableEmptyState` › `EmptyState type='collection-empty'` |
| Search or tab matched nothing | "No results found" and a "Reset filters" button. **Never** a create CTA, **never** `type='no-results'` (that is for cards and menus) | `TableEmptyState` › `EmptyState type='collection-empty'` |
| Search active | The typed value stays in the field | `SearchInput` |
| Request failed | Your own message; the table has no error state | App-rendered, in `PageContent` |

## What your app owns

| Concern | Recipe |
| --- | --- |
| Shell and rails | `AppShell` and `NavPanel` in the host; the page renders `Page` only |
| Fetching, search, status filter | Pass the filtered array as `data`; set `isLoading` while fetching |
| Status counts | Compute from the server or the full array |
| Create flow | Short form: `Dialog` from `@wallarm-org/design-system/Dialog`. Long form: `Drawer`. See [Create and edit forms](./create-edit-forms.md) |
| Detail drawer width | Presets are 640, 960 and 1130. Figma uses 700; pass `width={640}` unless design confirms 700. See [Detail drawer](./detail-drawer.md) |
| URL state | Sync `query` and `status` to the URL yourself; there is no router integration |
| Error state | Render your own message in `PageContent` |

## Related

- [Spacing](../foundations/spacing.md)
- [Entity table](./entity-table.md)
- [Filtering](./filtering.md)
- [Empty states](./empty-states.md)
- [Create and edit forms](./create-edit-forms.md)
- [Detail drawer](./detail-drawer.md)
- [Confirmation dialogs](./confirmation-dialogs.md)
