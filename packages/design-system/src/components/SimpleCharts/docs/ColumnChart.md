# ColumnChart

## Overview

`ColumnChart` — *Vertical stacked columns chart* in Figma and Storybook (`Data Display/SimpleCharts/Vertical Stacked Columns Chart`) — draws vertical stacked columns: a column per step (a day, an hour), each split by category — the Agentic Overview's *Findings by verdict* and *Remediations by status*. It answers "how much, and of what kind, per step". Pick `HorizontalBarStack` for one bar of shares (no time axis), `AreaChart` when the steps are dense enough to read as a trend, `BarList` for a top-N.

It is built on the `LineChart` contexts — the same `data` / `series` / `xKey` model — so the legend, grid, Y axis and hover popover are the `LineChart` slots, unchanged. It adds only what columns need: its own root, body, the stack, and an X axis that centres every label under its column.

## Figma

- Component: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12612-31838
- Documentation (states, hover, fade, widths): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12610-10640
- Code Connect: the `Type=Vertical stacked columns` branch of `Chart/Chart.figma.ts`.

## API

```tsx
<Chart>
  <ChartHeader>
    <ChartTitle>Findings by verdict</ChartTitle>
  </ChartHeader>
  <ColumnChart data={rows} series={verdicts} xKey='timestamp'>
    <LineChartLegend>
      {verdicts.map(s => (
        <LineChartLegendItem key={s.key} seriesKey={s.key}>
          <LineChartHoverPopoverDot color={s.color} />
          <span className='text-xs font-mono text-text-primary'>{s.label}</span>
          <span className='text-xs font-mono font-medium text-text-primary'>{totals[s.key]}</span>
        </LineChartLegendItem>
      ))}
    </LineChartLegend>
    <ColumnChartBody>
      <LineChartGrid />
      <ColumnChartXAxis tickFormatter={formatDate} />
      <LineChartYAxis />
      <ColumnChartStack />
      <LineChartTooltip xTickFormatter={formatDateWithTimezone} />
    </ColumnChartBody>
  </ColumnChart>
</Chart>
```

- `ColumnChart<T>` — root. `data`, `series`, `xKey`, generic over the datum like `LineChart<T>`. Provides the `LineChart` data + active-series contexts; renders `<div data-slot='column-chart'>`, a vertical flex — JSX order places the legend.
- `ColumnChartBody` — recharts' `<ResponsiveContainer>` + `<ComposedChart>`. Without `height` the plot starts at 164px (Figma card 220 = header 32 + legend 24 + plot 164) and follows the card: give `<Chart>` a height and the plot stretches or shrinks with it. A fixed `height` opts out. `aria-hidden`.
- `ColumnChartStack` — every `series` entry as one stacked column per datum. No props; mount once.
- `ColumnChartXAxis` — `tickFormatter`, `interval` (default `'preserveStartEnd'`), `minTickGap`. Labels centred under their columns.
- Reused unchanged: `LineChartLegend` / `LineChartLegendItem` (legend + hover fade), `LineChartGrid`, `LineChartYAxis`, `LineChartTooltip` (ruler + popover), `LineChartHoverPopoverDot`, `LineChartEmpty` (empty / loading frame).

**The legend total is the consumer's** — sum the series over `data` (or take it from the API) and render it as the item's last child. The chart does not compute it, so a total can also cover a longer period than the columns show.

## Data model

- **`data`** — one datum per column, sorted ascending by `xKey` (a dev warning fires on the first inversion, as in `LineChart`). Each series value is a non-negative count; `null` / `undefined` / `0` draws no part.
- **`series`** — the categories in legend order. **The first series stacks on top**, the last sits on the axis. `color` drives the part, the legend dot and the popover dot alike (`ChartColor` token or any CSS colour); default `slate`.
- **`xKey`** — the step value: a timestamp (`number`) or a label (`string`).

No sorting, aggregation or bucketing happens inside — one datum is one column.

