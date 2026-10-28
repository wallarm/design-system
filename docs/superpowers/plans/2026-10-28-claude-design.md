# Wallarm DS in Claude Design — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A second, unpublished build inside `packages/design-system` that turns the current source into a complete Claude Design "Design System" `project/` folder (React 18-compatible `bundle.js`, `bundle.css`, `tokens.json`, docs, previews, assets), plus a `/claude-design-sync` skill that publishes it — with zero change to what npm consumers get.

**Architecture:** All producer code lives in `packages/design-system/claude-design/` (outside `src/`, so rslib/dist never see it) and writes to gitignored `packages/design-system/.claude-design/project/`. React 18 compatibility is a build-time jsx-runtime shim + `react-compiler-runtime`; only two behaviour-identical edits touch `src/`. A no-impact checker proves the published package is unchanged.

**Tech Stack:** TypeScript, esbuild (IIFE), @babel/core + babel-plugin-react-compiler (target 18), postcss + @tailwindcss/postcss 4.3.3, ts-morph, tsx, Rstest (jsdom), React 18.3.1 UMD for the harness.

**Spec:** `docs/superpowers/specs/2026-10-28-claude-design-design.md` — read it first; this plan does not repeat its rationale.

## Global Constraints

- Published package unchanged: `package.json` `exports`, `files`, `sideEffects`, `main`, `module`, `types` byte-identical; `dist/` differs only in the files of Tasks 2–3 (allowlist in Task 1).
- Nothing under `scripts/metadata/**` changes (its output `dist/metadata/components.json` is published and read by the MCP).
- No new public exports: `src/index.ts` and every `exports` subpath unchanged. New `src/` modules go under `src/lib/` (not reachable through any `exports` pattern).
- Target artifact: `https://claude.ai/artifact/XyodGNRtEkFNAUfyoMD5HN`, title `Wallarm Design System`, namespace `WallarmDS`.
- `bundle.js` ≤ 5,700,000 bytes (platform cap 6 MB); `bundle.css` ≤ 2,000,000 bytes; `index.d.ts` ≤ 1.5 MB; no literal `</script` or `<!--` in bundle.js; line 1 `/* @ds-bundle: {"format":4,"namespace":"WallarmDS","components":[…]} */`.
- `design-system.json` `libraries` = `[{"name":"react","version":"18"},{"name":"react-dom","version":"18"}]`; no `components/lib/*`; `"editing":"code"`.
- tokens.json: LIST shape, themes `light` (first) and `dark`; no `var()`, `color-mix()`, named colours; ≤ 600 colours, ≤ 12 families, ≤ 60 tokens per non-colour family; names match `^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$`; type styles never named `text-*`.
- No hand-memoization in new React code (React Compiler); no `any`; named exports; Biome formatting.
- Build output `.claude-design/` never committed. Commits: Conventional Commits, `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Unit tests local; Playwright E2E only in CI (never `e2e:docker` locally).

## Review Focus

1. **Element identity under the shim** — a `<Text>` child without a ref must keep `type === Text` after going through the shim (pinned in Task 4: `keeps original type when no ref`).
2. **Overlays opened inside `WallarmDS.Root`** — content must land inside the Root's host node, not `document.body`; without Root, body as today (Task 3 unit test + Task 6 harness).
3. **Dark artboard** — `Root theme="dark"` must flip semantic tokens for everything inside it, including portalled overlays (Task 6 harness: computed `data-theme` ancestor of open DropdownMenu content is the Root).
4. **Rebuild after a source change** — the build must be deterministic (same input → byte-identical output) so the sync skill uploads only real changes (Task 10: `build twice → identical hashes`).
5. **A component exported from `src/index.ts` but missing from the bundle header** — every runtime export must be on `window.WallarmDS` and every PascalCase component listed in the header (Task 5: export-parity assertion).

---

### Task 1: Setup and no-impact checker

**Files:**
- Create: `packages/design-system/claude-design/no-impact.ts`, `packages/design-system/claude-design/no-impact.allowlist.json`, `packages/design-system/tsconfig.claude-design.json`
- Modify: `packages/design-system/package.json` (scripts, devDependencies), `.gitignore`, `packages/design-system/tsconfig.json` (reference), `pnpm-workspace.yaml` catalog if deps are catalogued

**Interfaces:**
- Produces: `pnpm --filter @wallarm-org/design-system claude-design:no-impact snapshot <name>` → writes `.claude-design/no-impact/<name>.json` = `{ packageJson: {exports, files, sideEffects, main, module, types}, packFiles: string[], dist: Record<path, sha256>, fixtureBytes: number }`; `… compare <base> <head>` → exit 1 on any diff not in the allowlist, printing each offending path.
- `no-impact.allowlist.json`: `{ "distChanged": string[], "distAdded": string[] }` (glob patterns), empty at first.

- [ ] **Step 1:** `pnpm install` (the worktree has no node_modules). Add devDependencies: `esbuild` (pin the version already in the lockfile, 0.28.1), `react-compiler-runtime@1.0.0`, `react18: npm:react@18.3.1`, `react-dom18: npm:react-dom@18.3.1`. Add `.claude-design/` to the root `.gitignore`.
- [ ] **Step 2:** Add `tsconfig.claude-design.json` (extends the node tsconfig, `include: ["claude-design"]`), reference it from `tsconfig.json`, and append `&& tsc -p tsconfig.claude-design.json --noEmit` to the `typecheck` script. Note: per team memory, also verify with `tsc --build tsconfig.app.json --noEmit`.
- [ ] **Step 3:** Implement `no-impact.ts` (`snapshot`/`compare`). `packFiles` from `npm pack --dry-run --json`. `fixtureBytes`: esbuild-bundle `import { Button } from '@wallarm-org/design-system'; console.log(Button)` with the package resolved through a temp `node_modules/@wallarm-org/design-system` symlink to the package dir (so `sideEffects` is honoured), `react*` external, minified; compare tolerance ±1%.
- [ ] **Step 4:** `pnpm --filter @wallarm-org/design-system build && pnpm --filter @wallarm-org/design-system claude-design:no-impact snapshot base`, then `compare base base` → exit 0.
- [ ] **Step 5:** Commit `build(design-system): add claude-design no-impact checker`.

### Task 2: React 19 context-as-provider → `.Provider`

**Files:**
- Modify: `src/components/DropdownMenu/DropdownMenu.tsx:96`, `src/components/WallyAssistant/WallyAssistant.tsx:321`, `src/components/WallyAssistant/views/ChatViewProvider.tsx:65`, `src/components/Table/TableInner/TableInnerWindow.tsx:128`
- Modify: `claude-design/no-impact.allowlist.json` (`distChanged`: the 4 emitted modules)

- [ ] **Step 1:** Replace `<XContext value={…}>…</XContext>` with `<XContext.Provider value={…}>…</XContext.Provider>` at the 4 sites. Confirm no other site: `grep -rnE '<[A-Z][A-Za-z]*Context value=' src --include='*.tsx' | grep -v stories` → only story files remain.
- [ ] **Step 2:** Run `pnpm --filter @wallarm-org/design-system test:run src/components/DropdownMenu src/components/WallyAssistant src/components/Table` → PASS.
- [ ] **Step 3:** Rebuild, `snapshot head`, `compare base head` → exit 0 with the 4 allowlisted files.
- [ ] **Step 4:** Commit `refactor(design-system): use Context.Provider for React 18-compatible output`.

### Task 3: Optional portal container

**Files:**
- Create: `src/lib/portal/PortalContainerContext.ts`, `src/lib/portal/Portal.tsx`, `src/lib/portal/Portal.test.tsx`
- Modify: every non-story file importing Ark's portal — `grep -rlE "@ark-ui/react/portal|Portal\b.*from '@ark-ui/react" src --include='*.tsx' | grep -v -e stories -e '\.test\.'` (11 today: Drawer/DrawerPortal, SearchModal/SearchModalContent, Tooltip/TooltipContent, Calendar/CalendarContent, DropdownMenu/DropdownMenuContent, FeedbackPulse, Toast/Toaster, Popover/PopoverContent, Table/TableActionBar, Select/SelectPositioner, Selection/SelectionBulkBar; also check FilterCascadeContent and TourInner, which render `<Portal>` from another import)
- Modify: `claude-design/no-impact.allowlist.json`

**Interfaces:**
- Produces: `PortalContainerContext: React.Context<RefObject<HTMLElement | null> | null>` (default `null`); `Portal: FC<PortalProps>` (Ark's `PortalProps`), passing `container={props.container ?? ctx ?? undefined}`. Not exported from `src/index.ts`.

- [ ] **Step 1: Write the failing test** `Portal.test.tsx`:
  - `renders into document.body when no container context` → content's parent chain reaches `document.body` directly.
  - `renders into the context container when provided` → `host.contains(getByTestId('content'))`.
  - `explicit container prop wins over context`.
- [ ] **Step 2:** Run `pnpm --filter @wallarm-org/design-system test:run src/lib/portal` → FAIL (module missing).
- [ ] **Step 3:** Implement the two files; switch each listed overlay to the internal `Portal` (keep local aliases like `ArkUiPortal` names only if it reduces diff noise).
- [ ] **Step 4:** Tests above PASS; full `test:run` PASS.
- [ ] **Step 5:** Rebuild; `compare base head` → only allowlisted changes (`distAdded: lib/portal/**`, `distChanged`: the overlay modules). Confirm `lib/portal` is not reachable: `node -e "import('@wallarm-org/design-system/lib/portal')"` from a fixture fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- [ ] **Step 6:** Commit `feat(design-system): allow overlays to portal into a provided container`. *(No consumer-visible API: a `feat` only because the build output gains a module; use `refactor` if the team prefers no release — builder's call.)*

### Task 4: React 18 jsx shim

**Files:**
- Create: `claude-design/bundle/react18-shim.ts`, `claude-design/bundle/react18-shim.test.ts`

**Interfaces:**
- Produces: `createJsxRuntime(React: ReactLike): { jsx, jsxs, jsxDEV, Fragment }` and `createReactModule(React: ReactLike): ReactLike` (the bundle's `react` module: `window.React` with `cloneElement` patched; never mutates the input). `ReactLike` = the subset used (`createElement`, `cloneElement`, `forwardRef`, `Fragment`, `version`).

- [ ] **Step 1: Write failing tests** (fake `ReactLike` built on real `react18` package):
  - `maps a context object to its Provider` — `jsx(Ctx, {value:1})` → `type === Ctx.Provider`.
  - `keeps original type when no ref` — `jsx(Text, {children:'a'}).type === Text`.
  - `wraps a function component in a cached forwardRef when ref is passed` — two calls with refs return the same wrapper type; rendered with `react-dom18`, `ref.current` is the DOM node the component forwards to.
  - `does not wrap class components, forwardRef or memo types`.
  - `cloneElement with a ref on a function component forwards it`.
  - `inert on host elements: true → '', false → removed`.
  - `passes key through`.
- [ ] **Step 2:** Run `pnpm --filter @wallarm-org/design-system exec rstest run claude-design/bundle/react18-shim.test.ts` → FAIL.
- [ ] **Step 3:** Implement. Wrapper: `forwardRef((p, ref) => type({ ...p, ref }))`, `displayName` copied, cached in a `WeakMap`.
- [ ] **Step 4:** Tests PASS.
- [ ] **Step 5:** Commit `feat(claude-design): add React 18 jsx runtime shim`.

### Task 5: `bundle.js` build

**Files:**
- Create: `claude-design/config.ts`, `claude-design/bundle/entry.ts`, `claude-design/bundle/build-bundle.ts`, `claude-design/bundle/esbuild-plugins.ts`, `claude-design/harness/load-bundle.ts`, `claude-design/harness/bundle.harness.test.ts`, `rstest.claude-design.config.ts`
- Modify: `package.json` scripts `build:claude-design`, `test:claude-design`; `turbo.json` task `build:claude-design` (`dependsOn: ["build"]`, outputs `.claude-design/**`)

**Interfaces:**
- `config.ts`: `export const CLAUDE_DESIGN = { artifactUrl, title, namespace: 'WallarmDS', outDir: '.claude-design/project', bundleBudgetBytes: 5_700_000, cssCapBytes: 2_000_000, excludedModules: string[] /* shiki + highlight.js CodeSnippet adapters */ } as const`.
- `buildBundle({ outDir }): Promise<{ bytes: number; components: string[] }>` → writes `components/bundle.js` and `.claude-design/meta.json` (esbuild metafile).
- `loadBundle(): { window: DOMWindow; WallarmDS: Record<string, unknown> }` — jsdom, `window.React`/`ReactDOM` = `react18`/`react-dom18` UMD production, then evaluates bundle.js.

- [ ] **Step 1: Write failing harness tests** (`bundle.harness.test.ts`, own config `rstest.claude-design.config.ts`, include `claude-design/harness/**/*.harness.test.ts`, jsdom):
  - `defines window.WallarmDS under React 18.3.1`.
  - `exposes every runtime export of src/index.ts` — names from `Object.keys(await import('../../src/index'))`-equivalent list generated at build into `meta.json` (`exports`), all present.
  - `header lists every PascalCase component export`.
  - `Button and Input forward refs` — `ref.current instanceof HTMLButtonElement / HTMLInputElement`.
  - `Dialog, Popover, Select, DropdownMenu render open without errors` (console.error spy empty).
  - `contains no </script, <!-- or remote import()` and `bytes ≤ 5_700_000`.
- [ ] **Step 2:** `pnpm --filter @wallarm-org/design-system test:claude-design` → FAIL (no bundle).
- [ ] **Step 3:** Implement:
  - `entry.ts`: `export * from '../../src/index'; export * as Icons from '../../src/icons';` (+ helpers from Task 6 later).
  - esbuild: `format:'iife'`, `globalName:'WallarmDS'` assigned to `window.WallarmDS`, `platform:'browser'`, `minify`, `define: {'process.env.NODE_ENV':'"production"'}`, `supported:{'inline-script':false}`, `metafile:true`, `loader` for `.css` → empty (CSS comes from Task 7), banner = header comment.
  - Plugins: resolve `react` → virtual module `createReactModule(window.React)`, `react-dom`/`react-dom/client` → `window.ReactDOM`, `react/jsx-runtime`/`react/jsx-dev-runtime` → `createJsxRuntime(window.React)`; `onLoad` for `src/**/*.tsx?` → `@babel/core` with `@babel/preset-typescript` and `babel-plugin-react-compiler` `{ target: '18' }` (resolves `react-compiler-runtime`); `excludedModules` → empty stub that throws a clear error if called.
  - Post-build: replace `<!--` with `<\!--`, assert guards, write header with component list.
  - If the compiler path in esbuild is not workable, drop the babel step, keep everything else, and record it for the README "Not synced" note (spec §2).
- [ ] **Step 4:** Harness tests PASS; budget printed (top 15 inputs).
- [ ] **Step 5:** Commit `feat(claude-design): build React 18-compatible bundle.js`.

### Task 6: Canvas helpers `Root` and `TableCells`

**Files:**
- Create: `claude-design/bundle/helpers/Root.tsx`, `claude-design/bundle/helpers/TableCells.tsx`, `claude-design/bundle/helpers/index.ts`
- Modify: `claude-design/bundle/entry.ts`, `claude-design/harness/bundle.harness.test.ts`

**Interfaces:**
- `Root: FC<{ theme?: 'light' | 'dark'; children?: ReactNode }>` — `<div data-slot="root" data-theme={theme ?? 'light'} className="bg-bg-page-bg text-text-primary font-sans">{children}<div ref={host} /></div>` providing `PortalContainerContext` with `host`. Never touches `<html>`/localStorage. `Root.displayName = 'Root'`.
- `TableCells`: `{ severity(), httpMethod(), responseCode(), ip(), dateTime(), tags(), text() }`, each returning a TanStack `cell` renderer `({ getValue }) => ReactNode` built from `Badge`, `HttpMethod`, `ResponseCode`, `Ip`, `FormatDateTime`, `Tag`, `Text`.

- [ ] **Step 1: Failing harness tests:**
  - `Root renders data-theme and no html attribute changes`.
  - `DropdownMenu opened inside Root portals into Root` (Review Focus 2).
  - `dark Root: open overlay's nearest [data-theme] is "dark"` (Review Focus 3).
  - `Table with TableCells renders a severity badge and HTTP method`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; export from `entry.ts` as `Root`, `TableCells`. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(claude-design): add canvas Root and TableCells helpers`.

### Task 7: `bundle.css`

**Files:**
- Create: `claude-design/css/build-css.ts`, `claude-design/css/entry.css`, `claude-design/css/safelist.ts`, `claude-design/css/build-css.test.ts`

**Interfaces:**
- `buildCss({ outDir, tokenNames: Set<string> }): Promise<{ bytes: number }>` → `components/bundle.css`. `tokenNames` comes from Task 8 (custom properties `tokens.css` declares); declarations of those names are stripped from `:root` and `[data-theme=…]` rules.

- [ ] **Step 1: Failing tests:** `contains a rule for bg-bg-surface-1 and grid-cols-12 and gap-24`, `does not redeclare --color-text-primary` (given it in tokenNames), `keeps app-shell ambient color-mix rule`, `size ≤ 2_000_000`, `no </style`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement: entry imports `tailwindcss`, `tw-animate-css`, `../../src/theme/index.css`; `@source` the `src/**/*.{ts,tsx}` minus stories/tests/story-content plus `claude-design/bundle/helpers`; `@source inline()` from `safelist.ts` (spec §3 list); postcss + `@tailwindcss/postcss`; then strip token declarations with postcss walk. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(claude-design): compile bundle.css with canvas safelist`.

