# Tech Design: Global Navigation

> **Figma**: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9257-100
> **Prototype**: https://artem-desing.github.io/global-navigation-prototype/v/v8/

---

## 1. Overview

Global Navigation is the Wallarm Console navigation system, split between MFE Host and MFE Remote. It consists of three visual zones on the screen:

| Zone | Owner | Description |
|------|-------|-------------|
| **Top Header** | Host | Logo, global search, tenant switcher, limits, docs, notifications, AI assistant |
| **L1 Sidebar** | Host | Product-level navigation. Has two modes: **expanded** (icon + text, ~200px) on the Home page, and **collapsed** (icons only, ~64px) when a product is active |
| **Remote Area** | Remote | Single opaque slot. Remote owns its internal layout: L2+ navigation panel, breadcrumb, and content area. Host has no knowledge of this subdivision |

**Mode with L2 (product page) — L1 collapsed:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]      [Search ⌘K]   [Tenant ˅] [limits] [?] [bell] [AI] │  ← Host: TopHeader
├─────┬────────────────────────────────────────────────────────┤
│ ic  │ Product    │  Breadcrumb: Product > Segment > Page     │
│ ic  │────────────│───────────────────────────────────────────│
│ ic  │ ← Back     │                                           │
│ ic  │ Entity     │           Content Area                    │
│ ic  │────────────│                                           │
│ ic  │ Overview   │           (Remote MFE)                    │
│ ic  │ Sub-item   │                                           │
│     │ Group ˅    │                                           │
│ ic  │  └ Child   │                                           │
│ AV  │            │                                           │
├─────┼────────────┴───────────────────────────────────────────┤
│Host │           Remote Area (single opaque slot)              │
│ L1  │  Remote decides its own internal layout via             │
│     │  RemoteShell: panel + breadcrumb + content              │
└─────┴────────────────────────────────────────────────────────┘
```

**Mode without L2 (Home) — L1 expanded:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]      [Search ⌘K]   [Tenant ˅] [limits] [?] [bell] [AI] │
├──────────────┬───────────────────────────────────────────────┤
│ ic  Home     │                                               │
│ ic  Recent   │                                               │
│              │           Content Area                        │
│ ic  Product A│                                               │
│ ic  Product B│           (Host / Remote MFE)                 │
│ ic  Product C│                                               │
│ ic  Product D│                                               │
│              │                                               │
│ ic  Settings │                                               │
│ AV  User     │                                               │
├──────────────┴───────────────────────────────────────────────┤
│ Host: L1 (expanded, ~200px)  │  Content (no Remote area)     │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Navigation Anatomy by Level

### 2.1. L1 — Product Sidebar (Host)

L1 has **two display modes** that switch automatically:

| Mode | Width | Content | When active |
|------|-------|---------|-------------|
| **Expanded** | ~200px | Icon + text label | Home page (no product active) |
| **Collapsed** | ~64px | Icon only | Any product page (Remote area is active) |

**L1 elements (examples):**
- Home (link to root page)
- Recent (button → popover with recently visited **products** only, not individual pages)
- Product sections (links to default product pages)
- Settings (link, pinned to bottom)
- User avatar (button → dropdown menu, pinned to bottom)

> **Note — Recent:** Phase 1 delivers the Recent UI only (popover shell, list layout), without a data implementation. The data strategy — how Host learns which products were recently active — is deferred. Host already holds product registration info (root link, name, manifest address) for each MFE, which is sufficient to build the Recent list once a tracking mechanism is chosen. A `RecentApi` event bus was considered and rejected: Remotes could spam events, and the Host can derive the active product from the URL's first segment without any Remote cooperation.

**Keyboard shortcuts:**
Each L1 element has a bound keyboard shortcut in chord-sequence format (e.g., `G` then `E`). The shortcut is shown in the tooltip on hover in collapsed mode and next to the label in expanded mode.

**Element states:**
- `default` — muted icon (collapsed) or muted icon + text (expanded)
- `hover` — background highlight + tooltip with name and keyboard shortcut
- `active` — colored accent background, current product

**Behavior:** Clicking a product element navigates to the product's default page. L1 switches to collapsed mode, and the Remote area becomes active.

### 2.2. L2 — Product Menu (Remote)

Panel ~240px wide, rendered by Remote inside the Remote area. Contains:
- **Heading** (product name)
- **Flat list** of navigation elements

**L2 element types:**
| Type | Description | Example |
|------|-------------|---------|
| `link` | Direct link → navigation to a terminal page | Leaf page (Overview, Settings) |
| `drill` | Link to an entity list. Selecting a specific entity triggers a **drill-down** — the panel replaces its content with the next level | Entity list that drills into entity detail |
| `group` | Expandable section (accordion) with nested links. Supports arbitrary nesting (group within group) | Parent category ˅ → child pages |

**Element states:**
- `default`
- `hover`
- `active` — current page (bold text or accent color)
- `expanded` / `collapsed` — for `group`

### 2.3. L3+ — Entity Drill-Down (Remote, Recursive)

When the user selects a specific entity from a list, the L2 panel **completely replaces** its content with the entity's menu:

```
L2 (Product menu)       →    L3 (Entity menu)
─────────────────            ─────────────────────
Product Name                 ← Parent Section     ← back button (button, NOT a link)
  Overview                   Entity Name           ← heading
  Section A ●                ─────────────────
  Section B                    Overview
  Group ˅                      Sub-section A
  ...                          Sub-section B
                               Group ˅
                               ...
