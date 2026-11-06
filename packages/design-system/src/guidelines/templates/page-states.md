---
title: Page states
description: Use when a list page must handle every state it goes through, from loading and first use to no results, load errors, read-only access and partial failure.
components: [Page, PageHeader, PageHeaderGroup, PageTitle, PageDescription, PageActions, PageToolbar, PageContent, Button, SearchInput, SegmentedTabs, SegmentedTabsList, SegmentedTabsTrigger, NumericBadge, Table, TableEmptyState, EmptyState, EmptyStateIllustration, EmptyStateMessage, EmptyStateTitle, EmptyStateDescription, EmptyStateActions, EmptyStateLink, Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription, AlertControls, Tooltip, TooltipTrigger, TooltipContent, Badge, Avatar, Code, Ip, FormatDateTime, DropdownMenu, VStack]
keywords: [page states, loading, skeleton, empty, first use, no results, error, failed to load, try again, read only, no permission, partial failure, degraded, api tokens, list page]
order: 80
---

# Page states

One API tokens list page in every state it goes through. The header, toolbar and columns never change between stories, so the only difference is the state itself.

## What it shows

- The [Resource list page](../patterns/resource-list-page.md) frame, with one story per list state.
- An [Entity table](../patterns/entity-table.md) of API tokens with the row menu in the master cell.
- Loading, first use, no results and a failed list from [Empty states](../patterns/empty-states.md); the failed list is the same composition as the Patterns/Error states `Default` story.
- Two states no pattern covers: read-only access (a disabled create action with a tooltip, no row menu, an info `Alert`) and partial failure (a warning `Alert` over the rows that did load).
- A "Copy token ID" toast from [Feedback toasts](../patterns/feedback-toasts.md).

## Examples

Data: search, status tabs and the row menu all work.

```story
Default
```

First load: skeleton rows, tabs without counts.

```story
Loading
```

Nothing yet: the header keeps the create action, so the empty state only links to the docs.

```story
Empty
```

Search matched nothing: "Reset filters" clears the search.

```story
NoResults
```

The list failed to load: `EmptyState` with "Try again" in place of the rows.

```story
LoadError
```

Read-only access: the list stays, every write action goes.

```story
NoPermission
```

Usage data failed for some rows: a warning, an em dash in the affected cells.

```story
PartialFailure
```

## Related

- [Resource list page](../patterns/resource-list-page.md)
- [Empty states](../patterns/empty-states.md)
- [Entity table](../patterns/entity-table.md)
- [Feedback toasts](../patterns/feedback-toasts.md)
