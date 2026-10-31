# Claude Design build sourced from Storybook — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship every Storybook story, verbatim and with Storybook's descriptions, to the Claude Design artifact as reference examples; delete every hand-written recipe; automate the release-side preparation of a publish.

**Architecture:** The export stops converting stories into canvas markup. Each component guide copies its story modules (and the local fixture modules they import) verbatim, with the meta and story descriptions from the shared `dist/metadata/components.json`, plus one generic story→artboard translation rule in the root README. Shared metadata extraction is fixed first so the docs site benefits too. Release: CI attaches the built project to the GitHub release; `publish-plan.ts` computes the diff the operator publishes.

**Tech Stack:** TypeScript, ts-morph, Rslib/Rspack, Rstest, Tailwind 4, GitHub Actions, claude-artifacts MCP (interactive session only).

**Spec:** `docs/superpowers/specs/2026-11-01-claude-design-from-storybook-design.md` (read it first; this plan argues from it). Release/cleanup details it references: the 2026-10-31 synthesis, copied into this plan where a task needs it.

## Global Constraints

- Storybook is the only source of examples and prose. No example, recipe, collection, cell factory or prose that Storybook does not contain. No component-specific branches in the translation rule.
- A story is never dropped silently: it ships in its guide or is listed in the README "Not synced" with a reason; the build throws on anything else.
- Platform caps: ≤1,008 files (icon uploads appear to count — `usage.files` was 583 right after the icon upload; Task 0 confirms), ≤256 MiB; `bundle.js` ≤ `CLAUDE_DESIGN.bundleBudgetBytes` (5,700,000); `bundle.css` ≤ `CLAUDE_DESIGN.cssCapBytes` (2,000,000); component `README.md` ≤64,000 B; other text files ≤512,000 B; `preview.html` ≤256,000 B.
- Builds stay byte-repeatable (`pnpm --filter @wallarm-org/design-system claude-design:verify`).
- npm consumers notice nothing except `dist/metadata/components.json` content (Tasks 1–3 ship as `fix(metadata)` commits).
- `examples[].code` (paste-ready snippet used by docs site and MCP) keeps its current meaning.
- Canvas rules: artboards are `<x-dc>` markup + one `class Component extends DCLogic`; no self-defined `window.X` components.
- No Jira key: branch stays `feat/claude-design`, commits/PR titles carry no key. Conventional commits; end commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Deletions listed in the spec are approved; any other file deletion needs the user's confirmation.
- Never run `e2e:docker` locally. Run `/vestige-audit` before any `gh pr create`; open no PR unless the user asks.
- Typecheck with `pnpm --filter @wallarm-org/design-system typecheck` (the root CI typecheck is a no-op for this package).

## Review Focus

1. **A story module that imports a local non-public helper from a sibling folder** (e.g. `../Foo/storyHelpers`) — the guide must ship it or list it, never reference a file the agent cannot read. Test in Task 5 (`ships every non-public relative import`).
2. **A component whose stories exceed the 64 KB README cap** (Table: 86 KB stories + 29 KB mocks) — sources move to `stories.md`, README links it; nothing is truncated. Test in Task 5 (`Table sources go to stories.md`).
3. **A meta description written as an expression** (`[...].join(' ')`, template literal, `'a' + 'b'`, identifier `DESCRIPTION`) — resolved to text, not code. Test in Task 1 (`resolves DESCRIPTION arrays joined with spaces`).
4. **A story file with no meta description and no matching JSDoc** (EmptyState, ImageCropper, WallySkeleton have no `DESCRIPTION`) — `description` is omitted, no invented fallback text. Test in Task 1 and Task 5 (`no fallback prose`).
5. **All-stories previews blowing the 512 KB `stories.js` cap** (Table, FilterInput) — split the preview into numbered parts rather than drop stories. Test in Task 6 (`every story has a preview section`).

---

### Task 0: Spike — cells, hooks and the file cap on a real canvas (main session, throwaway)

Needs the interactive claude-artifacts tools; a subagent may not have them. The user asked for this verification.

