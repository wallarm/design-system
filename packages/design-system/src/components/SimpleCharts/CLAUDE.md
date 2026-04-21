# SimpleCharts — AI Assistant Rules

Rules for developing chart components inside `packages/design-system/src/components/SimpleCharts/`.

## Figma Source

All chart designs live in the WADS-Components Figma file:

- **Root node**: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-121720&m=dev

Always reference this file (or a child node of it) when implementing or updating a chart. Put the specific child node URL into both the component's `*.figma.tsx` Code Connect binding and the story's `parameters.design.url`.

## Folder Layout

Every chart lives in its own subfolder. File names mirror the chart's PascalCase identifier.

```
SimpleCharts/
├── CLAUDE.md                      # this file
├── docs/                          # living docs — one .md per chart component
│   ├── BarList.md
│   ├── PieChart.md
│   └── Chart.md
├── index.ts                       # barrel: re-exports every chart + shared types
├── BarList/
│   ├── BarList.tsx                # root component
│   ├── BarList.stories.tsx
│   ├── BarList.e2e.ts
│   ├── BarList.e2e.ts-snapshots/  # Playwright screenshots (generated)
│   ├── BarList.figma.tsx          # Code Connect binding
│   ├── classes.ts                 # CVA variants (if any)
│   ├── internal/                  # chart-local building blocks (optional)
│   ├── hooks/                     # chart-local hooks (optional)
│   ├── lib/                       # chart-local utilities (optional)
│   └── index.ts                   # local barrel
├── PieChart/
│   └── …same layout…
├── Chart/
│   └── …same layout…
├── internal/                      # shared, non-exported building blocks (optional)
│   └── …
├── hooks/                         # shared React hooks used by multiple charts (optional)
│   └── …
├── lib/                           # shared pure utilities (math, formatters, scales) (optional)
│   └── …
└── types.ts                       # cross-chart shared types (ChartColor, DataItem, …)
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
- `ChartName.figma.tsx` — `@figma/code-connect` binding tying the component to its Figma node.
- `index.ts` — Named re-exports of the component(s) and their `*Props` types.

Optional, added only when needed:

- `classes.ts` — CVA variant definitions (required if the component has variants).
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
- Group tests:
  ```ts
  test.describe('ChartName', () => {
    test.describe('Screenshots', () => { /* toHaveScreenshot per story */ });
    test.describe('Interactions', () => { /* hover / click / keyboard */ });
    test.describe('Accessibility', () => { /* roles, aria, focus order */ });
  });
  ```
- **Required screenshot coverage per chart**: `Default`, `Hover`, `Selected`, `Focus`. Add more states (`Filtered`, `Empty`, `Loading`, …) when the chart supports them.
- Interaction tests should assert the visible effect, not intermediate state (e.g., a filtered row renders at 100%, a tooltip becomes visible).

## Code Connect Rules (`*.figma.tsx`)

- Import `figma` from `@figma/code-connect`.
- Store the figma URL in a top-level `figmaNodeUrl` const.
- Map every Figma variant/boolean via `figma.enum` / `figma.boolean` / `figma.string`.
- The `example` function renders the real component with those props — no placeholders, no mock data.

Look at [`../CodeSnippet/CodeSnippet.figma.tsx`](../CodeSnippet/CodeSnippet.figma.tsx) for a reference implementation.

## Component Rules (reminder)

All charts follow the repo-wide component rules — these still apply here:

- **CVA** in `classes.ts` for every set of variants.
- **`cn()`** from `../../utils/cn` to merge class names.
- **`data-slot='chart-name'`** on the root element (kebab-case).
- **`displayName`** set at the bottom of every component file.
- **Named exports only**; re-export `{ Component, type ComponentProps }` from `index.ts`.
- **Ref** accepted via the `ref` prop (React 19+) and forwarded to the root element.
- **No `any`**, **no inline styles**, **no hardcoded colors** — use the design tokens defined in the design system.
- **`TestableProps` + `TestIdProvider`** for any chart that has sub-components (`ChartBar`, `ChartLegend`, …). Follow [`../../../../../.claude/rules/test-id.md`](../../../../../.claude/rules/test-id.md).

## Documentation

Each chart has a living doc file at `SimpleCharts/docs/<ChartName>.md`. This is the human-readable source of truth for *how the chart behaves*, not just how its API is shaped — stories cover visual states, these docs cover the **why** and the **gotchas**.

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

Before adding a chart, check whether a similar implementation already exists in `../Chart/` (the general-purpose Chart family: `BarList`, `Pie`, `Line`, `Legend`, `ChartHeader`). If so, reuse its primitives and tokens rather than copying. If behaviour has to diverge, document *why* in the chart's own file.

## Design Tokens

Charts must use design-system tokens:

- Surfaces: `bg-bg-surface-*`
- Text: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`
- Borders: `border-border-primary-light`
- States: `bg-states-primary-pressed`, `bg-states-primary-hover`
- Chart colors: reuse `CHART_COLORS` / `CHART_BADGE_COLORS` from `../Chart/constants.ts` when possible.

Never hardcode hex values.
