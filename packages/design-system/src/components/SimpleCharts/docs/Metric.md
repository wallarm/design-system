# Metric

## Overview

`Metric` is the family’s compact stat, built as a compound "brick set". It renders the body
only — the card frame and "Title" header are composed with `Chart` / `ChartHeader` /
`ChartTitle`, like every member of the family. It is the standalone sibling of
`HorizontalBarStack`: the same value/total/delta header (Figma `_metric-item-common`), without
the segmented bar or legend.

Add `MetricSparkline` after it to show how that number moved over the period (Figma
`Type=Metric and sparkline`) — a 48px line + area along the card's bottom edge.

Use it when one number is the whole story. When that number breaks into a few named parts shown
as one band, use `HorizontalBarStack`; when each part needs its own row, use `BarList`.

## Figma

- Root: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11437-11939
- Options (brick set): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11520-4054
- Loading states board: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11580-9211
- Sparkline — docs: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12610-10640
- Sparkline — colour variants: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12610-10644
- Sparkline — component (`Type=Metric and sparkline`): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12610-10548

## Composition

```tsx
<Chart>
  <ChartHeader><ChartTitle>Findings</ChartTitle></ChartHeader>
  <Metric>
    <MetricHeader>
      <MetricValue>91</MetricValue>
      <MetricTotal connector="of">120</MetricTotal>
      <MetricDelta value={10} trend="up" sentiment="negative" />
    </MetricHeader>
    <MetricCaption>blocked today</MetricCaption>
  </Metric>
  {/* optional — the trend over the period */}
  <MetricSparkline data={points} color="negative" label="Findings" />
</Chart>
```

| Brick | Role |
| --- | --- |
| `Metric` | Root: column layout + `TestIdProvider`. `data-slot="metric"`. |
| `MetricHeader` | Baseline row holding value + total + delta. Exported so `HorizontalBarStack` reuses the exact same header. |
| `MetricValue` | The headline number. A numeric child is formatted with `toLocaleString('en-US')`; any other node renders as-is. Display font, 30px. |
| `MetricTotal` | The denominator. `connector` = `slash` (`/120`, default) · `of` (`of 120`) · `total` (`120 total`). Numeric child locale-formatted; number in primary text, connector word muted. |
| `MetricDelta` | Trend chip — a thin wrapper over the shared `ChartDelta`. `sentiment` sets the colour (positive → green, **negative → red**, neutral → slate; default neutral) independently of the `trend` arrow. |
| `MetricCaption` | Muted secondary subline under the header. |
| `MetricSparkline` | The trend under the metric. A **sibling after `Metric`** inside `Chart`, not a child: the metric's bottom `py-8` is the Figma 8px gap, `mt-auto` pins the sparkline to the card's bottom edge, `px-px` is the 1px inset from the border. |

All bricks are optional; only `MetricValue` is expected in practice.

## Data model

- `MetricValue` / `MetricTotal` children: `number` (locale-formatted) or any `ReactNode`.
- `MetricTotal.connector`: `'slash' | 'of' | 'total'`, default `'slash'`.
- `MetricDelta`: `{ value: number; trend?: 'up' | 'down'; sentiment?: 'positive' | 'negative' | 'neutral' }` — the shared `ChartDelta`.
- `MetricSparkline`:
  - `data: { x: Date | number | string; value: number }[]` — oldest first, evenly spaced (points are
    placed by index, not by time).
  - `color`: `'brand'` (default) · `'positive'` · `'negative'` · `'neutral'` — line tokens
    `bg/fill/brand` · `bg/fill/success` · `bg/fill/danger` · `border/strong/primary`. The area is the
    same token as a vertical gradient 20% → 0%; neutral's area uses `bg/strong/primary`.
  - `label` — series name on the popover row; `formatX(x)` / `formatValue(value: number)` override
    the popover text.

## States

`Metric` itself is display-only. The visual variety comes from which bricks are composed
(value only, + delta, + total in each connector form, + caption). The `Gallery` story covers the
combinations.

**Loading** — swap `Metric` for `MetricSkeleton` inside the `Chart` card (the `Loading` story).
It renders a value-sized block (72×36) plus a thin caption line on the DS `Skeleton` shimmer,
sized to the loaded layout so the card doesn't jump; announces `aria-busy` / `aria-live`.

