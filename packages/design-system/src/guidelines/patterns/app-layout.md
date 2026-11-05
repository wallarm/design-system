---
title: Application layout
description: Use when placing a screen in the console frame: the host AppShell, a product RemoteShell driven by a NavConfig, breadcrumbs and where Page goes.
components: [AppShell, AppShellHeader, AppShellRail, AppShellRemote, AppShellAside, TopHeader, TopHeaderLogo, TopHeaderActions, TopHeaderSeparator, NotificationCenter, NotificationCenterTrigger, ChatTrigger, DropdownMenu, NavRail, NavRailBody, NavRailItem, NavRailSeparator, NavRailFooter, NavRailSkeleton, RemoteShell, RemoteShellPanel, RemoteShellBreadcrumb, RemoteShellContent, Page, PageHeader, PageTitle, PageContent, Breadcrumbs, UtilityPage, SplashScreen, Skeleton]
keywords: [app shell, layout, application layout, frame, chrome, top bar, top header, header, sidebar, side nav, navigation, navigation rail, rail, 1st rail, 2nd rail, product menu, nav panel, nav config, left menu, collapsed sidebar, expanded sidebar, micro-frontend, MFE, host, remote, product group, breadcrumbs, drill down, scope switcher, content area, scroll, splash, loading screen, 404, error page, settings section, settings, notifications, notification center, bell, inbox, unread count, user menu, account menu, avatar, profile, sign out, theme, header actions]
order: 5
---

# Application layout

Two shells: `AppShell` (the host's chrome) and `RemoteShell` (a product's chrome, built from a `NavConfig`).

## When to use

| Need | Use | Not |
| --- | --- | --- |
| The console frame: top bar, product rail, content surface | `AppShell` › `AppShellHeader` + `AppShellRail` + `AppShellRemote`, rendered once by the host | An `AppShell` per page, or a hand-made grid |
| A product with its own menu | `RemoteShell config={navConfig}` › `RemoteShellPanel` + `RemoteShellBreadcrumb` + `RemoteShellContent` › `Page` | Hand-built panel markup, or `AppShell` in the product |
| A product inside a host group | Content only; the host wraps the group in one `RemoteShell` | A second `RemoteShell` in the product |
| A host-local section (Settings) | `RemoteShell` in the host route, with its own `NavConfig` | A remote for it |
| A product with one page | `RemoteShell` without `RemoteShellPanel`, or content only | An empty `NavConfig` |
| Home or a cross-product page | `Page` directly in `AppShellRemote` | `RemoteShell` with an empty config |
| The app cannot render (unknown URL, 500, offline, no tenant access) | `UtilityPage` instead of the shell | `UtilityPage` inside `AppShellRemote` |
| Cold start | `SplashScreen`, then `<AppShell reveal>` | A `Loader` on a blank page |

Pick the `NavConfig` node by what the entry does:

| Entry | Node | Not |
| --- | --- | --- |
| A page | `type: 'link'` with `path` (a bare segment, no slash) | A `group` with one child |
| Nested pages with no page of their own | `type: 'group'`; `defaultExpanded` on the one holding the usual page | `drill` |
| Pick an entity, then its sub-pages | `type: 'drill'` with `param`, `entities` and `children` | A `Select` in the page header |
| A label over a run of entries | `type: 'section-header'` | A disabled link |
| A line between entries | `dividerAfter: true` on the entry above | An empty link |

## Rules

**Ownership**

- The host renders `AppShell` once at the root. It owns the product list in `NavRail` and knows nothing about a product's routes.
- The product owns its `NavConfig` (next to its routes) and renders its own `RemoteShell`. **Never** render `AppShell`, `TopHeader` or `NavRail` in a product.
- A product in a host group renders content only. The host draws the group `RemoteShell` for two or more children.

**Header and rail footer**

- Settings is a `NavRailItem` in `NavRailFooter`, never in the product panel or top header.
- The user menu is the last `NavRailFooter` item: an `avatar` `NavRailItem` in `DropdownMenuTrigger`.
- Notifications are a `NotificationCenter` in `TopHeaderActions`, never a hand-made bell and popover.
- `TopHeaderActions` order: search, `TopHeaderSeparator`, tenant switcher, `ChatTrigger`, `NotificationCenter`, help.

**URL is the only state**

- Pass the router's pathname to `pathname` and `onNavigate` to the router, always together.
- If the router has its own `basepath`, omit `basePath` on `RemoteShell`.
- The active item, drill level and trail come from `pathname`. **Never** keep them in state.
- Exactly one `NavRailItem` is `active`, from the first URL segment: Home on `/`, the product on `/edge/…`, Settings (in `NavRailFooter`) on `/settings/…`.

