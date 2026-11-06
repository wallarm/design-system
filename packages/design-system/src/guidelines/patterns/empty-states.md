---
title: Empty states
description: Use when a table, nested table, tab, section, column or menu has no content or failed to load and you must pick the EmptyState scale, copy and action.
components: [EmptyState, EmptyStateIllustration, EmptyStateMessage, EmptyStateTitle, EmptyStateDescription, EmptyStateActions, EmptyStateLink, TableEmptyState, Table, SelectEmptyState, FilterDropdownEmpty, FilterCascadeEmpty, Tabs, TabsContent, Button]
keywords: [empty state, failed to load, load error, try again, empty, no data, no results, nothing found, zero state, blank slate, no items yet, nothing yet, first use, onboarding, empty table, empty tab, empty column, empty list, dependency, select first, reset filters, caught up, placeholder]
order: 90
---

# Empty states

An empty state is `EmptyState` placed where the content would be. The header around it stays.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| A page table with no rows | `TableEmptyState` › `EmptyState type='collection-empty'` | Hiding `PageHeader` or `PageToolbar` |
| A table in a drawer or section with no rows | `EmptyState type='collection-empty'` as a direct `Table` child | `TableEmptyState` (too tall) |
| Search or filters matched nothing | `EmptyState` with "Reset filters" | A create action |
| An earlier choice is missing ("Select a service first") | `EmptyState` with no actions | Disabling the section silently |
| A tab or popover panel with nothing in it | `EmptyState` inside `TabsContent` | Hiding the tab |
| A card, kanban column or chart with no data | `EmptyState type='no-results'` | The icon tile and a pixel title |
| A `Select` with no options | Nothing: `SelectContent` shows `SelectEmptyState` itself | A hand-built "No results" row |
| A `FilterDropdown` search with no matches | `FilterDropdownEmpty` | `EmptyState` |
| A `FilterCascade` search with no matches | Nothing: `FilterCascadeEmpty` shows itself | `EmptyState` |
| One missing value in a cell or attribute | The em dash `'—'`. See [Entity table](./entity-table.md) | `EmptyState` |
| Data is loading | `Table isLoading` (skeleton rows) | Any empty state |
| A list or table failed to load | `EmptyState` in place of the rows, with "Try again" | An `Alert` above an empty table |

`type` sets the scale, not the cause. If the empty area fills a page, table or panel, use `collection-empty` (the default). If it sits in a small container, use `no-results`.

## Rules

**Composition**

- Compose the parts: `EmptyState` › `EmptyStateIllustration` (`collection-empty` only) › `EmptyStateMessage` › `EmptyStateTitle` + `EmptyStateDescription` › `EmptyStateActions` › `EmptyStateLink` (optional).
- `collection-empty` needs a title and a description. `no-results` needs one of them: a title in a column or card, a description in a chart.
- **Never** pass `type` to a part. Parts take the scale from `EmptyState`.
- There is no `size`, `variant`, `icon`, `title` or `action` prop, and no `className` on `TableEmptyState`.
- **Never** place a bare icon. Put one icon from `@wallarm-org/design-system/icons` in `EmptyStateIllustration` and leave its size alone.
- `EmptyState` is already a live region (`role='status'`). **Never** wrap it in another.

**Layout and spacing**

- `EmptyState` owns its spacing: `collection-empty` is 256–560px wide with 24px vertical padding and 16px gaps; `no-results` is 240px wide with 8px padding. **Never** add `py-*`, `gap-*` or `w-*` to it or its parts.
- In a page table, wrap it in `TableEmptyState`: it adds 128px vertical padding and renders only when there are no rows and `isLoading` is false, so it needs no guard.
- In a drawer or section table, render `EmptyState` directly in `Table`, guarded by `data.length === 0 && !isLoading`.
- **Never** wrap `EmptyState` in a `Card` or a bordered box.
- Keep `PageHeader`, `PageToolbar`, section headers and table column headers visible when empty.

**Copy and actions**

- Write the title as a short statement: "No rules yet". **Never** an accusation: "You have no rules".
- Keep the description to one or two sentences: what the user gets, or what unlocks the area.
- Show one create action per screen. If `PageActions` or a section header has the create button, the empty state has no button.
- If no header has a create button, put `Button size='medium'` in `EmptyStateActions`.
- If search or filters matched nothing, offer "Reset filters" as `Button variant='outline' color='neutral'`. **Never** a create action.
- If a list failed to load, say what failed ("Couldn't load triggers") and offer "Try again" as `Button variant='outline' color='neutral'`. If access is denied, name the permission and add no button.
- If a dependency is missing, name the choice that unlocks the area. **Never** say "No {items} yet".
- If one area can be dependency-empty or nothing-yet, switch the copy.
- If each tab can be empty, write copy per tab. **Never** reuse one sentence across tabs.
- Pick an icon that names the entity: `Users` for users, `Shapes` for rules, `CheckCheck` for caught up, `History` for read.
- **Never** use an `Alert` or a toast to say a list is empty.

## Examples

A page table with nothing yet: `PageActions` has the create button, so the empty state has none.

```story
Default
```

Search or filters matched nothing: reset, never create.

```story
NoResults
```

A drawer or section table: `EmptyState` is a direct `Table` child, hidden while loading.

```story
SectionTable
```

A missing dependency: name the choice that unlocks the area, with no action.

```story
Dependency
```

Empty tabs: each tab gets its own copy and an icon that names the case.

```story
EmptyTabs
```

Small containers: a kanban column gets a title only, a chart card a description only.

```story
SmallContainers
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Loading | Skeleton rows, no empty state | `Table isLoading` |
| Nothing yet, create button in a header | "No {items} yet" + what creating one does; no button | `TableEmptyState` › `EmptyState` |
| Nothing yet, no create button anywhere | Title, description, `Button size='medium'` | `EmptyState` › `EmptyStateActions` |
| Filters matched nothing | "No results found" + "Reset filters" | `EmptyState` › `EmptyStateActions` |
| Earlier choice missing | "Select a service first", no action | `EmptyState` |
| Tab empty | Per-tab copy, no action: "You're all caught up" (`CheckCheck`), "Nothing read yet" (`History`) | `EmptyState` in `TabsContent` |
| Column, card or chart empty | Title only, or description only in a chart | `EmptyState type='no-results'` |
| List failed to load | "Couldn't load {items}" + "Try again"; while retrying, skeleton rows | `EmptyState` › `EmptyStateActions` |

## What your app owns

- **The cause.** The DS cannot tell nothing-yet, filtered and dependency-missing apart. Pass your own flag.
- **Copy.** `EmptyState` has no default strings.
- **Dependency gating.** Show the dependency state until the earlier field has a value. See [Create and edit forms](./create-edit-forms.md).
- **Errors.** There is no error `type`: pass the failure and the retry yourself. A failed page, not a list, is your own message in `PageContent`.
- **Notification center.** No popover block exists. Compose `Popover`, `Tabs` and `EmptyState`.
- **Kanban.** No kanban component exists. Centre `EmptyState type='no-results'` in your column.
- **Figma drift.** Figma flags the empty state component for an update. Follow the code scale until it changes.

## Related

- [Resource list page](./resource-list-page.md)
- [Entity table](./entity-table.md)
- [Detail drawer](./detail-drawer.md)
- [Create and edit forms](./create-edit-forms.md)
- [Filtering](./filtering.md)
- [Spacing](../foundations/spacing.md)
- [Typography](../foundations/typography.md)
