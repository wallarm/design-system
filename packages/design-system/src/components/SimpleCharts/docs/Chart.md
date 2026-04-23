# Chart

## Overview

`Chart` is the generic card container used by every SimpleCharts visualization. It owns only the card's surface, border, default sizing and the hover-reveal behaviour of its action buttons — the actual chart (bars, pie, line, …) is composed inside.

Use it whenever a chart needs the standard Wallarm "simple chart" frame: a rounded surface with a 32px title bar and an optional actions cluster in the top-right that appears on hover.

## Figma

- Root (container + annotations): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-118206&m=dev
- Header: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7527-31783&m=dev
- Actions block: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7527-31786&m=dev

## API

Compound component:

- `Chart` — root surface.
- `ChartHeader` — 32px bar, renders title + actions side by side.
- `ChartTitle` — text slot; single line, truncates with ellipsis.
- `ChartActions` — right-aligned button cluster; revealed on card hover/focus by default, and takes no layout space while hidden so the title has the full header width.
- `ChartEmpty` — centered placeholder for the body when there is no data. Defaults to "No data"; pass children to override.

### Sizing

`Chart` is a **block-level** element by default:

- width: `w-full` (fills the parent's content area).
- min-height: `196px` (Figma spec).

Consumers customise size through `className`, not dedicated props. This keeps the API small and lets Tailwind utilities compose naturally (`w-[640px]`, `h-320`, `max-w-lg`, `aspect-[16/9]`, …). If you need something rigid, prefer a wrapper:

```tsx
<div className='w-400'>
  <Chart>…</Chart>
</div>
```

### `ChartEmpty`

`ChartEmpty` is the shared empty-state body. It fills the remaining card height with a centered secondary-text message. Use it whenever a chart has no data to display — every simple chart family member opts into the same visual:

```tsx
<Chart>
  <ChartHeader>
    <ChartTitle>Top 5 Endpoints</ChartTitle>
  </ChartHeader>
  {rows.length === 0 ? <ChartEmpty /> : <BarList max={max}>…</BarList>}
</Chart>
```

Children override the default "No data" label for filter-specific messaging (e.g. `<ChartEmpty>No endpoints match the current filter</ChartEmpty>`).

### `ChartActions.alwaysVisible`

`ChartActions` is collapsed to `w-0` with `opacity-0 pointer-events-none` by default and expands to `w-auto opacity-100` on `group-hover/chart` and `group-focus-within/chart`. Because the cluster takes no layout space while idle, `ChartTitle` occupies the whole header width and only truncates (shifts left) when the actions actually appear. The buttons stay in the tab order the whole time — pressing `Tab` into the card expands the cluster via `focus-within` so keyboard users can reach them without hovering. Pass `alwaysVisible` to keep the cluster in the layout permanently — required when the action represents active chart state (e.g. an active "Remove filter" button) that should not be hidden.

## Data model

None — `Chart` is a presentational container. Chart content lives in its children.

## States

| State               | Trigger                                      | Behaviour                                                                                                                                          |
| ------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default             | —                                            | Surface + border + min-height only. `ChartActions` is collapsed (`w-0 opacity-0 pointer-events-none`), so `ChartTitle` has the full header width. Buttons remain focusable via Tab. |
| Hover (card-hover)  | Pointer enters any part of the card          | `ChartActions` expands to `w-auto opacity-100` and the title shifts left / truncates to make room.                                                 |
| Focus-within        | Keyboard focus lands on any child            | Same as hover — actions become visible so keyboard users can reach them.                                                                           |
| Actions always-on   | `<ChartActions alwaysVisible />`             | Actions stay in the flow at full width regardless of hover/focus. Use this when the action itself represents an active state (filtered, selected, pinned). |

## Interactions

No intrinsic interactions. The container only coordinates hover-reveal of `ChartActions` via CSS group selectors (`group/chart`) on the root.

Children (buttons, tooltips, dropdowns) own their own interactions and can use the `ChartActions` slot as a neutral layout parent.

## Edge cases & unclear states

- **Long title.** `ChartTitle` has `truncate` + `flex-1 min-w-0` applied, so it claims the full header width until `ChartActions` appears. At that point the title shrinks and is cut with an ellipsis. Wrap the title in a tooltip if the full string needs to be discoverable.
- **No actions cluster.** `ChartHeader` uses `justify-between`, so a title alone flows left and the right side stays empty; `ChartActions` can be omitted entirely.
- **Nested `group/*` utilities.** The root uses the namespaced group `group/chart` so it does not clash with unrelated `group-hover:*` rules from parent or child components.
- **Hover reveal vs. touch devices.** On touch, `:hover` is simulated on tap, so actions become reachable but not discoverable. Consider `alwaysVisible` on touch-first screens.

## Accessibility notes

- The root is a plain `<div>` — this is a layout primitive, not an interactive region. Semantics come from the content placed inside (buttons, links, chart SVGs with ARIA).
- Actions are revealed on `focus-within`, so keyboard users can always reach them via Tab even without a pointer.
- Use an accessible name on each action button (`aria-label` for icon-only buttons).

## Open questions / known limitations

- The container has no baked-in loading/error/empty states. Those live one level down (per chart type: `ChartBarList`, `ChartPie`, …) — revisit if a shared pattern emerges.
- The hover-reveal relies on `group/chart` on the root. If a caller wraps `ChartActions` in another `group/chart`, the nearest group wins — document this once a real collision shows up.
