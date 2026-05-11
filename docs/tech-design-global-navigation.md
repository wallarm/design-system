# Tech Design: Global Navigation

> **Figma**: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9257-100
> **Prototype**: https://artem-desing.github.io/global-navigation-prototype/v/v8/

---

## 1. Overview

Global Navigation is the Wallarm Console navigation system, split between MFE Host and MFE Remote. It consists of three physical zones on the screen:

| Zone | Owner | Description |
|------|-------|-------------|
| **Top Header** | Host | Logo, global search, tenant switcher, limits, docs, notifications, AI assistant |
| **L1 Sidebar** | Host | Product-level navigation. Has two modes: **expanded** (icon + text, ~200px) on the Home page without L2, and **collapsed** (icons only, ~64px) when the L2 product panel is open |
| **L2+ Sidebar** (navigation panel) | Remote | Panel with a text-based menu within the selected product. Supports infinite drill-down with content replacement |
| **Breadcrumb** | Remote | Breadcrumbs above the content area. Segments can be links, scope-switcher dropdowns, or static text depending on the section context |

**Mode with L2 (product page) — L1 collapsed:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]      [Search ⌘K]   [Tenant ˅] [limits] [?] [bell] [AI] │  ← Host: TopHeader
├─────┬────────────┬───────────────────────────────────────────┤
│ ic  │ Product    │  Breadcrumb: Product > Segment > Page     │  ← Remote: Breadcrumb
│ ic  │────────────│───────────────────────────────────────────│
│ ic  │ ← Back     │                                           │
│ ic  │ Entity     │           Content Area                    │
│ ic  │────────────│                                           │
│ ic  │ Overview   │           (Remote MFE)                    │
│ ic  │ Sub-item   │                                           │
│     │ Group ˅    │                                           │
│ ic  │  └ Child   │                                           │
│ AV  │            │                                           │
├─────┴────────────┴───────────────────────────────────────────┤
│ Host: L1 (collapsed) │   Remote: L2+ Panel + Content         │
└──────────────────────────────────────────────────────────────┘
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
│ Host: L1 (expanded, ~200px)  │  Content (no L2 panel)        │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Navigation Anatomy by Level

### 2.1. L1 — Product Sidebar (Host)

L1 has **two display modes** that switch automatically:

| Mode | Width | Content | When active |
|------|-------|---------|-------------|
| **Expanded** | ~200px | Icon + text label | Home page (no L2 panel present) |
| **Collapsed** | ~64px | Icon only | Any product page (L2 panel is open) |

**L1 elements (examples):**
- Home (link to root page)
- Recent (button → popover with visit history)
- Product sections (links to default product pages)
- Settings (link, pinned to bottom)
- User avatar (button → dropdown menu, pinned to bottom)

**Keyboard shortcuts:**
Each L1 element has a bound keyboard shortcut in chord-sequence format (e.g., `G` then `E`). The shortcut is shown in the tooltip on hover in collapsed mode and next to the label in expanded mode.

**Element states:**
- `default` — muted icon (collapsed) or muted icon + text (expanded)
- `hover` — background highlight + tooltip with name and keyboard shortcut
- `active` — colored accent background, current product

**Behavior:** Clicking a product element navigates to the product's default page. L1 switches to collapsed mode, and the L2 panel appears with the selected product's menu.

### 2.2. L2 — Product Menu (Remote)

Panel ~240px wide, appears when a product is selected in L1. Contains:
- **Heading** (product name)
- **Flat list** of navigation elements

**L2 element types:**
| Type | Description | Example |
|------|-------------|---------|
| `link` | Direct link → navigation | Leaf page of a section (overview, list, dashboard) |
| `group` | Expandable section (accordion) with nested links. Supports arbitrary nesting (group within group) | Parent category ˅ → child pages |
| `drill` | Link to an entity list; when a specific entity is selected, the menu "drills down" to L3 | Entity list → specific entity |

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

**Back button:**
- Displays `← {parent section name}` (e.g., `← {Section A}`)
- Click does **NOT trigger routing** — it only visually returns the L2 panel to the previous menu level
- URL and content area remain unchanged

**Recursion:** L3 can have its own drill-down elements, going to L4, L5, and beyond. Each level works on the same principle — the back button returns to the previous menu level without changing the URL.

---

## 3. Breadcrumb (Remote)

### 3.1. Segment Types

The breadcrumb is built from segments, each segment's type determined by the section context:

