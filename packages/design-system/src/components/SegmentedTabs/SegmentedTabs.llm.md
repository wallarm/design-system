# SegmentedTabs — usage

> The **segmented-pill** tab set — a compact, rounded pill row (sliding indicator) that
> **owns its content panels** like `Tabs`, but wears `SegmentedControl`'s skin. Built on
> the same Ark UI tab primitive as `Tabs`. Compound (`SegmentedTabs` + `SegmentedTabsList`
> + `SegmentedTabsTrigger` + `SegmentedTabsContent` + optional `SegmentedTabsButton` /
> `SegmentedTabsSeparator`). Use it for **scoped views of one collection** or a **secondary
> tab level** — not as the page's primary tabs.

## Reach for it when
- **Scoped views / quick-filters over a single collection** (the headline case) — a `Table` or list shown as **the same data under a few preset, mutually-exclusive scopes**: All / Active / Pending / Blocked · All / Critical / API Abuse / a saved "Custom view". Each pill is the *same collection filtered*, not a different section. Drop a `NumericBadge` in a pill for its count ("Active 50") and the `indicator` dot to mark a saved / custom view.
- **A secondary / nested tab level** — when a section already uses primary `Tabs` (underline) and needs a *second* level, the pill skin keeps the two levels visually distinct. **Two levels is the max** — a third means the content wants real navigation (the sidebar / routing), not more tabs.
- A **compact, self-contained** tab set embedded in a card / toolbar / panel, where the pill look fits a tight space better than a full-width underline bar — still **not** the page's primary tabs.

## Don't use it for — pick the right switcher
- **A view / mode toggle — same content, different *presentation*** (table ↔ card grid, list ↔ board), or any switch whose panel **you** render → `SegmentedControl` (emits a value, owns no panel). **The line: does selecting it change *which* content shows (a different scope / filter → SegmentedTabs, which owns the panel), or just *how the same content looks* (→ SegmentedControl)?** Re-presenting the same data, or owning the panel state yourself, is `SegmentedControl`.
- **The page's PRIMARY content division** (Overview / Activity / Settings, top-level sections) → `Tabs`. Underline tabs are the *default* tab; reach for the segmented skin **deliberately** — for a filtered/scoped set or a secondary level, not as the main tabs.
- **A large or open-ended set of scopes, or combinable / multi-select filtering** → a `Select` / filter dropdown, or the `FilterInput` query-builder. The segmented set is a **short, fixed, single-select** preset (aim for ~5–6 pills). **Tie-breaker when it doesn't all fit:** a fixed preset that merely overflows → keep SegmentedTabs and push the extras to the **"More" menu**; a *genuinely many or user-growing* set (e.g. dozens of saved views) has **outgrown** the pattern → move to a `Select` / `FilterInput`.
- **Genuinely different sections, a sequence, or expand-many** → `Tabs` (different content) · a stepper (flow) · `Accordion` (open at once) · primary nav (distinct app areas).

## Locked — don't override
- **It owns the panels** — every `SegmentedTabsTrigger value` pairs with a `SegmentedTabsContent value` (`lazyMount` / `unmountOnExit` on by default). **Don't hand-roll show/hide** — that (owning a panel) is exactly what separates it from `SegmentedControl`.
- **One selected pill + the automatic sliding indicator** (the `SegmentedControl` look — pill container, animated selected pill). Don't build your own selected state.
- **Overflow is a MANUAL "More" menu, not auto-scroll** — unlike `Tabs` (which auto-scrolls overflow with arrows), SegmentedTabs does **not** scroll. Keep the visible set short (~5–6) and compose `SegmentedTabsSeparator` + `SegmentedTabsButton` (wrapped in a `DropdownMenu`) for the rest.
- **No `size` prop** — pill height is fixed (28px, shared with `SegmentedControl`); sizing is an open design question, **don't hand-roll one**. (`Tabs` is the one with `medium` / `small`.)
- **Structure:** `SegmentedTabsList` holds the triggers + the indicator; the `SegmentedTabsContent` panels are its siblings.

## Composition — the pill capabilities
- **`indicator`** (on a trigger) — a small brand dot marking a "new" / saved / custom scope (the *Custom view* case).
- **Count per scope** — compose a `NumericBadge` inside a trigger ("Pending 45"); icons compose too. An **icon-only** pill still needs an `aria-label` / `Tooltip` (the component won't name it — same rule as the picker family).
- **Actionable pills** — a per-pill three-dot context menu: render `SegmentedTabsTriggerButton` (hover-revealed) as the `DropdownMenuTrigger` for per-scope actions (rename / delete a saved view). This per-item menu is unique to SegmentedTabs — `Tabs` puts actions on the bar (`TabsLineActions`); `SegmentedControl` has none.
- **`fullWidth`** — stretch the pills edge-to-edge across their container.

## Pairs with
- `SegmentedTabsContent` (its panels) · `NumericBadge` (scope counts) · `DropdownMenu` (actionable pills + the "More" overflow).
- `Table` / `Card`-grid — the collection it scopes; `Tabs` — the primary level it can sit **under**.
- `Tabs` / `SegmentedControl` / `Accordion` — the boundaries; the **"which switcher?"** decision lives in the design-judgment backlog.
