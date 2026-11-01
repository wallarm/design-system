# Claude Design build sourced from Storybook — design

Status: approved 2026-11-01 · branch `feat/claude-design` · supersedes the guide/example
generation parts of [2026-10-28-claude-design-design.md](./2026-10-28-claude-design-design.md)
(bundle, tokens, fonts, icons and the React 18 harness stay as built there).

## Intent

The Claude Design agent builds Wallarm screens from the real `WallarmDS.*` components. To
build them the way Wallarm builds them, it reads our Storybook stories as **reference
examples** — how a Table's cells, master cell, pinning, drag, editing, context actions,
nested rows, grouping and checkbox selection are put together; how a Chart or Metric is
composed — and writes its own canvas markup by analogy.

**Storybook is the single source of truth** for both the docs site (`apps/docs`) and
Claude Design (the user's rule). The export copies what Storybook says; it never writes
its own examples, recipes or prose. When Storybook lacks something, the gap is recorded,
not filled.

Why now: the first published build (2026-10-31) let the agent see only 234 of 885 stories
(26%). No Table story and no SimpleCharts story reached it, so a prototype of the Attacks
screen fell back to a hand-written table and an invented metric card, and the agent wrongly
concluded Table has no row click (`onMasterCellClick` exists, `src/components/Table/types.ts:407`).

## Goals

1. Every story that Storybook renders is available to the agent, per component, as its
   **full verbatim source**: imports, hooks, `render:` bodies, `args`, file-local helpers,
   and the local fixture/mock modules it imports (e.g. `Table/mocks.tsx`).
2. Every component guide carries Storybook's own descriptions: the meta's
   `parameters.docs.description.component` and each story's JSDoc /
   `parameters.docs.description.story`.
3. One generic **translation rule** (infrastructure, not an example) tells the agent how a
   story's code maps onto a canvas artboard (§ Translation rule).
4. Previews show each story live, as today, but for all stories, not 4.
5. SimpleCharts is exported like every other component, one guide per Storybook meta
   (Chart, Metric, AreaChart, BarList, ColumnChart, LineChart, PieChart,
   HorizontalBarStack), plus the `Overview` story in a SimpleCharts index guide. The split
   happens in the export only; metadata, MCP and the docs site keep one `SimpleCharts`
   entry (my call: splitting there would change the MCP component list for consumers).
6. The docs site and the export read the same fixed metadata (`dist/metadata/components.json`),
   so fixing extraction once fixes both.
7. Storybook gaps are listed in `packages/design-system/claude-design/CLAUDE_DESIGN_GAP.md`
   (user's decision: list them, do not fix them in this work).
8. Release flow "variant A" (user's choice): CI builds the export from the release tag and
   attaches it to the GitHub release; a person runs one publish command whose diff a
   `publish-plan` script computes.

## Non-goals

- Writing or changing stories, adding missing stories, removing story wrappers.
- Mounting stories themselves on the canvas (`window.WallarmStories.*` or similar). The user
  rejected it: stories are reference, the agent composes. The canvas type also forbids
  self-defined `window.X` components (Design type, `design-system-components.md` step 6).
- Fully unattended publishing. No surface confirmed to reach the artifact write tools
  without an interactive claude.ai login (see the 2026-10-31 automation verdict); a cloud
  routine stays an optional later experiment.
- Changing the npm package's `dist/` beyond `dist/metadata/components.json` content.
- DesignSync / standalone claude.ai/design (closes 2026-12-14).

## Anti-goals (failure even if it "works")

- Any example, recipe, collection, cell factory or prose in the export that does not exist
  in Storybook. Today's offenders, all to be deleted: `docs/canvas-recipes.ts` (16 recipes),
  `tableExample` in `docs/consuming.ts:1-19`, the Select / FilterDropdown / Toast special
  cases and the Tour note in `docs/component-readme.ts:164-276`, the fallback prose at
  `component-readme.ts:228`, the "When to use" boilerplate at `component-readme.ts:220`,
  and the `WallarmDS.TableCells` helper (`bundle/helpers/TableCells.tsx`) — see Spike.
- Silently dropping a story. A story the build cannot ship fails the build or is listed
  in the generated README's "Not synced" section with the reason.
- A translation rule that grows component-specific branches (that is a recipe in disguise).

## Constraints

- Platform: Design System artifact type, ≤1,008 files (whether the 583 icon uploads count
  toward it is unconfirmed; the builder checks the live artifact's `usage` and the build
  counts project files and uploads separately, synthesis item 5, now MUST), ≤256 MiB; `bundle.js` ≤6 MB
  (our budget 5.7 MB, today 4.93 MB), `bundle.css` ≤2 MB (today 401 KB). Per-component text
  files have no stated cap but must stay readable by an agent; one Markdown file per
  component plus one source file per story module is the expected shape (builder's call).
- Canvas rules (Design type): artboards are `<x-dc>` markup plus one classic-JS
  `class Component extends DCLogic` with `renderVals()`; non-string props go through
  `{{holes}}`; no self-defined `window.X` components; no `innerHTML`/`appendChild` UI.
- React 18 on the canvas (existing shim and harness stay).
- Builds stay byte-repeatable (`claude-design:verify`).
- Existing consumers notice nothing (2026-10-28 constraint), except the metadata fixes,
  which change `dist/metadata/components.json` and therefore the MCP output — ship those
  as their own `fix(metadata)` commit so they release as a patch.
- Repo rules: conventional commits, no file deletion without confirmation (the deletions
  listed here are confirmed by approving this document), `/vestige-audit` before
  `gh pr create`. No Jira key for this work (user, 2026-11-01): the branch stays
  `feat/claude-design` and PR titles carry no key.

## Design

### Step 0 — spike: can a canvas express a Table cell? (first, throwaway)

Table columns need `cell` functions returning elements. The only canvas-legal place for
them is `renderVals()`. Build one throwaway artboard on a scratch canvas that mounts
`WallarmDS.Table` with `columns` from `renderVals()` whose `cell` returns
`React.createElement(WallarmDS.Badge, …)` (and one master-cell column), and check it renders
and stays editable. In the same scratch artboard, also try one design-system hook a story
relies on (`useChartTimeFormatters`, used by most chart stories) and `useToast`:
`renderVals()` is not a React component, so hooks cannot run there; the question is whether
the bundle offers a non-hook path (e.g. the formatter functions themselves) the rule can
point to. The user asked for this verification.

- Works → the translation rule allows `React.createElement(WallarmDS.X, …)` inside
  `renderVals()` for render-prop props only; `TableCells` is deleted.
- Does not work, or a design-system hook has no non-hook path → stop and bring it back to
  the user: that needs a library-level answer, which is the user's call (not invented here).

Spike result (2026-11-01): spike artboard published on the smoke canvas (unrendered;
the user waived the visual check). Public non-hook paths exist: `formatChartDate`,
`formatChartDateTime`, `formatChartHour`, `formatChartTimezone`, `toaster`. Ruling: render-prop
props use `React.createElement(WallarmDS.X, …)` inside `renderVals()`; `TableCells` is deleted.
Icon uploads are a separate store (`usage.files` 583 of `max_files` 5,000); the 1,008 cap
counts project files.

### Step 1 — fix the shared metadata (`scripts/metadata`, `fix(metadata)`)

Both the docs site and the export read `dist/metadata/components.json`
(`scripts/metadata/generate.ts:34-88`; read at `apps/docs/scripts/generate.ts:16` and
`claude-design/docs/build-docs.ts:63`). Fix there:

- Component description: prefer the meta's `parameters.docs.description.component`
  (`parse-description.ts:7-28` today takes the first JSDoc in the file); fall back to JSDoc
  on the declaration named after the component only.
- Fix the StoryObj bug where `code` is rebuilt from `args` only (`parse-examples.ts:58-60`).
  `code` keeps its meaning for the docs site and MCP. (Planning note 2026-11-01: no new
  `source` field — the export copies whole story modules from disk, which is more verbatim
  than any per-story field and needs no schema change.)
- Cleanup findings 18–20 from the 2026-10-31 synthesis: inherited HTML props flooding
  tables (`parse-props.ts:28`), missing `<Name>Props` fallback (`parse-props.ts:173`).

Check the docs site still builds and its pages change only in the intended direction.

### Step 2 — export guides from Storybook

Replace the converter with copying:

- Per component (per Storybook meta): a guide with the meta
  description, the props table, sub-components, and every story in Storybook order — its
  name, its description, and its source verbatim. The story module's local imports
  (mocks, helpers) ship beside it verbatim, once per component. Layout of files is the
  builder's call within the caps.
- Delete `docs/canvas-adapter.ts` (+ test), `docs/canvas-recipes.ts` (+ harness test),
  `tableExample`, the special cases and boilerplate listed under Anti-goals, the
  `.slice(0,3)` caps, and the `SimpleCharts` entries in `build-docs.ts:10-20` and
  `build-previews.ts:13-23`.
- Previews: drop the 4-story cap (`build-previews.ts:61`); keep composing real stories.
  Watch the per-file size of the largest (Table, FilterInput) and split if needed.
- `css/entry.css:7-12`: remove the `@source not` lines for stories so preview-only classes
  exist; re-check the 2 MB CSS cap.
- `Root` stays: it is the provider every artboard needs, infrastructure not an example.
- Public components with no story (BulkBar, NavPanel, NavRail, TopHeader) still get a guide
  (props, parts, description). Internal ones excluded today (ButtonBase, Polymorphic,
  TemporalCore, Checkmark, ThemeProvider, DateFormatProvider; `build-docs.ts:10-20`) get
  none. Both are listed in the README's "Not synced" with the reason.
- Layout default: story sources and their mocks go inline in the component guide, not as
  separate files, unless a guide gets too large to read (my call: it keeps the file count
  flat whatever the asset-cap answer below is).

### Translation rule (one section of `readme-root.md`)

Generic, component-agnostic, written once:

- `import { X } from '@wallarm-org/design-system'` → `WallarmDS.X` in `x-import`;
  icons → `WallarmDS.Icons.X` (or the icon prop by name).
- JSX element → `<x-import component-from-global-scope="WallarmDS.X">`; camelCase props
  → kebab-case attributes; non-string values → `{{hole}}` from `renderVals()`.
- `useState` / `useReducer` → `this.state` + `this.setState` in `DCLogic`; event handlers
  → methods returned from `renderVals()`.
- Fixture/mock data → constants in the artboard's script (shape copied from the shipped
  mock, values the screen's own).
- Render-prop props (`cell`, `header`, `renderMenuAction`, `renderExpandedRow`, …) →
  per Step 0's result.
- Storybook-only parts are ignored: `fn()`, `args` controls, decorators, `play`.
- Everything inside `WallarmDS.Root`.

### Step 3 — `CLAUDE_DESIGN_GAP.md`

Hand-maintained, committed at `packages/design-system/claude-design/CLAUDE_DESIGN_GAP.md`
(location and hand-maintenance are my call). Lists what Storybook does not show, each with
the source reference, so story authors can close it later:

- Components with no stories: BulkBar, ButtonBase, Checkmark, DateFormatProvider, NavPanel,
  NavRail, Polymorphic, TemporalCore, ThemeProvider, TopHeader (internal-only ones marked).
- Table features with no story: column-value `grouping` / `onGroupingChange`
  (`types.ts:271-272`), `skeletonCount` (`:209`), `onSettingsOpenChange` (`:334`),
  `overscan` (`:358`), reach thresholds, column-def `enableResizing`,
  `enableColumnPinning`, `enableHiding`, `minSize`, `maxSize`, `headerClassName`,
  `cellClassName`, direct `TableSettingsMenu*` composition; `InlineCellEditing` without JSDoc.
- SimpleCharts: `LineChartZoomPopover*` without a story; Metric/Overview local wrappers.
- The 49 stories built on local wrapper components (FilterInput 18, FilterDropdown 7,
  AppShell 5, ImageCropper 4, Attribute 4, …) and the 5 without JSDoc.

The recon report (`storybook-sot-recon.md` in the session scratchpad) is the starting list;
the builder re-derives counts from the code.

### Step 4 — release flow (variant A) and cleanup

As specified in the 2026-10-31 automation/cleanup synthesis, §1 A–D and §2:

- `deploy-site.yml` gets a `claude-design` job: build from the tag, upload
  `claude-design-<tag>.tgz` to the release (guarded for old tags).
- `claude-design/publish-plan.ts` (`plan` / `check`) computes uploads, file batches, stale
  paths and a remote-merged index (fixes the overwrite of page-owned index keys,
  `build.ts:67`); `claude-design/fetch.ts` downloads a release archive.
- `.claude/skills/claude-design-sync/SKILL.md` rewritten to ~15 lines on the real tool API
  (`upload_asset` ≤10, `publish_files` patch ≤256 with chained `base_version`, index last).
- Cleanup MUST items: `lastChange.by` = `'Wallarm'`; asset group fields; icon count not
  hard-coded in `build.test.ts:20`; revert the stray blank line in `main.yml`; delete
  `excludedModules`; one source for size caps; no leaking build temp dirs (no `os.tmpdir()`
  rename); delete the one-off `no-impact` checker after recording its PASS in the PR;
  rewrite `claude-design/README.md` as a short maintainer guide (the nxds comparison and
  publication record move to the PR body); fix docs that say "run `pnpm build` first".
- My calls on the synthesis's open decisions: keep contract 0.2.47; delete
  `excludedModules` without a replacement guard; no committed `asset-ids.json`; stale remote
  paths are deleted only after the operator confirms the listed paths (CLAUDE.md); the
  routine experiment is out of scope.

### Order and PRs (suggested)

Step 0 → Step 1 (separate `fix(metadata)` commit) → Step 2 + Step 3 → Step 4 cleanup →
Step 4 release flow. One PR or two (metadata separately) is the planner's call.

## Done when

- Every story in Storybook appears in its component's guide with verbatim source and its
  description, or is listed in "Not synced" with a reason; the build fails on an unlisted drop.
- `grep` finds no recipe/special-case code in `claude-design/docs/`.
- A fresh agent, given only the published artifact, can find the Table master-cell,
  pinning, row drag, inline editing, context menu, nested rows, grouping and selection
  stories, and the Chart/Metric stories.
- Docs site builds from the fixed metadata; `claude-design:verify`, `test:claude-design`
  (including the ImageCropper case that fails today) and quality checks pass.
- `CLAUDE_DESIGN_GAP.md` exists and matches the code.
- A release tag produces the archive; `plan`/`check` work against the live artifact.

## Left to the builder

File layout of guides and story-source files; how fixtures are referenced from guides;
preview splitting; exact README wording within "copy, don't author"; test shapes.