| Segment type | Visual | Behavior | When used |
|-------------|--------|----------|-----------|
| `link` | Text link | Click → navigates to page | Product (first segment), or entity with its own page |
| `scope-switcher` | Text + chevron ˅ | Click → dropdown with sibling entity list for scope switching | Entity from a drill-down level that has siblings available for switching |
| `static` | Plain text | No action | Last segment (current page), and intermediate segments from accordion groups that have no pages of their own |

### 3.2. Breadcrumb Examples

**Drill-down with scope-switcher:**
```
Product  >  Entity A ˅  >  Entity B ˅  >  Page
  ↑            ↑               ↑            ↑
 link     scope-switcher  scope-switcher  static
```
A scope-switcher appears when the segment represents a specific entity selected from a list (drill-down) and it has siblings (other entities of the same type) that can be switched between.

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
├── AppShell.tsx                 — root layout: grid with header, rail, panel, content zones
├── AppShellHeader.tsx           — top header (slot)
├── AppShellRail.tsx             — container for L1 icon rail
├── AppShellPanel.tsx            — container for L2+ panel
├── AppShellContent.tsx          — main content area
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
NavPanel/
├── NavPanel.tsx                 — root container for L2+ panel
├── NavPanelHeader.tsx           — level heading (product/entity name)
├── NavPanelBack.tsx             — "← back" button (visual level switch only)
├── NavPanelItem.tsx             — navigation element (link | button)
├── NavPanelGroup.tsx            — expandable group (accordion)
├── NavPanelGroupItem.tsx        — element within a group
├── NavPanelDivider.tsx          — divider
├── classes.ts
├── types.ts
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
    {/* collapsed={true} when L2 panel is open, false on Home */}
    <NavRail collapsed={hasActiveProduct}>
      <NavRailItem icon={HomeIcon} label="Home" href="/" />
      <NavRailItem icon={ClockIcon} label="Recent" onClick={openRecent} />
      <NavRailSeparator />
      <NavRailItem icon={ProductAIcon} label="Product A" shortcut={['G', 'A']} href="/product-a" active />
      <NavRailItem icon={ProductBIcon} label="Product B" shortcut={['G', 'B']} href="/product-b" />
      {/* ...other products... */}
      <NavRailSeparator />
      <NavRailItem icon={SettingsIcon} label="Settings" shortcut={['G', 'S']} href="/settings" pinned="bottom" />
      <NavRailItem icon={UserAvatar} label="User" onClick={openUserMenu} pinned="bottom" />
    </NavRail>
  </AppShellRail>

  <AppShellPanel>
    {/* Remote MFE renders here via slot/portal */}
    <NavPanel>
      <NavPanelBack onClick={goBackLevel}>{parentSectionLabel}</NavPanelBack>
      <NavPanelHeader>{entityName}</NavPanelHeader>
      <NavPanelItem href="..." active>Overview</NavPanelItem>
      <NavPanelItem href="...">Sub-section A</NavPanelItem>
      <NavPanelItem href="...">Sub-section B</NavPanelItem>
      <NavPanelGroup label="Group">
        <NavPanelGroupItem href="...">Child A</NavPanelGroupItem>
        <NavPanelGroupItem href="...">Child B</NavPanelGroupItem>
      </NavPanelGroup>
    </NavPanel>
  </AppShellPanel>

  <AppShellContent>
    {/* Remote MFE renders breadcrumb + page content */}
    <Breadcrumbs>
      <BreadcrumbsItem href="...">Product</BreadcrumbsItem>
      {/* scope-switcher — only if the segment represents a drill-down entity */}
      <BreadcrumbsScopeSwitcher value={currentId} items={siblings} onSelect={handleScopeSwitch}>
        {entityName}
      </BreadcrumbsScopeSwitcher>
      {/* static — for accordion groups without their own pages */}
      <BreadcrumbsItem>Current Page</BreadcrumbsItem>
    </Breadcrumbs>
    {children}
  </AppShellContent>
</AppShell>
```

---

## 5. Drill-Down State Management (Remote)

### 5.1. Menu Data Model

```typescript
/** A single navigation element */
interface NavItem {
  /** Unique ID */
  id: string
  /** Display label */
  label: string
  /** Icon (optional, for L1 or visual emphasis only) */
  icon?: ComponentType<SvgIconProps>
  /** URL for routing. If absent — the element is a group or drill trigger */
  href?: string
  /** Nested elements for an accordion group (expand/collapse within current level) */
  children?: NavItem[]
  /** If true — click does not navigate but "drills" the menu into the next level */
  drill?: boolean
}

