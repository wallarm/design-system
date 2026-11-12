# @wallarm-org/gen-ui

Generative UI catalog for the Wallarm design system: an agent answers with design-system
components instead of text. Each component is defined once and rendered from either
[A2UI](https://a2ui.org) v1.0 messages or [json-render](https://json-render.dev) specs.

Experimental and private: not published to npm. The user docs are on the site under
**AI → Generative UI** (`apps/website/docs/ai/generative-ui.mdx`).

## Where things are

```text
src/
├── index.ts              @wallarm-org/gen-ui: the catalog + the API to define entries
├── core/                 format-agnostic: no format library, React only as types
│   ├── check.ts          checkNodes / describeIssues: the answer check both formats share
│   ├── define.ts         GenUiComponent (an entry's contract), defineComponent,
│   │                     subsetOf / allOf / Values (enums from DS types), seriesKey, unique
│   ├── format.ts         named number and time formats (formatNumber, formatTime)
│   └── guards.ts         isRecord: narrow untrusted agent output
├── render/               React pieces both formats share
│   ├── GuardedView.tsx   validates props against the schema, then View or Skeleton
│   ├── Placeholder.tsx   what stands in for a part that isn't renderable yet
│   ├── ChartSkeleton.tsx the chart card skeleton the chart entries use
│   ├── SurfaceBoundary.tsx  error boundary: a View that throws blanks its own surface only
│   └── warn.ts           the one console.warn for rejected agent output
├── components/           THE CATALOG: one file per entry, index.ts lists them in order
├── a2ui/                 @wallarm-org/gen-ui/a2ui
│   ├── catalog.tsx       createA2uiCatalog: entries → A2UI Catalog (toJson() for the agent)
│   ├── A2uiSurfaces.tsx  feeds messages to a MessageProcessor, renders its surfaces
│   ├── express.tsx       /a2ui/express: A2UI Express, the compact text form, compiled by @a2ui/agent
│   ├── prompt.ts         /a2ui/prompt: a2uiPrompt, the system prompt (Express or JSON) with the actions
│   ├── check.ts          checkA2uiAnswer: the agent's mistakes in a finished answer
│   └── toA2uiSchema.ts   zod 4 props → the zod 3 schema A2UI's binder reads
├── json-render/          @wallarm-org/gen-ui/json-render
│   ├── catalog.tsx       createJsonRenderCatalog: entries → catalog (prompt()) + registry
│   ├── check.ts          checkJsonRenderAnswer: the same check for a spec
│   ├── spec.ts           specFromLines (stream → spec, never throws), sanitizeSpec (allowlist)
│   └── JsonRenderSurface.tsx  renders a spec; keeps its state in step as the app fills it
├── fixtures/             @wallarm-org/gen-ui/fixtures: recorded answers, both formats
│   ├── stream.ts         the scenario builder: layout chunks + app data → both streams (toStreams)
│   ├── scenarios.ts      SCENARIOS: every answer a demo can replay, in picker order
│   ├── attackSummary.ts  a chat answer written by hand in both formats
│   ├── liveMonitor.ts    the live example: the app refreshes the page every 2 s
│   └── dashboard.ts, …   one scenario per file, built with stream.ts
├── playground/           @wallarm-org/gen-ui/playground: the demos the playground app and the
│   │                     docs site embed
│   ├── GenUiPlayground.tsx  pick a prompt, replay its answer, read the stream beside it
│   ├── GenUiChatDemo.tsx    answers inside the Wally chat, with an approval before Block
│   └── useEmulatedAgent.ts  the scripted agent behind the chat demo
└── tests/                all tests (formats.test.tsx covers the shared behaviour)
```

## How a render works

```text
components/Metric.tsx (one definition)
  ├─ a2ui/catalog.tsx        → A2UI catalog ─┐
  └─ json-render/catalog.tsx → json-render ──┴→ agent output → GuardedView → View (DS components)
                                                               └ props don't pass yet → Skeleton
```

1. The app builds both catalogs once, at module scope, from `wallarmComponents`.
2. The agent is prompted with the catalog: `toJson()` (A2UI) or `catalog.prompt()` (json-render).
3. Its output streams in. `A2uiSurfaces` takes the messages so far; `JsonRenderSurface` takes
   `specFromLines(lines)`.
4. For every component, `GuardedView` checks the props against the entry's zod schema. Passing
   props reach the `View`; failing ones (data not here yet, or a mistake) show the entry's
   `Skeleton`. A child the agent hasn't sent yet shows a plain `Placeholder`.
5. A pressed button fires an event; only actions in the app's allowlist reach `onAction`.

## Add a component

1. Create `src/components/<Name>.tsx` with `defineComponent({ name, description, props, View })`.
   Copy the closest entry: `Badge.tsx` for a leaf, `Section.tsx` for a container, `BarList.tsx` for
   a chart.
2. Add it to `wallarmComponents` and the `export *` list in `src/components/index.ts`.
3. Add a test in `src/tests/<Name>.test.tsx` that renders it through both formats, with literal
   and bound props, and with data that hasn't arrived (see `LineChart.test.tsx`).

An entry must follow these rules. Tests or typecheck enforce the ones marked ✓.

- Props are data: strings, numbers, booleans, enums, arrays, objects. No functions or ReactNode.
- No prop named `id`, `component`, `children` or `child` (A2UI puts props next to them).
- ✓ Every enum value comes from a DS type: `subsetOf<BadgeColor>()([...])` for some values,
  `allOf<…>()([...])` for all of them, or a typed `Record<…, DSType>` map. No `as` casts in a
  definition.
- Numbers and times take a named format from `core/format.ts`, never a formatter function.
- Events carry no arguments: `events: ['press']`, then `emit('press')`.
- A container sets `hasChildren: true` and renders `children`.
- The `View` gets props that already passed the schema, so it needn't guard against missing data;
  declare a `Skeleton` shaped like the loaded component.
- The root of a widget fills its cell (`h-full`), so a Grid row lines up.
- The `description` is for the model: when to use it and the data shape, not how it looks.

## Add a recorded answer

1. Create `src/fixtures/<name>.ts` exporting a `Scenario` (see `dashboard.ts`): the prompt, the
   agent's layout in the chunks it sends them (`node`, with every figure a `bind('/path')`), and
   the app's data batches with the chunk each arrives after.
2. Add `{ ...scenario, ...toStreams(scenario) }` to `SCENARIOS` in `src/fixtures/scenarios.ts`:
   the playground and the docs page list it from there.
3. Add a test that renders it through both formats and leaves no skeleton at the end.

## Commands

```bash
pnpm --filter @wallarm-org/gen-ui test:run    # rstest, both formats
pnpm --filter @wallarm-org/gen-ui typecheck
pnpm --filter @wallarm-org/gen-ui build       # rslib → dist/, same layout as src/
```

The playground app has two demos that replay the fixtures: `/gen-ui` (answers in the Wally chat)
and `/gen-ui-playground` (pick a prompt, watch the agent lay out the answer while the app fills its
data). The docs site embeds the same `GenUiPlayground` on its Generative UI playground page.

```bash
pnpm turbo run build --filter=@wallarm-org/design-system   # the playground reads the built theme
pnpm --filter @wallarm-org/playground dev
```

## Bundle size

What each entry point adds to an app, minified (gzip), with React and the DS external. Measured
with esbuild from `dist` on 2026-11-12; re-measure after a dependency bump.

| Entry | Size | Most of it |
| --- | --- | --- |
| `.` (the catalog) | 110K (33K) | zod 4 |
| `/a2ui` + the catalog | 498K (137K) | `@a2ui/web_core`, zod 3 and zod 4 |
| `/a2ui/express` | 634K (176K) | `@a2ui/web_core`, `antlr4ng`, `@a2ui/agent` |
| `/json-render` + the catalog | 532K (119K) | zod 4 with all its locales |

- Import zod as `import * as z from 'zod'`. `import { z } from 'zod'` keeps every zod locale in the
  bundle (443K instead of 83K). json-render imports it that way itself, so its entry still pays for them.
- Express and the prompt have their own entry points because `@a2ui/agent` and its parser are most
  of the weight. Compile Express on the server when you can, and send the browser A2UI JSON.
- `@a2ui/agent` imports `fs` and `path` in modules gen-ui doesn't use. Rspack drops them; a
  bundler that resolves them anyway needs `fs: false, path: false` as fallbacks.

## Why two versions of zod

json-render needs zod 4, and the definitions are in zod 4. `@a2ui/web_core` pins zod 3 and reads
zod 3 internals to decide what binds, what's an action and what holds children.
`a2ui/toA2uiSchema.ts` rewrites each schema with the `zod/v3` API that zod 4 ships. The two
packages' TS types don't match, so `a2ui/catalog.tsx` casts at that one boundary.