## States

- **Default** — columns over the dashed grid, legend above.
- **Hover a column** — a dashed ruler at the column's horizontal centre and the popover: the formatted `xKey` value, then one row per series in legend order (`—` for a missing value). The popover's Y is locked to the plot's middle, as in `LineChart`.
- **Hover / focus a legend item** — the other categories fade to 30% (`LINE_INACTIVE_OPACITY`); the item gets the hover background. The hovered parts carry `data-active='true'`.
- **Clickable legend** — pass `onClick` to `LineChartLegendItem`: it becomes `role='button'`, tabbable, Enter / Space click. What a click does is the consumer's (the Agentic Overview opens the verdict's list); the chart has no filter state.
- **Empty / Loading** — no chart-specific frame: compose `LineChartEmpty` (with a message, or bare under skeleton legend items) in place of `ColumnChart`, as the stories do.

- **Card height** — the card is 220px by default and goes down to 128px (Figma, WDS-194): `<Chart>` lowers its 196px floor to 128px when it holds a `column-chart`. At 128px the plot keeps 70px (grid 54 + labels 16) with a one-line legend; a legend that wraps takes its second line from the plot.

## Interactions

- Column hover comes from recharts' tooltip, driven by the pointer anywhere over the step's band — not only over the drawn parts.
- Legend hover and focus both set the active series; leaving clears it. Moving between legend items does not flicker (`isHoverSyncTarget`).

## Edge cases & unclear states

- **Filling the card** — the body is a `flex-1` item with a 164px basis and the recharts container is absolutely positioned over it. A `100%` container height does not resolve inside the content-sized flex column, and a fixed one cannot follow the card.
- **Column width** — `resolveColumnWidth(band)`, `band = plot width / data.length`: the band minus a fixed 22px gap, clamped to 16–32px, rounded to whole pixels, and always at least 1px under the step — recharts ignores a `barSize` that fills the band and draws 90% of it. The 22px is measured from Figma (7 steps on a 54px band → 32px, 9 steps on 42px → "20px adjusted width"); it is not a token. The width is computed from `usePlotArea()`, so the first frame — before recharts measures — uses recharts' default width.
- **1px gap between parts** — cut from the *bottom* of every part that sits on another, so the column top and the baseline stay on their true values. A part under ~1px tall disappears into the gap.
- **Top radius** — 4px on the whole column via recharts' `BarStack` clip-path, so it lands on whichever part is topmost for that column, including when the upper categories are 0.
- **Why `ComposedChart`** — recharts picks the tooltip cursor by chart type: a band-wide rectangle for `BarChart`, a line for everything else. The ruler is a line, and `ComposedChart` keeps the bars on a band scale, so the `LineChartTooltip` cursor sits on the column centre.
- **X labels** — a 16px label band (Figma), not recharts' default 30px, so the plot keeps its 148px. `tickSize={0}`: recharts offsets a label by the tick line's length even with `tickLine={false}`, and those 6px pushed the label onto the card border; without them the label keeps Figma's 4px below. Every label is centred under its column (unlike `LineChartXAxis`, which anchors the edge labels to the plot edges). With many steps recharts drops colliding middle labels; `interval={0}` forces all of them.

## Accessibility notes

- The plot is `aria-hidden`; the legend is the accessible representation. Clickable legend items are buttons with keyboard activation.
- The popover is `role='tooltip'` + `aria-live='polite'` (`ChartHoverCard` via `LineChartHoverPopover`).
- Colour is not the only carrier: the legend and popover label every category.

## Open questions / known limitations

- **Under 16px per step** (Figma: "to define") — the column keeps 16px while the step is wider than 16px, then shrinks to leave about 1px between columns. No grouping or scrolling yet.
- No legend click-to-filter, controlled `activeKey`, `syncId` or zoom — the `LineChart` root has them; add them here when a screen needs them.
- Negative values are not supported (the gap logic assumes parts stack upward from 0).
