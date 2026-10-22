# SimpleCharts — AI Assistant Rules

Rules for developing chart components inside `packages/design-system/src/components/SimpleCharts/`.

## Figma Source

All chart designs live in the WADS-Components Figma file:

- **Root node**: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-121720&m=dev

Always reference this file (or a child node of it) when implementing or updating a chart. Put the specific child node URL into the story's `parameters.design.url` and, when the chart has a Code Connect template, into its `*.figma.ts` `// url=` header.

## Folder Layout

Every chart lives in its own subfolder. File names mirror the chart's PascalCase identifier.

```
SimpleCharts/
├── CLAUDE.md                      # this file
├── docs/                          # living docs — one .md per chart (see Documentation)
├── index.ts                       # barrel: re-exports every chart + shared types
├── types.ts                       # cross-chart shared types (ChartColor, …)
├── internal/  hooks/  lib/        # shared code (see rule 3)
├── Overview/                      # Overview.stories.tsx only — a showcase page, not a chart
└── ChartName/                     # one folder per chart (Chart, BarList, PieChart, LineChart, …)
    ├── ChartName.tsx              # root component
    ├── ChartNameItem.tsx, …       # sub-components, one file each
    ├── ChartNameContext.ts        # context shared by the sub-components (optional)
    ├── ChartName.stories.tsx
    ├── ChartName.e2e.ts
    ├── ChartName.e2e.ts-snapshots/  # Playwright screenshots (generated)
    ├── ChartName.figma.ts         # Code Connect template (optional)
    ├── classes.ts                 # shared CVA / class strings (optional)
    ├── internal/  hooks/  lib/    # chart-local code (optional)
    └── index.ts                   # local barrel
```

### Rules for the layout

1. **One chart per folder**. Do not put two unrelated chart roots into the same folder. Sub-components (`BarListBar`, `BarListTooltip`, …) live beside their root.
2. **`internal/` is not exported** from the top-level `index.ts`. It is for components that exist only to support charts inside this module.
3. **`internal/`, `hooks/`, `lib/`** may exist at two levels:
   - **Top-level** (`SimpleCharts/hooks/`, …) — code shared across multiple charts.
   - **Chart-local** (`SimpleCharts/BarList/hooks/`, …) — code used only by that chart.

   Put code at the lowest level that still covers all its callers. Promote to the top level only once a second chart actually needs it.
4. **Barrel files**: each chart folder exposes a local `index.ts`; the top-level `SimpleCharts/index.ts` re-exports from those. Never import a chart's internals from outside its folder — go through its barrel.

## Required Files Per Chart

Each chart folder **must** contain:

- `ChartName.tsx` — Root component + sub-components (or split into more `.tsx` files if large).
- `ChartName.stories.tsx` — Storybook stories, one per visual/interactive state that needs coverage.
- `ChartName.e2e.ts` — Playwright E2E tests: screenshots + interaction + a11y checks.
- `index.ts` — Named re-exports of the component(s) and their `*Props` types.

Optional, added only when needed:

- `ChartName.figma.ts` — Code Connect template, when the chart (or a sub-component) has its own Figma component. See *Code Connect Rules*.
- `classes.ts` — CVA variants / class strings shared between several files of the chart. A cva used by one file only may stay inline in that file.
- `constants.ts` — component-local constants (colors palette, default sizes, …).
- `types.ts` — chart-local types not shared with other charts.

## Stories Rules

- `title: 'Data display/SimpleCharts/<ChartName>'`.
- Include `parameters.design = { type: 'figma', url: <figma node url> }`.
- Use `satisfies Meta<typeof Component>` and `StoryFn<typeof meta>`.
- Cover every visual state the chart supports: default, hover, selected/active, focused, empty, loading/skeleton, filtered (if applicable), with-data-variants.
- Keep story data in the file — small, readable, self-contained. Do not fetch or randomize.

## E2E Rules

Follow [`docs/e2e-test-rules.md`](../../../../../docs/e2e-test-rules.md). In short:

- Tests live next to the component as `ChartName.e2e.ts`.
- Use `createStoryHelper('data-display-simplecharts-<chartname>', [...stories] as const)` — the id is derived from the story `title`.
- Group tests as the rules describe (`Visual` / `Interactions` / `Accessibility`). Existing chart specs still use a `Screenshots` group — rename it when you touch the file.
- Locate elements by `data-testid` (`getByTestId`); `getByRole` is fine for accessibility assertions. Never locate by `data-slot` — existing `data-slot` locators in chart specs are legacy to migrate.
- **Required screenshot coverage per chart**: `Default`, `Hover`, `Selected`, `Focus`. Add more states (`Filtered`, `Empty`, `Loading`, …) when the chart supports them.
- Interaction tests should assert the visible effect, not intermediate state (e.g., a filtered row renders at 100%, a tooltip becomes visible).

