# HorizontalBar — Design Spec

**Ticket:** AS-1200 · **Branch:** `feat/AS-1200-horizontal-line-chart`
**Figma:** https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883
**Family:** `packages/design-system/src/components/SimpleCharts/`

## Overview

`HorizontalBar` is a compact "distribution" stat: a headline number, an optional
delta chip, a single horizontal **segmented bar** (proportional colored segments
plus an optional grey remainder tail), and an optional horizontal legend of
colored dots + labels. It is the newest member of the `SimpleCharts` family
(`BarList`, `LineChart`, `PieChart`).

It renders **only the body**. The card frame + "Title" header is composed
externally with the existing `Chart` / `ChartHeader` / `ChartTitle` — identical
to how `BarList` and `PieChart` are used. There is no `title` prop.

Use it when a metric reads naturally as one total broken into a few named parts
shown as a single band (e.g. attack severity mix, request category split), and
the parts do not each need their own row (that is `BarList`).

## Why not reuse `Progress`

`Progress` is a single-value 0→max bar built on Ark UI. It has no concept of
multiple stacked segments and would need heavy modification. The segmented bar
is built fresh. Ratios, colors, and legend primitives are reused from the
`SimpleCharts` family (below).

## Public API

Mostly props-driven (per product decisions during brainstorming). The root takes
`data` as the single source of truth for both the bar and the legend, so their
colors always match.

```ts
interface HorizontalBarDatum {
  name: string;        // legend label + React key + E2E join hook (data-name)
  value: number;       // segment size; proportional to the bar total
  color?: ChartColor;  // shared palette; resolves via resolveChartColor()
  className?: string;  // bg-* escape hatch; wins over `color` (inline fill skipped)
}

interface HorizontalBarProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Segments + legend. One array drives both, so colors are always in sync. */
  data: HorizontalBarDatum[];
  /** Headline number. Rendered as value.toLocaleString(). Omitted → header row hidden. */
  value?: number;
  /** Delta chip. Rendered as an internal <Badge> (arrow + number). Omitted → no chip. */
  delta?: { value: number; trend?: 'up' | 'down' };
  /** Bar denominator. If total > sum(data.value), a grey remainder tail fills the rest.
   *  Defaults to sum(data.value) → segments fill 100%, no tail. */
  total?: number;
  /** Show/hide the legend. Default: true. */
  legend?: boolean;
}
```

Component is a **single component with internal structure** (not a compound with
exported sub-components). Only `HorizontalBar` + `HorizontalBarProps` +
`HorizontalBarDatum` are exported. It is still wrapped in `TestIdProvider` so
internal parts get derived `data-testid`s for E2E.

## Color mechanism (matches the family exactly)

Colors are resolved to CSS variables via `resolveChartColor()` /
`CHART_PALETTE_FILL` from `../lib/chartPalette` and applied **inline**, the same
way `PieChartDonut` fills slices and the PieChart `Palette` story colors its
legend dots.

- **Segment fill:** `style={{ backgroundColor: resolveChartColor(datum.color ?? 'slate') }}`.
  If `datum.className` is set, skip the inline `backgroundColor` and let the
  class win — mirrors `PieChartDonut`'s `fill = datum.className ? undefined : …`.
- **Legend dot:** a `size-8 rounded-2` span with the **same**
  `resolveChartColor(datum.color)` background. Same resolver + same `datum.color`
  ⇒ bar segment and its legend dot always match. No second color source.
- **Auto-cycling:** when a datum omits `color`, assign one by index from the
  `ChartColor` palette order (stable, matching PieChart/BarList conventions) so a
  caller can pass colorless data and still get distinct segments.
