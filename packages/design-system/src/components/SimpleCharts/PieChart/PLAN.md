# PieChart — Implementation Plan

> **Branch:** `feature/WDS-90-pie`
> **Figma root:** https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-122167&m=dev
>
> This plan is the working spec for adding `PieChart` to `SimpleCharts/`. Each task is intentionally small enough to land on its own; the **Context** block at the top of every step lists the files you need open and the design constraints to honour while writing code.

---

## 0. Architecture summary (read first)

We build a **compound component** modelled after `BarList`, but the donut SVG comes from `recharts@3.8.0` (already in `packages/design-system/package.json`). Recharts owns geometry + animations; we own the visual tokens, the legend, the loading state, and the cross-component interactions (hover sync, click-to-filter).

### Public API (final, target shape)

```tsx
<PieChart
  data={data}          // PieChartDatum[] — single source of truth (donut + legend)
  total={number}       // optional override; defaults to sum(data.value)
  activeName={string}  // optional controlled active key (sync with parent state)
  onActiveNameChange={(name: string | null) => void}
  // … HTMLAttributes<HTMLDivElement> + TestableProps
>
  <PieChartDonut>
    <PieChartCenter>
      <PieChartCenterValue>{formatValue(total)}</PieChartCenterValue>
      <PieChartCenterLabel>requests</PieChartCenterLabel>
    </PieChartCenter>
  </PieChartDonut>

  <PieChartLegend>
    {data.map(d => (
      <PieChartLegendItem
        key={d.name}
        name={d.name}                                  // matches PieChartDatum.name
        selected={selected === d.name}
        onClick={() => setSelected(toggle(selected, d.name))}
      >
        <Badge code style={d.color}>{d.name}</Badge>   // caller-driven left side
        <PieChartLegendValue>
          {formatValue(d.value)}
          <PieChartLegendPercent />                    // reads ratio from item ctx
        </PieChartLegendValue>
      </PieChartLegendItem>
    ))}
  </PieChartLegend>
</PieChart>
```

### Data model

```ts
interface PieChartDatum {
  name: string;          // unique key — used by legend ↔ slice sync
  value: number;
  color?: ChartColor;    // shared `ChartColor` (BarList already uses this)
  className?: string;    // optional override on the slice fill (Tailwind bg-*)
}
```

### Why this shape

- `data` lives on the root so the donut and legend render the same source — no risk of drift.
- The legend is still **JSX-driven** (caller composes badges/labels however they want). This matches how a real product mixes status codes, endpoint labels, country flags, etc.
- `name` is the join key for hover/active sync between donut and legend.
- Active state is dual-mode (controlled + uncontrolled), like Radix patterns.

### Layout (from Figma)

- Card: `Chart` (existing), default `min-h-196`, internal width matches `BarList` (`w-400` is the canonical demo width).
- Body row: `flex` with the donut occupying a fixed `168×136` block on the left, legend taking the rest.
- Donut SVG: `120×120` inside the `168×136` block, centered horizontally with `8px` top/bottom padding.
- Legend item: `h-32`, `rounded-8`, `pl-8 pr-8` (or `pr-12` on hover, per Figma).
- Slice fills: solid colours from the **palette `500`** tokens (e.g. `var(--color-amber-500)`), matching badge-strong.
- Inner radius: ~50–55% of outer (donut).

### Hover / active state

- `activeName` lives on the root (uncontrolled `useState<string | null>`, with optional control via `activeName` + `onActiveNameChange`).
- Hovering a `PieChartLegendItem` calls `setActive(name)`; leaving sets `null`.
- Hovering a donut slice does the same via recharts `onMouseEnter` / `onMouseLeave`.
- When `activeName` is set:
  - Inactive donut slices fade to `opacity-30`; active stays full.
  - The matching legend row gets the hover background.

### Filter (selected) state

- Filter is **controlled by the caller**, like BarList — caller filters `data` and re-renders with one entry. `selected` on the legend item just paints `aria-current` + `bg-states-primary-active`.
- When a single datum is rendered, the donut becomes a full ring of that colour and the percent reads `100%`.

### Accessibility

- Donut SVG is decorated (`aria-hidden`); the legend is the accessible representation.
- Clickable legend items expose `role="button"`, `tabIndex=0`, Enter/Space.
- `selected` ⇒ `aria-current="true"`.
- `PieChartSkeleton` exposes `aria-busy`/`aria-live` like `BarListSkeleton`.