**Sparkline** — `Sparkline` / `SparklineColors` stories. Empty `data` keeps the 48px box with
nothing drawn, so the card doesn't jump while data loads.

## Interactions

`Metric` has none. `MetricSparkline` on pointer move snaps to the **nearest point by index** and
shows a dashed ruler (the LineChart cursor: `border/strong/primary`, `4 2`) plus the LineChart hover
popover — date and the value row. Pointer leave hides both. No click, no selection, no keyboard.

## Edge cases & unclear states

- **Delta sentiment vs direction** — colour (`sentiment`) and arrow (`trend`) are independent, so an
  increase can read as negative (red ↑) and a decrease as positive (green ↓). Shared with
  `HorizontalBarStack` via the internal `ChartDelta`.
- **`total` means different things across the family** — here it is the *text* denominator
  (`MetricTotal`). On `HorizontalBarStack`, `total` is the *bar* denominator (the grey remainder
  tail) and is never shown as text.
- **`data-testid`** — slot ids derive from the root (`metric--header`, `--value`, `--total`,
  `--delta`, `--caption`); no root `data-testid` → clean DOM. `MetricSparkline` sits outside
  `Metric`, so it derives `--sparkline` from the surrounding provider (`Chart`) or takes its own
  `data-testid`; its popover is `{sparkline id}--popover`.
- **Card height is `Chart`'s, on purpose** — the Figma `Metric and sparkline` card is 140px, ours
  keeps `Chart`'s `min-h-196` like the other cards (only the column chart card goes lower, to 128px); the sparkline stays pinned to the bottom
  and the extra height sits above it.
- **Sparkline colour vs delta sentiment** — independent props, like `sentiment` vs `trend`: set both.
- **Sparkline Y domain is the data's own min..max**, mapped to 4px…40px of the 48px plot (top
  headroom for the stroke, bottom room so the area reads under the lowest point). A constant series
  or a single point draws a flat midline. It shows shape, not magnitude — don't read it against zero.
- **Plain SVG, no recharts** — `viewBox` is one unit per step × 48px with
  `preserveAspectRatio='none'`, and the line uses `vector-effect: non-scaling-stroke`, so it stretches
  to any card width at a constant 1.5px without measuring the container.
- **The popover is portalled to `document.body`** (`position: fixed`, `--tooltip-z-index`): the
  48px plot is shorter than the popover and `Chart` clips its overflow. It opens 8px right of the
  ruler and 14px below the plot top, flipping to the left on the right half of the plot. Any scroll or
  resize ends the hover — a fixed popover can't follow the card. If `data` shrinks under a held
  pointer, a point that no longer exists is dropped (no ruler, no popover) until the next move.
- **Dates** — the default popover date is `formatChartDate(x, { withYear: true })` (`1 Jan, 2026`,
  order from `DateFormatProvider`) for a `Date`, a timestamp, or an ISO string; any other string is
  shown as written. The check is a `YYYY-MM-DD` prefix, not `Date.parse`, which V8 lets read labels
  like `"Week 1"` as 1 Jan 2001. A date-only ISO string (`'2026-01-05'`) is that local day — the
  shared `toDate` reads it as local midnight, not UTC (west of UTC it used to show the day before).
- **A non-finite value** (`NaN`, `Infinity`) leaves a gap in the line and area; its popover value
  reads `—`. The Y domain ignores it.

## Accessibility notes

- The delta badge is a named image (`role='img'` + `aria-label` like `"up 10"`) — `Badge` renders a
  generic `<div>`, so without the role the label would not be announced and the trend direction
  (carried only by the `aria-hidden` arrow icon) would be lost. Numbers use `toLocaleString('en-US')`.
- Non-interactive: no focusable elements.
- The sparkline plot is `aria-hidden` (like `LineChartBody`): the trend is a visual summary of the
  number already announced by `MetricValue` / `MetricDelta`. The hover popover is `role='tooltip'`
  with `aria-live='polite'`. Pass `aria-label` / `role='img'` on `MetricSparkline` to name the trend
  when it carries information the metric doesn't.

## Open questions / known limitations

- Sparkline points are spaced by index; uneven time gaps are not drawn to scale.
- Caption is the subline below the header. An inline-right caption placement (if the design ever
  needs one) is not implemented.