/** Configuration for a single drill-down level */
interface NavLevel {
  /** Level heading (entity name) */
  title: string
  /** Parent section name (for back button). Null at L2 (product root level) */
  parentLabel: string | null
  /** Menu items at this level */
  items: NavItem[]
}
```

### 5.2. Level Stack

The Remote MFE maintains a **level stack** for drill-down navigation in the sidebar:

```typescript
interface NavPanelState {
  /** Menu level stack. The last element is the currently displayed level */
  levels: NavLevel[]
}

// Example stack for navigation: Product > Section A > Entity 1 > Section B > Entity 2
const state: NavPanelState = {
  levels: [
    { title: 'Product',   parentLabel: null,          items: [/* product root menu */] },
    { title: 'Entity 1',  parentLabel: 'Section A',   items: [/* Entity 1 menu */] },
    { title: 'Entity 2',  parentLabel: 'Section B',   items: [/* Entity 2 menu */] },
  ]
}
```

**Operations:**
| Action | Mutation | Routing |
|--------|---------|---------|
| Click on drill element (selecting entity from list) | `levels.push(newLevel)` | Yes — navigates to entity's default page |
| Click on back button | `levels.pop()` | **No** — visual menu switch only |
| Click on link within current level | — (active item changes) | Yes — normal navigation |
| Click on L1 (different product) | `levels = [newProductRoot]` | Yes — navigates to another product |

### 5.3. Stack-URL Synchronization

On direct URL access (deep link, refresh), the Remote MFE must reconstruct the stack from the URL:

```
URL: /{product}/{section-a}/{entity-1}/{section-b}/{entity-2}/{page}

Parsing:
  /{product}                    → L2: product root menu
  /{section-a}/{entity-1}       → L3: drill into specific entity from section-a
  /{section-b}/{entity-2}       → L4: drill into specific entity from section-b
  /{page}                       → active item within L4

Result: stack of 3 levels, current — entity-2, active item — page
```

Each Remote MFE defines a **route segments → drill levels mapping** based on its route configuration.

---

## 6. Host ↔ Remote Contract

### 6.1. Host Provides

```typescript
interface HostShellContract {
  /** Slot for rendering the L2+ panel */
  panelSlot: HTMLElement | PortalTarget

  /** Slot for rendering the breadcrumb */
  breadcrumbSlot: HTMLElement | PortalTarget

  /** Slot for rendering the main content */
  contentSlot: HTMLElement | PortalTarget

  /** Currently active product (so Remote knows its context) */
  activeProduct: string

  /** Navigation callback (through host router) */
  navigate: (path: string) => void
}
```

### 6.2. Remote Provides (registration on mount)

```typescript
interface RemoteNavRegistration {
  /** Product ID (must match L1 item id) */
  productId: string

  /** Default route when product is selected in L1 */
  defaultRoute: string

  /** Navigation panel render function */
  renderPanel: (container: HTMLElement) => Disposable

  /** Breadcrumb render function */
  renderBreadcrumb: (container: HTMLElement) => Disposable
}
```

### 6.3. Communication

The strategy depends on the MFE framework (Module Federation, single-spa, etc.), but the contract remains the same:

```
Host                              Remote
 │                                  │
 │  mount(panelSlot, contentSlot)   │
 │ ────────────────────────────────>│
 │                                  │
 │  Remote renders NavPanel         │
 │  into panelSlot, Breadcrumb      │
 │  into breadcrumbSlot             │
 │                                  │
 │  navigate('/{product}/{section}') │
 │ <────────────────────────────────│  (Remote asks Host to navigate)
 │                                  │
 │  URL changed event               │
 │ ────────────────────────────────>│  (Remote reacts to URL change)
 │                                  │
 │  Back button click               │
 │  (NO navigation, only            │
 │   levels.pop() within Remote)    │
 │                                  │
```

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
grid-template-columns: auto auto 1fr
grid-template-rows: auto 1fr
grid-template-areas:
  "header  header  header"
  "rail    panel   content"
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
  /** Pin to bottom of rail */
  pinned?: 'bottom'
  className?: string
}
```

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
  /** Show chevron (for drill elements indicating nesting) */
  hasChildren?: boolean
  children: ReactNode
}

interface NavPanelGroupProps {
  /** Group label */
  label: string
  /** Controlled expand state */
  expanded?: boolean
  /** Default state */
  defaultExpanded?: boolean
  /** Toggle callback */
  onExpandedChange?: (expanded: boolean) => void
  /** Can contain NavPanelGroupItem, NavPanelItem, and nested NavPanelGroup */
  children: ReactNode
}

