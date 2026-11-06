---
title: Complex drawer
description: Use when a row click opens a wide drawer about one event — an attack, an incident, a session — with a summary header, tabs, an attribute card, chart cards and a list-and-detail split.
components: [Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerResizeHandle, Heading, Text, Badge, Tabs, TabsList, TabsTrigger, Tooltip, TooltipTrigger, TooltipContent, Button, Attribute, AttributeLabel, AttributeValue, FormatDateTime, Ip, IpCountry, IpAddress, Chart, ChartHeader, ChartTitle, LineChart, LineChartBody, LineChartGrid, LineChartXAxis, LineChartYAxis, LineChartLine, LineChartTooltip, LineChartEmpty, BarList, BarListItem, BarListBar, BarListLabel, BarListValue, BarListPercent, BarListSkeleton, PieChart, PieChartDonut, PieChartCenter, PieChartCenterValue, PieChartCenterLabel, PieChartLegend, PieChartLegendItem, PieChartLegendValue, PieChartLegendPercent, LegendDot, PieChartSkeleton, FilterInput, ScrollArea, ScrollAreaViewport, ScrollAreaContent, ScrollAreaScrollbar, HttpMethod, ResponseCode, InlineCodeSnippet, CodeSnippetRoot, CodeSnippetContent, CodeSnippetLineNumbers, CodeSnippetCode, Separator, DropdownMenu, Table, HStack, VStack]
keywords: [complex drawer, event drawer, attack drawer, incident drawer, session drawer, analytics drawer, overview tab, requests tab, list and detail, split view, two panes, columns in drawer, timeline, top 5, status codes, charts in drawer, summary header, blocked count, copy link, wide drawer, 1064, request card, full request]
order: 55
---

# Complex drawer

A complex drawer is a wide [Detail drawer](./detail-drawer.md) for something that happened many times: an attack, an incident, an API session. The header summarises it, Overview shows attributes and charts, and a records tab splits into a list and a detail.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| One configured entity (a provider, a rule) | [Detail drawer](./detail-drawer.md), 640px | This pattern |
| One event with counts over time and many records | This pattern, 1064px | A new page, a `Dialog` |
| How the event ended | Status `Badge variant='dotted'` on the summary line | A status row only in the body |
| Counts ("0/55 blocked", "2 IPs across 1 country") | Secondary `Text` on the summary line, split by `·` | `Metric` cards |
| Copy or share a link | Icon `Button` in a `Tooltip`, before the close X | An "Actions" menu with one item |
| Volume over time | `LineChart` in a full-width `Chart` | A table of hours |
| Top N of something | `BarList` in a `Chart` | A nested `Table` |
| Share by class (status codes) | `PieChart` donut in a `Chart` | `BarList` |
| The event's own records (requests, hits) | A tab with a list on the left and the selected record on the right | A `Table` under the charts, a nested drawer |

## Rules

This page is about layout. Values inside it (dates, IPs, codes, badges) follow [Entity table](./entity-table.md) and [Detail drawer](./detail-drawer.md).

**Drawer**

- Everything in [Detail drawer](./detail-drawer.md) still applies: one controlled non-modal `Drawer`, opened from `onMasterCellClick`, `activeRowId`, no footer.
- Pass `width={1064}`; put `DrawerResizeHandle` first and persist `onResizeEnd`.
- Reset the tab to Overview and clear the selected record when another row opens the drawer.

**Header**

- `DrawerHeader` › `HStack align='start' justify='between' gap={16} fullWidth className='min-w-0'`: the title block, then icon buttons. `min-w-0` lets a long title truncate instead of pushing out the close X.
- Title block: `VStack gap={4} className='min-w-0'` › `Heading as='h2' size='xl' weight='medium' truncate` › summary `HStack gap={4} align='center'`.
- Summary: `Badge variant='dotted' type='secondary' size='medium'`, then `Text size='xs' color='secondary'` parts split by a `·` `Text`. Wrap every string in `Text`: `HStack` drops bare text.
- Tabs follow `DrawerHeader` as their own strip: `Tabs` › `TabsList`, outside `DrawerBody`. The records tab shows its count as `Badge type='secondary' color='slate' size='medium' className='ml-4'`.
- Render the active tab yourself (`tab === 'overview' && …`); there is no `TabsContent` here.

**Overview tab**

- `DrawerBody` › `VStack gap={12} className='py-16'`.
- Attributes go in one bordered card: `grid grid-cols-2 gap-x-8 gap-y-16 rounded-8 border border-border-primary-light p-16`, default (vertical) `Attribute`. A long list (IPs) spans both columns: `className='col-span-2'`.
- Then one full-width `Chart` with the `LineChart` timeline, then cards two per row: `grid grid-cols-2 gap-12`. The grid row gives neighbours one height; `Chart` has no minimum of its own.

**Records tab: list and detail**

- This tab replaces `DrawerBody`: `<div className='flex min-h-0 flex-1 flex-col'>`. Each pane brings its own `ScrollArea`, so the list and the detail scroll apart. **Never** nest the panes in `DrawerBody` or reach into its `data-slot`s.
- Filter bar across both panes: `HStack gap={8} className='shrink-0 border-b border-border-primary-light px-16 py-8'` › `FilterInput` in `min-w-0 flex-1`, then the sort `Button variant='ghost' size='small'`.
- Panes: `flex min-h-0 flex-1` › list `w-320 shrink-0 border-r border-border-primary-light` › detail `min-w-0 flex-1`.
- List item: a `button` with `value={id}` and `aria-pressed`, `w-full rounded-8 p-8 text-left`; selected `bg-states-primary-default-alt`, else `hover:bg-states-primary-hover`. Inside, `VStack gap={2}`: time and `ResponseCode` (`ml-auto`), attack type `Badge`s, `HttpMethod` + path, host.
- Detail attributes: `grid grid-cols-2 gap-x-8 gap-y-6`, horizontal `Attribute`; a long value spans both columns.
- Detail: sections, each a header row (`HStack justify='between' className='px-24 py-8'`, `Text size='md'`, optional "Actions" menu) and a body with `px-24`. Split sections with `<div className='px-24 py-4'><Separator /></div>`.
- Nothing selected: centred `Text size='sm' color='secondary'` "Select a request to view details".

**Does not exist:** `DrawerStatus`, `DrawerSubtitle`, a split-pane or resizable-panel component, a `size` prop on `Chart`, `BarList` `limit`.

## Examples

The list opens one shared drawer; switch to Requests for the split.

```story
Default
```

The header: title, summary line, copy link, tabs.

```story
Header
```

Overview: the attribute card, the timeline and chart cards.

```story
OverviewTab
```

Requests: filter bar, list and detail.

```story
RequestsTab
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Event loading | `loading` on each `Attribute`; `LineChartEmpty` with no text; `BarListSkeleton`, `PieChartSkeleton`. Card titles stay | `Chart` |
| No data for a card | `ChartEmpty` inside the card | `Chart` |
| Nothing selected | Secondary text centred in the detail pane | `Text` |
| A list failed to load | `EmptyState` in place of the list, with "Try again" | `EmptyState` |

Loading.

```story
Loading
```

## What your app owns

| You own | The DS owns |
| --- | --- |
| Fetching the event, series, top N and records | Card frame, chart drawing, tooltips |
| Tab state, the selected record, resets | Tabs strip, scroll areas |
| List virtualisation and paging | Item styles via tokens |
| The link being copied, the toast | Tooltip, button states |

## Related

- [Detail drawer](./detail-drawer.md), [Entity table](./entity-table.md)
- [Filtering](./filtering.md), [Empty states](./empty-states.md)
