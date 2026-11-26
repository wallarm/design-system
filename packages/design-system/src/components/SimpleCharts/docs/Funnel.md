# Funnel

## Overview

`Funnel` is a horizontal step funnel: how a count narrows from stage to stage, left to right. Each stage is a `FunnelStep` title cell (name, count, optional delta, optional caption) above one smooth ribbon scaled to the largest step. The ribbon is a recharts `BarChart` (one category per step, no gaps) whose bar `shape` draws the funnel segment; the title cells stay HTML. It renders the body only — the card frame and title are composed with the shared `Chart` / `ChartHeader` / `ChartTitle`, like every family member. Use it for consecutive stages of one flow (detected → reviewed → confirmed); when the rows are independent categories use `BarList`; when one total splits into parts use `HorizontalBarStack`.

## Data model

Compound, composed from children — no `data` array. `Funnel` reads `value` from its **direct** `FunnelStep` children during render and draws the ribbon from them.

- `Funnel`
  - `color` (optional, `FunnelColor` = `ChartColor` minus `'slate'`, default `'blue'`) — hue of the ramp. `'brand'` maps to the `w-orange` palette, as in `CHART_PALETTE_FILL`. Hues are not semantic (red is a hue, not "danger").
  - `start` (optional, `'tint' | 'gray'`, default `'tint'`) — `'tint'` ramps light → dark across the steps; `'gray'` makes step 1 `slate-300` and every other step `{hue}-600`.
  - `children` — `FunnelStep` elements, direct children, rendered left to right in order. 2–6 steps expected.
  - `data-testid` — base id; wraps children in `TestIdProvider`. Ribbon: `{base}--ribbon`. The root is the horizontal scroll container (see Edge cases).
- `FunnelStep`
  - `name` (required, `ReactNode`) — one line, ellipsis.
  - `value` (required, `number`, ≥ 0) — rendered with `FormatNumber` (typography inherited, `tooltip={false}`): large values are abbreviated (`1.2K`) with no hover hint; the full number is only in the `aria-label`. Shows what fits then ellipsis. Test id `{step}--value`.
  - `caption` (optional, `ReactNode`) — up to 2 lines, then ellipsis.
  - `delta` (optional, `ReactNode`) — slot for `<MetricDelta … />`, placed right after the value. No second delta implementation.
  - `onClick` (optional) — makes the step a real `<button type='button'>`.
  - Everything else (`data-*`, `aria-*`, `ref`, event handlers, `className`) is spread onto the step's real node. Button-only attributes (`disabled`, `type`, `form*`) are dropped on the non-interactive `div`. `data-testid` → `{base}--step`; a `data-testid` on the step wins; `MetricDelta` resolves to `{step}--delta`.
- `FunnelSkeleton` — `steps` (default `3`) placeholder columns; `data-testid` base gives the ribbon `{base}--ribbon`. See Loading.

Ramp (palette steps, light → dark, in `constants.ts`):

| steps | palette steps |
| --- | --- |
| 2 | 500 · 600 |
| 3 | 400 · 500 · 600 |
| 4 | 400 · 500 · 600 · 700 |
| 5 | 300 · 400 · 500 · 600 · 700 |
| 6 | 200 · 300 · 400 · 500 · 600 · 700 |

Fills are palette primitives — no new tokens. They are written out as literal `fill-{hue}-{step}` classes in `classes.ts` (`funnelFillClasses`): Tailwind emits only the palette variables it sees used as utilities, so a `var(--color-teal-600)` built at runtime resolved to nothing and the band painted black. This intentionally differs from `CHART_PALETTE_FILL` (everything on 500): the funnel is a ramp. 200/300 are faint on white (1.2–1.9:1), so the labels carry the order, not the colour.

## States

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | ≥ 1 `FunnelStep` | Title cells over the ribbon; steps without `onClick` have no affordance. |
| Entrance | the funnel mounts (first render, or `FunnelSkeleton` swapped for `Funnel` when data arrives) | Each band scales 0 → 1 from its left edge, vertically centred, over 600ms `cubic-bezier(0.85, 0, 0.15, 1)`, 120ms after the previous step. Each step's labels fade in over 350ms ease-out, 250ms after their band starts. Off under `prefers-reduced-motion`. |
| Hover | pointer anywhere in a step column — title, band or the empty space between the dividers — with or without `onClick` | The step keeps full colour and gets the tint behind its title (`bg-states-primary-hover`, radius 10, inset 6px sides / 2px top and bottom). Every other step — labels and band — fades to 30% (`LINE_INACTIVE_OPACITY`), opacity 150ms ease-out. Leaving the list restores all steps. Pointer cursor only on a step with `onClick`. |
| Focus | keyboard focus on a step button | Same tint and dimming as hover, plus an inset `ring-focus-primary` ring. In forced-colors mode (Windows High Contrast) the ring is not painted, so `focus-visible:outline-hidden` shows a system outline instead. |
| Dark | a `[data-theme='dark']` ancestor | Every step flips to `1000 − step` (600 → 400, 700 → 300, 200 → 800, `slate-300` → `slate-700`). |
| Loading | consumer renders `<FunnelSkeleton steps={n} />` instead of `Funnel` | Same 288px track and `n − 1` dividers; per column three `Skeleton` shimmer blocks in the title cell's line boxes (name 64×16, value 48×28, caption 96×16), and a shimmering funnel silhouette (140px → 40px, linear) in place of the ribbon. Same height as the loaded funnel, so the card does not jump. `aria-busy='true'`, `aria-live='polite'`. |
| Empty | consumer renders `<ChartEmpty />` instead of `Funnel` | "No data", like the rest of the family. `Funnel` with no `FunnelStep` children renders `null`. |
| Error | — | None, as in the family. |