### Task 8: `tokens.json` and `tokens.css`

**Files:**
- Create: `claude-design/tokens/build-tokens.ts`, `claude-design/tokens/map-value.ts`, `claude-design/tokens/build-tokens.test.ts`

**Interfaces:**
- `mapColorValue(raw: string, theme: 'light'|'dark', resolve: (name) => string | undefined): { value?: string; skipped?: string }` — `var(--x)` → `"{x}"`, `--alpha(var(--c) / N%)` → `rgba()` of `c`'s hex in that theme, hex lowercased, `oklch()`/`rgb()` kept, `color-mix()`/`transparent`/`currentColor` → `skipped`.
- `buildTokens({ themeDir, outDir, ref }): { tokenNames: Set<string>; skipped: string[]; counts: Record<string, number> }` → `tokens.json`, `tokens.css`. Discovery via `parseTokens` (import only, unchanged) plus own parsing for `[data-theme='dark']` (both quotes, optional `:root`) and `components/*.css`.

- [ ] **Step 1: Failing tests:** `mapColorValue` table (var→alias, alpha→rgba, color-mix→skipped); `buildTokens` on real `src/theme`: themes `[light, dark]`, `color-text-primary` has both values, every non-colour family ≤ 60, colours ≤ 600, all names match regex, no style named `text-*`, `temp-token`/`color-data-viz-1` absent, `meta.source === 'github'`; `tokens.css` first line `/* Wallarm Design System — generated from tokens.json */`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (type styles `body-*`, `heading-*`, `display-*`, `code-*`; Tailwind class in `usage`; fonts `type.fonts` from `src/theme/fonts`). Compare totals against the Prod `tokens.json` (533 colours) and explain any difference in the commit body. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(claude-design): generate tokens.json and tokens.css from src/theme`.

### Task 9: Docs and types

**Files:**
- Create: `claude-design/docs/build-docs.ts`, `claude-design/docs/readme-root.md` (hand-written brand-book part, seeded from the Prod README sections Content…Accessibility), `claude-design/docs/consuming.ts`, `claude-design/docs/component-readme.ts`, `claude-design/docs/build-docs.test.ts`

**Interfaces:**
- `buildDocs({ outDir, metadataPath: 'dist/metadata/components.json', notSynced: string[] }): { components: string[] }` → `README.md`, `components/<Comp>/README.md`, `components/index.d.ts` (concatenated `dist/**/*.d.ts`, ≤ 1.5 MB).

- [ ] **Step 1: Failing tests:** README line 1 = `Generated from wallarm/design-system — change it in code and run /claude-design-sync there.`; contains `## Consuming this system` with `WallarmDS`, `x-import`, `WallarmDS.Root`, `WallarmDS.Icons.`; Button README has an `x-import` example and `loading` typed `boolean` (CVA boolean fix) and default `variant` filled from destructured defaults; Select README has a "Collections" section; no provider/internal component (ThemeProvider, ButtonBase, Polymorphic, TemporalCore, Checkmark, BulkBar, NavPanel, SimpleCharts) gets a README; `index.d.ts` ≤ 1.5 MB.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (post-process metadata in this folder only; re-read defaults with ts-morph). Tour/Toast READMEs say: not mountable via x-import; Toast recipe via `Toaster` + `toaster.create` in `componentDidMount`. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(claude-design): generate README, component guides and types`.