```

**Back button — three invariants:**

1. **Multi-level:** The back button can be pressed multiple times, all the way to the root level (L2) of the product. At the root level, the button is hidden (there is nowhere to go further).
2. **In-memory only:** Peek state does not survive refresh and is not written to the URL or `history.state`.
3. **Reset on navigation:** Any actual navigation — clicking a link in the panel, browser back/forward, or changing products in L1 — resets peek depth to 0, snapping the panel back to the level that matches the current URL.

**Recursion:** L3 can have its own drill-down elements, going to L4, L5, and beyond. Each level works on the same principle — the back button returns to the previous menu level without changing the URL.

---

## 3. Breadcrumb (Remote)

### 3.1. Segment Types

The breadcrumb is built from segments, each segment's type determined by the section context:

| Segment type | Visual | Behavior | When used |
|-------------|--------|----------|-----------|
| `link` | Text link | Click → navigates to page | Product (first segment), or entity with its own page |
| `scope-switcher` | Text + chevron ˅ | Click → dropdown with sibling entity list for scope switching | Entity from a `drill` node in the nav config — the explicit `type: 'drill'` is the signal for rendering a scope-switcher |
| `static` | Plain text | No action | Last segment (current page), and intermediate segments from accordion groups that have no pages of their own |

### 3.2. Breadcrumb Examples

**Drill-down with scope-switcher:**
```
Product  >  Entity A ˅  >  Entity B ˅  >  Page
  ↑            ↑               ↑            ↑
 link     scope-switcher  scope-switcher  static
```
A scope-switcher appears when the segment corresponds to a `drill` node in the nav config — the explicit `type: 'drill'` is the declarative signal for `matchNav` to produce a scope-switcher breadcrumb segment.

**Accordion nesting without scope-switcher:**
```
Product  >  Group  >  Sub-group  >  Page
  ↑          ↑          ↑           ↑
 link      static     static     static
```
When intermediate breadcrumb segments reflect accordion groups from the L2 menu (rather than a drill-down into a specific entity), they render as static text. These groups have no pages of their own and do not imply scope switching — they merely show the menu nesting hierarchy.

### 3.3. Scope-switcher Dropdown

Clicking a scope-switcher segment opens a dropdown showing all sibling entities at that level:

```
┌─────────────────────┐
│ ✓ Current Entity    │  ← current, with checkmark
│   metadata          │
│─────────────────────│
│   Sibling A         │
│   metadata          │
│─────────────────────│
│   Sibling B         │
│   metadata          │
└─────────────────────┘
```

Each item contains: name + description/metadata (optional). Selecting another item triggers navigation (changes URL, updates content).

---

## 4. Component Architecture

### 4.1. Host Components (design system)

```
AppShell/
├── AppShell.tsx                 — root layout: grid with header, rail, remote-area zones
├── AppShellHeader.tsx           — top header slot
├── AppShellRail.tsx             — container for L1 icon rail
├── AppShellRemote.tsx           — single opaque slot for Remote MFE
├── classes.ts
├── types.ts
└── index.ts

NavRail/
├── NavRail.tsx                  — vertical sidebar with two modes (expanded / collapsed)
├── NavRailItem.tsx              — single element (icon + label + keyboard shortcut)
├── NavRailSeparator.tsx         — visual separator
├── classes.ts
└── index.ts

TopHeader/
├── TopHeader.tsx                — header bar
├── TopHeaderLogo.tsx            — logo (slot)
├── TopHeaderActions.tsx         — right side with action buttons
├── classes.ts
└── index.ts
```

### 4.2. Remote Components (design system)

```
RemoteShell/
├── RemoteShell.tsx              — Remote-internal layout: panel + breadcrumb + content
├── RemoteShellPanel.tsx         — slot for NavPanel
├── RemoteShellBreadcrumb.tsx    — slot for Breadcrumbs
├── RemoteShellContent.tsx       — slot for page content
├── classes.ts
└── index.ts

NavPanel/
├── NavPanel.tsx                 — root container for L2+ panel
├── NavPanelHeader.tsx           — level heading (product/entity name)
├── NavPanelBack.tsx             — "← back" button (visual level switch only)
├── NavPanelItem.tsx             — navigation element (link | button)
├── NavPanelGroup.tsx            — expandable group (accordion)
├── NavPanelGroupLabel.tsx       — composable label area for groups
├── NavPanelGroupItem.tsx        — element within a group
├── NavPanelDivider.tsx          — divider
├── classes.ts
├── types.ts
└── index.ts

