# HorizontalBar

## Overview

`HorizontalBar` is a compact distribution stat: a headline number, an optional delta badge, a single proportional segmented bar (colored segments + an optional grey remainder tail), and an optional horizontal legend. It renders the body only — the card frame and "Title" header are composed with the existing `Chart` / `ChartHeader` / `ChartTitle`, like every other member of the family. Use it when one total reads naturally as a few named parts shown as a single band; when each part needs its own row, use `BarList`.

## Figma

- Root: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883

## Data model

- `data` (required, `HorizontalBarDatum[]`) — drives both the bar segments and the legend, so their colors always match. Order is preserved (the caller sorts). Non-finite / negative values are coerced to `0`. No aggregation or "Other" bucketing.
- `value` (optional, `number`) — the headline number, rendered as `value.toLocaleString('en-US')`. Omitted → the header row is not rendered (unless a delta is present).
- `delta` (optional, `{ value: number; trend?: 'up' | 'down' }`) — rendered as an internal `Badge` (`type='secondary'`, `color='w-orange'`) with an up/down arrow and the absolute value. Direction comes from `trend`, else the sign of `value`.
- `total` (optional, `number`) — the bar denominator. When `total > sum(data.value)`, a grey remainder tail fills `(total − sum)`. Defaults to the sum (no tail). `total <= sum` or non-finite is ignored.
- `legend` (optional, `boolean`, default `true`) — show/hide the legend.

`HorizontalBarDatum.color` uses the family `ChartColor` palette; omit it to auto-assign by index (`HORIZONTAL_BAR_PALETTE`). `HorizontalBarDatum.className` (a Tailwind `bg-*`) overrides the resolved color on both the segment and the legend dot.

## States

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | `data` with ≥1 segment | Segments sized by value and colored via `resolveChartColor`; legend mirrors them. |
| No value | `value` undefined | Headline number omitted; header row hidden if `delta` is also absent. |
| No delta | `delta` undefined | No chip. |
| Remainder | `total > sum(data.value)` | Grey tail (`--color-bg-strong-primary`) fills the gap; not shown in the legend. |
| Legend off | `legend={false}` | Bar + header only; the bar gains an `aria-label` summary. |
| Empty | `data.length === 0` | Bar renders an empty rounded track; legend hidden. Prefer swapping in `<ChartEmpty />` for an explicit empty body. |

## Interactions

None in v1 — the component is display-only. No hover-sync or click-to-filter (contrast `PieChart`'s legend). Add later if a use case appears.

## Edge cases & unclear states

- **Negative / non-finite values** are coerced to `0` in `resolveSegments` so `flexGrow` geometry stays valid.
- **Zero total** (all values 0, no positive `total`): the bar renders an empty track; no console warnings.
- **`className` on a datum** wins over the palette color on both the segment and its legend dot (the inline `backgroundColor` is skipped).
- **Remainder is never in the legend** — the legend renders only `data` items, not the synthetic tail.
- **Duplicate `name`s** are used as the React key / `data-name`; keep them unique. A dev-only console warning (matching `PieChart`'s pattern) fires once when duplicates are detected; it is a no-op in production builds.

## Accessibility notes

- The bar is `aria-hidden` when the legend is shown (the legend is the readable representation). When `legend={false}`, the bar instead carries an `aria-label` summarizing the segments (`"Critical 42, High 31, …"`).
- The delta badge exposes an `aria-label` like `"up 10"`; its arrow icon is `aria-hidden`.
- Non-interactive: no focusable elements.

## Open questions / known limitations

- Delta color is baked to Figma's `w-orange`; trend drives the arrow only, not color. Revisit if product wants trend-driven red/green.
- No segment animation in v1.
- No tooltips on long legend labels in v1 — wrap the label in `OverflowTooltip` if a use case needs it.
