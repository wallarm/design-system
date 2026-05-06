# LineChart

## Overview

`LineChart` is a composable time-series chart for `SimpleCharts` cards — request volume, error rate, latency, anything where the X axis reads left-to-right and the Y axis is a continuous number. The SVG is drawn by [`recharts@3.8`](https://recharts.org/); we own the visual tokens, the popover surfaces, the legend layout, the empty/loading frames, and the cross-component sync (hover ↔ legend ↔ lines ↔ tooltip ↔ zoom).

The root takes `data` and `series` as two flat arrays — `data` is one row per X position with denormalised series values, `series` is the schema. Axes, grid, lines, tooltip, legend, and zoom brush are all opt-in slots, so a 200×196 sparkline is the same component as a fully-instrumented dashboard panel — only the children differ.

Use it whenever a chart needs the same card frame as `BarList` / `PieChart` but the data is a trend (or any ordered X axis). Pick `BarList` for top-N comparisons and `PieChart` for share-of-total.

## Figma

- Root anatomy: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7533-3334&m=dev
- Single-line + multi-line: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7533-3335&m=dev
- Default states: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-123142&m=dev
- Hover + zoom popovers: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7527-32438&m=dev
- Filtered (legend toggling): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7509-2354&m=dev
- Loading skeleton: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7519-2591&m=dev
- Empty state: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8670-2594&m=dev

## API

Compound component. There is no single "render everything" prop — callers pick the slots they need.

### Compositional groups (at a glance)

Nineteen named exports collapse into five compositional groups. Each group is independent — pick the slots from the groups you need; ignore the rest.

| Group              | Members                                                                                                                            | Purpose                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Root + body**    | `LineChart`, `LineChartBody`                                                                                                       | Provides the chart context + renders the recharts container.    |
| **Plot**           | `LineChartGrid`, `LineChartXAxis`, `LineChartYAxis`, `LineChartLine`                                                               | Direct children of `<LineChartBody>` — the SVG geometry.        |
| **HoverPopover.*** | `LineChartTooltip`, `LineChartHoverPopover`, `LineChartHoverPopoverTimestamp`, `LineChartHoverPopoverRow`, `LineChartHoverPopoverDot` | Cursor-driven popover that reads `{ rows, xValue }` from the tooltip render-prop. |
| **ZoomPopover.***  | `LineChartZoomBrush`, `LineChartZoomPopover`, `LineChartZoomPopoverRange`, `LineChartZoomPopoverConfirm`                            | Drag-to-zoom brush + the two-phase confirm popover.             |
| **Legend**         | `LineChartLegend`, `LineChartLegendItem`                                                                                           | Accessible series legend; participates in hover sync.           |
| **Frame states**   | `LineChartEmpty`                                                                                                                   | Static dashed-grid frame for empty-data and loading states.     |

The flat-named exports stay the canonical form — the table above is just for quick discovery.

### Root + body

- `LineChart<T extends LineChartDatum = LineChartDatum>` — root. Owns `data`, `series`, `xKey`, the controlled series highlight (`activeKey`), the controlled filter (`filteredKeys`), the zoom event (`onZoomChange`), and cross-chart sync (`syncId`, `syncMethod`). **Generic over the datum shape**: pass a concrete `T` to turn `xKey` and `series[].key` into compile-time-checked `keyof T` unions (`<LineChart<RequestRow> data={rows} xKey='timestamp' />`). Leaving the default `LineChartDatum` keeps the loose untyped form. Provides four contexts to its children (data, active key, selection, zoom). The root renders a vertical-flex `<div data-slot='line-chart'>`; **legend placement is structural, not configured** — see the *Layout* section below.
- `LineChartBody` — wraps recharts' `<ResponsiveContainer>` + `<LineChart>` and passes children through so they can self-register as recharts primitives. Default height is `LINE_CARD_HEIGHT - LINE_HEADER_HEIGHT` (164px) — override with `height`. `aria-hidden='true'` (the legend is the canonical accessible representation).

### Plot primitives (children of `LineChartBody`)

- `LineChartLine` — one per series. Required `seriesKey` joins to `LineChartSeries.key`. Per-line `curve` (`'monotone'` default, `'linear'`), `disableAnimation`, `connectNulls`, `strokeWidth`, and `onClick`/`onMouseEnter`/`onMouseLeave`. Returns the bare recharts `<Line>` (no wrapper element) so recharts can hoist it into its layout.
- `LineChartGrid` — wraps `<CartesianGrid>` with the dashed horizontal grid (`stroke='var(--color-border-primary-light)'`, `strokeDasharray='4 4'`). Drops the topmost grid line when it would visually crowd the chart's top edge (Figma "no top x-line") and unconditionally drops the bottommost line (the X-axis line owns the bottom rail). Escape hatches: `keepTopLine`, `keepBottomLine`. Opt into vertical grid via `vertical`.
- `LineChartXAxis` — wraps `<XAxis>`. Reads `xKey` from context. Defaults: `tickLine={false}`, solid `axisLine` (the bottom rail of the plot), 10px sans secondary tick labels. Curated tick-spacing preset via `density: 'sparse' | 'normal' | 'dense'` (maps to `minTickGap` 64/32/16). Advanced escape-hatch props (`tickFormatter`, `interval`, `tickCount`, `ticks`, `minTickGap`, `domain`, `padding`, `type`) forward to recharts when no preset fits. `hideTicks` keeps the layout reservation but skips labels. `axisLine={false}` for sparkline-style plots — pair with `<LineChartGrid keepBottomLine />` so the bottom rail does not vanish.
- `LineChartYAxis` — wraps `<YAxis>`. Default `width={LINE_Y_LABEL_WIDTH}` (38px, the Figma-mandated gutter). Defaults: `tickLine={false}`, `axisLine={false}`, the topmost tick label is skipped so no value sits flush against the chart's top edge. `interval={0}` disables recharts' built-in collision filter — combined with the top-tick skip, it gives a deterministic four-tick axis.
- `LineChartTooltip` — wraps `<Tooltip>`. Renders the default `<LineChartHoverPopover>` body or accepts a render-prop child receiving `{ datum, rows, xValue }`. `rows` is the visible series pre-joined with each row's value at the active index — `rows.map(({ series, value }) => …)` is the canonical iteration pattern. **The popover Y is locked to the plot's vertical centre** (via recharts' `usePlotArea` + a `-translate-y-1/2` wrapper) so the popover does not jump between peaks and valleys; the dashed cursor guideline still tracks the cursor X. `xTickFormatter` formats the default timestamp slot.
- `LineChartZoomBrush` — enables drag-to-zoom on the plot. Mount once anywhere inside `<LineChartBody>`. `disabled` removes the interaction; `formatRange(range)` overrides the popover range text; `confirmLabel` overrides the button copy; `container` overrides the portal target (defaults to `document.body` — pass a dialog node when the chart lives inside a focus-trapped modal). See the *Interactions* section for the full two-phase lifecycle.

### Hover popover slots

Compose these inside the `LineChartTooltip` render-prop, or use the default body.

- `LineChartHoverPopover` — the popover surface. `role='tooltip'`, `aria-live='polite'`, `bg-bg-surface-2`, `rounded-12`, `shadow-md`, `min-w-160`.
- `LineChartHoverPopoverTimestamp` — sans heading (`text-xs font-medium`, primary text). The top row of the default body.
- `LineChartHoverPopoverRow` — `<dot> <label … value>` row. Required `series` (drives colour and label), optional `value`, optional `formatValue`. Default formatter `toLocaleString()` for numbers, `String()` otherwise, `—` for `null`/`undefined`. Pass `children` to fully override the inner layout.
- `LineChartHoverPopoverDot` — 8×8 `rounded-2` colour swatch reused by the legend and the popover rows. `color` accepts a palette token (`'brand'`, `'red'`, …) **or** any CSS colour string (`'var(--color-violet-500)'`, `'#8b5cf6'`, `'oklch(…)'`). Consumer-supplied `style.backgroundColor` wins.

### Zoom popover slots

- `LineChartZoomPopover` — popover surface. `role='dialog'`, `aria-modal='false'` (non-modal — focus stays on the chart, the popover is a transient affordance).
- `LineChartZoomPopoverRange` — text-xs primary range string. Default content comes from `lib/formatRange.ts` (e.g. `26 Dec 00:00 → 3 Jan 23:59`); override via `formatRange` on `<LineChartZoomBrush>`.
- `LineChartZoomPopoverConfirm` — brand-tinted "Zoom in" button. `aria-keyshortcuts='Enter'` so screen readers announce the shortcut. Wires to the context's `confirmZoom`.

### Legend

- `LineChartLegend` — row container. `orientation: 'horizontal' | 'vertical'` (default `'horizontal'`) — the only knob the legend exposes. `align: 'start' | 'center' | 'end'`. **No `position` prop** — placement is JSX-structural.
- `LineChartLegendItem` — row. Required `seriesKey` joins to a `LineChartSeries.key`. `selected` is explicit; when omitted it falls back to `!hiddenSet.has(seriesKey)`. Becomes interactive when `onClick` is passed (`role='button'`, `tabIndex=0`, Enter/Space dispatch). Hovering / focusing pushes `activeKey` into the context — this is what dims sibling lines.

### Empty state

- `LineChartEmpty` — Figma "No data" frame. Three dashed grid lines + one solid bottom axis. Pass `children` for the empty copy (e.g. `<LineChartEmpty>No data</LineChartEmpty>`); omit them to render only the grid frame (the idiom the `Loading` and `Refreshing` stories use). There is **no default copy**.

### `LineChartDatum`

```ts
type LineChartDatum = Record<string, number | string | null | undefined>;
```

One row per X position. The X value lives under the `xKey` (required — no default); every other series reads from `datum[series.key]`. `null` / `undefined` values create a gap in the line (unless the line opts into `connectNulls`).

Pass a concrete interface to `LineChart<T>` to gain compile-time safety on `xKey` and `series[].key`. The generic defaults to the loose `LineChartDatum` form so existing call sites stay typed against `Record<string, …>`.

```ts
interface RequestRow { timestamp: number; requests: number; errors: number }

<LineChart<RequestRow> data={rows} xKey='timestamp' />     // ✅
<LineChart<RequestRow> data={rows} xKey='timetamp' />      // ❌ Type error: 'timetamp' is not keyof RequestRow
```

### `LineChartSeries`

```ts
interface LineChartSeries<K extends string = string> {
  key: K;                                   // unique join key (keyof T when LineChart<T> is used)
  label: string;                            // visible label
  color?: ChartColor | (string & {});       // palette token or any CSS colour string
  variant?: 'solid' | 'dashed';             // default 'solid'
}
```

`color` is shared between the line stroke and the legend/tooltip dot — pass one value, both surfaces stay in sync. Palette tokens (`'brand'`, `'red'`, …) resolve via `LINE_STROKE_FILL`; any other string passes through verbatim, so `'var(--color-violet-500)'`, `'#8b5cf6'`, and `'oklch(…)'` all work. `'slate'` is the implicit fallback when `color` is omitted.

### `LineChartZoomRange`

```ts
interface LineChartZoomRange {
  fromIndex: number;                        // inclusive index into `data`
  toIndex: number;                          // inclusive index into `data`
  from: number | string;                    // data[fromIndex][xKey]
  to: number | string;                      // data[toIndex][xKey]
}
```

Emitted via `onZoomChange` exactly once per confirmed brush selection.

## Data model

- **`data`** (required, `LineChartDatum[]`) — single source of truth for both the lines and the tooltip rows. **The caller sorts ascending by `xKey`.** Recharts assumes an ordered domain; unsorted data draws the line backwards. A `console.warn` fires in development on the first inversion.
- **`series`** (required, `LineChartSeries[]`) — the schema. `key` must be unique and must appear on at least one datum (a development warning fires for series whose key never resolves to a value). Series declared but never composed as a `<LineChartLine>` are valid — you can render legend rows without lines.
- **`xKey`** (required, `Extract<keyof T, string>`) — the field on each datum used as the X axis. Required because no default matched any real call site (every story passes `'timestamp'`). When `LineChart<T>` is parameterised with a concrete datum type, `xKey` must be one of `T`'s keys; a typo is a compile error. X values must be `number` or `string` — pass `Date.getTime()` timestamps rather than `Date` instances. `Date` is intentionally not in the type union because recharts handles it inconsistently (sorting works, but `ReferenceArea` lookup in the zoom brush silently falls through).
- **`activeKey`** / **`onActiveKeyChange`** (optional, `string | null`) — controlled hover series. When omitted, the chart manages it internally with `useState`. Use the controlled mode to share the *series highlight* across sibling charts (line dimming + legend hover). The root resolves `activeKey` against the current `seriesByKey` map — if the previously hovered series disappears (filter, refresh, or a controlled value pointing at a missing key), the highlight collapses to `null` instead of dimming every line. In **controlled** mode the chart calls `onActiveKeyChange(null)` from an effect so sibling charts stop highlighting a stale key — wire your external state accordingly so the snap-to-null write does not surprise you. In uncontrolled mode the internal state is left as-is and the next hover overwrites it.
- **`syncId`** (optional, `string | number`) — pair two or more charts with the same `syncId` and recharts' built-in middleware syncs their *cursor X* (tooltip cursor + brush) — hovering one chart highlights the matching X on every sibling. This is independent of `activeKey`: `syncId` handles the tooltip cursor, `activeKey` handles the series highlight. Use both together for full cross-chart sync, or either one alone.
- **`syncMethod`** (optional, `'index' | 'value' | (ticks, data) => number`) — how sibling `syncId` charts match X positions. Defaults to `'index'` (recharts' default — match by position in `data`). Use `'value'` when the synced charts have different dataset lengths but share categorical X values.
- **`filteredKeys`** (optional, `string[]`) — keys to **hide** from the plot. The matching `<LineChartLine>` skips rendering, the tooltip row disappears, and the legend row paints at `opacity-40` with `data-selected='false'`. Stable references only — an inline array literal recreates on every parent render and invalidates the internal `Set` memo. The per-row `selected` prop still wins when set explicitly.
- **`onZoomChange`** (optional, `(range: LineChartZoomRange | null) => void`) — fires when the user confirms a brush selection. The chart never persists the zoom window — `data` is always the truth. The consumer decides whether to narrow `data` upstream, push to a router, refetch, etc.

`LineChart` does not sort, aggregate, or downsample. Callers prepare the data array.

### Filter mental model (vs. `PieChart`)

`PieChart` uses `selectedNames` (the keys to **highlight**; the rest dim). `LineChart` uses `filteredKeys` (the keys to **hide**). The divergence is intentional — the dominant interaction on the line chart is "click a legend row to toggle the line off", not "click to emphasise one slice". Consumers of both charts should not expect the two props to behave the same.

## Layout

The chart is layout-agnostic. The root is a vertical flex container; **JSX child order picks placement**:

```tsx
// Legend on top:
<LineChart …>
  <LineChartLegend>…</LineChartLegend>
  <LineChartBody>…</LineChartBody>
</LineChart>

// Legend on bottom:
<LineChart …>
  <LineChartBody>…</LineChartBody>
  <LineChartLegend>…</LineChartLegend>
</LineChart>

// Legend on the side — wrap body+legend in any row flex container
// (`<HStack>` from the design system is the canonical choice). Pair
// with `<LineChartLegend orientation='vertical'>` for the legend's own
// row→column layout.
<LineChart …>
  <HStack flexGrow gap={12}>
    <LineChartLegend orientation='vertical'>…</LineChartLegend>
    <LineChartBody>…</LineChartBody>
  </HStack>
</LineChart>
```

There is no `position` prop on the legend or on the root. The legend's only knob is its own `orientation` (`'horizontal'` | `'vertical'`); placement is structural and lives in user-land. The `LegendPlacements` story demonstrates all four placements side by side.

## States

| State           | Trigger                                                                          | Behaviour                                                                                                       |
| --------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Default         | —                                                                                | Lines use `LINE_STROKE_FILL[color]` at full opacity. Mount animation: `400 ms ease-out`, honours `prefers-reduced-motion`. |
| Hover (line)    | Pointer over a `<LineChartLine>` path                                            | No dimming — the plot stays at full opacity. The consumer's `onMouseEnter` / `onMouseLeave` still fire. The dashed cursor guideline and hover popover track the pointer via recharts' tooltip state. |
| Hover (legend)  | Pointer / focus over a `<LineChartLegendItem>`                                   | `activeKey` snaps to that series; sibling lines fade to `LINE_INACTIVE_OPACITY` (0.3). The row paints `bg-states-primary-hover`. |
| Hover (point)   | Pointer over the plot body                                                       | Recharts' tooltip state snaps to the nearest X. The Y-locked popover renders one row per visible series at that index. The dashed cursor guideline tracks the cursor X. Sibling charts that share a `syncId` mirror the highlight automatically. |
| Focus           | Keyboard focus on an interactive legend row                                      | `bg-states-primary-hover` + `ring-focus-primary` inset ring (`focus-visible`).                                  |
| Filtered        | `series.key` ∈ `filteredKeys`                                                    | `<LineChartLine>` does not render. Legend row paints at `opacity-40` with `aria-current` removed.               |
| Zoom-dragging   | Pointer down → drag on the plot while `<LineChartZoomBrush>` is mounted          | Gray `<ReferenceArea>` follows the cursor; a floating popover tracks the cursor with the live range text. Hover popover and dashed cursor guideline are suppressed. |
| Zoom-pending    | Mouse release after a non-zero drag                                              | Selection rectangle stays; popover becomes interactive with the "Zoom in" button. Click outside / Escape dismisses; Enter or button click confirms. |
| Loading         | Render `<LineChartEmpty>{null}</LineChartEmpty>` (or a `Skeleton` strip)         | Dashed grid only — no labels, no line trace. Mirrors Figma `7519-2591`. The `Refreshing` story is the canonical pattern. |
| Empty           | `data.length === 0`                                                              | Compose `<LineChartEmpty>No data</LineChartEmpty>` in the body slot — the chart itself renders nothing without it. |
| SinglePoint     | `data.length === 1`                                                              | Recharts draws a single active dot; the line has no length. Hover still works.                                  |
| Gapped          | `null` / `undefined` value on a datum for a given series                         | The line splits at the gap (recharts default `connectNulls={false}`). Set `<LineChartLine connectNulls>` to bridge. |

## Interactions

- **Hover sync (legend ↔ tooltip)** — pointer / focus on a `<LineChartLegendItem>` pushes `activeKey` into the active context; lines whose key does not match fade to 30% and the matching line gets `data-active='true'`. Hovering a line itself does **not** drive `activeKey` — the plot stays at full opacity so the cursor sweeping across multiple series does not flash sibling lines on and off. `<LineChartLegendItem>` uses `isHoverSyncTarget(event.relatedTarget)` in its `mouseLeave` / `blur` handlers to skip the `null`-clear when focus / pointer is moving directly between legend rows; without it React would render an intermediate `activeKey=null` frame on every crossing and the dimmed lines would flicker.
- **Hover popover Y-lock** — `<LineChartTooltip>` reads recharts' inner plot rectangle via `usePlotArea()` and anchors the popover at `plotArea.y + plotArea.height / 2`. A wrapping `<div className='-translate-y-1/2'>` turns that coordinate into the popover's visual centre. `isAnimationActive={false}` is non-negotiable — without it recharts interpolates the popover Y between frames and defeats the lock. The first paint falls back to `HOVER_POPOVER_TOP` (8px) until recharts measures the plot.
- **Click-to-filter** — caller-driven. Attach `onClick` to `<LineChartLegendItem>`; toggle the matching key in your own `filteredKeys` state. Enter/Space dispatch a click on the row.
- **Cross-chart hover sync** — two layers compose:
  1. **Cursor X (tooltip + brush)** — pass the same `syncId` to every chart that should mirror the cursor. Recharts' own redux middleware handles the wiring; no controlled state needed. `syncMethod='value'` lets datasets of different lengths sync by shared category instead of by position.
  2. **Series highlight (line dimming + legend)** — wire each chart's `activeKey` / `onActiveKeyChange` to a shared `useState<string | null>`. The internal `lastActiveKeyRef` dedupe prevents the per-pixel mousemove flood from spamming the callback. See the `CrossChartHoverSync` story for the canonical recipe pairing both layers.
- **Zoom (drag → pending → confirm)** — `<LineChartZoomBrush>` enables a crosshair drag on the plot. Two-phase:
  1. **Drag** — `mousedown` on the plot starts a drag at the active tooltip index. A gray `<ReferenceArea>` follows the cursor; a portalled floating popover tracks the cursor position and renders the live range string. The hover popover and cursor guideline are hidden while dragging. Drag is followed at the *window* level so the popover keeps tracking when the cursor leaves the SVG and the release still commits even outside the chart. Escape mid-drag cancels outright (no pending popover).
  2. **Pending** — `mouseup` after a non-zero drag locks the selection and turns the popover interactive (`pointer-events: auto`). The "Zoom in" button confirms — Enter does the same. Escape, click outside the popover, or starting a new drag dismisses without emitting. The popover stops a bubbling `mousedown` on its surface so clicking the confirm button does not start a fresh drag.
  3. **Confirm** — fires `onZoomChange({ from, to, fromIndex, toIndex })` exactly once. The consumer narrows `data`; the brush state resets automatically.
- **Zoom keyboard contract** — the keydown listener is gated to events whose target is inside the chart container, inside the popover, or ambient (focus on `<body>` / `<html>`). It does **not** hijack Enter for forms / dialogs / focused inputs elsewhere on the page.
- **Single-index click (no zoom)** — clicking the plot without dragging produces a zero-width range and is dropped silently so users cannot accidentally surface a confirm popover on a plain click.
- **Data refresh while zoom-pending** — the root resets `zoomDrag` and `zoomPending` whenever `data` or `xKey` changes. Emitting a stale range against a no-longer-current dataset would point at nothing meaningful.

## Edge cases & unclear states

- **Per-series hover and per-index hover are different things.** Pointing at a legend row sets the **series** active (dims sibling lines, keeps the popover off). Pointing at the plot body sets the **index** active (lights up the popover for every visible series at that X). They live in separate contexts on purpose so the lines don't re-render on every cursor frame. Hovering a line in the plot does **not** dim siblings — only the legend drives the series dim.
- **The popover Y is locked, not the X.** The dashed cursor guideline still tracks the cursor's X; the popover surface stays put on Y so it does not jump between peaks and valleys. Disabling animation (`isAnimationActive={false}`) is required — without it recharts interpolates Y between frames.
- **Filtering down to zero series.** The plot renders an empty frame (grid + axes still visible). Recommend swapping the body for `<LineChartEmpty>No data</LineChartEmpty>` when the consumer's filter UI produces this state.
- **`null` / `undefined` datum values.** Recharts splits the line at the gap (default `connectNulls={false}`). The tooltip row formats `null` / `undefined` as `—`. Pass `<LineChartLine connectNulls>` to bridge.
- **`NaN` values.** Recharts coerces `NaN` to `null` (gap behaviour). Pre-filter upstream if you need different handling.
- **Single point (`data.length === 1`).** Recharts renders only the active dot; the line has zero length. Hover still works.
- **`xKey` typing.** The public union is `number | string` (no `Date`). Pass `Date.getTime()` timestamps and format with `tickFormatter`; the chart's own `<ReferenceArea>` lookups (zoom brush) rely on this contract — a stray `Date` instance breaks them silently.
- **Mount animation.** `400 ms ease-out`, `begin=0`. `isAnimationActive='auto'` (the default) honours `prefers-reduced-motion`. Force off with `<LineChartLine disableAnimation />` — useful for E2E screenshot stability.
- **`className` on a `LineChartLine`.** Recharts paints the line as `<path>` — only `stroke-*` Tailwind utilities take effect, **not** `bg-*` or `fill-*`. The same trap `PieChart` documents for slices applies here in mirror.
- **Stale `activeKey` after a series disappears.** The root resolves `activeKey` against `seriesByKey`. In **controlled** mode the chart calls `onActiveKeyChange(null)` from an effect — make `onActiveKeyChange` stable so the reset lands in the same render cycle as the data change. In **uncontrolled** mode the internal state is left as-is; the next hover overwrites it. Either way the visible state never gets stuck at "every line dimmed".
- **Stale tooltip cursor after `data` shrinks.** Recharts manages tooltip state internally and resets the cursor on every `data` update. There is no out-of-range slot to clamp — the chart simply re-renders the cursor against the new dataset on the next pointer event.
- **Brush popover positioning.** The popover is `position: fixed` portalled to `document.body`. It always tracks the cursor's viewport coordinates — `clientX` / `clientY` from the latest mousemove. The first frame uses the mousedown coordinates as the anchor.
- **Two charts on one page, both with zoom.** The pending-zoom keydown handler is scoped to the owning chart via `LineChartZoomContext.rootRef`. Enter and Escape only commit / dismiss the chart whose root currently contains the event target (plus the portalled popover and the ambient body/html case). Sibling charts on the same page do not see each other's keystrokes.
- **Long datasets.** The chart still works at 1000+ points (the `LongTimeRange` story stresses this) but recharts' tick generator and interpolation cost climb past ~5000 points. Downsample upstream.
- **`LineChartEmpty` with no `children`.** Renders only the dashed grid frame — the idiom the `Loading` and `Refreshing` stories use, paired with a `<Skeleton>` strip in place of the legend rows. `null`/`undefined` children are both treated the same (no message overlay).
- **Recharts requires axes / grid / lines / tooltip / brush to be direct children of `<RechartsLineChart>`.** Our wrappers (`LineChartXAxis`, `LineChartYAxis`, `LineChartGrid`, `LineChartLine`, `LineChartTooltip`, `LineChartZoomBrush`) all return bare recharts elements (or `null`); in recharts v3 each primitive self-registers via Redux dispatch, so mounting them anywhere inside the `<RechartsLineChart>` subtree wires up correctly.
- **Inline event handlers on controlled mode.** Wrap `onActiveKeyChange` / `onZoomChange` in `useCallback` (or hoist them) — an inline arrow handler recreates every render and propagates through the data context, invalidating memoised legend rows. Not a correctness bug, but kills `React.memo` opportunities for custom row children.

## Accessibility notes

- The chart body (`<LineChartBody>`) is `aria-hidden='true'` — the SVG is decorative. The legend is the canonical screen-reader representation.
- Recharts' default keyboard a11y layer is disabled (`accessibilityLayer={false}`) — it puts `tabindex=0` + `role='application'` on the SVG and would conflict with `aria-hidden` on our wrapper. The legend rows are the accessible alternative.
- Interactive `<LineChartLegendItem>` rows expose `role='button'`, `tabIndex=0`; Enter/Space dispatch a click. `aria-current='true'` when the row is selected. Focus ring uses `focus-visible` so keyboard users see the ring and pointer clicks don't.
- The hover popover (`<LineChartHoverPopover>`) is `role='tooltip'` + `aria-live='polite'`. `<LineChartHoverPopoverDot>` is `aria-hidden` so screen readers don't pronounce the colour swatch.
- The zoom popover (`<LineChartZoomPopover>`) is `role='dialog'`, `aria-modal='false'` (non-modal — focus stays on the chart). The confirm button advertises `aria-keyshortcuts='Enter'`.
- `<LineChartEmpty>` is a static frame — pass meaningful `children` (`'No data'`, `'Loading'`, etc.) for the screen-reader announcement.

## Open questions / known limitations

- **Stacked / area / scatter / step variants.** Out of scope for this PR — each is its own compound.
- **Reference / threshold lines** (`<LineChartReferenceLine>`). Out of scope; will be added when a product use case lands.
- **Multi-axis** (separate left + right Y). Out of scope.
- **Built-in zoom-out / reset chip.** Out of scope — consumers render their own affordance in `<ChartActions>` and call `setRange(null)` (the `Zoom` story is the canonical pattern).
- **Tooltip pinning** ("click to keep open"). Hover-only for v1.
- **Cross-chart hover registry.** `syncId` (cursor X) + controlled `activeKey` (series highlight) cover the one-parent / multiple-charts case. A `ChartGroup` provider would live one level above this component to share an `activeKey` `useState` across an arbitrary number of charts.
- **Internationalised range / tick formatting.** Caller supplies `tickFormatter` and `formatRange`. The chart does not call `Intl.DateTimeFormat` itself.
