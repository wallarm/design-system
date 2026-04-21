# BarList

## Overview

`BarList` is a composable, JSX-driven horizontal bar list. Callers render one `BarListItem` per data point and decide which slots to compose inside each row (bar, label, value, percent). The parent supplies `max` — the single number that defines 100% for the list. There is no recharts dependency and no internal aggregation: bar width is always `clamp(value / max, 0, 1) × 100%`.

Use it for compact "top N" breakdowns inside a `Chart` card — endpoints, status codes, tags, regions — whenever the chart must be small, read fast, and optionally become a filter control.

## Figma

- Root (states: default / hovered / filtered): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-121720&m=dev
- Row/bar anatomy: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7527-31781&m=dev
- Loading skeleton: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7519-2600&m=dev

## API

Compound component:

- `BarList` — root. Requires `max`. Provides context for children.
- `BarListItem` — row (`h-32`). Accepts `value` and `selected`. Becomes interactive when `onClick` is passed.
- `BarListBar` — the coloured fill. Absolute-positioned under label/value. Accepts `color` from `ChartColor` (each variant renders a 16% alpha overlay of the palette's `500` hue — matching the default slate bar which is `bg-states-primary-pressed` = `slate-500 @ 16%`). Translucent fills let the row's hover / focus tint layer through the bar so interactive state stays visible. For any colour outside the palette, pass a Tailwind `bg-*` utility via `className` (e.g. `<BarListBar className='bg-sky-500/16' />`); `tailwind-merge` resolves the conflict in favour of the explicit class.
- `BarListLabel` — left-side label slot.
- `BarListValue` — right-side value slot; place `BarListPercent` inside to get the auto-formatted share.
- `BarListPercent` — reads `value / max` from context and renders `NN%`. Accepts `digits`.
- `BarListSkeleton` — standalone loading view; use it instead of `BarList` while data is loading.

## Data model

- **`max`** (required, number) — the value at which a bar is full.
  - Percent inputs → `max={100}`.
  - Fractions → `max={1}`.
  - Raw counts → `Math.max(...values)` or the total, depending on what "100%" should mean.
  - Invalid (`NaN`, `Infinity`, `-Infinity`, `0`, negative, non-number) → every row renders empty with a `0%` label. A single `console.warn` fires in development.
- **`value`** (per item, number) — raw magnitude.
  - Non-finite → treated as `0`.
  - Ratio is clamped to `[0, 1]`; values above `max` cap the bar at 100% but the percent label also caps at `100%`.
- **`selected`** (per item, boolean) — purely visual: applies the hover background and `aria-current="true"`. The bar width and the percent label are driven entirely by `value / max`; selection never changes the fill.

`BarList` does not sort, slice, or aggregate its input — callers already have `data`, they pass it in whatever order they want to display it.

## States

| State       | Trigger                                                  | Behaviour                                                                                     |
| ----------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Default     | —                                                        | Grey bar (`bg-states-primary-pressed`) at `value / max` width.                                |
| Hover       | Pointer over a row                                       | Row background shifts to `bg-states-primary-hover`. Pure CSS; no JS.                          |
| Focus       | Keyboard focus on a clickable row                        | Same hover background + `ring-focus-primary` inset ring via `focus-visible`.                  |
| Selected    | `<BarListItem selected />`                               | Row gets the hover background + `aria-current="true"`. Bar and percent label stay at `value / max`. |
| Loading     | Render `<BarListSkeleton rows={n} />` instead of `BarList` | Five (or `rows`) pulse bars using the design system's `Skeleton`.                             |
| Empty       | Render `<ChartEmpty />` instead of `BarList`             | Shared chart empty-state body with a centered "No data" message. Pass children to override.   |

## Interactions

- **Clickable row** — attaching `onClick` to `BarListItem` turns the row into a button: `role="button"`, `tabIndex=0`, Enter/Space dispatch a click. Without `onClick`, the row is a plain `div` with no keyboard affordance.
- **Filter pattern** — the caller owns the filter state. Typical flow: `onClick` on each row toggles external state; the caller re-renders `BarList` with a single child and sets `selected` on it. `BarListPercent` still reads the real underlying ratio.
- **Tooltip** — not baked in. Wrap `BarListItem` with the design system's `Tooltip` when a row needs a hint ("Click to filter", full endpoint path, …).

## Edge cases & unclear states

- **Ratio clamping** — `value > max` renders the bar at 100% but the percent label also caps at `100%`. There is no special rendering for "overflow".
- **Selection and fill are orthogonal** — `selected` is purely a visual state (background + `aria-current`). The bar width and percent label are always `value / max`. To show a row "filling to 100%" when filtered, recompute `max` from the filtered set (e.g. `max={Math.max(...visibleRows.map(r => r.value))}`) instead of relying on `selected`.
- **Invalid `max`** — `NaN`, `Infinity`, `-Infinity`, `0`, negative, or non-number: every row renders empty with a `0%` label, and a single `console.warn` fires in development. Production stays silent.
- **Label overlap** — the label is absolutely positioned on top of the bar by design; they share the same row. Labels truncate with ellipsis and reserve `80px` on the right for the value.
- **Zero values** — `value = 0` renders an empty bar and `0%`. No special "no data" treatment.
- **Mount animation** — bars transition their width (`duration-300 ease-out`). React mounts them with their final inline style, so without opt-in the first paint would already show the end state; the transition still runs for subsequent width changes (e.g. filtering).
- **`BarListPercent` without a parent `BarListItem`** — renders `0%`. There is no runtime error.

## Accessibility notes

- Clickable rows are exposed as `role="button"` with the label text as the accessible name (via visible text content). Pass `aria-label` if the visible text is not descriptive enough.
- `selected` sets `aria-current="true"`.
- Focus ring uses `focus-visible` so keyboard users see a ring but pointer clicks do not.
- The bar element is `aria-hidden` — it is a pure visual and should not be announced.
- `BarListSkeleton` sets `aria-busy="true"` + `aria-live="polite"` so assistive tech announces the loading transition.

## Open questions / known limitations

- **Convenience `data` prop.** The composable API is the only shape shipped; a `data` shorthand (`<BarList data={…}>`) may be added later if two or three call-sites need it.
- **Auto-inference of `max`.** Not shipped — the current contract requires `max`. Revisit once a real use case surfaces where the caller cannot compute it.
- **Empty-state styling.** Use `ChartEmpty` as a sibling of `ChartHeader` when the row list is empty — `BarList` itself does not render a placeholder, and `ChartEmpty` is the shared chart empty-state body (`<ChartEmpty />` for the default "No data" label; pass children for filter-specific copy).
- **Tooltip wiring.** No `tooltip` prop. Consumers compose `<Tooltip>` externally around `BarListItem`.
