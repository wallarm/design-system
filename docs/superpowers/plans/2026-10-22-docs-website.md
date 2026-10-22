# Docs Website (Rspress) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public docs website (`apps/docs`, Rspress v2) at `https://wallarm.github.io/design-system/` with Storybook moved to `/design-system/storybook/`, both deployed only after a stable design-system release.

**Architecture:** A pre-build script turns `components.json` (already generated from TS types + story sources by `packages/design-system/scripts/metadata/`) into one MDX page per component. Each page lazy-loads the component's story modules and renders them with `composeStories` inside a client-only `StoryPreview`, so SSG never evaluates story code. Hand-written MDX covers Get Started / Foundations / AI / Guides. Rspress' `llms: true` emits `llms.txt`, `llms-full.txt` and a `.md` per page. A separate `deploy-site.yml` workflow, dispatched by the release job, builds docs + Storybook from the release tag into one Pages artifact.

**Tech Stack:** `@rspress/core` 2.0.23, Rsbuild 2.2.x (shared `@wallarm-org/rsbuild-config`), React 19.3 + React Compiler, Tailwind v4 via `@wallarm-org/tailwind-config/postcss`, `storybook-react-rsbuild` 3.6.0 portable stories, ts-morph 28, Rstest 0.12.3.

**Spec:** `docs/superpowers/specs/2026-10-22-docs-website-design.md`

## Global Constraints

- Install `@rspress/core@2.0.23` (exact pin). Never install the `rspress` package (that is v1).
- Site package: `apps/docs`, name `@wallarm-org/docs`, `"private": true`, `"type": "module"`. Config files use `import.meta.dirname`, not `__dirname`.
- Rspress `base: '/design-system/'`, `siteOrigin: 'https://wallarm.github.io'`, `outDir` default `doc_build`.
- Storybook production `assetPrefix`: `'/design-system/storybook/'`.
- Public URLs: docs `https://wallarm.github.io/design-system/`, Storybook `https://wallarm.github.io/design-system/storybook/`. Storybook docs-page id suffix is `--overview` (`.storybook/main.ts` `docs.defaultName: 'Overview'`).
- Deploy (docs + Storybook) only for a stable `v*` design-system tag (no `-`) created by the `release` job on `main`.
- English only; latest version only; no Figma links anywhere (file is private).
- No Accessibility section on component pages.
- No `data-slot` renames/additions in the DS for the Explorer.
- DS code imported by the site resolves to `packages/design-system/src` (export condition `development`, in both the Rspress build and `apps/docs` Rstest) — one module instance shared with stories.
- Story modules are loaded only on the client: generated MDX passes a `load={() => import('…stories.tsx')}` thunk, never a top-level story import. In `.md` output (`import.meta.env.SSG_MD`) a preview renders only its code block.
- Links in MDX to non-route files (`llms.txt`, `llms-full.txt`, `*.md`, `components.json`) are absolute `https://wallarm.github.io/design-system/...` URLs (Rspress dead-link check rejects them otherwise).
- Rspress `markdown.globalComponents` are imported as default imports: those component files must `export default` (in addition to the named export). This is site code, not DS components, so the DS "named exports only" rule doesn't apply.
- Never edit `--color-syntax-*` mappings; tokens page shows them read-only.
- Conventional commits; branch `docs/website`; commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A story importing private modules from its component folder (`FilterInput/stories/FilterInputChip.stories.tsx` imports `FilterInputConnectorChip` and `./mockFilterInputContext`, not exported by `FilterInput/index.ts`) — shown code must keep those specifiers, while public names from a sibling component (`../../Stack`) become `@wallarm-org/design-system/Stack`. → Task 1 tests `keeps non-exported names relative`, `rewrites imports from a stories/ subfolder`.
2. A compound component whose content is portaled (Dialog opened in the Explorer) — its parts (`drawer-header`, …) appear after opening and disappear after closing. → Task 5 test `collectSlots includes portal roots`.
3. A prop description containing `|`, `{label}`, `<a>`, or a newline, and a component description containing `: ` — props table, paragraph and frontmatter must not break the MDX/YAML build. → Task 6 test `escapes MDX and table syntax`.
4. A component folder with no story file (ThemeProvider, NavPanel, BulkBar…) — no page, no sidebar entry, no link (dead-link check stays green). → Task 6 tests `skips components without examples` and `meta omits components without examples`.
5. An old Storybook deep link (`/design-system/?path=/story/actions-button--basic`, `/design-system/iframe.html?id=…`) — lands on the same story under `/design-system/storybook/`. → Task 8 tests.

---

### Task 1: Copyable story code in metadata

Make `examples[].code` paste-ready (for site and MCP) and read every story file of a component.

**Files:**
- Create: `packages/design-system/scripts/metadata/story-source.ts`
- Modify: `packages/design-system/scripts/metadata/parse-examples.ts`, `packages/mcp-core/src/schema.ts:29-33`
- Test: `packages/design-system/scripts/metadata/__tests__/story-source.test.ts`, `.../__tests__/parse-examples.test.ts`

(`generate.ts` and the mirrored wiring in `generate.test.ts` pass `examples` through whole — no change needed there.)

**Interfaces:**
- Produces (schema; both new fields optional so an older `components.json` still validates in `packages/mcp/src/metadata.ts`):
  ```ts
  exampleMetadataSchema = z.object({
    name: z.string(), code: z.string(), description: z.string().optional(),
    storyFile: z.string().optional(),   // relative to packages/design-system/src/components, posix, e.g. 'FilterInput/stories/FilterInput.stories.tsx'
    storyTitle: z.string().optional(),  // meta.title, e.g. 'Patterns/FilterInput/Composition'
  })
  ```
- Produces in `story-source.ts`:
  - `findStoryFiles(project: Project, componentDir: string): string[]` — every `*.stories.tsx` under `componentDir`, recursive, via `project.getFileSystem()` (`readDirSync`/`directoryExistsSync`) so in-memory fixtures work; `{Name}.stories.tsx` first, rest sorted.
  - `readStoryTitle(sourceFile: SourceFile): string | undefined` — the `title` property of the default-exported `meta` object.
  - `toCopyableCode(sourceFile: SourceFile, exportName: string, storyCode: string, srcDir: string): string` — `srcDir` = absolute `packages/design-system/src`.
- `parseExamples(project, componentDir, componentName)` keeps its signature; iterates `findStoryFiles`; examples ordered by file, then declaration order.

`toCopyableCode` output shape (exact):
```tsx
import { useState } from 'react';
import { Button } from '@wallarm-org/design-system/Button';
import { HStack } from '@wallarm-org/design-system/Stack';

export const Basic = () => (
  <Button>Button</Button>
);
```
Rules:
- Story param list is dropped (`(args) =>`, `({ ...args }) =>` → `() =>`); JSX attributes `{...args}` are removed.
- Only imports whose local identifiers occur in the story code are emitted; specifiers from the same target module are merged; module order: `react` first, other packages, then `@wallarm-org/design-system*` alphabetically, then kept relative specifiers.
- Dropped modules: `storybook-react-rsbuild`, `storybook/test`, anything starting with `@storybook/`.
- Relative specifier → resolve against the story file's directory, then:
  - `src/index` → `@wallarm-org/design-system`;
  - `src/icons` (or below) → `@wallarm-org/design-system/icons`;
  - `src/utils/<x>` → `@wallarm-org/design-system/utils/<x>`;
  - inside `src/components/<Comp>/` → `@wallarm-org/design-system/<Comp>` **only if every imported name is exported by `src/components/<Comp>/index.ts`** (`getExportedDeclarations()`); otherwise keep the original specifier unchanged (mocks, `./types`, `./constants`, fixtures, non-exported parts).
- Locally declared helpers (e.g. `ContentPlaceholder`) stay referenced as-is (story cleanup is a follow-up, spec 6.3).
- StoryObj examples keep today's `reconstructJsxFromStoryObj` output, then go through the same import header logic.