PageTitle/
├── PageTitle.tsx                — semantic page title, publishes to NavLabelsContext
├── NavLabelsContext.tsx          — context for label overrides
└── index.ts
```

**Breadcrumb** — already exists in the design system (`Breadcrumbs`, `BreadcrumbsItem`, `BreadcrumbsSeparator`, `BreadcrumbsEllipsis`). Extension required:

```
Breadcrumbs/ (extending existing)
├── BreadcrumbsScopeSwitcher.tsx  — NEW: button segment with dropdown for scope switching
└── ...existing files
```

### 4.3. Component Tree (render tree)

```tsx
{/* Host */}
<AppShell>
  <AppShellHeader>
    <TopHeader>
      <TopHeaderLogo />
      {/* Search, Tenant, Limits, Docs, Notifications, AI */}
      <TopHeaderActions>...</TopHeaderActions>
    </TopHeader>
  </AppShellHeader>

  <AppShellRail>
    {/* collapsed={true} when a product is active */}
    <NavRail collapsed={hasActiveProduct}>
      <NavRailItem icon={HomeIcon} label="Home" href="/" />
      <NavRailItem icon={ClockIcon} label="Recent" onClick={openRecent} />
      <NavRailSeparator />
      <NavRailItem icon={ProductAIcon} label="Product A" shortcut={['G', 'A']} href="/product-a" active />
      <NavRailItem icon={ProductBIcon} label="Product B" shortcut={['G', 'B']} href="/product-b" />
      {/* ...other products... */}
      <NavRailSeparator />
      {/* Pinned-to-bottom items are positioned by the rail's composition (flexbox/spacer), not via a per-item prop */}
      <NavRailItem icon={SettingsIcon} label="Settings" shortcut={['G', 'S']} href="/settings" />
      <NavRailItem icon={UserAvatar} label="User" onClick={openUserMenu} />
    </NavRail>
  </AppShellRail>

  <AppShellRemote>
    {/* Remote MFE renders here — Host has no knowledge of internal layout */}
  </AppShellRemote>
</AppShell>

{/* Remote (inside AppShellRemote slot) */}
<ProductNav config={productANavConfig}>
  <RemoteShell>
    <RemoteShellPanel>
      <NavPanel>
        <NavPanelBack onClick={goBackLevel}>{parentSectionLabel}</NavPanelBack>
        <NavPanelHeader>{entityName}</NavPanelHeader>
        <NavPanelItem href="..." active>Overview</NavPanelItem>
        <NavPanelItem href="...">Sub-section A</NavPanelItem>
        <NavPanelItem href="...">Sub-section B</NavPanelItem>
        <NavPanelGroup>
          <NavPanelGroupLabel>Group</NavPanelGroupLabel>
          <NavPanelGroupItem href="...">Child A</NavPanelGroupItem>
          <NavPanelGroupItem href="...">Child B</NavPanelGroupItem>
        </NavPanelGroup>
      </NavPanel>
    </RemoteShellPanel>

    <RemoteShellBreadcrumb>
      <Breadcrumbs>
        <BreadcrumbsItem href="...">Product</BreadcrumbsItem>
        {/* scope-switcher — only if the segment represents a drill-down entity */}
        <BreadcrumbsScopeSwitcher value={currentId} items={siblings} onSelect={handleScopeSwitch}>
          {entityName}
        </BreadcrumbsScopeSwitcher>
        {/* static — for accordion groups without their own pages */}
        <BreadcrumbsItem>Current Page</BreadcrumbsItem>
      </Breadcrumbs>
    </RemoteShellBreadcrumb>

    <RemoteShellContent>
      {/* Product's own router renders the page */}
      <ProductRouter />
    </RemoteShellContent>
  </RemoteShell>
</ProductNav>
```

---

## 5. Navigation State Model

### 5.1. Principle: Derived from Pathname

The navigation stack is **not stored as state** — it is computed from the URL on every render. The only mutable piece of state is `peekDepth`.

```typescript
/** Computed navigation stack entry */
interface NavStackEntry {
  /** Level heading (product name or entity name) */
  title: string
  /** Parent section name (for back button). Null at root L2 level */
  parentLabel: string | null
  /** Menu items at this level */
  items: NavConfigNode[]
  /** Active item ID within this level */
  activeItemId: string | null
}

/**
 * Pure function: pathname + config → full navigation stack.
 * Called on every render via useMemo.
 */
function parseStackFromPath(pathname: string, config: NavConfig): NavStackEntry[]
```

### 5.2. peekDepth

`peekDepth` is the only mutable state in the navigation system:

```typescript
const [peekDepth, setPeekDepth] = useState(0);
// Reset peek on any real navigation
useEffect(() => { setPeekDepth(0) }, [pathname])

const maxDepth = navStack.length - 1
const visible  = navStack[maxDepth - peekDepth]
const parent   = navStack[maxDepth - peekDepth - 1] // undefined at root → hide back