**Files:** none in the repo. Scratch canvas only (`create_from_type`, Design type `bcd2878f-a88d-4094-a616-8e39d8a5fd8a`, title "WDS spike — cells"), installed with the published DS (https://claude.ai/artifact/N9vi3rNMFVZ3g8HmckRe9S).

- [ ] **Step 1:** One artboard mounting `WallarmDS.Table` with `data`/`columns` from `renderVals()`. One column's `cell` returns `React.createElement(WallarmDS.Badge, {color: 'success'}, value)`. One column is the master column, with `on-master-cell-click` set to a `DCLogic` method that calls `setState`.
- [ ] **Step 2:** In the same artboard, show a time value formatted through a non-hook path the bundle exposes for `useChartTimeFormatters`, or note that there is none. Do the same for a toast via `WallarmDS.toaster.create` called from a `DCLogic` handler.
- [ ] **Step 3:** Ask the user to open the canvas and confirm what renders, and whether the Badge cell can be selected and edited. Do not render it yourself.
- [ ] **Step 4:** Read `get_artifact` / `list_files` on the DS artifact. Record whether `usage.files` counts the 583 asset uploads.
- [ ] **Step 5:** Record the outcome in the spec under a new "Spike result (date)" line and commit (`docs(claude-design): record canvas spike result`).
  - If cells or hooks fail, **stop the plan and ask the user**. Task 7's rule and the `TableCells` deletion depend on this.

### Task 1: Component description from the Storybook meta (`fix(metadata)`)

**Files:**
- Modify: `packages/design-system/scripts/metadata/parse-description.ts`
- Modify: `packages/design-system/scripts/metadata/generate.ts:46` (call stays, signature unchanged)
- Test: `packages/design-system/scripts/metadata/__tests__/parse-description.test.ts` (new)

**Interfaces:**
- Produces: `readMetaDescription(sourceFile: SourceFile): string | undefined`, exported. `parseComponentDescription(project, componentDir, componentName)` keeps its signature.

- [ ] **Step 1: Write failing tests**

```ts
it('prefers the meta docs.description.component', () => {
  expect(parseComponentDescription(project, dir('Button'), 'Button')).toMatch(/^Triggers an action — reach for `Link`/);
});
it('resolves DESCRIPTION arrays joined with spaces', () => {
  // Button's DESCRIPTION is ['…', '…'].join(' ')
  expect(parseComponentDescription(project, dir('Button'), 'Button')).toContain("instead. Keep one `variant='primary'`");
});
it('reads in-memory literal, template and concatenation forms', () => {
  for (const expr of [`'A b'`, '`A b`', `'A' + ' b'`, `['A', 'b'].join(' ')`]) {
    const sf = memory.createSourceFile(`m${i++}.stories.tsx`, `const meta = { parameters: { docs: { description: { component: ${expr} } } } }; export default meta;`, { overwrite: true });
    expect(readMetaDescription(sf)).toBe('A b');
  }
});
it('omits the description when neither meta nor named JSDoc exists', () => {
  expect(parseComponentDescription(project, dir('EmptyState'), 'EmptyState')).toBe(/* value of EmptyState's own named JSDoc, else */ undefined);
});
it('ignores JSDoc on a helper that is not the component', () => { /* in-memory: `/** helper *\/ const x = 1; export const Foo = () => null;` → undefined */ });
```

Before you write it, check the EmptyState expectation against its source.

- [ ] **Step 2:** Run `pnpm --filter @wallarm-org/design-system exec rstest run scripts/metadata/__tests__/parse-description.test.ts`. Expected: FAIL (`readMetaDescription` is not exported).
- [ ] **Step 3: Implement**
  - `readMetaDescription` finds the default-export meta. Reuse `unwrap`/identifier resolution from `story-source.ts`'s `readStoryTitle` by exporting a small `readMeta(sourceFile)` there.
  - It reads `parameters.docs.description.component` and resolves identifiers to their initializer.
  - It evaluates only these literal forms: string, no-substitution template, `+` of literal forms, and an array of literal forms with `.join(<literal>)`. For anything else it returns `undefined`.
  - `parseComponentDescription` tries `readMetaDescription` on the first file of `findStoryFiles(project, componentDir)`. Otherwise it uses the JSDoc of the variable or function **named `componentName`** in `${Name}.tsx` / `${Name}Root.tsx`.
- [ ] **Step 4:** Run the test. Expected: PASS. Then run the metadata suite: `pnpm --filter @wallarm-org/design-system exec rstest run scripts/metadata`. Update existing expectations only where a description changed for the better.
- [ ] **Step 5:** Commit `fix(metadata): read component descriptions from the story meta`.

### Task 2: StoryObj `render:` bodies kept in `code` (`fix(metadata)`)

**Files:**
- Modify: `packages/design-system/scripts/metadata/parse-examples.ts:58-60`
- Test: `packages/design-system/scripts/metadata/__tests__/parse-examples.test.ts` (add a describe block)

- [ ] **Step 1: Failing test**

```ts
describe('FilterInput (StoryObj with render)', () => {
  const examples = parseExamples(project, path.join(componentsDir, 'FilterInput'), 'FilterInput');
  it('uses the render body, not args-only JSX', () => {
    const story = examples.find(e => e.name === 'WithPresetValue')!;
    expect(story.code).not.toBe('<FilterInput />');
    expect(story.code).toContain('<FilterInput');
    expect(story.code).toMatch(/useState|value=/);
  });
});
```

Check the story's body first and pin one distinctive identifier from it.

- [ ] **Step 2:** Run the test. Expected: FAIL.
- [ ] **Step 3: Implement.** In the `ObjectLiteralExpression` branch, if the object has a `render` property whose initializer is an arrow or function expression, use its text as `code`. Otherwise keep `reconstructJsxFromStoryObj`.
- [ ] **Step 4:** Run the metadata suite and `pnpm --filter @wallarm-org/mcp exec rstest run`. Expected: PASS. Fix only fixtures whose content legitimately changed.
- [ ] **Step 5:** Commit `fix(metadata): keep StoryObj render bodies in examples`.

### Task 3: Props tables without inherited HTML attributes, with a Props fallback (`fix(metadata)`)

**Files:**
- Modify: `packages/design-system/scripts/metadata/parse-props.ts:28` (inherited filter), `:173` (fallback)
- Test: `packages/design-system/scripts/metadata/__tests__/parse-props.test.ts`

- [ ] **Step 1: Failing tests**
  - `Input props exclude attributes declared only in @types/react`: `onCopy`, `autoCapitalize` and `accessKey` are absent. Props in `KEEP_NATIVE`, and props with defaults, stay.
  - `falls back to the first call-signature parameter when <Name>Props is not exported`: pick a component from `scripts/metadata` output whose `props` is `[]` today and which has a typed first parameter. Assert it is non-empty.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement**
  - A prop is inherited when every declaration of its symbol is in a file under `node_modules/@types/react`.
  - The fallback uses the type of the first parameter of the component's call signature.
  - Sub-components come from the value exports of the component's `index.ts`.
- [ ] **Step 4:** Run the metadata suite, the MCP tests, and `pnpm --filter @wallarm-org/docs build`. Expected: all pass. The docs pages' prop tables shrink and no page disappears.
- [ ] **Step 5:** Commit `fix(metadata): drop inherited DOM props and fall back to call signatures`.

### Task 4: One exclusion list and a split list in `config.ts`

**Files:**
- Modify: `packages/design-system/claude-design/config.ts`
- Modify: `claude-design/docs/build-docs.ts:10-20`, `claude-design/previews/build-previews.ts:13-23`

**Interfaces:**
- Produces:
  - `CLAUDE_DESIGN.internal: ReadonlySet<string>`, holding `ThemeProvider`, `DateFormatProvider`, `ButtonBase`, `Polymorphic`, `TemporalCore`, `Checkmark`. These are internal primitives with no guide.
  - `CLAUDE_DESIGN.splitByStoryFile: ReadonlySet<string>` = `{'SimpleCharts'}`.
  - Removes `excludedModules`.

- [ ] **Step 1:** Edit config. Import `internal` in both builders and delete their local sets. BulkBar, NavPanel and SimpleCharts are no longer excluded.
- [ ] **Step 2:** Run `pnpm --filter @wallarm-org/design-system typecheck`. Expected: PASS. Nothing else imports `excludedModules` (`grep -rn excludedModules packages`).
- [ ] **Step 3:** Commit, together with Task 5 (same deliverable).

### Task 5: Guides copy stories verbatim

**Files:**
- Create: `packages/design-system/claude-design/docs/story-guide.ts`. It builds one guide's Markdown and the `stories.md` overflow.
- Modify: `claude-design/docs/component-readme.ts`. Keep the props-table and sub-component code (`kebab`, `tableText`, `normalizedType`). Delete `collections`, `toastRecipe`, the Tour/Toast/Select/FilterDropdown/Table branches, the `## When to use` boilerplate, the fallback summary, the `## Source examples` repo paths, and the imports of `toCanvasExample` / `toCanvasAdapter` / `canvasRecipes`.
- Modify: `claude-design/docs/build-docs.ts`: SimpleCharts split, the "Not synced" list, and the drop guard.
- Modify: `claude-design/docs/consuming.ts`: delete `tableExample` and its use.
- Delete: `claude-design/docs/canvas-adapter.ts`, `canvas-adapter.test.ts`, `canvas-recipes.ts`, `canvas-recipes.harness.test.ts`.
- Test: `claude-design/docs/build-docs.test.ts`. Rewrite the recipe/collection assertions.

