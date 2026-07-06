# Metric

## Overview

`Metric` is the family's compact stat: a headline number with an optional `/ total` denominator, an optional trend delta chip, and an optional caption. It renders the body only — the card frame and "Title" header are composed with `Chart` / `ChartHeader` / `ChartTitle`, like every other member of the family. It is the standalone sibling of `HorizontalBarStack`: the same value/total/delta header (`_metric-item-common` in Figma), without the segmented bar or legend.

Use it when one number is the whole story. When that number breaks into a few named parts shown as one band, use `HorizontalBarStack`; when each part needs its own row, use `BarList`.

## Figma

- Root: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11437-11939

## Data model

- `value` (required, `number`) — the headline number, rendered as `value.toLocaleString('en-US')`.
- `total` (optional, `number`) — a denominator. When set, renders `/{total} total` after the value (e.g. "91 /120 total"), the `/N` in primary text and "total" muted. The same "value out of total" relationship as `HorizontalBarStack`'s `total`.
- `caption` (optional, `ReactNode`) — a freeform secondary line rendered under the value in muted text.
- `delta` (optional, `{ value: number; trend?: 'up' | 'down'; sentiment?: 'positive' | 'negative' | 'neutral' }`) — the shared `ChartDelta` chip. `sentiment` sets the colour (positive → green, negative → w-orange, neutral → slate; default `neutral`) and `trend` sets the arrow (default: the sign of `value`) — the two axes are independent. The absolute value is shown.

## States

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | `value` present | Headline number; delta chip when `delta` is set. |
| With total | `total` set | `/{total} total` denominator after the value. |
| With caption | `caption` set | Muted secondary line under the value. |
| No delta | `delta` undefined | Value only, no chip. |

## Interactions

None — the component is display-only.

## Edge cases & unclear states

- **Delta sentiment vs direction** — colour (`sentiment`) and arrow (`trend`) are independent, so an increase can read as negative (w-orange ↑) and a decrease as positive (green ↓). Shared with `HorizontalBarStack` via the internal `ChartDelta`.
- **`data-testid`** — the value carries `{base}--value` when a `data-testid` is set on the root; no `data-testid` → clean DOM.

## Accessibility notes

- The delta badge is a named image (`role='img'` + `aria-label` like `"up 10"`) — `Badge` renders a generic `<div>`, so without the role the label would not be announced and the trend direction (carried only by the `aria-hidden` arrow icon) would be lost. Numbers use `toLocaleString('en-US')` formatting, matching the visible text.
- Non-interactive: no focusable elements.

## Open questions / known limitations

- The delta chip is the shared internal `ChartDelta`, so `Metric` and `HorizontalBarStack` can't drift on colour/arrow logic. (The value's typography is still duplicated; a shared header is a possible later step.)
- No skeleton in v1 (the value is trivially cheap to render); add a `MetricSkeleton` if a card-load shimmer is needed.