const goBack = () => setPeekDepth(d => Math.min(d + 1, maxDepth))
```

- **Range:** `0` (current level — matches URL) to `navStack.length - 1` (root L2 product level)
- **Back button:** increments `peekDepth` by 1
- **Hidden at root:** back button is hidden when `peekDepth === navStack.length - 1`

The panel renders `navStack[navStack.length - 1 - peekDepth]`.

**Breadcrumb and content always render from `navStack[navStack.length - 1]`** (the URL-matched level) — they do not subscribe to `peekDepth`. Peek changes re-render only the panel.

### 5.3. peekDepth Reset

`peekDepth` resets to `0` on any of:
- Clicking a link in the panel (URL changes)
- Browser back/forward (URL changes)
- Changing products in L1 (URL changes)
- Page refresh (`useState` initializes to `0`)

Implementation: `useEffect(() => { setPeekDepth(0) }, [pathname])`

### 5.4. Deep Links and Refresh

Navigation state is fully derived from pathname, so deep links and refresh land on the correct level without any reconstruction. `peekDepth` always starts at `0`.

Each Remote MFE defines a route segments → drill levels mapping in its config. The parser (`parseStackFromPath`) is shared and the same for all products.

---

## 6. Host ↔ Remote Boundary

Host and Remote are fully independent applications. They do not communicate directly. Both react to URL changes independently.

### 6.1. Shared Medium

The **only** shared medium is the **pathname**. Host reads the first segment to determine the active product. Remote reads the full path to determine the active page and drill-down stack.

### 6.2. Cross-Cutting Concerns

Cross-cutting concerns (navigation function, tenant, theme) are provided by `@wallarm/sdk` as part of `SdkContextValue`, not by Host directly.

### 6.3. Host Responsibility

- Rendering `AppShell`, `TopHeader`, `NavRail`
- Determining active product from the URL's first segment
- Providing a single opaque Remote-area slot (`AppShellRemote`)
- Global navigation (switching between products via L1)

### 6.4. Remote Responsibility

- Rendering its own internal layout via `RemoteShell` (panel, breadcrumb, content)
- Rendering `NavPanel` with all drill-down levels
- Computing the navigation stack from pathname + config
- Managing `peekDepth` (the only mutable nav state)
- Rendering `Breadcrumbs` with scope-switcher segments
- Rendering page content via its own router
- Mapping URL → navigation state via `parseStackFromPath`

---

## 7. Component APIs

### 7.1. AppShell

```typescript
interface AppShellProps {
  children: ReactNode
  className?: string
}
```

CSS Grid layout:
```
grid-template-columns: auto 1fr
grid-template-rows: auto 1fr
grid-template-areas:
  "header  header"
  "rail    remote"
```

### 7.2. NavRail

```typescript
interface NavRailProps {
  children: ReactNode
  /** Display mode: expanded (icon + text) or collapsed (icon only) */
  collapsed?: boolean
  className?: string
  'data-testid'?: string
}

interface NavRailItemProps {
  /** Icon */
  icon: ComponentType<SvgIconProps>
  /** Text label (shown in expanded mode and in tooltip in collapsed mode) */
  label: string
  /** Keyboard shortcut chord (e.g., ['G', 'E']). Shown in tooltip */
  shortcut?: string[]
  /** URL (if present — renders as <a>) */
  href?: string
  /** Click handler (if present — renders as <button>) */
  onClick?: () => void
  /** Currently active element */
  active?: boolean
  className?: string
}
```

Layout note: pinned-to-bottom items (Settings, User) are positioned by the rail's composition using flexbox/spacer, not via a per-item prop. The container owns the layout — standard pattern for compound components.

### 7.3. NavPanel

```typescript
interface NavPanelProps {
  children: ReactNode
  className?: string
  'data-testid'?: string
}

interface NavPanelBackProps {
  /** Click callback (NOT navigation, visual level return only) */
  onClick: () => void
  /** Button label — parent section name */
  children: ReactNode
}

interface NavPanelHeaderProps {
  /** Current level name */
  children: ReactNode
}

interface NavPanelItemProps {
  /** URL for navigation */
  href?: string
  /** Click handler (alternative to href) */
  onClick?: () => void
  /** Currently active element */
  active?: boolean
  /** Icon (optional) */
  icon?: ComponentType<SvgIconProps>
  children: ReactNode
}

interface NavPanelGroupProps {
  /** Controlled expand state */
  expanded?: boolean
  /** Default state */
  defaultExpanded?: boolean
  /** Toggle callback */
  onExpandedChange?: (expanded: boolean) => void
  /** Contains NavPanelGroupLabel, NavPanelGroupItem, NavPanelItem, and nested NavPanelGroup */
  children: ReactNode
}

interface NavPanelGroupLabelProps {
  /** Composable label area — can contain icon, text, badge, tooltip, etc. */
  children: ReactNode
}

interface NavPanelGroupItemProps {
  href?: string
  onClick?: () => void
  active?: boolean
  children: ReactNode
}

