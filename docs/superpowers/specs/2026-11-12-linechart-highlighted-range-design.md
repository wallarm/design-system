# LineChart highlighted range — design (WDS-207)

## Intent

Mark a time range on a `LineChart` (an attack spike, an incident window) and show it
against the usual level for the same time. The reader should see at a glance *when* the
anomaly happened and *how far* the series left its normal level.

Figma: WADS-Components, frame "card" `12864:32195` (states A–E). Not linked from code.

## Goals

- A · one range with start/end labels
- B · hover inside the range: popover shows the bucket, actual value and usual level
- C · ongoing range (no end)
- D · several ranges, one clipped by the window start
- E · anatomy with a legend (header 32 + legend 24 + plot 140)

## Non-goals

- Interactive ranges (click, focus, hover state on the range itself). No analytics target.
- Merging overlapping ranges.
- A dashed legend/popover swatch — Figma keeps the square dot for the usual-level series.
- A new bucket-heading formatter (see Popover).
- Changing `LINE_STROKE_WIDTH` (stays 2; Figma's 1.5 is not adopted — consistency with every other chart).

## Anti-goals

- A visible gap or overlap where the line switches colour at a range edge.
- Breaking existing LineChart API or screenshots (additive only, no migration).

## API (decided)

Compound child, rendered inside `LineChartBody` next to `LineChartLine` / `LineChartZoomBrush`:

```tsx
<LineChartBody>
  <LineChartGrid />
  <LineChartXAxis />
  <LineChartYAxis />
  <LineChartRange
    from={spikeStart}          // xKey value, required
    to={spikeEnd}              // optional; omitted = ongoing
    seriesKey='attacks'        // optional; series recoloured inside the range
    startLabel='11:20'         // ReactNode, optional
    endLabel='11:52'           // ReactNode, optional; ongoing default "Ongoing"
    description='Spike 11:20 to 11:52, peak 2,275' // string, optional; screen-reader text
  />
  <LineChartLine seriesKey='attacks' />
  <LineChartLine seriesKey='usual' />
  <LineChartTooltip />
</LineChartBody>
```

`LineChartRangeProps`: `from: number | string`, `to?: number | string`, `seriesKey?: string`,
`startLabel?: ReactNode`, `endLabel?: ReactNode`, `description?: string`.
Exported from the LineChart barrel with its props type. `displayName = 'LineChartRange'`.

Each mounted range registers itself (key, from, to, seriesKey, description) into a new
range registry on the chart root — same register/unregister-on-mount pattern as
`LineChartZoomContext.registerEnabled`. `LineChartLine`, `LineChartTooltip` and the root's
screen-reader list read from that registry. Keep the registry in its own context so range
changes do not invalidate `LineChartDataContext`.

## Rendering

**Geometry (author's call, from builder check).** `LineChartXAxis` defaults to a *category*
axis, so the scale only knows exact data X values and a range edge like `11:52` is usually not
a bucket. Edges are therefore computed from the **data**, not from the scale's domain:
- Numeric X (timestamps, the normal case): find the two neighbouring data points around the
  edge value and **linearly interpolate** their pixel positions (pixel of each datum from
  `useXAxisScale()`). An edge at 11:52 sits 2/5 of the way from the 11:50 to the 11:55 point.
- String X: exact match on a datum value only; an edge that matches no datum makes the range
  invisible (dev warn).
- `from` ≤ first datum X → left edge clamps to the plot's left edge (no start label).
- `to` omitted (ongoing) or `to` ≥ last datum X → right edge clamps to the plot's right edge.
- Range fully outside `[firstX, lastX]` → nothing drawn.
- A pure helper (`lib/rangeGeometry.ts`) takes data X values + a pixel-of-index function and
  returns `{ x1, x2, clampedStart, clampedEnd } | null`; it is the unit-tested core.

**In range (hover).** A datum is inside a range when `from ≤ x ≤ to` (`to` omitted = +∞),
compared on the numeric X value (string X: by index between the matched edges). This is a
value check, independent of pixels.

**Fill.** `var(--color-states-danger-hover)`, full plot height.

**Edges.** 1px vertical lines, `var(--color-border-danger)`, `strokeDasharray='3 3'`, full
plot height. A clamped edge still draws its line on the plot edge (Figma D shows it).

**Layering.** Above the grid, under the lines. Recharts renders children in JSX order within
its z-index layers: `ReferenceArea` sits at zIndex 100, between the grid (-100) and lines
(400) (`DefaultZIndexes`), so JSX order does not matter. Fill + edges use `<ReferenceArea>`
with computed `x1/x2` or a custom shape; labels and edges may be custom SVG in the same layer.

**Overlaps.** Drawn as is (fills stack). Dev-mode `console.warn` via `lib/warn.ts` when two
ranges overlap.

## Labels

- Typography: 10px / 12px line-height, medium, `text-text-danger` (Figma `text/xs/medium`
  binds `Text/2xs`). Top of the plot, 4px from the top.
- Start label: outside the left edge, right-aligned to it, 4px gap.
- End label: outside the right edge, left-aligned to it, 4px gap.
- Ongoing: end label defaults to `"Ongoing"` (overridable via `endLabel`), *inside* the range,
  right-aligned to the plot's right edge.
- When 2+ ranges are visible → no labels at all (Figma D).
- A label that would leave the plot area, or collide with the other label, is hidden. A clamped
  start edge has no start label.
- Labels are SVG `<text>` (they live inside the recharts surface); exact measurement may use
  an estimate or `getComputedTextLength` — builder's call.

## Line inside a range

- The series named by `seriesKey` switches to `var(--color-bg-fill-danger)` inside every range
  that targets it; outside it keeps its own colour.
- Implementation: `LineChartLine` renders its normal `<Line>` plus a second `<Line>` with the
  danger stroke, clipped by an SVG `clipPath` made of the range rectangles. The base line is
  clipped by the inverse (or simply left under — the danger copy fully covers it at the same
  width; builder picks whichever gives no visible seam). The switch must be exact at the edge.
- Ranges without `seriesKey` recolour nothing. A range whose series is filtered out still draws
  its fill and edges.
- The usual-level series is just another series (`variant: 'dashed'`,
  `color: 'var(--color-border-strong-primary)'`) and is never recoloured unless a range names it.

## Popover

- When the hovered datum's X falls inside a range, the row of that range's `seriesKey` uses the
  `red` palette dot (`ChartColor` `'red'`, red-500 — Figma `red/500`). Other rows unchanged.
- Heading: the consumer formats the bucket range (`11:25 – 11:30`) through the existing
  `LineChartTooltip xTickFormatter` — they know the bucket size. No new prop. Stories show this.
- Position rule unchanged (Y locked to plot centre).
- The render-prop `rows` expose `inRange: boolean` — additive field on `LineChartTooltipRow`.
  **Per row (author's call):** true only when a range whose `seriesKey` is this row's series
  contains the hovered datum — exactly mirroring the red dot. Rows of other series (e.g.
  "usual") and ranges with no `seriesKey` never set it.

## Legend

No change: the usual-level series gets a normal `LineChartLegendItem` with the square dot.
State E story shows "Attacks" + "Usual".

## Accessibility

The plot stays `aria-hidden`. The `LineChart` root renders a visually hidden list
(`sr-only` `<ul>`) with one `<li>` per registered range that has a `description`. Nothing is
rendered when no range has one. Wording is the consumer's.
**Author's call:** the list includes every mounted range, visible or not — the registry stores
only the raw props (no pixel/visibility state), so the root never needs recharts geometry. The
consumer decides which ranges to mount. The overlap warning likewise compares raw `from`/`to`.

## Test IDs

`LineChartRange` uses `useTestId('range')` on its group element; labels `range-start-label`
/ `range-end-label`; the sr list `range-descriptions`. Follow `docs/test-id-pattern.md`.

## Deliverables

- `LineChart/LineChartRange.tsx` + registry context, `LineChartLine` / `LineChartTooltip` /
  root changes, barrel exports (local + `SimpleCharts/index.ts` if it lists names).
- Unit tests (Rstest): geometry clamping/visibility helper, label visibility rules, overlap warn,
  registry, tooltip `inRange`, sr list.
- Stories `Highlighted Range` group covering A–E (story names spaced, e.g. `Highlighted Range`,
  `Highlighted Range Hover`, `Ongoing Range`, `Several Ranges`, `Range With Legend`), data in file.
- E2E screenshots for the new stories + a hover interaction; baselines regenerated in CI
  (`[update-screenshots]`), never locally.
- `SimpleCharts/docs/LineChart.md` updated (API, states, edge cases, a11y, open questions).
- Storybook Overview copy for the new stories.

## Left to the builder

Exact label measurement, clip-path ids (use `useId`), whether the base line is inverse-clipped,
internal file split (`lib/` helpers), story data shape.
