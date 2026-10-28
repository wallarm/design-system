# Wallarm DS in Claude Design — design

Status: draft for approval · 2026-10-28 · branch `feat/claude-design`

## Intent

Anyone in the organization opens Claude Design (a "Design" canvas on claude.ai) and gets
prototypes built from the **real** `@wallarm-org/design-system`: every component and every
token (light + dark), the Geist fonts and the 582 icons, not hand-drawn copies of them.

The hard constraint (the user's): **existing consumers notice nothing.** The published npm
package keeps the same `dist/`, `exports`, `sideEffects`, entry points, size and tree-shaking
behaviour. Everything for Claude Design lives inside the same package
(`packages/design-system`, no new workspace package), as a second build whose output is never
committed and never published.

## How Claude Design consumes a system (platform facts)

- A design system is an Artifact of type "Design System" on claude.ai. Its files live under
  `project/`: `design-system.json` (index), `tokens.json`, `README.md`, `components/bundle.js`,
  `components/bundle.css`, `components/index.d.ts`, `components/<Comp>/{README.md,preview.html}`,
  `components/Cover/preview.html`, `fonts/*`, `assets/<Group>/*` (uploads named in the index).
  The exact contract is the type's `artifact-type/reference/format.md`, `from-code.md`,
  `craft.md`, `cover.md` (readable from any Design System artifact with the Artifact tool).
- `bundle.js` = ONE classic IIFE script that reads `window.React` / `window.ReactDOM` and assigns
  `window.<Namespace>`; no `import`, no network, no literal `</script` or `<!--`; ≤ 6 MB.
  `bundle.css` ≤ 2 MB. Line 1 header `/* @ds-bundle: {"format":4,"namespace":"WallarmDS","components":[…]} */`.
- A Design canvas copies the system's files into itself and mounts components with
  `<x-import component-from-global-scope="WallarmDS.Button" variant="primary">Save</x-import>`
  (attributes are props, `{{holes}}` pass non-string values from a classic-JS `renderVals()`,
  nested `x-import` are children). **The canvas supplies React 18 and ignores any React the
  system ships.**
- There is no known API/token for CI to publish an artifact. Publishing is done from Claude
  Code with the Artifact tool. **Decided: sync is manual for now**, run by a person after a release.

## Current state

- Target artifact: "Wallarm Design System Prod", https://claude.ai/artifact/XyodGNRtEkFNAUfyoMD5HN,
  namespace `WallarmDS`. It was produced once by an agent from `main@1178cbc` (v4.3.3); nothing that
  produced it is in the repo.
- Its `bundle.js` reads `window.React.__jsx` / `window.React.__compiler`, which only its private
  React 19 copy (`components/lib/react.js`) defines. Under the canvas's React 18 the bundle throws
  `(0, Yi.jsx) is not a function` at load and `window.WallarmDS` is never set (reproduced in a
  node/jsdom harness with React 18.3.1 UMD).
- Gap analysis (54 agents, adversarially verified) is the evidence base for this document; its
  findings are folded in below.

## Goals

1. `pnpm --filter @wallarm-org/design-system build:claude-design` produces a complete
   `project/` folder for the Design System artifact from the current source, deterministically.
2. On a Design canvas (React 18) every exported component mounts, refs work, context works,
   overlays render inside the artboard.
3. Tokens: every colour (light + dark), type, spacing, radius, shadow, etc. from `src/theme`, in
   the platform's `tokens.json` LIST format; fonts as files; icons as assets.
4. Each component gets a README (props as an agent should write them as `x-import` attributes,
   examples in `x-import` form) and a live preview built from its Storybook stories.
5. A repo skill `/claude-design-sync` builds and publishes to the target artifact, incrementally.

## Non-goals

- No changes to `scripts/metadata/**` output (`dist/metadata/components.json` is published and read by the MCP).
- No CI auto-publish (no auth path exists). A CI job may later just *build* to catch breakage.
- No changes to how product apps consume the package; no new public exports in `src/index.ts`.
- No React 18 support for the npm package itself (peer stays React 19). React 18 compatibility
  exists only inside the Claude Design bundle.
- The marketing/brand system ("FY26 Wallarm Design System") is out of scope for the build; only
  account-side recommendations below.

## Anti-goals (failure even if it "works")

- Any diff in the published tarball: new files in `dist/`, changed `exports`/`sideEffects`/`files`,
  changed emitted JS of existing modules beyond the behaviour-identical source edits listed below.
- Canvas helpers leaking into `src/index.ts` or any `exports` subpath.
- A React 18 shim that changes `element.type` for elements that carry no `ref` (breaks
  `child.type === X` checks, e.g. `utils/hasNonTextEnd.ts:9`, `FilterCascadeTrigger.tsx:62`).
- Committed build output (`bundle.js` etc.) in git.
- Hand-maintained copies of tokens or component docs that drift from source.

## Design

### 1. Where things live (all inside `packages/design-system`)

```
packages/design-system/
  claude-design/                 # NOT under src/ → never in rslib's entry glob, never in dist/
    build.ts                     # orchestrator: pnpm build:claude-design
    bundle/                      # IIFE build + React 18 shim + canvas-only entry
      entry.ts                   # re-exports src/index.ts + Icons + canvas helpers
      react18-shim.ts            # jsx runtime over window.React.createElement
      helpers/                   # canvas-only components (Root, TableCells, templates)
    tokens.ts                    # src/theme → tokens.json (+ tokens.css)
    css.ts                       # Tailwind v4 compile → bundle.css
    docs.ts                      # dist/metadata/components.json → READMEs, index.d.ts, Consuming section
    previews.ts                  # stories → components/<Comp>/preview.html (+ stories.js)
    assets.ts                    # fonts, icons, logo, cover
    config.ts                    # target URL, namespace, caps, exclusions (single source)
  .claude-design/                # build OUTPUT, gitignored (= the artifact's project/ folder)
```

- `package.json`: add script `build:claude-design` only. `files`, `exports`, `sideEffects`,
  `main/module/types` untouched. `claude-design/` is outside `src/`, so the rslib entry glob
  (`./src/**/*.{ts,tsx}`) and `tsconfig.app.json` never see it; give it its own
  `tsconfig.claude-design.json` and include it in the package's typecheck script.
- `.gitignore`: add `.claude-design/`.
- Tooling: esbuild (already in the lockfile via tsx; add it as an explicit devDependency via the
  catalog), postcss + `@tailwindcss/postcss` (already devDeps), ts-morph (already used by
  `scripts/metadata`). No other new dependencies, except `react-compiler-runtime` (devDep, bundled
  into bundle.js only).

### 2. `bundle.js` — React 18-compatible IIFE

- esbuild, `format: 'iife'`, entry `claude-design/bundle/entry.ts`, built **from `src/`** (not
  `dist/`), `platform: 'browser'`, minified, `NODE_ENV=production`,
  `supported: { 'inline-script': false }`, `metafile: true`.
- Builder's call: whether to run the React Compiler in this build. Default: compile with the
  compiler (same behaviour as the npm build) with `target: '18'`, resolving
  `react/compiler-runtime` → `react-compiler-runtime`. If that is impractical in esbuild, build
  without the compiler (components are correct without it, just less memoised) and say so in the
  README's "Not synced" note.
- Resolver plugin:
  - `react` → `window.React`; `react-dom`, `react-dom/client` → `window.ReactDOM`.
  - `react/jsx-runtime`, `react/jsx-dev-runtime` → `react18-shim.ts`.
- `react18-shim.ts` (pure function of `window.React`, never mutates the page's React):
  1. `type.$$typeof === Symbol.for('react.context')` → use `type.Provider` (belt-and-braces; see §6).
  2. Ref-as-prop: only when `props.ref != null` and `type` is a plain function component (no
     `prototype.isReactComponent`, not already forwardRef/memo), swap `type` for a WeakMap-cached
     `forwardRef((p, ref) => type({...p, ref}))` with the original `displayName`. Elements without a
     ref keep their original `type`.
  3. Same rule inside a `cloneElement` wrapper the bundle uses (aliased in the bundle's own
     `react` module, not on `window.React`).
  4. Host elements: `inert: true` → `''`, `inert: false` → removed (React 18 drops booleans).
  5. `key` passed through; `jsx`/`jsxs`/`Fragment` exported.
- Exposed global: `window.WallarmDS = { ...all src/index.ts exports, Icons: {...src/icons}, ...canvas helpers }`.
  Flat names as in the package (`DialogContent`, not `Dialog.Content`).
- Size budget: fail above 5.7 MB; print the top 15 inputs by bytes from the metafile. Exclude the
  shiki and highlight.js CodeSnippet adapters (Prism default stays), listed in `config.ts`.
- Guards after build: no `</script`, no `<!--` (escape `<!--` → `<\!--`), no `import(`/`fetch(`
  of remote URLs, header line present.
- **No `components/lib/react*.js`.** `design-system.json` `libraries` = `react`/`react-dom` 18
  (jsDelivr), so the artifact's own previews run on the same React the canvas uses.

### 3. `bundle.css`

- PostCSS with `@tailwindcss/postcss` on an entry that imports `tailwindcss`, `tw-animate-css` and
  `src/theme/index.css`, `@source` = `src/**/*.{ts,tsx}` minus stories/tests/story-content, plus
  `claude-design/bundle/helpers/**`.
- Safelist via `@source inline(...)` for the layout utilities an agent writes in artboard markup:
  flex/grid basics, `grid-cols-1..12`, `col-span-*`, the README spacing scale for
  `p/m/gap/w/h/max-w`, and every token colour utility (`bg-bg-*`, `text-text-*`, `border-border-*`,
  `text-icon-*`), radius and shadow utilities. ≤ 2 MB.
- "One source" rule (`craft.md`): declarations that `tokens.css` already emits under the same
  `--name` are stripped from `bundle.css`; values the format can't hold (color-mix ambient tones,
  `[data-frame-style='branded']` overrides) stay in `bundle.css`.
- Rename collision: type-style classes in tokens.css must not shadow Tailwind utilities (see §4).

### 4. `tokens.json` (+ `tokens.css`)

- Source of truth: `src/theme/**/*.css` (semantic, colors/*, components/*, typography, spacing,
  radius, shadow, blur, icon, focus). Reuse `scripts/metadata/parse-tokens.ts` for discovery, but
  **do not change it** (it feeds the published `dist/metadata/components.json` and the MCP).
  Fill its gaps in `claude-design/tokens.ts`: accept `[data-theme='dark']` and
  `[data-theme="dark"]`, the optional `:root` prefix, and include `components/*.css`.
  *(Builder-check call: shared metadata scripts stay byte-identical; upstreaming the fixes is a
  separate `fix:` PR later.)*
- Mapping per `from-code.md` step 4: `:root` → theme `light` (first), `[data-theme=dark]` → `dark`;
  `var(--x)` colours → alias `"{x}"`; `--alpha(var(--c) / N%)` → `rgba()` of the primitive per
  theme, with "= c @ N%" in `usage`; `color-mix()` → computed per theme where the inputs are
  fixed, otherwise skipped and listed in README "Not synced".
- Type styles named `body-xs…body-xl`, `display-*`, `heading-*`, `code-*` (never `text-*`), the
  Tailwind class goes into `usage`.
- `meta.source` = github, repo, `ref` = `<branch>@<sha>`, package, paths, `synced` date.
- Also emit `tokens.css` exactly as `format.md` "tokens.css as compiled", first line
  `/* Wallarm Design System — generated from tokens.json */`.
- Caps checked at build: ≤ 600 colours, ≤ 12 families, ≤ 60 per non-colour family, name regex.

### 5. Docs, types, previews, assets

- `components/index.d.ts`: concatenate the `.d.ts` emitted by the normal build (`dist/**/*.d.ts`),
  so `build:claude-design` runs after `build` (turbo `dependsOn`).
- Per component README from `dist/metadata/components.json` (`scripts/metadata/generate.ts`),
  post-processed in `claude-design/docs.ts` (shared scripts untouched, same reason as §4): CVA
  boolean variants render as `boolean`, defaults come from destructured parameter defaults
  (re-read with ts-morph) when `defaultVariants` is absent. README content: first
  sentence = summary, when to use, props as `x-import` attributes (kebab-case), sub-components,
  2–3 examples rewritten as `x-import`, and a "Collections" note for Select/FilterDropdown.
- Root README: brand-book rules (reuse the Prod README text as the starting point, it is good),
  then a generated `## Consuming this system`: namespace, load order (tokens.css → bundle.css →
  bundle.js; React from the page), `x-import` rules, `WallarmDS.Root` wrapper, dark artboards,
  icons as `WallarmDS.Icons.<Name>`, overlays mounted open, Table with `TableCells`.
- Previews: stories found with `findStoryFiles` from `scripts/metadata/story-source.ts` (handles
  nested `stories/` folders — fixes Copyable/FilterInput), first 4 stories per component,
  compiled into `components/<Comp>/stories.js` with the same resolver, mounted by
  `preview.html` (line 1 `@dsCard group="<story title first segment>" height=N`). Components with
  no stories get README only. Providers/internals get no card (same list as today).
- Assets: `src/theme/fonts/*.woff2` → `fonts/`; icons rendered from `dist/icons` to SVG inked
  `#0f172b` → `assets/Icons/`; logo → `assets/Logos/`; cover → `components/Cover/preview.html`
  (reuse the Prod cover).
- `design-system.json`: `namespace` WallarmDS, `libraries` React 18, `editing: "code"` (page
  read-only: the code is the only source, the skill never needs to merge page edits). The
  platform's generic text tells people to rerun `/design-sync`; our README's first line and the
  docs page say instead: "Change it in wallarm/design-system and run `/claude-design-sync` there.",
  `lastChange` `{by, at, via: "Claude Code · wallarm/design-system@<sha>", note}`.

### 6. Library source changes (behaviour-identical, allowed)

These go into `src/` and ship in npm; each must be a no-op for current consumers:

1. `<XContext value>` → `<XContext.Provider value>` at the 4 sites
   (`DropdownMenu.tsx:96`, `WallyAssistant.tsx:321`, `views/ChatViewProvider.tsx:65`,
   `TableInner/TableInnerWindow.tsx:128`). Identical in React 19.
2. Optional portal container: one internal `PortalContainerContext` (default `null` → Ark's
   current behaviour, `document.body`), consumed by a single internal `Portal` wrapper that every
   overlay already routing through Ark's `Portal` uses (~23 files). Not exported from
   `src/index.ts`; set only by the canvas `Root`. No behaviour change when unset.
3. Nothing else in `src/theme`: `--font-weight-extrablod`, `--temp-token`, `--color-data-viz-1`,
   `--font-serif`, `Text size="md"` stay as they are (external consumers may reference theme CSS
   variables). `tokens.json` simply omits `--temp-token` and `--color-data-viz-1` (placeholders) and
   the README "Not synced" note lists the rest.

Anything beyond these needs a separate approval.

### 7. Canvas-only helpers (`claude-design/bundle/helpers/`, bundle only)

- `WallarmDS.Root`: `<div data-theme={theme} data-frame-style? className="bg-bg-page-bg text-text-primary font-sans">`
  with a portal host inside it, providing `PortalContainerContext`; never touches `<html>` or
  localStorage (unlike `ThemeProvider`). Props: `theme` (`light`|`dark`).
- `WallarmDS.TableCells`: cell-renderer factories built from existing components (severity badge,
  http method, response code, IP, date, tags, actions menu) so `columns` stay JSON + one factory call
  in `renderVals()`.
- Screen templates (phase 2, builder may defer): console shell, list page. Source moves from
  `AppShell/story-content` into a shared non-published folder both stories and the bundle import;
  `_storyRouter` replaced by plain `activeNav` state.
- Tour/Toast: documented as non-mountable on canvas in phase 1 (Toast: `Toaster` + `toaster.create`
  in `renderVals`/`componentDidMount` recipe). Making Tour prop-driven is phase 2 and a §6-style
  library change needing its own approval.

### 8. Sync skill `.claude/skills/claude-design-sync/SKILL.md`

1. Check: clean tree, on a release tag `v<version>` (warn, allow override), `pnpm build` then
   `build:claude-design`.
2. Read the target artifact's `project/design-system.json` and `project/README.md` (Artifact
   `read`); refuse if `title`/`namespace` mismatch `config.ts`.