---

## File layout

```
SimpleCharts/PieChart/
├── PLAN.md                       # this file
├── PieChart.tsx                  # root + context + active-state hook
├── PieChartDonut.tsx             # recharts <PieChart> + <Pie> + <Cell> + center slot
├── PieChartCenter.tsx            # PieChartCenter + Value + Label
├── PieChartLegend.tsx            # legend column
├── PieChartLegendItem.tsx        # row, hover/select sync
├── PieChartLegendValue.tsx       # right-aligned value slot
├── PieChartLegendPercent.tsx     # ratio-aware percent (reads item ctx)
├── PieChartSkeleton.tsx          # loading state
├── PieChartContext.ts            # context types + providers
├── classes.ts                    # CVA variants
├── constants.ts                  # SLICE_FILL, donut sizing constants
├── PieChart.figma.tsx            # Code Connect binding
├── PieChart.stories.tsx
├── PieChart.e2e.ts
└── index.ts
```

We also update:
- `SimpleCharts/index.ts` to re-export the new pieces.
- `SimpleCharts/docs/PieChart.md` (the contract doc).
- `SimpleCharts/CLAUDE.md` references `PieChart.md` (already does).

---

## Task list

Each task has a **Context** (what to read first), **Goal** (what to produce), and **Done when** (concrete acceptance).

### T1 — Local file scaffolding (no logic)

**Context:**
- `BarList/index.ts`, `BarList/BarList.tsx` — same scaffolding pattern
- `SimpleCharts/CLAUDE.md` § "Required Files Per Chart"

**Goal:**
- Create `PieChart/` empty files with correct named exports & displayName placeholders for: `PieChart`, `PieChartDonut`, `PieChartCenter`, `PieChartCenterValue`, `PieChartCenterLabel`, `PieChartLegend`, `PieChartLegendItem`, `PieChartLegendValue`, `PieChartLegendPercent`, `PieChartSkeleton`.
- `index.ts` re-exports everything (`Component` + `ComponentProps`).
- `PieChartContext.ts` with `PieChartContext` (root) + `PieChartItemContext` (per legend item, like `BarListItemContext`).

**Done when:** all stubs typecheck (`pnpm typecheck` clean) and the new exports appear in the local `index.ts`. No story or E2E yet.

### T2 — Tokens + constants

**Context:**
- `SimpleCharts/types.ts` (`ChartColor`)
- `theme/colors/primary.css` for `--color-{palette}-500` values (already verified — amber/green/red/blue/etc. exist)

**Goal:**
- `PieChart/constants.ts` exports:
  - `PIE_DONUT_SIZE = 120`, `PIE_OUTER_RADIUS = 60`, `PIE_INNER_RADIUS = 32` (≈ 53%, matches Figma).
  - `PIE_DONUT_PADDING_X = 24`, `PIE_DONUT_PADDING_Y = 8`, `PIE_DONUT_BLOCK = { w: 168, h: 136 }`.
  - `SLICE_FILL: Record<ChartColor, string>` — CSS-variable strings for slice fills (e.g. `'var(--color-amber-500)'`, `'var(--color-slate-500)'`, `'var(--color-w-orange-500)'` for `brand`).
- `PieChart/classes.ts` with the layout CVAs (`pieChartRootClasses`, `pieChartLegendClasses`, `pieChartLegendItemVariants`, `pieChartCenterClasses`, etc.).

**Done when:** colour tokens cover every `ChartColor`; `tsc` passes.

### T3 — Root component + context

**Context:**
- `BarList/BarList.tsx` (controlled/derived state pattern)
- `BarList/BarListContext.ts`

**Goal:** implement `PieChart` (root):
- Props: `data: PieChartDatum[]`, optional `total`, controlled `activeName`/`onActiveNameChange`, `data-testid`, …`HTMLAttributes<HTMLDivElement>`.
- Uses internal `useState` for active name when uncontrolled.
- Computes `total = total ?? sum(data.value)`.
- Validates: filters out non-finite values, warns once in dev when total is 0 (every slice 0% / empty).
- Exposes context: `{ data, total, activeName, setActive, isControlled }`.
- Wraps children in `TestIdProvider`.
- Root `<div data-slot='pie-chart'>` with `flex` body; layout matches Figma.

