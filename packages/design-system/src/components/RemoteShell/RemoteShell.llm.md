# RemoteShell — usage

> The **per-product content shell** — the inner frame a single product / micro-frontend renders inside `AppShell`'s remote slot: a **second-level nav sidebar (`NavPanel`) + breadcrumb + content area**, all built from one **`NavConfig`** you pass. Config-driven (you author the nav, it renders it). This is where a product's *inner* navigation is formed.

## Reach for it when
You're laying out **the inside of a product / remote** — the left sidebar listing that product's sections (the second level), a breadcrumb, and the scrolling content. Author a **`NavConfig`** (`productLabel` + `items` + optional `headerActions`) and pass it as `config`; RemoteShell builds the sidebar, breadcrumb, active state, and drill/back behavior from it. One per product, rendered into `AppShell`'s `AppShellRemote`.

For a prototype, hardcode the `NavConfig` and stub `onNavigate` with a logger — the router wiring is production detail, never a prerequisite.

## Don't use it for
- **The global product switch** (first-level "which product am I in") → `NavRail`, up in `AppShellRail`. RemoteShell is the *second* level — inside one product.
- **The outer app frame** → `AppShell`. A product renders RemoteShell, **never its own AppShell** (it's blind to the shell it mounts into).
- **A page's internal layout** (the content itself) → `Stack` / `Flex` inside `RemoteShellContent`. RemoteShell frames the product; it doesn't lay out the page.
- **A transient menu / command list** → `DropdownMenu`.

## How to form the inner nav — `NavConfig.items`
Author each entry from this vocabulary; pick by what the entry *does*:
- **`link`** — a destination (one route). The default building block.
- **`section-header`** — a non-interactive, always-visible **group heading** (the *header-as-separator*). Cluster related links under a name ("Identity & Access", "DevTools"). **Prefer this for grouping.**
- **`dividerAfter: true`** (on any item) — a plain **line separator**, no label. Reserve it for an *unlabelled* break where a heading would add noise — e.g. fencing a short utility tail (Settings · Help · Sign-out) off the main list. If the cluster has a name, use a `section-header` instead.
- **`group`** — a **collapsible** labelled cluster (chevron, indented children + a connector line). Use when a cluster is secondary / optional and worth folding away; it nests visually.
- **`drill`** — **enter a scope** (a per-*entity* sub-area, e.g. a data plane): its `children` become the level, with an automatic **"← Back"** and the chosen entity surfaced as a breadcrumb scope-switcher (`entities` + `param`). Use it only when there's an entity to pick; for a non-entity deeper section, nest under a `group` or `section-header` instead.

**Recommendations**
- **A flat product needs only `link`s** — don't add `section-header`s, `group`s, or `drill`s until you actually have a cluster to name or a scope to enter.
- **Group with `section-header`s first**; use a line **`dividerAfter`** only for an *unlabelled* break; use a **`group`** when folding-away helps; use a **`drill`** for entity scopes.
- **Keep nesting shallow — ~2–3 levels of depth *within the panel*** (distinct from the app-tier "second level"). Drills and groups *can* recurse arbitrarily, but deep trees get lost; the breadcrumb + "Back" carry the depth, so lean on them instead of adding a 4th level.
- Active item, indentation, connector lines, "Back", and the breadcrumb are all **derived from the config + the URL** — you don't wire them by hand.

## Locked — don't override
- **Config-driven** — pass `config` (+ `basePath` to strip / prefix the route, `onNavigate` for your router). Don't hand-build the sidebar; `NavPanel`'s parts are an escape hatch only (see its doc), not the normal path.
- **Three regions** = `RemoteShellPanel` (the `NavPanel` sidebar, `resizable`) · `RemoteShellBreadcrumb` · `RemoteShellContent`. Product header (label), active state, drill / back, and URL matching are automatic.
- **It's the second level, mounted in `AppShellRemote`** — it never renders `AppShell`, and the global rail (`NavRail`) hands keyboard focus into its panel.

## Figma-ahead — don't build yet
- The content **page-header** pattern above `RemoteShellContent` ("common header, might change") is unsettled — if you need a title / tabs / actions bar, build it by hand *inside* `RemoteShellContent` (e.g. `Stack` + `Tabs`); just don't extract it into a reusable RemoteShell region yet.
- The breadcrumb's interactive **scope-switcher menu** (the data-plane dropdown) is **WIP** — the `drill` / `entities` data and the *scope label* in the breadcrumb are reliable, but the clickable switch *menu* isn't final: show the current scope, don't wire user-facing scope-switching through it yet.

## Pairs with
- `AppShell` — RemoteShell mounts into `AppShellRemote`; `NavRail` (first level) sits beside it in the rail and hands focus into its panel.
- `NavPanel` — the sidebar RemoteShell renders from config (drive it *via the config*; compose its parts by hand only for a custom panel the config can't express).
- `Breadcrumbs` — the trail `RemoteShellBreadcrumb` builds from the drill stack.
