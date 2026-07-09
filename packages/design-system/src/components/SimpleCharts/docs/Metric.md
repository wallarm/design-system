# Metric

## Overview

`Metric` is the family’s compact stat, built as a compound "brick set". It renders the body
only — the card frame and "Title" header are composed with `Chart` / `ChartHeader` /
`ChartTitle`, like every member of the family. It is the standalone sibling of
`HorizontalBarStack`: the same value/total/delta header (Figma `_metric-item-common`), without
the segmented bar or legend.

Use it when one number is the whole story. When that number breaks into a few named parts shown
as one band, use `HorizontalBarStack`; when each part needs its own row, use `BarList`.

## Figma

- Root: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11437-11939
- Options (brick set): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11520-4054
- Loading states board: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11580-9211

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

All bricks are optional; only `MetricValue` is expected in practice.

## Data model

- `MetricValue` / `MetricTotal` children: `number` (locale-formatted) or any `ReactNode`.
- `MetricTotal.connector`: `'slash' | 'of' | 'total'`, default `'slash'`.
- `MetricDelta`: `{ value: number; trend?: 'up' | 'down'; sentiment?: 'positive' | 'negative' | 'neutral' }` — the shared `ChartDelta`.

## States

Display-only; no interactive states. The visual variety comes from which bricks are composed
(value only, + delta, + total in each connector form, + caption). The `Gallery` story covers the
combinations.

**Loading** — swap `Metric` for `MetricSkeleton` inside the `Chart` card (the `Loading` story).
It renders a value-sized block (72×36) plus a thin caption line on the DS `Skeleton` shimmer,
sized to the loaded layout so the card doesn't jump; announces `aria-busy` / `aria-live`.

## Interactions

None — the component is display-only.

## Edge cases & unclear states

- **Delta sentiment vs direction** — colour (`sentiment`) and arrow (`trend`) are independent, so an
  increase can read as negative (red ↑) and a decrease as positive (green ↓). Shared with
  `HorizontalBarStack` via the internal `ChartDelta`.
- **`total` means different things across the family** — here it is the *text* denominator
  (`MetricTotal`). On `HorizontalBarStack`, `total` is the *bar* denominator (the grey remainder
  tail) and is never shown as text.
- **`data-testid`** — slot ids derive from the root (`metric--header`, `--value`, `--total`,
  `--delta`, `--caption`); no root `data-testid` → clean DOM.

## Accessibility notes

- The delta badge is a named image (`role='img'` + `aria-label` like `"up 10"`) — `Badge` renders a
  generic `<div>`, so without the role the label would not be announced and the trend direction
  (carried only by the `aria-hidden` arrow icon) would be lost. Numbers use `toLocaleString('en-US')`.
- Non-interactive: no focusable elements.

## Open questions / known limitations

- Caption is the subline below the header. An inline-right caption placement (if the design ever
  needs one) is not implemented.
