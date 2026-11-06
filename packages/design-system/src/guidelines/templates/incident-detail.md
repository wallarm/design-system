---
title: Incident detail
description: Use when building a page for one incident or vulnerability, with severity, status, owner and resolve actions in the header and tabs for overview, timeline, events, comments.
components: [Page, PageHeader, PageHeaderGroup, PageTitle, PageActions, PageContent, Tabs, TabsList, TabsTrigger, TabsContent, NumericBadge, Badge, SplitButton, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, Avatar, AvatarFallback, Alert, AlertContent, AlertTitle, AlertDescription, AlertControls, Attribute, AttributeLabel, AttributeValue, InlineCodeSnippet, HttpMethod, Ip, IpCountry, IpAddress, FormatNumber, FormatDateTime, CodeSnippetRoot, CodeSnippetHeader, CodeSnippetContent, CodeSnippetCode, Card, CardHeader, CardTitle, CardContent, Timeline, TimelineItem, TimelineIndicator, TimelineContent, TimelineTitle, TimelineDescription, Table, Code, ResponseCode, Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, Textarea, Field, Skeleton, Heading, Text, HStack, VStack]
keywords: [incident, incident page, vulnerability, vulnerability detail, attack detail, case, investigation, severity, assignee, owner, resolve, false positive, accept risk, timeline, activity, history, related events, comments, detail page, entity page, record page]
order: 40
---

# Incident detail

One security incident on a full page. The header says what it is, how bad it is, who owns it and what to do next; four tabs hold the evidence. Swap the domain words and the same screen serves a vulnerability, a finding or any record with a lifecycle.

## What it shows

- The page shell from [Resource list page](../patterns/resource-list-page.md), with `TabsList` between `PageHeader` and `PageContent`.
- The header: `PageTitle`, a solid severity `Badge`, a dotted status `Badge`, and the ID, host and open time as secondary text. `PageActions` holds an assignee `DropdownMenuRadioGroup`, a `SplitButton` (Resolve, then other resolutions in its menu) and an overflow menu.
- Overview: an `Alert` while the attack runs, the attribute card from [Complex drawer](../patterns/complex-drawer.md), the description and a `CodeSnippetRoot` request. A `Card` beside it holds the latest `Timeline` entries.
- Timeline: every entry newest first, with an icon `TimelineIndicator` colored by who acted.
- Related events: an [Entity table](../patterns/entity-table.md) with `HttpMethod`, `Ip`, `Code`, `ResponseCode`, a dotted result `Badge` and a row menu in the master cell.
- Comments: an `Avatar` per author and a `Field` with `Textarea` to add one.
- "Mark as false positive" is a [Confirmation dialog](../patterns/confirmation-dialogs.md); Resolve is reversible, so it runs at once. Both report with [Feedback toasts](../patterns/feedback-toasts.md).
- Loading keeps the tabs and actions in place, with the skeletons from [Complex drawer](../patterns/complex-drawer.md) and [Entity table](../patterns/entity-table.md).

## Examples

The whole page on the Overview tab. Open the Resolve split button's menu and pick "Mark as false positive" to see the confirmation dialog.

```story
Default
```

The Timeline tab with every entry.

```story
TimelineTab
```

First load with skeletons.

```story
Loading
```

## Related

- [Complex drawer](../patterns/complex-drawer.md): the same incident in a side panel when the list must stay visible.
- [Resource list page](../patterns/resource-list-page.md)
- [Entity table](../patterns/entity-table.md)
- [Confirmation dialogs](../patterns/confirmation-dialogs.md)
- [Feedback toasts](../patterns/feedback-toasts.md)
- [Application layout](../patterns/app-layout.md): the shell and breadcrumbs around this page.
