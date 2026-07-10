# Metric — Recompose as a Compound Chart + ChartDelta Red Semantic

- **Date:** 2026-07-08
- **Status:** Approved (design) — ready for implementation plan
- **Branch:** `simple-charts`
- **Component:** `packages/design-system/src/components/SimpleCharts/Metric/`
- **Figma:**
  - Metric component: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11437-11939
  - Metric options / brick set: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11439-4983
  - Documentation board (Metric Chart — options): https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11520-4054

## Goal

Recompose `Metric` from a single flat component into a **compound** ("Lego set") that mirrors the rest of the SimpleCharts family, extract its header row as a **shared block** that `HorizontalBarStack` (HBS) reuses, fix the **delta color semantic** (negative → red), and **consolidate** the Storybook stories into one gallery.

## Motivation

- **Family consistency.** `Chart`, `PieChart`, `BarList`, and `LineChart` each expose 6–7 sub-components. `Metric` is the *only* flat chart. Compound brings it in line, and the idiom to mirror is `Chart` (root wraps children in `TestIdProvider`; each sub-component derives its slot id via `useTestId`).
- **Reuse.** Metric's value/total/delta header row is Figma's `_metric-item-common`. Today only `ChartDelta` is shared between Metric and HBS; the value typography is duplicated. Extracting a `MetricHeader` block lets HBS compose the same bricks — realizing "Metric's inner parts repurposed in HBS."
- **Correctness.** Figma updated the delta chip: `negative` is now **red** (Badge `red`, tokens `badge/red-dark #9f0712` / `badge/red-light #ffe2e2`), no longer `w-orange`.
- **Clarity.** Six single-Metric stories become one gallery matching the Figma options board.

## Compound API

Mirrors the `Chart` idiom exactly (root `TestIdProvider` + sub-components via `useTestId`, one file per sub-component, `classes.ts`, barrel `index.ts`, `data-slot` kebab-case, `displayName`, `ref` prop, `cn()` merge, no `any`, no inline styles, tokens only).

```tsx
<Chart>
  <ChartHeader><ChartTitle>Findings</ChartTitle></ChartHeader>
  <Metric>
    <MetricHeader>
      <MetricValue>91</MetricValue>
      <MetricTotal connector="of">120</MetricTotal>
      <MetricDelta value={10} sentiment="negative" />
    </MetricHeader>
    <MetricCaption>blocked today</MetricCaption>
  </Metric>
</Chart>
```

All bricks are omittable. Only `MetricValue` is expected in practice; everything else is optional.

### `Metric` (root)
- Extends `HTMLAttributes<HTMLDivElement>` + `TestableProps`; accepts `ref`.
- Renders a column container: `data-slot="metric"`, `data-testid={testId}`, wraps `children` in `<TestIdProvider value={testId}>`, `cn(metricRootClasses, className)`.
- Layout per Figma `_metric-item-common`: horizontal padding `px-16`; vertical spacing is owned by the `Chart` card frame (the card supplies `pt-32 pb-8`), so the Metric body itself carries no/minimal vertical padding. Reconcile exact tokens against Figma during implementation.

### `MetricHeader` — the shared block
- Extends `HTMLAttributes<HTMLDivElement>`; `ref`. Slot id via `useTestId('header')`, `data-slot="metric-header"`.
- Baseline flex row holding `MetricValue` + optional `MetricTotal` + optional `MetricDelta`.
- Spacing per Figma: value↔total tight (6px), group↔delta 8px, `items-baseline`. Achieved without an extra value-group wrapper — `MetricTotal` owns its left spacing so the compound stays flat.
- **This is the block HBS composes** (see below).

### `MetricValue`
- Extends `HTMLAttributes<HTMLSpanElement>`; `ref`. Slot id via `useTestId('value')`, `data-slot="metric-value"`.
- The headline number: 30px display type. Per Figma the value uses the **display** font (`Font/Sans-display`, `heading/3xl/medium`, line-height 36). Verify the correct utility/token (`text-3xl` mapping vs a `font-display` class) during implementation.
- Number formatting: a **numeric** child is rendered via `toLocaleString('en-US')`; a non-numeric child (`ReactNode`) renders as-is.

### `MetricTotal`
- Extends `HTMLAttributes<HTMLSpanElement>`; `ref`. Slot id via `useTestId('total')`, `data-slot="metric-total"`.
- `connector?: 'slash' | 'of' | 'total'`, default `'slash'`.
- Numeric child formatted via `toLocaleString('en-US')`; non-numeric renders as-is.
- Rendering per connector (number in primary text at the total size; connector words muted `text-secondary`):
  - `slash` → `/120`
  - `of` → `of 120`
  - `total` → `120 total`

### `MetricDelta`
- Thin brick over the shared `internal/ChartDelta`. Props = `Pick<ChartDeltaProps, 'value' | 'trend' | 'sentiment'>`; slot id via `useTestId('delta')`, forwarded to `ChartDelta`.
- Rationale: keeps the compound uniform (`Metric*` bricks) and gives the chip a `--delta` slot id, while `ChartDelta` stays the single source of color/arrow logic shared with HBS.