- **Remainder tail:** filled with a neutral token via the same inline approach.
  Figma uses `azure-84` (#cad5e2); resolve to the closest DS neutral var
  (e.g. `--color-azure-84` if present, else `--color-border-primary`) at
  implementation. The tail is **not** represented in the legend.

No `bg-{color}-500` CVA color variant — that was rejected in favor of the
resolver approach for family consistency.

## Layout & tokens

All values use the repo's px-named Tailwind scale (e.g. `h-8` = 8px, `gap-6` = 6px).

- **Root:** `flex flex-col`, `data-slot='horizontal-bar'`, full width. Vertical
  rhythm between header / bar / legend per Figma (8px paddings).
- **Header row** (`data-slot='horizontal-bar-header'`): `flex items-baseline gap-8`.
  Hidden entirely when both `value` and `delta` are undefined.
  - **Value:** `text-3xl font-medium text-text-primary` (sans-display), rendered
    as `value.toLocaleString()`.
  - **Delta:** internal `<Badge size='medium' type='secondary'>` containing an
    `ArrowUp`/`ArrowDown` icon + the number. Direction from `delta.trend`, else
    from the sign of `delta.value`. Number shown as `Math.abs(value).toLocaleString()`.
    Badge color baked to Figma's **w-orange** (see Open questions).
- **Bar** (`data-slot='horizontal-bar-bar'`): `flex h-8 w-full overflow-hidden`,
  outer corners `rounded-4`. Each segment is a `div`
  (`data-slot='horizontal-bar-segment'`, `data-name={name}`) with
  `style={{ flexGrow: value, flexBasis: 0, minWidth: 1 }}` and the inline
  background color. First and last visible segments get the rounded outer corners.
  Remainder tail is the last flex child when present.
  - Proportional sizing via `flexGrow` (the dynamic-value inline-style exception
    already used by `BarListBar`'s `width: calc(...)`).
  - `minWidth: 1px` keeps sub-1% segments visible (Figma `min-w-px`).
- **Legend** (`data-slot='horizontal-bar-legend'`): `flex flex-row flex-wrap
  items-center gap-6` (mirrors `LineChartLegend`'s horizontal variant). Each item
  (`data-slot='horizontal-bar-legend-item'`, `data-name={name}`): colored square
  dot + `text-xs font-mono text-text-primary` label. Rendered only when
  `legend !== false` and `data` is non-empty.

CVA lives in `classes.ts` for every static variant set; dynamic per-segment color
and `flexGrow` are inline (values, not styling). `cn()` merges all classNames.

## States

| State   | Trigger                                   | Behaviour                                                                 |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| Default | `data` with ≥1 segment                    | Segments sized by value, colored via resolver; legend mirrors them.       |
| No value | `value` undefined                        | Headline number omitted (header row hidden if delta also absent).         |
| No delta | `delta` undefined                        | No chip.                                                                  |
| Remainder | `total > sum(data.value)`               | Grey tail fills `(total − sum)/total`; not in legend.                     |
| Legend off | `legend={false}`                       | Bar + header only; no legend row.                                         |
| Empty   | `data.length === 0`                       | Bar renders an empty rounded track (neutral); legend hidden. Prefer swapping in `<ChartEmpty />` for an explicit empty body. |
| Zero total | all values 0 (and no positive `total`) | Empty track, no segments. No console warnings.                            |

## Data model

- **`data`** (required) — order is preserved; the caller sorts. Non-finite /
  negative `value`s are coerced to `0` (same guard as PieChart) so geometry stays
  valid. No aggregation or "Other" bucketing — the caller shapes the array.
- **`total`** (optional) — defaults to `sum(data.value)`. Only produces a remainder
  tail when strictly greater than the sum. `total <= 0` or non-finite → treated as
  the sum (no tail).
- **Duplicate `name`s** — used as React key + `data-name`; dev-only warn once
  (matches PieChart), behaviour otherwise best-effort.

## Accessibility

- The bar is decorative (`aria-hidden`); the legend is the readable representation
  of the same data, as in PieChart. When the legend is hidden (`legend={false}`),
  add an `aria-label` fallback on the bar summarizing the segments (e.g.
  `"Critical 5, High 3, Medium 2"`) so the data isn't lost to AT. *(Confirm copy
  format during implementation.)*
- Value + delta are plain text, read normally. The delta arrow icon is
  `aria-hidden`; the badge conveys the number textually. Consider an
  `aria-label` like `"up 10"` on the badge.
- Non-interactive in v1 (no hover-sync, no click-to-filter). No focusable elements.

## File plan (`SimpleCharts/HorizontalBar/`)

- `HorizontalBar.tsx` — root component + internal segment/legend/header rendering.
- `classes.ts` — CVA / static class strings.
- `index.ts` — `export { HorizontalBar, type HorizontalBarProps, type HorizontalBarDatum }`.
- `HorizontalBar.stories.tsx` — `title: 'Data display/SimpleCharts/HorizontalBar'`,
  `parameters.design.url` = the Figma node. Stories: `Default`, `NoDelta`,
  `NoValue`, `WithRemainder`, `LegendOff`, `Palette`, `Empty`. Data inline.
- `HorizontalBar.e2e.ts` — `createStoryHelper('data-display-simplecharts-horizontalbar', […])`.
  Screenshots: `Default`, `WithRemainder`, `LegendOff`, `Empty`. A11y: bar
  `aria-hidden`, legend present, `aria-label` fallback when legend off.
  (No Hover/Selected/Focus — component is non-interactive in v1.)
- `HorizontalBar.figma.tsx` — Code Connect binding to node `9667:10883`, mapping
  the `legend` boolean and delta/value where the Figma variant exposes them.
- `../docs/HorizontalBar.md` — living doc (overview, Figma, data model, states,
  edge cases, a11y, open questions), per the family CLAUDE.md.

**Registration:** add `HorizontalBar` exports to `SimpleCharts/index.ts` and the
top-level `packages/design-system/src/index.ts` (alphabetical).

## Open questions / decisions

1. **Delta color** — baked to Figma's w-orange in v1. Trend controls the arrow
   direction only, not color. Revisit if product wants trend-driven red/green.
2. **Remainder token** — exact neutral var for the grey tail confirmed at
   implementation (Figma `azure-84`).
3. **`aria-label` copy** — exact summary string format for the bar/badge decided
   at implementation.
4. **Interactivity** — v1 is display-only. Hover-sync / click-to-filter (the
   PieChart legend pattern) is out of scope; add later if a use case appears.

## Non-goals (YAGNI)

- No compound sub-components / composable legend rows (data-driven by decision).
- No `Progress` reuse.
- No animation in v1 (segments render at final size). Add a width/`starting:`
  transition later only if design asks.
- No tooltips on segments/labels in v1.
