# BarChart

## Overview

`BarChart` — *Horizontal stacked bars chart* in Storybook (`Charts/Horizontal Stacked Bars Chart`) — draws a horizontal bar per category (an application, a host, an endpoint), each split by series: "how much, and of what kind, per thing". It reads as a list, like `BarList`: a row per category with its label, a stacked bar and the row total. Use it for categories that are not a time axis and whose labels are too long to sit under a column. Pick `ColumnChart` when the categories are steps in time, `HorizontalBarStack` for one bar of shares, `BarList` for a top-N of single values.

It is built on the `LineChart` contexts, like `ColumnChart`, so the legend (`LineChartLegend` / `LineChartLegendItem`) and the popover pieces are reused unchanged. The plot slots are its own. The row — label, hover, total — follows `BarList`: 12px mono primary text, a 32px row, the hover tint across the whole row.

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
      <BarChartXAxis hide />
      <BarChartYAxis />
      <BarChartStack />
      <BarChartTooltip />
    </BarChartBody>
  </BarChart>
</Chart>
```

- `BarChart<T>` — root. `data`, `series`, `yKey` (the category label key), generic over the datum like `LineChart<T>`. Provides the `LineChart` data + active-series contexts (the category key goes into the context's `xKey`); renders `<div data-slot='bar-chart'>`, a vertical flex — JSX order places the legend.
- `BarChartBody` — recharts' `<ResponsiveContainer>` + `<ComposedChart layout='vertical'>`. Height = `data.length × 32px`; a fixed `height` opts out. `total` places the row total: `'end'` (default) — a column on the right edge, `'start'` — between the label and the bar, `false` — none. Draws the row hover. `aria-hidden`.
- `BarChartStack` — every `series` entry as one stacked bar per datum. No props; mount once.
- `BarChartXAxis` — the value scale. Mount it with `hide`: the row totals carry the values, the scale only sizes the bars. `domain` (default `[0, 'auto']`). Without `hide` it draws value labels under the plot (`tickFormatter`, `tickCount`, `ticks`) and takes their 16px out of the rows.
- `BarChartGrid` — optional dashed vertical lines, one per value tick, for the visible value scale. No props.
- `BarChartYAxis` — the row text: `tickFormatter`, `width` (label column, default 144px), `totalFormatter`. One label per row, left-aligned, and the row total.
- `BarChartTooltip` — the popover over a bar: `categoryFormatter` for the heading, or `children` render-prop (`{ datum, rows, category }`).
- `BarChartEmpty` — the empty / loading frame, composed in place of `BarChart`: `rows` (default 5) or `height`, `labelWidth` (match `BarChartYAxis width`), and an optional message as `children`.

**The legend total is the consumer's**, as in `ColumnChart`.

## Data model

- **`data`** — one datum per bar, **top to bottom in the order given**. No sorting: sort upstream (usually by total, largest first). Each series value is a non-negative count; `null` / `undefined` / `0` draws no part.
- **`series`** — the parts in legend order. **The first series sits on the axis**, the last at the bar's end. `color` drives the part, the legend dot and the popover dot (`ChartColor` token or any CSS colour); default `slate`.
- **`yKey`** — the category label (`string`, or a `number` formatted with `tickFormatter`).

## States

- **Default** — a row per category: label, bar, total. Legend above.
- **Hover a row** — the whole row, edge to edge, gets the `BarList` hover tint (`states-primary-hover`), wherever the pointer is on it.
- **Hover a bar** — the row tint plus the popover: the category, then one row per series in legend order (`—` for a missing value). The popover opens only over the bar's parts, not over the label, the total or the empty track.
- **Hover / focus a legend item** — the other series fade to 30%; the hovered parts carry `data-active='true'`.
- **Clickable legend** — pass `onClick` to `LineChartLegendItem` (`role='button'`, Enter / Space). What a click does is the consumer's.
- **Empty / Loading** — compose `BarChartEmpty` in place of `BarChart`. With a message it is the empty state: the message centred in a frame of the plot's height. Bare, under skeleton legend items, it is the loading state: a skeleton label and bar per row, as in `BarListSkeleton`. Pass `rows` with the count the loaded chart will have, so the card does not jump when the data arrives.

## Interactions

- Row hover is driven by the pointer anywhere over the row; the popover only by the drawn parts of the bar.
- Legend hover and focus both set the active series; leaving clears it.

## Edge cases & unclear states

- **Row height** — a fixed 32px per category, the `BarList` row, with a 16px bar in the middle, so the card grows with the data. A fixed `height` on the body squeezes or stretches the rows, but the bar stays 16px.
- **Stacking direction** — the first series on the left, unlike `ColumnChart` (first series on top). A horizontal bar reads left to right, like the legend, so the order matches the legend's.
- **1px gap between parts** — cut from the *left* of every part that sits after another, so both ends of the bar stay on their true values.
- **Radius** — 4px on all corners of the whole bar via recharts' `BarStack` clip-path, so it lands on whichever parts are outermost.
- **Long labels** — cut with `…` to the label column (`width − 12px`); the popover heading carries the full label. `breakAll`, so a label without spaces (a hostname) is cut too.
- **Popover position** — next to the hovered part, not locked to the plot's middle like `LineChartTooltip`: on a tall chart a locked popover would float rows away from the hovered bar. That is why the chart has its own tooltip slot.
- **Row total** — the sum of the row's series values, formatted with `totalFormatter` (default: the full number). With `total='start'` its 56px column sits between the label and the bar; with `total={false}` the bar runs to the row's right inset.
- **Visible value scale** — `BarChartXAxis` without `hide` (and `BarChartGrid`) still works, but its labels take 16px out of the plot, so rows get slightly shorter than 32px; pass a `height` to make up for it.

## Accessibility notes

- The plot is `aria-hidden`; the legend is the accessible representation. Clickable legend items are buttons with keyboard activation.
- The popover is `role='tooltip'` + `aria-live='polite'` (`LineChartHoverPopover`).
- Colour is not the only carrier: the legend and popover label every series.

## Open questions / known limitations

- **Not in Figma** — the WADS-Components `simple-chart` set has no horizontal stacked bars type. The row follows `BarList` (text, row height, hover); the 16px bar, the 144px label column and the total column are set in code and need a Figma component, then a `Chart.figma.ts` branch.
- No row click or selected state (`BarList` has both), no click-to-filter, controlled `activeKey`, scrolling for long lists, or negative values.
- **gen-ui** — the `BarChart` catalog entry (`packages/gen-ui/src/components/BarChart.tsx`) has no width prop for the label gutter, so it sizes it from the longest label (7.2px a character at 12px mono, 96–240px). The estimate is not a measurement: a label of wide letters can still be cut.
