# PieChart

## Overview

`PieChart` is a composable donut chart paired with a vertical legend, designed for compact "share-of-total" breakdowns inside a `Chart` card — response codes, traffic origins, error categories. The donut is drawn by [`recharts@3.8`](https://recharts.org/), the legend is hand-rolled JSX, and the two are synced through React context: hovering a slice highlights its legend row and vice versa.

The root accepts `data` as the single source of truth. The donut renders the slices; the legend is composed by the caller (`PieChartLegendItem` rows are referenced by `name`). This keeps the badge/label/value layout fully flexible while preserving the hover and percent calculations.

Use it whenever a chart needs the same "small chart card" frame as `BarList` but the data reads naturally as parts of a whole.

## Figma

- Root: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-122167&m=dev
- Hover state (legend ↔ slice sync): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-122445&m=dev
- Filtered (single slice): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-122941&m=dev
- Loading skeleton: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7519-2618&m=dev

## API

Compound component:

- `PieChart` — root. Accepts `data: PieChartDatum[]`, optional `total`, optional controlled `activeName` / `onActiveNameChange`. Provides context to children.
- `PieChartDonut` — wraps the recharts donut. Reads `data` + `activeName` from context. Renders a fixed `168×136` block with a `120×120` SVG inside; mouse events on slices fire context's `setActive`. Pass `disableAnimation` when running in environments that need deterministic frames. Children of `PieChartDonut` render absolutely-positioned over the SVG (use `PieChartCenter`).
- `PieChartCenter` — absolutely-positioned centre slot, intentionally `pointer-events-none` and `aria-hidden` so it never blocks slice hover.
- `PieChartCenterValue` — primary number (`text-base`, monospace). On by default, swaps `children` for the hovered datum's value while a slice or legend row is hovered. Customise the swap via `formatHoveredValue: (datum) => ReactNode` (defaults to `datum.value.toLocaleString()`); opt out entirely with `hoverSync={false}`. Sets `data-hovered='true'` on the swapped element so callers and E2E selectors can detect the hover state.
- `PieChartCenterLabel` — secondary unit (`text-xs`, monospace, secondary text token). Optional `pluralize` prop accepts CLDR plural rules (`{ zero?, one?, two?, few?, many?, other }` plus an optional `locale` defaulting to `'en'`); when provided, the label is selected from those rules using `Intl.PluralRules` based on the currently visible count (the hovered datum's value when `hoverSync` is on, otherwise the chart total). When `pluralize` is omitted, `children` renders unchanged.
- `PieChartLegend` — flex column that takes the remaining horizontal space.
- `PieChartLegendItem` — row (`h-32`, `rounded-8`). Required `name` (joins to `PieChartDatum.name`). Becomes interactive when `onClick` is passed (role=button + Enter/Space). Hovering the row sets the active context entry, dimming inactive donut slices to 30% opacity.
- `PieChartLegendValue` — right-aligned value slot. Auto-applies the Figma "value · percent" gap.
- `PieChartLegendPercent` — reads `value / total` from item context. Same `digits` and `variant` props as `BarListPercent`.
- `LegendDot` — `·` bullet separator (rendered with `aria-hidden`). Compose between `PieChartLegendValue`'s children when you want the Figma `value · percent` pairing; omit when the row shows only one of value/percent.
- `PieChartSkeleton` — standalone loading view. Mirrors the donut + legend layout with shimmering placeholders.

### `PieChartDatum`

```ts
interface PieChartDatum {
  name: string;          // unique join key
  value: number;
  color?: ChartColor;    // built-in palette → `var(--color-{color}-500)` slice fill
  className?: string;    // Tailwind `fill-*` class; wins over `color`
}
```

## Data model

- **`data`** (required, `PieChartDatum[]`) — drives both the donut and the legend percent calculations. Rows with non-finite or negative `value` are coerced to `0` so slice geometry stays valid (recharts rejects negatives).
- **`total`** (optional, number) — defaults to `sum(data.value)`. Override when the centre label should reflect a different denominator (e.g. the **unfiltered** total while the chart shows a filtered view).
- **`activeName`** / **`onActiveNameChange`** (optional, `string | null`) — controlled hover target. When omitted, the chart manages it internally with `useState`. Use the controlled mode when two charts must share a hover (cross-filter pattern).
- **`selectedNames`** (optional, `string[]`) — multi-selection set. When non-empty, non-selected donut slices fade to `inactiveOpacity` (the same dim as hover) and non-selected legend rows fade to `opacity-60` (lighter so the row text stays readable). Hover wins — while `activeName` is non-null, only that slice stays bright regardless of selection. Names not in `data` are ignored. Pass a stable reference (`useMemo`/state) — an inline array literal recreates on every parent render and invalidates the internal Set memo. The per-`PieChartLegendItem` `selected` prop still works and fully overrides the derived state when set explicitly (useful when the legend includes a row intentionally outside the chart's multi-selection).
- **`PieChartLegendItem.name`** (required, string) — must match a `PieChartDatum.name` for the percent to compute and for hover sync to work. Items whose `name` does not match any datum render at `0%`.
- **`PieChartLegendItem.value`** (optional, number override) — useful for legend rows that are not part of the donut (e.g. a synthetic "Other" line).

`PieChart` does not sort, slice, or aggregate. The caller orders `data` and the legend items match.

## States

| State           | Trigger                                                  | Behaviour                                                                                                 |
| --------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Default         | —                                                        | Slices use `var(--color-{color}-500)` (palette-strong). Legend rows show their full content.              |
| Hover (slice)   | Pointer over a donut slice                               | Slice keeps `opacity 1`; sibling slices fade to `0.3`. Matching legend row gets `bg-states-primary-hover`. |
| Hover (legend)  | Pointer over a legend row                                | Same as slice hover — bidirectional via `activeName` context.                                             |
| Focus           | Keyboard focus on a clickable legend row                 | `bg-states-primary-hover` + `ring-focus-primary` inset ring (focus-visible).                              |
| Selected        | `<PieChartLegendItem selected />` or root `selectedNames` includes the row | `bg-states-primary-active` + `aria-current="true"`. Selected donut slice stays bright; non-selected slices and legend rows fade to `inactiveOpacity` (multi-selection emphasis). |
| Filtered (one)  | Caller filters `data` to a single entry                  | Donut renders a single full ring of that colour; the legend shows only that row at `100%`.                |
| Loading         | Render `<PieChartSkeleton rows={n} />` instead of the chart | Circle skeleton on the left + `n` row skeletons on the right; `aria-busy='true'` + `aria-live='polite'`. |
| Empty           | `data.length === 0` (or render `<ChartEmpty />` instead) | Donut renders a flat ring (`var(--color-border-primary-light)`) with no slices; the legend is empty. Prefer `<ChartEmpty />` for an explicit empty body. |
| Zero total      | All values are `0`                                       | Same flat ring — no slices, every legend row reads `0%`. No console warnings.                             |

## Interactions

- **Hover sync** — `PieChartLegendItem` calls `setActive(name)` on `mouseEnter` / `focus` and `setActive(null)` on `mouseLeave` / `blur`. The donut listens to recharts' `onMouseEnter` / `onMouseLeave` on `<Pie>` and pushes the same name. Context glue makes them mirror. Both leave/blur handlers inspect `event.relatedTarget` and **skip the null-clear when the cursor or focus is moving to another hover-syncing sibling** (legend row or donut slice) — the destination's enter handler sets the new active. Without this guard, React would render an intermediate `activeName=null` frame on every row/slice crossing and the centre value would flicker back to the total each time.
- **Centre value hover swap** — `PieChartCenterValue` reads the same `activeName` and replaces its `children` with the hovered datum's formatted value while a slice or legend row is hovered. Default formatter is `datum.value.toLocaleString()`; supply `formatHoveredValue` to match the format of `children` (e.g. compact notation, units). Disable with `hoverSync={false}` when the centre should always reflect the unfiltered total. The DOM gains `data-hovered='true'` while swapped — useful for snapshot tests.
- **Pluralization** — `PieChartCenterLabel` swaps the label form to match the currently visible count when `pluralize` is provided. Combined with the value's hover swap, hovering a single-request slice flips the label from "requests" to "request" automatically. The label uses `Intl.PluralRules`; locale defaults to `'en'` and can be overridden via `pluralize.locale`.
- **Click-to-filter** — caller-driven, like `BarList`. Attach `onClick` to `PieChartLegendItem`; the row exposes `role="button"` + `tabIndex=0` and Enter/Space dispatch a click. Toggling the filter usually means filtering `data` and re-rendering with one entry.
- **Tooltip** — not baked in. Wrap `PieChartLegendItem` (or its label slot) with `Tooltip` / `OverflowTooltip` when needed; the legend item exposes the standard mouse events through the props spread.
- **`activeName` controlled mode** — set `activeName` + `onActiveNameChange` to drive hover state from a parent (e.g. a sibling `BarList` should highlight the same datum). When controlled, internal hover state is ignored. Wrap `onActiveNameChange` in `useCallback` (or hoist it) — an inline arrow handler will recreate every render and propagate through the data context, recreating every legend row's mouse/focus callbacks. Not a correctness bug, but kills `React.memo` opportunities for custom row children.

## Edge cases & unclear states

- **Recharts ignores negative values.** We coerce `< 0` and non-finite values to `0` before passing data into recharts, otherwise the chart silently drops them (or, in some recharts builds, throws).
- **Total of zero.** Recharts cannot draw a meaningful pie when every value is `0`. We render a flat outline ring (`var(--color-border-primary-light)`) so the chart shape is visible. Every legend row reads `0%` — the percent calculator returns `0` when the context's `isValidTotal` flag is false. Slice `onMouseEnter` is short-circuited in this state — without the guard, recharts would resolve the placeholder ring's hover index back into the original `data` array and spuriously activate the first legend row.
- **Single slice.** Recharts draws a full circle (start `90°` → end `-270°`); the slice is visually a closed ring. Hover-dim still works (there is nothing to dim, opacity stays `1`).
- **`PieChartLegendItem.name` does not match any datum.** The row renders with a `0%` ratio and no slice highlight. There is no runtime warning — the legend can intentionally include rows that are not on the donut (e.g. a hidden "Other" row).
- **Mount animation.** Sectors sweep from origin in **400 ms** with `ease-out` and `begin=0`, sized for dashboards that re-render on every tick — fast enough to feel snappy, slow enough to read as a deliberate reveal. The donut uses recharts' `isAnimationActive='auto'`, which honours `prefers-reduced-motion` and disables animation under SSR. Pass `<PieChartDonut disableAnimation />` to force it off (useful for E2E screenshot stability). Screenshot tests wait `~500 ms` past navigation.
- **`pointer-events-none` on the centre slot.** Without it, hovering the centre text would steal events and break the slice hover-dim. Keep this if you replace `PieChartCenter` with custom markup.
- **`className` on a datum.** Apply Tailwind `fill-*` utilities to the SVG path — `bg-*` does **not** work because the slice is a `<path>`, not a `<div>`. The donut applies `className` directly via recharts' `<Cell>`.
- **Active state when nothing is hovered.** `activeName === null` means every slice renders at full opacity. Switching to a controlled `activeName` and forcing it to `null` is how a parent "clears" the highlight.
- **Stale `activeName` after data changes.** The root resolves `activeName` against the current `byName` map. If the previously hovered slice disappears (filter, refresh, or a controlled value pointing at a name that is no longer in `data`), the highlight collapses to `null` instead of dimming every remaining slice. In **uncontrolled** mode the internal hover state is left as-is — the next hover overwrites it. In **controlled** mode the chart calls `onActiveNameChange(null)` from an effect so sibling charts sharing the same state don't keep highlighting a stale name. Make `onActiveNameChange` stable (or expect this normalization fire to land in the same render cycle as the data change).
- **Duplicate `name` values.** Names are the join key for percent lookup, hover sync, and React reconciliation. The root warns once in development when `data` contains duplicates; behaviour is best-effort (later duplicates win in `byName`) but should be treated as undefined — fix the data instead.

## Accessibility notes

- The donut SVG and the centre slot are `aria-hidden`; the legend is the screen-reader representation of the same data.
- Interactive legend rows expose `role="button"`, `tabIndex=0`, and Enter/Space dispatch a click. Focus ring uses `focus-visible` — keyboard users see the ring, pointer clicks don't.
- `selected` ⇒ `aria-current="true"`.
- `PieChartSkeleton` sets `aria-busy="true"` + `aria-live="polite"` so AT announces the loading transition.
- `LegendDot` is `aria-hidden` so screen readers don't pronounce the `·`. The numeric percent is read normally.

## Open questions / known limitations

- **Slice tooltip.** Not baked in — the donut SVG is `aria-hidden` and we direct hover signals through the legend row instead. Add a tooltip later if a use case calls for it; consider the `Tooltip` wrapper around the legend row first.
- **Smooth transition between filter states.** Recharts re-mounts the slice paths when `data.length` changes, so going from 5 slices to 1 is a hard cut + remount animation. A morphing animation would need a custom shape renderer or a different lib.
- **Inner-ring labels.** The centre slot is two-line (value + label). Three-line designs would need an explicit gap token / wrapper — revisit when product asks for it.
- **Built-in empty state.** Currently the donut renders an outline ring when `total === 0` and the legend is empty. Most products will prefer to swap in `<ChartEmpty />`; if a "0% donut + still-rendered legend" pattern becomes common, expose it as a prop.
- **Cross-chart sync.** The controlled `activeName`/`onActiveNameChange` pair is enough for one parent to drive multiple charts. If we ever need a registry of charts that share hover, it should live one level above (a `ChartGroup` provider), not on `PieChart` itself.