There is no selected / filtered state: the funnel has no selection model.

## Interactions

- **Click** — only on steps with `onClick`. The step is a native button: Enter and Space run `onClick`, it sits in tab order. The ribbon, halos and non-interactive steps are not clickable. A step with `disabled` stays a button but shows no tint or pointer cursor and does not fire `onClick`; it still dims the others on hover.
- **Hover / focus highlight** — every step, with or without an action. Hover wins over focus: while the pointer is on one step and keyboard focus on another, the hovered one is highlighted; leaving the list falls back to the focused step, and blurring it clears the highlight. Only keyboard focus counts (`:focus-visible`): a mouse click also focuses the button in Chromium, and that focus would keep the other steps dimmed after the pointer leaves with no ring to explain it. The index is dropped when it no longer names a step (steps shrank under a resting pointer, or a focused button was removed — Firefox / Safari fire no blur). State lives in `Funnel` (`hoverIndex ?? focusIndex`), shared with the steps through `FunnelStepContext` and with the ribbon through `FunnelRibbonContext`.
- **No tooltips on the ribbon, no filtering.** The caller owns what a click means (open a drill-down, set a filter elsewhere).
- Consumer analytics attributes (`data-analytics-*`, `aria-*`), `ref` and event props land on the step's real node — the button when `onClick` is set, a `div` otherwise (not focusable) — per `docs/metrics/contract.md`. There is deliberately no `stepProps` escape hatch.

## Edge cases & unclear states

- **Steps must be direct children.** Arrays and `.map` are fine (`Children.toArray` flattens them). A fragment, a wrapper component or text is ignored for geometry and rendering, with a dev warning ("only direct FunnelStep children are rendered — pass FunnelStep elements directly or as an array"). Reason: `Funnel` computes the ribbon in the same render pass from the children's props (no registration effect → no second render, no flicker, SSR HTML includes the ribbon, React Compiler-safe).
- **Step count.** 1 step or more than 6 renders anyway with a dev warning. 1 step → shade 600. More than 6 → the 6-step ramp, then 700 repeated for the extras.
- **Negative / non-finite `value`** → treated as `0` for the band and the label, dev warning.
- **`0`** → drawn as a 4px line; the label says `0`. **All zeros** → every step at 4px, no NaN.
- **Body thickness** = `max(4, value / max(values) × 140)`, centred in a 172px band. The 4px floor keeps a tiny step visible (1000 → 100 → 1 still shows the last step).
- **A later step may be bigger** than the earlier one; the ribbon widens into it with the same curve. There is no "must be non-increasing" rule.
- **Curve.** One cubic Bézier per column edge with flat tangents (control points at 45% / 55% of the column); the last column is flat. Each column is one solid colour with a hard seam at the divider; two halos (6px at 32% and 12px at 16% opacity, same colour) sit under the body. Dividers are drawn **over** the ribbon.
- **Width and scroll.** Columns are equal (`flex-1`) with `min-width: 120px`. The root is a horizontal scroll container (`overflow-x-auto`); an inner track is `max(240px, steps × 120px)` wide and carries the ribbon, so a card too narrow for every step scrolls instead of silently clipping the last steps (the `Chart` card clips overflow). Size the card so it does not scroll: 3 steps fit 465px, 4–6 steps need a wider card.
- **Long content.** Long name and long value → ellipsis (one line); long caption → 2-line clamp.
- **The step `ol` needs `min-w-0`.** Without it flex `min-width: auto` made the list (and the columns) grow to the long names' `nowrap` width and overflow, so columns were no longer equal. Found and fixed during implementation; keep it when touching `Funnel.tsx`.
- **Warnings fire once per message per page session** (module-level set), and never in production builds. The count warning includes the count, so `1` and `7` are separate messages.
- **Dark theme is CSS, not JS.** Each ribbon column's `<g>` carries its light fill class plus an `in-data-[theme=dark]:fill-{hue}-{1000−step}` pair (on the `<g>`, not the `<svg>` — the unlayered `svg:not([fill])` reset would win there). The dark variant matches any dark ancestor: a dark scope nested in a light page works; a light scope nested inside a dark one is not supported (no light reset).
- **RTL.** Under `dir='rtl'` the columns run right to left and the whole ribbon plot is mirrored (`rtl:-scale-x-100`), so step *i* stays under column *i* and the bands grow from the start edge.
- **Recharts remounts the bar shapes when its rectangle data changes identity** (`AnimatedItems` keys them by an animation id, even with `isAnimationActive={false}`). A remount replays the CSS entrance and skips the dimming transition. So the chart's own props never change on hover or a parent re-render: `data` depends on the step count only, `shape` is a module-level function, and thickness, fill and the active step reach the segments through `FunnelRibbonContext`. Keep it that way when touching `FunnelRibbon.tsx`.
- **The entrance plays once.** A resize still recomputes recharts' rectangles and remounts the shapes; when the last band's `animationend` fires the ribbon gets `data-entered` and the band animation is off from then on. A remount of `Funnel` itself (new `key`, skeleton → data) plays it again. Fill mode is `backwards`, not `both`: a held end frame would pin `opacity` / `transform` and beat the dimming.
- **Skeleton silhouette is a clipped `Skeleton`.** The shimmer is a CSS `background-image`, which an SVG path cannot carry, so one `Skeleton` block spans the band and is cut by an `objectBoundingBox` `<clipPath>` (x `0..1` across all steps, y scaled by `1/172`) built with `funnelSegmentPath`. The `url(#id)` rides on a CSS variable on the track because `Skeleton` overwrites its own `style`. The columns sit in their own row after it, so the dividers paint over it and `not-first:` only sees columns.
- **Ribbon needs layout.** `ResponsiveContainer` measures the track; in jsdom (no layout) it renders nothing, so unit tests mock it with a fixed size (same as the `LineChart` tests). The bands appear one frame after the labels on first paint.
- **Clean DOM.** No `data-testid` on `Funnel` → no derived test ids anywhere.

