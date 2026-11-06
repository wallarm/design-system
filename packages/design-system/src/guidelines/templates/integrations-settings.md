---
title: Integrations settings
description: Use when building the settings page that connects Wallarm to Slack, Jira, PagerDuty, a SIEM or a webhook, with per-integration notification rules.
components: [AppShell, AppShellHeader, AppShellRail, AppShellRemote, TopHeader, TopHeaderLogo, TopHeaderActions, TopHeaderSeparator, ChatTrigger, NotificationCenter, NotificationCenterTrigger, Logo, NavRail, NavRailBody, NavRailItem, NavRailSeparator, NavRailFooter, RemoteShell, RemoteShellPanel, RemoteShellBreadcrumb, RemoteShellContent, Page, PageHeader, PageHeaderGroup, PageTitle, PageDescription, PageToolbar, PageContent, SearchInput, SegmentedTabs, SegmentedTabsList, SegmentedTabsTrigger, NumericBadge, Table, TableEmptyState, EmptyState, EmptyStateIllustration, EmptyStateMessage, EmptyStateTitle, EmptyStateDescription, EmptyStateActions, Badge, Tag, OverflowList, FormatDateTime, Switch, SwitchControl, SwitchLabel, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuItemIcon, DropdownMenuItemText, DropdownMenuSeparator, Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose, Timeline, TimelineItem, TimelineConnector, TimelineIndicator, TimelineSeparator, TimelineContent, TimelineTitle, Field, FieldLabel, FieldIndicator, Input, Select, SelectInput, SelectPositioner, SelectContent, SelectOption, SelectOptionText, SelectOptionIndicator, CheckboxGroup, Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxDescription, Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, Button, HStack, VStack, Text, Toast]
keywords: [integrations, integration settings, connectors, notifications, notification rules, slack, jira, pagerduty, splunk, siem, webhook, teams, telegram, connect, disconnect, send test, test notification, settings section]
order: 70
---

# Integrations settings

Settings › Integrations in the console frame: every tool Wallarm sends events to, in one table. Each row shows its status, events and last delivery. A switch pauses one integration, and the row menu edits, connects, tests or disconnects it.

## What it shows

- The Settings section from [Application layout](../patterns/app-layout.md): `RemoteShell` with its own `NavConfig`, Settings active in the rail footer, the trail from `RemoteShellBreadcrumb`.
- The [Resource list page](../patterns/resource-list-page.md) frame with search and status tabs, and the no-results state from [Empty states](../patterns/empty-states.md).
- [Entity table](../patterns/entity-table.md) cells: an icon tile with a second line, status badges (Connected, Needs attention, Failed, Not connected), event `Tag`s in `OverflowList`, exact times, the em dash, an on/off `Switch` and the row menu in the master cell.
- The `Timeline` edit drawer from [Create and edit forms](../patterns/create-edit-forms.md): two short fields side by side, card checkboxes for events, a test result as an `Alert` in its section.
- A server-side save failure as a destructive `Alert` atop the drawer body.
- The disconnect dialog from [Confirmation dialogs](../patterns/confirmation-dialogs.md).
- Toasts from [Feedback toasts](../patterns/feedback-toasts.md): a loading "Send test" that turns into success or an error, plus result toasts for save, connect, disconnect and the switch.
- Skeleton rows on first load ([Empty states](../patterns/empty-states.md)).

## Examples

The working page: filter, toggle, connect Telegram, send a test (Splunk fails) or disconnect. Open a row's menu and pick Edit to see the edit drawer with the row marked active; saving Jira fails, so its reason sits atop the form and the drawer stays open. Disconnect in the same menu opens the confirmation dialog.

```story
Default
```

First load: skeleton rows under the real header, tabs without counts.

```story
Loading
```

## Related

- [Application layout](../patterns/app-layout.md)
- [Resource list page](../patterns/resource-list-page.md)
- [Entity table](../patterns/entity-table.md)
- [Create and edit forms](../patterns/create-edit-forms.md)
- [Confirmation dialogs](../patterns/confirmation-dialogs.md)
- [Feedback toasts](../patterns/feedback-toasts.md)
- [Empty states](../patterns/empty-states.md)
- [Settings page](../patterns/settings-page.md): independent values that save on their own.
