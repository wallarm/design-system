# LineChart Highlighted Range Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `<LineChartRange>` — a data-driven highlighted X range on `LineChart` with edge labels, in-range line recolouring, popover danger dot and a screen-reader description list.

**Architecture:** Pure geometry/label helpers in `LineChart/lib/rangeGeometry.ts`. Each `<LineChartRange>` registers its raw props into a new `LineChartRangeContext` registry owned by the `LineChart` root (register/unregister on mount, like `LineChartZoomContext.registerEnabled`). The range draws fill/edges/labels inside recharts' `ReferenceArea` layer; `LineChartLine` reads the registry and renders a danger-coloured copy of itself clipped to the range rectangles; `LineChartTooltip` marks rows `inRange`; the root renders an `sr-only` list of descriptions.

**Tech Stack:** React 19 (React Compiler on), recharts 3.10.1, Tailwind, Rstest + Testing Library, Playwright, Storybook 10.

**Spec:** `docs/superpowers/specs/2026-11-12-linechart-highlighted-range-design.md` (read it first — it holds every visual value).

All paths below are relative to `packages/design-system/src/components/SimpleCharts/LineChart/` unless absolute from repo root.

## Global Constraints

- Fill `var(--color-states-danger-hover)`; edges 1px `var(--color-border-danger)` dash `3 3`; in-range line `var(--color-bg-fill-danger)`; labels 10px/12px medium `text-text-danger` (SVG: `fill='var(--color-text-danger)'`, `fontSize={10}`, `fontWeight={500}`, `fontFamily='var(--font-sans)'`); popover in-range dot = palette `'red'`.
- Ongoing end label default text: `Ongoing`.
- `LINE_STROKE_WIDTH` stays `2`. No new dependencies. Additive API only — no breaking change, no migration.
- No hand memoisation in new code (React Compiler) — existing `useMemo`/`useCallback` may stay. No `any`. Named exports, `displayName` on every component, `data-slot` on root elements, test IDs via `useTestId` (`docs/test-id-pattern.md`).
- No Figma URLs anywhere outside `*.figma.ts`.
- Story names spaced (`'Highlighted Range'`), story data in file, no local wrapper components, no inline arrow callbacks in story JSX.
- E2E baselines are generated in CI only (`[update-screenshots]`); never run Playwright locally.
- Commits: `feat(line-chart): … (WDS-207)` style, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Verify commands (run from `packages/design-system`): `pnpm test:run -- <path>`, `pnpm lint`, `pnpm typecheck`, `pnpm compiler:audit`.

## Review Focus

1. Range edge between two buckets (`from`/`to` not equal to any datum X) on the default category X axis → edge interpolated between neighbours, line colour switches at that same pixel. Test in Task 1 (`resolveRangeEdges` interpolation) and covered visually by story A (end 11:52).
2. Data re-sorted/descending or with a single datum → helper returns `null` (no crash, nothing drawn). Test in Task 1.
3. Range whose `seriesKey` series is filtered out via `filteredKeys` → fill/edges still draw, no line copy, no crash. Test in Task 3.
4. `LineChartRange` unmounting (consumer removes the range) → registry entry removed, sr list item disappears, line copy disappears. Test in Task 2.
5. Two charts on one page each with a range → clipPath ids unique per line instance (`useId`), no cross-chart clipping. Test in Task 3 (two charts render distinct `clipPath` ids).

---

### Task 1: Pure range helpers

**Files:**
- Create: `lib/rangeGeometry.ts`
- Test: `lib/rangeGeometry.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type RangeX = number | string;
  export interface RangeEdges { x1: number; x2: number; clampedStart: boolean; clampedEnd: boolean }
  // xs: data X values in data order; pixelOf(i) = pixel of datum i; plotLeft/plotRight = plot area edges
  export function resolveRangeEdges(args: { from: RangeX; to?: RangeX; xs: readonly RangeX[]; pixelOf: (index: number) => number | undefined; plotLeft: number; plotRight: number }): RangeEdges | null;
  export function isInRange(x: RangeX, range: { from: RangeX; to?: RangeX }, xs: readonly RangeX[]): boolean;
  export function findOverlappingRanges(ranges: readonly { key: string; from: RangeX; to?: RangeX }[]): [string, string][];
  export interface RangeLabelLayout { start: { x: number; anchor: 'end' } | null; end: { x: number; anchor: 'start' | 'end' } | null }
  export function layoutRangeLabels(args: { edges: RangeEdges; ongoing: boolean; visibleRangeCount: number; startWidth: number; endWidth: number; plotLeft: number; plotRight: number; gap: number }): RangeLabelLayout;
  ```

