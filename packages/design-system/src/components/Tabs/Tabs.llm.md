# Tabs — usage

> Switch between a few **peer content sections** — one panel visible at a time —
> **without leaving the page's context**. Compound (`Tabs` + `TabsList` + `TabsTrigger`
> + `TabsContent` + optional `TabsLineActions`). Built on Ark UI. **Tabs owns its
> panels** (`TabsContent`) — that's what separates it from `SegmentedControl`.

## Reach for it when
A page or section splits into **a few self-contained, peer sections** the user moves
between while staying put — a detail page's Overview / Activity / Settings, a panel
organized into sections, a settings area of grouped pages. One section shows at a time;
switching **keeps the user in the same context** (they're not navigating elsewhere).
Each `TabsTrigger value` has a matching `TabsContent value`.

## Don't use it for — pick the right switcher
- **Two mutually-exclusive *views of the same content*** (list ↔ board, table ↔ cards), or a small inline view / value toggle → `SegmentedControl` — a compact pill that **emits a value and owns no panel**.
- **Scoped views / quick-filters of one collection** (All / Pending / saved views), or a **secondary** tab level under these Tabs → `SegmentedTabs` (the pill-skinned sibling that also owns its panels). **Decider:** a **primary content division** of a page/section (line-style) → **Tabs**; **scoped views of one collection** or a **secondary level** (segmented pill skin, owns its panels) → **SegmentedTabs**; a compact pill that owns **no** panel — a view/mode toggle of the *same* content (list↔board, table↔cards) → **SegmentedControl**.
- **Sections that should be visible at once** → `Accordion` (multiple open). Tabs is strictly one-at-a-time.
- **Moving between pages / changing context** → the sidebar / primary nav; **hierarchy / location** → `Breadcrumbs`. Tabs *keep* context — they may be URL-synced as sub-views of **one** area, but moving between **distinct top-level areas** is navigation, not tabs.
- **Steps in a sequence / a flow** → a stepper; **a filtered view of a list** → `FilterInput` / filters.

## Locked — don't override
- **Tabs owns the panels** — every `TabsTrigger value` pairs with a `TabsContent value`; the active panel shows, the rest are hidden (`lazyMount` / `unmountOnExit` are on by default — a panel mounts on first open). Don't hand-roll show/hide around tabs.
- **One active tab**, with the **animated underline indicator** + selected styling automatic. Don't build your own active state.
- **Overflow is automatic** — when the tabs exceed the width the `TabsList` **scrolls horizontally with arrow buttons** (+ a "more" affordance); it does **not** wrap. Don't hand-build a more-menu or wrap the row.
- **Structure**: `TabsList` (the bar — bottom border + indicator) holds the `TabsTrigger`s; optional `TabsLineActions` (right-aligned actions on the bar) + `TabsSeparator`. Icons + label go inside a trigger.

## Sizing / judgment calls
- **`size`** — `medium` (default) / `small` (a denser or secondary tab set).
- **`variant`** — `default` (brand underline) / `grayscale` (a quieter, de-emphasized set — e.g. nested or secondary tabs).
- **`value` / `defaultValue` / `onChange`** — controlled when the active tab is app / URL state (tabs often map to a URL); uncontrolled otherwise.
- **Keep it to a handful (≈2–6)** — past ~7 the row still scrolls, but a long tab set is a sign the content wants real navigation (or a `Select`), not tabs.

## Pairs with
- `TabsContent` (the panels it owns) + `TabsLineActions` (actions on the tab bar).
- `SegmentedControl` / `SegmentedTabs` / `Accordion` — the boundaries; the **"which switcher?" decision** lives in the design-judgment backlog.
- Can sit in a `Drawer` / `Dialog` header (a tabbed panel) — see those docs.
