---
title: Complex drawer
description: Use when a row click opens a wide drawer about one event — an attack, an incident, a session — with a status summary, pinned tabs, attributes and analytics charts.
components: [Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerResizeHandle, Tabs, TabsList, TabsTrigger, TabsContent, NumericBadge, Badge, Tooltip, TooltipTrigger, TooltipContent, Button, Attribute, AttributeLabel, AttributeValue, Tag, FormatDateTime, Ip, IpAddress, Chart, ChartHeader, ChartTitle, LineChart, LineChartBody, LineChartGrid, LineChartXAxis, LineChartYAxis, LineChartLine, LineChartTooltip, LineChartEmpty, BarList, BarListItem, BarListBar, BarListLabel, BarListValue, BarListPercent, BarListSkeleton, PieChart, PieChartDonut, PieChartCenter, PieChartCenterValue, PieChartCenterLabel, PieChartLegend, PieChartLegendItem, PieChartLegendValue, PieChartLegendPercent, LegendDot, PieChartSkeleton, ChartEmpty, InlineCodeSnippet, EmptyState, EmptyStateMessage, EmptyStateTitle, DropdownMenu, Table, VStack, HStack]
keywords: [complex drawer, columns in drawer, two columns, split view, list and detail, event drawer, attack drawer, incident drawer, session drawer, analytics drawer, overview tab, requests tab, timeline, top 5, top hosts, top ips, status codes, charts in drawer, pinned tabs, status summary, blocked count, copy link, wide drawer, 960]
order: 55
---

# Complex drawer

A complex drawer is a wide [Detail drawer](./detail-drawer.md) for something that happened many times: an attack, an incident, an API session. The header says how it ended, the tabs stay pinned, and the Overview tab mixes attributes with `Chart` cards.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| One configured entity (a provider, a rule) | [Detail drawer](./detail-drawer.md), 640px | This pattern |
| One event with counts over time | This pattern, 960px | A new page, a `Dialog` |
| Status of the event | `Badge variant='dotted'` in `DrawerDescription` | A status `Attribute` row |
| Totals like "0/55 blocked" | Text after the badge in `DrawerDescription` | A `Metric` card |
| Copy a link to the event | Icon `Button` in a `Tooltip` in `DrawerHeader` | An "Actions" menu with one item |
| Volume over time | `LineChart` in a full-width `Chart` | A table of hours |
| Top N of something (hosts, IPs, users) | `BarList` in a `Chart` | A nested `Table` |
| Share by class (status codes) | `PieChart` donut in a `Chart` | `BarList` |
| The event's own records (requests) | A second tab with a `NumericBadge` count: records left, the selected one right | A list under the charts, a nested drawer |
| Content side by side | A CSS grid of two columns inside `DrawerBody` | A second `Drawer`, `Flex` with fixed widths |

## Rules

**Drawer**

- Everything in [Detail drawer](./detail-drawer.md) still applies: one controlled `Drawer` per list, opened from `onMasterCellClick`, `activeRowId`, non-modal, no footer.
- Pass `width={960}`; put `DrawerResizeHandle` first and persist `onResizeEnd`.
- Pin the header and tabs: `Tabs asChild` around `DrawerHeader`, `TabsList` and `DrawerBody`. **Never** put the tabs inside `DrawerBody` here; the body is long.
- Reset the tab to Overview and clear the selected record when another row opens the drawer.
- Pass the `Drawer`'s `data-testid` to `Tabs` too: `Tabs` restarts the test id cascade.

**Header**

- `DrawerTitle` is the event name; it truncates, so keep the full name in the list too.
- `DrawerDescription` holds `HStack gap={6} align='center'`: the status `Badge variant='dotted' type='secondary'`, then the counts as plain text.
- Header icon buttons: `variant='ghost' color='neutral' size='small'` with `aria-label` and a `Tooltip`. One or two, before the built-in close X. More actions go in one "Actions" `DropdownMenu`.

**Overview tab**

- Wrap the tab in `VStack gap={12} className='pt-16 pb-24'`.
- Attributes first, in two columns: `grid grid-cols-2 gap-x-8 gap-y-6 pb-8`, default (vertical) `Attribute`.
- Then one full-width `Chart` with the `LineChart` timeline.
- Then cards two per row: `grid grid-cols-2 gap-12`. A grid row gives neighbours the same height; `Chart` has no minimum of its own.
- Every card has a `ChartHeader` with a `ChartTitle`: "Top 5 hosts", "Status codes". Count words, not "Chart".
- Show at most five rows per `BarList`. Show percents with `BarListPercent`, not raw counts, when the total is in the header.
- Status codes: `PieChart` with `PieChartCenterLabel pluralize`, legend `Badge textVariant='code'` coloured 2XX green, 3XX blue, 4XX amber, 5XX red.
- IPs in attributes: `Ip` + `IpAddress` in `HStack gap={8}`, not `InlineCodeSnippet`.

**Columns**

- Two columns of attributes: `grid grid-cols-2 gap-x-8 gap-y-6`. Two columns of cards: `grid grid-cols-2 gap-12`.
- List and detail: `grid grid-cols-[320px_1fr] gap-16 py-16`. The right column gets `border-l border-border-primary-light pl-16`.
- **Never** more than two columns at 960px, and never a third column of cards.

**Records tab**

- Label it with the noun and the total: "Requests" + `NumericBadge`.
- Left: a one-column `Table` with `onMasterCellClick` and `activeRowId`; the cell stacks the request and its time.
- Right: horizontal `Attribute` rows of the selected record. Nothing selected: `EmptyState type='no-results'` with the title "Select a request to view details".

**Does not exist:** `DrawerStatus`, `DrawerSubtitle`, a `size` prop on `Chart`, `BarList` `limit`, a chart grid component.

## Examples

The list opens one shared, wide drawer with pinned tabs.

```story
Default
```

The header: status, counts and a copy link button.

```story
Header
```

The analytics block: a timeline and chart cards two per row.

```story
Charts
```

List and detail in two columns.

```story
SplitView
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Event loading | `loading` on each `Attribute`; `LineChartEmpty` with no text; `BarListSkeleton`, `PieChartSkeleton`. Card titles stay. Not a `Loader` | `Chart` |
| No data for a card | `ChartEmpty` inside the card, the title stays | `Chart` |
| One value only (100%) | Keep the card; a single full bar or a full ring is fine | `BarList`, `PieChart` |
| Records loading | `isLoading` with `skeletonCount={3}` | `Table` |
| Event still running | The status badge, not a spinner | `Badge` |

Loading.

```story
Loading
```

## What your app owns

| You own | The DS owns |
| --- | --- |
| Fetching the event, its series and top N | Card frame, chart drawing, tooltips |
| Which cards and in what order | Bar, donut and line styling |
| Status → badge colour, status code colours | Legend, percent maths |
| The link being copied, the toast | Tooltip, button states |
| Tab state, reset on open | Pinned header and tabs, scrolling |

## Related

- [Detail drawer](./detail-drawer.md), [Entity table](./entity-table.md)
- [Filtering](./filtering.md), [Empty states](./empty-states.md)
- [Layering](../foundations/layering.md), [Spacing](../foundations/spacing.md)
