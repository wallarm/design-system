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
| Legend off | `legend={false}` | Bar + header only; the bar becomes a named image (`role='img'` + `aria-label` summary). |
| Empty / no data | `data.length === 0` | Header-only: value + delta render, but the bar wrapper and legend are not rendered at all (no empty track). Holds even when `total` is set. If `value` and `delta` are also absent, nothing renders — prefer `<ChartEmpty />` for an explicit empty body. |

## Interactions

None in v1 — the component is display-only. No hover-sync or click-to-filter (contrast `PieChart`'s legend). Add later if a use case appears.

## Edge cases & unclear states

- **Negative / non-finite values** are coerced to `0` in `resolveSegments` so `flexGrow` geometry stays valid.
- **No data** (`data.length === 0`): the bar wrapper is not rendered — only the header (value/delta) shows. A `total` with empty `data` still draws no bar (no labels → no bar).
- **Zero total with data present** (all values 0, no positive `total`): the bar renders an empty track; no console warnings.
- **`className` on a datum** wins over the palette color on both the segment and its legend dot (the inline `backgroundColor` is skipped).
- **Remainder is never in the legend** — the legend renders only `data` items, not the synthetic tail.
- **Duplicate `name`s** are used as the React key / `data-name`; keep them unique. A dev-only console warning (matching `PieChart`'s pattern) fires once when duplicates are detected; it is a no-op in production builds.
- **Slot testids derive from the component's own `data-testid`** (`{base}--header`, `--value`, `--bar`, `--segment`, `--legend`, `--legend-item`, `--legend-dot`), computed locally — *not* via `useTestId`, because every slot renders inline in the root and the context hook would resolve a wrapping provider's base (e.g. `Chart`'s) instead of this component's. No `data-testid` → no slot testids (clean DOM).

## Accessibility notes

- The bar is `aria-hidden` when the legend is shown (the legend is the readable representation). When `legend={false}`, the bar instead becomes `role='img'` with an `aria-label` summarizing the segments (`"Critical 42, High 31, …"`) — the explicit role is required because `aria-label` is ignored on generic (role-less) elements.
- The delta badge is likewise a named image (`role='img'` + `aria-label` like `"up 10"`) — `Badge` renders a generic `<div>`, so without the role the label would not be announced and the trend direction (carried only by the `aria-hidden` arrow icon) would be lost. All numbers in labels use the same `toLocaleString('en-US')` formatting as the visible text.
- Non-interactive: no focusable elements.

## Open questions / known limitations

- Delta color is baked to Figma's `w-orange`; trend drives the arrow only, not color. Revisit if product wants trend-driven red/green.
- No segment animation in v1.
- No tooltips on long legend labels in v1 — wrap the label in `OverflowTooltip` if a use case needs it.