interface NavPanelGroupItemProps {
  href?: string
  onClick?: () => void
  active?: boolean
  children: ReactNode
}

// Example of nested groups (accordion within accordion):
// <NavPanelGroup label="Category">
//   <NavPanelGroupItem href="...">Page A</NavPanelGroupItem>
//   <NavPanelGroup label="Sub-category">
//     <NavPanelGroupItem href="...">Page B</NavPanelGroupItem>
//     <NavPanelGroupItem href="...">Page C</NavPanelGroupItem>
//   </NavPanelGroup>
// </NavPanelGroup>
```

### 7.4. BreadcrumbsScopeSwitcher (Breadcrumbs Extension)

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
┌─────────────────────────────────────────────────────────────┐
│ HOST renders:                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ TopHeader (logo, search, tenant, actions)              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────┐ ┌──────────────────────────────────────────────────┐│
│  │ L1 │ │                                                  ││
│  │Rail│ │  ┌────────────┐  ┌────────────────────────────┐  ││
│  │    │ │  │ REMOTE:    │  │ REMOTE:                    │  ││
│  │ H  │ │  │ NavPanel   │  │ Breadcrumb                 │  ││
│  │ O  │ │  │ (L2+ menu) │  │─────────────────────────── │  ││
│  │ S  │ │  │            │  │                             │  ││
│  │ T  │ │  │            │  │ REMOTE:                    │  ││
│  │    │ │  │            │  │ Page Content               │  ││
│  │    │ │  │            │  │                             │  ││
│  │    │ │  └────────────┘  └────────────────────────────┘  ││
│  └────┘ └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Host is responsible for:**
- Rendering `AppShell`, `TopHeader`, `NavRail`
- Determining active product by URL
- Providing slots for Remote (panel, breadcrumb, content)
- Global navigation (switching between products)

**Remote is responsible for:**
- Rendering `NavPanel` with all drill-down levels
- Managing the level stack (`levels[]`)
- Rendering `Breadcrumbs` with scope-switcher
- Rendering page content
- Mapping URL → menu state on deep link / refresh

---

## 11. Edge Cases

### 11.1. Deep Link / Page Refresh

On direct navigation to a deep URL (e.g., `/{product}/{section}/{entity}/{sub-section}/{sub-entity}/{page}`):
1. Host determines the active product by the first URL segment
2. Remote MFE mounts
3. Remote parses the full URL, builds a stack of N levels based on the route segments → drill levels mapping
4. NavPanel renders the **last level** of the stack but preserves the entire history for back navigation

### 11.2. Browser Back/Forward

Browser navigation changes the URL → Remote synchronizes the stack. If the new URL belongs to a higher level, the stack is truncated.

### 11.3. Scope Switching via Breadcrumb

When switching scope through a breadcrumb scope-switcher (e.g., from Entity A to Entity B):
1. URL changes: `/{product}/{section}/{entity-a}/...` → `/{product}/{section}/{entity-b}/...`
2. If Entity B does not have the same nested path — Remote redirects to Entity B's default page
3. The stack is rebuilt from the root

### 11.4. No L2 (Home Page)

On Home (`/`) there is no L2 panel. `AppShellPanel` is hidden, L1 switches to expanded mode (icon + text). The content area takes the full width minus L1 expanded.

### 11.5. Expandable Group + Drill

Expandable group (accordion) and drill are different mechanisms:
- **Group**: reveals nested elements inline, staying on the same level. Groups can be nested (group within group), creating a multi-level accordion hierarchy
- **Drill**: completely replaces panel content with a new level when a specific entity is selected from a list

Both can coexist at the same level simultaneously.

### 11.6. Breadcrumb for Accordion Nesting

When the active page is inside nested accordion groups, the breadcrumb reflects the full nesting hierarchy, but intermediate segments (group names) are rendered as static text rather than links or scope-switchers, because groups have no pages of their own. A scope-switcher in the breadcrumb appears **only** for drill-down entities that have siblings available for switching.

---

## 12. Config-Driven Navigation in Remote

### 12.1. Motivation

Each Remote MFE should describe its navigation structure once — as a static config. From this config, the following are automatically generated:
- NavPanel (L2+ sidebar) with all levels, groups, and drill-down
- Breadcrumb with correct segment types (link / scope-switcher / static)
- Routing (which page component to render for each path)
- Drill-down stack (restoration from URL on deep link)

The consumer (Remote MFE) does not assemble these parts manually — it passes the config to a `<ProductNav>` wrapper that handles all orchestration.

### 12.2. Config Schema

```typescript
/**
 * Root product navigation config.
 * Defined as a module-level constant (outside components) for a stable reference.
 */