## Accessibility notes

- The ribbon is `aria-hidden` (recharts' `accessibilityLayer` is off); the title cells are the readable content.
- Motion respects `prefers-reduced-motion`: no entrance, and the dimming switches without a transition.
- Steps are an ordered list (`<ol>` / `<li>`); the button (or `div`) lives inside the `<li>`, so screen readers announce position in the list.
- Clickable steps are native buttons (Enter / Space, tab order, `focus-visible` ring). Non-clickable steps are not focusable.
- `MetricDelta` (`ChartDelta`) already carries `role='img'` + `aria-label` (e.g. "up 10").
- `FunnelSkeleton` announces `aria-busy` / `aria-live='polite'`.
- Colour is not the only carrier of order: the ramp shades are subtle, the step labels carry the sequence.

## Open questions / known limitations

- **Code Connect.** Code Connect for `funnel-section-title` waits for design to rename its variants `Type=Default / Type2` → `State=Default / Hover`. There is no `FunnelStep.figma.ts` until then.
- **Dark theme via CSS, not `useTheme`.** The ticket suggested `useTheme()`. The dark shade is selected with a `[data-theme='dark']` ancestor instead, because `useTheme` throws outside a `ThemeProvider`, and the CSS selector also works in SSR. It follows a dark scope nested in a light page; a light scope nested inside a dark one is not supported (same as the theme tokens, which only define `[data-theme="dark"]`). Same rule (`1000 − step`), same zero-token outcome.
- **Code vs spec differences** (code is documented above):
  - Horizontal scroll (spec non-goal): the root scrolls and the inner track is `max(240px, steps × 120px)` wide, because the `Chart` card would otherwise clip the last steps silently. `FunnelSkeleton` uses the same track. The scroller is not focusable, so without an interactive step it scrolls by pointer only.
  - The track's `240px` floor (spec only states `min-w-120` per column; equivalent for 2 steps, a floor for 1).
  - `FunnelStep`'s `ref` is typed `Ref<HTMLElement>` (spec: `Ref<HTMLButtonElement | HTMLDivElement>`), cast per node.
  - `FunnelSkeleton` takes `data-testid` and root HTML props.
- **No automated axe check** — the repo's e2e has no axe tooling; a11y is covered by role/keyboard assertions.
- **Entrance duration.** 600ms (the reference measured 1100ms, too long for a dashboard card); to be tuned in Storybook with design (`Entrance` story).
- No conversion / drop-off % between steps (a caption can carry it); no vertical layout; no `packages/gen-ui` catalog entry yet.