**Done when:** rendering an empty `<PieChart data={[]} />` returns a `data-slot='pie-chart'` div without crashing; `tsc` clean.

### T4 — Donut (recharts) + center slot

**Context:**
- recharts API: `<PieChart>`, `<Pie data activeIndex onMouseEnter onMouseLeave>`, `<Cell fill>`. Confirm v3.8 API via the lib's types.
- Figma donut metrics from T2.
- `PieChartContext` from T3.

**Goal:** `PieChartDonut`:
- Reads `data`, `activeName`, `setActive` from context.
- Renders recharts `<ResponsiveContainer width={168} height={136}>` (or fixed-size `<RechartsPieChart>` if responsiveness is unnecessary at this scale — pick fixed 168×136 for screenshot stability).
- Renders one `<Cell>` per datum with `fill = data.className ? undefined : SLICE_FILL[color]`. When `className` is set, apply via the `<Cell>` `className` prop.
- `inactive opacity` controlled via `<Cell opacity={activeName && d.name !== activeName ? 0.3 : 1}/>`.
- Mouse hover on a slice → `setActive(d.name)`; leave → `setActive(null)`.
- `aria-hidden` on the SVG wrapper.
- Center text rendered as absolutely-positioned children (`PieChartCenter` / `PieChartCenterValue` / `PieChartCenterLabel`) so callers can pass any markup (number + units, or icon + text). These three sub-components use the testId pattern.

**Done when:** rendering with the demo dataset produces a 120 px donut centred in a 168×136 block, with the centre slot above. No console errors. The SVG has no role beyond `img` / `aria-hidden`.

### T5 — Legend + item + value/percent slots

**Context:** `BarList/BarListItem.tsx`, `BarList/BarListPercent.tsx`, `BarList/classes.ts`.

**Goal:**
- `PieChartLegend`: flex column container, `pl-0 pr-12`, `gap-0`, full-width remainder of the card body. Forwards `data-testid`.
- `PieChartLegendItem`:
  - Props: `name: string`, `selected?: boolean`, `onClick?`, `value?: number` (optional override; otherwise derived from root data via `name`).
  - On hover: calls root `setActive(name)`. On leave: `setActive(null)`.
  - Reads `activeName` to apply the hover background even when the user is hovering the slice (sync the other way).
  - `selected` paints `bg-states-primary-active` + `aria-current`. Interactive when `onClick`.
  - Provides `PieChartItemContext` with `{ ratio, selected, name }` so percent slot can read it.
- `PieChartLegendValue`: flex row, `gap-2 items-center pr-8`, `text-xs font-mono`. Hover state in CVA bumps padding to `pr-12` (mirrors Figma).
- `PieChartLegendPercent`:
  - Reads ratio from item context, renders the trailing `· N%` group: `<span aria-hidden>·</span><span>{N}<span className='text-text-secondary'>%</span></span>`.
  - Same `digits` + `variant` props as `BarListPercent` (split / muted / inherit).

**Done when:** the legend lays out exactly like Figma `7490-122167` and the row's percent matches `value / total`.

### T6 — Hover sync ↔ donut

**Context:** T4 + T5 in place.

**Goal:** verify that hovering a legend row dims other donut slices (and vice versa) — the context glue should already make this work, but explicitly add cross-component testIds for E2E.

**Done when:** `<PieChart>` showcase in Storybook demonstrates the bidirectional dim. Test interactively: hover a legend row → only the corresponding slice keeps `opacity 1`.

### T7 — Skeleton

**Context:** `BarList/BarListSkeleton.tsx`, `Skeleton`. Figma `7519-2618`.

**Goal:** `PieChartSkeleton`:
- Same `Chart`-friendly card body layout.
- Donut block: a `Skeleton` circle (`w-120 h-120`) inside the same 168×136 box.
- Legend column: `rows` (default 5) `Skeleton` bars `h-24 rounded-6` with 8 px gap.
- `aria-busy` + `aria-live='polite'`.

**Done when:** `<PieChartSkeleton />` matches the Figma loading mock with 5 rows.

### T8 — Stories

**Context:** `BarList.stories.tsx`, the user's brief, Figma nodes (default + hover + filter + loading + truncated).

