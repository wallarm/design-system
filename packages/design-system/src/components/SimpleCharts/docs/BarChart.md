# BarChart

## Overview

`BarChart` — *Horizontal stacked bars chart* in Storybook (`Data Display/SimpleCharts/Horizontal Stacked Bars Chart`) — draws a horizontal bar per category (an application, a host, an endpoint), each split by series: "how much, and of what kind, per thing". It is `ColumnChart` turned on its side, for categories that are not a time axis and whose labels are too long to sit under a column. Pick `ColumnChart` when the categories are steps in time, `HorizontalBarStack` for one bar of shares, `BarList` for a top-N of single values.

It is built on the `LineChart` contexts, like `ColumnChart`, so the legend (`LineChartLegend` / `LineChartLegendItem`) and the popover pieces are reused unchanged. The plot slots are its own: the grid, both axes and the tooltip are the column chart's turned 90°.

## Code Connect

None — there is no Figma component yet (see *Open questions*).

## API

```tsx
<Chart>
  <ChartHeader>
    <ChartTitle>Findings by application</ChartTitle>
  </ChartHeader>
  <BarChart data={rows} series={verdicts} yKey='application'>
    <LineChartLegend>
      {verdicts.map(s => (
        <LineChartLegendItem key={s.key} seriesKey={s.key}>
          <LineChartHoverPopoverDot color={s.color} />
          <span className='text-xs font-mono text-text-primary'>{s.label}</span>
          <span className='text-xs font-mono font-medium text-text-primary'>{totals[s.key]}</span>
        </LineChartLegendItem>
      ))}
    </LineChartLegend>
    <BarChartBody>
      <BarChartGrid />
      <BarChartXAxis tickFormatter={formatNumber} />
      <BarChartYAxis />
      <BarChartStack />
      <BarChartTooltip />
    </BarChartBody>
  </BarChart>
</Chart>
```

- `BarChart<T>` — root. `data`, `series`, `yKey` (the category label key), generic over the datum like `LineChart<T>`. Provides the `LineChart` data + active-series contexts (the category key goes into the context's `xKey`); renders `<div data-slot='bar-chart'>`, a vertical flex — JSX order places the legend.
- `BarChartBody` — recharts' `<ResponsiveContainer>` + `<ComposedChart layout='vertical'>`. Height = `data.length × 28px + 16px` (value labels); a fixed `height` opts out. `aria-hidden`.
- `BarChartStack` — every `series` entry as one stacked bar per datum. No props; mount once.
- `BarChartGrid` — dashed vertical lines, one per value tick. No props.
- `BarChartXAxis` — the value axis under the plot: `tickFormatter`, `tickCount`, `ticks`, `domain` (default `[0, 'auto']`). Labels only, no line.
- `BarChartYAxis` — the category axis: `tickFormatter`, `width` (label gutter, default 96px). Solid axis line, one label per bar.
- `BarChartTooltip` — ruler + popover: `categoryFormatter` for the heading, or `children` render-prop (`{ datum, rows, category }`).
- `BarChartEmpty` — the empty / loading frame, composed in place of `BarChart`: `rows` (default 5) or `height`, `labelWidth` (match `BarChartYAxis width`), and an optional message as `children`.

**The legend total is the consumer's**, as in `ColumnChart`.

## Data model

- **`data`** — one datum per bar, **top to bottom in the order given**. No sorting: sort upstream (usually by total, largest first). Each series value is a non-negative count; `null` / `undefined` / `0` draws no part.
- **`series`** — the parts in legend order. **The first series sits on the axis**, the last at the bar's end. `color` drives the part, the legend dot and the popover dot (`ChartColor` token or any CSS colour); default `slate`.
- **`yKey`** — the category label (`string`, or a `number` formatted with `tickFormatter`).

## States

- **Default** — bars over the dashed vertical grid, legend above.
- **Hover a bar** — a dashed ruler through the bar's middle and the popover next to the pointer: the category, then one row per series in legend order (`—` for a missing value).
- **Hover / focus a legend item** — the other series fade to 30%; the hovered parts carry `data-active='true'`.
- **Clickable legend** — pass `onClick` to `LineChartLegendItem` (`role='button'`, Enter / Space). What a click does is the consumer's.
- **Empty / Loading** — compose `BarChartEmpty` in place of `BarChart`: three dashed value lines and the solid category axis, no bars. With a message it is the empty state; bare, under skeleton legend items, it is the loading state. Pass `rows` with the count the loaded chart will have, so the card does not jump when the data arrives.

## Interactions

- Bar hover is driven by the pointer anywhere over the row's band, not only over the drawn parts.
- Legend hover and focus both set the active series; leaving clears it.

## Edge cases & unclear states

- **Row height** — a fixed 28px per category (16px bar + 12px between bars), so the card grows with the data. 16px is the column chart's minimum width; the 12px gap is ours. A fixed `height` on the body squeezes or stretches the rows, but the bar stays 16px.
- **Stacking direction** — the first series on the axis, unlike `ColumnChart` (first series on top). A horizontal bar reads left to right, like the legend, so the order matches the legend's.
- **1px gap between parts** — cut from the *left* of every part that sits after another, so the bar end and the axis stay on their true values.
- **Right radius** — 4px on the whole bar via recharts' `BarStack` clip-path, so it lands on whichever part is outermost.
- **Long labels** — cut with `…` to the gutter (`width − 8px`); the popover heading carries the full label. `breakAll`, so a label without spaces (a hostname) is cut too.
- **Popover position** — next to the pointer, not locked to the plot's middle like `LineChartTooltip`: on a tall chart a locked popover would float rows away from the hovered bar. That is why the chart has its own tooltip slot.
- **Value labels** — `interval='preserveStartEnd'`: on a narrow card recharts drops colliding middle labels. The grid line on 0 is dropped — the solid category axis line owns that rail.

## Accessibility notes

- The plot is `aria-hidden`; the legend is the accessible representation. Clickable legend items are buttons with keyboard activation.
- The popover is `role='tooltip'` + `aria-live='polite'` (`LineChartHoverPopover`).
- Colour is not the only carrier: the legend and popover label every series.

## Open questions / known limitations

- **Not in Figma** — the WADS-Components `simple-chart` set has no horizontal stacked bars type. Everything here mirrors `ColumnChart`; row height, gap and the label gutter need a design pass, and a `Chart.figma.ts` branch once the type exists.
- No click-to-filter, controlled `activeKey`, scrolling for long lists, or negative values.
- **gen-ui** — the `BarChart` catalog entry (`packages/gen-ui/src/components/BarChart.tsx`) has no width prop for the label gutter, so it sizes it from the longest label (about 6px a character, 64–200px). The estimate is not a measurement: a label of wide letters can still be cut.