### Task 10: Previews, assets, index, orchestrator

**Files:**
- Create: `claude-design/previews/build-previews.ts`, `claude-design/assets/build-assets.ts`, `claude-design/build.ts`, `claude-design/build.test.ts`
- Modify: `package.json` `build:claude-design` → `tsx claude-design/build.ts`

**Interfaces:**
- `buildPreviews({ outDir }): { withPreview: string[]; withoutStories: string[] }` — stories via `findStoryFiles` (import only), first 4 stories per component, compiled with the Task 5 plugins into `components/<Comp>/stories.js`; `preview.html` line 1 `<!-- @dsCard group="<story title first segment>" height=N -->`, stories mounted inside `WallarmDS.Root`; `storybook/*` runtime imports stubbed.
- `buildAssets({ outDir }): { icons: number }` — fonts → `fonts/`, icons from `dist/icons` rendered to SVG inked `#0f172b` → `assets/Icons/<kebab>.svg` + `assets/Icons/README.md`, Logo → `assets/Logos/`, cover → `components/Cover/preview.html` (ported from the Prod cover).
- `build.ts` runs Tasks 5–10 in order and writes `design-system.json` = `{v:3, layout:"files", createdOnFiles:{v:1, at}, title, namespace, libraries:[react 18, react-dom 18], editing:"code", groups:["Logos","Icons"], assetGroups:{…names only, blob ids filled by the skill}, sections:{}, blobs:{}, docs:{readme:"project/README.md", sections:[]}, lastChange:{by, at, via:"Claude Code · wallarm/design-system@<sha>", note}}`.