interface ProductNavConfig {
  /** Navigation elements for the product's root level (L2) */
  items: NavConfigNode[]
}

/**
 * A single navigation tree node.
 * Can be a leaf page, an accordion group, or a drill-down section.
 */
type NavConfigNode = NavConfigLeaf | NavConfigGroup | NavConfigDrill

/** Leaf: a terminal page with a component */
interface NavConfigLeaf {
  type: 'leaf'
  /** Unique ID within the level */
  id: string
  /** Display label in menu and breadcrumb */
  label: string
  /** URL path segment (e.g., 'overview', 'settings') */
  path: string
  /**
   * Lazy-loaded page component.
   * Uses React.lazy for code splitting.
   */
  page: LazyExoticComponent<ComponentType>
}

/** Group: accordion group without its own page */
interface NavConfigGroup {
  type: 'group'
  id: string
  label: string
  /** Nested elements (leaf, group, or drill) */
  children: NavConfigNode[]
  /** Expanded by default */
  defaultExpanded?: boolean
}

/**
 * Drill: a section where entering a specific entity
 * causes the menu to "drill down" to a new level.
 */
interface NavConfigDrill {
  type: 'drill'
  id: string
  label: string
  /** URL path segment for the entity list (e.g., 'data-planes') */
  path: string
  /** List page component (entity table) */
  page: LazyExoticComponent<ComponentType>
  /**
   * URL parameter for entity ID (e.g., 'dataPlaneId').
   * Forms route: `{path}/:${param}/...`
   */
  param: string
  /**
   * Entity metadata resolver by ID (for panel heading and breadcrumb).
   * Called on drill-down or when restoring from URL.
   */
  resolveEntity: (id: string) => Promise<{ label: string }> | { label: string }
  /**
   * Sibling entity loader for scope-switcher in breadcrumb.
   * If not provided — breadcrumb segment renders as a link, not a scope-switcher.
   */
  resolveSiblings?: () => Promise<ScopeSwitcherItem[]>
  /** Navigation elements within the entity (next level) */
  children: NavConfigNode[]
}
```

### 12.3. Config Example

```typescript
// products/product-a/nav.config.ts
// Defined at module level — stable reference, not recreated on re-render.

import { lazy } from 'react'