// Example of composable group label (icon + badge):
// <NavPanelGroup>
//   <NavPanelGroupLabel>
//     <Icon /> Category <Badge>3</Badge>
//   </NavPanelGroupLabel>
//   <NavPanelGroupItem href="...">Page A</NavPanelGroupItem>
//   <NavPanelGroup>
//     <NavPanelGroupLabel>Sub-category</NavPanelGroupLabel>
//     <NavPanelGroupItem href="...">Page B</NavPanelGroupItem>
//     <NavPanelGroupItem href="...">Page C</NavPanelGroupItem>
//   </NavPanelGroup>
// </NavPanelGroup>
```

### 7.4. RemoteShell

```typescript
interface RemoteShellProps {
  children: ReactNode
  className?: string
}

// Sub-components: RemoteShellPanel, RemoteShellBreadcrumb, RemoteShellContent
// Each accepts children: ReactNode and optional className
```

CSS Grid layout (inside Remote area):
```
grid-template-columns: auto 1fr
grid-template-rows: auto 1fr
grid-template-areas:
  "panel  breadcrumb"
  "panel  content"
```

### 7.5. BreadcrumbsScopeSwitcher (Breadcrumbs Extension)

```typescript
interface ScopeSwitcherItem {
  /** Unique entity ID */
  id: string
  /** Name */
  label: string
  /** Description / metadata (region, type, etc.) */
  description?: string
  /** URL for navigation on selection */
  href: string
}