3. Upload icon/logo assets that changed (by sha256) with `asset: true`; update `assetGroups`.
4. Publish changed `project/` files with `root: packages/design-system/.claude-design`,
   ≤ 255 paths per call, `design-system.json` last; delete paths that no longer exist
   (`components/lib/*`, stale components).
5. Report: version, sha, counts, size budget, what was skipped.

Add the skill to the CLAUDE.md skills table and a short "Claude Design" page in
`apps/docs/docs/ai/` for designers.

## Verification

- **No-impact proof (the main acceptance test):** `pnpm build` on `main` vs branch →
  `npm pack --dry-run` file list identical except the §6 files; diff of `dist/` limited to the §6
  modules; `package.json` `exports/files/sideEffects` unchanged. Tree shaking check: a tiny
  consumer fixture importing only `Button` built with Rsbuild before/after — same output size ±
  noise. Wire this as a script the builder can rerun.
- Existing unit + E2E suites green (E2E in CI only, per team practice).
- Harness (node + jsdom, React 18.3.1 UMD, real `bundle.js`): `window.WallarmDS` defined, all
  exports enumerable, mount Button/Input (refs non-null), Dialog/Popover/Select/DropdownMenu open
  inside `Root` (portal inside the root), Table with `TableCells`, dark theme on `Root`. Commit it
  under `claude-design/` as `pnpm test:claude-design`.
- Manual, after first sync: one Design canvas mounting Button, Dialog, DropdownMenu, Table on its
  React 18.

## Account-side actions (the user, in claude.ai — not code)

1. Share "Wallarm Design System Prod" with the organization (view), edit only for the sync owner.
2. Make it the organization's default design system (today the default is the FY26 marketing
   system, which has no components or tokens).
3. Rename FY26 to "Wallarm Brand", state its marketing-only scope; finish its migration
   ("Finish setting up") before standalone Claude Design closes on 2026-12-14.
4. Delete or archive the two older "Wallarm Design System" copies and "Design System".

## Left to the builder

Exact file split inside `claude-design/`, esbuild vs Rspack for the IIFE if esbuild can't run the
compiler, the safelist contents, card heights, cover tweaks, README wording, test harness shape.
