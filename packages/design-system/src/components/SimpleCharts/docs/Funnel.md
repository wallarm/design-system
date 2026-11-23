# Funnel

## Overview

`Funnel` is a horizontal step funnel: how a count narrows from stage to stage, left to right.
It renders the body only — the card frame and title are composed with `Chart` / `ChartHeader` /
`ChartTitle`, like every member of the family.

Use it when the story is "how many made it to the next stage" across 2 to 6 ordered stages.
When the parts are unordered shares of one total, use `HorizontalBarStack` or `PieChart`; when
they are a ranking, use `BarList`.

## Composition

```tsx
<Chart>
  <ChartHeader><ChartTitle>False positives</ChartTitle></ChartHeader>
  <Funnel color="blue">
    <FunnelStep name="Detected" value={1284} caption="Last 7 days" onClick={openDetected} />
    <FunnelStep name="Reviewed" value={312} delta={<MetricDelta value={24} sentiment="positive" />} />
    <FunnelStep name="Marked false" value={96} />
  </Funnel>
</Chart>
```

| Part | Role |
| --- | --- |
| `Funnel` | Root: row layout, `role="list"`, `TestIdProvider`. Owns `color` and `start`, and works out every step's ribbon thickness and fill. `data-slot="funnel"`. |
| `FunnelStep` | One stage: the title cell (name, value, optional delta and caption) plus its slice of the ribbon. |
| `FunnelSkeleton` | Loading frame: step dividers only, at the funnel's height. `steps` sets the column count (default 3). |

## Data model

- `FunnelStep` takes `name`, `value` (a number ≥ 0), and optional `caption`, `delta`, `onClick`.
- Steps render left to right in the order given. Nothing is sorted or aggregated.
- 2 to 6 steps. One step, or more than six, still draws but logs a dev warning; steps past the
  sixth stay on the darkest shade of the ramp.
- Steps must be **direct children** of `Funnel`. The root reads each child's `value` to scale the
  ribbon, so a step wrapped in a fragment or another component is not counted correctly.
- `Funnel` props: `color` (a `ChartColor`, default `blue`) and `start` (`tint` default, `gray`).

### Layout

- Steps share the width equally and are at least 120px each, so the chart is never narrower than
  240px. The product sizes the card for the step count (3 steps fit the 465px card; 5–6 need a
  wider one). There is no horizontal scroll — a too-narrow card clips.
- Title row 100px, ribbon band 172px, 16px bottom gap: 288px in total under the 32px card header.
- Dividers are 1px `border-primary-light`, drawn over the ribbon from the top of the title row to
  the bottom of the card.

### Ribbon geometry

- Body thickness = `value / largest value × 140`, centered in the 172px band.
- Minimum thickness 1px (a hairline), so `1000 → 100 → 1` still shows the last step.
- Each column runs from its own thickness at the left edge to the next step's thickness at the
  right edge, on a cubic curve with flat tangents (control points at 45% and 55% of the width).
  The last column is flat.
- Halos: two copies of the body grown by 6px and 12px on top and bottom, in the step color at 32%
  and 16% opacity, under the body.

### Color

- The hue is not semantic. Blue, red, green, amber and purple are the everyday set; brand, teal,
  cyan, indigo, pink and rose are for rare cases.
- No funnel tokens: fills are the palette primitives (`--color-{hue}-{shade}`). This intentionally
  differs from `CHART_PALETTE_FILL` (every hue on 500) — the funnel is a ramp anchored on 600.
- `start="tint"`: one palette step per stage, light to dark.

  | Steps | Shades |
  | --- | --- |
  | 2 | 500 · 600 |
  | 3 | 400 · 500 · 600 |
  | 4 | 400 · 500 · 600 · 700 |
  | 5 | 300 · 400 · 500 · 600 · 700 |
  | 6 | 200 · 300 · 400 · 500 · 600 · 700 |

- `start="gray"`: the first step in slate-300, every other step in the hue at 600.
- Dark theme: every shade flips to 1000 minus it (600 → 400, 200 → 800, slate-300 → slate-700).
- The ramp table lives in `Funnel/constants.ts`; the fill classes for both themes in `Funnel/classes.ts`.

## States

| State | Trigger | What renders |
| --- | --- | --- |
| Default | Steps without `onClick` | Plain title cells, no hover, no focus stop. |
| Hover | Pointer over the title cell of a step with `onClick` | Soft tint behind the cell (`bg-states-primary-hover`, radius 10, inset 6px left and right, 2px top and bottom) and a pointer cursor. |
| Focus | Keyboard focus on a step with `onClick` | The same tint plus the inset `ring-focus-primary` ring. |
| Loading | Render `FunnelSkeleton` instead of `Funnel` | An empty plot with only the step dividers. |
| Empty | `Funnel` with no steps | `ChartEmpty` ("No data") at the funnel's height. |
| Error | — | No chart-level error state, same as the rest of SimpleCharts. |

There is no selected state.

## Interactions

- A step with `onClick` renders its title cell as a `<button>`; click, Enter or Space runs the
  action. The funnel keeps no state of its own.
- The ribbon is never interactive.
- Values from 1,000 up are rounded and abbreviated (`1.3k`, `59.6M`). There is no underline and
  no tooltip with the full figure — a metric shows the rounded number and that is it.

## Edge cases & unclear states

- **Steps do not have to shrink.** A later step can be bigger (it may count another unit, e.g.
  rules after groups); the ribbon widens into it the same way.
- **Zero** draws the same 1px line as the minimum, and its label says 0. Negative and non-finite
  values draw the 1px line too.
- **All zeros**: every step is the 1px line.
- **Long content**: the name is one line with an ellipsis, the caption two lines, the value shows
  what fits. A delta never shrinks; the value gives way first.
- **The value is not rendered with the `FormatNumber` component.** `FormatNumber` hardcodes
  `text/sm` and adds the dashed underline and tooltip; the funnel value is `heading/xl/medium`
  and plain. The step uses the same `abbreviateNumber` helper, so the rounding matches.
- **Dark theme is plain CSS, not `useTheme`.** Every fill class carries its dark counterpart
  behind a `[data-theme=dark]` selector, so the funnel works without a `ThemeProvider` and
  follows a themed wrapper as well as the page theme.
- **The fill classes are written out in full** (`funnelFillClasses`), not built from the hue
  name at runtime. Tailwind only ships the palette variables it sees used as utilities, so a
  runtime `var(--color-cyan-600)` resolves to nothing and the step paints black.
- **The fill sits on a `<g>` inside the ribbon `<svg>`**, not on the `<svg>`: the global
  `svg:not([fill])` reset is unlayered and would override a utility class there.
- **Faint steps**: shades 200 and 300 are 1.2–1.9:1 on the white card. The labels carry the
  order, not the color.

## Accessibility notes

- The root is a `list`, each step a `listitem`, so the order is announced.
- The ribbon is `aria-hidden`; the title cells carry name, value, delta and caption.
- Steps with an action are real buttons in the tab order; steps without one are not focusable.

## Analytics

Native props on `FunnelStep` (`data-*`, `aria-*`, `id`, `ref`, handlers) land on the title cell —
the button when the step has an action. A consumer `data-testid` wins over the cascaded
`{base}--step`. There are no analytics-specific props and no closed targets.

## Open questions / known limitations

- **Code Connect is not mapped yet.** The Figma `funnel-section-title` variants are still named
  `Type=Default` / `Type2`; they become `State=Default` / `Hover` first.