export const productANavConfig: ProductNavConfig = {
  items: [
    {
      type: 'leaf',
      id: 'overview',
      label: 'Overview',
      path: 'overview',
      page: lazy(() => import('./pages/Overview')),
    },
    {
      type: 'drill',
      id: 'entities',
      label: 'Entities',
      path: 'entities',
      page: lazy(() => import('./pages/EntityList')),
      param: 'entityId',
      resolveEntity: (id) => fetchEntity(id),
      resolveSiblings: () => fetchAllEntities(),
      children: [
        {
          type: 'leaf',
          id: 'entity-overview',
          label: 'Overview',
          path: 'overview',
          page: lazy(() => import('./pages/EntityOverview')),
        },
        {
          type: 'drill',
          id: 'sub-entities',
          label: 'Sub-entities',
          path: 'sub-entities',
          page: lazy(() => import('./pages/SubEntityList')),
          param: 'subEntityId',
          resolveEntity: (id) => fetchSubEntity(id),
          resolveSiblings: () => fetchSubEntities(),
          children: [
            {
              type: 'leaf',
              id: 'sub-entity-detail',
              label: 'Detail',
              path: 'detail',
              page: lazy(() => import('./pages/SubEntityDetail')),
            },
          ],
        },
        {
          type: 'group',
          id: 'operations',
          label: 'Operations',
          children: [
            {
              type: 'leaf',
              id: 'logs',
              label: 'Logs',
              path: 'logs',
              page: lazy(() => import('./pages/Logs')),
            },
            {
              type: 'leaf',
              id: 'metrics',
              label: 'Metrics',
              path: 'metrics',
              page: lazy(() => import('./pages/Metrics')),
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
          type: 'leaf',
          id: 'page-a',
          label: 'Page A',
          path: 'page-a',
          page: lazy(() => import('./pages/PageA')),
        },
        {
          type: 'group',
          id: 'sub-category',
          label: 'Sub-category',
          children: [
            {
              type: 'leaf',
              id: 'page-b',
              label: 'Page B',
              path: 'page-b',
              page: lazy(() => import('./pages/PageB')),
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

import { ProductNav } from '@wallarm/design-system'
import { productANavConfig } from './nav.config'

/**
 * The entire Remote MFE reduces to wrapping config around layout.
 * ProductNav handles:
 * - rendering NavPanel into panelSlot
 * - rendering Breadcrumbs into breadcrumbSlot
 * - routing + Suspense for lazy-loaded pages
 * - drill-down stack and its URL synchronization
 */
export const ProductAApp = () => (
  <ProductNav config={productANavConfig}>
    {/* Optional layout around routed content */}
    <ProductNav.Content />
  </ProductNav>
)
```

`<ProductNav.Content />` is the slot where the current page renders (resolved by URL from config). Everything else (panel, breadcrumb) renders into Host slots automatically.

### 12.5. How the Config Produces UI

All navigation UI is automatically derived from the config. Mapping below:

```
ProductNavConfig
  │
  ├─→ Route tree (flat list of paths for router)
  │     Built by recursive traversal: leaf.path, drill.path/:param + children
  │     Result: [{pattern: 'overview', page: Overview}, {pattern: 'entities', page: EntityList},
  │              {pattern: 'entities/:entityId/overview', page: EntityOverview}, ...]
  │
  ├─→ NavPanel state (current menu level)
  │     Determined by matching current URL against route tree.
  │     Drill levels form the stack. The last level renders in the sidebar.
  │     Groups render as accordions within the level.
  │
  └─→ Breadcrumb segments
        Built from the path from config root to current page:
        - drill node → scope-switcher (if resolveSiblings exists) or link
        - group node → static (no own page)
        - leaf node (last) → static (current page)
```

### 12.6. ProductNav Internal Architecture

```
<ProductNav config={config}>
  │
  ├─ ConfigParser           — parses config → route tree + nav tree once (memoized)
  │
  ├─ URLSynchronizer        — listens to URL, matches against route tree, computes:
  │    │                      • activePath (path to current leaf in config tree)
  │    │                      • drillStack (stack of drill levels)
  │    │                      • breadcrumbSegments
  │    │
  │    ├─→ NavPanelContext   — {currentLevel, drillStack, expandedGroups}
  │    ├─→ BreadcrumbContext — {segments[]}
  │    └─→ RouteContext      — {activePage, params}
  │
  ├─ <Portal to={panelSlot}>
  │    └─ NavPanelRenderer   — subscribes ONLY to NavPanelContext
  │
  ├─ <Portal to={breadcrumbSlot}>
  │    └─ BreadcrumbRenderer — subscribes ONLY to BreadcrumbContext
  │
  └─ <ProductNav.Content>
       └─ PageRenderer       — subscribes ONLY to RouteContext
            └─ <Suspense>
                 └─ activePage (lazy component)
```

### 12.7. Re-render Optimization

Primary goal: when navigating between pages **within the same level** (e.g., Overview → Settings within one entity), **only the content** re-renders, while the sidebar and breadcrumb update surgically (active state only).

#### 12.7.1. Context Splitting

Three independent contexts ensure that changes in one navigation part do not cause re-renders in others:

```typescript
/**
 * Sidebar panel context.
 * Changes only on: drill-down / back / expand-collapse of groups.
 * Does NOT change when navigating between pages within the same level.
 */
const NavPanelContext = createContext<{
  /** Items of the current (last) level */
  currentItems: NavConfigNode[]
  /** Active element ID */
  activeItemId: string
  /** Current level heading */
  title: string
  /** Back button label (null at root level) */
  parentLabel: string | null
  /** Callback for back navigation (pop stack) */
  goBack: () => void
  /** Expanded/collapsed state for each group */
  expandedGroups: Record<string, boolean>
  /** Toggle group */
  toggleGroup: (id: string) => void
}>()

/**
 * Breadcrumb context.
 * Changes on any navigation (active segment updates).
 * Lightweight object — array of segments.
 */
const BreadcrumbContext = createContext<{
  segments: BreadcrumbSegment[]
}>()

/**
 * Routing context.
 * Changes on every navigation. Contains only page ID and params.
 * The page component itself is resolved via a stable ref to the route tree.
 */
const RouteContext = createContext<{
  pageId: string
  params: Record<string, string>
}>()
```

#### 12.7.2. Stable References and Memoization

```typescript
// 1. Config — module-level constant, never recreated
//    (defined in nav.config.ts outside components)

// 2. Route tree and nav tree — computed once from config
const { routeTree, navTree } = useMemo(() => parseConfig(config), [config])

// 3. Callbacks — stable via useCallback with ref deps
const goBack = useCallback(() => {
  drillStackRef.current = drillStackRef.current.slice(0, -1)
  setDrillStack(drillStackRef.current)
}, [])

const toggleGroup = useCallback((id: string) => {
  setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }))
}, [])

// 4. Contexts — recreated ONLY when relevant data changes
const panelValue = useMemo(
  () => ({ currentItems, activeItemId, title, parentLabel, goBack, expandedGroups, toggleGroup }),
  [currentItems, activeItemId, title, parentLabel, expandedGroups]
  // goBack and toggleGroup are stable — not in deps
)
```

#### 12.7.3. Re-render Matrix

What exactly re-renders for each type of action:

| User action | NavPanel | Breadcrumb | Page Content |
|------------|----------|------------|--------------|
| Navigation within same level (Overview → Settings) | **active item only** (1) | **last segment** (2) | **full** (3) |
| Drill-down (selecting entity from list) | **full** (new level) | **full** (new segments) | **full** (new page) |
| Back button (pop level) | **full** (previous level) | None (4) | None (4) |
| Expand/collapse group | **group only** (5) | None | None |
| Scope switch via breadcrumb | **full** | **full** | **full** |

Notes:
1. Thanks to `React.memo` on `NavPanelItem` — only the item whose `active` changed re-renders
2. Breadcrumb segments — array with structural sharing: only the last element changes
3. Lazy-loaded via `Suspense` — new page is loaded on demand
4. Back button does not change URL or content — only sidebar re-renders
5. `NavPanelGroup` is isolated via its own `memo` + local state

#### 12.7.4. Re-render Minimization Techniques

**a) Memo on each NavPanelItem:**
```tsx
const NavPanelItem = memo<NavPanelItemProps>(({ id, label, href, active }) => {
  return (
    <a href={href} data-active={active} className={cn(itemVariants({ active }))}>
      {label}
    </a>
  )
})
```
When `activeItemId` changes, exactly 2 items re-render: the old one (active → false) and the new one (false → active).

**b) Page resolver outside context:**
```tsx
// PageRenderer subscribes to RouteContext, but the lazy component
// is resolved via a stable Map (routeTree), not through context.
const PageRenderer = memo(() => {
  const { pageId, params } = useContext(RouteContext)
  const PageComponent = routeTreeRef.current.get(pageId)?.page

  return (
    <Suspense fallback={<PageSkeleton />}>
      {PageComponent && <PageComponent {...params} />}
    </Suspense>
  )
})
```

**c) Batched state updates for drill-down:**
During drill-down, 3 states change simultaneously (stack, breadcrumb, route). React 18+ automatically batches setState, but for guaranteed batching we use a `flushSync`-free pattern:
```typescript
// Single setState via reducer — one re-render for all three contexts
const [navState, dispatch] = useReducer(navReducer, initialState)

// drill-down = single action
dispatch({ type: 'DRILL_INTO', entityId, entityMeta, childItems })
```

**d) Async resolve without blocking UI:**
`resolveEntity` and `resolveSiblings` are asynchronous. During loading:
- NavPanel shows a skeleton heading
- Breadcrumb scope-switcher shows the current ID as label (replaced with resolved label when ready)
- Content renders independently (does not wait for sidebar resolve)

```typescript
// useEntityResolver — loads metadata without blocking navigation
const { label, isLoading } = useEntityResolver(drillNode.resolveEntity, entityId)
```

### 12.8. Route Tree Generation from Config

The config is recursively transformed into a flat list of route patterns:

```typescript
function buildRoutes(
  nodes: NavConfigNode[],
  parentPath: string = ''
): RouteEntry[] {
  const routes: RouteEntry[] = []

  for (const node of nodes) {
    switch (node.type) {
      case 'leaf':
        routes.push({
          pattern: `${parentPath}/${node.path}`,
          pageId: node.id,
          page: node.page,
        })
        break

      case 'group':
        // Group has no own path segment — its children inherit parentPath
        routes.push(...buildRoutes(node.children, parentPath))
        break

      case 'drill':
        // List page
        routes.push({
          pattern: `${parentPath}/${node.path}`,
          pageId: node.id,
          page: node.page,
        })
        // Pages within entity
        routes.push(
          ...buildRoutes(node.children, `${parentPath}/${node.path}/:${node.param}`)
        )
        break
    }
  }

  return routes
}
```

Result for the example in 12.3:
```
/overview                                        → Overview
/entities                                        → EntityList
/entities/:entityId/overview                     → EntityOverview
/entities/:entityId/sub-entities                 → SubEntityList
/entities/:entityId/sub-entities/:subEntityId/detail → SubEntityDetail
/entities/:entityId/logs                         → Logs
/entities/:entityId/metrics                      → Metrics
/page-a                                          → PageA
/page-b                                          → PageB
```

Note: `group` does not create a URL segment — its children are promoted to the parent's level. This matches the prototype behavior where accordion groups are purely visual menu organization.

### 12.9. Breadcrumb Generation from Config and URL

The breadcrumb is built by traversing from the current matched route back to the config root:

```typescript
function buildBreadcrumb(
  matchedPath: MatchedPathNode[],  // path from root to current leaf in config tree
): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = []

  for (const node of matchedPath) {
    switch (node.configNode.type) {
      case 'leaf':
        // Last segment — always static
        segments.push({ type: 'static', label: node.configNode.label })
        break

      case 'drill':
        // Drill level: scope-switcher (if resolveSiblings exists) or link
        if (node.configNode.resolveSiblings) {
          segments.push({
            type: 'scope-switcher',
            label: node.resolvedEntityLabel,
            loadSiblings: node.configNode.resolveSiblings,
            currentId: node.entityId,
          })
        } else {
          segments.push({
            type: 'link',
            label: node.resolvedEntityLabel,
            href: node.href,
          })
        }
        break

      case 'group':
        // Group — always static (no own page)
        segments.push({ type: 'static', label: node.configNode.label })
        break
    }
  }

  return segments
}
```

### 12.10. Navigation Lifecycle (Full Flow)

```
1. Remote MFE mounts
   │
   ├─ ProductNav receives config (stable reference)
   ├─ ConfigParser computes routeTree + navTree (once, useMemo)
   │
2. URLSynchronizer reads current URL
   │
   ├─ Matches URL against routeTree → determines activePage + params
   ├─ Traverses navTree → builds drillStack, breadcrumbSegments
   ├─ For each drill level, calls resolveEntity(param) → async label
   │
3. Context initialization (single batch via useReducer)
   │
   ├─ NavPanelContext ← {currentItems, activeItemId, title, ...}
   ├─ BreadcrumbContext ← {segments}
   └─ RouteContext ← {pageId, params}
   │
4. Rendering
   │
   ├─ NavPanelRenderer → portal into panelSlot → renders sidebar
   ├─ BreadcrumbRenderer → portal into breadcrumbSlot → renders breadcrumbs
   └─ PageRenderer → renders lazy page in <Suspense>
   │
5. User navigation
   │
   ├─ Click on link in sidebar → URL changes → goto 2 (URLSynchronizer reacts)
   ├─ Drill-down → dispatch(DRILL_INTO) → URL changes → panel re-renders (new level)
   ├─ Back button → dispatch(POP_LEVEL) → panel re-renders (previous level), URL does NOT change
   └─ Scope switch → URL changes → goto 2 (full resynchronization)
```

---

## 13. Implementation Order

### Phase 1: Layout & Shell
- `AppShell` (grid layout with 4 zones)
- `AppShellHeader`, `AppShellRail`, `AppShellPanel`, `AppShellContent`
- `TopHeader`, `TopHeaderLogo`, `TopHeaderActions`

### Phase 2: L1 Navigation
- `NavRail`, `NavRailItem`, `NavRailSeparator`
- Two modes: expanded (icon + label) and collapsed (icon only)
- Keyboard shortcut chords (tooltip displaying key combination)
- States: default, hover, active
- Expanded ↔ collapsed transition animation

### Phase 3: L2+ Navigation Panel
- `NavPanel`, `NavPanelHeader`, `NavPanelItem`
- `NavPanelGroup`, `NavPanelGroupItem` (accordion)
- `NavPanelBack` (back button without navigation)
- Drill-down / back slide transition animations

### Phase 4: Breadcrumb Extension
- `BreadcrumbsScopeSwitcher` — new component within Breadcrumbs
- Dropdown with checkmark on current item and metadata

### Phase 5: Config-driven ProductNav
- `ProductNav` wrapper with ConfigParser, URLSynchronizer
- Context splitting (NavPanelContext, BreadcrumbContext, RouteContext)
- Route tree generation from config
- Breadcrumb generation from config
- useReducer for batched state updates
- `useEntityResolver` for async resolve without blocking UI
- Memo optimization for NavPanelItem, PageRenderer

### Phase 6: Integration & Polish
- Host ↔ Remote contract (slots, events)
- Deep link restoration (stack reconstruction from URL via config)
- Browser history sync
- Keyboard navigation
- E2E tests
