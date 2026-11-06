---
title: Attack events
description: Use when building a security event log - a filtered, sorted, paged table of detected attacks with bulk triage and a wide event drawer down to the raw request.
components: [Page, PageHeader, PageHeaderGroup, PageTitle, PageDescription, PageActions, PageToolbar, PageContent, FilterInput, Table, TableActionBar, TableEmptyState, Pagination, PaginationPageSize, PaginationPrevious, PaginationList, PaginationNext, Badge, HttpMethod, ResponseCode, Ip, IpCountry, IpAddress, IpProvider, FormatDateTime, Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerResizeHandle, Heading, Text, Tabs, TabsList, TabsTrigger, Tooltip, Attribute, AttributeLabel, AttributeValue, Chart, LineChart, BarList, PieChart, ScrollArea, InlineCodeSnippet, CodeSnippetRoot, CodeSnippetContent, CodeSnippetLineNumbers, CodeSnippetCode, Separator, DropdownMenu, EmptyState, Tag, Button]
keywords: [attacks, events, event drawer, security events, event log, attack log, detections, threats, traffic log, requests, raw request, payload, block IP, triage, query builder, filter, pagination, bulk actions]
order: 20
---

# Attack events

A security event log: every attack the filtering nodes detected, narrowed with a query builder, triaged in bulk, and opened one at a time down to the raw HTTP request.

## What it shows

- The [Resource list page](../patterns/resource-list-page.md) frame with one outline "Export CSV" action and no create button: attacks are never created by hand.
- [Filtering](../patterns/filtering.md) with `FilterInput` alone in `PageToolbar`: attack type, severity and status with badge values, source IP, host, method, response code and date. Its `ExprNode` drives the rows.
- An [Entity table](../patterns/entity-table.md): two-line cells, severity and status `Badge`s, `HttpMethod`, `Ip` with flag and provider, `ResponseCode`, a header tooltip, the row menu in the master cell, `TableActionBar` triage (false positive, block source IPs, export) and server-style sorting (`manualSorting`) before paging.
- `Pagination` with a page-size picker under the table, in a `VStack gap={12}`.
- A [Complex drawer](../patterns/complex-drawer.md) for the attack, since one attack groups many hits: a summary line (status, blocked count, IPs across countries), Overview with the attribute card, a hits timeline, top IPs and status codes, and Requests with the list and the selected request. The full request marks the attack point with a red line and the payload in bold (`CodeSnippetRoot` `lines`).
- No-match, load-failed and first-load states from [Empty states](../patterns/empty-states.md).

## Examples

The whole log: a severity filter applied, sorted by time, ten rows a page; tick rows for the bulk bar. Open a row (or "Open event" in its row menu) to see the complex drawer; on Requests, pick a request to see its payload highlighted in the full request.

```story
Default
```

The query matched nothing: "No results found" and "Reset filters" clears it.

```story
NoResults
```

The list failed to load: "Couldn't load attacks" and "Try again" in place of the rows.

```story
LoadError
```

First load: the real header and filter over skeleton rows.

```story
Loading
```

## Related

- [Resource list page](../patterns/resource-list-page.md)
- [Entity table](../patterns/entity-table.md)
- [Filtering](../patterns/filtering.md)
- [Complex drawer](../patterns/complex-drawer.md)
- [Empty states](../patterns/empty-states.md)
- [Feedback toasts](../patterns/feedback-toasts.md)