**Goal:** `PieChart.stories.tsx` covering:
1. **Default** — five rows + click-to-filter (caller toggles `selected`); FilterX action when filtered, like BarList Default.
2. **HoverHighlight** — Default story is enough; document hover behaviour via story description (no separate state needed; CSS handles hover, recharts gives the slice hover).
3. **TruncatedLabels** — long label content forced into a narrow card; demo `OverflowTooltip` on the legend label slot.
4. **TruncatedLabelsWithTooltip** — same as BarList variant for parity.
5. **Loading** — render `<PieChartSkeleton />`.
6. **Edge cases:**
   - **SingleSlice** — one datum at 100% (full ring).
   - **TwoSlices** — verifies separator angle and label sync.
   - **CustomColors** — pass `className: 'fill-violet-500'` (recharts uses `fill`, not `bg-`; verify which Tailwind utility wins).
   - **EmptyData** — show `<ChartEmpty>` instead of donut when `data.length === 0`.
   - **ZeroTotal** — every value is 0; donut renders as empty ring with 0% labels and no warnings.

Use `Chart`, `ChartHeader`, `ChartTitle`, `ChartActions`, `Tooltip`, `Badge`, `OverflowTooltip` — same supporting cast as BarList.

**Done when:** every story renders without console errors; `pnpm storybook` shows them under "Data display / SimpleCharts / PieChart".

### T9 — Code Connect binding

**Context:** `BarList.figma.tsx`.

**Goal:** `PieChart.figma.tsx` mapping each Figma node ID to a real story-style example. The example must render `Chart` + `PieChart` with the demo dataset. Include the three states from the Figma design: `default`, `hovered`, `filtered`.

**Done when:** `figma connect publish` (dry run) accepts the file (we don't publish in this PR, but it must parse).

### T10 — E2E

**Context:** `BarList.e2e.ts`, `docs/e2e-test-rules.md`.

**Goal:** `PieChart.e2e.ts`:
- `Screenshots` group: `Default`, `Hover` (hover first legend row), `Selected`, `Focus`, `Loading`, `SingleSlice`, `EmptyData`, `TruncatedLabels`.
- `Interactions`:
  - clicking a legend row toggles `aria-current`
  - hovering a legend row dims inactive slices (assert via attribute on the slice, e.g. `data-active='false'`)
  - hovering a slice highlights its legend row
  - keyboard `Enter` / `Space` activates an interactive row
  - zero-total renders all rows with `0%`
- `Accessibility`: donut is `aria-hidden`, skeleton announces busy/live, focus order Tab → first action → first row.

**Done when:** `pnpm e2e --shard=1/3 PieChart` passes locally (or accept first-run snapshot creation).

### T11 — Docs (`docs/PieChart.md`)

**Context:** `docs/BarList.md`, the new behaviours we just shipped.

**Goal:** new file matching BarList structure: Overview / Figma / API / Data model / States / Interactions / Edge cases / A11y / Open questions.

**Done when:** the doc covers every state we implemented, every prop we exposed, and every gotcha discovered while building.

### T12 — Index re-exports

**Goal:** update `SimpleCharts/index.ts` to add the new exports next to BarList. Keep the alphabetical-ish grouping.

### T13 — Quality gates

- `pnpm lint`
- `pnpm typecheck`
- `pnpm storybook` (smoke check the new stories)
- (optional in this PR) `pnpm e2e:docker -- PieChart` to lay down baseline screenshots.

---

## Things to verify while building

- [ ] Recharts v3.8 default animation is on; we likely keep it (matches BarList's mount transition).
- [ ] `<Cell className=>` in recharts 3.8 — confirm whether it lands on `<path>` or wrapper; if not on `<path>`, we set fill via inline CSS-variable string instead of Tailwind.
- [ ] `data-slot` attributes pass through into recharts elements (our query selectors must work in E2E).
- [ ] Hover events on `<Pie>` give the index — convert to `data[index].name` before calling `setActive`.
- [ ] Filter state ⇒ a single datum: Figma shows the donut ring filled with that single colour. Confirm recharts renders 100% as a closed circle (not an arc) with one cell.
- [ ] When `total = 0`, recharts will render an empty/blank donut. We render an outline-only ring (border) so the user still sees the chart shape — verify or accept blank.

---

## Out of scope (for this PR)

- `data`-less convenience prop (similar discussion as BarList's "auto-max").
- Animated transition between filter states (single ring ↔ multi-ring) — recharts doesn't morph segments; if needed, build later via Framer Motion.
- Built-in tooltip on slice hover — keep external composition (Tooltip wrapper around legend rows) like BarList does.