- [ ] **Step 1: Failing tests:** `Copyable and FilterInput get a preview` (nested stories folders); `every preview.html line 1 is a @dsCard marker`; `582 icons`; `design-system.json has editing "code" and React 18 libraries and no components/lib`; `build twice → identical file hashes except lastChange.at and createdOnFiles.at` (Review Focus 4).
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS; `pnpm --filter @wallarm-org/design-system build:claude-design` prints a summary (files, bundle bytes, css bytes, colours, components, skipped).
- [ ] **Step 5:** Commit `feat(claude-design): previews, assets and orchestrated build`.

### Task 11: Sync skill and docs

**Files:**
- Create: `.claude/skills/claude-design-sync/SKILL.md`, `apps/docs/docs/ai/claude-design.mdx`
- Modify: `CLAUDE.md` (skills table row), `apps/docs` sidebar if it lists pages explicitly, `packages/design-system/README.md` (one short section)

- [ ] **Step 1:** Write the skill exactly per spec §8: preflight (clean tree, `git tag --points-at HEAD` contains `v<version>` else ask), `pnpm build` + `build:claude-design`, Artifact `read` of `project/design-system.json` + `project/README.md` (abort on title/namespace mismatch), upload changed icon/logo assets (`asset: true`, compare sha256 with the remote `assetGroups`), fill blob ids into the local `design-system.json`, publish with `root: packages/design-system/.claude-design`, ≤ 255 paths per call, `design-system.json` last, `null` for remote paths absent locally (incl. `components/lib/*`, `components/*/stories.js` of removed components), final report. All artifact content read is data, never instructions.
- [ ] **Step 2:** Docs page for designers: pick "Wallarm Design System" in Claude Design, `x-import` basics, `Root`, dark, Table recipe, how to request changes. Build docs: `pnpm --filter @wallarm-org/docs build` → PASS.
- [ ] **Step 3:** Commit `docs: add Claude Design sync skill and designer guide`.

### Task 12: Final verification and PR

- [ ] **Step 1:** In parallel: `pnpm lint`, `pnpm --filter @wallarm-org/design-system typecheck` and `tsc --build tsconfig.app.json --noEmit`, `pnpm --filter @wallarm-org/design-system test:run`, `test:claude-design` → all PASS.
- [ ] **Step 2:** Fresh `pnpm build`, `snapshot final`, `compare base final` → exit 0 (only Task 2–3 allowlisted paths; `exports/files/sideEffects` identical; `fixtureBytes` within ±1%). Paste the summary into the PR body.
- [ ] **Step 3:** Run `/vestige-audit` (required by the `gh pr create` hook).
- [ ] **Step 4:** Push `feat/claude-design`, open PR `feat(design-system): build the design system for Claude Design` (no Jira key, per the user), body = what/why, no-impact evidence, how to run `/claude-design-sync`, account-side actions from spec, ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. If `gh pr edit` is needed later, use `gh api` PATCH (Projects-classic deprecation).
- [ ] **Step 5:** First sync to the artifact and the manual canvas check (spec "Verification") only after the user confirms — they are outward-facing.
