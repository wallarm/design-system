# AppShell — usage

> The application's **outermost frame** — the persistent global chrome (top bar + product rail + a content area that products mount into) wrapping the entire platform. Structural / layout; mounted **once**, at the app root. It's the design-system embodiment of the *app-shell / micro-frontend host* pattern: the shell stays put, only the content area swaps as you move between products.

## Reach for it when
You're building (or prototyping) the **whole platform frame** — the Wallarm host chrome every product lives inside: a global top bar, a global product rail down the left, and a large content area. Compose the three slots and render your page into the content slot. There is exactly **one** AppShell in an app, at the very root; it persists across navigation while the content area changes.

For a prototype, render your page **directly into `AppShellRemote`** — the micro-frontend / Module-Federation loading is production wiring, never a prerequisite for using the component. Hardcode the rail's product list; the real one comes from runtime config.

## Don't use it for — it's the frame, not the contents
- **A single product screen / view** (an Attacks page, a dashboard, a settings area) → render `RemoteShell` + your content, **no AppShell**. In the real platform that screen is a *remote* that mounts into the shell's content slot and is blind to it — it never renders its own AppShell. This is the #1 boundary: don't wrap a page in AppShell.
- **In-product sidebar / breadcrumb / drill-down nav** → `RemoteShell` / `NavPanel` (each product owns its own `navConfig`). AppShell's rail is the *global* product switcher, not in-product nav.
- **Laying out a page's insides** (sections, columns, cards, toolbars, resizable split-panes) → `Stack` / `Flex` / page primitives. AppShell only defines the outermost regions.
- **Nesting or per-page mounting** → there's one shell, at the root. Never put an AppShell inside another, or inside a route / page.
- **Global search, tenant switcher, notifications, account, settings** → AppShell has **no feature props**; this chrome is *composed into the slots*, never toggled on the shell — search / tenant / notifications / help live in the header (`TopHeader` actions), account / settings in the rail footer (`NavRail`). (Dataplane switching is a standalone micro-frontend, not shell chrome; global search is still landing.)

## Locked — don't override
- **Three fixed regions, one grid** — header spans the top, rail is the left column, content fills the rest. Compose `AppShellHeader` / `AppShellRail` / `AppShellRemote`; don't hand-build the grid or re-place the regions.
- **`AppShellRemote` is the one content surface** — the rounded, top-/left-bordered page area that scrolls; it's where the page (or a mounted product) goes. Don't restyle it or wrap it in your own scroll frame.
- **The header + rail fade in after the content settles** — this staged "appeared" reveal is automatic (driven by context). Don't hand-animate the chrome.
- **Mounted once, persists across navigation** — only the content inside `AppShellRemote` swaps when you move between products.

## First-load entrance — off by default
`reveal` / `expandFrom` animate the shell in **only on the first application load** — the splash screen hands off and the content surface shrinks / morphs into the full shell (`onRevealed` fires when it's done; see the `LoginFlow` / `RevealFlow` stories). Leave them **unset** for an ordinary screen or a page-level prototype; wire them only when you're prototyping the initial boot / post-login entrance itself.

## Pairs with
- `TopHeader` — goes in `AppShellHeader`: the global top bar (logo + right-side actions — search, tenant switcher, notifications, help).
- `NavRail` — goes in `AppShellRail`: the global product switcher (icons, `collapsed` state, product keyboard shortcuts); its footer holds account + settings. Arrow keys bridge from the rail into a product's `NavPanel`.
- `RemoteShell` — what a **product** renders inside the content slot (its own panel + breadcrumb + content). The shell↔remote seam: the host owns cross-product chrome, the remote owns everything inside it. **Mind the near-identical names — `AppShellRemote` is the host's content *slot*; `RemoteShell` is the product frame that mounts *into* it.** In production a product's `RemoteShell` fills `AppShellRemote`; a prototype can drop page content straight in.
- `SplashScreen` — the first-load companion that hands off to `expandFrom`.