## Code Connect Rules (`*.figma.ts`)

Templates use the Code Connect template format (picked up by `figma.config.json` → `src/**/*.figma.ts`):

- Header comments: `// url=<figma node url>`, `// source=<GitHub url of the component file>`, `// component=<ComponentName>`.
- `import figma from 'figma'` — the only import allowed in a template.
- Read Figma properties from `figma.selectedInstance` (`getEnum`, `getBoolean`, `getString`, `findInstance`, `findText`, …).
- `export default { example: figma.code`…`, imports: [...] }` — the example renders the real component with those props.

Reference implementations: [`./Chart/Chart.figma.ts`](./Chart/Chart.figma.ts), [`./Metric/MetricDelta.figma.ts`](./Metric/MetricDelta.figma.ts).

## Component Rules

Charts follow the repo-wide rules in [`.claude/rules/component-development.md`](../../../../../.claude/rules/component-development.md) and [`.claude/rules/test-id.md`](../../../../../.claude/rules/test-id.md).

## Documentation

Each chart has a living doc file at `SimpleCharts/docs/<ChartName>.md`. This is the human-readable source of truth for *how the chart behaves*, not just how its API is shaped — stories cover visual states, these docs cover the **why** and the **gotchas**.

`AreaChart` has no doc yet — it reuses the `LineChart` plot primitives (`LineChartGrid`, axes, `LineChartTooltip`); add `docs/AreaChart.md` when its behaviour diverges.

### What each doc must contain

- **Overview** — one paragraph: what the chart shows, when to use it.
- **Figma** — link to the specific Figma node.
- **Data model** — expected input shape, required/optional fields, constraints (max rows, value ranges, sort order).
- **States** — every supported visual/interaction state (default, hover, selected, focus, filtered, empty, loading, error) and what triggers each.
- **Interactions** — click/keyboard/hover behaviour. What happens on select? On filter? Is the filter controlled or uncontrolled?
- **Edge cases & unclear states** — anything a future reader would not guess from the code: e.g. "rows below threshold are grouped into an 'Other' bucket", "empty state renders a skeleton for exactly 300ms to avoid flicker", "hover+focus stack — focus wins".
- **Accessibility notes** — roles, keyboard shortcuts, screen reader announcements.
- **Open questions / known limitations** — anything design or product has not yet resolved. Keep this section even when empty (write "None.") so it is always checked.

### Maintenance rule

**After every task that changes a chart's behaviour, update that chart's doc in the same commit.** This is not optional — the doc is the contract.

- Adding a new state, interaction, or prop → document it.
- Fixing a bug whose existence was non-obvious → add a note under *Edge cases & unclear states*.
- Discovering an ambiguous behaviour during implementation → record it under *Open questions* until resolved.
- Removing or renaming behaviour → remove the stale section, do not leave it behind.

If the change is cosmetic and truly has no behavioural impact (e.g. a token swap that does not affect state), you may skip the doc update — but note the reason in the PR description.

### Scope

Docs live next to the code in `docs/`, not in Storybook MDX or README files. Stories and Code Connect describe *what renders*; these docs describe *how the chart thinks*. Keep them short, specific, and current — a stale doc is worse than no doc.

## Reuse Before Inventing

Before adding a chart, check the sibling folders — `./Chart` (card container, header, empty state), `./BarList`, `./PieChart`, `./LineChart`, `./AreaChart`, `./HorizontalBarStack`, `./Metric` — and the shared `./lib`, `./internal`, `./hooks`. Reuse their primitives and tokens rather than copying. If behaviour has to diverge, document *why* in the chart's own file.

## Design Tokens

Charts must use design-system tokens:

- Surfaces: `bg-bg-surface-*`
- Text: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`
- Borders: `border-border-primary-light`
- States: `bg-states-primary-pressed`, `bg-states-primary-hover`
- Chart colors: use the `ChartColor` palette — `CHART_PALETTE_FILL` / `resolveChartColor` from `./lib/chartPalette.ts`.

Never hardcode hex values.
