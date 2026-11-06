---
title: Security dashboard
description: Use when building the overview screen of a security product, with KPI tiles, traffic and attack charts, breakdowns and a top threats table under one period selector.
components: [Page, PageHeader, PageHeaderGroup, PageTitle, PageDescription, PageActions, PageToolbar, PageContent, SegmentedControl, SegmentedControlItem, Button, Chart, ChartHeader, ChartTitle, ChartActions, Metric, MetricHeader, MetricValue, MetricTotal, MetricDelta, MetricCaption, MetricSparkline, MetricSkeleton, LineChart, LineChartBody, LineChartGrid, LineChartXAxis, LineChartYAxis, LineChartLine, LineChartTooltip, LineChartLegend, LineChartLegendItem, LineChartHoverPopoverDot, LineChartEmpty, PieChart, PieChartDonut, PieChartCenter, PieChartCenterValue, PieChartCenterLabel, PieChartLegend, PieChartLegendItem, PieChartLegendValue, PieChartLegendPercent, PieChartSkeleton, LegendDot, BarList, BarListItem, BarListBar, BarListLabel, BarListValue, BarListPercent, BarListSkeleton, HorizontalBarStack, HorizontalBarStackSkeleton, Skeleton, Table, TableEmptyState, Badge, HttpMethod, Ip, IpCountry, IpAddress, FormatDateTime, DropdownMenu, EmptyState, Alert, Heading, Text, HStack, VStack]
keywords: [dashboard, overview, home, security overview, WAAP, API security, KPI, stat tiles, metrics, charts, traffic, incidents, top threats, period selector, time range, analytics]
order: 10
---

# Security dashboard

The overview screen of a WAAP or API security product: what traffic arrived, what was attacked, what was blocked and what needs a look now. It is a `Page` with one period selector in the toolbar and a grid of `Chart` cards in `PageContent`, ending in a top threats `Table`.

## What it shows

- Page frame from [Resource list page](../patterns/resource-list-page.md): `PageHeader` with one outline action, the period `SegmentedControl` alone in `PageToolbar`, the card grid in `PageContent`.
- KPI tiles: `Chart` + `Metric` bricks (`MetricValue`, `MetricTotal connector='of'`, `MetricDelta`) and a `MetricSparkline`.
- Over time: two `LineChart`s sharing a `syncId`, so hovering one moves the cursor on both; requests and attacks never share an axis.
- Breakdowns: `PieChart` donut with a centre total, `BarList` of the most attacked endpoints with a `ChartActions` link, `HorizontalBarStack` for incidents by severity.
- Top threats: one `Table` from [Entity table](../patterns/entity-table.md): `Badge` status, `HttpMethod`, `Ip` with a flag, `FormatDateTime`, the row menu in the Attack master cell.
- One period drives every card; switching it recomputes all of them.
- States from [Empty states](../patterns/empty-states.md): chart skeletons and `Table isLoading` while loading; a no-traffic tenant gets one `Alert` with the only action, `LineChartEmpty` copy, a description-only `EmptyState` in each chart card and `TableEmptyState` in the table.

## Examples

The whole dashboard; the period selector updates every card.

```story
Default
```

First load: each card swaps its body for its own skeleton under a real header.

```story
Loading
```

A tenant with no traffic yet: one alert with the setup action, every card says why it is empty.

```story
NoData
```

## Related

- [Resource list page](../patterns/resource-list-page.md)
- [Entity table](../patterns/entity-table.md)
- [Empty states](../patterns/empty-states.md)
- [Application layout](../patterns/app-layout.md)
