# TopHeader — usage

> The **global top bar** — the full-width strip across the top of `AppShell` (its `AppShellHeader` slot): brand logo on the left, global actions on the right. Structural / layout; one per app, cross-product chrome.

## Reach for it when
You're filling `AppShell`'s header slot — the persistent bar carrying the **brand logo** (links home) and the **global, cross-product affordances** on the right: search (⌘K), tenant switcher, notifications, help. Compose `TopHeaderLogo` + `TopHeaderActions` inside it; one per app.

## Don't use it for
- **Account / settings / theme** → these are *user-scoped*, not global chrome, so they live in the **`NavRail` footer**, not the top bar (even though other systems often put a theme toggle up top).
- **A page's own title / tabs / action buttons** → build that *inside* `RemoteShellContent` (it's per-page content, and the DS pattern for it is still unsettled — see `RemoteShell`). The top bar is *global*, never per-page.
- **Product navigation** → `NavRail` (rail) / `RemoteShell` (in-product). TopHeader carries chrome, not nav.
- **A generic toolbar / action bar inside a view** → that's local UI; TopHeader is the one app-wide bar.

## Locked — don't override
- **Logo left, actions right** (`justify-between`) — the two-region layout is fixed; it's the content of `AppShellHeader`. Don't re-place the regions.
- **`TopHeaderLogo` is interactive** — a link that goes home (use `href`, or `asChild` to wrap your router `Link`); it carries its own hover / focus states. Give it an accessible name (e.g. `aria-label='Wallarm home'`).
- **`TopHeaderActions`** is the right-side cluster (a flex row); use **`TopHeaderSeparator`** (a thin vertical rule) to divide groups within it.

## Pairs with
- `AppShell` — TopHeader is what goes in `AppShellHeader`; `NavRail` (the rail) holds account / settings, not this.
- The action contents are **composed in**, not TopHeader parts: a search `Input` / `Kbd` (⌘K), a tenant switcher (`Dialog` / menu), a notifications `Button` + `Tooltip`, a help `DropdownMenu`. (Global search / tenant switch are still landing.)