**Sizes (built in; do not override)**

- Top header 36px. Rail 48px collapsed, 184px expanded, 78px compact. Product panel 216px, 164–256px with `resizable`. Rail and panel items 32px.
- `AppShellRemote` owns the rounded surface and border. **Never** restyle it or add a `w-*` to the shell regions.
- Page gutters are 24px, owned by `Page` parts. **Never** pad `RemoteShellContent` or `AppShellRemote`.

**Scroll**

- The shell is `h-screen`. **Never** set `overflow` or `height` on `html` or `body`.
- The rail, the panel and `RemoteShellContent` scroll on their own. A table page uses `<Page fullSize fixedHeight>` so only `PageContent` scrolls.

**Breadcrumbs**

- In a product, the trail is `RemoteShellBreadcrumb`: product, groups as text, drills as a scope switcher, current page. **Never** also put `Breadcrumbs` in `PageHeader`.
- `RemoteShellBreadcrumb` ends at the last `NavConfig` entry. Past it (a record name), render your own `Breadcrumbs` from `useRemoteShellContext()`; a grouped product reports them through `@wallarm/sdk` `onBreadcrumbChange`.
- Trail-row controls are `RemoteShellBreadcrumb` children.
- Home and cross-product pages have no trail.

**Layering**

- In-shell sticky layers are `z-10`; overlays portal above the shell. **Never** add `z-*` to a shell region. See [Layering](../foundations/layering.md).

## Examples

A standalone product: header actions, Settings and the user menu in the rail footer, a `NavConfig` panel, trail and page.

```story
Default
```

Home: a page straight in `AppShellRemote`, expanded rail, no panel.

```story
Home
```

Notifications, open from the header bell.

```story
NotificationsOpen
```

The user menu, open from the rail's avatar item.

```story
AccountMenuOpen
```

A product inside a host group: the host's group shell around the product's page.

```story
GroupedProduct
```

Settings: a host route rendering `RemoteShell`, with no breadcrumbs in `PageHeader`.

```story
SettingsSection
```

A `drill` node: the entity level, the back button and the scope switcher.

```story
DrillDown
```

Loading: rail and header skeletons, product panel rows and a content loader.

```story
Loading
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Cold start | Splash, then the shell | `SplashScreen`, `AppShell reveal` |
| Host data loading | Skeletons where header actions and rail items land | `Skeleton`, `NavRailSkeleton` |
| Product bundle loading | Splash in `AppShellRemote` | `SplashScreen` |
| Product data loading | Product name and skeleton rows in the panel; loader in content | `RemoteShellPanel isLoading`, `RemoteShellContent isLoading` |
| Page data loading | Real `PageHeader`, skeletons in content | `Table isLoading` |
| Page or request failed | Shell stays; your message in `PageContent` | App-rendered |
| Product bundle failed | Shell stays; your message in `AppShellRemote` | App-rendered |
| Unknown URL, server down, offline, no tenant access | Replace the whole shell | `UtilityPage` |
| No access to one product or page | Leave it out of the rail or `NavConfig` | `NavConfig` |

## What your app owns

| Concern | Rule |
| --- | --- |
| Router wiring | `pathname` from the router, `onNavigate={to => navigate({ to })}` |
| Rail mode | Store the user's preference; "adaptive" (expanded on Home, collapsed in a product) is your logic |
| Product list | From the microfrontends API; rail items with `href`, `label`, `icon` and a `shortcut` chord |
| Recent and account menus | Your `DropdownMenu` compositions |
| Notifications | Data, unread count, mark-read logic, the preferences page |
| Permissions | Leave forbidden products and entries out of the rail and `NavConfig` |
| Errors | An error boundary in `AppShellRemote` and in the product's content |
| Prefetch on hover | `onPointerOver` and `onFocus` on `RemoteShellPanel` |
| Panel width | `resizable` keeps it in memory only; it resets on remount |
| Drill labels | `entities` are static; pass fresh ones in `NavConfig` when data changes |
| Test IDs | Panel items and crumbs have none; use roles inside `{shell}--panel` and `{shell}--breadcrumb` |

## Related

- [Spacing](../foundations/spacing.md)
- [Layering](../foundations/layering.md)
- [Resource list page](./resource-list-page.md)
- [Settings page](./settings-page.md)
- [Empty states](./empty-states.md)
- [Auth page](./auth-page.md)