interface BreadcrumbsScopeSwitcherProps {
  /** Currently selected element */
  value: string
  /** List of sibling entities for switching */
  items: ScopeSwitcherItem[]
  /** Callback on selecting another entity */
  onSelect: (item: ScopeSwitcherItem) => void
  /** Display name of the current entity */
  children: ReactNode
}
```

---

## 8. Visual Specifications

### 8.1. Dimensions

| Element | Value |
|---------|-------|
| Top Header height | 48px |
| L1 Sidebar width (expanded) | ~200px |
| L1 Sidebar width (collapsed) | ~64px |
| L2+ Panel width | 256px |
| NavRailItem icon size | 20px |
| NavRailItem padding | 12px |
| NavPanelItem height | 36px |
| NavPanelItem padding-left | 16px |
| NavPanelGroupItem indent | 32px (16px + 16px) |
| Back button height | 32px |
| Panel header height | 40px |

### 8.2. Tokens

All colors via design tokens (Tailwind), no hardcoded values:

| State | Token |
|-------|-------|
| Rail item default | `text-text-secondary` |
| Rail item hover | `bg-bg-secondary-hover` |
| Rail item active | `bg-bg-brand-subtle`, `text-text-brand` |
| Panel item default | `text-text-secondary` |
| Panel item hover | `bg-bg-secondary-hover` |
| Panel item active | `text-text-primary`, `font-semibold` |
| Back button text | `text-text-secondary` |
| Panel header text | `text-text-primary`, `font-semibold` |
| Scope switcher button | `text-text-primary`, `border-border-secondary` |

### 8.3. Animations

| Transition | Type | Parameters |
|-----------|------|------------|
| L1 expanded ↔ collapsed | Width transition | `width`, `duration-200`, `ease-in-out`. Label fade out/in |
| Drill-down (push level) | Slide-in from right | `transform: translateX`, `duration-150`, `ease-out` |
| Back (pop level) | Slide-in from left | `transform: translateX`, `duration-150`, `ease-out` |
| Group expand/collapse | Height transition | `max-height` / `grid-template-rows`, `duration-150` |
| Scope switcher dropdown | Fade + scale | Standard DropdownMenu animation |

---

## 9. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Landmarks | `<header>` for TopHeader, `<nav aria-label="Global root navigation">` for L1, `<aside aria-label="{Product} navigation">` for L2+, `<nav aria-label="Breadcrumb">` for breadcrumbs |
| Keyboard nav (L1) | `Tab` / `Shift+Tab` to move between rail items. `Enter` / `Space` to activate |
| Keyboard nav (L2+) | `Tab` to move between items. `Enter` to activate. `Escape` for back (optional) |
| Accordion groups | `aria-expanded` on trigger. Content `role="group"`. `aria-controls` links trigger and group |
| Active state | `aria-current="page"` on active NavPanelItem |
| Back button | `<button>` (not `<a>`) since it does not trigger navigation |
| Scope switcher | Implement via `aria-haspopup="dialog"` (as in prototype). `aria-expanded` when open |
| Icons (L1) | `aria-hidden="true"` on icons, label via tooltip / `aria-label` |

---

## 10. Host ↔ Remote Boundary: Who Renders What

```
┌──────────────────────────────────────────────────────────────┐
│ HOST renders:                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ TopHeader (logo, search, tenant, actions)              │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────┐ ┌────────────────────────────────────────────────┐   │
│  │ L1 │ │                                                │   │
│  │Rail│ │       REMOTE AREA (single opaque slot)         │   │
│  │    │ │                                                │   │
│  │ H  │ │  Remote owns its internal layout:              │   │
│  │ O  │ │  ┌────────────┬───────────────────────────┐    │   │
│  │ S  │ │  │ NavPanel   │ Breadcrumb                │    │   │
│  │ T  │ │  │ (L2+ menu) │─────────────────────────  │    │   │
│  │    │ │  │            │ Page Content               │    │   │
│  │    │ │  │            │                            │    │   │
│  │    │ │  └────────────┴───────────────────────────┘    │   │
│  └────┘ └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Host knows:**
- Its own L1 config (product list)
- Active product (derived from URL's first segment)
- Nothing about Remote internals (panel, breadcrumb, pages)

**Remote knows:**
- Its own nav config (menu structure)
- Full pathname (for stack computation and routing)
- Nothing about Host or other Remotes

---

## 11. Edge Cases

### 11.1. Deep Link / Page Refresh

Navigation state is fully derived from pathname, so deep links and refresh land on the correct level without any reconstruction. `peekDepth` starts at `0`.

### 11.2. Browser Back/Forward

Browser navigation changes pathname → `parseStackFromPath` recomputes → UI updates. `peekDepth` resets to `0` via `useEffect([pathname])`.

### 11.3. Scope Switching via Breadcrumb

When switching scope through a breadcrumb scope-switcher (e.g., from Entity A to Entity B):
1. URL changes: `/{product}/{section}/{entity-a}/...` → `/{product}/{section}/{entity-b}/...`
2. If Entity B does not have the same nested path — Remote redirects to Entity B's default page
3. The stack is recomputed from the new pathname

### 11.4. No L2 (Home Page)

On Home (`/`) there is no Remote area active. L1 switches to expanded mode (icon + text). The content area takes the full width minus L1 expanded.

### 11.5. Expandable Group + Drill

Expandable group (accordion) and drill are different mechanisms:
- **Group**: reveals nested elements inline, staying on the same level. Groups can be nested (group within group), creating a multi-level accordion hierarchy
- **Drill**: completely replaces panel content with a new level when a specific entity is selected from a list. Represented as `type: 'drill'` in the nav config — the explicit type signals `matchNav` to produce a `scope-switcher` breadcrumb segment for that level

Both can coexist at the same level simultaneously.

### 11.6. Breadcrumb for Accordion Nesting

When the active page is inside nested accordion groups, the breadcrumb reflects the full nesting hierarchy, but intermediate segments (group names) are rendered as static text rather than links or scope-switchers, because groups have no pages of their own. A scope-switcher in the breadcrumb appears **only** for `drill` nodes in the nav config — the explicit type is the signal.

### 11.7. URL Backward Compatibility

The nav config defines `path` segments that `matchNav` uses to locate the active node. If a product reorganizes its navigation tree (moves a page between groups, renames a section) but wants old URLs to keep working, this is handled by the product's own router — not the nav config. The router can define redirects from legacy paths to current paths; `matchNav` will then match against the final (redirected) pathname as usual. The nav config describes the current tree structure, not URL history.

---

## 12. Config-Driven Navigation in Remote

### 12.1. Motivation

Each Remote MFE should describe its navigation structure once — as a static config. From this config, the following are automatically derived:
- NavPanel (L2+ sidebar) with all levels, groups, and drill-down
- Breadcrumb with correct segment types (link / scope-switcher / static)
- Drill-down stack (computed from URL via `parseStackFromPath`)

Routing (which component renders for which URL) is a separate subsystem owned by the product's router (TanStack Router, React Router, etc.) and is **not** part of the nav config.

### 12.2. Config Schema

The nav config is a **fully serializable** tree of strings — no React components, no async functions, no runtime closures. This means it can be validated, hot-reloaded, and in principle loaded from a backend or be tenant-specific without a code release.

```typescript
/**
 * Root product navigation config.
 * Defined as a module-level constant (outside components).
 * Must be JSON-serializable.
 */
interface NavConfig {
  /** Product label (shown in panel header at root level) */
  productLabel: string
  /** Navigation elements for the product's root level (L2) */
  items: NavConfigNode[]
}

/**
 * A single navigation tree node.
 * Can be a link (terminal page), a drill (entity with nested levels),
 * or an accordion group.
 */
type NavConfigNode = NavConfigLink | NavConfigDrill | NavConfigGroup

/** Link: a terminal page with its own URL segment */
interface NavConfigLink {
  type: 'link'
  /** Unique ID within the level */
  id: string
  /** Display label in menu and breadcrumb */
  label: string
  /** URL path segment (e.g., 'overview', 'settings') */
  path: string
}

/**
 * Drill: a section where selecting a specific entity replaces the panel
 * with the next level. The explicit `type: 'drill'` signals `matchNav`
 * to produce a `scope-switcher` breadcrumb segment for that level.
 */
interface NavConfigDrill {
  type: 'drill'
  /** Unique ID within the level */
  id: string
  /** Display label in menu and breadcrumb */
  label: string
  /** URL path segment for the entity list (e.g., 'entities') */
  path: string
  /**
   * URL parameter name for entity ID (e.g., 'entityId').
   * Forms route: `{path}/:${param}/...`
   */
  param: string
  /** Navigation elements within the entity (next drill level) */
  children: NavConfigNode[]
}

/** Group: accordion group without its own page */
interface NavConfigGroup {
  type: 'group'
  id: string
  label: string
  /** Nested elements (link, drill, or group) */
  children: NavConfigNode[]
  /** Expanded by default */
  defaultExpanded?: boolean
}
```

### 12.3. Config Example

```typescript
// products/product-a/nav.config.ts
// Defined at module level — stable reference, not recreated on re-render.
// Fully JSON-serializable: no React components, no closures.

export const productANavConfig: NavConfig = {
  productLabel: 'Product A',
  items: [
    {
      type: 'link',
      id: 'overview',
      label: 'Overview',
      path: 'overview',
    },
    {
      type: 'drill',
      id: 'entities',
      label: 'Entities',
      path: 'entities',
      param: 'entityId',
      children: [
        {
          type: 'link',
          id: 'entity-overview',
          label: 'Overview',
          path: 'overview',
        },
        {
          type: 'drill',
          id: 'sub-entities',
          label: 'Sub-entities',
          path: 'sub-entities',
          param: 'subEntityId',
          children: [
            {
              type: 'link',
              id: 'sub-entity-detail',
              label: 'Detail',
              path: 'detail',
            },
          ],
        },
        {
          type: 'group',
          id: 'operations',
          label: 'Operations',
          children: [
            {
              type: 'link',
              id: 'logs',
              label: 'Logs',
              path: 'logs',
            },
            {
              type: 'link',
              id: 'metrics',
              label: 'Metrics',
              path: 'metrics',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      id: 'category',
      label: 'Category',
      children: [
        {
          type: 'link',
          id: 'page-a',
          label: 'Page A',
          path: 'page-a',
        },
        {
          type: 'group',
          id: 'sub-category',
          label: 'Sub-category',
          children: [
            {
              type: 'link',
              id: 'page-b',
              label: 'Page B',
              path: 'page-b',
            },
          ],
        },
      ],
    },
  ],
}
```

### 12.4. Usage in Remote MFE

```tsx
// products/product-a/App.tsx

import { ProductNav, RemoteShell, RemoteShellPanel, RemoteShellBreadcrumb, RemoteShellContent } from '@wallarm/design-system'
import { useProductNav } from '@wallarm/design-system'
import { productANavConfig } from './nav.config'
import { ProductRouter } from './router'

/**
 * ProductNav provides nav config context + NavLabelsContext.
 * useProductNav() hook computes the derived state (stack, breadcrumb segments).
 * Routing is handled entirely by the product's own router.
 */
export const ProductAApp = () => (
  <ProductNav config={productANavConfig}>
    <ProductALayout />
  </ProductNav>
)

const ProductALayout = () => {
  const { navStack, peekDepth, setPeekDepth, breadcrumbSegments } = useProductNav()
  const currentLevel = navStack[navStack.length - 1 - peekDepth]

  return (
    <RemoteShell>
      <RemoteShellPanel>
        <NavPanel>
          {currentLevel.parentLabel && (
            <NavPanelBack onClick={() => setPeekDepth(d => d + 1)}>
              {currentLevel.parentLabel}
            </NavPanelBack>
          )}
          <NavPanelHeader>{currentLevel.title}</NavPanelHeader>
          {/* render currentLevel.items */}
        </NavPanel>
      </RemoteShellPanel>

      <RemoteShellBreadcrumb>
        <Breadcrumbs>
          {/* render breadcrumbSegments */}
        </Breadcrumbs>
      </RemoteShellBreadcrumb>

      <RemoteShellContent>
        <ProductRouter />
      </RemoteShellContent>
    </RemoteShell>
  )
}
```

Two fully independent subsystems: one knows the navigation tree, the other knows URL → component. They share only pathname.

### 12.5. matchNav: Path Matching

With `page` removed from the config, generating a route tree from the nav config is neither possible nor needed — routes live in the product's router independently. What remains: **path matching to determine the active node in the menu**.

The nav config describes the **navigation tree**, not the URL schema. `matchNav` maps the current pathname to a position in the tree, but the URL structure is owned by the product's router. If a product needs to reorganize its tree while preserving old URLs, it handles this through router-level redirects — `matchNav` always works against the final resolved pathname (see §11.7).

```typescript
/**
 * Pure function. Matches pathname against nav config.
 * Serves two purposes:
 * 1. Building the drill stack for NavPanel
 * 2. Building the segments for Breadcrumb
 *
 * Called via useMemo on every pathname change.
 */
function matchNav(pathname: string, config: NavConfig): {
  /** Full drill stack from root to current level */
  navStack: NavStackEntry[]
  /** Breadcrumb segments */
  breadcrumbSegments: BreadcrumbSegment[]
  /** Active item ID within the current level */
  activeItemId: string | null
}
```

Result for the config example (§12.3):
```
URL: /overview                                       → stack: [root], active: overview
URL: /entities                                       → stack: [root], active: entities
URL: /entities/E1/overview                           → stack: [root, E1], active: entity-overview
URL: /entities/E1/sub-entities                       → stack: [root, E1], active: sub-entities
URL: /entities/E1/sub-entities/S2/detail             → stack: [root, E1, S2], active: sub-entity-detail
URL: /entities/E1/logs                               → stack: [root, E1], active: logs
URL: /page-a                                         → stack: [root], active: page-a
URL: /page-b                                         → stack: [root], active: page-b
```

Notes:
- `link` creates a single URL segment (`{path}`)
- `drill` creates a URL segment with a dynamic parameter (`{path}/:${param}/...`) and pushes a new level onto the stack
- `group` does not create a URL segment — its children are promoted to the parent's level. Accordion groups are purely visual menu organization

### 12.6. PageTitle Component

Once `resolveEntity` / `resolveSiblings` are removed from the config, the question arises: where does NavPanel get the heading and Breadcrumb get the label for the current page?

The answer is a new primitive in the DS: a `<PageTitle>` component.

```tsx
interface PageTitleProps {
  /**
   * Explicit override for the page/entity title.
   * If omitted, the label is read from the matched nav config node.
   */
  children?: ReactNode
}
```

**Behavior:**
- **Without `children`:** reads the current pathname, calls `matchNav(pathname, config)`, and returns the matched leaf node's `label` from config.
- **With `children`:** uses the provided value, ignoring the config label.

The result is published into `NavLabelsContext` — a single source of truth. NavPanel's heading and the last Breadcrumb segment subscribe to this context and render the final label as `context.override ?? matchedNode.label`.

**Layering:**
- Both `<PageTitle>` and `NavLabelsContext` live entirely inside Remote. They never cross the Host/Remote boundary.
- NavPanel and Breadcrumbs are also Remote-owned, rendered through `<RemoteShell>`. They read from the same context.
- Host has no concept of Remote-internal labels.

**Important:** `<PageTitle>` is not a variant of the existing `<Heading>`. `Heading` is responsible for typography (size, weight, color). `PageTitle` is responsible for the semantic "what is the current page called." These roles are orthogonal — merging them would blur the semantic contract.

### 12.7. Deferred: Dynamic Drill-Segment Labels and Siblings

Two problems remain unsolved for dynamic entities:

1. **Intermediate drill-segment names in the breadcrumb** (e.g., the name of `E1` in `/entities/E1/sub/E2/page`).
2. **Siblings list** for the scope-switcher dropdown.

Both problems share the same shape — "a layout publishes data for a specific drill node" — and should be designed together as a single companion primitive (something like `useNavNode(nodeId, { label, loadSiblings })`), not split into two independent APIs.

**Deferred** until a concrete product use case appears.

### 12.8. Architecture Overview

```
<RemoteShell>                              ← Remote-internal layout primitive (DS export)
  │
  ├─ <RemoteShellPanel>                    ← internal slot, NOT a Host slot
  │    └─ NavPanel (drillStack, peekDepth state)
  │
  ├─ <RemoteShellBreadcrumb>               ← internal slot, NOT a Host slot
  │    └─ Breadcrumbs (segments)
  │
  └─ <RemoteShellContent>
       └─ <ProductRouter />                ← product's own router renders the page

<ProductNav config={navConfig}>            ← thin orchestrator inside Remote
  └─ matchNav(pathname, config)            — pure function, useMemo
        ├─→ navStack          → NavPanel
        └─→ breadcrumbSegments → Breadcrumbs
```

Host's `AppShell` exposes only Header, Rail, and a single Remote-area slot. Host knows nothing about Remote-internal layout (panel, breadcrumb) or Remote-internal labels (entity names, page titles, breadcrumb segments). The only navigation knowledge Host has is its own L1 config — the list of products and the active product (the latter derived from pathname).

---

## 13. Implementation Order

### Phase 1: Layout & Shell
- `AppShell` (grid layout with 3 zones: header, rail, remote-area)
- `AppShellHeader`, `AppShellRail`, `AppShellRemote`
- `TopHeader`, `TopHeaderLogo`, `TopHeaderActions`
- `RemoteShell` (grid layout: panel, breadcrumb, content)
- `RemoteShellPanel`, `RemoteShellBreadcrumb`, `RemoteShellContent`

### Phase 2: L1 Navigation
- `NavRail`, `NavRailItem`, `NavRailSeparator`
- Two modes: expanded (icon + label) and collapsed (icon only)
- Keyboard shortcut chords (tooltip displaying key combination)
- States: default, hover, active
- Expanded ↔ collapsed transition animation

### Phase 3: L2+ Navigation Panel
- `NavPanel`, `NavPanelHeader`, `NavPanelItem`
- `NavPanelGroup`, `NavPanelGroupLabel`, `NavPanelGroupItem` (accordion)
- `NavPanelBack` (back button without navigation)
- Drill-down / back slide transition animations

### Phase 4: Breadcrumb Extension
- `BreadcrumbsScopeSwitcher` — new component within Breadcrumbs
- Dropdown with checkmark on current item and metadata

### Phase 5: Config-driven Navigation
- `matchNav` pure function (pathname + config → stack + segments)
- `useProductNav` hook
- `NavLabelsContext` and `<PageTitle>` component
- `peekDepth` state management

### Phase 6: Integration & Polish
- Deep link verification (stack derived from pathname — works by default)
- Browser history sync (`peekDepth` reset on pathname change)
- Keyboard navigation
- E2E tests