- [ ] **Step 1: Write failing tests** in `story-source.test.ts` with the in-memory pattern from `parse-examples.test.ts` (`new Project({ useInMemoryFileSystem: true })`, files under `/src/components/...`, `/src/icons/index.ts`, each fixture component with an `index.ts` exporting its public names):
  - `strips args param and spread`: `export const Basic: StoryFn<typeof meta> = ({ ...args }) => (<Button {...args} size='sm'>Go</Button>);` → contains `export const Basic = () => (` and `<Button size='sm'>Go</Button>`, no `args`.
  - `emits only used imports, merged and ordered`: imports `useState, useEffect` from `react` (only `useState` used), `Button` from `../Button`, `fn` from `storybook/test` → header exactly `import { useState } from 'react';\nimport { Button } from '@wallarm-org/design-system/Button';`.
  - `rewrites imports from a stories/ subfolder`: `/src/components/FilterInput/stories/X.stories.tsx` importing `{ FilterInput } from '../FilterInput'` and `{ VStack } from '../../Stack'` → `@wallarm-org/design-system/FilterInput`, `@wallarm-org/design-system/Stack`.
  - `keeps non-exported names relative`: `{ ConnectorChip } from '../FilterInputChip/ConnectorChip'` (not in `FilterInput/index.ts`) and `{ rows } from './mocks'` keep their specifiers.
  - `maps icons, root index and utils`: `'../../icons'` → `@wallarm-org/design-system/icons`; `'../../index'` → `@wallarm-org/design-system`; `'../../utils/cn'` → `@wallarm-org/design-system/utils/cn`.
  - `readStoryTitle reads meta title` → `'Patterns/FilterInput/Composition'`.
  - `findStoryFiles puts the main file first` (in-memory `FilterInput/FilterInput.stories.tsx` + `FilterInput/stories/B.stories.tsx` + `FilterInput/stories/A.stories.tsx` → main, A, B).
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/design-system exec rstest run scripts/metadata` — expected: FAIL (module not found).
- [ ] **Step 3: Implement** `story-source.ts`; wire into `parse-examples.ts` (set `storyFile`, `storyTitle`, `code = toCopyableCode(...)`); extend the schema.
- [ ] **Step 4: Check existing pins** in `parse-examples.test.ts` still pass unchanged (Button has one story file: 10 examples, `Basic … FullWidth`; the `/fixture` in-memory test). If a pin changes, the implementation is wrong.
- [ ] **Step 5: Run** `pnpm --filter @wallarm-org/design-system exec rstest run scripts/metadata` and `pnpm --filter @wallarm-org/mcp test:run` — expected: PASS.
- [ ] **Step 6: Run** `pnpm --filter @wallarm-org/design-system generate-metadata` — expected: exit 0; `jq '[.components[] | select(.name=="FilterInput") | .examples[].storyFile] | unique | length' packages/design-system/dist/metadata/components.json` ≥ 5.
- [ ] **Step 7: Commit** `feat(metadata): paste-ready story examples with public imports`

---

### Task 2: Normalize "Data display" story titles

**Files:**
- Modify: every `*.stories.tsx` whose meta `title` starts with `'Data display/'` (CodeEditor, SimpleCharts/*) → `'Data Display/'`
- Modify: `packages/design-system/.storybook/preview.tsx` `storySort.order` (`'Data display'` → `'Data Display'`)
- Modify: `packages/design-system/src/components/SimpleCharts/CLAUDE.md:78`

Storybook lowercases IDs, so E2E `createStoryHelper('data-display-…')` IDs do not change.

- [ ] **Step 1:** Replace the titles and the two non-story mentions.
- [ ] **Step 2: Run** `grep -rn "Data display" packages/design-system/src packages/design-system/.storybook` — expected: no output.
- [ ] **Step 3: Run** `pnpm --filter @wallarm-org/design-system build-storybook` — expected: success.
- [ ] **Step 4: Commit** `fix(storybook): unify Data Display category title`

---

### Task 3: SSR-safe ThemeProvider

**Files:**
- Modify: `packages/design-system/src/components/ThemeProvider/ThemeProvider.tsx:22-28`
- Test: `packages/design-system/src/components/ThemeProvider/ThemeProvider.test.tsx`

- [ ] **Step 1: Write failing test** `renders on the server without localStorage`: `rs.stubGlobal('localStorage', undefined)`; `renderToString(<ThemeProvider defaultTheme='dark'><span>x</span></ThemeProvider>)` (`react-dom/server`) contains `x` and does not throw. Restore the file's existing `createMemoryStorage` stub afterwards (follow the file's `beforeEach`/`afterEach` pattern).
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/design-system exec rstest run src/components/ThemeProvider` — expected: FAIL (`localStorage` error).
- [ ] **Step 3: Implement:** both `useState` initializers return the default when `typeof localStorage === 'undefined'`. No other change.
- [ ] **Step 4: Run** the same command — expected: PASS (7 tests).
- [ ] **Step 5: Commit** `fix(theme-provider): guard localStorage for server rendering`

---

### Task 4: Scaffold `apps/docs`

**Files:**
- Create: `apps/docs/package.json`, `rspress.config.ts`, `tsconfig.json`, `env.d.ts`, `rstest.config.ts`, `turbo.json`, `.gitignore`, `styles/global.css`, `theme/index.tsx`, `theme/themeScript.ts`, `theme/reactAriaPolyfill.ts`, `docs/index.mdx`, `docs/sandbox.mdx`
- Modify: root `biome.json` `files.includes` (add `"**/apps/**/*.{ts,tsx}"`, `"!**/doc_build"`, `"!**/.rspress"`)
- Modify: `.github/workflows/main.yml` — `build` job cache paths add `apps/*/node_modules`; "Upload unit test results" paths (≈ line 171) add `apps/*/test-results/junit.xml`
- Test: `apps/docs/theme/__tests__/themeScript.test.ts`

**Interfaces:**
- `theme/themeScript.ts`:
  - `resolveTheme(stored: string | null, prefersDark: boolean): 'light' | 'dark'` — `'dark'`/`'light'` win; `'auto'` or `null` follow `prefersDark`.
  - `THEME_SCRIPT: string` — IIFE built from `resolveTheme.toString()`: reads `localStorage['rspress-theme-appearance']` (try/catch) and `matchMedia('(prefers-color-scheme: dark)').matches`, sets `document.documentElement.dataset.theme`.
- `theme/index.tsx`: `export * from '@rspress/core/theme-original'`, plus overrides:
  - `Root({ children }: RootProps)` (`RootProps` from `@rspress/core/theme`): side-effect `import './reactAriaPolyfill'` (copy of `packages/design-system/.storybook/react-aria-polyfill.ts`); renders `<ThemeProvider><ThemeSync /><DateFormatProvider order='day-first'>{children}</DateFormatProvider><BrowserOnly fallback={null}>{() => <Toaster />}</BrowserOnly></ThemeProvider>`. DS imports from `@wallarm-org/design-system/<Comp>`.
  - `ThemeSync` (same file): `const dark = useDark(); const { setTheme } = useTheme(); useLayoutEffect(() => setTheme(dark ? 'dark' : 'light'), [dark, setTheme]); return null;` (`useDark`, `BrowserOnly` from `@rspress/core/runtime`).
