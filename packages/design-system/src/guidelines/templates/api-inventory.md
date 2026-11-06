---
title: API inventory
description: Use when building an API discovery screen with a host and endpoint tree beside an inspector showing risk, sensitive data, traffic and parameters.
components: [Page, PageHeader, PageHeaderGroup, PageTitle, PageDescription, PageActions, PageToolbar, PageContent, Button, SearchInput, SegmentedTabs, SegmentedTabsList, SegmentedTabsTrigger, NumericBadge, ResizablePanelGroup, ResizablePanel, ResizableHandle, ScrollArea, ScrollAreaViewport, ScrollAreaContent, ScrollAreaScrollbar, TreeView, TreeViewItem, HttpMethod, ParameterPath, ResponseCode, Badge, Tag, Attribute, AttributeLabel, AttributeValue, Heading, Text, HStack, VStack, Separator, Tabs, TabsList, TabsTrigger, TabsContent, Table, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuItemText, DropdownMenuSeparator, Tooltip, TooltipTrigger, TooltipContent, FormatNumber, FormatDateTime, Skeleton, EmptyState, EmptyStateIllustration, EmptyStateMessage, EmptyStateTitle, EmptyStateDescription, EmptyStateActions]
keywords: [api inventory, api discovery, endpoints, hosts, tree, split view, master detail, inspector, resizable, risk score, sensitive data, pii, parameters, http method, parameter path, status codes, attack surface]
order: 30
---

# API inventory

An API discovery screen: every host and endpoint found in traffic sits in a tree on the left, and the selected endpoint opens in an inspector on the right. It is a master-detail layout inside one `Page`, split by `ResizablePanelGroup` instead of a drawer, because the reader moves through many endpoints in a row.

## What it shows

- The [Resource list page](../patterns/resource-list-page.md) frame, with the split in place of the `Table` in `PageContent`.
- A resizable split: a bordered `rounded-12` frame with no padding of its own, each panel scrolling on its own `ScrollArea`.
- `TreeView` as the master list: hosts are branches with a `NumericBadge`, endpoints are selectable rows with `HttpMethod`, the path and a risk score trailing on the right.
- The inspector is the [Detail drawer](../patterns/detail-drawer.md) composition in a panel instead of a `Drawer`. Nothing selected is the [Complex drawer](../patterns/complex-drawer.md) detail pane: centred secondary text.
- Domain primitives: `ParameterPath` for where a parameter lives, `ResponseCode` for status codes, `Badge` colors for risk and sensitive data, `FormatNumber` and `FormatDateTime` for traffic and timestamps.
- No results and a failed load in the tree follow [Empty states](../patterns/empty-states.md).

## Examples

An endpoint open in the inspector; search, tabs and host rows all work.

```story
Default
```

Nothing selected yet: the inspector names the choice that fills it.

```story
NothingSelected
```

The inventory failed to load: the error and "Try again" take the tree's place.

```story
LoadError
```

First load: skeletons where the tree, attributes and parameters will be.

```story
Loading
```

## Related

- [Resource list page](../patterns/resource-list-page.md)
- [Detail drawer](../patterns/detail-drawer.md)
- [Complex drawer](../patterns/complex-drawer.md)
- [Entity table](../patterns/entity-table.md)
- [Empty states](../patterns/empty-states.md)
- [Filtering](../patterns/filtering.md)