### `MetricCaption`
- Extends `HTMLAttributes<HTMLSpanElement>`; `ref`. Slot id via `useTestId('caption')`, `data-slot="metric-caption"`.
- Muted subline under the header (`text-xs text-text-secondary`). Children `ReactNode`.

## HorizontalBarStack reuses the header block

HBS keeps its data-driven bar + legend unchanged. It **replaces its hand-rolled header row** with the shared bricks:

```tsx
<TestIdProvider value={testId}>
  <MetricHeader>
    <MetricValue>{value}</MetricValue>
    {delta && <MetricDelta {...delta} />}
  </MetricHeader>
  {/* …bar + legend as today… */}
</TestIdProvider>
```

- HBS never uses `MetricTotal` — its `total` prop stays the **bar** denominator (drives the grey remainder tail), so the `total` semantic clash between the two components never arises.
- Unifies the header value typography through the shared `MetricValue`.
- **Testid integration:** the shared bricks derive ids via `useTestId`, so HBS must supply the correct base. Approach: wrap HBS's header region in `<TestIdProvider value={testId}>` so the bricks resolve `{testId}--header` / `--value` / `--delta`. This adds a new `--header` slot to HBS (previously value/delta were computed inline); update HBS's tests accordingly.

## ChartDelta — red semantic

- `SENTIMENT_COLOR.negative`: `'w-orange'` → `'red'`. `positive` (green) and `neutral` (slate) unchanged. `w-orange` retired from the chip.
- Update the JSDoc in `internal/ChartDelta.tsx`, the stale `negative → w-orange` line in `Metric.stories.tsx`'s description, `docs/Metric.md`, and `docs/HorizontalBarStack.md`.
- Color = sentiment, arrow = trend, independent axes — unchanged. (A red chip with an up arrow — "count rose, and that's bad" — is valid.)

## Chart-card composition

Metric stays **body-only**, composed under `Chart` / `ChartHeader` / `ChartTitle`, exactly like the rest of the family (and as Figma shows it inside `_chart-card`). No card logic lives in Metric.

## Storybook — one gallery

Replace the six single-Metric stories (`Default`, `Positive`, `Neutral`, `WithTotal`, `WithCaption`, `NoDelta`) with a single **`Gallery`** story: a grid of `Chart` cards mirroring the Figma *Metric Chart — options* board — value-only, +delta (red/green/neutral), +total in each connector form, +caption, and representative combos. Keep story data inline and static. `title: 'Data display/SimpleCharts/Metric'`, `parameters.design.url` = the Metric node.

## Testing

- **Metric unit tests** (new): compound rendering, each brick optional, `MetricTotal` connector forms, numeric formatting, `data-testid` cascade (`metric--value/-total/-delta/-caption/-header`), `MetricDelta` sentiment→Badge color (incl. `negative → red`).
- **Metric E2E** (`Metric.e2e.ts`, new — currently missing): screenshot of the `Gallery` story. Metric is display-only (no hover/selected/focus), so the interactive-state matrix in the SimpleCharts CLAUDE.md does not apply.
- **Code Connect** (`Metric.figma.tsx`, new — currently missing): bind to the Metric node per the SimpleCharts CLAUDE.md rules.
- **ChartDelta**: assert `negative` renders the red Badge.
- **HBS**: update tests for the new `--header` slot; if `MetricValue`'s display typography differs from HBS's current header value styling, HBS screenshot baselines will shift — regenerate them.

## Docs to update

- `Metric/` — new/updated: `Metric.tsx` split into `MetricValue.tsx`, `MetricTotal.tsx`, `MetricDelta.tsx`, `MetricHeader.tsx`, `MetricCaption.tsx`; `classes.ts`; `index.ts` barrel; `Metric.stories.tsx`; `Metric.e2e.ts`; `Metric.figma.tsx`.
- `internal/ChartDelta.tsx` — red semantic + JSDoc.
- `HorizontalBarStack/HorizontalBarStack.tsx` — header swap + `TestIdProvider`.
- `docs/Metric.md` — rewrite for the compound API, connector forms, red delta.
- `docs/HorizontalBarStack.md` — delta-red note + header-reuse note; reconcile the stale "delta will move to shared ChartDelta" line (already done in code).

## Consistency with the SimpleCharts family

Verified against `Chart` (root `TestIdProvider` + `useTestId` sub-components), and the sub-component export shape of `PieChart` / `BarList` / `LineChart`. Metric's barrel will export `{ Metric, MetricHeader, MetricValue, MetricTotal, MetricDelta, MetricCaption }` plus their `*Props`, matching the family.

## Decisions locked

- **Compound**, not flat — house style, and enables the shared header block. `MetricDelta` is a thin wrapper over `ChartDelta`.
- **Connectors**: `slash` (default) · `of` · `total`, rendered as above.
- **HBS** reuses `MetricHeader` (value + delta only).

## Out of scope / deferred

- **`MetricSkeleton`** — no loading skeleton (the value is trivially cheap); add later if a card-load shimmer is needed, matching `BarListSkeleton` / `PieChartSkeleton`.
- **Inline caption** — caption is the subline *below* the value. An inline-right caption placement (if Figma intends one) is deferred until confirmed.
- **HBS legend interactivity / skeleton rename work** — tracked separately in the charts rework; not part of this task.

## Open questions

None.