**Interfaces:**
- Consumes: `DesignSystemMetadata` (with Task 1–3 fixes) and `CLAUDE_DESIGN.internal` / `splitByStoryFile`.
- Produces:
  - `storyGuide(input: { name: string; description?: string; reference: string; stories: ExampleMetadata[]; modules: { path: string; text: string }[] }): { readme: string; overflow?: string }`.
    - `reference` is the props and sub-components Markdown from `componentReadme`.
    - `modules` holds the story files plus the shipped local imports, in order.
    - `readme` is ≤64,000 B. If inline sources would exceed that, they go to `overflow` (written as `stories.md`) and `readme` links `./stories.md`.
  - `buildDocs` returns `{ components: string[]; notSynced: string[] }`.

Guide layout (Markdown, in this order):
1. The description, if any.
2. The props table and sub-components.
3. `## Stories`: one `### <name>` per story in Storybook order, followed by its description (if any) and the line `Source: <story file>#<export>`.
4. `## Story sources`: one fenced `tsx` block per module, headed by its path relative to `src/components`.

Nothing else.

- [ ] **Step 1: Failing tests** in `build-docs.test.ts`. Replace the recipe tests with:

```ts
it('lists every metadata story of a guided component', () => { /* for each component in components: every example.name appears as `### ${name}` in README.md or stories.md */ });
it('Table guide shows the master-cell, pinning, row-drag, editing, context-menu, nested, grouping and selection stories', () => { /* pin real export names from Table.stories.tsx */ });
it('Table sources go to stories.md', () => { /* README.md ≤64000 and links ./stories.md; stories.md contains 'Table/mocks.tsx' and the full Table.stories.tsx text */ });
it('ships every non-public relative import', () => { /* Table guide includes Table/mocks.tsx; does not include Table/Table.tsx (public) */ });
it('splits SimpleCharts per story file', () => { /* components contains LineChart, Metric, PieChart, BarList, AreaChart, ColumnChart, HorizontalBarStack, Chart, Overview; not SimpleCharts */ });
it('no fallback prose and no recipes', () => { /* no guide contains 'is a Wallarm design-system component', '## When to use', 'WallarmToastExample', 'WallarmExample', '## Collections', 'TableCells' */ });
it('lists components without stories and internals in Not synced', () => { /* README "Not synced" mentions NavRail, TopHeader, BulkBar with 'no Storybook story', ThemeProvider with 'internal' */ });
```

- [ ] **Step 2:** Run `pnpm --filter @wallarm-org/design-system test:claude-design`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement**
  - **Shipped modules.** For each story file of a guide, ship a relative import when at least one of its imported value names is not in `publicNames`. That map is already built in `build-docs.ts`; reduce it to bare names. Recurse into shipped modules with the same rule. Deduplicate by path.
  - **SimpleCharts split.** For components in `splitByStoryFile`, group `examples` by `storyFile`. The guide name is the story file basename without `.stories.tsx`. `reference` is the props of the sub-component with that name, if one exists.
  - **Drop guard.** Throw if a guided component's example names do not equal the set of `### ` headings emitted.
  - **Not synced.**
    - Public components with no examples get `"<Name>: no Storybook story; props only."`.
    - `internal` names get `"<Name>: internal primitive; no guide."`.
    - Drop the Tour, Toast, "unresolved dependencies" and "phase 2" lines at `build-docs.ts` and `build.ts:37-39`.
    - Replace them with `Screen templates are deferred.`