- [ ] **Step 1: Write failing tests** in `lib/rangeGeometry.test.ts` (`@rstest/core`). Use `xs = [0, 5, 10, 15, 20]` and `pixelOf = i => 100 + i * 50` (pixels 100…300), plot 100…300.
  - `resolveRangeEdges({from: 5, to: 15})` → `{x1: 150, x2: 250, clampedStart: false, clampedEnd: false}`
  - interpolation: `{from: 7, to: 12}` → `x1 = 170`, `x2 = 220`
  - `{from: -5, to: 10}` → `x1 = 100`, `clampedStart: true`
  - ongoing `{from: 10}` → `x2 = 300`, `clampedEnd: true`; `{from: 10, to: 99}` → `x2 = 300`, `clampedEnd: true`
  - fully outside `{from: 30, to: 40}` and `{from: -10, to: -1}` → `null`
  - `xs` length 1, or descending `xs` → `null`
  - string X: `xs = ['a','b','c']`, `{from: 'b', to: 'c'}` → pixels of index 1 and 2; `{from: 'zz'}` → `null`
  - `isInRange(10, {from: 5, to: 15}, xs)` true; `isInRange(15, …)` true (inclusive); `isInRange(16, …)` false; ongoing `{from: 5}` → `isInRange(999, …)` true; string X by index between matched edges
  - `findOverlappingRanges([{key:'a',from:0,to:10},{key:'b',from:5,to:20},{key:'c',from:30}])` → `[['a','b']]`; touching (`to: 10` / `from: 10`) counts as overlap; ongoing overlaps anything starting after its `from`
  - `layoutRangeLabels`: one range `x1=150,x2=250`, widths 30, gap 4 → `start = {x: 146, anchor: 'end'}`, `end = {x: 254, anchor: 'start'}`; `visibleRangeCount: 2` → both `null`; `clampedStart` → `start: null`; start label that would cross `plotLeft` (x1=120, width 30) → `start: null`; end label crossing `plotRight` → `end: null`; ongoing → `end = {x: plotRight, anchor: 'end'}` (inside); ongoing end label colliding with start label (`x1` within `endWidth + gap` of `plotRight`, start label region overlapping) → hide end