- `rspress.config.ts` (key values; `dir = import.meta.dirname`):
  ```ts
  defineConfig({
    root: 'docs', base: '/design-system/', siteOrigin: 'https://wallarm.github.io',
    title: 'Wallarm Design System', description: 'React components, tokens and AI tooling for Wallarm products',
    llms: true, globalStyles: path.join(dir, 'styles/global.css'),
    themeConfig: {
      socialLinks: [{ icon: 'github', mode: 'link', content: 'https://github.com/wallarm/design-system' }],
      editLink: { docRepoBaseUrl: 'https://github.com/wallarm/design-system/tree/main/apps/docs/docs' },
      llmsUI: { viewOptions: ['markdownLink', 'chatgpt', 'claude'] },
    },
    builderConfig: mergeRsbuildConfig(rsbuildConfig, {
      html: { tags: [{ tag: 'script', children: THEME_SCRIPT, head: true, append: false }] },
      tools: { postcss: { postcssOptions: { plugins: postcssConfig.plugins } },
               rspack: { resolve: { conditionNames: ['development', '...'] } } },
    }),
  })
  ```
  `mergeRsbuildConfig` from `@rsbuild/core`; `rsbuildConfig` from `@wallarm-org/rsbuild-config/rsbuild.config` (brings `pluginReact({ reactCompiler: true })`; Rspress skips its own `pluginReact` when one with the same name exists); `postcssConfig` from `@wallarm-org/tailwind-config/postcss`. Do not use the Rspress `head` option (its tuple form can't carry script content).
- `rstest.config.ts`: `mergeRstestConfig(reactConfig, { resolve: { conditionNames: ['development', 'browser', '...'] } })` (setting it replaces rstest's jsdom default, so `browser` is repeated). If the installed rstest types reject top-level `resolve`, use `tools.rspack.resolve.conditionNames` with the same value.
- `env.d.ts`: `interface ImportMetaEnv { readonly SSG_MD: boolean }` (Rspress doesn't ship this type).
- `styles/global.css`: the three imports from `apps/playground/src/App.css:1-3`; map Rspress chrome vars (`--rp-c-brand*`, `--rp-c-bg*`, `--rp-c-divider*`, `--rp-c-text-*`, `--rp-font-family-base`/`-mono`) to DS `--color-*` tokens / Geist under `:root` and `html.rp-dark`; copy `.sb-annotation`/`.sb-annotation-alt` from `packages/design-system/.storybook/preview.css`, and `@import` `../../packages/design-system/.storybook/fonts/kalam.css`.
- `package.json` scripts: `"dev": "rspress dev"`, `"build": "rspress build"`, `"preview": "rspress preview"`, `"lint": "biome check"`, `"test": "rstest watch"`, `"test:run": "rstest run"`, `"typecheck": "tsc --noEmit"` (Task 6 prefixes dev/build with the generator). Dependencies: `@rspress/core` `2.0.23`, `@wallarm-org/design-system` `workspace:*`, `react`, `react-dom`, `tailwindcss`, `tw-animate-css`, `storybook` (all `catalog:`), `storybook-react-rsbuild` `3.6.0`, `@tanstack/react-router` `1.170.41`. Dev: `@rsbuild/core`, `@rstest/core`, `@testing-library/react`, `@types/node`, `@types/react`, `@types/react-dom`, `jsdom`, `typescript` (all `catalog:`), `tsx` `4.23.15`, `@wallarm-org/mcp-core`, `@wallarm-org/rsbuild-config`, `@wallarm-org/rstest-config`, `@wallarm-org/tailwind-config`, `@wallarm-org/typescript-config` (all `workspace:*`).
- `turbo.json`: `{ "extends": ["//"], "tasks": { "build": { "outputs": ["doc_build/**"] }, "test:run": { "inputs": ["$TURBO_DEFAULT$"] } } }`.
- `.gitignore`: `doc_build`, `docs/components/`, `docs/foundations/tokens.md`, `docs/get-started/changelog.md`, `docs/public/components.json`.
- `docs/index.mdx`: `pageType: home`, hero title "Wallarm Design System" (final content in Task 7). Home pages discard MDX body content, so live smoke content goes in `docs/sandbox.mdx` (a doc page): a DS `<Button>` inside `<BrowserOnly>`. `sandbox.mdx` is deleted in Task 7.

- [ ] **Step 1: Write failing test** `themeScript.test.ts`: `resolveTheme('dark', false) === 'dark'`, `resolveTheme('light', true) === 'light'`, `resolveTheme('auto', true) === 'dark'`, `resolveTheme(null, false) === 'light'`; `THEME_SCRIPT` contains `rspress-theme-appearance` and `dataset.theme`.
- [ ] **Step 2: Run** `pnpm install && pnpm --filter @wallarm-org/docs test:run` — expected: FAIL (module missing).
- [ ] **Step 3: Implement** the files above.
- [ ] **Step 4: Run** `pnpm --filter @wallarm-org/docs test:run` — expected: PASS.
- [ ] **Step 5: Run** `pnpm turbo run build --filter=@wallarm-org/docs...` — expected: success; `doc_build/llms.txt` contains `https://wallarm.github.io/design-system/`; `doc_build/index.html` contains `dataset.theme` inside a closed `<script>…</script>`; `DEBUG=rsbuild pnpm --filter @wallarm-org/docs build` then `grep -n "development" apps/docs/doc_build/rsbuild.config.js` shows the condition.
- [ ] **Step 6: Run** `pnpm --filter @wallarm-org/docs preview --port 4173`, open `http://localhost:4173/design-system/sandbox`: the Button has DS styles; toggling Rspress dark mode flips `<html data-theme>`. Stop the server.
- [ ] **Step 7: Commit** `feat(docs): scaffold Rspress docs app`

---

### Task 5: `StoryPreview` and `Explorer`

**Files:**
- Create: `apps/docs/theme/components/StoryPreview.tsx`, `Explorer.tsx`, `collectSlots.ts`, `useStory.ts`
- Modify: `apps/docs/rspress.config.ts` (`markdown.globalComponents: [path.join(dir, 'theme/components/StoryPreview.tsx'), path.join(dir, 'theme/components/Explorer.tsx')]`)
- Test: `apps/docs/theme/components/__tests__/collectSlots.test.ts`, `.../__tests__/StoryPreview.test.tsx`

**Interfaces:**
- `type StoryLoader = () => Promise<Record<string, unknown>>` (a story module namespace).
- `useStory(load: StoryLoader, name: string): ComponentType | null` — on mount, `Promise.all([load(), import('storybook-react-rsbuild')])`, then `composeStories(module)[name]`; returns `null` until resolved.
- `StoryPreview({ load, name, hideCode = false, children }: { load: StoryLoader; name: string; hideCode?: boolean; children: ReactNode })` — named + default export. `children` is the fenced code block. When `import.meta.env.SSG_MD` returns `<>{children}</>`. Otherwise: bordered, centered preview box `<BrowserOnly fallback={<Skeleton …/>}>{() => <Live load name />}</BrowserOnly>` (`Live` uses `useStory`) and a Preview/Code toggle (DS `SegmentedControl`) that shows `children` on "Code". `hideCode` omits the toggle.
- `collectSlots(roots: Element[]): string[]` — distinct `data-slot` values of `[data-slot]` elements in `roots` (a root itself included), DOM order, root order preserved.
- `Explorer({ load, name }: { load: StoryLoader; name: string })` — named + default export; client-only. Left: preview container (ref) rendering the story. Right: list of `collectSlots([container, ...portalRoots()])`, where `portalRoots()` = `document.body` children except `#__rspress_root`, `#__rspress_modal_container` and the explorer's own overlay. One `MutationObserver` on `container` and `document.body` (`{ childList: true, subtree: true }`) triggers rescans; disconnect on unmount. Hover → absolutely positioned outline overlay (portaled to `document.body`, `pointer-events: none`, DS border token color) over each match's `getBoundingClientRect()`; click pins/unpins. Never mutates DS elements. In SSG_MD returns `null`.

- [ ] **Step 1: Write failing tests:**
  - `collectSlots` (jsdom): `<div data-slot='a'><span data-slot='b'/><span data-slot='a'/></div>` → `['a','b']`; `collectSlots includes portal roots`: extra root `<div><p data-slot='drawer-header'/></div>` → `['a','b','drawer-header']`; empty root → `[]`.
  - `StoryPreview renders only code in markdown output`: `rs.mock('@rspress/core/runtime', () => ({ BrowserOnly: ({ children }) => children() }))`, `rs.stubEnv('SSG_MD', 'true')`; render with children `<pre>CODE</pre>` and a `load` that never resolves → container text is exactly `CODE`.
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/docs test:run` — expected: FAIL.
- [ ] **Step 3: Implement** and register global components.
- [ ] **Step 4: Run** tests — expected: PASS.
- [ ] **Step 5: Manual check:** in `docs/sandbox.mdx` add `<Explorer load={() => import('<rel>/packages/design-system/src/components/Dialog/Dialog.stories')} name='Basic' />`; in `pnpm --filter @wallarm-org/docs dev` open `/design-system/sandbox`, open the Dialog — `drawer-*` slots appear and highlight on hover; closing removes them. Then `pnpm --filter @wallarm-org/docs build` succeeds (proves story code is not evaluated during SSG).
- [ ] **Step 6: Commit** `feat(docs): story preview and anatomy explorer`

---

### Task 6: Page generator

**Files:**
- Create: `apps/docs/scripts/generate.ts` (file IO only), `apps/docs/scripts/render.ts` (pure)
- Modify: `apps/docs/package.json` scripts → `"dev": "tsx scripts/generate.ts && rspress dev"`, `"build": "tsx scripts/generate.ts && rspress build"`
- Test: `apps/docs/scripts/__tests__/render.test.ts`

**Interfaces:**
- Input: `packages/design-system/dist/metadata/components.json` (read by path). If missing, `generate.ts` runs `pnpm --filter @wallarm-org/design-system generate-metadata` first. Types from `@wallarm-org/mcp-core`.
- `render.ts`:
  - `toStoryId(title: string): string` — lowercase, runs of non-`[a-z0-9]` → `-`, trimmed (`'Data Display/Selection'` → `'data-display-selection'`).
  - `escapeMdx(text: string): string` — `{`/`}` → `\{`/`\}`, `<` → `&lt;`, `>` → `&gt;`.
  - `escapeCell(text: string): string` — `escapeMdx`, then `|` → `\|`, newlines → space, trim.
  - `renderPropsTable(props: PropMetadata[]): string` — `| Prop | Type | Default | Description |`; type in backticks (with `|` escaped); required props get ` *`.
  - `renderComponentPage(c: ComponentMetadata, opts: { storyImportBase: string; hasSubcomponents: boolean }): string | null` — `null` when `c.examples` is empty. Output, in order:
    1. frontmatter: `title: ${JSON.stringify(c.name)}`, `description: ${JSON.stringify(c.description ?? '')}`;
    2. `# <Name>`, `escapeMdx(description)`, links line `[Source](https://github.com/wallarm/design-system/tree/main/packages/design-system/src/components/<Name>) · [Storybook](https://wallarm.github.io/design-system/storybook/?path=/docs/<toStoryId(first storyTitle)>--overview)`;
    3. first example: `<StoryPreview load={() => import('<storyImportBase>/<storyFile>')} name='<name>'>` + blank line + fenced `tsx` `code` + blank line + `</StoryPreview>`;
    4. `## Usage` — fenced `tsx` with the `@wallarm-org/design-system…` import lines taken from the first example's `code` header (fallback when none: `import { <Name> } from '<importPath>';`);
    5. `## Examples` — every other example: `### <name split on case: 'WithFooter' → 'With footer'>`, `escapeMdx(description)`, `StoryPreview`. When >1 distinct `storyFile`: group under `### <last storyTitle segment>` with examples as `####`;
    6. `## Props` — `renderPropsTable(c.props)`; then per sub-component with props `### <sub.name>` + table;
    7. `## Explorer` + `<Explorer load={…first storyFile…} name='<first example>' />` — only when `opts.hasSubcomponents`.
  - `kebab(name: string): string` — `DateRangeInput` → `date-range-input`, `OTPInput` → `otp-input`.
  - `renderComponentsMeta(components: ComponentMetadata[]): string` — JSON for `docs/components/_meta.json`: `"index"` first, then per category `{ "type": "section-header", "label": <category> }` followed by `kebab(name)` file names; only components with examples; category = first segment of first example's `storyTitle`; category order: Actions, Inputs, Inputs Date, Data Display, Navigation, Overlay, Messaging, Status Indication, Layout, Loading, Typography, Primitives, Patterns, Pages, AI, Brand (unknown categories last, alphabetical); components alphabetical within.
  - `renderComponentsIndex(components: ComponentMetadata[]): string` — `docs/components/index.mdx`: `# Components`, per category `## <category>` + a bullet list of `[<Name>](./<kebab>)` — `escapeMdx(first sentence of description)`.
  - `renderTokensPage(tokens: TokenCategory[]): string` — `# Tokens`, per category `## <name>` + `| Token | Value |` table (cells via `escapeCell`); categories whose name contains `syntax` get "Code-managed mapping — do not override." under the heading.
  - `renderChangelogPage(changelogMd: string): string` — frontmatter `title: "Changelog"`, then `# Changelog`, then the file content (it starts at `## [x.y.z]`; it has no `# Changelog` heading).
- `generate.ts`: clears and writes `docs/components/` (`<kebab>.mdx`, `index.mdx`, `_meta.json`), `docs/foundations/tokens.md`, `docs/get-started/changelog.md` (from `packages/design-system/CHANGELOG.md`), `docs/public/components.json` (copy). `storyImportBase` = posix relative path from `apps/docs/docs/components` to `packages/design-system/src/components`. `hasSubcomponents` = first story file's text matches `/\bsubcomponents\s*:/`.
- Theme override in `theme/index.tsx`: `EditLink` wraps the original and returns `null` when `usePage().page.routePath` (from `@rspress/core/runtime`) starts with `/components/` or equals `/foundations/tokens` or `/get-started/changelog` (generated files; component pages already link Source).

- [ ] **Step 1: Write failing tests** (inline `ComponentMetadata` fixtures):
  - `toStoryId`: `'Data Display/Selection'` → `'data-display-selection'`; `'Patterns/Click to Copy'` → `'patterns-click-to-copy'`.
  - `escapes MDX and table syntax`: prop description `'Clear {label} | for <a> links\nnext'` → row contains `Clear \{label\} \| for &lt;a&gt; links next`; component description `'Note: a {b}'` → frontmatter line is `description: "Note: a {b}"` and body paragraph contains `Note: a \{b\}`.
  - `skips components without examples`: `renderComponentPage({ …, examples: [] }, …) === null`.
  - `meta omits components without examples`: `renderComponentsMeta` output has no entry for it.
  - `renders sections in order`: indices of `<StoryPreview`, `## Usage`, `## Examples`, `## Props` ascending; Storybook link ends with `--overview)`; Usage block contains the `@wallarm-org/design-system/Button` import line from the example header.
  - `explorer only with subcomponents`: `hasSubcomponents: false` → no `## Explorer`; `true` → contains `<Explorer load=`.
  - `groups multi-file components`: two `storyFile`s → two distinct `import('…')` paths and a `### Composition` heading.
  - `renderComponentsMeta orders categories`: `"index"` first; `Actions` section-header before `Inputs`.
  - `renderChangelogPage adds heading`: output contains `# Changelog\n` followed by `## [3.3.0]`.
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/docs test:run` — expected: FAIL.
- [ ] **Step 3: Implement** `render.ts`, `generate.ts`, the `EditLink` override; update scripts.
- [ ] **Step 4: Run** tests — expected: PASS.
- [ ] **Step 5: Run** `pnpm turbo run build --filter=@wallarm-org/docs...` — expected: success (dead-link check on); `ls apps/docs/doc_build/components/*.html | wc -l` ≈ number of component folders with stories + 1 (index); `doc_build/components/button.md` contains ```` ```tsx ```` and no `StoryPreview`.
- [ ] **Step 6: Manual check** in `preview`: Button, Dialog (Explorer), FilterInput (grouped), AppShell (router decorator), Toast (the toast appears — proves the site's `Toaster` and the story share one DS module instance), DateInput pages render without console errors. List any story that fails in the commit body; don't fix stories here.
- [ ] **Step 7: Commit** `feat(docs): generate component, tokens and changelog pages`

---

### Task 7: Hand-written pages and navigation

**Files** (under `apps/docs/docs/`; delete `sandbox.mdx`):
- `index.mdx`: `pageType: home`; hero "Wallarm Design System", tagline from the frontmatter description, actions → `/get-started/introduction`, `/components/`; features: Components, AI-ready (MCP + llms.txt), Tokens.
- `_nav.json`: `[{ "text": "Get Started", "link": "/get-started/introduction" }, { "text": "Components", "link": "/components/" }, { "text": "Foundations", "link": "/foundations/tokens" }, { "text": "AI", "link": "/ai/mcp" }, { "text": "Guides", "link": "/guides/testing" }, { "text": "Storybook", "link": "https://wallarm.github.io/design-system/storybook/" }]`
- `_meta.json` (root, single sidebar): `[{"type":"dir-section-header","name":"get-started","label":"Get Started"},{"type":"dir-section-header","name":"foundations","label":"Foundations"},{"type":"dir-section-header","name":"components","label":"Components"},{"type":"dir-section-header","name":"ai","label":"AI"},{"type":"dir-section-header","name":"guides","label":"Guides"}]`
- `get-started/_meta.json`: `["introduction","installation","theming","routing",{"type":"dir","name":"migrations","label":"Migration guides"},"changelog"]`
- `get-started/introduction.mdx` — rewrite of `packages/design-system/docs/getting-started.md`; links GitHub, npm (`https://www.npmjs.com/package/@wallarm-org/design-system`), Storybook. No component-count claim.
- `get-started/installation.mdx` — from `packages/design-system/docs/installation.md` with fixes: drop the Node 18+ line, add `@internationalized/date@^3.12.0` to peers, add a PostCSS step (`@tailwindcss/postcss` in `postcss.config.mjs`), keep ThemeProvider + frame style + troubleshooting + tree-shaking. Package-manager variants via `PackageManagerTabs` from `@rspress/core/theme`.
- `get-started/theming.mdx` — `ThemeProvider`/`useTheme`, `data-theme` on `<html>`, frame style `neutral|branded`, overriding tokens with CSS variables (link `/foundations/tokens`), micro-frontend default caveat.
- `get-started/routing.mdx` — `asChild` (`Link`, `Button`, `NavPanelItem`, `NavPanelGroupItem`, `NavRailItem`, `TopHeaderLogo`, `Card`, `TabsTrigger`) with TanStack Router `<Link to>`, React Router `<NavLink to>`, `next/link`; `BreadcrumbsItem` (`href` + `onClick` with `preventDefault` + `navigate`); `RemoteShell` (`pathname`/`onNavigate`/`basePath`: the three TanStack variants from `docs/tech-design-global-navigation.md:572-616`, plus React Router `useLocation`/`useNavigate`); limitation: RemoteShell nav items render `<a>` without `href` (no middle-click).
- `get-started/migrations/_meta.json`: `["index","v3","v2","v1"]`; `index.mdx` — `@wallarm-org/migrator` "Usage" and "Consumer setup" from `packages/migrator/README.md` (omit "Adding a migration"); `v3.mdx` (Avatar sizes `xs→md`, `sm→lg`, new 20px `sm`, `AvatarContent`/`AvatarName`/`AvatarDescription`, `role='img'` change; codemod `avatar-size-rename`); `v2.mdx` (NumericBadge `type`→`type`+`color` mapping table, new defaults, `data-color`, clickable badge behavior; codemod `numeric-badge-type-color`); `v1.mdx` (Table on TanStack Table v9: `DSTableFeatures`, `onColumnPinningChange` always includes `right`, `ColumnMeta` generics, `table.getState()` removed; no codemod).
- `foundations/_meta.json`: `["tokens","icons"]`; `foundations/icons.mdx` — import from `@wallarm-org/design-system/icons`, `size` (`inherit` default, `xs`–`2xl`), `title` for meaningful icons; gallery `<StoryPreview load={() => import('<rel>/packages/design-system/src/icons/module/Icons.stories')} name='AllIcons' hideCode>` + a short code fence.
- `ai/_meta.json`: `["mcp","llms"]`; `ai/mcp.mdx` — 4 tools (`search_component`, `get_component`, `search_token`, `get_token_category`) and 3 resources from `packages/mcp/src/index.ts`; requires the DS installed (or `--metadata-path`); server key `@wallarm-org/mcp`, command `npx -y @wallarm-org/mcp`; Claude Code `claude mcp add @wallarm-org/mcp -- npx -y @wallarm-org/mcp`; Cursor `.cursor/mcp.json` + "Add to Cursor" link `cursor://anysphere.cursor-deeplink/mcp/install?name=@wallarm-org/mcp&config=<base64 of {"command":"npx","args":["-y","@wallarm-org/mcp"]}>`; VS Code `.vscode/mcp.json` (`"servers"` key); link to `https://wallarm.github.io/design-system/components.json`.
- `ai/llms.mdx` — `https://wallarm.github.io/design-system/llms.txt`, `…/llms-full.txt`, per-page `.md` (example `https://wallarm.github.io/design-system/components/button.md`), the copy/open buttons, `components.json`.
- `guides/_meta.json`: `["testing","analytics"]`; `guides/testing.mdx` — consumer parts of `docs/test-id-pattern.md` (cascade, `{base}--{slot}`, Alert example + Playwright `getByTestId`, Toast/Tour exceptions, `TestIdProvider`/`useTestId` from `@wallarm-org/design-system/utils/testId`); `guides/analytics.mdx` — consumer parts of `docs/metrics/contract.md` (attribute forwarding, `data-analytics-props` byte-for-byte, `asChild`, sub-component seams, no blanket `stopPropagation`, `data-ds-suppress-parent-click`, coexistence with `data-slot`/`data-testid`; omit `captureAnalyticsClicks`).

- [ ] **Step 1: Write the pages.** Every code snippet must use names exported by `packages/design-system/src/index.ts` / the component `index.ts`.
- [ ] **Step 2: Run** `pnpm turbo run build --filter=@wallarm-org/docs...` — expected: success (dead-link check passes).
- [ ] **Step 3: Manual check** in `preview`: nav and sidebar match; search finds "asChild" and "llms"; "Copy page" button present; home page renders hero and features.
- [ ] **Step 4: Commit** `docs(site): get started, foundations, AI and guides pages`

---

### Task 8: Old Storybook link redirect

**Files:**
- Create: `apps/docs/theme/storybookRedirect.ts`, `apps/docs/theme/StorybookRedirect.tsx`
- Modify: `apps/docs/rspress.config.ts` (`globalUIComponents: [path.join(dir, 'theme/StorybookRedirect.tsx')]`)
- Test: `apps/docs/theme/__tests__/storybookRedirect.test.ts`

**Interfaces:**
- `storybookRedirectTarget(loc: { pathname: string; search: string; hash: string }, base: string): string | null` — returns `${base}storybook/${rest}${search}${hash}` when `search` has a `path` or `id` param, or `pathname` ends with `iframe.html`; `rest` = pathname after `base` (empty at the root). `null` otherwise, and always for paths already under `${base}storybook/`.
- `StorybookRedirect` (default export): `useEffect` → `const t = storybookRedirectTarget(location, '/design-system/'); if (t) location.replace(t)`; renders `null`.

- [ ] **Step 1: Write failing tests:**
  - `/design-system/` + `?path=/story/actions-button--basic` → `/design-system/storybook/?path=/story/actions-button--basic`
  - `/design-system/iframe.html` + `?id=actions-button--basic&viewMode=story` → `/design-system/storybook/iframe.html?id=actions-button--basic&viewMode=story`
  - `/design-system/components/button` + `''` → `null`
  - `/design-system/storybook/` + `?path=/x` → `null`
- [ ] **Step 2: Run** tests — FAIL. **Step 3:** implement. **Step 4:** run — PASS.
- [ ] **Step 5: Manual check** in `preview`: `http://localhost:4173/design-system/iframe.html?id=x` (served by `404.html`) and `/design-system/?path=/story/x` navigate to `/design-system/storybook/...`.
- [ ] **Step 6: Commit** `feat(docs): redirect legacy Storybook URLs`

---

### Task 9: Build smoke check

**Files:**
- Create: `apps/docs/scripts/check-build.ts`
- Modify: `apps/docs/package.json` (`"check:build": "tsx scripts/check-build.ts"`)

Asserts relative to `doc_build/`, exiting 1 with the failing check's name:
- `llms.txt` exists and contains `https://wallarm.github.io/design-system/`; `llms-full.txt` exists.
- `components/button.html` and `components/button.md` exist; the `.md` contains ```` ```tsx ```` and `@wallarm-org/design-system/Button`, and contains neither `StoryPreview` nor `import(`.
- `components.json` parses with `components.length > 0`.
- `index.html` contains `dataset.theme`.
- `404.html` exists.
Prints `docs build OK` on success.

- [ ] **Step 1:** Implement.
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/docs check:build` after a build — expected: `docs build OK`. Delete `doc_build/llms.txt`, rerun — expected: exit 1 naming `llms.txt`. Rebuild.
- [ ] **Step 3: Commit** `test(docs): smoke-check build output`

---

### Task 10: CI — docs check on every push, release-dispatched deploy

**Files:**
- Create: `.github/workflows/deploy-site.yml`
- Modify: `.github/workflows/main.yml`, `packages/design-system/.storybook/main.ts:33`, `packages/design-system/src/components/Selection/SelectionBulkBar/SelectionBulkBar.e2e.ts:29-30`
- Modify docs: `CLAUDE.md` (pipeline list: item 3 no longer builds docs, item 8 becomes deploy via `deploy-site.yml`; "Deployment" line), `CI_PLAN.md` (§8 lines 133-140: trigger and URL `https://wallarm.github.io/design-system/`), `README.md:257`, `packages/design-system/README.md:9,117` + its "40+ components" line, `packages/mcp/README.md` (4 tools, key `@wallarm-org/mcp`, link to `https://wallarm.github.io/design-system/ai/mcp`), `.mcp.json` (remove dead `storybook-addon-mcp` entry, lines 15-21)

Changes:
- `main.yml` top-level `permissions`: add `actions: write` (release job dispatches a workflow; same mechanism as `commit-screenshots`, `main.yml:566`).
- `build` job: `pnpm build` → `pnpm build --filter='!@wallarm-org/docs'` (docs must not delay E2E).
- New `docs` job: `needs: [setup, build]`, same checkout/pnpm/node/cache/install steps as `build`, download `built-packages` artifact to `packages`, then `pnpm --filter @wallarm-org/docs build` and `pnpm --filter @wallarm-org/docs check:build`. Runs in parallel with `e2e`.
- `e2e` (≈ lines 281-304) and `e2e-update-screenshots` (≈ 416-443): serve dir `storybook-serve/design-system/storybook`, readiness URL `http://localhost:6006/design-system/storybook/iframe.html`, `STORYBOOK_URL: http://localhost:6006/design-system/storybook`.
- `release` job: after "Release design-system" (before "Check migrator release") add:
  ```yaml
  - name: Deploy site for stable release
    env:
      PRE_RELEASE_SHA: ${{ steps.pre-release.outputs.sha }}
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    run: |
      TAG=$(git tag --points-at HEAD | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' || true)
      if [ "${{ github.ref_name }}" = "main" ] && [ -n "$TAG" ] && [ "$(git rev-parse HEAD)" != "$PRE_RELEASE_SHA" ]; then
        gh workflow run deploy-site.yml --ref main -f tag="$TAG"
      else
        echo "No stable design-system release in this run; skipping site deploy"
      fi
  ```
- Remove the `deploy-storybook` job.
- `deploy-site.yml`: `on: workflow_dispatch: inputs: tag: { required: true, type: string }`; `concurrency: { group: pages, cancel-in-progress: false }` (a later push to main can't cancel a deploy); `permissions: { contents: read, pages: write, id-token: write }`; one job `deploy` with `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }`. Steps: checkout `ref: ${{ inputs.tag }}` with `fetch-depth: 0` (Task 13's "new" badges need tag history); pnpm (`10.33.2`) + node (`24`) setup; `pnpm install --frozen-lockfile`; `pnpm turbo run build --filter=@wallarm-org/docs...`; `pnpm --filter @wallarm-org/docs check:build`; `pnpm --filter @wallarm-org/design-system build-storybook`; assemble `site/` = `apps/docs/doc_build/*` + `site/storybook/` = `packages/design-system/storybook-static/*`; `actions/configure-pages@v4`; `actions/upload-pages-artifact@v3` (`path: ./site`); `actions/deploy-pages@v4` (`id: deployment`). Manual re-deploys use the same dispatch with any existing tag.
- `.storybook/main.ts:33`: `config.output.assetPrefix = '/design-system/storybook/';`
- `SelectionBulkBar.e2e.ts:29-30`: `https://wallarm.github.io/design-system/storybook/` and `STORYBOOK_URL=https://wallarm.github.io/design-system/storybook`.

- [ ] **Step 1:** Make the edits.
- [ ] **Step 2: Run** `npx --yes actionlint .github/workflows/main.yml .github/workflows/deploy-site.yml` (fallback: `npx --yes @action-validator/cli <file>` per file) — expected: no errors.
- [ ] **Step 3: Run** `pnpm --filter @wallarm-org/design-system build-storybook && rm -rf /private/tmp/sbserve && mkdir -p /private/tmp/sbserve/design-system/storybook && cp -r packages/design-system/storybook-static/* /private/tmp/sbserve/design-system/storybook/`, start `npx http-server /private/tmp/sbserve -p 6007` in the background, `curl -sf http://localhost:6007/design-system/storybook/iframe.html >/dev/null && echo OK` — expected: `OK`; stop the server.
- [ ] **Step 4: Run** `pnpm lint` and `pnpm --filter @wallarm-org/docs test:run` — expected: PASS.
- [ ] **Step 5: Commit** `ci: build docs on every push, deploy docs and Storybook after stable releases`
- [ ] **Step 6:** Push the branch. E2E is verified in CI only (project rule: never run e2e:docker locally). Expected: `build`, `docs` (incl. `check:build`), `e2e` green; the release step prints "skipping site deploy" (not main).

---

## Follow-ups (not in this plan)
- Fix empty CHANGELOG generation; backfill 0.72.3 → current; MCP changelog.
- Story cleanup: local helpers (29 files), `sb-annotation` (36 files) — more copyable examples.
- `subComponents` detection in `parse-props.ts` (Dialog, Tabs, Field, … report none) — affects Props sub-tables.
- Hand-written per-component prose (SimpleCharts docs, Table design, Slider usage).
- RemoteShell nav items without `href`.
- Accessibility sections; PR previews; MCP Registry listing; sitemap/OG images.

---

### Task 11: Strip `sb-annotation` labels from shown code (user request, 2026-10-22)

Runs after Task 6, before Task 7.

**Files:**
- Modify: `packages/design-system/scripts/metadata/story-source.ts`
- Test: `packages/design-system/scripts/metadata/__tests__/story-source.test.ts`

**Interfaces:**
- `toCopyableCode(...)` (Task 1) additionally removes every JSX element (`JsxElement` or `JsxSelfClosingElement`) whose `className` attribute is a string literal (or a no-substitution template) whose whitespace-separated classes include `sb-annotation` or `sb-annotation-alt`. It removes the whole element, children included, and runs before the used-imports filter, so imports used only by annotations disappear. Annotations in a non-children position (e.g. the sole returned expression, `cond && <span className='sb-annotation'>…`) are left unchanged. A `className` built with `cn(...)` or another expression is left unchanged. After removal, lines that are left blank are dropped.

- [ ] **Step 1: Write failing tests:**
  - `strips annotation labels`: `<VStack><span className='sb-annotation'>Brand</span><HStack><Button>A</Button></HStack></VStack>` → output contains no `sb-annotation` and no `Brand`, and still contains `<HStack>`.
  - `strips alt annotations and keeps other classes`: `<span className="text-sm sb-annotation-alt">x</span>` is removed; `<span className='sb-annotations'>y</span>` is kept (the class token must match exactly).
  - `drops imports only used by annotations`: an annotation containing `<Text>` where `Text` appears nowhere else → no `Text` import line.
  - `leaves non-children annotations`: `() => <span className='sb-annotation'>only</span>` is unchanged.
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/design-system exec rstest run scripts/metadata` — expected: FAIL.
- [ ] **Step 3: Implement** with the ts-morph AST.
- [ ] **Step 4: Run** the same command — expected: PASS. Then `pnpm --filter @wallarm-org/design-system generate-metadata` and `jq '[.components[].examples[] | select(.code | test("sb-annotation"))] | length' packages/design-system/dist/metadata/components.json` — expected: `0`, or only non-children cases, listed in the report.
- [ ] **Step 5: Commit** `feat(metadata): omit storybook annotation labels from example code`

---

### Task 12: Interactive tokens table (user request, 2026-10-22)

Runs after Task 7.

**Files:**
- Create: `apps/docs/theme/components/TokenTable.tsx` (named + default export; registered in `markdown.globalComponents`)
- Modify: `apps/docs/scripts/render.ts` (`renderTokensPage`), `apps/docs/scripts/generate.ts` (write `docs/foundations/tokens.mdx` instead of `tokens.md`; update `apps/docs/.gitignore`), `apps/docs/rspress.config.ts`
- Test: `apps/docs/scripts/__tests__/render.test.ts`, `apps/docs/theme/components/__tests__/TokenTable.test.tsx`

**Interfaces:**
- `TokenTable({ tokens, children }: { tokens: { name: string; value: string }[]; children: ReactNode })`:
  - In SSG_MD it returns `<>{children}</>`. `children` is the Markdown table the generator emits, so `.md`/llms and search keep plain text.
  - Otherwise it renders a table with columns Token | Value | Preview. Token and Value each get a copy-to-clipboard affordance. Use the DS `Copyable` / click-to-copy component if its API fits (check `packages/design-system/src/components/Copyable/index.ts` and its stories), else DS `Button` + `navigator.clipboard.writeText`. Copy text: the name is copied as-is (`--color-bg-page-bg`), the value verbatim.
  - Preview shows a swatch only for color tokens: `isColorToken(name, value)` is true when `name` starts with `--color-` or `value` matches `/^(#|rgb|hsl|oklch|oklab|lab|lch|color-mix\()/i`. The swatch is a small bordered square with inline `style={{ background: `var(${name})` }}` (site code; it follows the active theme).
- `isColorToken(name: string, value: string): boolean` is exported from `TokenTable.tsx` for tests.
- `renderTokensPage(tokens)` now emits, per category, `## <name>`, the syntax note where applicable, then `<TokenTable tokens={<JSON.stringify(tokens)>}>` + a blank line + the existing Markdown table + a blank line + `</TokenTable>`. Token JSON must be MDX-safe: `JSON.stringify` output inside `{…}` is a valid JS expression, and `<`/`{` inside strings are fine within an expression, but escape U+2028/U+2029.

- [ ] **Step 1: Write failing tests:**
  - `isColorToken`: `('--color-bg-page-bg','#fff')` → true; `('--spacing-8','8px')` → false; `('--shadow-sm','0 1px 2px rgb(0 0 0 / 5%)')` → false (name isn't `--color-` and the value doesn't start with a color function); `('--x','oklch(0.7 0.1 200)')` → true.
  - `TokenTable renders only markdown in md output` (mock `@rspress/core/runtime`, `rs.stubEnv('SSG_MD','true')`) → only the children text.
  - `TokenTable renders swatch for color tokens`: rendering with `[{name:'--color-a', value:'#000'}, {name:'--spacing-8', value:'8px'}]` gives exactly one element with inline background `var(--color-a)`.
  - `renderTokensPage wraps tables in TokenTable`: the output contains `<TokenTable tokens={[` and still contains `| Token | Value |`.
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/docs test:run` — expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** tests — expected: PASS. Then `pnpm turbo run build --filter=@wallarm-org/docs...` — expected: success; `doc_build/foundations/tokens.md` contains `| Token | Value |` and no `TokenTable`.
- [ ] **Step 5: Manual check** in `preview` at `/design-system/foundations/tokens`: copying a name and a value works; color swatches change when dark mode is toggled.
- [ ] **Step 6: Commit** `feat(docs): copyable tokens with color swatches`

---

### Task 13: Sidebar order, collapsible component groups, auto "new" badges (user request, 2026-10-22)

Runs after Task 12.

**Files:**
- Modify: `apps/docs/docs/_meta.json` (order: get-started, ai, guides, foundations, components), `apps/docs/docs/_nav.json` (order: Get Started, AI, Guides, Foundations, Components, Storybook)
- Modify: `apps/docs/scripts/render.ts`, `apps/docs/scripts/generate.ts`
- Create: `apps/docs/scripts/newComponents.ts` (git IO)
- Test: `apps/docs/scripts/__tests__/render.test.ts`, `apps/docs/scripts/__tests__/newComponents.test.ts`
- Modify: `.github/workflows/deploy-site.yml` (if it already exists from Task 10; otherwise Task 10 must apply this): checkout with `fetch-depth: 0` and fetch tags, so badge computation has history

**Interfaces:**
- Sidebar (`renderComponentsMeta`): `"index"` first, then one collapsible group per category: `{ "type": "custom-link", "label": <category label>, "collapsible": true, "collapsed": false, "items": [{ "type": "custom-link", "label": <Name>, "link": "/components/<kebab>", "tag"?: "new" }] }`. Category order is unchanged. The generated `AI` category is labelled `AI Assistant` (in the sidebar and in `components/index.mdx`), so it no longer duplicates the top-level AI section. Check the actual Rspress 2.0.23 `_meta.json` schema (`@rspress/core/meta-json-schema.json`) for `custom-link` `items`/`collapsible`/`tag`. If nested `custom-link` items can't carry `tag`, use the closest supported shape and report it.
- `renderComponentsMeta(components, opts: { newComponents: Set<string> })`: items whose name is in the set get `"tag": "new"`.
- `newComponents.ts`:
  - `findNewComponents(componentNames: string[], opts: { repoRoot: string; windowDays: number }): Set<string>`:
    - the latest stable tag = the newest tag matching `^v\d+\.\d+\.\d+$` reachable from HEAD;
    - its date is the reference;
    - for each component, its first-introducing commit is `git log --diff-filter=A --format=%H -- packages/design-system/src/components/<Name>/index.ts`, last line;
    - its first stable release is the earliest tag (by creator date) matching the same pattern that contains that commit;
    - "new" when that release's date is ≥ reference − `windowDays`;
    - components not yet in any stable tag are not "new";
    - if git or tags are unavailable (shallow clone, no tags), return an empty set and print one warning line — never fail the build.
  - `isWithinWindow(releaseDate: Date, referenceDate: Date, windowDays: number): boolean` — the pure part, unit-tested.
- `generate.ts` calls `findNewComponents(names, { repoRoot, windowDays: 30 })`.

- [ ] **Step 1: Write failing tests:**
  - `isWithinWindow`: 29 days before the reference → true; exactly 30 → true; 31 → false; after the reference → true.
  - `renderComponentsMeta groups categories as collapsible links`: output contains `"collapsible": true`; the item for `Button` has `"link": "/components/button"`; a component in `newComponents` has `"tag": "new"`; others have no `tag`.
  - `labels the AI component category "AI Assistant"`.
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/docs test:run` — expected: FAIL. **Step 3:** implement. **Step 4:** run — PASS.
- [ ] **Step 5: Run** `pnpm turbo run build --filter=@wallarm-org/docs...` — expected: success, and the generator prints how many components were marked new. In `preview`:
  - the sidebar order is Get Started, AI, Guides, Foundations, Components;
  - categories are collapsible groups;
  - "new" badges appear on recent components (e.g. the AI Assistant ones from `feat(ai): add Wally AI assistant components`, if they fall in the window);
  - there is no duplicate "AI" header.
- [ ] **Step 6: Commit** `feat(docs): collapsible component groups with auto "new" badges`

---

### Task 14: Human-readable token section titles (user request, 2026-10-22)

Runs after Task 13.

**Files:** Modify `apps/docs/scripts/render.ts` (`renderTokensPage`). Test: `apps/docs/scripts/__tests__/render.test.ts`.

**Interfaces:** `titleCase(kebab: string): string` exported from `render.ts`. It splits on `-`, capitalizes the first letter of each word, and joins with a space: `colors-primary` → `Colors Primary`, `semantic-dark` → `Semantic Dark`, `shadow` → `Shadow`. `renderTokensPage` uses `## <titleCase(name)>`. The `syntax` read-only note check and the `TokenTable` data keep the raw name.

- [ ] **Step 1:** Write the failing tests `titleCase` (the three cases above) and `renderTokensPage uses title-case headings` (contains `## Colors Primary`, not `## colors-primary`), then run `pnpm --filter @wallarm-org/docs test:run`. Expected: FAIL.
- [ ] **Step 2:** Implement, then re-run. Expected: PASS. Run `pnpm turbo run build --filter=@wallarm-org/docs...`. Expected: success.
- [ ] **Step 3: Commit** `feat(docs): human-readable token section titles`

---

### Task 15: Navbar brand — Wallarm logo + "Design System" (user request, 2026-10-22)

Runs together with Task 14 (same dispatch, separate commit).

**Files:**
- Modify: `apps/docs/theme/index.tsx`. Override `Layout` from `@rspress/core/theme-original` and pass a `navTitle` slot.
- Create: `apps/docs/theme/NavBrand.tsx`.

**Interfaces:**
- `NavBrand()` renders a link to the site root (use `withBase('/')` from `@rspress/core/runtime`, or Rspress's own nav-title link markup if `navTitle` replaces the whole anchor). Inside the link: the DS `Logo` component from `@wallarm-org/design-system/Logo` (check its exported variants/props and its stories; use the full Wallarm wordmark if there is one, sized to the navbar height, about 20–24px) followed by the text `Design System` in DS typography.
- It must look right in light and dark mode. The DS `Logo` either follows `data-theme` itself, or exposes a variant you select from `useDark()`; check which.
- `Layout` stays the original with only `navTitle` added. Keep all other existing overrides (`Root`, `EditLink`).
- Rspress `title` stays `Wallarm Design System` (used for `<title>` and llms.txt).
- **Home hero (user request):** the hero title on `apps/docs/docs/index.mdx` uses the same brand: the DS `Logo` (larger, hero-sized) plus `Design System`, in place of the plain text "Wallarm Design System". Reuse `NavBrand` with a `size` prop (`'nav' | 'hero'`) rather than duplicating markup. Wire it through the Layout home slot that replaces or prepends the hero title (check the Layout/HomeHero props in `node_modules/@rspress/core/dist`, e.g. `beforeHero`, or a `HomeHero` override). Keep the hero tagline and actions from frontmatter.

- [ ] **Step 1:** Implement. If `navTitle` is not the right slot in Rspress 2.0.23, check the Layout props in `node_modules/@rspress/core/dist` and use the documented slot or prop that replaces the title.
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/docs typecheck` and `pnpm turbo run build --filter=@wallarm-org/docs...`. Expected: success.
- [ ] **Step 3: Manual check** in `preview`: the navbar and the home hero show the logo and "Design System", clicking it goes to `/design-system/`, and both themes look right. Take screenshots if the browser tools allow.
- [ ] **Step 4: Commit** `feat(docs): Wallarm logo in the navbar`

---

### Task 16: Local vs production link origins (user request, 2026-10-22)

Runs after Tasks 14+15.

**Files:**
- Modify: `apps/docs/rspress.config.ts`: `siteOrigin: process.env.DOCS_SITE_ORIGIN ?? 'https://wallarm.github.io'`.
- Modify: `apps/docs/package.json`: add `"preview:local": "DOCS_SITE_ORIGIN=http://localhost:4173 pnpm run build && rspress preview --port 4173"`. Use the cross-platform form the repo already uses for env vars if one exists; otherwise this POSIX form is fine (CI is Linux, devs are on macOS).
- Modify: the hand-written pages that link to static outputs. Grep `apps/docs/docs` for `https://wallarm.github.io/design-system/` links to `llms.txt`, `llms-full.txt`, `*.md`, `components.json`.
  - Clickable links become base-relative JSX anchors: `<a href="/design-system/llms.txt">llms.txt</a>`. The Rspress dead-link check only inspects Markdown links, so JSX anchors are allowed.
  - URLs inside code blocks and config snippets (meant to be pasted into an agent) stay absolute production URLs.
  - Links to other routes stay normal Markdown links.
- Modify: `apps/docs/scripts/render.ts`. Generated pages contain no static-file links today; if any exist, apply the same rule.
- Document `preview:local` in `apps/docs/docs/ai/llms.mdx` (one short "Check it locally" note) and in the Contributing/README if one exists for apps/docs.

- [ ] **Step 1:** Implement.
- [ ] **Step 2: Run** `pnpm --filter @wallarm-org/docs preview:local` (stop it after checking). Verify:
  - `curl -s http://localhost:4173/design-system/llms.txt | head` shows `http://localhost:4173/design-system/...` URLs;
  - `curl -sf http://localhost:4173/design-system/components/button.md` succeeds;
  - the AI → llms.txt page's links resolve locally.
- [ ] **Step 3: Run** the plain `pnpm turbo run build --filter=@wallarm-org/docs...`. Expected: success, and `doc_build/llms.txt` contains `https://wallarm.github.io/design-system/`. This is the production default; Task 9's check depends on it.
- [ ] **Step 4: Commit** `feat(docs): local preview with local link origins`

---

### Task 17: Heavy pages — lazy previews and `!autodocs` stories (user request, 2026-10-22)

Runs after Task 8. One dispatch, two commits.

**Part A — lazy previews (site).**
- Modify: `apps/docs/theme/components/StoryPreview.tsx`, `apps/docs/theme/components/Explorer.tsx`. Create `apps/docs/theme/components/useInView.ts`.
- `useInView(ref: RefObject<Element | null>, rootMargin = '600px'): boolean`:
  - one `IntersectionObserver`;
  - returns `true` once the element first intersects, then stays `true` (no unmount when scrolled away — simplest; it avoids remounting stories and losing their state);
  - disconnects after the first hit and on unmount;
  - if `IntersectionObserver` is missing, returns `true`.
- `Live` (StoryPreview) and the Explorer preview call `load()` and mount the story only after `useInView` is true. Before that they render the existing Skeleton placeholder at a fixed min height (200px), so scroll position stays stable. `useStory` must not start loading before then: pass the load gate into it, or render the `useStory` consumer only when in view.
- Tests (jsdom, mock `IntersectionObserver`):
  - `does not load the story until in view` — `load` not called before the observer callback fires with `isIntersecting: true`, called once after;
  - `useInView falls back to true without IntersectionObserver`.

**Part B — `!autodocs` stories render as code + Storybook link.**
- Modify:
  - `packages/mcp-core/src/schema.ts` — `exampleMetadataSchema` gets `tags: z.array(z.string()).optional()`;
  - `packages/design-system/scripts/metadata/parse-examples.ts` / `story-source.ts` — read story-level tags from `Story.tags = [...]` assignments and object-literal `tags` on StoryObj; string literals only;
  - `apps/docs/scripts/render.ts`.
- `renderComponentPage`: an example whose `tags` include `!autodocs` renders its description, then the fenced code block (no `StoryPreview`, no `load`), then `[Open in Storybook](https://wallarm.github.io/design-system/storybook/?path=/story/<toStoryId(storyTitle)>--<kebab(exportName)>)` (e.g. `InfiniteScrollWindow` → `infinite-scroll-window`). If the first example is `!autodocs`, the page preview uses the first example that isn't; if none qualifies, there is no top preview. The Explorer likewise uses the first non-`!autodocs` example.
- Modify: `packages/design-system/src/components/Table/Table.stories.tsx`. Add `X.tags = ['!autodocs'];` to every story that uses `virtualized='window'`, infinite or bidirectional infinite scroll (`InfiniteScroll*`, `BidirectionalInfiniteScroll*`), or large virtualized data (`Virtualization`, `ScrollToRow`, `FullFeatured`, `RowReorderingVirtualized`, `StickyGroupParentVirtualized`). Find them by grep and list the final set in the report. Storybook then drops them from the Table Overview page; they stay as individual stories in the sidebar. E2E tests use story IDs and are unaffected; confirm that no `*.e2e.ts` targets the docs page.
- Tests:
  - metadata: `reads story-level tags` (fixture `export const A = () => <div/>; A.tags = ['!autodocs'];` → `tags: ['!autodocs']`);
  - render: `renders !autodocs examples as code with a Storybook link` (no `<StoryPreview` for that example; link ends `--infinite-scroll-window)`);
  - `skips !autodocs for the top preview and explorer`.

- [ ] **Step 1:** Part A with TDD; run `pnpm --filter @wallarm-org/docs test:run` (RED → GREEN). Commit `perf(docs): mount story previews when they scroll into view`.
- [ ] **Step 2:** Part B with TDD; run `pnpm --filter @wallarm-org/design-system exec rstest run scripts/metadata`, `pnpm --filter @wallarm-org/mcp test:run` and docs `test:run` (RED → GREEN); `generate-metadata`; `pnpm --filter @wallarm-org/design-system build-storybook` (expected: success).
- [ ] **Step 3: Run** `pnpm turbo run build --filter=@wallarm-org/docs...`, then in `preview` open `/design-system/components/table`. Expected: the page scrolls smoothly top to bottom with no hang. Measure with the Playwright MCP — e.g. time to load plus scroll to bottom, and the long-task count via `PerformanceObserver` — before (on the previous commit, if practical) and after, and report the numbers. `!autodocs` examples show code + an "Open in Storybook" link.
- [ ] **Step 4: Commit** `perf(table): keep heavy stories off the docs pages`.