- [ ] **Step 4:** Run `pnpm --filter @wallarm-org/design-system build:claude-design && pnpm --filter @wallarm-org/design-system test:claude-design`. Expected: PASS. Then `grep -rn "WallarmExample\|canvasRecipes\|tableExample\|toastRecipe" packages/design-system/claude-design` returns nothing.
- [ ] **Step 5:** Commit `feat(claude-design): ship Storybook stories verbatim as guide references`.

### Task 6: Previews for every story; story classes in CSS

**Files:**
- Modify: `claude-design/previews/build-previews.ts:47-62` (drop the cap) and `:81-102` (split)
- Modify: `claude-design/css/entry.css:7,10,11`. Remove the `@source not` lines for `*.stories.*`, `stories/**` and `story-content/**`. Keep tests, e2e, `__tests__` and `__fixtures__`.
- Test: `claude-design/harness/previews.harness.test.ts`, `claude-design/build.test.ts`

- [ ] **Step 1: Failing tests**
  - `every story has a preview section`: for each component, the `data-preview-story` names across its preview parts equal its exported story names.
  - The existing ImageCropper `test:claude-design` case passes. It fails today.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement**
  - Take all stories, not 4.
  - When a component's `stories.js` would exceed 512,000 B, build it in parts of N stories: `stories-1.js`, … with `preview.html`, `preview-2.html`, …. Each `preview*.html` keeps the `@dsCard` header.
  - For SimpleCharts, group previews the same way as Task 5 (per story file).