- [ ] **Step 2: Run** `pnpm test:run -- src/components/SimpleCharts/LineChart/lib/rangeGeometry.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** `lib/rangeGeometry.ts`. Numeric `xs` must be strictly ascending, else `null`. Interpolate linearly between the bracketing data points for numeric X; string X = exact index match only. Clamp to first/last datum pixels — note plot edges equal first/last datum pixels in this chart (no axis padding), but use `plotLeft`/`plotRight` for the clamp per the spec.
- [ ] **Step 4: Run the test** → PASS.
- [ ] **Step 5: Commit** `feat(line-chart): range geometry helpers (WDS-207)`.

### Task 2: Registry, `<LineChartRange>`, sr list, exports

**Files:**
- Modify: `LineChartContext.ts` (add registry types + context), `LineChart.tsx` (own registry state, provide context, render sr list, overlap warn), `lib/warn.ts` (add `warnLineChartRange`), `index.ts`, `../index.ts` (re-export if the barrel lists names), `classes.ts` (sr list class if needed)
- Create: `LineChartRange.tsx`
- Test: `LineChartRange.test.tsx`

**Interfaces:**
- Consumes: Task 1 helpers.
- Produces:
  ```ts
  // LineChartContext.ts
  export interface LineChartRangeEntry { key: string; from: number | string; to?: number | string; seriesKey?: string; description?: string }
  export interface LineChartRangeContextValue { ranges: readonly LineChartRangeEntry[]; registerRange: (entry: LineChartRangeEntry) => () => void }
  export const LineChartRangeContext: Context<LineChartRangeContextValue>; // default { ranges: [], registerRange: () => () => {} }
  // LineChartRange.tsx
  export interface LineChartRangeProps { from: number | string; to?: number | string; seriesKey?: string; startLabel?: ReactNode; endLabel?: ReactNode; description?: string }
  export const LineChartRange: FC<LineChartRangeProps>;
  ```
  Test IDs (with root `data-testid='lc'`): `lc--range` (group, also `data-key`), `lc--range-start-label`, `lc--range-end-label`, `lc--range-descriptions` (the `<ul>`).

- [ ] **Step 1: Write failing tests** in `LineChartRange.test.tsx` (Testing Library). Recharts' `ResponsiveContainer` measures 0 in jsdom — check how `HorizontalBarStack.test.tsx` / other chart tests deal with size; if none, stub `ResizeObserver`/`getBoundingClientRect` or `rs.mock` `ResponsiveContainer` to a fixed-size passthrough so children mount. Tests:
  - root renders `lc--range-descriptions` `<ul>` with one `<li>` per range with `description` (text equals the description); no `<ul>` when no range has one
  - unmounting one `<LineChartRange>` (rerender without it) removes its `<li>`
  - the `<ul>` is visually hidden (`sr-only` class) and sits outside the `aria-hidden` body
  - two overlapping ranges → `console.warn` called once with a message containing `[LineChartRange]` (spy via `rs.spyOn(console, 'warn')`)
  - with a measured chart: one range renders `lc--range` plus both label test IDs with the consumer's text; two ranges render no label test IDs; ongoing range end label text is `Ongoing` by default and the `endLabel` prop overrides it
- [ ] **Step 2: Run** `pnpm test:run -- src/components/SimpleCharts/LineChart/LineChartRange.test.tsx` → FAIL.
- [ ] **Step 3: Implement.** Root keeps `ranges` in `useState`; `registerRange` appends and returns a remover (stable function). Registry gets its own provider so `LineChartDataContext` is untouched. Overlap warn: `useEffect` in root on `ranges` via `findOverlappingRanges`. `LineChartRange`: `useId()` for `key`, register in `useEffect` keyed on its props; compute edges with `useXAxisScale()` (pixel of datum i = `scale(xs[i])`, for a category axis add half band width if `scale.bandwidth` exists) and `usePlotArea()`; render `<ReferenceArea x1 x2>`-equivalent: since edges are pixel values, render a custom SVG group via `<ReferenceArea>`'s `shape` prop or recharts' z-layer so it sits between grid and lines (spec: ReferenceArea zIndex 100). Rect fill + two dashed `<line>`s (no edge line is skipped for clamped edges — Figma D draws them) + labels from `layoutRangeLabels` (measure label width with an estimate `chars × 5.5px` or `getComputedTextLength` after mount — implementer's call; label `y` = plot top + 4 + font ascent, `dominantBaseline='hanging'` fine). Visible-range count = number of registry entries whose `resolveRangeEdges` is non-null (compute per range from the registry). `displayName = 'LineChartRange'`. Export from `index.ts` (+ props type) and `../index.ts` if it enumerates LineChart names.
- [ ] **Step 4: Run the test** → PASS; also run the whole LineChart folder tests.
- [ ] **Step 5: Commit** `feat(line-chart): LineChartRange with labels and screen-reader list (WDS-207)`.

### Task 3: In-range line colour + tooltip

**Files:**
- Modify: `LineChartLine.tsx`, `LineChartTooltip.tsx` (+ `LineChartTooltipRow` type), `LineChartHoverPopoverRow.tsx` only if a `color` override prop is needed
- Test: `LineChartLine.range.test.tsx`, `LineChartTooltip.range.test.tsx` (or one `LineChartRange.integration.test.tsx`)

**Interfaces:**
- Consumes: `LineChartRangeContext`, `resolveRangeEdges`, `isInRange`.
- Produces: `LineChartTooltipRow.inRange: boolean` (always present). `LineChartLine` renders an extra `<Line>` with `data-in-range='true'` and `data-testid` `…--line-in-range` (`useTestId('line-in-range')`), stroke `var(--color-bg-fill-danger)`, same `type`/`strokeWidth`/`dasharray`/`connectNulls`, `clipPath='url(#<id>)'`, plus a `<defs><clipPath id>` of one rect per range targeting this series (x1..x2, full plot height).

- [ ] **Step 1: Write failing tests:**
  - series `attacks` with a range `seriesKey='attacks'` → an `…--line-in-range` element exists with `stroke` `var(--color-bg-fill-danger)` and a `clip-path` referencing an existing `<clipPath>`; series `usual` has none
  - range targeting a series in `filteredKeys` → no in-range copy, `lc--range` still rendered
  - two charts each with a range → their clipPath ids differ
  - tooltip render-prop: hovered datum inside range → `rows.find(r => r.series.key === 'attacks').inRange === true`, `usual` row `false`; outside range → all `false` (drive the tooltip by rendering `LineChartTooltip` children render-prop and triggering recharts mouse move, or unit-test the row-building function extracted as `buildTooltipRows(datum, visibleSeries, ranges, xKey, xs)` in `lib/` — preferred, simpler)
  - default popover: in-range row dot colour resolves to palette `red` (`ChartHoverCardRow` gets `color='red'`)
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Recharts needs `<Line>` as a direct chart child: `LineChartLine` returns a fragment `[<Line …base/>, <Line …danger/>]` — verify recharts 3 accepts fragments from a function component (it registers via context in v3; if not, render the copy with `<Customized>` or move the copy into `LineChartRange`'s layer — keep whatever renders with no seam). `clipPath` rect coordinates from the same `resolveRangeEdges` so colour switches at the identical pixel as the fill edge. Hide the copy when `activeKey` dims the line? — copy uses the same `opacity` as the base line. Tooltip: extract `buildTooltipRows` and use it in `renderContent`; default popover passes `color={row.inRange ? 'red' : row.series.color ?? 'slate'}` via a `color` prop override on `LineChartHoverPopoverRow` (add `color?: ChartColor | string` — additive).
- [ ] **Step 4: Run** the new tests + whole LineChart folder → PASS.
- [ ] **Step 5: Commit** `feat(line-chart): recolour series and mark popover rows inside ranges (WDS-207)`.

### Task 4: Stories, E2E, docs

**Files:**
- Modify: `LineChart.stories.tsx` (new stories + `LineChartRange` in `subcomponents`), `lib/sampleData.ts` (spike dataset: 5-minute buckets 10:20–12:20, `attacks` spiking to ~3,250 around 11:30, `usual` baseline ~100 per bucket), `LineChart.e2e.ts`, `../docs/LineChart.md`
- No new test file beyond e2e.

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Stories** (each with a JSDoc paragraph — that is the Storybook Overview copy; `Chart` + `ChartHeader` + `ChartTitle` "Attacks per 5 minutes", `w-800` wrapper like Figma, series `attacks` `color: 'slate'` + `usual` `variant: 'dashed'`, `color: 'var(--color-border-strong-primary)'`):
  - `HighlightedRange` (A): `from` 11:20, `to` 11:52, labels via the chart time formatter, `description`
  - `HighlightedRangeHover` (B): same chart; `LineChartTooltip xTickFormatter` formats the bucket as `11:25 – 11:30` (start + 5 min) — named formatter defined before `return`
  - `OngoingRange` (C): no `to`
  - `SeveralRanges` (D): one range starting before the first datum + one mid-chart
  - `RangeWithLegend` (E): `LineChartLegend` with `Attacks` / `Usual` items, body height 140
- [ ] **Step 2: E2E** — add `'Highlighted Range'`, `'Highlighted Range Hover'`, `'Ongoing Range'`, `'Several Ranges'`, `'Range With Legend'` to `createStoryHelper`; screenshots for each; an interaction test hovering inside the range on `Highlighted Range Hover` asserting the popover (`line-chart--hover-popover`) shows `Attacks` and `Usual`; an accessibility test asserting `line-chart--range-descriptions` contains the description text. Locate by `data-testid` only (stories must pass `data-testid='line-chart'` to the root). Put new tests in `Visual` / `Interactions` / `Accessibility` groups per `docs/e2e-test-rules.md`. Do not run Playwright locally.
- [ ] **Step 3: Docs** — update `../docs/LineChart.md`: API (`LineChartRange` props, `LineChartTooltipRow.inRange`, `LineChartHoverPopoverRow.color`), States (A–E), Edge cases (interpolated edges on category axis, clamping, overlap drawn as is + warn, labels hidden for 2+ ranges/collisions, sr list includes off-window ranges), Accessibility (sr list), Open questions (line width 1.5 vs 2 kept at 2; red-500 dot vs red-600 line by design).
- [ ] **Step 4: Verify** `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm compiler:audit` (no new bailouts in LineChart files) — all green.
- [ ] **Step 5: Commit** `feat(line-chart): highlighted range stories, e2e and docs (WDS-207)`.
