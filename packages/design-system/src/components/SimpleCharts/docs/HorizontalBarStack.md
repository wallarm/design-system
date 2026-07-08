# HorizontalBarStack

## Overview

`HorizontalBarStack` is a compact distribution stat: a headline number, an optional delta badge, a single proportional segmented bar (colored segments + an optional grey remainder tail), and a horizontal legend. It renders the body only — the card frame and "Title" header are composed with the existing `Chart` / `ChartHeader` / `ChartTitle`, like every other member of the family. The legend is interactive: hovering an item or segment fades the rest (hover-sync), and passing `onSelect` turns items into click-to-filter controls. Use it when one total reads naturally as a few named parts shown as a single band; when each part needs its own row, use `BarList`; when there is no breakdown (just the number), use `Metric`.

## Figma

- Root: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883
- States (hover / filter / disabled): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11520-4054

## Data model

- `data` (required, `HorizontalBarStackDatum[]`) — drives both the bar segments and the legend, so their colors always match. Order is preserved (the caller sorts). Non-finite / negative values are coerced to `0`. No aggregation or "Other" bucketing.
- `value` (optional, `number`) — the headline number, rendered as `value.toLocaleString('en-US')`. Omitted → the header row is not rendered (unless a delta is present).
- `delta` (optional, `{ value: number; trend?: 'up' | 'down'; sentiment?: 'positive' | 'negative' | 'neutral' }`) — the shared `ChartDelta`, rendered via `MetricDelta`. `sentiment` sets the colour (positive → green, negative → red, neutral → slate; default neutral); `trend` sets the arrow, else the sign of `value`. Independent axes.
- `total` (optional, `number`) — the bar denominator. When `total > sum(data.value)`, a grey remainder tail fills `(total − sum)`. Defaults to the sum (no tail). `total <= sum` or non-finite is ignored.
- `legend` (optional, `boolean`, default `true`) — show/hide the legend.
- `activeName` / `onActiveNameChange` (optional, `string | null`) — controlled hover target, joined by `name`. Omitted → managed internally. Use the controlled pair to sync hover across charts. Mirrors `PieChart`.
- `selectedNames` (optional, `string[]`) — names to emphasise. When non-empty, non-selected segments (opacity `0.3`) and legend items (opacity `0.6`) fade. Hover wins — while a series is hovered, only it stays bright. Names not in `data` are ignored. Pass a stable reference.
- `onSelect` (optional, `(name: string) => void`) — click-to-filter. When provided, legend items become interactive (`role='button'`, `tabIndex=0`, Enter/Space) and fire with the clicked datum's `name`. The caller owns the filter (drive `selectedNames`, or filter `data`). Single-select is just the caller mapping one name.

`HorizontalBarStackDatum.color` uses the family `ChartColor` palette; omit it to auto-assign by index (`HORIZONTAL_BAR_STACK_PALETTE`). `HorizontalBarStackDatum.className` (a Tailwind `bg-*`) overrides the resolved color on both the segment and the legend dot.

## States

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | `data` with ≥1 segment | Segments sized by value and colored via `resolveChartColor`; legend mirrors them. |
| Hover | pointer/focus on a legend item or segment | `activeName` set → that series stays bright, the rest fade (segments `0.3`); the active legend item gets `bg-states-primary-hover`. Bidirectional (legend ⇄ segment). |
| Selected / filtered | `selectedNames` includes the row | Selected legend item gets `bg-states-primary-active` + `aria-current`; non-selected segments fade to `0.3` and non-selected legend items to `0.6` (the "disabled" look). Hover still wins. |
| No value | `value` undefined | Headline number omitted; header row hidden if `delta` is also absent. |
| No delta | `delta` undefined | No chip. |
| Remainder | `total > sum(data.value)` | Grey tail (`--color-bg-strong-primary`) fills the gap; not shown in the legend. |
| Legend off | `legend={false}` | Bar + header only; the bar becomes a named image (`role='img'` + `aria-label` summary). |
| Empty / no data | `data.length === 0` | Header-only: value + delta render, but the bar wrapper and legend are not rendered at all (no empty track). Holds even when `total` is set. If `value` and `delta` are also absent, nothing renders — prefer `<ChartEmpty />` for an explicit empty body, or `Metric` for a bare stat. |

## Interactions

Same contract as `PieChart`, reused verbatim (the shared `makeIsHoverSyncTarget` guard + `activeName` / `selectedNames` semantics), but driven by root props rather than composed children because the legend is derived from `data`.