- [ ] **Step 4:** Run `build:claude-design`, `test:claude-design` and `claude-design:verify`. Expected: PASS. `summary.json`: `cssBytes` < 2,000,000, total files ≤ the cap confirmed in Task 0.
- [ ] **Step 5:** Commit `feat(claude-design): preview every story and keep story styles`.

### Task 7: The translation rule; drop `TableCells` (depends on Task 0)

**Files:**
- Modify: `claude-design/docs/consuming.ts` (the "Consuming this system" section) or `readme-root.md`. Add `## From a Storybook story to an artboard`.
- Delete: `claude-design/bundle/helpers/TableCells.tsx`, plus its export in `bundle/entry.ts` and the `@source '../bundle/helpers'` line in `css/entry.css` if nothing else is left there.
- Test: `build-docs.test.ts` (`root README carries the translation rule`); `harness/bundle.harness.test.ts` (remove TableCells expectations).

- [ ] **Step 1:** Failing test. The root README contains the rule's headings: imports→`WallarmDS.X`, JSX→`x-import`, kebab-case attributes, `{{hole}}` for non-strings, `useState`→`setState`, handlers→`renderVals()` methods, fixtures→script constants, render-prop props→the Task 0 result, Storybook-only parts ignored, everything inside `WallarmDS.Root`. It does not contain `TableCells`.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Write the rule. Use the spec's "Translation rule" bullets verbatim, with the render-prop bullet filled from Task 0. Delete TableCells.
- [ ] **Step 4:** Run `test:claude-design` and `claude-design:verify`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(claude-design): document the story-to-artboard translation rule`.

### Task 8: `CLAUDE_DESIGN_GAP.md`

**Files:** Create `packages/design-system/claude-design/CLAUDE_DESIGN_GAP.md`.

- [ ] **Step 1:** Re-derive each list in the spec's Step 3 from the code, not from the recon:
  - components without stories;
  - Table props in `types.ts` that no story uses (`rg` each prop name across `Table/*.stories.tsx`);
  - `LineChartZoomPopover*`;
  - stories built on local wrapper components;
  - stories without a description.

  Use a throwaway script in the scratchpad.
- [ ] **Step 2:** Write the file with one section per list. Give each item its `file:line` and a one-line "what Storybook should show". Begin with one paragraph: the purpose (Storybook gaps the Claude Design agent cannot learn from), and the fact that items are closed by adding stories, never by the export.
- [ ] **Step 3:** Commit `docs(claude-design): list Storybook gaps for Claude Design`.

### Task 9: Build correctness cleanup

**Files:** `claude-design/build.ts`, `claude-design/build.test.ts`, `.github/workflows/main.yml`

- [ ] **Step 1: Failing tests** in `build.test.ts`:
  - The icon count equals the number of exports in `dist/icons/index.js` (no literal 582) and is > 0.
  - `design-system.json` `lastChange.by === 'Wallarm'`.
  - Each `assetGroups[g]` has `name` and `order`. Read the Design System type's `format.md` (via `describe_type` on any DS artifact) for `tile` and any other required fields, and assert those too.
  - Project files (excluding `assets/`) ≤ 1,008 minus the asset count if Task 0 says uploads count; otherwise ≤ 1,008. Asset uploads ≤ 5,000.
  - The per-file cap assertions use `CLAUDE_DESIGN.bundleBudgetBytes` / `cssCapBytes`.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3: Implement** in `build.ts`
  - `by: 'Wallarm'`.
  - Asset group fields.
  - Caps from `CLAUDE_DESIGN`.
  - `ref` from `git describe --tags --exact-match`, falling back to the branch name.
  - Wrap the build in try/finally: remove `build-*` on failure, and remove the `previous-*` backup after a successful swap. Drop `basenameOf`.
  - Keep the temp dir under `dirname(CLAUDE_DESIGN.outDir)` (same filesystem, no EXDEV).
- [ ] **Step 4:** Revert the stray blank line: `git diff .github/workflows/main.yml`, then `git checkout .github/workflows/main.yml`. Run `build:claude-design`, `test:claude-design` and `claude-design:verify`. Expected: PASS. No `previous-*` / `build-*` dirs are left in `.claude-design/`. Delete the old ones only after showing the user the list.
- [ ] **Step 5:** Commit `fix(claude-design): stable index authorship, asset group fields, single caps`.

### Task 10: Remove the one-off checker; maintainer docs

**Files:**
- Delete: `claude-design/no-impact.ts`, `no-impact.test.ts` and `no-impact.allowlist.json`; the `claude-design:no-impact` script in `package.json:95`; the `esbuild` devDependency if nothing else uses it (`rg esbuild packages/design-system`).
- Rewrite: `packages/design-system/claude-design/README.md`
- Modify: `apps/docs/docs/ai/claude-design.mdx:103`, `packages/design-system/README.md:121`

- [ ] **Step 1:** Run `pnpm --filter @wallarm-org/design-system claude-design:no-impact`. Save its PASS output to `docs/superpowers/plans/2026-11-01-pr-notes.md` (gitignored folder; for the PR body), together with the nxds comparison and the 2026-10-31 publication record moved out of the README.
- [ ] **Step 2:** Delete the checker files, the script and the dependency. Run `pnpm install`.
- [ ] **Step 3:** Rewrite `claude-design/README.md` as a short guide covering:
  - what each folder does;
  - the commands (`build:claude-design`, `test:claude-design`, `claude-design:verify`, `claude-design:plan` / `check` / `fetch`);
  - which tests need a build;
  - the budgets;
  - a link to the skill and to `CLAUDE_DESIGN_GAP.md`.

  In the mdx and the skill, the build command is just `pnpm --filter @wallarm-org/design-system build:claude-design`. Point the package README link at `https://wallarm.github.io/design-system/` (absolute URL). Add a comment in `config.ts` saying `claude-design.mdx:8` repeats `artifactUrl`.
- [ ] **Step 4:** Run `pnpm lint`, `pnpm --filter @wallarm-org/design-system typecheck` and `pnpm --filter @wallarm-org/docs build`. Expected: PASS.
- [ ] **Step 5:** Commit `chore(claude-design): drop the one-off no-impact checker and rewrite maintainer docs`.

### Task 11: `publish-plan` and `fetch`

**Files:**
- Create: `packages/design-system/claude-design/publish-plan.ts`, `publish-plan.test.ts`, `fetch.ts`
- Modify: `packages/design-system/package.json` scripts: `"claude-design:plan": "tsx claude-design/publish-plan.ts plan"`, `"claude-design:check": "tsx claude-design/publish-plan.ts check"`, `"claude-design:fetch": "tsx claude-design/fetch.ts"`

**Interfaces:**
- **Inputs.** Saved raw tool results under `.claude-design/remote/`:
  - `artifact.json` (`get_artifact`);
  - `files.json` (`list_files`);
  - `assets.json` (`list_assets`, limit 5000);
  - `index.json` (`read_file project/design-system.json`);
  - `uploads/*.json` (`upload_asset` results).

  Local inputs: `.claude-design/project/` and `file-hashes.json`.
- **Produces** `plan(dir: string): Plan`, where

  ```ts
  interface Plan {
    identityOk: boolean;
    phase: 'assets' | 'files' | 'done';
    uploads: string[][];
    batches: { files: string[]; remove: string[] }[];
    stale: string[];
    indexPath: string;
    indexSha256: string;
    counts: Record<string, number>;
  }
  ```

  It writes `publish/plan.json` and `publish/design-system.json`.
- **Produces** `check(dir: string): string[]` (problems; the CLI exits 1 if any).
- **Rules:**
  - `identityOk` means title and namespace equal `CLAUDE_DESIGN`.
  - SVGs whose sha256 has no id in `assets.json` or `uploads/*` go into `uploads` in chunks of 10. If there are any, `phase = 'assets'`.
  - File batches hold ≤256 entries including removals, and ≤64 MiB. SVGs and the index are excluded.
  - Stale paths are remote `project/` paths missing locally, excluding `artifact-type/` and type-owned entries. Orphan assets are counted, never removed.
  - The index is the **remote** index with only these keys replaced: `title`, `namespace`, `libraries`, `editing`, `groups`, `assetGroups` (ids filled from the sha256→id map), `lastChange`. Its JSON is stable-ordered.
- **`fetch.ts [tag]`:** `gh release download <tag|latest v*> -p 'claude-design-*.tgz'`, then unpack into `packages/design-system/.claude-design/`.

- [ ] **Step 1: Failing tests** with in-memory fixtures in a temp dir under `.claude-design/test-*`:
  - chunks of 10 / 256;
  - a stale path is listed and `artifact-type/x` is not;
  - the merged index keeps a page-owned key (`sections.custom`) and replaces `lastChange`;
  - the index output is byte-identical on two runs;
  - a title mismatch gives `identityOk: false`;
  - `check` reports a sha mismatch and a lingering stale path.
- [ ] **Step 2:** Run `test:claude-design`. Expected: FAIL.
- [ ] **Step 3:** Implement. Use only Node built-ins plus the existing `CLAUDE_DESIGN` config.
- [ ] **Step 4:** Run the tests. Expected: PASS. Dry run: save the four remote reads of the live artifact (main session) and run `claude-design:plan`. Expected: `identityOk: true`, and the counts show the Task 5–7 changes.
- [ ] **Step 5:** Commit `feat(claude-design): compute the publish diff from saved remote state`.

### Task 12: Release job and skill rewrite

**Files:** `.github/workflows/deploy-site.yml`, `.claude/skills/claude-design-sync/SKILL.md`

- [ ] **Step 1:** Add a `claude-design` job to `deploy-site.yml`, parallel to the deploy job, with `permissions: contents: write`. Steps:
  1. Check out the tag.
  2. Guard: `test -f packages/design-system/claude-design/build.ts || exit 0`.
  3. Set up pnpm/node as the deploy job does, then `pnpm install --frozen-lockfile`.
  4. `pnpm --filter @wallarm-org/design-system build:claude-design`.
  5. `tar czf claude-design-$TAG.tgz -C packages/design-system/.claude-design project file-hashes.json summary.json`.
  6. `gh release upload "$TAG" claude-design-$TAG.tgz --clobber`.
  7. `cat summary.json >> $GITHUB_STEP_SUMMARY`.

  Validate with `actionlint` if it is installed; otherwise get a careful read from the `ci` agent.
- [ ] **Step 2:** Rewrite SKILL.md to about 15 lines, in this order:
  1. `claude-design:fetch [tag]`.
  2. The four reads, saved to `remote/`.
  3. `claude-design:plan`; stop if `!identityOk`.
  4. Show the counts. Confirm on the first sync, and always when `stale` is non-empty, with the exact paths listed.
  5. `upload_asset` (≤10 per call), saving the results to `remote/uploads/`, then `plan` again.
  6. `publish_files` with mode `patch`, chaining `base_version`.
  7. `publish/design-system.json` last.
  8. `list_files`, then `claude-design:check`.

  Credit Wallarm. Remove the clean-tree and tag preconditions (the tag build replaces them).
- [ ] **Step 3:** Run `pnpm test:harness`. Expected: PASS.
- [ ] **Step 4:** Commit `ci(claude-design): attach the export to releases and plan publishes`.

### Task 13: Whole-branch verification

- [ ] **Step 1:** Run in parallel:
  - `pnpm lint`
  - `pnpm --filter @wallarm-org/design-system typecheck`
  - `pnpm test`
  - `pnpm --filter @wallarm-org/design-system test:claude-design`
  - `claude-design:verify`
  - `pnpm --filter @wallarm-org/docs build`
  - `pnpm --filter @wallarm-org/mcp exec rstest run`

  Expected: all pass. Report failures with their output.
- [ ] **Step 2:** Check the spec's "Done when" items one by one, with the evidence: grep results, counts from `summary.json`, test names.
- [ ] **Step 3:** Run `/vestige-audit`. Ask the user before pushing, publishing or opening a PR. Publishing the new build goes through the rewritten skill, with the user confirming the plan.