- **Hover-sync** — hovering (or focusing) a legend item or a segment sets `activeName`; the matching series stays bright and the rest fade. Both `mouseleave`/`blur` handlers inspect `relatedTarget` and skip the null-clear when moving to another hover-syncing sibling (segment or legend item), so there is no intermediate `activeName = null` flicker.
- **Click-to-filter** — attach `onSelect`; legend items become buttons (`role='button'` + `tabIndex=0`, Enter/Space) and show a `Click to filter` tooltip on hover/focus — `Remove filter` when the item is the active/selected one. The caller filters (e.g. sets `selectedNames`, or filters `data`). Clicking the active item again to clear is a caller convention.
- **Dimming** — `selectedNames` fades the non-selected series so emphasis lands on the chosen one(s). Hover (`activeName`) overrides selection while a series is hovered.
- **Controlled hover** — set `activeName` + `onActiveNameChange` to drive/share hover from a parent (cross-chart sync). Stale names (not in current `data`) collapse the highlight to `null`.
- **Segment tooltip** — each series segment is a DS `Tooltip` trigger; hovering shows a `dot · name · value` popover (the value is not shown elsewhere on the bar). The remainder tail has none. Baked in (not composed) because the segments are internal — the one spot the component diverges from the family's compose-a-`Tooltip`-in-stories convention.

## Edge cases & unclear states

- **Negative / non-finite values** are coerced to `0` in `resolveSegments` so `flexGrow` geometry stays valid.
- **No data** (`data.length === 0`): the bar wrapper is not rendered — only the header (value/delta) shows. A `total` with empty `data` still draws no bar (no labels → no bar).
- **Zero total with data present** (all values 0, no positive `total`): the bar renders an empty track; no console warnings.
- **`className` on a datum** wins over the palette color on both the segment and its legend dot (the inline `backgroundColor` is skipped).
- **Remainder is never in the legend** — the legend renders only `data` items, not the synthetic tail. It carries no `data-name` and is never hoverable/selectable; it dims with the rest when a series is active.
- **Hover wins over selection** — while `activeName` is non-null, only that series is bright regardless of `selectedNames`.
- **Duplicate `name`s** are used as the React key / `data-name` / join key for hover & selection; keep them unique. A dev-only console warning (matching `PieChart`'s pattern) fires once when duplicates are detected; it is a no-op in production builds.
- **Slot testids derive from the component's own `data-testid`** (`{base}--header`, `--value`, `--bar`, `--segment`, `--legend`, `--legend-item`, `--legend-dot`), computed locally — *not* via `useTestId`, because every slot renders inline in the root and the context hook would resolve a wrapping provider's base (e.g. `Chart`'s) instead of this component's. No `data-testid` → no slot testids (clean DOM).

## Accessibility notes

- The bar is `aria-hidden` when the legend is shown (the legend is the readable representation). When `legend={false}`, the bar instead becomes `role='img'` with an `aria-label` summarizing the segments (`"Critical 42, High 31, …"`) — the explicit role is required because `aria-label` is ignored on generic (role-less) elements.
- When `onSelect` is set, legend items are keyboard-operable buttons (`role='button'`, `tabIndex=0`, Enter/Space), and the selected item exposes `aria-current='true'`. The focus-visible ring uses `ring-focus-primary`.
- The delta badge is a named image (`role='img'` + `aria-label` like `"up 10"`) — `Badge` renders a generic `<div>`, so without the role the label would not be announced and the trend direction (carried only by the `aria-hidden` arrow icon) would be lost. All numbers in labels use the same `toLocaleString('en-US')` formatting as the visible text.

## Open questions / known limitations

- **Skeleton** — no loading skeleton yet (pending the Figma node); add a `HorizontalBarStackSkeleton` matching `BarListSkeleton` / `PieChartSkeleton`.
- **Per-item analytics** — because the legend is data-derived (not composed sub-components), consumer `data-analytics-*` can't land on individual legend items; the `onSelect(name)` callback carries the identity instead. Revisit (compound the legend) if per-item DOM analytics become a requirement.
- **Header reuse** — the value + delta header is the shared `MetricHeader` / `MetricValue` / `MetricDelta` bricks from `Metric`, composed under HBS's own `TestIdProvider`, so the two never drift on header typography or delta colour.
- No segment animation; no tooltips on long legend labels (wrap in `OverflowTooltip` if needed).
