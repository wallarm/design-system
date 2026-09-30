# CodeEditor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@wallarm-org/design-system/CodeEditor` — a CodeMirror 6 editor that looks exactly like CodeSnippet and reuses its chrome — preceded by a CodeSnippet chrome refactor (phase 0).

**Architecture:** Phase 0 adds `CodeSnippetChromeContext` + `ChromeFrame` to CodeSnippet so chrome buttons work under any root. `CodeEditorRoot` (React, main chunk) owns props/state and provides the chrome context; `CodeEditorContent` lazy-loads `engine/` (CodeMirror, one chunk) and calls `createEditor()`. Engine features are independent CM extension modules composed in `engine/index.ts` through Compartments. ReactNode content inside CM DOM goes through a portal registry rendered by `CodeEditorContent`.

**Tech Stack:** React 19, TypeScript 7 (strict), CodeMirror 6 (`@codemirror/*`), Lezer (`@lezer/lr`, `@lezer/json`, `@lezer/generator` dev), `json-schema-library` 11, Tailwind v4, CVA, Vitest 4 + jsdom + Testing Library, Playwright (CI only), Storybook 10 (`storybook-react-rsbuild`).

**Spec:** `docs/superpowers/specs/2026-09-30-code-editor-design.md`

## Global Constraints

- All paths below are relative to `packages/design-system/` unless they start with `docs/` or `apps/`.
- Exact-pinned `dependencies` (no `^`): `@codemirror/state@6.7.6`, `@codemirror/view@6.43.13`, `@codemirror/language@6.12.4`, `@codemirror/commands@6.11.1`, `@codemirror/search@6.7.2`, `@codemirror/autocomplete@6.20.3`, `@codemirror/lint@6.9.7`, `@codemirror/merge@6.12.2`, `@codemirror/lang-json@6.0.2`, `@codemirror/lang-yaml@6.1.3`, `@lezer/common@1.5.3`, `@lezer/lr@1.4.10`, `@lezer/json@1.0.3`, `@lezer/highlight@1.2.5`, `json-schema-library@11.6.2`; `devDependencies`: `@lezer/generator@1.8.1`.
- Nothing under `src/components/CodeEditor/engine/**` or any `@codemirror/*` / `@lezer/*` / `json-schema-library` module may be imported statically from `CodeEditorRoot.tsx`, `CodeEditorContent.tsx`, `CodeEditorContext.ts`, `hooks/**`, `lib/**`, `types.ts` or `index.ts` — only `import type` or via `lib/loadEngine.ts` (`import('../engine')`). `json-schema-library` is imported only via `engine/schema/loadSchema.ts` (`import('json-schema-library')`).
- Do NOT edit `src/theme/semantic.css` (CLAUDE.md rule 7). Theme only references existing `--color-syntax-*` tokens and existing Tailwind classes.
- Component rules (`.claude/rules/component-development.md`): CVA in `classes.ts`, `cn()` for classes, `data-slot` kebab-case on every root, `displayName` on every component, `ref` as a prop (no `forwardRef`), named exports only, no `any`, no `useEffect` for derived state, `import type` for types.
- Test ids (`.claude/rules/test-id.md`): root destructures `data-testid` + `TestIdProvider`; sub-parts call `useTestId('slot')`. Tests select by `data-testid` only (never `data-slot`, never CM class names in RTL tests — CM classes allowed only inside engine unit tests that operate on `EditorState`/`EditorView`).
- Analytics (`docs/metrics/contract.md`): consumer `data-*`/`aria-*`/`id` land on the real node; no `stopPropagation`; no analytics-named props; never touch `data-analytics-props`.
- Run from `packages/design-system/`:
  - unit: `pnpm vitest run <path>`
  - typecheck: `pnpm exec tsc --build tsconfig.app.json --noEmit` (the `typecheck` script is a no-op)
  - lint: `pnpm exec biome check <paths>` (fix: `pnpm exec biome check --write <paths>`)
- E2E / screenshots are NEVER run locally; they run in CI. Push with `[update-screenshots]` in the commit message to generate baselines (Task 17).
- Commits: Conventional Commits, scope `code-snippet` (phase 0) or `code-editor`, each ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never `--no-verify`.
- Existing CodeSnippet unit tests (`CodeSnippet.test.tsx`, `CodeSnippet.nesting.test.tsx`, `adapters/adapters.test.ts`, `lib/*.test.ts`) must stay green after every task.

## Review Focus

1. **Parent transforms the value in `onChange`** (e.g. `onChange={v => setValue(v.toUpperCase())}` or trimming): no update loop, exactly one external sync per edit, the cursor stays at the edit position. → test added to Task 5 (Errata E-RF1).
2. **Typing inside the headers while `folds` is a function** (`getHttpFolds`): the collapsed body fold stays collapsed after the debounce re-run; ids keep state. → Task 8 tests (already present).
3. **Slow async adapter + fast typing**: an outdated highlight result must never be applied to the new document; colours map through edits meanwhile. → Task 6 tests (already present).
4. **Pasted CRLF HTTP message** (`\r\n` line endings): CM normalises to `\n`; the grammar still finds the blank line and mounts the JSON body; `getHttpFolds` on `getValue()` still yields headers/body folds. → test added to Task 4 (Errata E-RF4).
5. **Unmount before the engine chunk resolves, and React StrictMode double mount**: no `EditorView` leak (exactly one `.cm-editor` in the DOM), no React warnings, no `setHandle` after unmount. → test added to Task 9 (Errata E-RF5).

---

## File Map

Phase 0 (`src/components/CodeSnippet/`):
- Create `CodeSnippetChromeContext.ts`, `hooks/useCodeSnippetChrome.ts`, `lib/showMore.ts`, `classes.ts`, `internal/ChromeFrame.tsx`
- Modify `CodeSnippetRoot.tsx`, `CodeSnippetCopyButton.tsx`, `CodeSnippetWrapButton.tsx`, `CodeSnippetFullscreenButton.tsx`, `CodeSnippetShowMoreButton.tsx`, `hooks/index.ts`, `index.ts`
- Modify `src/components/Copyable/Copyable.tsx` (+ its hook if needed) — `text: string | (() => string)`

CodeEditor (`src/components/CodeEditor/`):
```
index.ts                      public exports
types.ts                      public types (spec §4)
CodeEditorRoot.tsx            T9
CodeEditorContent.tsx         T9
CodeEditorContext.ts          T9 internal context
classes.ts                    T9 content wrapper CVA
hooks/useCodeEditor.ts        T9
lib/loadEngine.ts             T9
lib/portalRegistry.ts         T3
lib/PortalOutlet.tsx          T3
lib/httpCompletions.ts        T14 (pure, public)
lib/httpCompletionsData.ts    T14
lib/keyboardHint.ts           T9
engine/index.ts               T5 createEditor
engine/types.ts               T3 internal engine types
engine/positions.ts           T3
engine/theme.ts               T5
engine/contentAttributes.ts   T5
engine/adapterPainter.ts      T6
engine/lines.ts               T7
engine/gutters.ts             T7
engine/folds.ts               T8
engine/search.ts + engine/SearchPanel.tsx   T11
engine/diagnostics.ts         T12
engine/languages/index.ts     T4
engine/languages/http/http.grammar, parser.ts, parser.terms.ts, index.ts   T4
engine/languages/json.ts, yaml.ts   T4
engine/languages/jsonPointers.ts    T13
engine/schema/loadSchema.ts, validate.ts, complete.ts, hover.ts   T13
engine/completion.ts          T14
engine/diff.ts                T15
CodeEditor.stories.tsx        T10 (+T16)
CodeEditor.test.tsx           T9..T16
CodeEditor.nesting.test.tsx   T16
CodeEditor.e2e.ts             T17
ANALYTICS_GAPS.md             T16
```
Also: `vitest.setup.ts` (T3), `package.json` (T3, T4 script), `docs/metrics/contract.md`, `docs/metrics/new-component-checklist.md` (T16), `apps/playground/**` (T18).

## Shared Interfaces (authoritative — every task must use these exact names)

```ts
// ---- CodeSnippet/CodeSnippetChromeContext.ts (T1)
export type CodeSnippetChromeContextValue = {
  size: CodeSnippetSize;
  getCode: () => string;
  notifyCopied: () => void;
  wrapLines: boolean;
  setWrapLines: (wrap: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  maxLines: number;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  /** max(0, totalRows - maxLines) — independent of isExpanded; 0 when maxLines <= 0 */
  hiddenLineCount: number;
};
export const CodeSnippetChromeContext: React.Context<CodeSnippetChromeContextValue | null>;
// CodeSnippet/hooks/useCodeSnippetChrome.ts (T1)
export const useCodeSnippetChrome: () => CodeSnippetChromeContextValue; // throws outside provider
// CodeSnippet/lib/showMore.ts (T1)
export const hasExplicitShowMoreButton: (children: ReactNode) => boolean;
export const getHiddenLineCount: (totalRows: number, maxLines: number) => number;
export const isClamped: (hiddenLineCount: number, isExpanded: boolean) => boolean; // hidden >= MIN_HIDDEN_LINES_THRESHOLD && !isExpanded

// ---- CodeSnippet/classes.ts (T2)
export const codeSnippetRootVariants; // the CVA moved verbatim from CodeSnippetRoot.tsx
// CodeSnippet/internal/ChromeFrame.tsx (T2)
export interface ChromeFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  children: ReactNode;
}
export const ChromeFrame: FC<ChromeFrameProps>; // renders the root <div> (className as given, fullscreen classes merged) into a persistent host; never remounts children
// exported from CodeSnippet/index.ts? NO — ChromeFrame, codeSnippetRootVariants, CodeSnippetChromeContext are imported by CodeEditor via relative paths ('../CodeSnippet/internal/ChromeFrame'). Only CodeSnippetChromeContextValue type + useCodeSnippetChrome are public exports.

// ---- CodeEditor/types.ts (T3) — public, exactly spec §4:
export type CodeEditorLanguage = 'http' | 'json' | 'yaml' | 'bash' | 'text';
export interface CodeEditorApi { focus(): void; getValue(): string; insertText(text: string): void; openSearch(): void; foldAll(): void; unfoldAll(): void; }
export interface CodeEditorPosition { line: number; column: number; }
export interface CodeEditorDiagnostic { from: CodeEditorPosition; to?: CodeEditorPosition; severity: 'error' | 'warning' | 'info'; message: string; source?: string; }
export interface CodeEditorCompletion { label: string; apply?: string; detail?: string; info?: string; kind?: 'keyword' | 'property' | 'value' | 'method' | 'header' | 'snippet' | 'text'; }
export interface CodeEditorHttpContext { section: 'start-line' | 'header-name' | 'header-value' | 'body'; headerName?: string; messageKind: 'request' | 'response'; }
export interface CodeEditorCompletionContext { value: string; position: CodeEditorPosition; lineText: string; word: { text: string; from: CodeEditorPosition }; explicit: boolean; http?: CodeEditorHttpContext; jsonPointer?: string; }
export type CodeEditorCompletionSource = (ctx: CodeEditorCompletionContext) => CodeEditorCompletion[] | null | Promise<CodeEditorCompletion[] | null>;
export type CodeEditorFolds = FoldRegion[] | ((value: string, ctx: { startingLineNumber: number }) => FoldRegion[]);
export type JsonSchema = Record<string, unknown> | boolean; // structural; engine casts to json-schema-library's JsonSchema

// ---- CodeEditor/lib/portalRegistry.ts (T3)
export interface PortalEntry { id: number; host: HTMLElement; node: ReactNode; }
export interface PortalRegistry {
  register(host: HTMLElement, node: ReactNode): number;
  update(id: number, node: ReactNode): void;
  unregister(id: number): void;
  subscribe(listener: () => void): () => void;
  getSnapshot(): readonly PortalEntry[]; // stable reference until a change
}
export const createPortalRegistry: () => PortalRegistry;
// CodeEditor/lib/PortalOutlet.tsx (T3)
export const PortalOutlet: FC<{ registry: PortalRegistry }>; // useSyncExternalStore + createPortal per entry, key = id

// ---- CodeEditor/engine/types.ts (T3) — internal
export interface EngineOptions {
  value: string;
  documentId: string | undefined;
  language: CodeEditorLanguage;
  readOnly: boolean;
  wrapLines: boolean;
  startingLineNumber: number;
  lineNumbers: boolean;
  lines: Record<number, LineConfig>;
  folds: CodeEditorFolds | undefined;
  adapter: SyntaxAdapter<string>;
  original: string | undefined;
  schema: JsonSchema | undefined;
  completions: readonly CodeEditorCompletionSource[];
  diagnostics: readonly CodeEditorDiagnostic[];
  contentAttributes: Record<string, string>;
  testId: string | undefined;          // root data-testid base; engine derives `${testId}--editor`, `--gutter`, `--search`, `--fold-toggle`, `--fold-summary`
  cspNonce: string | undefined;
  maxHeight: number | null;             // px, null = no clamp
}
export interface EngineCallbacks {
  onChange: (value: string) => void;
  onDiagnosticsChange: (diagnostics: CodeEditorDiagnostic[]) => void;
  onVisibleRowCountChange: (rows: number) => void;
  portals: PortalRegistry;
}
export interface EditorHandle {
  update: (options: EngineOptions) => void;  // compares with previous options, reconfigures changed compartments, syncs value/documentId
  api: CodeEditorApi;
  view: EditorView;                           // for tests only
  destroy: () => void;
}
// ---- CodeEditor/engine/positions.ts (T3)
export const offsetToPosition: (doc: Text, offset: number, startingLineNumber: number) => CodeEditorPosition;
export const positionToOffset: (doc: Text, position: CodeEditorPosition, startingLineNumber: number) => number | null; // null if line out of range; column clamped to line length
export const lineNumberToDocLine: (doc: Text, absoluteLine: number, startingLineNumber: number) => Line | null;
// ---- CodeEditor/engine/index.ts (T5)
export const createEditor: (parent: HTMLElement, options: EngineOptions, callbacks: EngineCallbacks) => EditorHandle;
export const externalChange: AnnotationType<boolean>;
export const minimalChange: (from: string, to: string) => ChangeSpec | null; // common prefix/suffix; null if equal
// ---- engine/theme.ts (T5)
export const editorTheme: Extension;
export const maxHeightTheme: (maxHeight: number | null) => Extension;
// ---- engine/contentAttributes.ts (T5)
export const RESERVED_CONTENT_ATTRIBUTES: readonly string[]; // role, contenteditable, aria-multiline, aria-readonly, spellcheck, autocorrect, autocapitalize, translate
export const sanitizeContentAttributes: (attrs: Record<string, string>) => Record<string, string>; // drops reserved (dev console.warn), keeps class merged by CM
// ---- engine/adapterPainter.ts (T6)
export const adapterPainter: (config: { adapter: SyntaxAdapter<string>; language: string; debounceMs?: number }) => Extension;
export const getPaintedDecorations: (view: EditorView) => DecorationSet;
// ---- engine/lines.ts (T7)
export const linesExtension: (config: { lines: Record<number, LineConfig>; startingLineNumber: number }) => Extension;
export const getLineDecorations: (state: EditorState) => DecorationSet;
// ---- engine/gutters.ts (T7)
export const guttersExtension: (config: { lines: Record<number, LineConfig>; startingLineNumber: number; lineNumbers: boolean; foldGutter: Extension | null; portals: PortalRegistry; testId: string | undefined }) => Extension;
// order: colour stick (only if any line has color), line numbers (if lineNumbers), foldGutter (if given), prefix (only if any line has prefix)
// ---- engine/folds.ts (T8)
export const foldsExtension: (config: { folds: CodeEditorFolds | undefined; startingLineNumber: number; portals: PortalRegistry; testId: string | undefined }) => { extension: Extension; gutter: Extension | null };
export const getCollapsedFoldIds: (state: EditorState) => ReadonlySet<string>;
export const getVisibleRowCount: (state: EditorState) => number;
export const foldAllRegions: (view: EditorView) => boolean;
export const unfoldAllRegions: (view: EditorView) => boolean;
export const toggleFoldRegion: (view: EditorView, id: string) => boolean;
// ---- engine/languages (T4)
export const languageExtension: (language: CodeEditorLanguage) => Extension;         // languages/index.ts
export const httpLanguage: LRLanguage; export const http: () => LanguageSupport;       // languages/http/index.ts
export const findJsonBodyRange: (state: EditorState) => { from: number; to: number } | null; // http JsonText mount range
export const httpContextAt: (state: EditorState, pos: number) => CodeEditorHttpContext | undefined;
// ---- engine/search.ts (T11)
export const searchExtension: (config: { portals: PortalRegistry; readOnly: boolean; testId: string | undefined }) => Extension;
// ---- engine/diagnostics.ts (T12)
export const diagnosticsExtension: (config: { language: CodeEditorLanguage; schema: JsonSchema | undefined; external: readonly CodeEditorDiagnostic[]; startingLineNumber: number; onChange: (d: CodeEditorDiagnostic[]) => void }) => Extension;
export const jsonRegion: (state: EditorState, language: CodeEditorLanguage) => { from: number; to: number } | null; // whole doc for json, body for http, else null
// ---- engine/languages/jsonPointers.ts (T13)
export interface JsonPointerEntry { pointer: string; keyFrom?: number; keyTo?: number; valueFrom: number; valueTo: number; }
export const getJsonPointers: (state: EditorState, region: { from: number; to: number }) => Map<string, JsonPointerEntry>;
export const pointerAt: (state: EditorState, pos: number, region: { from: number; to: number }) => string | undefined;
// ---- engine/schema (T13)
export const loadSchemaLibrary: () => Promise<typeof import('json-schema-library')>;
export const validateAgainstSchema: (state: EditorState, region: { from: number; to: number }, schema: JsonSchema) => Promise<Diagnostic[]>; // CM Diagnostic
export const schemaCompletionSource: (getSchema: () => JsonSchema | undefined, getRegion: (state: EditorState) => { from: number; to: number } | null) => CompletionSource;
export const schemaHover: (getSchema: () => JsonSchema | undefined, getRegion: (state: EditorState) => { from: number; to: number } | null) => Extension;
// ---- engine/completion.ts (T14)
export const completionExtension: (config: { language: CodeEditorLanguage; schema: JsonSchema | undefined; sources: readonly CodeEditorCompletionSource[]; startingLineNumber: number }) => Extension;
export const buildCompletionContext: (ctx: CompletionContext, language: CodeEditorLanguage, startingLineNumber: number) => CodeEditorCompletionContext;
// ---- lib/httpCompletions.ts (T14) public
export const httpCompletions: CodeEditorCompletionSource;
// ---- engine/diff.ts (T15)
export const diffExtension: (config: { original: string; portals: PortalRegistry }) => Extension;
// ---- React (T9)
// CodeEditorContext.ts (internal)
export interface CodeEditorContextValue {
  options: Omit<EngineOptions, 'lineNumbers' | 'contentAttributes' | 'maxHeight'> & { maxHeight: number | null };
  callbacks: Omit<EngineCallbacks, 'portals'>;
  setHandle: (handle: EditorHandle | null) => void;
  api: CodeEditorApi;             // stable object delegating to the current handle (no-ops / '' before load)
}
export const CodeEditorContext: React.Context<CodeEditorContextValue | null>;
export const useCodeEditorContext: () => CodeEditorContextValue;
// hooks/useCodeEditor.ts — public: export const useCodeEditor: () => CodeEditorApi;
// lib/loadEngine.ts
export const loadEngine: () => Promise<typeof import('../engine')>; // cached promise
// lib/keyboardHint.ts
export const CODE_EDITOR_KEYBOARD_HINT: string; // 'Tab inserts indentation. Press Escape, then Tab, to move focus out of the editor.'
```

## Tasks

| # | Title | Phase |
|---|---|---|
| 1 | CodeSnippet chrome context, button migration, `onCopy` fix, `Copyable` lazy text, show-more helpers | 0 |
| 2 | CodeSnippet `classes.ts` + `ChromeFrame` (fullscreen without remount, props/ref kept, Escape `defaultPrevented`) | 0 |
| 3 | CodeEditor scaffold: deps, public types, engine types, positions, portal registry + outlet, jsdom Range stubs | 1 |
| 4 | Languages: HTTP Lezer grammar (+generate script, stale test), `parseMixed` JSON body, json/yaml, `languageExtension`, `httpContextAt`, `findJsonBodyRange` | 1 |
| 5 | Engine core: `createEditor`, compartments, value sync (`minimalChange`, `externalChange`), `documentId` state cache, readOnly, wrap, keymaps, theme, content attributes + reserved keys, cspNonce, maxHeight, editor/gutter test ids, `api` | 1 |
| 6 | Adapter painter | 1 |
| 7 | `lines` decorations + gutters (colour stick, line numbers with startingLineNumber, prefix via portals, gutterLineClass) | 1 |
| 8 | Folds (StateField replace + summary widget via portals + fold gutter with `FoldToggle` + foldService + id-keyed collapse + visible row count + commands) | 1 |
| 9 | React layer: `CodeEditorRoot`, `CodeEditorContent` (loader, fallback, attribute routing, PortalOutlet, suppress-parent-click), context, `useCodeEditor`, `apiRef`, controlled wrap, maxLines/ShowMore, copy/onCopy, keyboard hint, aria-label dev warning, `index.ts` exports | 1 |
| 10 | Stories: parity stories (CodeSnippet vs CodeEditor side by side) + core stories | 1 |
| 11 | Search panel (DS components via portals) | 2 |
| 12 | Diagnostics (JSON syntax incl. HTTP body, external, merge, `onDiagnosticsChange`, underline theme) | 2 |
| 13 | JSON pointers + JSON Schema validate / complete / hover (lazy `json-schema-library`) | 2 |
| 14 | Autocomplete wiring + HTTP completions data + `httpCompletions` + consumer sources | 2 |
| 15 | Diff mode (`original`) | 2 |
| 16 | Analytics & test-id hardening: `ANALYTICS_GAPS.md`, docs/metrics fix, nesting + analytics tests, `EditorView.announce` messages | 2 |
| 17 | E2E suite (Visual / Interactions / Accessibility) + interaction stories + Storybook Overview docs; CI screenshot generation | 2 |
| 18 | Playground bundle measurement + final verification (full unit run, typecheck, lint, build, metadata) | 2 |


## Errata (authoritative — apply while executing the named task; overrides the task text where they conflict)

- **E1 [T2] (major)** — Step 8(e)'s code block renders `{maxLines > 0 && !hasExplicitShowMoreButton && <CodeSnippetShowMoreButton />}`. Task 1 turned `hasExplicitShowMoreButton` into an imported function and named the boolean `hasExplicitShowMore`. Copied as written, the code negates the function, which is always false, so ShowMore never auto-renders. The prose warns about this but the code block does not.
  - **Fix:** In T2 Step 8(e), replace that line with `{maxLines > 0 && !hasExplicitShowMore && <CodeSnippetShowMoreButton />}`.

- **E2 [T6] (major)** — Step 9 edits code that T5 never produces. It targets `painter: [],` and a predicate map (`painter: () => false`). T5's `featureExtensions` actually returns thunks (`painter: () => []`), change detection lives in `SLOT_DEPS` (`painter: ['adapter','language']` is already there), and the parameters are named `_options`/`_callbacks`.
  - **Fix:** Replace Step 9(b)/(c) with: rename the `featureExtensions` params `_options, _callbacks` to `options, callbacks`, and replace `painter: () => [],` with `painter: () => adapterPainter({ adapter: options.adapter, language: options.language }),`. Leave `SLOT_DEPS` unchanged and delete the predicate instructions.

- **E3 [T7] (major)** — Step 12 assumes `featureExtensions(...)` returns an `Extension[]` and says to append entries after `adapterPainter`. T5 returns a `SlotBuilders<FeatureKey>` record with a `lines` thunk, so the step cannot be applied as written.
  - **Fix:** Replace Step 12.2 with: replace `lines: () => [],` with `lines: () => [linesExtension({ lines: options.lines, startingLineNumber: options.startingLineNumber }), guttersExtension({ lines: options.lines, startingLineNumber: options.startingLineNumber, lineNumbers: options.lineNumbers, foldGutter: null, portals: callbacks.portals, testId: options.testId })],`. Drop Step 12.3, because `SLOT_DEPS.lines` already lists lines/startingLineNumber/lineNumbers/testId.

- **E4 [T8] (blocker)** — Step 12 is written against an engine shape T5 does not have: `foldsCompartment`, `prev/next/effects`, a gutters-reconfigure condition, and a `foldKeymap` import. It also tells you to declare `let lastRowCount` and `const reportRowCount` inside `createEditor`, which T5 already declares, so you get duplicate-declaration compile errors. It never adds `'folds'` to `SLOT_DEPS.lines`, so the fold gutter (which sits in the lines slot) is not rebuilt when folds change. Separately, T5's row-count listener only fires on `docChanged` or effects, but T8 unfolds on selection-only transactions (updateState checks `tr.selection`), so `onVisibleRowCountChange` and `hiddenLineCount` go stale.
  - **Fix:** Replace Step 12 with these edits to T5's `engine/index.ts`:
(1) Add `import { foldAllRegions, foldsExtension, getVisibleRowCount, unfoldAllRegions } from './folds';` and remove `foldAll, unfoldAll` from the `@codemirror/language` import.
(2) Add a helper: `const buildFolds = (o: EngineOptions, portals: PortalRegistry) => foldsExtension({ folds: o.folds, startingLineNumber: o.startingLineNumber, portals, testId: o.testId });` plus `import type { PortalRegistry } from '../lib/portalRegistry';`.
(3) In `featureExtensions`, set `folds: () => buildFolds(options, callbacks.portals).extension,` and in the lines builder's `guttersExtension` call use `foldGutter: buildFolds(options, callbacks.portals).gutter,`.
(4) Change `SLOT_DEPS.lines` to `['lines', 'startingLineNumber', 'lineNumbers', 'testId', 'folds']`.
(5) Replace the body of `visibleRowCount` with `getVisibleRowCount(state)`.
(6) In the listener, change the condition to `if (update.docChanged || update.selectionSet || update.transactions.some(tr => tr.effects.length > 0)) reportRowCount(update.state);`.
(7) Set `api.foldAll: () => { foldAllRegions(view); }` and `unfoldAll: () => { unfoldAllRegions(view); }`.
Do not add a second `lastRowCount`, `reportRowCount` or updateListener.

- **E5 [T13] (blocker)** — Step 18 does not match T12. It patches `lintSource` using local names that do not exist there (`syntaxDiagnostics`, `externalDiagnostics`, an `async` source), and it adds a static import of `./schema/validate` to diagnostics.ts. T12 already built the `schemaSource` hook and states that T13 must plug into it. Doing both means schema validation is wired twice, which contradicts T12's schema-hook tests and the interface contract.
  - **Fix:** Delete Step 18, so diagnostics.ts stays unchanged. In Step 19, add `import { validateAgainstSchema } from './schema/validate';` to `engine/index.ts`. Inside the `diagnostics` thunk, start with `const { schema } = options;` and add this property to the `diagnosticsExtension({...})` argument: `schemaSource: schema === undefined ? undefined : (state, region) => validateAgainstSchema(state, region, schema),`. Update the Step 22 `git add` list to drop diagnostics.ts.

- **E6 [T10/T15/T16/T17] (major)** — T10's `CodeEditor.stories.test.tsx` asserts that `Object.keys(composed)` equals `STORY_ROOTS` exactly. T15 adds `Diff`, T16 adds `AnalyticsAttributes`, and T17 adds `EditingWorkflow`, `TabsKeepHistory` and `LongDocument`, and none of them updates `STORY_ROOTS`. The test goes red from T15 onward, so the "full suite green" steps fail.
  - **Fix:** T15 Step 9: add `Diff: { editors: ['code-editor-diff'] },` to `STORY_ROOTS` and include the stories test in `git add`. T16 Step 16: add `AnalyticsAttributes: { editors: ['analytics-editor'] },`. T17 Step 5: add `EditingWorkflow: { editors: ['editing'] }, TabsKeepHistory: { editors: ['tabs-editor'] }, LongDocument: { editors: ['long-document'] },`. Each task stages `src/components/CodeEditor/CodeEditor.stories.test.tsx`.

- **E7 [T9] (major)** — Spec §7.9 says to call `view.requestMeasure()` after the fullscreen host moves, and T2 explicitly hands this to Task 9. `CodeEditorContent` never reads `isFullscreen` and never calls `requestMeasure`, so after the move the editor measures against stale geometry.
  - **Fix:** In `CodeEditorContent.tsx`, add `import { useLayoutEffect } from 'react'`, `import { useCodeSnippetChrome } from '../CodeSnippet/hooks';`, then `const { isFullscreen } = useCodeSnippetChrome();` and `useLayoutEffect(() => { handle?.view.requestMeasure(); }, [handle, isFullscreen]);`.

- **E8 [T13] (major)** — hover.ts adds a `hoverTheme` on `.cm-tooltip.cm-tooltip-hover` with the popover surface (`--color-bg-surface-2`). T12's `diagnosticsTheme` already styles that same selector with the dark Tooltip surface and says T13 needs no second theme. The two conflict, and whichever mounts last wins. The hover DOM uses `text-text-primary`/`text-text-secondary`, which is unreadable on the dark `component-tooltip-bg`.
  - **Fix:** In hover.ts, remove `hoverTheme` and its import usage, so `schemaHover` returns `[hoverTooltip(schemaHoverSource(getSchema, getRegion))]`. In `renderHover`, change the classes to `'flex max-w-[320px] flex-col gap-4 px-8 py-4 text-xs text-text-primary-alt'` for the wrapper and `'whitespace-pre-wrap text-text-primary-alt'` for the body.

- **E9 [T11] (minor)** — Step 11 describes the fix for T5's `api.test` "openSearch does not open the built-in CodeMirror panel…" only loosely. That test asserts that `.cm-panels` is null, which T11's panel now breaks.
  - **Fix:** In `engine/api.test.ts`, replace that test body with: `const { handle } = mountEngine({ value: 'abc' }); handle.api.openSearch(); expect(searchPanelOpen(handle.view.state)).toBe(true); expect(handle.view.dom.querySelector('.cm-search')).toBeNull();`, and add `import { searchPanelOpen } from '@codemirror/search';`.

- **E10 [T11] (minor)** — Spec §7.10 maps the current search match to `--color-syntax-highlight-selected-highlight`. `searchTheme` uses `brand-highlight` instead.
  - **Fix:** In `searchTheme`, replace `'var(--color-syntax-highlight-brand-highlight)'` with `'var(--color-syntax-highlight-selected-highlight)'`.

- **E11 [T5/T9] (minor)** — Spec §7.10 says the root shows a `focus-within` outline using DS focus-ring classes. T5 removes the CM outline and no task adds the replacement.
  - **Fix:** In T9's `CodeEditorRoot`, change the ChromeFrame className to `cn(codeSnippetRootVariants({ size }), 'focus-within:ring-focus-primary focus-within:ring-2', className)`. Use the DS ring utility already used by ToggleButton (`ring-focus-primary`).

- **E12 [T17] (minor)** — Spec §10 E2E asks for a dark-theme Visual test and axe on default, readOnly and diff. The plan has neither. The repo has no axe dependency, and no test applies `data-theme='dark'`.
  - **Fix:** Add to the Visual group: `test('Should render dark theme correctly', async ({ page }) => { await interactionStory.goto(page, 'Editing Workflow'); await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark')); await waitForEngine(page); await settleForScreenshot(page); await expect(page).toHaveScreenshot(); });`. Note in the PR that the axe checks are replaced by role/name assertions, and bump the Step 10 expected count to +23.

- **E13 [T2/T9] (minor)** — The unit tests assert on `data-slot` (`toHaveAttribute('data-slot', 'code-snippet' | 'code-editor')`, and `getAttribute('data-slot')` in the SSR test). The test-id rule says `data-slot` is never used for testing.
  - **Fix:** Remove the `data-slot` assertions in `CodeSnippet.fullscreen.test.tsx` and `CodeEditor.test.tsx`. In `ChromeFrame.ssr.test.tsx`, replace the `data-slot` check with `expect(container.querySelector('[data-testid="frame"]')?.parentElement?.parentElement?.parentElement).toBe(container);`.

- **E14 [spec §13] (minor)** — The risk mitigation calls for a unit test that mounts and unmounts 1000 portal markers. No task implements it.
  - **Fix:** Add to T7 `gutters.test.ts`: mount a 1000-line doc with `lines` whose ReactNode prefix is on every line, call `editor.destroy()`, and expect `portals.getSnapshot()` to have length 0.

- **E-RF1 [T5]** — add to `engine/index.test.ts`: mount with a controlled harness whose onChange stores `v.toUpperCase()` and calls `handle.update({...options, value: stored})`; dispatch a user input of `'a'` at offset 0 of doc `''`; expect `handle.view.state.doc.toString()` to be `'A'`, onChange called exactly once, and `state.selection.main.head === 1`.
- **E-RF4 [T4]** — add to the http language tests: `EditorState.create({ doc: 'POST /x HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"a":1}', extensions: [http()] })`; expect `state.doc.lines === 4`, `findJsonBodyRange(state)` to equal the offsets of `{"a":1}` in `state.doc.toString()`, and `getHttpFolds(state.doc.toString())` to return both `http-headers` and `http-body` folds.
- **E-RF5 [T9]** — add to `CodeEditor.test.tsx`: render `<StrictMode><CodeEditorRoot defaultValue='x'><CodeEditorContent aria-label='e' data-testid='se' /></CodeEditorRoot></StrictMode>` (root data-testid='s'); await `findByTestId('s--editor')`; expect `document.querySelectorAll('.cm-editor').length === 1` (engine unit-level DOM check is acceptable here) and no `console.error` calls (spy); then unmount and expect 0 `.cm-editor`.

---

### Task 1: CodeSnippet chrome context, button migration, onCopy fix, Copyable lazy text, show-more helpers

**Files:**
- Create: `src/components/CodeSnippet/lib/showMore.ts`
- Create: `src/components/CodeSnippet/CodeSnippetChromeContext.ts`
- Create: `src/components/CodeSnippet/hooks/useCodeSnippetChrome.ts`
- Modify: `src/components/CodeSnippet/CodeSnippetRoot.tsx`
- Modify: `src/components/CodeSnippet/CodeSnippetCopyButton.tsx`
- Modify: `src/components/CodeSnippet/CodeSnippetWrapButton.tsx`
- Modify: `src/components/CodeSnippet/CodeSnippetFullscreenButton.tsx`
- Modify: `src/components/CodeSnippet/CodeSnippetShowMoreButton.tsx`
- Modify: `src/components/CodeSnippet/hooks/index.ts`
- Modify: `src/components/CodeSnippet/index.ts`
- Modify: `src/components/Copyable/Copyable.tsx`
- Test (create): `src/components/CodeSnippet/lib/showMore.test.ts`
- Test (create): `src/components/Copyable/Copyable.test.tsx`
- Test (create): `src/components/CodeSnippet/CodeSnippet.chrome.test.tsx`
- Existing tests that must stay green: `src/components/CodeSnippet/CodeSnippet.test.tsx`, `CodeSnippet.nesting.test.tsx`, `InlineCodeSnippet.test.tsx`, `adapters/adapters.test.ts`, `lib/*.test.ts`

**Interfaces:**
- Consumes: `MIN_HIDDEN_LINES_THRESHOLD` (= 3) and `CodeSnippetSize` from `src/components/CodeSnippet/CodeSnippetContext.ts` (unchanged). `useTestId` and `TestIdProvider` from `src/utils/testId.ts`. `copyText` from `src/utils/copyText.ts`, which tests mock through `vi.mock('../../utils/copyText')`.
- Produces (exact names from the Shared Interfaces):
  ```ts
  // CodeSnippet/CodeSnippetChromeContext.ts
  export type CodeSnippetChromeContextValue = {
    size: CodeSnippetSize; getCode: () => string; notifyCopied: () => void;
    wrapLines: boolean; setWrapLines: (wrap: boolean) => void;
    isFullscreen: boolean; setIsFullscreen: (fullscreen: boolean) => void;
    maxLines: number; isExpanded: boolean; setIsExpanded: (expanded: boolean) => void;
    hiddenLineCount: number; // max(0, totalRows - maxLines); 0 when maxLines <= 0; independent of isExpanded
  };
  export const CodeSnippetChromeContext: React.Context<CodeSnippetChromeContextValue | null>;
  // CodeSnippet/hooks/useCodeSnippetChrome.ts
  export const useCodeSnippetChrome: () => CodeSnippetChromeContextValue;
  // throws Error('useCodeSnippetChrome must be used within CodeSnippetRoot or CodeEditorRoot')
  // CodeSnippet/lib/showMore.ts
  export const hasExplicitShowMoreButton: (children: ReactNode) => boolean;
  export const getHiddenLineCount: (totalRows: number, maxLines: number) => number;
  export const isClamped: (hiddenLineCount: number, isExpanded: boolean) => boolean;
  // Copyable
  export interface CopyableProps { text: string | (() => string); /* rest unchanged */ }
  ```
- Public exports added to `CodeSnippet/index.ts`: `type CodeSnippetChromeContextValue` and `useCodeSnippetChrome`. `CodeSnippetChromeContext` and `lib/showMore` stay internal. CodeEditor imports them by relative path.
- Test id: `CodeSnippetShowMoreButton` now carries `data-testid="{root}--show-more-button"`. A consumer `data-testid` still overrides it, because `{...props}` is spread after it.

---

- [ ] **Step 1: Write the failing show-more helper tests**

Create `src/components/CodeSnippet/lib/showMore.test.ts`:

```ts
import { createElement, Fragment } from 'react';
import { describe, expect, it } from 'vitest';
import { CodeSnippetContent } from '../CodeSnippetContent';
import { CodeSnippetShowMoreButton } from '../CodeSnippetShowMoreButton';
import { getHiddenLineCount, hasExplicitShowMoreButton, isClamped } from './showMore';

describe('getHiddenLineCount', () => {
  it('returns rows beyond maxLines', () => {
    expect(getHiddenLineCount(10, 4)).toBe(6);
  });

  it('never goes negative', () => {
    expect(getHiddenLineCount(3, 7)).toBe(0);
  });

  it('returns 0 when maxLines is disabled', () => {
    expect(getHiddenLineCount(10, 0)).toBe(0);
    expect(getHiddenLineCount(10, -1)).toBe(0);
  });
});

describe('isClamped', () => {
  it('clamps when at least MIN_HIDDEN_LINES_THRESHOLD (3) rows are hidden and not expanded', () => {
    expect(isClamped(3, false)).toBe(true);
    expect(isClamped(6, false)).toBe(true);
  });

  it('does not clamp below the threshold', () => {
    expect(isClamped(2, false)).toBe(false);
    expect(isClamped(0, false)).toBe(false);
  });

  it('does not clamp when expanded', () => {
    expect(isClamped(6, true)).toBe(false);
  });
});

describe('hasExplicitShowMoreButton', () => {
  it('detects a direct CodeSnippetShowMoreButton child', () => {
    expect(
      hasExplicitShowMoreButton([
        createElement(CodeSnippetContent, { key: 'c' }),
        createElement(CodeSnippetShowMoreButton, { key: 's' }),
      ]),
    ).toBe(true);
  });

  it('ignores other children, strings and nested buttons', () => {
    expect(hasExplicitShowMoreButton(createElement(CodeSnippetContent))).toBe(false);
    expect(hasExplicitShowMoreButton('text')).toBe(false);
    expect(hasExplicitShowMoreButton(null)).toBe(false);
    expect(
      hasExplicitShowMoreButton(
        createElement('div', null, createElement(CodeSnippetShowMoreButton)),
      ),
    ).toBe(false);
  });

  it('matches the real component displayName', () => {
    expect(CodeSnippetShowMoreButton.displayName).toBe('CodeSnippetShowMoreButton');
    expect(hasExplicitShowMoreButton(createElement(Fragment))).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run from `packages/design-system/`: `pnpm vitest run src/components/CodeSnippet/lib/showMore.test.ts`
Expected: FAIL with `Failed to resolve import "./showMore" from "src/components/CodeSnippet/lib/showMore.test.ts". Does the file exist?`

- [ ] **Step 3: Implement `lib/showMore.ts`**

Create `src/components/CodeSnippet/lib/showMore.ts`:

```ts
import { Children, isValidElement, type ReactNode } from 'react';
import { MIN_HIDDEN_LINES_THRESHOLD } from '../CodeSnippetContext';

/**
 * Must equal `CodeSnippetShowMoreButton.displayName`. Kept as a literal so this
 * module does not import the component (avoids a lib -> component -> hooks cycle);
 * `showMore.test.ts` pins the match against the real component.
 */
const SHOW_MORE_BUTTON_DISPLAY_NAME = 'CodeSnippetShowMoreButton';

/** True when a direct child is a `CodeSnippetShowMoreButton` (root then skips the auto-rendered one). */
export const hasExplicitShowMoreButton = (children: ReactNode): boolean =>
  Children.toArray(children).some(
    child =>
      isValidElement(child) &&
      typeof child.type !== 'string' &&
      (child.type as { displayName?: string }).displayName === SHOW_MORE_BUTTON_DISPLAY_NAME,
  );

/** Rows beyond `maxLines`, independent of the expanded state. 0 when `maxLines <= 0`. */
export const getHiddenLineCount = (totalRows: number, maxLines: number): number =>
  maxLines > 0 ? Math.max(0, totalRows - maxLines) : 0;

/** Whether content is currently clipped to `maxLines`. */
export const isClamped = (hiddenLineCount: number, isExpanded: boolean): boolean =>
  hiddenLineCount >= MIN_HIDDEN_LINES_THRESHOLD && !isExpanded;
```

- [ ] **Step 4: Run the helper tests and confirm they pass**

Run: `pnpm vitest run src/components/CodeSnippet/lib/showMore.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Write the failing Copyable lazy-text tests**

Create `src/components/Copyable/Copyable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../../utils/copyText';
import { Copyable } from './Copyable';

vi.mock('../../utils/copyText', () => ({
  copyText: vi.fn(() => Promise.resolve()),
}));

afterEach(() => {
  vi.mocked(copyText).mockClear();
});

describe('Copyable', () => {
  it('copies a string text', async () => {
    const onCopied = vi.fn();

    render(
      <Copyable text='static value' onCopied={onCopied}>
        <button type='button' data-testid='copy-trigger'>
          Copy
        </button>
      </Copyable>,
    );

    await userEvent.click(screen.getByTestId('copy-trigger'));

    expect(copyText).toHaveBeenCalledWith('static value');
    expect(onCopied).toHaveBeenCalledTimes(1);
  });

  it('calls a function text lazily at click time and copies its result', async () => {
    let current = 'initial';
    const getText = vi.fn(() => current);

    render(
      <Copyable text={getText}>
        <button type='button' data-testid='copy-trigger'>
          Copy
        </button>
      </Copyable>,
    );

    expect(getText).not.toHaveBeenCalled();

    current = 'updated at click';
    await userEvent.click(screen.getByTestId('copy-trigger'));

    expect(getText).toHaveBeenCalledTimes(1);
    expect(copyText).toHaveBeenCalledWith('updated at click');
  });

  it('supports a function text together with a tooltip', async () => {
    render(
      <Copyable text={() => 'from fn'} tooltip>
        <button type='button' data-testid='copy-trigger'>
          Copy
        </button>
      </Copyable>,
    );

    await userEvent.click(screen.getByTestId('copy-trigger'));

    expect(copyText).toHaveBeenCalledWith('from fn');
  });
});
```

- [ ] **Step 6: Run it and confirm it fails**

Run: `pnpm vitest run src/components/Copyable/Copyable.test.tsx`
Expected: FAIL on 2 of 3 tests:
- `calls a function text lazily…` fails with `expected "vi.fn()" to be called 1 times, but got 0 times`.
- `supports a function text together with a tooltip` fails with `expected "vi.fn()" to be called with arguments: [ 'from fn' ]`, because the function itself is passed to `copyText`.

`copies a string text` passes.

- [ ] **Step 7: Implement `text: string | (() => string)` in Copyable**

In `src/components/Copyable/Copyable.tsx`, replace this:

```tsx
  /** The text to copy to the clipboard. */
  text: string;
```

with this:

```tsx
  /**
   * The text to copy to the clipboard. Pass a function to read the text
   * lazily at click time (e.g. the live document of an editor).
   */
  text: string | (() => string);
```

In `handleClick`, replace this:

```tsx
      copy(text);
      onCopied?.();
```

with this:

```tsx
      copy(typeof text === 'function' ? text() : text);
      onCopied?.();
```

Leave everything else alone, including the `useCallback` deps `[copy, text, onCopied, tooltip, resetDelay]` and `src/hooks/useCopyToClipboard.ts`. The hook still receives a `string`.

- [ ] **Step 8: Run the Copyable tests and confirm they pass**

Run: `pnpm vitest run src/components/Copyable/Copyable.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 9: Commit the helpers and Copyable**

```bash
git add packages/design-system/src/components/CodeSnippet/lib/showMore.ts \
  packages/design-system/src/components/CodeSnippet/lib/showMore.test.ts \
  packages/design-system/src/components/Copyable/Copyable.tsx \
  packages/design-system/src/components/Copyable/Copyable.test.tsx
git commit -m "$(cat <<'EOF'
feat(code-snippet): add show-more helpers and lazy Copyable text

Copyable now accepts text as a function read at click time (non-breaking).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 10: Write the failing chrome context / onCopy / show-more test-id tests**

Create `src/components/CodeSnippet/CodeSnippet.chrome.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../../utils/copyText';
import { CodeSnippetActions } from './CodeSnippetActions';
import { CodeSnippetCode } from './CodeSnippetCode';
import { CodeSnippetContent } from './CodeSnippetContent';
import { CodeSnippetCopyButton } from './CodeSnippetCopyButton';
import { CodeSnippetRoot } from './CodeSnippetRoot';
import { CodeSnippetShowMoreButton } from './CodeSnippetShowMoreButton';
import { useCodeSnippetChrome } from './hooks';

vi.mock('../../utils/copyText', () => ({
  copyText: vi.fn(() => Promise.resolve()),
}));

const makeCode = (lineCount: number) =>
  Array.from({ length: lineCount }, (_, index) => `line ${index + 1}`).join('\n');

const ChromeProbe = () => {
  const chrome = useCodeSnippetChrome();
  return (
    <output data-testid='probe'>
      {JSON.stringify({
        code: chrome.getCode(),
        size: chrome.size,
        maxLines: chrome.maxLines,
        hiddenLineCount: chrome.hiddenLineCount,
        isExpanded: chrome.isExpanded,
        wrapLines: chrome.wrapLines,
        isFullscreen: chrome.isFullscreen,
      })}
    </output>
  );
};

afterEach(() => {
  vi.mocked(copyText).mockClear();
});

describe('CodeSnippet chrome context', () => {
  it('useCodeSnippetChrome throws outside a provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<ChromeProbe />)).toThrow(
      'useCodeSnippetChrome must be used within CodeSnippetRoot or CodeEditorRoot',
    );

    consoleError.mockRestore();
  });

  it('exposes chrome state from CodeSnippetRoot', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} size='md' maxLines={4} wrapLines>
        <ChromeProbe />
      </CodeSnippetRoot>,
    );

    expect(JSON.parse(screen.getByTestId('probe').textContent ?? '')).toEqual({
      code: makeCode(10),
      size: 'md',
      maxLines: 4,
      hiddenLineCount: 6,
      isExpanded: false,
      wrapLines: true,
      isFullscreen: false,
    });
  });

  it('keeps hiddenLineCount independent of isExpanded', async () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4}>
        <ChromeProbe />
        <CodeSnippetShowMoreButton data-testid='show-more-btn' />
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('show-more-btn'));

    const state = JSON.parse(screen.getByTestId('probe').textContent ?? '');
    expect(state.isExpanded).toBe(true);
    expect(state.hiddenLineCount).toBe(6);
  });

  it('reports hiddenLineCount 0 when maxLines is disabled', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)}>
        <ChromeProbe />
      </CodeSnippetRoot>,
    );

    expect(JSON.parse(screen.getByTestId('probe').textContent ?? '').hiddenLineCount).toBe(0);
  });
});

describe('CodeSnippetCopyButton onCopy', () => {
  it('fires onCopy with the code after the copy button is clicked', async () => {
    const onCopy = vi.fn();

    render(
      <CodeSnippetRoot code='const a = 1;' onCopy={onCopy}>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('copy-btn'));

    expect(copyText).toHaveBeenCalledWith('const a = 1;');
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledWith('const a = 1;');
  });

  it('copies the latest code after the code prop changes', async () => {
    const onCopy = vi.fn();
    const { rerender } = render(
      <CodeSnippetRoot code='first' onCopy={onCopy}>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    rerender(
      <CodeSnippetRoot code='second' onCopy={onCopy}>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('copy-btn'));

    expect(copyText).toHaveBeenCalledWith('second');
    expect(onCopy).toHaveBeenCalledWith('second');
  });

  it('still composes a consumer onClick on the copy button', async () => {
    const onClick = vi.fn();
    const onCopy = vi.fn();

    render(
      <CodeSnippetRoot code='x' onCopy={onCopy}>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' onClick={onClick} />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('copy-btn'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});

describe('CodeSnippetShowMoreButton', () => {
  it('derives its test id from the root cascade', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4} data-testid='snippet'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    const button = screen.getByTestId('snippet--show-more-button');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveTextContent('Show more (6 lines)');
  });

  it('lets a consumer data-testid override the derived one', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4} data-testid='snippet'>
        <CodeSnippetShowMoreButton data-testid='custom-show-more' />
      </CodeSnippetRoot>,
    );

    expect(screen.getByTestId('custom-show-more')).toBeInTheDocument();
    expect(screen.queryByTestId('snippet--show-more-button')).not.toBeInTheDocument();
  });

  it('toggles between Show more and Show less and keeps the hidden count', async () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4} data-testid='snippet'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    const button = screen.getByTestId('snippet--show-more-button');
    await userEvent.click(button);
    expect(button).toHaveTextContent('Show less');

    await userEvent.click(button);
    expect(button).toHaveTextContent('Show more (6 lines)');
  });

  it('renders nothing when fewer than 3 lines would be hidden', () => {
    render(
      <CodeSnippetRoot code={makeCode(6)} maxLines={4} data-testid='snippet'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    expect(screen.queryByTestId('snippet--show-more-button')).not.toBeInTheDocument();
  });

  it('omits data-testid on the show-more button when the root has none', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    expect(screen.getByRole('button', { name: /show more/i })).not.toHaveAttribute('data-testid');
  });
});
```

The last test uses `getByRole` on purpose. It asserts that the attribute is absent, so there is no test id to select by.

- [ ] **Step 11: Run it and confirm it fails**

Run: `pnpm vitest run src/components/CodeSnippet/CodeSnippet.chrome.test.tsx`
Expected: FAIL on 11 tests:
- The context tests fail with `TypeError: useCodeSnippetChrome is not a function`.
- The throw test fails because it gets a different error message.
- The three onCopy tests fail with `onCopy` called 0 times. On current code the copy button still calls `copyText`, but `onCopy` never fires.
- `derives its test id…` and `toggles…` fail because `snippet--show-more-button` is not found.

- [ ] **Step 12: Create the chrome context and hook**

Create `src/components/CodeSnippet/CodeSnippetChromeContext.ts`:

```ts
import { createContext } from 'react';
import type { CodeSnippetSize } from './CodeSnippetContext';

/**
 * Chrome-level state shared by the toolbar/show-more buttons.
 *
 * Provided by `CodeSnippetRoot` (and by `CodeEditorRoot`), so the chrome
 * buttons work under either root without depending on the snippet's
 * render pipeline (`CodeSnippetContext`).
 */
export type CodeSnippetChromeContextValue = {
  size: CodeSnippetSize;
  /** Lazily reads the current text (snippet: `code` prop; editor: live document) */
  getCode: () => string;
  /** Called by the copy button after a copy; roots forward it to their `onCopy` */
  notifyCopied: () => void;
  wrapLines: boolean;
  setWrapLines: (wrap: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  maxLines: number;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  /** max(0, totalRows - maxLines) — independent of isExpanded; 0 when maxLines <= 0 */
  hiddenLineCount: number;
};

export const CodeSnippetChromeContext = createContext<CodeSnippetChromeContextValue | null>(null);
```

Create `src/components/CodeSnippet/hooks/useCodeSnippetChrome.ts`:

```ts
import { useContext } from 'react';
import {
  CodeSnippetChromeContext,
  type CodeSnippetChromeContextValue,
} from '../CodeSnippetChromeContext';

export const useCodeSnippetChrome = (): CodeSnippetChromeContextValue => {
  const context = useContext(CodeSnippetChromeContext);
  if (!context) {
    throw new Error('useCodeSnippetChrome must be used within CodeSnippetRoot or CodeEditorRoot');
  }
  return context;
};
```

Replace the whole of `src/components/CodeSnippet/hooks/index.ts` with:

```ts
export { useAdapter } from './useAdapter';
export { useCodeSnippet } from './useCodeSnippet';
export { useCodeSnippetChrome } from './useCodeSnippetChrome';
```

- [ ] **Step 13: Make CodeSnippetRoot build and provide the chrome value**

Edit `src/components/CodeSnippet/CodeSnippetRoot.tsx`. `CodeSnippetContext`, its value and `copyToClipboard` stay as they are.

(a) Lines 1-2. Old:
```tsx
import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import { Children, isValidElement, useCallback, useEffect, useMemo, useState } from 'react';
```
New:
```tsx
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
```

(b) Lines 10-19, the context and lib imports. Old:
```tsx
import {
  CodeSnippetContext,
  type CodeSnippetContextValue,
  type CodeSnippetSize,
  type LineConfig,
  MIN_HIDDEN_LINES_THRESHOLD,
} from './CodeSnippetContext';
import { CodeSnippetShowMoreButton } from './CodeSnippetShowMoreButton';
import { useAdapter } from './hooks';
import { buildDisplayItems, type FoldRegion, validateFolds } from './lib/foldUtils';
```
New:
```tsx
import {
  CodeSnippetChromeContext,
  type CodeSnippetChromeContextValue,
} from './CodeSnippetChromeContext';
import {
  CodeSnippetContext,
  type CodeSnippetContextValue,
  type CodeSnippetSize,
  type LineConfig,
} from './CodeSnippetContext';
import { CodeSnippetShowMoreButton } from './CodeSnippetShowMoreButton';
import { useAdapter } from './hooks';
import { buildDisplayItems, type FoldRegion, validateFolds } from './lib/foldUtils';
import { getHiddenLineCount, hasExplicitShowMoreButton, isClamped } from './lib/showMore';
```

(c) Delete lines 84-87 and the blank line after them:
```tsx
const isCodeSnippetShowMoreButton = (child: ReactNode): child is ReactElement =>
  isValidElement(child) &&
  (child.type as { displayName?: string })?.displayName === CodeSnippetShowMoreButton.displayName;
```

(d) Directly after the `copyToClipboard` `useCallback` (old lines 162-165), insert:
```tsx

  const getCode = useCallback(() => code, [code]);

  const notifyCopied = useCallback(() => {
    onCopy?.(code);
  }, [code, onCopy]);
```

(e) Old lines 208-214. Old:
```tsx
  const hasExplicitShowMoreButton = Children.toArray(children).some(isCodeSnippetShowMoreButton);

  const visibleDisplayItems = useMemo(() => {
    const hiddenRows = displayItems.length - maxLines;
    const shouldClip = maxLines > 0 && !isExpanded && hiddenRows >= MIN_HIDDEN_LINES_THRESHOLD;
    return shouldClip ? displayItems.slice(0, maxLines) : displayItems;
  }, [displayItems, maxLines, isExpanded]);
```
New:
```tsx
  const hasExplicitShowMore = hasExplicitShowMoreButton(children);

  const hiddenLineCount = getHiddenLineCount(displayItems.length, maxLines);

  const visibleDisplayItems = useMemo(
    () => (isClamped(hiddenLineCount, isExpanded) ? displayItems.slice(0, maxLines) : displayItems),
    [displayItems, hiddenLineCount, maxLines, isExpanded],
  );
```
This behaves the same as before: `getHiddenLineCount` returns 0 when `maxLines <= 0`, so `isClamped` is false.

(f) Directly before `const snippet = (`, insert:
```tsx
  const chromeValue = useMemo<CodeSnippetChromeContextValue>(
    () => ({
      size: (size ?? 'sm') as CodeSnippetSize,
      getCode,
      notifyCopied,
      wrapLines,
      setWrapLines,
      isFullscreen,
      setIsFullscreen,
      maxLines,
      isExpanded,
      setIsExpanded,
      hiddenLineCount,
    }),
    [size, getCode, notifyCopied, wrapLines, isFullscreen, maxLines, isExpanded, hiddenLineCount],
  );

```

(g) Inside `snippet`. Old:
```tsx
      {maxLines > 0 && !hasExplicitShowMoreButton && <CodeSnippetShowMoreButton />}
```
New:
```tsx
      {maxLines > 0 && !hasExplicitShowMore && <CodeSnippetShowMoreButton />}
```

(h) The `return (...)` block. Old:
```tsx
  return (
    <TestIdProvider value={testId}>
      <CodeSnippetContext.Provider value={contextValue as unknown as CodeSnippetContextValue}>
        {isFullscreen
          ? createPortal(
              <>
                <div
                  className='fixed inset-0 z-40 backdrop-blur-xs bg-component-dialog-overlay'
                  onClick={() => setIsFullscreen(false)}
                />
                {snippet}
              </>,
              document.body,
            )
          : snippet}
      </CodeSnippetContext.Provider>
    </TestIdProvider>
  );
```
New:
```tsx
  return (
    <TestIdProvider value={testId}>
      <CodeSnippetChromeContext.Provider value={chromeValue}>
        <CodeSnippetContext.Provider value={contextValue as unknown as CodeSnippetContextValue}>
          {isFullscreen
            ? createPortal(
                <>
                  <div
                    className='fixed inset-0 z-40 backdrop-blur-xs bg-component-dialog-overlay'
                    onClick={() => setIsFullscreen(false)}
                  />
                  {snippet}
                </>,
                document.body,
              )
            : snippet}
        </CodeSnippetContext.Provider>
      </CodeSnippetChromeContext.Provider>
    </TestIdProvider>
  );
```

- [ ] **Step 14: Migrate the four chrome buttons**

`src/components/CodeSnippet/CodeSnippetCopyButton.tsx`:
- Replace `import { useCodeSnippet } from './hooks';` with `import { useCodeSnippetChrome } from './hooks';`.
- Replace this:
  ```tsx
    const { code } = useCodeSnippet();

    return (
      <Copyable text={code} tooltip>
  ```
  with this:
  ```tsx
    const { getCode, notifyCopied } = useCodeSnippetChrome();

    return (
      <Copyable text={getCode} onCopied={notifyCopied} tooltip>
  ```

`src/components/CodeSnippet/CodeSnippetWrapButton.tsx`:
- Replace `import { useCodeSnippet } from './hooks';` with `import { useCodeSnippetChrome } from './hooks';`.
- Replace `const { wrapLines, setWrapLines } = useCodeSnippet();` with `const { wrapLines, setWrapLines } = useCodeSnippetChrome();`.

`src/components/CodeSnippet/CodeSnippetFullscreenButton.tsx`:
- Replace `import { useCodeSnippet } from './hooks';` with `import { useCodeSnippetChrome } from './hooks';`.
- Replace `const { isFullscreen, setIsFullscreen } = useCodeSnippet();` with `const { isFullscreen, setIsFullscreen } = useCodeSnippetChrome();`.

`src/components/CodeSnippet/CodeSnippetShowMoreButton.tsx`. Replace the whole file with:

```tsx
import type { FC, MouseEventHandler, Ref } from 'react';
import { ChevronDown } from '../../icons/ChevronDown';
import { ChevronUp } from '../../icons/ChevronUp';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { MIN_HIDDEN_LINES_THRESHOLD } from './CodeSnippetContext';
import { useCodeSnippetChrome } from './hooks';

export type CodeSnippetShowMoreButtonProps = Omit<ButtonProps, 'children'> & {
  ref?: Ref<HTMLButtonElement>;
};

/**
 * Optional explicit show-more control for snippets with `maxLines`.
 * Do not render this for ordinary collapsed snippets; `CodeSnippetRoot`
 * auto-renders the default control. Render it as a direct child only when
 * consumer props must reach the real button.
 */
export const CodeSnippetShowMoreButton: FC<CodeSnippetShowMoreButtonProps> = ({
  onClick,
  ref,
  ...props
}) => {
  const testId = useTestId('show-more-button');
  const { maxLines, isExpanded, setIsExpanded, hiddenLineCount } = useCodeSnippetChrome();

  if (maxLines <= 0 || hiddenLineCount < MIN_HIDDEN_LINES_THRESHOLD) return null;

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    setIsExpanded(!isExpanded);
    onClick?.(event);
  };

  return (
    <div data-slot='code-snippet-show-more' className='flex h-36 items-center justify-center px-6'>
      <Button
        ref={ref}
        variant='ghost'
        color='neutral'
        size='small'
        fullWidth
        data-testid={testId}
        {...props}
        onClick={handleClick}
      >
        {isExpanded ? (
          <>
            Show less
            <ChevronUp />
          </>
        ) : (
          <>
            Show more ({hiddenLineCount} lines)
            <ChevronDown />
          </>
        )}
      </Button>
    </div>
  );
};

CodeSnippetShowMoreButton.displayName = 'CodeSnippetShowMoreButton';
```

- [ ] **Step 15: Export the public chrome API**

In `src/components/CodeSnippet/index.ts`:
- Directly before `export { CodeSnippetCode, type CodeSnippetCodeProps } from './CodeSnippetCode';`, insert:
  ```ts
  export { type CodeSnippetChromeContextValue } from './CodeSnippetChromeContext';
  ```
- Replace `export { useAdapter, useCodeSnippet } from './hooks';` with:
  ```ts
  export { useAdapter, useCodeSnippet, useCodeSnippetChrome } from './hooks';
  ```

Do not export `CodeSnippetChromeContext` or `lib/showMore`.

- [ ] **Step 16: Run the new chrome tests and confirm they pass**

Run: `pnpm vitest run src/components/CodeSnippet/CodeSnippet.chrome.test.tsx`
Expected: PASS, 12 tests.

- [ ] **Step 17: Run the full CodeSnippet and Copyable folders, typecheck and lint**

Run:
```bash
pnpm vitest run src/components/CodeSnippet src/components/Copyable
pnpm exec tsc --build tsconfig.app.json --noEmit
pnpm exec biome check src/components/CodeSnippet src/components/Copyable
```
Expected:
- vitest: 10 test files, 110 tests, all pass. The existing `CodeSnippet.test.tsx` show-more, explicit-button and analytics tests pass unchanged, and `CodeSnippet.nesting.test.tsx` passes.
- tsc: exits 0 with no output.
- biome: 0 errors. The 12 existing warnings (`noConsole` in `lib/foldUtils.ts` and others) are not introduced by this task.

If biome reports formatting only, run `pnpm exec biome check --write src/components/CodeSnippet src/components/Copyable` and re-run the check.

- [ ] **Step 18: Commit the chrome context and button migration**

```bash
git add packages/design-system/src/components/CodeSnippet/CodeSnippetChromeContext.ts \
  packages/design-system/src/components/CodeSnippet/hooks/useCodeSnippetChrome.ts \
  packages/design-system/src/components/CodeSnippet/hooks/index.ts \
  packages/design-system/src/components/CodeSnippet/CodeSnippetRoot.tsx \
  packages/design-system/src/components/CodeSnippet/CodeSnippetCopyButton.tsx \
  packages/design-system/src/components/CodeSnippet/CodeSnippetWrapButton.tsx \
  packages/design-system/src/components/CodeSnippet/CodeSnippetFullscreenButton.tsx \
  packages/design-system/src/components/CodeSnippet/CodeSnippetShowMoreButton.tsx \
  packages/design-system/src/components/CodeSnippet/index.ts \
  packages/design-system/src/components/CodeSnippet/CodeSnippet.chrome.test.tsx
git commit -m "$(cat <<'EOF'
fix(code-snippet): add chrome context and fire onCopy from the copy button

- CodeSnippetChromeContext + useCodeSnippetChrome (public type + hook)
- Copy/Wrap/Fullscreen/ShowMore buttons read chrome context
- onCopy now fires with the code after copying (previously never called)
- ShowMore uses hiddenLineCount and derives data-testid "--show-more-button"

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

Verification: I checked every step on a throwaway copy of the package at `/private/tmp/claude-501/plan-t1/ds` (the full diff against the original is in `/private/tmp/claude-501/plan-t1/t1.diff`). The new tests fail on the original code as described in Steps 2, 6 and 11. After the changes, the 110 tests across the 10 CodeSnippet and Copyable files pass, `tsc --build tsconfig.app.json --noEmit` exits 0, and biome is clean apart from warnings that were already there.

Note: `tsconfig.unit.json` already reports jest-dom matcher type errors (`toHaveAttribute` and similar) in the existing `CodeSnippet.test.tsx`. The new test files add no other type errors, and this task does not use that config as a gate.

---

### Task 2: CodeSnippet classes.ts + ChromeFrame (fullscreen without remount)

Covers spec §5 items 5, 6, 7 and the fullscreen part of 9. Every file below was compiled and run in a throwaway copy of the package. The result: 104/104 CodeSnippet unit tests pass, `tsc --build tsconfig.app.json` exits 0, and `biome check` reports nothing.

**Files:**
- Create: `src/components/CodeSnippet/classes.ts`
- Create: `src/components/CodeSnippet/internal/ChromeFrame.tsx`
- Modify: `src/components/CodeSnippet/CodeSnippetRoot.tsx`
- Test (create): `src/components/CodeSnippet/internal/ChromeFrame.test.tsx`
- Test (create): `src/components/CodeSnippet/internal/ChromeFrame.ssr.test.tsx`
- Test (create): `src/components/CodeSnippet/CodeSnippet.fullscreen.test.tsx`

**Interfaces:**
- Consumes: `cn` (`src/utils/cn.ts`), `useTestId` / `TestIdProvider` (`src/utils/testId.ts`), `createPortal` (`react-dom`). It does not depend on Task 1's exports. It edits the same `CodeSnippetRoot.tsx` render block that Task 1 changed, so apply it on top of Task 1.
- Produces (all internal, none exported from `CodeSnippet/index.ts`):
  ```ts
  // CodeSnippet/classes.ts
  export const codeSnippetRootVariants: ReturnType<typeof cva>; // the CVA moved verbatim, variants { size: sm|md|lg }, default sm
  // CodeSnippet/internal/ChromeFrame.tsx
  export interface ChromeFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    ref?: Ref<HTMLDivElement>;
    isFullscreen: boolean;
    setIsFullscreen: (fullscreen: boolean) => void;
    children: ReactNode;
  }
  export const ChromeFrame: FC<ChromeFrameProps>;
  ```
- New derived test id (additive): `${rootTestId}--backdrop` on the fullscreen backdrop. It uses `useTestId('backdrop')`, so it only works inside the root's `TestIdProvider`.
- New DOM: an inline placeholder `<div data-slot="code-snippet-frame" class="contents">` holds a host `<div class="contents">`, and the root `<div>` sits inside the host. Both wrappers use `display: contents`, so layout does not change. None of the CodeSnippet stories, `CardContent` or the ClickToCopy story use `space-*`, `divide-*`, `*:` or `first:`/`last:` child selectors (checked with grep), so the 30 screenshot baselines should stay the same.
- DOM behaviour notes for the CodeEditor tasks:
  - The host moves with `appendChild`. After the move, the element that had focus inside the frame is focused again with `preventScroll`.
  - CodeEditor must call `view.requestMeasure()` after `isFullscreen` changes (spec §7.9). Task 9 owns this.
  - React events still work in both modes, because portal events bubble through the React tree. Native bubbling also reaches the consumer's DOM ancestors in inline mode, which analytics' document-level capture needs.
- SSR / hydration:
  - `useSyncExternalStore(noop, () => true, () => false)` controls where the root renders:
    - On the server and during the hydration pass, the root renders inline inside the placeholder.
    - Right after hydration the client switches to the portal. That is a one-time remount at mount, never on a fullscreen toggle.
    - Client-only rendering goes straight to the portal, with no second pass.
  - `createHost()` returns `null` when `typeof document === 'undefined'`, and the frame then stays inline.
  - `ChromeFrame.ssr.test.tsx` checks that `hydrateRoot` raises no recoverable errors.
- E2E check: `CodeSnippet.e2e.ts:178-194` (the "Fullscreen button - enters and exits fullscreen" test) should still pass:
  - After a mouse click on the button, focus stays on it with pointer modality. The zag tooltip only opens on focus when focus is keyboard-visible (`isFocusVisible()`), and `pointerdown` closes it.
  - So no tooltip is open, and its capture-phase Escape handler (`@zag-js/tooltip` `trackEscapeKey`, which calls `stopPropagation`) is not active. `page.keyboard.press('Escape')` reaches ChromeFrame's `document` listener.
  - Known keyboard-only side effect, not covered by E2E: before this change the button remounted and lost focus. Now focus stays, so if the button was reached with the keyboard, the "Exit full screen ESC" tooltip may be open. The first Escape closes it (zag stops propagation) and the second exits fullscreen.
- Metadata: `scripts/metadata/parse-variants.ts` reads `classes.ts` first, so CodeSnippet's generated metadata now gains the `size` variant (sm/md/lg, default sm). This is additive and nothing needs to be committed for it.

- [ ] **Step 1: Write the failing ChromeFrame unit tests**

Create `src/components/CodeSnippet/internal/ChromeFrame.test.tsx`:
```tsx
import { createRef, type FC, type Ref, StrictMode, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TestIdProvider } from '../../../utils/testId';
import { ChromeFrame } from './ChromeFrame';

const Counter: FC = () => {
  const [count, setCount] = useState(0);
  return (
    <button type='button' data-testid='counter' onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
};

interface HarnessProps {
  initialFullscreen?: boolean;
  frameRef?: Ref<HTMLDivElement>;
}

const Harness: FC<HarnessProps> = ({ initialFullscreen = false, frameRef }) => {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  return (
    <div data-testid='parent'>
      <button type='button' data-testid='toggle' onClick={() => setIsFullscreen(v => !v)}>
        toggle
      </button>
      <TestIdProvider value='frame'>
        <ChromeFrame
          ref={frameRef}
          id='consumer-id'
          data-testid='frame'
          data-analytics-id='SNIPPET'
          aria-label='Example'
          className='consumer-class'
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        >
          <Counter />
        </ChromeFrame>
      </TestIdProvider>
    </div>
  );
};

describe('ChromeFrame', () => {
  it('renders the root inline inside the parent when not fullscreen', () => {
    render(<Harness />);

    const frame = screen.getByTestId('frame');
    expect(screen.getByTestId('parent')).toContainElement(frame);
    expect(frame).toHaveClass('consumer-class');
    expect(frame).not.toHaveClass('fixed');
    expect(screen.queryByTestId('frame--backdrop')).not.toBeInTheDocument();
  });

  it('moves the root to document.body in fullscreen without remounting children', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByTestId('counter'));
    await user.click(screen.getByTestId('counter'));
    expect(screen.getByTestId('counter')).toHaveTextContent('2');

    await user.click(screen.getByTestId('toggle'));
    const frame = screen.getByTestId('frame');
    expect(screen.getByTestId('parent')).not.toContainElement(frame);
    expect(frame).toHaveClass('fixed', 'inset-16', 'z-50');
    expect(screen.getByTestId('counter')).toHaveTextContent('2');

    await user.click(screen.getByTestId('counter'));
    expect(screen.getByTestId('counter')).toHaveTextContent('3');

    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('parent')).toContainElement(screen.getByTestId('frame'));
    expect(screen.getByTestId('frame')).not.toHaveClass('fixed');
    expect(screen.getByTestId('counter')).toHaveTextContent('3');
  });

  it('keeps consumer id, data-*, aria-*, className and ref in fullscreen', () => {
    const frameRef = createRef<HTMLDivElement>();
    render(<Harness initialFullscreen frameRef={frameRef} />);

    const frame = screen.getByTestId('frame');
    expect(frame).toHaveAttribute('id', 'consumer-id');
    expect(frame).toHaveAttribute('data-analytics-id', 'SNIPPET');
    expect(frame).toHaveAttribute('aria-label', 'Example');
    expect(frame).toHaveClass('consumer-class', 'fixed', 'inset-16', 'z-50');
    expect(frameRef.current).toBe(frame);
  });

  it('keeps the same DOM node for the ref across fullscreen toggles', async () => {
    const user = userEvent.setup();
    const frameRef = createRef<HTMLDivElement>();
    render(<Harness frameRef={frameRef} />);

    const inlineNode = frameRef.current;
    await user.click(screen.getByTestId('toggle'));
    expect(frameRef.current).toBe(inlineNode);
    await user.click(screen.getByTestId('toggle'));
    expect(frameRef.current).toBe(inlineNode);
  });

  it('exits fullscreen on Escape', () => {
    render(<Harness initialFullscreen />);
    expect(screen.getByTestId('frame')).toHaveClass('fixed');

    fireEvent.keyDown(screen.getByTestId('counter'), { key: 'Escape' });

    expect(screen.getByTestId('frame')).not.toHaveClass('fixed');
  });

  it('does not exit fullscreen when Escape was already handled (defaultPrevented)', () => {
    render(<Harness initialFullscreen />);
    const target = screen.getByTestId('counter');
    const preventEscape = (event: KeyboardEvent) => event.preventDefault();
    target.addEventListener('keydown', preventEscape, { capture: true });

    fireEvent.keyDown(target, { key: 'Escape' });

    expect(screen.getByTestId('frame')).toHaveClass('fixed');
    target.removeEventListener('keydown', preventEscape, { capture: true });
  });

  it('ignores keys other than Escape in fullscreen', () => {
    render(<Harness initialFullscreen />);

    fireEvent.keyDown(screen.getByTestId('counter'), { key: 'Enter' });
    expect(screen.getByTestId('frame')).toHaveClass('fixed');
  });

  it('exits fullscreen on backdrop click', async () => {
    const user = userEvent.setup();
    render(<Harness initialFullscreen />);

    await user.click(screen.getByTestId('frame--backdrop'));

    expect(screen.getByTestId('frame')).not.toHaveClass('fixed');
    expect(screen.queryByTestId('frame--backdrop')).not.toBeInTheDocument();
  });

  it('keeps focus on the focused descendant when the host moves', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const counter = screen.getByTestId('counter');
    counter.focus();

    const toggle = screen.getByTestId('toggle');
    // HTMLElement.click() does not move focus, so focus stays inside the frame
    act(() => {
      toggle.click();
    });
    expect(counter).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.getByTestId('frame')).not.toHaveClass('fixed');
    expect(counter).toHaveFocus();
  });

  it('keeps the root attached and state intact under StrictMode', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );

    expect(screen.getByTestId('parent')).toContainElement(screen.getByTestId('frame'));
    await user.click(screen.getByTestId('counter'));
    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('parent')).not.toContainElement(screen.getByTestId('frame'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');
    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('parent')).toContainElement(screen.getByTestId('frame'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');
  });

  it('removes the host from the DOM on unmount', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);
    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('frame')).toBeInTheDocument();

    unmount();

    expect(screen.queryByTestId('frame')).not.toBeInTheDocument();
    expect(screen.queryByTestId('frame--backdrop')).not.toBeInTheDocument();
  });
});
```

Create `src/components/CodeSnippet/internal/ChromeFrame.ssr.test.tsx`:
```tsx
import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ChromeFrame } from './ChromeFrame';

const noop = () => {
  // fullscreen toggling is not exercised here
};

const Frame = () => (
  <ChromeFrame data-testid='frame' id='ssr-root' isFullscreen={false} setIsFullscreen={noop}>
    <span data-testid='child'>code</span>
  </ChromeFrame>
);

describe('ChromeFrame SSR', () => {
  it('renders the root inline on the server', () => {
    const html = renderToString(<Frame />);

    expect(html).toContain('id="ssr-root"');
    expect(html).toContain('data-testid="child"');
  });

  it('hydrates without errors and then hosts the root in the persistent host', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Frame />);
    document.body.appendChild(container);
    const onRecoverableError = vi.fn();

    const root = await act(async () => hydrateRoot(container, <Frame />, { onRecoverableError }));

    expect(onRecoverableError).not.toHaveBeenCalled();
    const frames = container.querySelectorAll('[data-testid="frame"]');
    expect(frames).toHaveLength(1);
    expect(frames[0]?.parentElement?.parentElement?.getAttribute('data-slot')).toBe(
      'code-snippet-frame',
    );

    act(() => root.unmount());
    container.remove();
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `pnpm vitest run src/components/CodeSnippet/internal/ChromeFrame.test.tsx src/components/CodeSnippet/internal/ChromeFrame.ssr.test.tsx`
Expected: both files FAIL with `Failed to resolve import "./ChromeFrame"`.

- [ ] **Step 3: Create `classes.ts` with the Root CVA moved verbatim**

Create `src/components/CodeSnippet/classes.ts`. The body is character-for-character the same as `CodeSnippetRoot.tsx:21-48` on main; only `export` is added:
```ts
import { cva } from 'class-variance-authority';

export const codeSnippetRootVariants = cva(
  [
    'relative',
    'code-snippet-bg',
    'rounded-6',
    'font-mono',
    'text-syntax-no-syntax',
    'overflow-hidden',
    'flex flex-col',
    '[&::selection]:bg-[var(--color-syntax-highlight-selected-highlight)]',
    '[&::selection]:text-[var(--color-syntax-highlight-selected-code)]',
    '[&_*::selection]:bg-[var(--color-syntax-highlight-selected-highlight)]',
    '[&_*::selection]:text-[var(--color-syntax-highlight-selected-code)]',
    '[&>[data-slot=code-snippet-actions]]:absolute [&>[data-slot=code-snippet-actions]]:right-0 [&>[data-slot=code-snippet-actions]]:top-0 [&>[data-slot=code-snippet-actions]]:z-30 [&>[data-slot=code-snippet-actions]]:p-6 [&>[data-slot=code-snippet-actions]]:rounded-br-6 [&>[data-slot=code-snippet-actions]]:rounded-tl-6',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-xs leading-sm',
        md: 'text-sm',
        lg: 'text-base leading-sm',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);
```

- [ ] **Step 4: Implement `internal/ChromeFrame.tsx`**

Create `src/components/CodeSnippet/internal/ChromeFrame.tsx`:
```tsx
import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';

export interface ChromeFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  children: ReactNode;
}

const FULLSCREEN_CLASSES = 'fixed inset-16 z-50';
const BACKDROP_CLASSES = 'fixed inset-0 z-40 backdrop-blur-xs bg-component-dialog-overlay';
const HOST_CLASSES = 'contents';

const noop = () => {
  // static store: nothing to unsubscribe
};
const subscribeNoop = () => noop;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const createHost = (): HTMLDivElement | null => {
  if (typeof document === 'undefined') return null;
  const host = document.createElement('div');
  host.className = HOST_CLASSES;
  return host;
};

/**
 * Chrome shell shared by CodeSnippetRoot and CodeEditorRoot.
 *
 * The root `<div>` (with every consumer prop, `className` and `ref`) is always
 * rendered through `createPortal` into one persistent host element. Entering or
 * leaving fullscreen only moves that host between an inline placeholder and
 * `document.body`, so the subtree is never remounted (child state, focus
 * targets, editor instances survive). Fullscreen classes are merged into the
 * consumer `className`, not substituted.
 *
 * SSR: on the server (and during the hydration pass) the root renders inline
 * inside the placeholder; the client switches to the portal right after
 * hydration (a one-time remount at mount, never on fullscreen toggle).
 */
export const ChromeFrame: FC<ChromeFrameProps> = ({
  ref,
  isFullscreen,
  setIsFullscreen,
  className,
  children,
  ...props
}) => {
  const backdropTestId = useTestId('backdrop');
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [host] = useState(createHost);
  const canPortal = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
  const portalReady = canPortal && host !== null;

  // Detach the host when the frame unmounts (separate effect so fullscreen
  // toggles never remove the host before moving it).
  useLayoutEffect(() => {
    if (!host) return;
    return () => host.remove();
  }, [host]);

  // Move the host between the inline placeholder and document.body.
  useLayoutEffect(() => {
    if (!portalReady || !host) return;
    const target = isFullscreen ? document.body : placeholderRef.current;
    if (!target || host.parentNode === target) return;
    const active = document.activeElement;
    const refocus = active instanceof HTMLElement && host.contains(active) ? active : null;
    target.appendChild(host);
    if (refocus && !refocus.isSameNode(document.activeElement)) {
      refocus.focus({ preventScroll: true });
    }
  }, [portalReady, host, isFullscreen]);

  // Escape exits fullscreen unless something inside already handled the key.
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) setIsFullscreen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setIsFullscreen]);

  const frame = (
    <>
      {isFullscreen ? (
        <div
          aria-hidden='true'
          data-testid={backdropTestId}
          className={BACKDROP_CLASSES}
          onClick={() => setIsFullscreen(false)}
        />
      ) : null}
      <div {...props} ref={ref} className={cn(className, isFullscreen && FULLSCREEN_CLASSES)}>
        {children}
      </div>
    </>
  );

  return (
    <div ref={placeholderRef} data-slot='code-snippet-frame' className={HOST_CLASSES}>
      {portalReady && host ? createPortal(frame, host) : frame}
    </div>
  );
};

ChromeFrame.displayName = 'ChromeFrame';
```
Why it is written this way:
- The backdrop and the root sit in fixed JSX child slots (`{cond ? backdrop : null}` then the root), so the root never changes position and React never remounts it.
- The host is attached from a separate `useLayoutEffect` with deps `[host]`. Under StrictMode's destroy/re-create cycle, the move effect runs after it and appends the host again. The StrictMode test covers this.
- Removing the `refocus.focus(...)` line makes the focus test fail, which shows jsdom blurs on the move just as browsers do.

- [ ] **Step 5: Run the ChromeFrame tests and confirm they pass**

Run: `pnpm vitest run src/components/CodeSnippet/internal/ChromeFrame.test.tsx src/components/CodeSnippet/internal/ChromeFrame.ssr.test.tsx`
Expected: PASS, 2 files and 13 tests.

- [ ] **Step 6: Write the failing Root-level fullscreen tests**

Create `src/components/CodeSnippet/CodeSnippet.fullscreen.test.tsx`:
```tsx
import { createRef, type FC, type Ref, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CodeSnippetActions } from './CodeSnippetActions';
import { CodeSnippetCode } from './CodeSnippetCode';
import { CodeSnippetContent } from './CodeSnippetContent';
import { CodeSnippetFullscreenButton } from './CodeSnippetFullscreenButton';
import { CodeSnippetRoot } from './CodeSnippetRoot';

const Counter: FC = () => {
  const [count, setCount] = useState(0);
  return (
    <button type='button' data-testid='counter' onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
};

const renderSnippet = (ref?: Ref<HTMLDivElement>) =>
  render(
    <div data-testid='parent'>
      <CodeSnippetRoot
        ref={ref}
        code='const a = 1;'
        id='snippet-id'
        data-testid='snippet'
        data-analytics-id='DOCS_SNIPPET'
        className='consumer-class'
      >
        <CodeSnippetActions>
          <Counter />
          <CodeSnippetFullscreenButton />
        </CodeSnippetActions>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </div>,
  );

const enterFullscreen = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId('snippet--fullscreen-button'));
  expect(screen.getByTestId('snippet--fullscreen-button')).toHaveAccessibleName(
    'Exit full screen',
  );
};

describe('CodeSnippet fullscreen', () => {
  it('does not remount children when entering and leaving fullscreen', async () => {
    const user = userEvent.setup();
    renderSnippet();

    await user.click(screen.getByTestId('counter'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');

    await enterFullscreen(user);
    expect(screen.getByTestId('parent')).not.toContainElement(screen.getByTestId('snippet'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');

    await user.click(screen.getByTestId('snippet--fullscreen-button'));
    expect(screen.getByTestId('parent')).toContainElement(screen.getByTestId('snippet'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');
  });

  it('keeps consumer id, data-* attributes, className and ref in fullscreen', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    renderSnippet(ref);

    await enterFullscreen(user);

    const root = screen.getByTestId('snippet');
    expect(root).toHaveAttribute('id', 'snippet-id');
    expect(root).toHaveAttribute('data-analytics-id', 'DOCS_SNIPPET');
    expect(root).toHaveAttribute('data-slot', 'code-snippet');
    expect(root).toHaveClass('consumer-class', 'fixed', 'inset-16', 'z-50');
    expect(ref.current).toBe(root);
  });

  it('exits fullscreen on Escape', async () => {
    const user = userEvent.setup();
    renderSnippet();
    await enterFullscreen(user);

    await user.keyboard('{Escape}');

    expect(screen.getByTestId('snippet--fullscreen-button')).toHaveAccessibleName(
      'Enter full screen',
    );
    expect(screen.getByTestId('snippet')).not.toHaveClass('fixed');
  });

  it('stays in fullscreen when Escape was defaultPrevented by an inner handler', async () => {
    const user = userEvent.setup();
    renderSnippet();
    await enterFullscreen(user);

    const target = screen.getByTestId('counter');
    const preventEscape = (event: KeyboardEvent) => event.preventDefault();
    target.addEventListener('keydown', preventEscape, { capture: true });
    fireEvent.keyDown(target, { key: 'Escape' });
    target.removeEventListener('keydown', preventEscape, { capture: true });

    expect(screen.getByTestId('snippet')).toHaveClass('fixed');
    expect(screen.getByTestId('snippet--fullscreen-button')).toHaveAccessibleName(
      'Exit full screen',
    );
  });

  it('exits fullscreen on backdrop click', async () => {
    const user = userEvent.setup();
    renderSnippet();
    await enterFullscreen(user);

    await user.click(screen.getByTestId('snippet--backdrop'));

    expect(screen.getByTestId('snippet')).not.toHaveClass('fixed');
    expect(screen.queryByTestId('snippet--backdrop')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run the Root tests and confirm they fail**

Run: `pnpm vitest run src/components/CodeSnippet/CodeSnippet.fullscreen.test.tsx --retry 0`
Expected: 4 failed, 1 passed. The passing test is "exits fullscreen on Escape", because today's Root already handles plain Escape. The failures:
- "does not remount children…": the counter resets to `0`.
- "keeps consumer id…": `id` is missing and the ref is detached in fullscreen.
- "stays in fullscreen when Escape was defaultPrevented…": today's listener ignores `defaultPrevented`.
- "exits fullscreen on backdrop click": `snippet--backdrop` is not found.

- [ ] **Step 8: Make `CodeSnippetRoot` use `classes.ts` and `ChromeFrame`**

Edit `src/components/CodeSnippet/CodeSnippetRoot.tsx`. The anchors below are main's line numbers. Task 1 may have shifted them, so match on the quoted text.

a) Imports (main lines 3-4). Replace
```ts
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
```
with
```ts
import type { VariantProps } from 'class-variance-authority';
```
Then add these two imports. Step 12's `biome check --write` puts them in order.
```ts
import { codeSnippetRootVariants } from './classes';
import { ChromeFrame } from './internal/ChromeFrame';
```
Keep `useEffect` in the `react` import, because the highlight effect still uses it.

b) Delete the whole `const codeSnippetRootVariants = cva( … );` block (main lines 21-48, from `const codeSnippetRootVariants = cva(` through the closing `);`). Leave `type CodeSnippetRootVariantProps = VariantProps<typeof codeSnippetRootVariants>;` exactly as it is; it now refers to the imported constant.

c) Destructure `ref` explicitly. Today it travels in `...props` and is dropped in fullscreen. In the parameter list, replace
```ts
  className,
  children,
  'data-testid': testId,
  ...props
}: CodeSnippetRootProps<TLanguage>) => {
```
with
```ts
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}: CodeSnippetRootProps<TLanguage>) => {
```

d) Delete the Root's Escape effect (main lines 152-160). ChromeFrame now owns it, with the `defaultPrevented` check:
```ts
  // Close fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

```

e) Replace the whole `const snippet = ( <div data-slot='code-snippet' … </div> );` declaration (main lines 268-281) with the version below.
- Keep the second child line (ShowMore auto-render) exactly as Task 1 left it. Main has `{maxLines > 0 && !hasExplicitShowMoreButton && <CodeSnippetShowMoreButton />}`; if Task 1 switched it to the `lib/showMore.ts` helper, keep that expression.
- Keep `data-slot` / `data-testid` before `{...props}`. That preserves today's override order, where only `data-slot` could be overridden, because `data-testid` and `className` are destructured.
```tsx
  const snippet = (
    <ChromeFrame
      data-slot='code-snippet'
      data-testid={testId}
      {...props}
      ref={ref}
      className={cn(codeSnippetRootVariants({ size }), className)}
      isFullscreen={isFullscreen}
      setIsFullscreen={setIsFullscreen}
    >
      {children}
      {maxLines > 0 && !hasExplicitShowMoreButton && <CodeSnippetShowMoreButton />}
    </ChromeFrame>
  );
```

f) Inside the `return (…)`, wherever it sits inside the providers after Task 1 (`TestIdProvider` → `CodeSnippetContext.Provider` → possibly `CodeSnippetChromeContext.Provider`), replace the whole ternary
```tsx
        {isFullscreen
          ? createPortal(
              <>
                <div
                  className='fixed inset-0 z-40 backdrop-blur-xs bg-component-dialog-overlay'
                  onClick={() => setIsFullscreen(false)}
                />
                {snippet}
              </>,
              document.body,
            )
          : snippet}
```
with
```tsx
        {snippet}
```
ChromeFrame calls `useTestId('backdrop')` at render time, and `snippet` is rendered inside `TestIdProvider`, so the backdrop gets `${testId}--backdrop`.

- [ ] **Step 9: Run the Root tests and confirm they pass**

Run: `pnpm vitest run src/components/CodeSnippet/CodeSnippet.fullscreen.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 10: Run all existing CodeSnippet tests plus the other stories that use CodeSnippet**

Run: `pnpm vitest run src/components/CodeSnippet src/components/Card src/components/Copyable`
Expected: every file passes, including `CodeSnippet.test.tsx`, `CodeSnippet.nesting.test.tsx`, `InlineCodeSnippet.test.tsx`, `adapters/adapters.test.ts`, `lib/*.test.ts`, whatever Task 1 added, and the 3 new files.

- [ ] **Step 11: Typecheck**

Run: `pnpm exec tsc --build tsconfig.app.json --noEmit`
Expected: exit 0, no output.

- [ ] **Step 12: Lint and format**

Run: `pnpm exec biome check --write src/components/CodeSnippet/classes.ts src/components/CodeSnippet/internal/ChromeFrame.tsx src/components/CodeSnippet/internal/ChromeFrame.test.tsx src/components/CodeSnippet/internal/ChromeFrame.ssr.test.tsx src/components/CodeSnippet/CodeSnippet.fullscreen.test.tsx src/components/CodeSnippet/CodeSnippetRoot.tsx`
Then run the same command without `--write`.
Expected: `No fixes applied`, 0 errors, 0 warnings. `--write` only reorders imports: `./classes` sorts after `./CodeSnippetShowMoreButton`, and `react` sorts first in the test files.

- [ ] **Step 13: Commit**

```bash
git add src/components/CodeSnippet/classes.ts \
  src/components/CodeSnippet/internal/ChromeFrame.tsx \
  src/components/CodeSnippet/internal/ChromeFrame.test.tsx \
  src/components/CodeSnippet/internal/ChromeFrame.ssr.test.tsx \
  src/components/CodeSnippet/CodeSnippet.fullscreen.test.tsx \
  src/components/CodeSnippet/CodeSnippetRoot.tsx
git commit -m "$(cat <<'EOF'
fix(code-snippet): keep subtree, props and ref in fullscreen; respect handled Escape

Move the Root CVA to classes.ts and render the root through a persistent
portal host (internal/ChromeFrame) that is moved between an inline
placeholder and document.body, so entering/leaving fullscreen no longer
remounts children or drops consumer id/data-*/aria-*/ref. Fullscreen
classes are merged into className. The Escape listener now ignores
events whose default was prevented. Backdrop gets a derived
`--backdrop` test id.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: CodeEditor scaffold: deps, public types, engine types, positions, portal registry + outlet, jsdom Range stubs

**Files:**
- Modify: `package.json` (dependencies + devDependencies), `../../pnpm-lock.yaml` (generated by `pnpm install`), `vitest.setup.ts` (append Range stubs; existing mocks stay as they are)
- Create: `src/components/CodeEditor/types.ts`, `src/components/CodeEditor/index.ts`, `src/components/CodeEditor/engine/types.ts`, `src/components/CodeEditor/engine/positions.ts`, `src/components/CodeEditor/lib/portalRegistry.ts`, `src/components/CodeEditor/lib/PortalOutlet.tsx`
- Test: `src/components/CodeEditor/engine/jsdomLayout.test.ts`, `src/components/CodeEditor/engine/positions.test.ts`, `src/components/CodeEditor/lib/portalRegistry.test.ts`, `src/components/CodeEditor/lib/PortalOutlet.test.tsx`

**Interfaces:**
- Consumes:
  - `FoldRegion` from `src/components/CodeSnippet/lib/foldUtils.ts`
  - `LineConfig` from `src/components/CodeSnippet/CodeSnippetContext.ts`
  - `SyntaxAdapter<TLanguage>` from `src/components/CodeSnippet/adapters/types.ts`
  - `Text`, `Line` (type) from `@codemirror/state`
  - `EditorView` (type) from `@codemirror/view`
  - `useSyncExternalStore` from `react`, `createPortal` from `react-dom`
- Produces (exactly as in Shared Interfaces):
  - `types.ts` exports:
    - `CodeEditorLanguage`, `CodeEditorApi`, `CodeEditorPosition`, `CodeEditorDiagnostic`, `CodeEditorCompletion`
    - `CodeEditorHttpContext`, `CodeEditorCompletionContext`, `CodeEditorCompletionSource`
    - `CodeEditorFolds`, `JsonSchema`
  - `engine/types.ts` exports: `EngineOptions`, `EngineCallbacks`, `EditorHandle`
  - `engine/positions.ts`:
    - `offsetToPosition(doc: Text, offset: number, startingLineNumber: number): CodeEditorPosition`
    - `positionToOffset(doc: Text, position: CodeEditorPosition, startingLineNumber: number): number | null`
    - `lineNumberToDocLine(doc: Text, absoluteLine: number, startingLineNumber: number): Line | null`
  - `lib/portalRegistry.ts`: `PortalEntry`, `PortalRegistry`, `createPortalRegistry(): PortalRegistry`
  - `lib/PortalOutlet.tsx`: `PortalOutlet: FC<PortalOutletProps>`
  - Additional export, internal only and not re-exported from `index.ts`: `interface PortalOutletProps { registry: PortalRegistry }`
  - `index.ts` exports only the public types from `types.ts` for now. Components and hooks are added in T9.

Notes:
- Biome already covers the new folder: the root `biome.json` `files.includes` has `"**/src/**/*"` and `"**/packages/**/*.ts(x)"`, so no config change is needed. Step 14 checks this by making sure Biome reports checking the new files.
- `lib/**`, `types.ts` and `index.ts` import `@codemirror/*` only with `import type`, or not at all (Global Constraints).
- `PortalOutlet` renders no DOM element of its own, only portals into hosts the engine owns. That is why it has no `data-slot` and no `ref`.

---

- [ ] **Step 1: Add exact-pinned dependencies**

Edit `package.json`.

In `"devDependencies"`, add `@lezer/generator` right after line 97 (`"@internationalized/date": "3.12.3",`). Old:
```json
    "@internationalized/date": "3.12.3",
    "@rsbuild/core": "catalog:",
```
New:
```json
    "@internationalized/date": "3.12.3",
    "@lezer/generator": "1.8.1",
    "@rsbuild/core": "catalog:",
```

In `"dependencies"`, the `@codemirror/*` block goes after `"@ark-ui/react"` (line 134). Old:
```json
    "@ark-ui/react": "5.38.0",
    "@dnd-kit/core": "6.3.1",
```
New:
```json
    "@ark-ui/react": "5.38.0",
    "@codemirror/autocomplete": "6.20.3",
    "@codemirror/commands": "6.11.1",
    "@codemirror/lang-json": "6.0.2",
    "@codemirror/lang-yaml": "6.1.3",
    "@codemirror/language": "6.12.4",
    "@codemirror/lint": "6.9.7",
    "@codemirror/merge": "6.12.2",
    "@codemirror/search": "6.7.2",
    "@codemirror/state": "6.7.6",
    "@codemirror/view": "6.43.13",
    "@dnd-kit/core": "6.3.1",
```

The `@lezer/*` block goes after `"@dnd-kit/utilities"` (line 137). Old:
```json
    "@dnd-kit/utilities": "3.2.2",
```
New:
```json
    "@dnd-kit/utilities": "3.2.2",
    "@lezer/common": "1.5.3",
    "@lezer/highlight": "1.2.5",
    "@lezer/json": "1.0.3",
    "@lezer/lr": "1.4.10",
```

`json-schema-library` goes between `highlight.js` and `prism-react-renderer` (lines 151-152). Old:
```json
    "highlight.js": "11.11.1",
    "prism-react-renderer": "2.4.1",
```
New:
```json
    "highlight.js": "11.11.1",
    "json-schema-library": "11.6.2",
    "prism-react-renderer": "2.4.1",
```

- [ ] **Step 2: Install and check the resolved versions**

Run from the repo root:
```bash
pnpm install
```
Expected: install finishes and `pnpm-lock.yaml` changes.

Then run from `packages/design-system/`:
```bash
node -e "for (const p of ['@codemirror/state','@codemirror/view','@codemirror/language','@codemirror/commands','@codemirror/search','@codemirror/autocomplete','@codemirror/lint','@codemirror/merge','@codemirror/lang-json','@codemirror/lang-yaml','@lezer/common','@lezer/lr','@lezer/json','@lezer/highlight','@lezer/generator','json-schema-library']) console.log(p, require('./node_modules/'+p+'/package.json').version)"
```
Expected output:
```
@codemirror/state 6.7.6
@codemirror/view 6.43.13
@codemirror/language 6.12.4
@codemirror/commands 6.11.1
@codemirror/search 6.7.2
@codemirror/autocomplete 6.20.3
@codemirror/lint 6.9.7
@codemirror/merge 6.12.2
@codemirror/lang-json 6.0.2
@codemirror/lang-yaml 6.1.3
@lezer/common 1.5.3
@lezer/lr 1.4.10
@lezer/json 1.0.3
@lezer/highlight 1.2.5
@lezer/generator 1.8.1
json-schema-library 11.6.2
```

- [ ] **Step 3: Write the failing jsdom layout test**

Create `src/components/CodeEditor/engine/jsdomLayout.test.ts`:
```ts
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';

describe('jsdom layout stubs (vitest.setup.ts)', () => {
  let parent: HTMLElement | null = null;
  let view: EditorView | null = null;

  afterEach(() => {
    view?.destroy();
    parent?.remove();
    view = null;
    parent = null;
  });

  it('gives Range zero-size client rects', () => {
    const range = document.createRange();
    expect(range.getClientRects()).toHaveLength(0);
    expect([...range.getClientRects()]).toEqual([]);
    expect(range.getBoundingClientRect().width).toBe(0);
    expect(range.getBoundingClientRect().height).toBe(0);
  });

  it('lets CodeMirror measure positions without throwing', () => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    view = new EditorView({ state: EditorState.create({ doc: 'abc\ndef' }), parent });
    const mounted = view;

    expect(() => mounted.coordsAtPos(2)).not.toThrow();
  });
});
```

- [ ] **Step 4: Run it and confirm it fails**

Run: `pnpm vitest run src/components/CodeEditor/engine/jsdomLayout.test.ts`

Expected: FAIL. The output includes `TypeError: range.getClientRects is not a function` and `TypeError: textRange(...).getClientRects is not a function`.

- [ ] **Step 5: Add the Range stubs to `vitest.setup.ts`**

Append this to the end of `vitest.setup.ts`, after the closing `}` of the `visualViewport` block. Leave everything above it unchanged.
```ts

// jsdom does not implement layout on Range. CodeMirror measures text through
// Range#getClientRects / getBoundingClientRect (coordsAtPos, cursor drawing,
// tooltips) and throws "getClientRects is not a function" without them.
// Stub zero-size rects; layout-dependent behaviour is covered by Playwright E2E.
if (typeof document !== 'undefined' && typeof document.createRange === 'function') {
  const emptyRect = (): DOMRect =>
    typeof DOMRect === 'function'
      ? new DOMRect(0, 0, 0, 0)
      : ({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          toJSON: () => ({}),
        } as DOMRect);

  const emptyRectList = (): DOMRectList =>
    ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {
        yield* [] as DOMRect[];
      },
    }) as unknown as DOMRectList;

  const rangePrototype = Object.getPrototypeOf(document.createRange()) as Range;
  if (typeof rangePrototype.getClientRects !== 'function') {
    rangePrototype.getClientRects = emptyRectList;
  }
  if (typeof rangePrototype.getBoundingClientRect !== 'function') {
    rangePrototype.getBoundingClientRect = emptyRect;
  }
}
```

- [ ] **Step 6: Run the layout test and the existing CodeSnippet suite**

Run: `pnpm vitest run src/components/CodeEditor/engine/jsdomLayout.test.ts`
Expected: PASS (2 tests).

Run: `pnpm vitest run src/components/CodeSnippet`
Expected: PASS, the same test count as before the change.

- [ ] **Step 7: Commit deps and jsdom stubs**

```bash
git add package.json ../../pnpm-lock.yaml vitest.setup.ts src/components/CodeEditor/engine/jsdomLayout.test.ts
git commit -m "build(code-editor): add CodeMirror, Lezer and json-schema-library dependencies

Exact-pinned @codemirror/*, @lezer/* and json-schema-library 11.6.2, plus
@lezer/generator as a devDependency. vitest.setup.ts stubs Range rects so
CodeMirror can measure in jsdom.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 8: Write the failing positions test**

Create `src/components/CodeEditor/engine/positions.test.ts`:
```ts
import { Text } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { lineNumberToDocLine, offsetToPosition, positionToOffset } from './positions';

// Offsets: "GET / HTTP/1.1" 0..14, "\n" 14, "Host: a" 15..22, "\n" 22, "" 23, "\n" 23, "{}" 24..26
const doc = Text.of(['GET / HTTP/1.1', 'Host: a', '', '{}']);

describe('offsetToPosition', () => {
  it('maps offsets to 1-based line/column with startingLineNumber 1', () => {
    expect(offsetToPosition(doc, 0, 1)).toEqual({ line: 1, column: 1 });
    expect(offsetToPosition(doc, 4, 1)).toEqual({ line: 1, column: 5 });
    expect(offsetToPosition(doc, 14, 1)).toEqual({ line: 1, column: 15 });
    expect(offsetToPosition(doc, 15, 1)).toEqual({ line: 2, column: 1 });
    expect(offsetToPosition(doc, 23, 1)).toEqual({ line: 3, column: 1 });
    expect(offsetToPosition(doc, 26, 1)).toEqual({ line: 4, column: 3 });
  });

  it('offsets line numbers by startingLineNumber', () => {
    expect(offsetToPosition(doc, 0, 10)).toEqual({ line: 10, column: 1 });
    expect(offsetToPosition(doc, 16, 10)).toEqual({ line: 11, column: 2 });
    expect(offsetToPosition(doc, 25, 10)).toEqual({ line: 13, column: 2 });
  });

  it('clamps offsets outside the document', () => {
    expect(offsetToPosition(doc, -5, 1)).toEqual({ line: 1, column: 1 });
    expect(offsetToPosition(doc, 1000, 1)).toEqual({ line: 4, column: 3 });
  });

  it('handles an empty document', () => {
    expect(offsetToPosition(Text.empty, 0, 7)).toEqual({ line: 7, column: 1 });
  });
});

describe('positionToOffset', () => {
  it('maps absolute line/column to offsets with startingLineNumber 1', () => {
    expect(positionToOffset(doc, { line: 1, column: 1 }, 1)).toBe(0);
    expect(positionToOffset(doc, { line: 2, column: 1 }, 1)).toBe(15);
    expect(positionToOffset(doc, { line: 2, column: 7 }, 1)).toBe(21);
    expect(positionToOffset(doc, { line: 4, column: 2 }, 1)).toBe(25);
  });

  it('respects startingLineNumber 10', () => {
    expect(positionToOffset(doc, { line: 10, column: 1 }, 10)).toBe(0);
    expect(positionToOffset(doc, { line: 11, column: 3 }, 10)).toBe(17);
    expect(positionToOffset(doc, { line: 13, column: 1 }, 10)).toBe(24);
  });

  it('returns null for lines outside the document', () => {
    expect(positionToOffset(doc, { line: 0, column: 1 }, 1)).toBeNull();
    expect(positionToOffset(doc, { line: 5, column: 1 }, 1)).toBeNull();
    expect(positionToOffset(doc, { line: 9, column: 1 }, 10)).toBeNull();
    expect(positionToOffset(doc, { line: 14, column: 1 }, 10)).toBeNull();
  });

  it('clamps the column to the line bounds', () => {
    expect(positionToOffset(doc, { line: 2, column: 0 }, 1)).toBe(15);
    expect(positionToOffset(doc, { line: 2, column: -3 }, 1)).toBe(15);
    expect(positionToOffset(doc, { line: 2, column: 100 }, 1)).toBe(22);
    expect(positionToOffset(doc, { line: 3, column: 5 }, 1)).toBe(23);
  });

  it('round-trips with offsetToPosition', () => {
    for (let offset = 0; offset <= doc.length; offset++) {
      const position = offsetToPosition(doc, offset, 10);
      expect(positionToOffset(doc, position, 10)).toBe(offset);
    }
  });
});

describe('lineNumberToDocLine', () => {
  it('returns the document line for an absolute line number', () => {
    const line = lineNumberToDocLine(doc, 2, 1);
    expect(line?.number).toBe(2);
    expect(line?.text).toBe('Host: a');
    expect(line?.from).toBe(15);
  });

  it('respects startingLineNumber 10', () => {
    expect(lineNumberToDocLine(doc, 10, 10)?.text).toBe('GET / HTTP/1.1');
    expect(lineNumberToDocLine(doc, 13, 10)?.text).toBe('{}');
  });

  it('returns null outside the document', () => {
    expect(lineNumberToDocLine(doc, 0, 1)).toBeNull();
    expect(lineNumberToDocLine(doc, 5, 1)).toBeNull();
    expect(lineNumberToDocLine(doc, 9, 10)).toBeNull();
    expect(lineNumberToDocLine(doc, 14, 10)).toBeNull();
    expect(lineNumberToDocLine(doc, 1.5, 1)).toBeNull();
  });
});
```

- [ ] **Step 9: Run it and confirm it fails**

Run: `pnpm vitest run src/components/CodeEditor/engine/positions.test.ts`

Expected: FAIL with `Failed to resolve import "./positions" from "src/components/CodeEditor/engine/positions.test.ts"`.

- [ ] **Step 10: Create the public types, `index.ts` and positions**

Create `src/components/CodeEditor/types.ts`:
```ts
import type { FoldRegion } from '../CodeSnippet/lib/foldUtils';

/** Language of the document. Passed verbatim to the syntax adapter and selects the structural parser. */
export type CodeEditorLanguage = 'http' | 'json' | 'yaml' | 'bash' | 'text';

/** Imperative handle exposed through `apiRef` and `useCodeEditor()`. */
export interface CodeEditorApi {
  focus(): void;
  getValue(): string;
  /** Replaces the selection, or inserts at the cursor. Undoable. */
  insertText(text: string): void;
  openSearch(): void;
  foldAll(): void;
  unfoldAll(): void;
}

export interface CodeEditorPosition {
  /** Absolute line number (startingLineNumber-based) */
  line: number;
  /** 1-based column */
  column: number;
}

export interface CodeEditorDiagnostic {
  from: CodeEditorPosition;
  /** Defaults to end of `from.line` */
  to?: CodeEditorPosition;
  severity: 'error' | 'warning' | 'info';
  message: string;
  /** 'syntax' | 'schema' for built-ins; free text for consumer diagnostics */
  source?: string;
}

export interface CodeEditorCompletion {
  label: string;
  /** Text to insert; defaults to label */
  apply?: string;
  detail?: string;
  info?: string;
  kind?: 'keyword' | 'property' | 'value' | 'method' | 'header' | 'snippet' | 'text';
}

/** HTTP-specific location of the cursor, present when `language === 'http'`. */
export interface CodeEditorHttpContext {
  section: 'start-line' | 'header-name' | 'header-value' | 'body';
  headerName?: string;
  messageKind: 'request' | 'response';
}

export interface CodeEditorCompletionContext {
  value: string;
  position: CodeEditorPosition;
  lineText: string;
  /** Word being typed before the cursor and where it starts */
  word: { text: string; from: CodeEditorPosition };
  /** true when opened with Ctrl-Space */
  explicit: boolean;
  /** Present when language === 'http' */
  http?: CodeEditorHttpContext;
  /** Present in a JSON document or JSON body: JSON pointer of the cursor location */
  jsonPointer?: string;
}

export type CodeEditorCompletionSource = (
  ctx: CodeEditorCompletionContext,
) => CodeEditorCompletion[] | null | Promise<CodeEditorCompletion[] | null>;

/** Static fold regions, or a function re-run (debounced) after edits. */
export type CodeEditorFolds =
  | FoldRegion[]
  | ((value: string, ctx: { startingLineNumber: number }) => FoldRegion[]);

/**
 * JSON Schema document (any draft supported by json-schema-library).
 * Structural on purpose: the engine casts it to json-schema-library's own type,
 * so the public API never depends on that module statically.
 */
export type JsonSchema = Record<string, unknown> | boolean;
```

Create `src/components/CodeEditor/index.ts`:
```ts
export type {
  CodeEditorApi,
  CodeEditorCompletion,
  CodeEditorCompletionContext,
  CodeEditorCompletionSource,
  CodeEditorDiagnostic,
  CodeEditorFolds,
  CodeEditorHttpContext,
  CodeEditorLanguage,
  CodeEditorPosition,
  JsonSchema,
} from './types';
```

Create `src/components/CodeEditor/engine/positions.ts`:
```ts
import type { Line, Text } from '@codemirror/state';
import type { CodeEditorPosition } from '../types';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Converts a document offset into an absolute (startingLineNumber-based) line and 1-based column.
 * Offsets outside the document are clamped to its bounds.
 */
export const offsetToPosition = (
  doc: Text,
  offset: number,
  startingLineNumber: number,
): CodeEditorPosition => {
  const safeOffset = clamp(offset, 0, doc.length);
  const line = doc.lineAt(safeOffset);
  return {
    line: line.number + startingLineNumber - 1,
    column: safeOffset - line.from + 1,
  };
};

/**
 * Returns the document line for an absolute (startingLineNumber-based) line number,
 * or `null` when it is outside the document.
 */
export const lineNumberToDocLine = (
  doc: Text,
  absoluteLine: number,
  startingLineNumber: number,
): Line | null => {
  const docLineNumber = absoluteLine - startingLineNumber + 1;
  if (!Number.isInteger(docLineNumber) || docLineNumber < 1 || docLineNumber > doc.lines) {
    return null;
  }
  return doc.line(docLineNumber);
};

/**
 * Converts an absolute line + 1-based column into a document offset.
 * Returns `null` when the line is outside the document; the column is clamped to
 * `[1, line.length + 1]` (column `line.length + 1` is the end of the line).
 */
export const positionToOffset = (
  doc: Text,
  position: CodeEditorPosition,
  startingLineNumber: number,
): number | null => {
  const line = lineNumberToDocLine(doc, position.line, startingLineNumber);
  if (!line) return null;
  const column = clamp(Math.floor(position.column), 1, line.length + 1);
  return line.from + column - 1;
};
```

- [ ] **Step 11: Run the positions test**

Run: `pnpm vitest run src/components/CodeEditor/engine/positions.test.ts`

Expected: PASS (12 tests).

- [ ] **Step 12: Commit types and positions**

```bash
git add src/components/CodeEditor/types.ts src/components/CodeEditor/index.ts src/components/CodeEditor/engine/positions.ts src/components/CodeEditor/engine/positions.test.ts
git commit -m "feat(code-editor): add public types and position helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 13: Write the failing portal registry and outlet tests**

Create `src/components/CodeEditor/lib/portalRegistry.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest';
import { createPortalRegistry } from './portalRegistry';

const makeHost = () => document.createElement('span');

describe('createPortalRegistry', () => {
  it('starts empty', () => {
    const registry = createPortalRegistry();
    expect(registry.getSnapshot()).toEqual([]);
  });

  it('registers entries with unique increasing ids', () => {
    const registry = createPortalRegistry();
    const hostA = makeHost();
    const hostB = makeHost();

    const a = registry.register(hostA, 'A');
    const b = registry.register(hostB, 'B');

    expect(b).toBeGreaterThan(a);
    expect(registry.getSnapshot()).toEqual([
      { id: a, host: hostA, node: 'A' },
      { id: b, host: hostB, node: 'B' },
    ]);
  });

  it('keeps the snapshot reference stable until a change', () => {
    const registry = createPortalRegistry();
    registry.register(makeHost(), 'A');
    const first = registry.getSnapshot();

    expect(registry.getSnapshot()).toBe(first);

    registry.register(makeHost(), 'B');
    expect(registry.getSnapshot()).not.toBe(first);
    expect(first).toHaveLength(1);
  });

  it('updates the node of an entry', () => {
    const registry = createPortalRegistry();
    const host = makeHost();
    const id = registry.register(host, 'old');

    registry.update(id, 'new');

    expect(registry.getSnapshot()).toEqual([{ id, host, node: 'new' }]);
  });

  it('ignores updates with the same node or an unknown id', () => {
    const registry = createPortalRegistry();
    const id = registry.register(makeHost(), 'same');
    const listener = vi.fn();
    registry.subscribe(listener);
    const before = registry.getSnapshot();

    registry.update(id, 'same');
    registry.update(9999, 'other');

    expect(listener).not.toHaveBeenCalled();
    expect(registry.getSnapshot()).toBe(before);
  });

  it('unregisters entries and ignores unknown ids', () => {
    const registry = createPortalRegistry();
    const a = registry.register(makeHost(), 'A');
    const hostB = makeHost();
    const b = registry.register(hostB, 'B');
    const listener = vi.fn();
    registry.subscribe(listener);

    registry.unregister(a);
    expect(registry.getSnapshot()).toEqual([{ id: b, host: hostB, node: 'B' }]);
    expect(listener).toHaveBeenCalledTimes(1);

    registry.unregister(a);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies subscribers on every change and stops after unsubscribe', () => {
    const registry = createPortalRegistry();
    const listener = vi.fn();
    const unsubscribe = registry.subscribe(listener);

    const id = registry.register(makeHost(), 'A');
    registry.update(id, 'B');
    registry.unregister(id);
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    registry.register(makeHost(), 'C');
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('does not reuse ids after unregister', () => {
    const registry = createPortalRegistry();
    const a = registry.register(makeHost(), 'A');
    registry.unregister(a);
    const b = registry.register(makeHost(), 'B');
    expect(b).not.toBe(a);
  });
});
```

Create `src/components/CodeEditor/lib/PortalOutlet.test.tsx`:
```tsx
import { createContext, useContext } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PortalOutlet } from './PortalOutlet';
import { createPortalRegistry, type PortalRegistry } from './portalRegistry';

const LabelContext = createContext('none');
const ContextLabel = () => <span data-testid='context-label'>{useContext(LabelContext)}</span>;

describe('PortalOutlet', () => {
  let registry: PortalRegistry;
  let host: HTMLElement;

  beforeEach(() => {
    registry = createPortalRegistry();
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    cleanup();
    host.remove();
  });

  it('renders registered nodes into their detached hosts', () => {
    render(<PortalOutlet registry={registry} />);

    act(() => {
      registry.register(host, <span data-testid='portal-node'>hello</span>);
    });

    const node = screen.getByTestId('portal-node');
    expect(node).toHaveTextContent('hello');
    expect(host).toContainElement(node);
  });

  it('renders entries registered before mount', () => {
    registry.register(host, <span data-testid='early-node'>early</span>);

    render(<PortalOutlet registry={registry} />);

    expect(host).toContainElement(screen.getByTestId('early-node'));
  });

  it('re-renders when an entry is updated', () => {
    render(<PortalOutlet registry={registry} />);
    let id = 0;
    act(() => {
      id = registry.register(host, <span data-testid='portal-node'>one</span>);
    });

    act(() => {
      registry.update(id, <span data-testid='portal-node'>two</span>);
    });

    expect(screen.getByTestId('portal-node')).toHaveTextContent('two');
  });

  it('removes the node when an entry is unregistered', () => {
    render(<PortalOutlet registry={registry} />);
    let id = 0;
    act(() => {
      id = registry.register(host, <span data-testid='portal-node'>bye</span>);
    });

    act(() => {
      registry.unregister(id);
    });

    expect(screen.queryByTestId('portal-node')).not.toBeInTheDocument();
    expect(host).toBeEmptyDOMElement();
  });

  it('keeps React context from where the outlet is rendered', () => {
    render(
      <LabelContext.Provider value='from-outlet'>
        <PortalOutlet registry={registry} />
      </LabelContext.Provider>,
    );

    act(() => {
      registry.register(host, <ContextLabel />);
    });

    expect(screen.getByTestId('context-label')).toHaveTextContent('from-outlet');
  });

  it('renders several hosts independently', () => {
    const second = document.createElement('div');
    document.body.appendChild(second);
    render(<PortalOutlet registry={registry} />);

    act(() => {
      registry.register(host, <span data-testid='first-node'>1</span>);
      registry.register(second, <span data-testid='second-node'>2</span>);
    });

    expect(host).toContainElement(screen.getByTestId('first-node'));
    expect(second).toContainElement(screen.getByTestId('second-node'));
    second.remove();
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/lib`

Expected: FAIL. Both files report `Failed to resolve import "./portalRegistry"` (or `"./PortalOutlet"`).

- [ ] **Step 14: Implement the registry, the outlet and the engine types**

Create `src/components/CodeEditor/lib/portalRegistry.ts`:
```ts
import type { ReactNode } from 'react';

/** A React node to render into a DOM host owned by the editor engine (gutter marker, widget, panel). */
export interface PortalEntry {
  id: number;
  host: HTMLElement;
  node: ReactNode;
}

/**
 * External store connecting plain-DOM CodeMirror extensions to React.
 * The engine registers `(host, node)` pairs; `PortalOutlet` renders each one with `createPortal`.
 */
export interface PortalRegistry {
  register(host: HTMLElement, node: ReactNode): number;
  update(id: number, node: ReactNode): void;
  unregister(id: number): void;
  subscribe(listener: () => void): () => void;
  /** Stable reference until a change */
  getSnapshot(): readonly PortalEntry[];
}

export const createPortalRegistry = (): PortalRegistry => {
  let nextId = 1;
  let entries: readonly PortalEntry[] = [];
  const listeners = new Set<() => void>();

  const emit = (next: readonly PortalEntry[]) => {
    entries = next;
    for (const listener of [...listeners]) listener();
  };

  return {
    register(host, node) {
      const id = nextId++;
      emit([...entries, { id, host, node }]);
      return id;
    },
    update(id, node) {
      const current = entries.find(entry => entry.id === id);
      if (!current || current.node === node) return;
      emit(entries.map(entry => (entry.id === id ? { ...entry, node } : entry)));
    },
    unregister(id) {
      if (!entries.some(entry => entry.id === id)) return;
      emit(entries.filter(entry => entry.id !== id));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return entries;
    },
  };
};
```

Create `src/components/CodeEditor/lib/PortalOutlet.tsx`:
```tsx
import type { FC } from 'react';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { PortalRegistry } from './portalRegistry';

export interface PortalOutletProps {
  registry: PortalRegistry;
}

/**
 * Renders every registry entry into its engine-owned host with `createPortal`.
 * Renders no DOM of its own (so no `data-slot`); portals keep React context,
 * so DS components inside hosts see the surrounding providers.
 */
export const PortalOutlet: FC<PortalOutletProps> = ({ registry }) => {
  const entries = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  );

  return <>{entries.map(entry => createPortal(entry.node, entry.host, String(entry.id)))}</>;
};

PortalOutlet.displayName = 'PortalOutlet';
```

Create `src/components/CodeEditor/engine/types.ts`:
```ts
import type { EditorView } from '@codemirror/view';
import type { SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import type { PortalRegistry } from '../lib/portalRegistry';
import type {
  CodeEditorApi,
  CodeEditorCompletionSource,
  CodeEditorDiagnostic,
  CodeEditorFolds,
  CodeEditorLanguage,
  JsonSchema,
} from '../types';

/** Everything the engine needs to build or reconfigure an editor. Plain data, no CM types. */
export interface EngineOptions {
  value: string;
  documentId: string | undefined;
  language: CodeEditorLanguage;
  readOnly: boolean;
  wrapLines: boolean;
  startingLineNumber: number;
  lineNumbers: boolean;
  lines: Record<number, LineConfig>;
  folds: CodeEditorFolds | undefined;
  adapter: SyntaxAdapter<string>;
  original: string | undefined;
  schema: JsonSchema | undefined;
  completions: readonly CodeEditorCompletionSource[];
  diagnostics: readonly CodeEditorDiagnostic[];
  contentAttributes: Record<string, string>;
  /** Root data-testid base; engine derives `${testId}--editor`, `--gutter`, `--search`, `--fold-toggle`, `--fold-summary` */
  testId: string | undefined;
  cspNonce: string | undefined;
  /** px, null = no clamp */
  maxHeight: number | null;
}

/** Callbacks from the engine back into React. */
export interface EngineCallbacks {
  onChange: (value: string) => void;
  onDiagnosticsChange: (diagnostics: CodeEditorDiagnostic[]) => void;
  onVisibleRowCountChange: (rows: number) => void;
  portals: PortalRegistry;
}

/** Returned by `createEditor()`. */
export interface EditorHandle {
  /** Compares with previous options, reconfigures changed compartments, syncs value/documentId */
  update: (options: EngineOptions) => void;
  api: CodeEditorApi;
  /** For tests only */
  view: EditorView;
  destroy: () => void;
}
```

- [ ] **Step 15: Run all CodeEditor and CodeSnippet tests, typecheck and lint**

Run: `pnpm vitest run src/components/CodeEditor`
Expected: PASS. 4 files and 28 tests: jsdomLayout 2, positions 12, portalRegistry 8, PortalOutlet 6.

Run: `pnpm vitest run src/components/CodeSnippet`
Expected: PASS, the same count as before.

Run: `pnpm exec tsc --build tsconfig.app.json --noEmit`
Expected: exits 0 with no output. `types.ts`, `index.ts`, `engine/types.ts`, `engine/positions.ts` and `lib/*` compile, and `@codemirror/view` / `@codemirror/state` resolve.

Run: `pnpm exec biome check src/components/CodeEditor vitest.setup.ts`
- Expected: `Checked 11 files ... No fixes applied.` with no errors. The file count confirms the root `biome.json` `"**/src/**/*"` include covers the new folder, so the config needs no change.
- If it reports only import-order or format fixes: run `pnpm exec biome check --write src/components/CodeEditor vitest.setup.ts`, then run the check again.

Guard for the static-import rule. From `packages/design-system/` run:
```bash
grep -nE "^import (\{|[A-Za-z])" src/components/CodeEditor/types.ts src/components/CodeEditor/index.ts src/components/CodeEditor/lib/*.ts src/components/CodeEditor/lib/*.tsx | grep -E "@codemirror|@lezer|json-schema-library|/engine" ; echo "exit=$?"
```
Expected: `exit=1`. No match means `types.ts`, `index.ts` and `lib/**` have no value imports of `@codemirror/*`, `@lezer/*`, `json-schema-library` or `engine/`.

- [ ] **Step 16: Commit the portal registry, the outlet and the engine types**

```bash
git add src/components/CodeEditor/lib/portalRegistry.ts src/components/CodeEditor/lib/portalRegistry.test.ts src/components/CodeEditor/lib/PortalOutlet.tsx src/components/CodeEditor/lib/PortalOutlet.test.tsx src/components/CodeEditor/engine/types.ts
git commit -m "feat(code-editor): add portal registry, PortalOutlet and engine types

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Languages: HTTP Lezer grammar, parseMixed JSON body, json/yaml, languageExtension, httpContextAt, findJsonBodyRange

**Files:**
- Create: `src/components/CodeEditor/engine/languages/http/http.grammar`
- Create (generated by `pnpm generate:grammars`, committed): `src/components/CodeEditor/engine/languages/http/parser.ts`, `src/components/CodeEditor/engine/languages/http/parser.terms.ts`
- Create: `src/components/CodeEditor/engine/languages/http/index.ts`
- Create: `src/components/CodeEditor/engine/languages/json.ts`
- Create: `src/components/CodeEditor/engine/languages/yaml.ts`
- Create: `src/components/CodeEditor/engine/languages/index.ts`
- Modify: `package.json` (adds the `generate:grammars` script)
- Modify: `../../biome.json` (repo root; tells Biome to skip the generated parser files)
- Test: `src/components/CodeEditor/engine/languages/http/grammar.test.ts` (stale-parser check and tree shapes)
- Test: `src/components/CodeEditor/engine/languages/http/http.test.ts` (JSON mounting and `findJsonBodyRange`)
- Test: `src/components/CodeEditor/engine/languages/http/httpContext.test.ts` (`httpContextAt`)
- Test: `src/components/CodeEditor/engine/languages/languages.test.ts` (`languageExtension`, folds turned off for JSON and YAML)

**Interfaces:**

Consumes:
- From Task 3, these dependencies must be installed: `@codemirror/state@6.7.6`, `@codemirror/language@6.12.4`, `@codemirror/lang-json@6.0.2`, `@codemirror/lang-yaml@6.1.3`, `@lezer/common@1.5.3`, `@lezer/lr@1.4.10`, and the devDependency `@lezer/generator@1.8.1`.
- From Task 3, `src/components/CodeEditor/types.ts` must export `CodeEditorLanguage` and `CodeEditorHttpContext`, exactly as in Shared Interfaces.

Produces. These are the Shared Interfaces signatures, unchanged:
```ts
// engine/languages/index.ts
export const languageExtension: (language: CodeEditorLanguage) => Extension; // http/json/yaml → LanguageSupport; bash/text → []
export { findJsonBodyRange, http, httpContextAt, httpLanguage } from './http'; // re-export for convenience
// engine/languages/http/index.ts
export const httpLanguage: LRLanguage;
export const http: () => LanguageSupport;
export const findJsonBodyRange: (state: EditorState) => { from: number; to: number } | null; // mounted JsonText range; null if state is not HTTP / no JSON body
export const httpContextAt: (state: EditorState, pos: number) => CodeEditorHttpContext | undefined; // undefined if state's language is not httpLanguage
```
It also adds these internal exports. They are not public and are used only inside `engine/`:
```ts
// engine/languages/json.ts
export const jsonEditorLanguage: LRLanguage;   // jsonLanguage.configure(...) with Object/Array folds off; same language-data facet as jsonLanguage, so jsonLanguage.isActiveAt() works (also inside HTTP bodies)
export const json: () => LanguageSupport;
// engine/languages/yaml.ts
export const yamlEditorLanguage: LRLanguage;   // yamlLanguage with syntax folds off
export const yaml: () => LanguageSupport;
// engine/languages/http/parser.ts (generated)
export const parser: LRParser;
// engine/languages/http/parser.terms.ts (generated)
export const Message = 1, StartLine = 2, RequestLine = 3, Method = 4, Target = 5, Version = 6, StatusLine = 7, StatusCode = 8, ReasonPhrase = 9, StartLineText = 10, Header = 11, HeaderName = 12, HeaderValue = 13, BlankLine = 14, Body = 15;
```
Semantics that later tasks rely on:
- **Tree shape.** The node types are `Message > StartLine > RequestLine | StatusLine | StartLineText`, then `Header > HeaderName, HeaderValue`, then `BlankLine?`, then `Body`. When the body is JSON, the `Body` node is replaced by a mounted `JsonText` node with the same range.
- **`HeaderValue` range.** It starts right after the `:` and includes the leading space.
- **`httpContextAt` is line-based.** It does not wait for the parse.
  - Line 1 is `start-line`.
  - Any line after the first blank line (empty, or only spaces and tabs) that follows line 1 is `body`.
  - On any other line, the position is `header-name` up to and including the colon's column, and `header-value` after it.
  - `headerName` is the text before the colon, trimmed, in its original case. Callers lowercase it.
  - The blank separator line itself counts as `header-name`.
  - `messageKind` is `'response'` if and only if line 1 starts with `HTTP/`.
- **`findJsonBodyRange` may force parsing.** It calls `ensureSyntaxTree(state, doc.length, 200)`, so it may spend up to 200 ms parsing, then falls back to `syntaxTree(state)`.
- **Syntax folds are off everywhere.** `foldable()` returns `null` for every line in `json`, `yaml` and HTTP JSON bodies. Folds come only from the `folds` prop (Task 8).
- **No highlighting here.** No language adds `syntaxHighlighting` or style tags. Colours come from the adapter painter (Task 6).

---

- [ ] **Step 1: Check the Task 3 dependencies**

Run from `packages/design-system/`:
```bash
pnpm ls @lezer/generator @lezer/common @lezer/lr @codemirror/language @codemirror/lang-json @codemirror/lang-yaml @codemirror/state
pnpm exec lezer-generator --help
```
Expected: all seven packages are listed at the pinned versions, and the usage line `lezer-generator [--cjs] [--names] [--noTerms] [--typeScript] [--output outfile] [--export name] file` is printed. If a package is missing, Task 3 is incomplete: stop and finish Task 3 first.

- [ ] **Step 2: Write the failing grammar test (stale check and tree shapes)**

Create `src/components/CodeEditor/engine/languages/http/grammar.test.ts`:
```ts
import { buildParserFile } from '@lezer/generator';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parser } from './parser';

const dir = dirname(fileURLToPath(import.meta.url));
const read = (name: string): string => readFileSync(join(dir, name), 'utf8');
const shape = (doc: string): string => parser.parse(doc).toString();

describe('http.grammar', () => {
  it('committed parser.ts / parser.terms.ts are up to date (run `pnpm generate:grammars`)', () => {
    const built = buildParserFile(read('http.grammar'), {
      fileName: 'http.grammar',
      typeScript: true,
    });
    expect(read('parser.ts')).toBe(built.parser);
    expect(read('parser.terms.ts')).toBe(built.terms);
  });

  it('parses a request line with method, target and version', () => {
    expect(shape('GET /api/users?id=1 HTTP/1.1')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)))',
    );
  });

  it('parses a request line without version and a custom method', () => {
    expect(shape('M-SEARCH *')).toBe('Message(StartLine(RequestLine(Method,Target)))');
  });

  it('parses a status line with and without reason phrase', () => {
    expect(shape('HTTP/1.1 404 Not Found')).toBe(
      'Message(StartLine(StatusLine(Version,StatusCode,ReasonPhrase)))',
    );
    expect(shape('HTTP/2 204')).toBe('Message(StartLine(StatusLine(Version,StatusCode)))');
  });

  it('keeps a StartLine for garbage, lowercase and empty first lines', () => {
    expect(shape('hello world\nA: b')).toBe(
      'Message(StartLine(StartLineText),Header(HeaderName,HeaderValue))',
    );
    expect(shape('get /x HTTP/1.1')).toBe('Message(StartLine(StartLineText))');
    expect(shape('\nA: b')).toBe('Message(StartLine,Header(HeaderName,HeaderValue))');
    expect(shape('')).toBe('Message(StartLine)');
  });

  it('parses headers, including empty values, missing colons and continuation lines', () => {
    expect(shape('GET / HTTP/1.1\nHost: example.com\nX-Empty:\nbroken\n  continued')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)),' +
        'Header(HeaderName,HeaderValue),Header(HeaderName),Header(HeaderName),Header(HeaderName))',
    );
  });

  it('has no body without a blank line, or when nothing follows the blank line', () => {
    expect(shape('GET / HTTP/1.1\nHost: x')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)),Header(HeaderName,HeaderValue))',
    );
    expect(shape('GET / HTTP/1.1\nHost: x\n')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)),Header(HeaderName,HeaderValue))',
    );
    expect(shape('GET / HTTP/1.1\nHost: x\n\n')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)),Header(HeaderName,HeaderValue))',
    );
  });

  it('treats a spaces/tabs-only line after line 1 as the blank separator', () => {
    expect(shape('GET /\nA: b\n \t \nbody')).toBe(
      'Message(StartLine(RequestLine(Method,Target)),Header(HeaderName,HeaderValue),BlankLine,Body)',
    );
  });

  it('keeps blank lines inside the body as one Body node reaching the end of the document', () => {
    const doc = 'POST / HTTP/1.1\nA: b\n\nline 1\n\n\nline 4\n';
    const tree = parser.parse(doc);
    const body = tree.topNode.getChild('Body');
    expect(body?.from).toBe(doc.indexOf('line 1'));
    expect(body?.to).toBe(doc.length);
  });

  it('parses without error nodes for typical messages', () => {
    const docs = [
      'POST /api HTTP/1.1\nContent-Type: application/json; charset=utf-8\n\n{"a": 1}',
      'HTTP/1.1 200 OK\nContent-Type: text/plain\n\nhello\n\nworld',
      'GET / HTTP/2\n:authority: example.com\n\n',
    ];
    for (const doc of docs) {
      expect(shape(doc)).not.toContain('⚠');
    }
  });
});
```

- [ ] **Step 3: Run the test and confirm it fails**

```bash
pnpm vitest run src/components/CodeEditor/engine/languages/http/grammar.test.ts
```
Expected: FAIL with `Failed to resolve import "./parser"`, because the file does not exist yet.

- [ ] **Step 4: Write the grammar**

Create `src/components/CodeEditor/engine/languages/http/http.grammar`. This grammar was compiled with `@lezer/generator@1.8.1` and tested against every input in Steps 2, 7 and 10:
```
// HTTP/1.x message grammar for CodeEditor (spec §7.4).
// Structure only: colours come from the SyntaxAdapter painter, not from this grammar.
// Line rules mirror CodeSnippet's getHttpFolds (lib/httpFolds.ts):
//   - line 1 is always the start line, whatever it contains;
//   - the first line after line 1 that is empty or only spaces/tabs separates headers from body;
//   - Body is the rest of the document, blank lines included.
// Regenerate with `pnpm generate:grammars` after editing; parser.ts and parser.terms.ts are committed.

@top Message {
  StartLine (nl Header)* (nl BlankLine? (nl Body?)?)?
}

// Tolerant: an empty or unrecognised first line still produces a StartLine node.
StartLine { (RequestLine | StatusLine | StartLineText)? }

RequestLine { Method sp Target (sp Version)? sp? }

StatusLine { Version sp StatusCode (sp ReasonPhrase?)? }

BlankLine { hws }

// Leading whitespace (obs-fold continuation) and missing colons stay inside Header.
Header { hws? (HeaderName (":" HeaderValue?)? | ":" HeaderValue?) }

@tokens {
  nl { "\n" }
  sp { $[ \t]+ }
  hws { $[ \t]+ }
  Method { $[A-Z] $[A-Z_\-]* }
  Target { ![ \t\n]+ }
  Version { "HTTP/" ![ \t\n]* }
  StatusCode { ![ \t\n]+ }
  ReasonPhrase { ![\n]+ }
  StartLineText { ![\n]+ }
  HeaderName { ![:\n]+ }
  HeaderValue { ![\n]+ }
  Body { ![]+ }
  @precedence { Version, Method, StartLineText }
  @precedence { hws, HeaderName }
}
```
Design notes. They are already covered by the tests, so there is nothing more to do here:
- Lezer tokenizes by parser state. Tokens that would conflict (`Target`/`StatusCode`/`StartLineText`, and `HeaderName`/`HeaderValue`/`Body`) are never valid in the same state.
- `@precedence { hws, HeaderName }` makes a leading-whitespace run lex as `hws`. The parser then decides between a `BlankLine` (the next token is `nl` or end of file) and a continuation `Header`.
- CodeMirror normalizes CRLF to `\n`, so `\r` never reaches the parser.

- [ ] **Step 5: Add the generate script and the Biome ignore for generated files**

Modify `package.json`. At line 73, change this:
```json
    "generate-exports": "tsx scripts/generate-exports.ts",
```
to this:
```json
    "generate-exports": "tsx scripts/generate-exports.ts",
    "generate:grammars": "lezer-generator src/components/CodeEditor/engine/languages/http/http.grammar -o src/components/CodeEditor/engine/languages/http/parser.ts --typeScript",
```
With `-o parser.ts --typeScript`, the CLI writes both `parser.ts` and `parser.terms.ts`.

Modify `../../biome.json` (repo root). Without this, Biome would reformat the generated code: it swaps quotes, wraps lines and adds semicolons, and the stale test would then fail. At line 21, change this:
```json
      "!**/*.gen.ts",
```
to this:
```json
      "!**/*.gen.ts",
      "!**/CodeEditor/engine/languages/http/parser.ts",
      "!**/CodeEditor/engine/languages/http/parser.terms.ts",
```
The `.grammar` file needs no entry. Biome already skips unknown file types under `src/`, as it does today for `.md` and `.mdx`.

- [ ] **Step 6: Generate the parser**

```bash
pnpm generate:grammars
```
Expected output: `Wrote src/components/CodeEditor/engine/languages/http/parser.ts and src/components/CodeEditor/engine/languages/http/parser.terms.ts`.
- `parser.ts` must start with `// This file was generated by lezer-generator. You probably shouldn't edit it.` followed by `import {LRParser} from "@lezer/lr"`.
- `parser.terms.ts` must export `Message = 1` through `Body = 15`, as listed in Interfaces.
- Never edit either file by hand.

- [ ] **Step 7: Run the grammar test and confirm it passes**

```bash
pnpm vitest run src/components/CodeEditor/engine/languages/http/grammar.test.ts
```
Expected: PASS (10 tests).

- [ ] **Step 8: Commit the grammar**

```bash
git add src/components/CodeEditor/engine/languages/http/http.grammar \
  src/components/CodeEditor/engine/languages/http/parser.ts \
  src/components/CodeEditor/engine/languages/http/parser.terms.ts \
  src/components/CodeEditor/engine/languages/http/grammar.test.ts \
  package.json ../../biome.json
git commit -m "$(cat <<'EOF'
feat(code-editor): add HTTP Lezer grammar with generated parser

Adds generate:grammars script; generated parser is committed, ignored by
Biome, and guarded by a stale-parser unit test.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 9: Write the failing HTTP language test (JSON mounting and `findJsonBodyRange`)**

Create `src/components/CodeEditor/engine/languages/http/http.test.ts`:
```ts
import { jsonLanguage } from '@codemirror/lang-json';
import { ensureSyntaxTree, foldable, syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { json } from '../json';
import { findJsonBodyRange, http } from './index';

const createState = (doc: string): EditorState => {
  const state = EditorState.create({ doc, extensions: [http()] });
  ensureSyntaxTree(state, state.doc.length, 5000);
  return state;
};

const shape = (state: EditorState): string =>
  (ensureSyntaxTree(state, state.doc.length, 5000) ?? syntaxTree(state)).toString();

const JSON_REQUEST = [
  'POST /api/users HTTP/1.1',
  'Host: api.example.com',
  'Content-Type: application/json; charset=utf-8',
  '',
  '{',
  '  "name": "Ann",',
  '',
  '  "tags": [true, null]',
  '}',
].join('\n');

describe('http language', () => {
  it('builds the message tree through the CodeMirror language', () => {
    const state = createState('HTTP/1.1 200 OK\nContent-Type: text/plain\n\nhello');
    expect(shape(state)).toBe(
      'Message(StartLine(StatusLine(Version,StatusCode,ReasonPhrase)),' +
        'Header(HeaderName,HeaderValue),Body)',
    );
  });

  it('mounts JSON on the body for a json Content-Type with parameters', () => {
    const tree = shape(createState(JSON_REQUEST));
    expect(tree).toContain('JsonText(Object(');
    expect(tree).not.toContain('Body');
  });

  it('keeps blank lines inside a JSON body inside the JSON tree', () => {
    const state = createState(JSON_REQUEST);
    const range = findJsonBodyRange(state);
    expect(range).toEqual({ from: JSON_REQUEST.indexOf('{'), to: JSON_REQUEST.length });
    expect(shape(state)).toContain('Property(PropertyName,":",Array(');
    expect(shape(state)).not.toContain('⚠');
  });

  it('mounts JSON for +json media types', () => {
    const doc =
      'HTTP/1.1 400 Bad Request\nContent-Type: application/problem+json\n\n{"title": "x"}';
    expect(findJsonBodyRange(createState(doc))).toEqual({
      from: doc.indexOf('{'),
      to: doc.length,
    });
  });

  it('sniffs a JSON body when there is no Content-Type header', () => {
    const doc = 'POST /x HTTP/1.1\nHost: a\n\n\n  [1, 2]';
    expect(findJsonBodyRange(createState(doc))).toEqual({
      from: doc.indexOf('\n  ['),
      to: doc.length,
    });
  });

  it('does not mount JSON for text/plain even if the body looks like JSON', () => {
    const state = createState('POST /x HTTP/1.1\nContent-Type: text/plain\n\n{"a": 1}');
    expect(shape(state)).toContain('Body');
    expect(shape(state)).not.toContain('JsonText');
    expect(findJsonBodyRange(state)).toBeNull();
  });

  it('does not mount JSON for a non-JSON body without Content-Type', () => {
    expect(findJsonBodyRange(createState('POST /x HTTP/1.1\n\nname=Ann'))).toBeNull();
  });

  it('returns null without a body and for non-HTTP states', () => {
    expect(findJsonBodyRange(createState('GET / HTTP/1.1\nAccept: application/json'))).toBeNull();
    const jsonState = EditorState.create({ doc: '{"a": 1}', extensions: [json()] });
    expect(findJsonBodyRange(jsonState)).toBeNull();
  });

  it('re-evaluates the mount when the Content-Type header changes', () => {
    const doc = 'POST /x HTTP/1.1\nContent-Type: text/plain\n\n{"a": 1}';
    const plain = createState(doc);
    expect(findJsonBodyRange(plain)).toBeNull();
    const from = doc.indexOf('text/plain');
    const toJson = plain.update({
      changes: { from, to: from + 'text/plain'.length, insert: 'application/json' },
    }).state;
    expect(findJsonBodyRange(toJson)).not.toBeNull();
    const backFrom = toJson.doc.toString().indexOf('application/json');
    const back = toJson.update({
      changes: { from: backFrom, to: backFrom + 'application/json'.length, insert: 'text/html' },
    }).state;
    expect(findJsonBodyRange(back)).toBeNull();
  });

  it('follows edits inside the JSON body', () => {
    const state = createState(JSON_REQUEST);
    const next = state.update({ changes: { from: state.doc.length, insert: '\n' } }).state;
    expect(findJsonBodyRange(next)).toEqual({
      from: JSON_REQUEST.indexOf('{'),
      to: JSON_REQUEST.length + 1,
    });
  });

  it('exposes JSON language data inside the body only', () => {
    const state = createState(JSON_REQUEST);
    expect(jsonLanguage.isActiveAt(state, JSON_REQUEST.indexOf('"name"'))).toBe(true);
    expect(jsonLanguage.isActiveAt(state, JSON_REQUEST.indexOf('Host'))).toBe(false);
  });

  it('offers no syntax folds for the JSON body', () => {
    const state = createState(JSON_REQUEST);
    const line = state.doc.line(5); // "{"
    expect(foldable(state, line.from, line.to)).toBeNull();
  });
});
```

- [ ] **Step 10: Write the failing `httpContextAt` test**

Create `src/components/CodeEditor/engine/languages/http/httpContext.test.ts`:
```ts
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { json } from '../json';
import { http, httpContextAt } from './index';

const REQUEST = [
  'POST /api HTTP/1.1',
  'Host: example.com',
  'Content-Type: application/json',
  '',
  '{',
  '',
  '  "a": 1',
  '}',
].join('\n');

const RESPONSE = 'HTTP/1.1 200 OK\nContent-Type: text/plain\n\nok';

const createState = (doc: string): EditorState => EditorState.create({ doc, extensions: [http()] });

/** Offset of `needle` in `doc` plus `delta`. */
const at = (doc: string, needle: string, delta = 0): number => doc.indexOf(needle) + delta;

describe('httpContextAt', () => {
  const state = createState(REQUEST);

  it('reports the start line anywhere on line 1', () => {
    expect(httpContextAt(state, 0)).toEqual({ section: 'start-line', messageKind: 'request' });
    expect(httpContextAt(state, at(REQUEST, 'HTTP/1.1'))).toEqual({
      section: 'start-line',
      messageKind: 'request',
    });
  });

  it('reports header-name up to and including the colon position', () => {
    expect(httpContextAt(state, at(REQUEST, 'Host'))).toEqual({
      section: 'header-name',
      messageKind: 'request',
    });
    expect(httpContextAt(state, at(REQUEST, 'Host:', 4))).toEqual({
      section: 'header-name',
      messageKind: 'request',
    });
  });

  it('reports header-value with the trimmed header name after the colon', () => {
    expect(httpContextAt(state, at(REQUEST, 'Host:', 5))).toEqual({
      section: 'header-value',
      headerName: 'Host',
      messageKind: 'request',
    });
    expect(httpContextAt(state, at(REQUEST, 'application/json', 3))).toEqual({
      section: 'header-value',
      headerName: 'Content-Type',
      messageKind: 'request',
    });
  });

  it('treats a header line without a colon, and the blank separator, as header-name', () => {
    const doc = 'GET / HTTP/1.1\nAcc';
    expect(httpContextAt(createState(doc), doc.length)).toEqual({
      section: 'header-name',
      messageKind: 'request',
    });
    expect(httpContextAt(state, at(REQUEST, '\n\n{', 1))).toEqual({
      section: 'header-name',
      messageKind: 'request',
    });
  });

  it('reports body after the separator, including blank lines inside the body', () => {
    expect(httpContextAt(state, at(REQUEST, '{'))).toEqual({
      section: 'body',
      messageKind: 'request',
    });
    expect(httpContextAt(state, at(REQUEST, '{\n', 2))).toEqual({
      section: 'body',
      messageKind: 'request',
    });
    expect(httpContextAt(state, REQUEST.length)).toEqual({
      section: 'body',
      messageKind: 'request',
    });
  });

  it('uses a spaces/tabs-only line as the separator', () => {
    const doc = 'GET /\nA: b\n \t\nx: y';
    expect(httpContextAt(createState(doc), doc.length)).toEqual({
      section: 'body',
      messageKind: 'request',
    });
  });

  it('reports messageKind response for a status line', () => {
    const response = createState(RESPONSE);
    expect(httpContextAt(response, 0)).toEqual({ section: 'start-line', messageKind: 'response' });
    expect(httpContextAt(response, at(RESPONSE, 'text/plain'))).toEqual({
      section: 'header-value',
      headerName: 'Content-Type',
      messageKind: 'response',
    });
    expect(httpContextAt(response, RESPONSE.length)).toEqual({
      section: 'body',
      messageKind: 'response',
    });
  });

  it('returns undefined for a non-HTTP state', () => {
    const jsonState = EditorState.create({ doc: '{"a": 1}', extensions: [json()] });
    expect(httpContextAt(jsonState, 1)).toBeUndefined();
    expect(httpContextAt(EditorState.create({ doc: 'GET /' }), 0)).toBeUndefined();
  });
});
```

- [ ] **Step 11: Run both tests and confirm they fail**

```bash
pnpm vitest run src/components/CodeEditor/engine/languages/http/http.test.ts src/components/CodeEditor/engine/languages/http/httpContext.test.ts
```
Expected: both files FAIL with `Failed to resolve import "../json"` or `"./index"`.

- [ ] **Step 12: Implement `json.ts` (JSON with syntax folds off)**

Create `src/components/CodeEditor/engine/languages/json.ts`:
```ts
import { jsonLanguage } from '@codemirror/lang-json';
import { foldNodeProp, LanguageSupport, type LRLanguage } from '@codemirror/language';

/**
 * lang-json's JSON language with its Object/Array syntax folds switched off.
 * CodeSnippet folds only what the `folds` prop describes, so CodeEditor does the same (spec §7.4).
 * Indentation, bracket and language data are kept.
 */
export const jsonEditorLanguage: LRLanguage = jsonLanguage.configure({
  props: [foldNodeProp.add({ 'Object Array': () => null })],
});

export const json = (): LanguageSupport => new LanguageSupport(jsonEditorLanguage);
```

- [ ] **Step 13: Implement `http/index.ts` (language, `parseMixed` JSON body, `findJsonBodyRange`, `httpContextAt`)**

Create `src/components/CodeEditor/engine/languages/http/index.ts`:
```ts
import {
  ensureSyntaxTree,
  LanguageSupport,
  LRLanguage,
  language,
  syntaxTree,
} from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import { type Input, parseMixed, type SyntaxNode } from '@lezer/common';
import type { CodeEditorHttpContext } from '../../../types';
import { jsonEditorLanguage } from '../json';
import { parser } from './parser';
import { Body, Header, HeaderName, HeaderValue } from './parser.terms';

/** Same blank-line rule as CodeSnippet's getHttpFolds: empty or spaces/tabs only. */
const BLANK_LINE = /^[ \t]*$/;
const JSON_MEDIA_TYPE = /json/i;
const JSON_START = /^\s*[[{]/;
const RESPONSE_START_LINE = /^HTTP\//;
/** Upper bound for the parse work findJsonBodyRange may force, in ms. */
const ENSURE_TREE_TIMEOUT = 200;

const readNode = (node: SyntaxNode | null, input: Input): string =>
  node ? input.read(node.from, node.to) : '';

/**
 * Decides whether a Body node holds JSON:
 * - the first `Content-Type` header wins; its media type (before `;`) must contain `json`
 *   (`application/json`, `application/problem+json`, `...; charset=utf-8`);
 * - with no `Content-Type` header, the body is sniffed: first non-whitespace char `{` or `[`.
 */
const isJsonBody = (body: SyntaxNode, input: Input): boolean => {
  const message = body.parent;
  if (message) {
    for (const header of message.getChildren(Header)) {
      const name = readNode(header.getChild(HeaderName), input).trim().toLowerCase();
      if (name !== 'content-type') continue;
      const mediaType = readNode(header.getChild(HeaderValue), input).split(';')[0] ?? '';
      return JSON_MEDIA_TYPE.test(mediaType);
    }
  }
  return JSON_START.test(input.read(body.from, body.to));
};

const mountJsonBody = parseMixed((node, input) => {
  if (node.type.id !== Body) return null;
  return isJsonBody(node.node, input) ? { parser: jsonEditorLanguage.parser } : null;
});

/** HTTP/1.x message language: start line, headers, body; JSON bodies get a nested JSON tree. */
export const httpLanguage: LRLanguage = LRLanguage.define({
  name: 'http',
  parser: parser.configure({ wrap: mountJsonBody }),
});

export const http = (): LanguageSupport => new LanguageSupport(httpLanguage);

const isHttpState = (state: EditorState): boolean => state.facet(language) === httpLanguage;

/**
 * Range of the HTTP body that is parsed as JSON (the mounted `JsonText` node), or `null`
 * when the state is not HTTP or the body is absent / not JSON.
 */
export const findJsonBodyRange = (state: EditorState): { from: number; to: number } | null => {
  if (!isHttpState(state)) return null;
  const tree = ensureSyntaxTree(state, state.doc.length, ENSURE_TREE_TIMEOUT) ?? syntaxTree(state);
  for (let child = tree.topNode.firstChild; child; child = child.nextSibling) {
    if (child.name === 'JsonText') return { from: child.from, to: child.to };
  }
  return null;
};

/**
 * Where `pos` sits in an HTTP message. Line-based, with the same rules as the grammar and
 * getHttpFolds, so it is exact even while the tree is still being parsed.
 * Returns `undefined` when the state's language is not HTTP.
 */
export const httpContextAt = (
  state: EditorState,
  pos: number,
): CodeEditorHttpContext | undefined => {
  if (!isHttpState(state)) return undefined;
  const { doc } = state;
  const messageKind = RESPONSE_START_LINE.test(doc.line(1).text) ? 'response' : 'request';
  const line = doc.lineAt(pos);
  if (line.number === 1) return { section: 'start-line', messageKind };
  for (let n = 2; n < line.number; n++) {
    if (BLANK_LINE.test(doc.line(n).text)) return { section: 'body', messageKind };
  }
  const colon = line.text.indexOf(':');
  if (colon < 0 || pos - line.from <= colon) return { section: 'header-name', messageKind };
  return {
    section: 'header-value',
    headerName: line.text.slice(0, colon).trim(),
    messageKind,
  };
};
```
Why this works:
- **The body parser keeps JSON's language data.** It uses `jsonEditorLanguage.parser`, which carries jsonLanguage's `languageDataProp`. So inside the body, indentation, `closeBrackets` data and `jsonLanguage.isActiveAt` all work, and there are no JSON syntax folds.
- **Header edits update the mount.** `parseMixed` runs the nest callback again on every reparse, so changing the `Content-Type` header adds or removes the JSON mount. The test "re-evaluates the mount…" covers this.
- **HTTP nodes need no fold override.** They have no `foldNodeProp` of their own.

- [ ] **Step 14: Run the tests and confirm they pass**

```bash
pnpm vitest run src/components/CodeEditor/engine/languages/http
```
Expected: PASS. That is 3 files: `grammar.test.ts` (10 tests), `http.test.ts` (12 tests) and `httpContext.test.ts` (8 tests).

- [ ] **Step 15: Commit**

```bash
git add src/components/CodeEditor/engine/languages/json.ts \
  src/components/CodeEditor/engine/languages/http/index.ts \
  src/components/CodeEditor/engine/languages/http/http.test.ts \
  src/components/CodeEditor/engine/languages/http/httpContext.test.ts
git commit -m "$(cat <<'EOF'
feat(code-editor): add HTTP language with nested JSON body and context helpers

parseMixed mounts JSON on the body for json/+json Content-Type (params
allowed) or a sniffed {/[ body; adds findJsonBodyRange and httpContextAt.
JSON syntax folds are disabled.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 16: Write the failing `languageExtension` and folds test**

Create `src/components/CodeEditor/engine/languages/languages.test.ts`:
```ts
import { ensureSyntaxTree, foldable, getIndentation, language } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { httpLanguage, languageExtension } from './index';
import { jsonEditorLanguage } from './json';
import { yamlEditorLanguage } from './yaml';

const stateFor = (doc: string, lang: Parameters<typeof languageExtension>[0]): EditorState =>
  EditorState.create({ doc, extensions: [languageExtension(lang)] });

describe('languageExtension', () => {
  it('installs the matching CodeMirror language', () => {
    expect(stateFor('GET /', 'http').facet(language)).toBe(httpLanguage);
    expect(stateFor('{}', 'json').facet(language)).toBe(jsonEditorLanguage);
    expect(stateFor('a: 1', 'yaml').facet(language)).toBe(yamlEditorLanguage);
  });

  it('installs no language for bash and text', () => {
    expect(languageExtension('bash')).toEqual([]);
    expect(languageExtension('text')).toEqual([]);
    expect(stateFor('echo 1', 'bash').facet(language)).toBeNull();
    expect(stateFor('plain', 'text').facet(language)).toBeNull();
  });

  it('parses JSON and YAML', () => {
    const jsonTree = ensureSyntaxTree(stateFor('{"a": [1]}', 'json'), 10, 5000);
    expect(jsonTree?.toString()).toBe(
      'JsonText(Object("{",Property(PropertyName,":",Array("[",Number,"]")),"}"))',
    );
    expect(stateFor('a: 1', 'yaml').facet(language)?.name).toBe('yaml');
  });

  it('disables JSON syntax folding', () => {
    const state = stateFor('{\n  "a": [\n    1\n  ]\n}', 'json');
    for (let n = 1; n <= state.doc.lines; n++) {
      const line = state.doc.line(n);
      expect(foldable(state, line.from, line.to)).toBeNull();
    }
  });

  it('disables YAML syntax folding', () => {
    const state = stateFor('a:\n  b: 1\n  c:\n    - 1\n    - 2\nd: [1,\n  2]', 'yaml');
    for (let n = 1; n <= state.doc.lines; n++) {
      const line = state.doc.line(n);
      expect(foldable(state, line.from, line.to)).toBeNull();
    }
  });

  it('keeps JSON indentation rules', () => {
    const state = stateFor('{\n"a": 1\n}', 'json');
    expect(jsonEditorLanguage.name).toBe('json');
    expect(getIndentation(state, state.doc.line(2).from)).toBe(2);
  });
});
```

- [ ] **Step 17: Run the test and confirm it fails**

```bash
pnpm vitest run src/components/CodeEditor/engine/languages/languages.test.ts
```
Expected: FAIL with `Failed to resolve import "./index"` (or `"./yaml"`).

- [ ] **Step 18: Implement `yaml.ts`**

Create `src/components/CodeEditor/engine/languages/yaml.ts`:
```ts
import { yamlLanguage } from '@codemirror/lang-yaml';
import { foldNodeProp, LanguageSupport, type LRLanguage } from '@codemirror/language';

/** lang-yaml's YAML language with its syntax folds switched off (folds come only from the `folds` prop). */
export const yamlEditorLanguage: LRLanguage = yamlLanguage.configure({
  props: [foldNodeProp.add({ 'FlowMapping FlowSequence Item Pair BlockLiteral': () => null })],
});

export const yaml = (): LanguageSupport => new LanguageSupport(yamlEditorLanguage);
```
The node list matches every `foldNodeProp` entry in `@codemirror/lang-yaml@6.1.3`'s `dist/index.js`: `FlowMapping FlowSequence` and `Item Pair BlockLiteral`. I checked that stock `yaml()` and `json()` do return non-null `foldable()` for these documents, so the fold tests genuinely test the override.

- [ ] **Step 19: Implement `languages/index.ts`**

Create `src/components/CodeEditor/engine/languages/index.ts`. It uses a record rather than a `switch`, because Biome's `useDefaultSwitchClause` rule would reject a switch with no `default`:
```ts
import type { Extension } from '@codemirror/state';
import type { CodeEditorLanguage } from '../../types';
import { http } from './http';
import { json } from './json';
import { yaml } from './yaml';

export { findJsonBodyRange, http, httpContextAt, httpLanguage } from './http';

const noLanguage = (): Extension => [];

const LANGUAGE_EXTENSIONS: Record<CodeEditorLanguage, () => Extension> = {
  http,
  json,
  yaml,
  bash: noLanguage,
  text: noLanguage,
};

/** CodeMirror language support for a CodeEditor `language`. `bash` and `text` have no structure parser. */
export const languageExtension = (language: CodeEditorLanguage): Extension =>
  LANGUAGE_EXTENSIONS[language]();
```

- [ ] **Step 20: Run all language tests and confirm they pass**

```bash
pnpm vitest run src/components/CodeEditor/engine/languages
```
Expected: PASS. That is 4 files and 36 tests.

- [ ] **Step 21: Typecheck and lint**

```bash
pnpm exec tsc --build tsconfig.app.json --noEmit
pnpm exec biome check src/components/CodeEditor/engine/languages ../../biome.json
```
Expected:
- `tsc` reports no errors. The generated `parser.ts` compiles under `strict` and `noUncheckedIndexedAccess`.
- Biome reports no errors, and `parser.ts` and `parser.terms.ts` are not in the checked set.
- If Biome only reports formatting or import-order issues in the hand-written files, run `pnpm exec biome check --write src/components/CodeEditor/engine/languages`. Then re-run the tests from Step 20.

- [ ] **Step 22: Commit**

```bash
git add src/components/CodeEditor/engine/languages/yaml.ts \
  src/components/CodeEditor/engine/languages/index.ts \
  src/components/CodeEditor/engine/languages/languages.test.ts
git commit -m "$(cat <<'EOF'
feat(code-editor): add languageExtension with json/yaml languages without syntax folds

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Engine core: createEditor, compartments, value sync, documentId cache, readOnly, wrap, keymaps, theme, content attributes, cspNonce, maxHeight, test ids, api

**Files:**
- Create: `src/components/CodeEditor/engine/contentAttributes.ts`
- Create: `src/components/CodeEditor/engine/theme.ts`
- Create: `src/components/CodeEditor/engine/index.ts`
- Create: `src/testUtils/codeEditorEngine.ts`. This is a shared engine test harness. `src/testUtils/**` is already left out of the Rslib build and out of `tsconfig.app.json`.
- Test: `src/components/CodeEditor/engine/contentAttributes.test.ts`
- Test: `src/components/CodeEditor/engine/theme.test.ts`
- Test: `src/components/CodeEditor/engine/minimalChange.test.ts`
- Test: `src/components/CodeEditor/engine/index.test.ts` (lifecycle, value sync, visible rows, readOnly, wrap, keymaps)
- Test: `src/components/CodeEditor/engine/attributes.test.ts` (content attributes, reserved keys, editor and gutter test ids, cspNonce, maxHeight)
- Test: `src/components/CodeEditor/engine/documentId.test.ts`
- Test: `src/components/CodeEditor/engine/api.test.ts`

**Interfaces:**

Consumes:
- T3, `engine/types.ts`: `EngineOptions`, `EngineCallbacks`, `EditorHandle`.
- T3, `types.ts`: `CodeEditorApi`.
- T3, `lib/portalRegistry.ts`: `createPortalRegistry` (used by the test harness only).
- T3: the `vitest.setup.ts` Range `getClientRects` / `getBoundingClientRect` stubs, and the pinned `@codemirror/*` dependencies in `package.json`.
- T4, `engine/languages/index.ts`: `languageExtension(language: CodeEditorLanguage): Extension`.
- Existing: `SyntaxAdapter` from `src/components/CodeSnippet/adapters/types.ts`.

Produces (exact signatures):
```ts
// engine/contentAttributes.ts
export const RESERVED_CONTENT_ATTRIBUTES: readonly string[]; // role, contenteditable, aria-multiline, aria-readonly, spellcheck, autocorrect, autocapitalize, translate
export const sanitizeContentAttributes: (attrs: Record<string, string>) => Record<string, string>; // case-insensitive drop + dev console.warn; class kept (CM merges it)
// engine/theme.ts
export const editorTheme: Extension;                                   // EditorView.theme + selected-text colour ViewPlugin
export const maxHeightTheme: (maxHeight: number | null) => Extension;  // null => []
// engine/index.ts
export const createEditor: (parent: HTMLElement, options: EngineOptions, callbacks: EngineCallbacks) => EditorHandle;
export const externalChange: AnnotationType<boolean>;
export const minimalChange: (from: string, to: string) => ChangeSpec | null; // returns { from, to, insert }; never splits a surrogate pair
/** internal, NEW (not in the skeleton): T11 adds `searchConfigured.of(true)` to its `search` entry; api.openSearch is a no-op without it */
export const searchConfigured: Facet<boolean, boolean>;
// src/testUtils/codeEditorEngine.ts (test-only, reused by T6–T8, T11–T15 engine tests)
export const testAdapter: SyntaxAdapter<string>;
export const engineOptions: (overrides?: Partial<EngineOptions>) => EngineOptions;
export interface MountedEngine { handle: EditorHandle; parent: HTMLDivElement; callbacks: { onChange: Mock<…>; onDiagnosticsChange: Mock<…>; onVisibleRowCountChange: Mock<…> }; rerender: (overrides: Partial<EngineOptions>) => void; }
export const mountEngine: (overrides?: Partial<EngineOptions>) => MountedEngine;
export const unmountAllEngines: () => void;
export const typeAt: (view: EditorView, pos: number, text: string) => void; // userEvent 'input.type'
```

Contract notes for later tasks:
- **How to add a feature.** Each feature has its own compartment. The keys are `painter`, `lines` (lines + gutters), `folds`, `search`, `diagnostics`, `completion` and `diff`. A task adds its feature by editing two things in `engine/index.ts`:
  - its entry in `featureExtensions(options, callbacks)`. Each entry is a thunk that returns an `Extension`, and starts as `() => []`.
  - its row in `SLOT_DEPS`, which lists the options the compartment depends on.
- **When a compartment is reconfigured.** Only when one of its `SLOT_DEPS` options changes. The check is `===` per key, except `contentAttributes`, which is compared shallowly.
- **Reconfiguring resets StateFields.** A reconfigure replaces a StateField with a new instance, so a feature whose state must survive (for example collapsed folds) should update itself through effects, not through a new field.
- **Order of `gutterTestId`.** It is the last compartment on purpose, so that it runs after the gutter plugins.
- **What T8 replaces.** T8 swaps `visibleRowCount` for `getVisibleRowCount`, and swaps the bodies of `api.foldAll` / `api.unfoldAll` for `foldAllRegions` / `unfoldAllRegions`. `visibleRowCount` is recomputed on every update that changes the document or carries effects, and is reported only when the number changes.
- **Callbacks are read once, at `createEditor`.** T9 must pass stable callbacks that delegate to refs. T9 must also never call `handle.update()` synchronously from inside `onChange`, because CM forbids dispatching during an update.
- **`data-testid` precedence on `.cm-content`.** When `testId` is set, `${testId}--editor` wins over any `data-testid` found in `contentAttributes`.
- **`api.insertText` does nothing when `readOnly` is set** (D11 semantics).

---

- [ ] **Step 1: Write the failing test for the content attribute guard**

Create `src/components/CodeEditor/engine/contentAttributes.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RESERVED_CONTENT_ATTRIBUTES, sanitizeContentAttributes } from './contentAttributes';

describe('sanitizeContentAttributes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists every attribute CodeMirror owns on .cm-content', () => {
    expect(RESERVED_CONTENT_ATTRIBUTES).toEqual([
      'role',
      'contenteditable',
      'aria-multiline',
      'aria-readonly',
      'spellcheck',
      'autocorrect',
      'autocapitalize',
      'translate',
    ]);
  });

  it('keeps consumer attributes verbatim, including data-analytics-props and class', () => {
    const attrs = {
      'aria-label': 'Request',
      'data-analytics-id': 'request-editor',
      'data-analytics-props': '{"section":"body", "raw": true}',
      id: 'request',
      class: 'consumer-class',
    };

    expect(sanitizeContentAttributes(attrs)).toEqual(attrs);
  });

  it('drops reserved keys (any casing) with a development warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = sanitizeContentAttributes({
      role: 'presentation',
      ContentEditable: 'false',
      'aria-label': 'Body',
    });

    expect(result).toEqual({ 'aria-label': 'Body' });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain('"role"');
    expect(warn.mock.calls[1]?.[0]).toContain('"ContentEditable"');
  });

  it('does not mutate the input', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const attrs = { role: 'presentation', title: 'Body' };

    sanitizeContentAttributes(attrs);

    expect(attrs).toEqual({ role: 'presentation', title: 'Body' });
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/components/CodeEditor/engine/contentAttributes.test.ts`
Expected: FAIL with `Failed to resolve import "./contentAttributes"`.

- [ ] **Step 3: Implement `contentAttributes.ts`**

Create `src/components/CodeEditor/engine/contentAttributes.ts`:
```ts
/**
 * Attributes CodeMirror sets on `.cm-content` itself. A consumer value would
 * overwrite them (CM merges only `class` and `style`), breaking the textbox
 * semantics or the editing surface, so they are never forwarded (spec §9).
 */
export const RESERVED_CONTENT_ATTRIBUTES: readonly string[] = [
  'role',
  'contenteditable',
  'aria-multiline',
  'aria-readonly',
  'spellcheck',
  'autocorrect',
  'autocapitalize',
  'translate',
];

const RESERVED = new Set(RESERVED_CONTENT_ATTRIBUTES);

/**
 * Drops reserved keys (with a development warning) and keeps everything else
 * verbatim — `data-analytics-props` included. `class` is kept: CodeMirror
 * concatenates it with its own classes instead of replacing them.
 */
export const sanitizeContentAttributes = (
  attrs: Record<string, string>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (RESERVED.has(key.toLowerCase())) {
      if (process.env.NODE_ENV !== 'production') {
        // biome-ignore lint/suspicious/noConsole: dev-only authoring guard (matches Slider/BarList).
        console.warn(
          `[CodeEditor] "${key}" is managed by the editor and cannot be set on CodeEditorContent; the value "${value}" was ignored.`,
        );
      }
      continue;
    }
    result[key] = value;
  }
  return result;
};
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `pnpm vitest run src/components/CodeEditor/engine/contentAttributes.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the failing theme test**

Create `src/components/CodeEditor/engine/theme.test.ts`:
```ts
import { EditorSelection, EditorState, type EditorStateConfig } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import { editorTheme, maxHeightTheme } from './theme';

const mountedViews: EditorView[] = [];

const mountView = (doc: string, config: EditorStateConfig = {}) => {
  const parent = document.createElement('div');
  document.body.append(parent);
  const view = new EditorView({ parent, state: EditorState.create({ doc, ...config }) });
  mountedViews.push(view);
  return view;
};

/** All CSS CodeMirror (style-mod) has mounted into the document. */
const mountedCss = (): string =>
  Array.from(document.querySelectorAll('style'))
    .map(style => style.textContent ?? '')
    .join('\n');

afterEach(() => {
  for (const view of mountedViews.splice(0)) {
    view.dom.parentElement?.remove();
    view.destroy();
  }
});

describe('editorTheme', () => {
  it('maps CodeSnippet metrics and syntax tokens onto CodeMirror', () => {
    mountView('a', { extensions: editorTheme });
    const css = mountedCss();

    expect(css).toContain('font-family: inherit');
    expect(css).toContain('line-height: 20px');
    expect(css).toContain('padding: 8px 12px 8px 0');
    expect(css).toMatch(/:not\(:has\(\.cm-gutters\)\) \.cm-content \{padding-left: 12px;?\}/);
    expect(css).toContain('caret-color: var(--color-syntax-no-syntax)');
    expect(css).toContain('border-left-color: var(--color-syntax-no-syntax)');
    expect(css).toContain('background: var(--color-syntax-highlight-selected-highlight)');
    expect(css).toContain('background-color: var(--color-syntax-highlight-neutral-highlight)');
    expect(css).toContain('word-break: break-all');
    expect(css).toContain('var(--color-component-code-snippet-bg)');
    expect(css).toContain('margin-right: 8px');
    expect(css).toMatch(/\.cm-focused \{outline: none;?\}/);
  });

  it('gives selected text the selected-code colour', () => {
    const view = mountView('hello world', {
      extensions: editorTheme,
      selection: EditorSelection.single(0, 5),
    });

    const marked = view.contentDOM.querySelector('.text-syntax-highlight-selected-code\\!');
    expect(marked?.textContent).toBe('hello');

    view.dispatch({ selection: { anchor: 0 } });
    expect(view.contentDOM.querySelector('.text-syntax-highlight-selected-code\\!')).toBeNull();
  });
});

describe('maxHeightTheme', () => {
  it('returns no extension without a clamp', () => {
    expect(maxHeightTheme(null)).toEqual([]);
  });

  it('clamps and scrolls .cm-scroller', () => {
    mountView('a', { extensions: maxHeightTheme(216) });
    const css = mountedCss();

    expect(css).toMatch(/\.cm-scroller \{max-height: 216px;\s*overflow-y: auto;?\}/);
  });
});
```

- [ ] **Step 6: Run it and confirm it fails**

Run: `pnpm vitest run src/components/CodeEditor/engine/theme.test.ts`
Expected: FAIL with `Failed to resolve import "./theme"`.

- [ ] **Step 7: Implement `theme.ts`**

Three points about this file:
- **Selected text colour.** `drawSelection()` hides the native selection, so the root's `::selection` text colour, `--color-syntax-highlight-selected-code`, never reaches selected text. In light mode the selection background is `slate-950`, so without a fix the selected text would be unreadable. A small mark decoration restores the `selected-code` colour.
- **Tailwind classes.** The mark's classes are literal Tailwind classes in a `.ts` file under `src/components`, so `@source "../components"` picks them up.
- **`semantic.css` is not touched.**

Create `src/components/CodeEditor/engine/theme.ts`:
```ts
import type { EditorState, Extension } from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';

/** Same layered background as the `code-snippet-bg` utility (theme/utilities/code-snippet-bg.css). */
const CODE_SNIPPET_BG =
  'linear-gradient(var(--color-component-code-snippet-bg), var(--color-component-code-snippet-bg)), var(--color-bg-page-bg)';

/**
 * CodeSnippet look for CodeMirror (spec §7.9, §7.10). Only existing tokens are
 * referenced — `semantic.css` is never edited. Selectors mirror the ones in
 * CodeMirror's base theme so that equal specificity + later mount order wins.
 */
const snippetTheme = EditorView.theme({
  '&': {
    color: 'var(--color-syntax-no-syntax)',
    backgroundColor: 'transparent',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
    lineHeight: '20px',
  },
  '.cm-content': {
    padding: '8px 12px 8px 0',
    caretColor: 'var(--color-syntax-no-syntax)',
  },
  // No gutter → the text column gets CodeSnippet's `pl-12`.
  '&:not(:has(.cm-gutters)) .cm-content': {
    paddingLeft: '12px',
  },
  '.cm-line': {
    padding: '0',
  },
  // CodeSnippet wraps with `whitespace-pre-wrap break-all`.
  '.cm-lineWrapping': {
    wordBreak: 'break-all',
  },
  '.cm-gutters': {
    background: CODE_SNIPPET_BG,
    color: 'inherit',
    border: 'none',
    marginRight: '8px',
  },
  '.cm-gutters.cm-gutters-before': {
    borderRightWidth: '0',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--color-syntax-no-syntax)',
  },
  '.cm-selectionBackground': {
    background: 'var(--color-syntax-highlight-selected-highlight)',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    background: 'var(--color-syntax-highlight-selected-highlight)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'var(--color-syntax-highlight-neutral-highlight)',
  },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: 'var(--color-syntax-highlight-neutral-highlight)',
  },
  '&.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: 'var(--color-syntax-highlight-error-highlight)',
  },
});

/**
 * drawSelection() paints the selection behind the text and hides the native
 * one, so the root's `::selection` text colour never applies. This mark gives
 * selected text the same `selected-code` colour CodeSnippet shows (the
 * `selected-highlight` background is dark in light mode). `!` beats token
 * colours on nested spans.
 */
const selectedTextMark = Decoration.mark({
  class: 'text-syntax-highlight-selected-code! [&_*]:text-syntax-highlight-selected-code!',
});

const buildSelectedText = (state: EditorState): DecorationSet =>
  Decoration.set(
    state.selection.ranges
      .filter(range => !range.empty)
      .map(range => selectedTextMark.range(range.from, range.to)),
    true,
  );

const selectedTextColor = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildSelectedText(view.state);
    }

    update(update: ViewUpdate) {
      if (update.selectionSet || update.docChanged) {
        this.decorations = buildSelectedText(update.state);
      }
    }
  },
  { decorations: plugin => plugin.decorations },
);

export const editorTheme: Extension = [snippetTheme, selectedTextColor];

/** Height clamp for maxLines / Show more (spec §7.8); `null` = no clamp. */
export const maxHeightTheme = (maxHeight: number | null): Extension =>
  maxHeight === null
    ? []
    : EditorView.theme({
        '.cm-scroller': {
          maxHeight: `${maxHeight}px`,
          overflowY: 'auto',
        },
      });
```

- [ ] **Step 8: Run both tests, lint, and commit**

Run: `pnpm vitest run src/components/CodeEditor/engine/contentAttributes.test.ts src/components/CodeEditor/engine/theme.test.ts`
Expected: PASS (8 tests).

Run: `pnpm exec biome check src/components/CodeEditor/engine`
Expected: no errors. If it only reports formatting, run `pnpm exec biome check --write src/components/CodeEditor/engine`.

```bash
git add src/components/CodeEditor/engine/contentAttributes.ts src/components/CodeEditor/engine/contentAttributes.test.ts src/components/CodeEditor/engine/theme.ts src/components/CodeEditor/engine/theme.test.ts
git commit -m "feat(code-editor): add engine theme and reserved content attribute guard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 9: Add the shared engine test harness**

Create `src/testUtils/codeEditorEngine.ts`:
```ts
import type { EditorView } from '@codemirror/view';
import { type Mock, vi } from 'vitest';
import { createEditor } from '../components/CodeEditor/engine';
import type {
  EditorHandle,
  EngineCallbacks,
  EngineOptions,
} from '../components/CodeEditor/engine/types';
import { createPortalRegistry } from '../components/CodeEditor/lib/portalRegistry';
import type { SyntaxAdapter } from '../components/CodeSnippet/adapters/types';

/** Plain adapter typed for any language (the real `plainAdapter` is `SyntaxAdapter<PlainLanguage>`). */
export const testAdapter: SyntaxAdapter<string> = {
  name: 'test-plain',
  highlight: async code => ({
    tokens: code.split('\n').map(line => [{ content: line, type: 'plain' }]),
  }),
  getSupportedLanguages: () => ['text'],
};

export const engineOptions = (overrides: Partial<EngineOptions> = {}): EngineOptions => ({
  value: '',
  documentId: undefined,
  language: 'text',
  readOnly: false,
  wrapLines: false,
  startingLineNumber: 1,
  lineNumbers: false,
  lines: {},
  folds: undefined,
  adapter: testAdapter,
  original: undefined,
  schema: undefined,
  completions: [],
  diagnostics: [],
  contentAttributes: {},
  testId: undefined,
  cspNonce: undefined,
  maxHeight: null,
  ...overrides,
});

export interface MountedEngine {
  handle: EditorHandle;
  parent: HTMLDivElement;
  callbacks: {
    onChange: Mock<EngineCallbacks['onChange']>;
    onDiagnosticsChange: Mock<EngineCallbacks['onDiagnosticsChange']>;
    onVisibleRowCountChange: Mock<EngineCallbacks['onVisibleRowCountChange']>;
  };
  /** Merges `overrides` into the last options and calls `handle.update`. */
  rerender: (overrides: Partial<EngineOptions>) => void;
}

const mounted: MountedEngine[] = [];

/** Creates a real EditorView attached to `document.body`. Call `unmountAllEngines()` in `afterEach`. */
export const mountEngine = (overrides: Partial<EngineOptions> = {}): MountedEngine => {
  const parent = document.createElement('div');
  document.body.append(parent);
  const callbacks = {
    onChange: vi.fn<EngineCallbacks['onChange']>(),
    onDiagnosticsChange: vi.fn<EngineCallbacks['onDiagnosticsChange']>(),
    onVisibleRowCountChange: vi.fn<EngineCallbacks['onVisibleRowCountChange']>(),
  };
  let options = engineOptions(overrides);
  const handle = createEditor(parent, options, { ...callbacks, portals: createPortalRegistry() });
  const engine: MountedEngine = {
    handle,
    parent,
    callbacks,
    rerender: next => {
      options = { ...options, ...next };
      handle.update(options);
    },
  };
  mounted.push(engine);
  return engine;
};

export const unmountAllEngines = () => {
  for (const engine of mounted.splice(0)) {
    // A test may already have destroyed it (CM removes view.dom on destroy).
    if (engine.handle.view.dom.parentNode) engine.handle.destroy();
    engine.parent.remove();
  }
};

/** A user-like edit (what typing produces), as opposed to an external value sync. */
export const typeAt = (view: EditorView, pos: number, text: string) => {
  view.dispatch({
    changes: { from: pos, insert: text },
    selection: { anchor: pos + text.length },
    userEvent: 'input.type',
  });
};
```

- [ ] **Step 10: Write the failing `minimalChange` test**

Create `src/components/CodeEditor/engine/minimalChange.test.ts`:
```ts
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { minimalChange } from './index';

const apply = (from: string, to: string): string => {
  const changes = minimalChange(from, to);
  if (!changes) return from;
  return EditorState.create({ doc: from }).update({ changes }).state.doc.toString();
};

describe('minimalChange', () => {
  it('returns null for equal strings', () => {
    expect(minimalChange('same', 'same')).toBeNull();
    expect(minimalChange('', '')).toBeNull();
  });

  it('replaces only the differing middle', () => {
    expect(minimalChange('hello world', 'hello brave world')).toEqual({
      from: 6,
      to: 6,
      insert: 'brave ',
    });
    expect(minimalChange('abcdef', 'abXYef')).toEqual({ from: 2, to: 4, insert: 'XY' });
  });

  it('handles pure insertions and deletions at both ends', () => {
    expect(minimalChange('abc', 'abcd')).toEqual({ from: 3, to: 3, insert: 'd' });
    expect(minimalChange('abc', 'zabc')).toEqual({ from: 0, to: 0, insert: 'z' });
    expect(minimalChange('abcd', 'abc')).toEqual({ from: 3, to: 4, insert: '' });
    expect(minimalChange('', 'new')).toEqual({ from: 0, to: 0, insert: 'new' });
    expect(minimalChange('old', '')).toEqual({ from: 0, to: 3, insert: '' });
  });

  it('does not let prefix and suffix overlap on repeated characters', () => {
    expect(minimalChange('aaa', 'aaaa')).toEqual({ from: 3, to: 3, insert: 'a' });
    expect(apply('aaa', 'aaaa')).toBe('aaaa');
    expect(apply('abab', 'ab')).toBe('ab');
  });

  it('never splits a surrogate pair', () => {
    const grinning = String.fromCodePoint(0x1f600); // D83D DE00
    const beaming = String.fromCodePoint(0x1f601); // D83D DE01 — same high surrogate
    const squared = String.fromCodePoint(0x1f200); // D83C DE00 — same low surrogate

    expect(minimalChange(`a${grinning}b`, `a${beaming}b`)).toEqual({
      from: 1,
      to: 3,
      insert: beaming,
    });
    expect(minimalChange(`${squared}y`, `${grinning}y`)).toEqual({
      from: 0,
      to: 2,
      insert: grinning,
    });
  });

  it('always produces the target document', () => {
    const pairs: [string, string][] = [
      ['GET / HTTP/1.1\nHost: a', 'POST / HTTP/1.1\nHost: a'],
      ['{\n  "a": 1\n}', '{\n  "a": 12,\n  "b": 2\n}'],
      ['line1\nline2\nline3', 'line1\nline3'],
    ];
    for (const [from, to] of pairs) expect(apply(from, to)).toBe(to);
  });
});
```

- [ ] **Step 11: Write the failing lifecycle / value sync / readOnly / wrap / keymap test**

Create `src/components/CodeEditor/engine/index.test.ts`:
```ts
import { insertNewlineAndIndent, undo } from '@codemirror/commands';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import { mountEngine, typeAt, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

const keydown = (target: HTMLElement, key: string, keyCode: number) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true }),
  );

afterEach(() => {
  unmountAllEngines();
});

describe('createEditor — lifecycle', () => {
  it('mounts an editor with the initial value into the parent', () => {
    const { handle, parent } = mountEngine({ value: 'GET / HTTP/1.1' });

    expect(parent.querySelector('.cm-editor')).toBe(handle.view.dom);
    expect(handle.view.state.doc.toString()).toBe('GET / HTTP/1.1');
  });

  it('destroy removes the editor DOM', () => {
    const { handle, parent } = mountEngine({ value: 'a' });

    handle.destroy();

    expect(parent.querySelector('.cm-editor')).toBeNull();
  });
});

describe('createEditor — value sync', () => {
  it('fires onChange for user edits', () => {
    const { handle, callbacks } = mountEngine({ value: 'abc' });

    typeAt(handle.view, 3, 'd');

    expect(callbacks.onChange).toHaveBeenCalledTimes(1);
    expect(callbacks.onChange).toHaveBeenLastCalledWith('abcd');
  });

  it('does not fire onChange when the value prop is synced in', () => {
    const { handle, callbacks, rerender } = mountEngine({ value: 'abc' });

    rerender({ value: 'abc!' });

    expect(handle.view.state.doc.toString()).toBe('abc!');
    expect(callbacks.onChange).not.toHaveBeenCalled();
  });

  it('does nothing when the value prop equals the document (controlled echo)', () => {
    const { handle, callbacks, rerender } = mountEngine({ value: 'abc' });
    typeAt(handle.view, 3, 'd');
    const stateBefore = handle.view.state;

    rerender({ value: 'abcd' });

    expect(handle.view.state).toBe(stateBefore);
    expect(callbacks.onChange).toHaveBeenCalledTimes(1);
  });

  it('keeps the cursor when the external change is after it', () => {
    const { handle, rerender } = mountEngine({ value: 'hello world' });
    handle.view.dispatch({ selection: { anchor: 5 } });

    rerender({ value: 'hello world, again' });

    expect(handle.view.state.selection.main.head).toBe(5);
  });

  it('maps the cursor when the external change is before it', () => {
    const { handle, rerender } = mountEngine({ value: 'hello world' });
    handle.view.dispatch({ selection: { anchor: 5 } });

    rerender({ value: '>> hello world' });

    expect(handle.view.state.selection.main.head).toBe(8);
  });

  it('keeps external syncs out of the undo history', () => {
    const { handle, rerender } = mountEngine({ value: 'abc' });
    typeAt(handle.view, 3, 'd');
    rerender({ value: 'abcd + external' });

    expect(undo(handle.view)).toBe(true);
    expect(handle.view.state.doc.toString()).toBe('abc + external');
    expect(undo(handle.view)).toBe(false);
  });
});

describe('createEditor — visible rows', () => {
  it('reports the line count on create and when it changes', () => {
    const { handle, callbacks, rerender } = mountEngine({ value: 'a\nb' });
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(2);

    typeAt(handle.view, 3, '\nc');
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(3);

    rerender({ value: 'a' });
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(1);
  });

  it('does not re-report an unchanged count', () => {
    const { handle, callbacks } = mountEngine({ value: 'a' });

    typeAt(handle.view, 1, 'bc');

    expect(callbacks.onVisibleRowCountChange).toHaveBeenCalledTimes(1);
  });
});

describe('createEditor — readOnly (EditorState.readOnly, D11)', () => {
  it('blocks editing commands but keeps the content focusable', () => {
    const { handle } = mountEngine({ value: 'abc', readOnly: true });
    handle.view.dispatch({ selection: { anchor: 3 } });

    expect(handle.view.state.readOnly).toBe(true);
    expect(insertNewlineAndIndent(handle.view)).toBe(false);
    expect(handle.view.state.doc.toString()).toBe('abc');
    expect(handle.view.contentDOM.getAttribute('contenteditable')).toBe('true');
    expect(handle.view.contentDOM.getAttribute('aria-readonly')).toBe('true');
  });

  it('toggles through update without recreating the view', () => {
    const { handle, rerender } = mountEngine({ value: 'abc' });
    const view = handle.view;

    rerender({ readOnly: true });
    expect(view.state.readOnly).toBe(true);

    rerender({ readOnly: false });
    expect(view.state.readOnly).toBe(false);
    expect(handle.view).toBe(view);
  });
});

describe('createEditor — wrap', () => {
  it('toggles CodeMirror line wrapping', () => {
    const { handle, rerender } = mountEngine({ value: 'a' });
    expect(handle.view.contentDOM.classList.contains('cm-lineWrapping')).toBe(false);

    rerender({ wrapLines: true });
    expect(handle.view.contentDOM.classList.contains('cm-lineWrapping')).toBe(true);

    rerender({ wrapLines: false });
    expect(handle.view.contentDOM.classList.contains('cm-lineWrapping')).toBe(false);
  });
});

describe('createEditor — keymaps', () => {
  it('Tab indents, and Escape then Tab leaves focus handling to the browser', () => {
    const { handle } = mountEngine({ value: 'a' });
    const content = handle.view.contentDOM;
    handle.view.dispatch({ selection: { anchor: 0 } });

    keydown(content, 'Tab', 9);
    expect(handle.view.state.doc.toString()).toBe('  a');

    keydown(content, 'Escape', 27);
    keydown(content, 'Tab', 9);
    expect(handle.view.state.doc.toString()).toBe('  a');
  });

  it('Mod-z undoes the last user edit', () => {
    const { handle } = mountEngine({ value: 'a' });
    typeAt(handle.view, 1, 'b');

    // jsdom reports a non-mac platform, so Mod = Ctrl.
    handle.view.contentDOM.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'z',
        keyCode: 90,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(handle.view.state.doc.toString()).toBe('a');
  });

  it('auto-closes brackets on typed input', () => {
    const { handle } = mountEngine({ value: '' });
    const view = handle.view;
    const defaultInsert = () => view.state.update({ changes: { from: 0, insert: '(' } });

    // The DOM layer offers typed text to every EditorView.inputHandler first.
    const handled = view.state
      .facet(EditorView.inputHandler)
      .some(handler => handler(view, 0, 0, '(', defaultInsert));

    expect(handled).toBe(true);
    expect(view.state.doc.toString()).toBe('()');
  });
});
```

- [ ] **Step 12: Write the failing attributes / test id / cspNonce / maxHeight test**

Create `src/components/CodeEditor/engine/attributes.test.ts`:
```ts
import { StateEffect } from '@codemirror/state';
import { lineNumbers } from '@codemirror/view';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

afterEach(() => {
  unmountAllEngines();
  vi.restoreAllMocks();
});

describe('createEditor — content attributes (D10)', () => {
  it('lands consumer attributes on .cm-content unchanged', () => {
    const props = '{"section":"body","nested":{"a":1}}';
    const { handle } = mountEngine({
      contentAttributes: {
        'aria-label': 'Request',
        'data-analytics-id': 'request-editor',
        'data-analytics-props': props,
        id: 'request-editor',
        title: 'Request body',
      },
    });
    const content = handle.view.contentDOM;

    expect(content.getAttribute('aria-label')).toBe('Request');
    expect(content.getAttribute('data-analytics-id')).toBe('request-editor');
    expect(content.getAttribute('data-analytics-props')).toBe(props);
    expect(content.id).toBe('request-editor');
    expect(content.getAttribute('title')).toBe('Request body');
  });

  it('sets data-testid="{testId}--editor" on .cm-content', () => {
    const { handle } = mountEngine({ testId: 'req' });

    expect(handle.view.contentDOM.getAttribute('data-testid')).toBe('req--editor');
  });

  it('merges class instead of replacing CodeMirror classes', () => {
    const { handle } = mountEngine({ contentAttributes: { class: 'consumer-class' } });
    const content = handle.view.contentDOM;

    expect(content.classList.contains('consumer-class')).toBe(true);
    expect(content.classList.contains('cm-content')).toBe(true);
  });

  it('ignores reserved attributes with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { handle } = mountEngine({
      contentAttributes: { role: 'presentation', spellcheck: 'true', 'aria-label': 'Body' },
    });
    const content = handle.view.contentDOM;

    expect(content.getAttribute('role')).toBe('textbox');
    expect(content.getAttribute('spellcheck')).toBe('false');
    expect(content.getAttribute('aria-label')).toBe('Body');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"role"'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"spellcheck"'));
  });

  it('updates attributes on change and skips reconfigure for shallow-equal records', () => {
    const { handle, rerender } = mountEngine({ contentAttributes: { 'aria-label': 'One' } });
    const dispatch = vi.spyOn(handle.view, 'dispatch');

    rerender({ contentAttributes: { 'aria-label': 'One' } });
    expect(dispatch).not.toHaveBeenCalled();

    rerender({ contentAttributes: { 'aria-label': 'Two', 'data-analytics-id': 'x' } });
    expect(handle.view.contentDOM.getAttribute('aria-label')).toBe('Two');
    expect(handle.view.contentDOM.getAttribute('data-analytics-id')).toBe('x');

    rerender({ contentAttributes: {} });
    expect(handle.view.contentDOM.hasAttribute('aria-label')).toBe(false);
    expect(handle.view.contentDOM.hasAttribute('data-analytics-id')).toBe(false);
  });
});

describe('createEditor — gutter test id', () => {
  it('sets data-testid="{testId}--gutter" once gutters are rendered', () => {
    const { handle } = mountEngine({ testId: 'req' });
    expect(handle.view.dom.querySelector('.cm-gutters')).toBeNull();

    // Stand-in for the lines/gutters compartment (T7): gutters added by a later reconfigure.
    handle.view.dispatch({ effects: StateEffect.appendConfig.of(lineNumbers()) });

    expect(handle.view.dom.querySelector('.cm-gutters')?.getAttribute('data-testid')).toBe(
      'req--gutter',
    );
  });

  it('adds nothing without a testId', () => {
    const { handle } = mountEngine();
    handle.view.dispatch({ effects: StateEffect.appendConfig.of(lineNumbers()) });

    expect(handle.view.dom.querySelector('.cm-gutters')?.hasAttribute('data-testid')).toBe(false);
  });
});

describe('createEditor — cspNonce and maxHeight', () => {
  it('puts the nonce on the style tag CodeMirror injects', () => {
    mountEngine({ cspNonce: 'n0nce-123' });

    expect(document.head.querySelector('style[nonce="n0nce-123"]')).not.toBeNull();
  });

  it('clamps .cm-scroller when maxHeight is set and releases it on null', () => {
    const { handle, rerender } = mountEngine({ value: 'a' });
    const themeClasses = () => handle.view.dom.className;
    const before = themeClasses();

    rerender({ maxHeight: 176 });
    const css = Array.from(document.querySelectorAll('style'))
      .map(style => style.textContent ?? '')
      .join('\n');
    expect(css).toContain('max-height: 176px');
    expect(themeClasses()).not.toBe(before);

    rerender({ maxHeight: null });
    expect(themeClasses()).toBe(before);
  });
});
```

- [ ] **Step 13: Write the failing documentId cache test**

Create `src/components/CodeEditor/engine/documentId.test.ts`:
```ts
import { undo } from '@codemirror/commands';
import { afterEach, describe, expect, it } from 'vitest';
import { mountEngine, typeAt, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

afterEach(() => {
  unmountAllEngines();
});

describe('createEditor — documentId state cache', () => {
  it('keeps undo history per document', () => {
    const { handle, rerender } = mountEngine({ value: 'aaa', documentId: 'a' });
    typeAt(handle.view, 3, '1');

    rerender({ documentId: 'b', value: 'bbb' });
    expect(handle.view.state.doc.toString()).toBe('bbb');
    // A fresh document has no history of its own.
    expect(undo(handle.view)).toBe(false);
    typeAt(handle.view, 3, '2');

    rerender({ documentId: 'a', value: 'aaa1' });
    expect(handle.view.state.doc.toString()).toBe('aaa1');
    expect(undo(handle.view)).toBe(true);
    expect(handle.view.state.doc.toString()).toBe('aaa');
    expect(undo(handle.view)).toBe(false);

    rerender({ documentId: 'b', value: 'bbb2' });
    expect(handle.view.state.doc.toString()).toBe('bbb2');
    expect(undo(handle.view)).toBe(true);
    expect(handle.view.state.doc.toString()).toBe('bbb');
  });

  it('restores the selection of a cached document', () => {
    const { handle, rerender } = mountEngine({ value: 'first doc', documentId: 'a' });
    handle.view.dispatch({ selection: { anchor: 2, head: 5 } });

    rerender({ documentId: 'b', value: 'second' });
    expect(handle.view.state.selection.main.head).toBe(0);

    rerender({ documentId: 'a', value: 'first doc' });
    expect(handle.view.state.selection.main.anchor).toBe(2);
    expect(handle.view.state.selection.main.head).toBe(5);
  });

  it('syncs a value that changed while the document was hidden, without onChange or history', () => {
    const { handle, callbacks, rerender } = mountEngine({ value: 'aaa', documentId: 'a' });

    rerender({ documentId: 'b', value: 'bbb' });
    rerender({ documentId: 'a', value: 'aaa (updated elsewhere)' });

    expect(handle.view.state.doc.toString()).toBe('aaa (updated elsewhere)');
    expect(callbacks.onChange).not.toHaveBeenCalled();
    expect(undo(handle.view)).toBe(false);
  });

  it('applies options that changed while a document was cached', () => {
    const { handle, rerender } = mountEngine({ value: 'aaa', documentId: 'a' });

    rerender({ documentId: 'b', value: 'bbb' });
    rerender({ readOnly: true, wrapLines: true });
    rerender({ documentId: 'a', value: 'aaa' });

    expect(handle.view.state.readOnly).toBe(true);
    expect(handle.view.contentDOM.classList.contains('cm-lineWrapping')).toBe(true);
  });

  it('reports the row count of the document swapped in', () => {
    const { callbacks, rerender } = mountEngine({ value: 'a', documentId: 'a' });

    rerender({ documentId: 'b', value: 'b\nb\nb' });
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(3);

    rerender({ documentId: 'a', value: 'a' });
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(1);
  });

  it('treats a switch to no documentId as a fresh document', () => {
    const { handle, rerender } = mountEngine({ value: 'aaa', documentId: 'a' });
    typeAt(handle.view, 3, '1');

    rerender({ documentId: undefined, value: 'plain' });

    expect(handle.view.state.doc.toString()).toBe('plain');
    expect(undo(handle.view)).toBe(false);
  });
});
```

- [ ] **Step 14: Write the failing api test**

Create `src/components/CodeEditor/engine/api.test.ts`:
```ts
import { undo } from '@codemirror/commands';
import { afterEach, describe, expect, it } from 'vitest';
import { mountEngine, typeAt, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

afterEach(() => {
  unmountAllEngines();
});

describe('createEditor — api', () => {
  it('getValue returns the current document', () => {
    const { handle } = mountEngine({ value: 'abc' });
    typeAt(handle.view, 3, 'd');

    expect(handle.api.getValue()).toBe('abcd');
  });

  it('insertText replaces the selection as an undoable user edit', () => {
    const { handle, callbacks } = mountEngine({ value: 'hello world' });
    handle.view.dispatch({ selection: { anchor: 0, head: 5 } });

    handle.api.insertText('bye');

    expect(handle.api.getValue()).toBe('bye world');
    expect(handle.view.state.selection.main.head).toBe(3);
    expect(callbacks.onChange).toHaveBeenLastCalledWith('bye world');
    expect(undo(handle.view)).toBe(true);
    expect(handle.api.getValue()).toBe('hello world');
  });

  it('insertText inserts at the cursor', () => {
    const { handle } = mountEngine({ value: 'ac' });
    handle.view.dispatch({ selection: { anchor: 1 } });

    handle.api.insertText('b');

    expect(handle.api.getValue()).toBe('abc');
  });

  it('insertText respects readOnly', () => {
    const { handle, callbacks } = mountEngine({ value: 'abc', readOnly: true });

    handle.api.insertText('x');

    expect(handle.api.getValue()).toBe('abc');
    expect(callbacks.onChange).not.toHaveBeenCalled();
  });

  it('focus focuses the typing surface', () => {
    const { handle } = mountEngine({ value: 'abc' });

    handle.api.focus();

    expect(document.activeElement).toBe(handle.view.contentDOM);
  });

  it('openSearch does not open the built-in CodeMirror panel when no search feature is configured', () => {
    const { handle } = mountEngine({ value: 'abc' });

    handle.api.openSearch();

    expect(handle.view.dom.querySelector('.cm-search')).toBeNull();
    expect(handle.view.dom.querySelector('.cm-panels')).toBeNull();
  });

  it('foldAll / unfoldAll are safe with no foldable ranges', () => {
    const { handle } = mountEngine({ value: '{\n  "a": 1\n}' });

    expect(() => {
      handle.api.foldAll();
      handle.api.unfoldAll();
    }).not.toThrow();
    expect(handle.api.getValue()).toBe('{\n  "a": 1\n}');
  });
});
```

- [ ] **Step 15: Run the engine tests and confirm they fail**

Run: `pnpm vitest run src/components/CodeEditor/engine`
Expected:
- FAIL for `minimalChange`, `index`, `attributes`, `documentId` and `api`, all with `Failed to resolve import "./index"` or `"../components/CodeEditor/engine"`.
- `contentAttributes` and `theme` still PASS.

- [ ] **Step 16: Implement `engine/index.ts`**

Why the code is built this way:
- **Search.** `openSearchPanel` from `@codemirror/search` appends CM's own un-themed search extension when none is configured (`search/dist/index.js:1022-1025`). So `api.openSearch` is guarded by the `searchConfigured` facet, which T11 sets.
- **Gutter test id.** The gutter test id uses a ViewPlugin plus an update listener. Update listeners run after all plugin updates, so gutters added by a reconfigure in the same transaction are already in the DOM. Dropping the listener fails `attributes.test.ts`.

Create `src/components/CodeEditor/engine/index.ts`:
```ts
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, foldAll, indentOnInput, unfoldAll } from '@codemirror/language';
import { openSearchPanel } from '@codemirror/search';
import {
  Annotation,
  type AnnotationType,
  type ChangeSpec,
  Compartment,
  EditorState,
  type Extension,
  Facet,
  Transaction,
} from '@codemirror/state';
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  keymap,
  rectangularSelection,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import type { CodeEditorApi } from '../types';
import { sanitizeContentAttributes } from './contentAttributes';
import { languageExtension } from './languages';
import { editorTheme, maxHeightTheme } from './theme';
import type { EditorHandle, EngineCallbacks, EngineOptions } from './types';

/** Marks transactions that sync the `value` prop into the editor — never echoed to `onChange`. */
export const externalChange: AnnotationType<boolean> = Annotation.define<boolean>();

const isHighSurrogate = (code: number): boolean => code >= 0xd800 && code <= 0xdbff;
const isLowSurrogate = (code: number): boolean => code >= 0xdc00 && code <= 0xdfff;

/**
 * Smallest single replacement turning `from` into `to` (common prefix/suffix),
 * so an external value sync does not move the cursor. Never splits a UTF-16
 * surrogate pair. `null` when the strings are equal.
 */
export const minimalChange = (from: string, to: string): ChangeSpec | null => {
  if (from === to) return null;
  const max = Math.min(from.length, to.length);
  let prefix = 0;
  while (prefix < max && from.charCodeAt(prefix) === to.charCodeAt(prefix)) prefix++;
  if (prefix > 0 && isHighSurrogate(from.charCodeAt(prefix - 1))) prefix--;
  let suffix = 0;
  while (
    suffix < max - prefix &&
    from.charCodeAt(from.length - 1 - suffix) === to.charCodeAt(to.length - 1 - suffix)
  ) {
    suffix++;
  }
  if (suffix > 0 && isLowSurrogate(from.charCodeAt(from.length - suffix))) suffix--;
  return { from: prefix, to: from.length - suffix, insert: to.slice(prefix, to.length - suffix) };
};

/**
 * `true` once a search extension is configured (T11 adds `searchConfigured.of(true)`
 * next to its search extension). Without it `openSearch` is a no-op, so
 * `openSearchPanel` never falls back to CodeMirror's own un-themed panel.
 */
export const searchConfigured = Facet.define<boolean, boolean>({
  combine: values => values.some(Boolean),
});

/** Core compartments owned by this module. */
const CORE_KEYS = [
  'language',
  'readOnly',
  'wrap',
  'maxHeight',
  'contentAttributes',
  'cspNonce',
] as const;

/** Feature compartments — each feature task fills its entry in `featureExtensions`. */
const FEATURE_KEYS = [
  'painter',
  'lines',
  'folds',
  'search',
  'diagnostics',
  'completion',
  'diff',
] as const;

/** Must stay last: its ViewPlugin has to be created after the gutter plugins. */
const TAIL_KEYS = ['gutterTestId'] as const;

type FeatureKey = (typeof FEATURE_KEYS)[number];
type SlotKey = (typeof CORE_KEYS)[number] | FeatureKey | (typeof TAIL_KEYS)[number];

const SLOT_KEYS: readonly SlotKey[] = [...CORE_KEYS, ...FEATURE_KEYS, ...TAIL_KEYS];

/** Options each compartment depends on; a compartment is reconfigured only when one of them changes. */
const SLOT_DEPS: Record<SlotKey, readonly (keyof EngineOptions)[]> = {
  language: ['language'],
  readOnly: ['readOnly'],
  wrap: ['wrapLines'],
  maxHeight: ['maxHeight'],
  contentAttributes: ['contentAttributes', 'testId'],
  cspNonce: ['cspNonce'],
  painter: ['adapter', 'language'],
  lines: ['lines', 'startingLineNumber', 'lineNumbers', 'testId'],
  folds: ['folds', 'startingLineNumber', 'testId'],
  search: ['readOnly', 'testId'],
  diagnostics: ['language', 'schema', 'diagnostics', 'startingLineNumber'],
  completion: ['language', 'schema', 'completions', 'startingLineNumber'],
  diff: ['original'],
  gutterTestId: ['testId'],
};

type SlotBuilders<K extends string> = Record<K, () => Extension>;

/**
 * Extension point for feature tasks (painter, lines + gutters, folds, search,
 * diagnostics, completion, diff). Each entry builds the extension for its
 * compartment from the current options; an empty array means "feature off".
 * Later tasks replace the corresponding `[]` (and update `SLOT_DEPS`).
 */
const featureExtensions = (
  _options: EngineOptions,
  _callbacks: EngineCallbacks,
): SlotBuilders<FeatureKey> => ({
  painter: () => [],
  lines: () => [],
  folds: () => [],
  search: () => [],
  diagnostics: () => [],
  completion: () => [],
  diff: () => [],
});

const contentAttributesFor = (options: EngineOptions): Record<string, string> => {
  const attrs = sanitizeContentAttributes(options.contentAttributes);
  if (options.testId) attrs['data-testid'] = `${options.testId}--editor`;
  return attrs;
};

/** `data-testid="{testId}--gutter"` on `.cm-gutters` whenever gutters are rendered. */
const gutterTestId = (testId: string | undefined): Extension => {
  if (!testId) return [];
  const id = `${testId}--gutter`;
  const apply = (view: EditorView) => {
    const gutters = view.scrollDOM.querySelector(':scope > .cm-gutters');
    if (gutters && gutters.getAttribute('data-testid') !== id) {
      gutters.setAttribute('data-testid', id);
    }
  };
  return [
    // Covers creation and view.setState (plugins are rebuilt in extension order).
    ViewPlugin.define(view => {
      apply(view);
      return {};
    }),
    // Update listeners run after every plugin update, so gutters added by a
    // reconfigure in the same transaction are already in the DOM.
    EditorView.updateListener.of(update => apply(update.view)),
  ];
};

const slotExtensions = (
  options: EngineOptions,
  callbacks: EngineCallbacks,
): SlotBuilders<SlotKey> => ({
  language: () => languageExtension(options.language),
  readOnly: () => EditorState.readOnly.of(options.readOnly),
  wrap: () => (options.wrapLines ? EditorView.lineWrapping : []),
  maxHeight: () => maxHeightTheme(options.maxHeight),
  contentAttributes: () => EditorView.contentAttributes.of(contentAttributesFor(options)),
  cspNonce: () => (options.cspNonce ? EditorView.cspNonce.of(options.cspNonce) : []),
  ...featureExtensions(options, callbacks),
  gutterTestId: () => gutterTestId(options.testId),
});

const shallowEqualRecord = (a: Record<string, string>, b: Record<string, string>): boolean => {
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) return false;
  return aKeys.every(key => Object.hasOwn(b, key) && a[key] === b[key]);
};

const changedOptionKeys = (prev: EngineOptions, next: EngineOptions): Set<keyof EngineOptions> => {
  const changed = new Set<keyof EngineOptions>();
  for (const key of Object.keys(next) as (keyof EngineOptions)[]) {
    if (key === 'contentAttributes') {
      if (!shallowEqualRecord(prev.contentAttributes, next.contentAttributes)) changed.add(key);
    } else if (prev[key] !== next[key]) {
      changed.add(key);
    }
  }
  return changed;
};

/** Rows the editor shows; T8 switches this to `getVisibleRowCount(state)` (folds). */
const visibleRowCount = (state: EditorState): number => state.doc.lines;

interface CachedDocument {
  state: EditorState;
  options: EngineOptions;
}

export const createEditor = (
  parent: HTMLElement,
  initialOptions: EngineOptions,
  callbacks: EngineCallbacks,
): EditorHandle => {
  const compartments = {} as Record<SlotKey, Compartment>;
  for (const key of SLOT_KEYS) compartments[key] = new Compartment();

  /** Per-documentId states (history, selection, feature state); dropped on destroy. */
  const cache = new Map<string, CachedDocument>();
  let options = initialOptions;
  let lastRowCount = -1;

  const reportRowCount = (state: EditorState) => {
    const rows = visibleRowCount(state);
    if (rows === lastRowCount) return;
    lastRowCount = rows;
    callbacks.onVisibleRowCountChange(rows);
  };

  const listener = EditorView.updateListener.of((update: ViewUpdate) => {
    if (
      update.docChanged &&
      !update.transactions.some(tr => tr.annotation(externalChange) === true)
    ) {
      callbacks.onChange(update.state.doc.toString());
    }
    if (update.docChanged || update.transactions.some(tr => tr.effects.length > 0)) {
      reportRowCount(update.state);
    }
  });

  const baseExtensions: Extension = [
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    rectangularSelection(),
    crosshairCursor(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    // searchKeymap / completionKeymap / foldKeymap come with their feature extensions.
    keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
    editorTheme,
    listener,
  ];

  const createState = (doc: string, opts: EngineOptions): EditorState => {
    const builders = slotExtensions(opts, callbacks);
    return EditorState.create({
      doc,
      extensions: [baseExtensions, ...SLOT_KEYS.map(key => compartments[key].of(builders[key]()))],
    });
  };

  const view = new EditorView({ state: createState(initialOptions.value, initialOptions), parent });

  const reconfigure = (prev: EngineOptions, next: EngineOptions) => {
    const changed = changedOptionKeys(prev, next);
    const builders = slotExtensions(next, callbacks);
    const effects = SLOT_KEYS.filter(key => SLOT_DEPS[key].some(dep => changed.has(dep))).map(key =>
      compartments[key].reconfigure(builders[key]()),
    );
    if (effects.length > 0) view.dispatch({ effects });
  };

  const syncValue = (value: string) => {
    const changes = minimalChange(view.state.doc.toString(), value);
    if (!changes) return;
    view.dispatch({
      changes,
      annotations: [externalChange.of(true), Transaction.addToHistory.of(false)],
    });
  };

  const swapDocument = (prev: EngineOptions, next: EngineOptions) => {
    if (prev.documentId !== undefined) {
      cache.set(prev.documentId, { state: view.state, options: prev });
    }
    const cached = next.documentId === undefined ? undefined : cache.get(next.documentId);
    if (cached) {
      view.setState(cached.state);
      // Only what changed since this document was cached — unchanged compartments keep their state.
      reconfigure(cached.options, next);
      syncValue(next.value);
    } else {
      view.setState(createState(next.value, next));
    }
    reportRowCount(view.state);
  };

  const update = (next: EngineOptions) => {
    const prev = options;
    options = next;
    if (next.documentId !== prev.documentId) {
      swapDocument(prev, next);
      return;
    }
    reconfigure(prev, next);
    syncValue(next.value);
  };

  const api: CodeEditorApi = {
    focus: () => view.focus(),
    getValue: () => view.state.doc.toString(),
    insertText: text => {
      if (view.state.readOnly) return;
      view.dispatch({
        ...view.state.replaceSelection(text),
        userEvent: 'input',
        scrollIntoView: true,
      });
    },
    openSearch: () => {
      if (view.state.facet(searchConfigured)) openSearchPanel(view);
    },
    // T8 switches these to foldAllRegions / unfoldAllRegions.
    foldAll: () => {
      foldAll(view);
    },
    unfoldAll: () => {
      unfoldAll(view);
    },
  };

  reportRowCount(view.state);

  return {
    update,
    api,
    view,
    destroy: () => {
      cache.clear();
      view.destroy();
    },
  };
};
```

- [ ] **Step 17: Run the engine tests and confirm they pass**

Run: `pnpm vitest run src/components/CodeEditor/engine`
Expected: PASS, 7 files and 52 tests. The breakdown is:

| File | Tests |
|---|---|
| contentAttributes | 4 |
| theme | 4 |
| minimalChange | 6 |
| index | 16 |
| attributes | 9 |
| documentId | 6 |
| api | 7 |

- [ ] **Step 18: Typecheck, lint, and make sure CodeSnippet is still green**

Run each of these:
- `pnpm exec tsc --build tsconfig.app.json --noEmit`. Expected: no errors.
- `pnpm exec biome check src/components/CodeEditor/engine src/testUtils/codeEditorEngine.ts`. Expected: no errors. For formatting-only issues, use `--write`.
- `pnpm vitest run src/components/CodeSnippet`. Expected: PASS.

- [ ] **Step 19: Commit**

```bash
git add src/components/CodeEditor/engine/index.ts src/components/CodeEditor/engine/minimalChange.test.ts src/components/CodeEditor/engine/index.test.ts src/components/CodeEditor/engine/attributes.test.ts src/components/CodeEditor/engine/documentId.test.ts src/components/CodeEditor/engine/api.test.ts src/testUtils/codeEditorEngine.ts
git commit -m "feat(code-editor): add createEditor engine core with compartments, value sync and documentId cache

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Adapter painter

Spec §7.3 and D3. A `ViewPlugin` paints `SyntaxAdapter` tokens as `Decoration.mark`s. It uses the same classes as `CodeToken`: `token.className ?? TOKEN_CLASSES[token.type]`. On every change it maps the existing marks through the change right away, so text never flashes plain. It re-highlights after a debounce and drops results for a document that has since changed. If the adapter fails, it keeps the old marks and logs one `console.error`. This task also wires the painter into `createEditor`'s `painter` compartment.

Verified in a throwaway sandbox (`/private/tmp/claude-501/plan-t6`) with `@codemirror/state@6.7.6`, `@codemirror/view@6.43.13`, Vitest 4.1.10 and jsdom. The three unit test files pass (15 tests), strict `tsc` against `@wallarm-org/typescript-config/react-library.json` is clean, and `biome check` is clean. Steps 6–7 (the `createEditor` wiring) could not be run in the sandbox because they depend on T5's `engine/index.ts`.

Facts behind the design:
- `ViewPlugin.fromClass<V, Arg>(…)` plus `plugin.of(arg)` builds a new spec object `{ plugin, arg }` on every call (view `dist/index.js:1450`). `updatePlugins` matches specs by identity (`index.js:8125-8143`). So when the compartment is reconfigured with a fresh `adapterPainter(...)`, the old instance is destroyed and a new one is created. `view.plugin(painterPlugin)` still finds it because lookup goes by plugin, not by spec. That is what `getPaintedDecorations` uses.
- `TOKEN_CLASSES` is **not** exported today (`src/components/CodeSnippet/internal/CodeToken.tsx:5`, `const TOKEN_CLASSES`). The smallest fix is adding `export`. It is not re-exported from `internal/index.ts` or the public `index.ts`.
- `plainAdapter` is typed `SyntaxAdapter<PlainLanguage>`, which cannot be assigned to `SyntaxAdapter<string>`. The tests cast it exactly like `CodeSnippetRoot.tsx:114` does.

**Files:**
- Modify: `src/components/CodeSnippet/internal/CodeToken.tsx` (export `TOKEN_CLASSES`)
- Create: `src/components/CodeEditor/engine/adapterPainter.ts`
- Modify: `src/components/CodeEditor/engine/index.ts` (T5's `createEditor`: fill the `painter` compartment, then reconfigure it only when adapter or language changes)
- Test: `src/components/CodeEditor/engine/adapterPainter.test.ts` (token→range mapping, initial paint, `plainAdapter`)
- Test: `src/components/CodeEditor/engine/adapterPainter.typing.test.ts` (mapping without a flash, debounce, stale results dropped)
- Test: `src/components/CodeEditor/engine/adapterPainter.lifecycle.test.ts` (rejection, synchronous throw, reconfigure, destroy)
- Test: `src/components/CodeEditor/engine/adapterPainter.integration.test.ts` (wiring through `createEditor`)

**Interfaces:**
- Consumes:
  - `SyntaxAdapter<string>`, `HighlightResult`, `Token`, `TokenType` from `../../CodeSnippet/adapters/types`
  - `plainAdapter` from `../../CodeSnippet/adapters/plain` (tests only)
  - `TOKEN_CLASSES: Record<TokenType, string>` from `../../CodeSnippet/internal/CodeToken` (newly exported)
  - `createEditor`, `EngineOptions`, `EngineCallbacks`, `EditorHandle` (T5 and T3)
  - `createPortalRegistry` (T3)
- Produces (Shared Interfaces, exact):
  - `export const adapterPainter: (config: { adapter: SyntaxAdapter<string>; language: string; debounceMs?: number }) => Extension;`
  - `export const getPaintedDecorations: (view: EditorView) => DecorationSet;`
- Produces (additional, used only inside `engine/` and its tests):
  - `export const DEFAULT_PAINT_DEBOUNCE_MS = 100;`
  - `export const buildTokenDecorations: (doc: Text, result: HighlightResult) => DecorationSet;`
  - `export const TOKEN_CLASSES` in `CodeSnippet/internal/CodeToken.tsx` (not public)

Behaviour contract:
- On create, the painter calls `adapter.highlight(doc, language)` immediately, with no debounce.
- On a transaction with `docChanged`:
  - the marks are replaced by `decorations.map(changes)` synchronously;
  - the document version counter goes up by one;
  - the debounce (default 100 ms) restarts, and when it fires the painter highlights again.
- A result is applied only if the plugin is not destroyed and the version still matches. It is applied by dispatching a `StateEffect` that carries the new `DecorationSet`.
- If `highlight` rejects or throws synchronously, the current marks stay and `console.error` is logged once per plugin instance.
- Tokens of type `plain` with no `className` are skipped, and so is `className: ''`.
- Tokens that run past a line end, and lines past the end of the document, are clamped.
- Marks are cached one per class string.

---

- [ ] **Step 1: Export `TOKEN_CLASSES` from CodeToken**

In `src/components/CodeSnippet/internal/CodeToken.tsx`, lines 4–5:

old:
```tsx
// Token type to Tailwind class mapping
const TOKEN_CLASSES: Record<TokenType, string> = {
```
new:
```tsx
// Token type to Tailwind class mapping (also used by CodeEditor's adapter painter)
export const TOKEN_CLASSES: Record<TokenType, string> = {
```

Do not add it to `internal/index.ts` or `CodeSnippet/index.ts`. The CodeEditor engine imports it by relative path.

Run: `pnpm vitest run src/components/CodeSnippet`
Expected: PASS. The existing CodeSnippet tests do not change.

- [ ] **Step 2: Write the failing unit test (mapping and initial paint)**

Create `src/components/CodeEditor/engine/adapterPainter.test.ts`:

```ts
import { EditorState, Text } from '@codemirror/state';
import { type DecorationSet, EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { plainAdapter } from '../../CodeSnippet/adapters/plain';
import type { HighlightResult, SyntaxAdapter, Token } from '../../CodeSnippet/adapters/types';
import { adapterPainter, buildTokenDecorations, getPaintedDecorations } from './adapterPainter';

type PaintedRange = { from: number; to: number; className: string };

const collect = (set: DecorationSet): PaintedRange[] => {
  const ranges: PaintedRange[] = [];
  set.between(0, Number.MAX_SAFE_INTEGER, (from, to, value) => {
    ranges.push({ from, to, className: String(value.spec.class) });
  });
  return ranges;
};

/** Splits every line into words (keyword) and runs of spaces (plain). */
const wordTokens = (code: string): HighlightResult => ({
  tokens: code.split('\n').map(line =>
    (line.match(/\s+|\S+/g) ?? []).map(
      (content): Token => ({
        content,
        type: /\s/.test(content) ? 'plain' : 'keyword',
      }),
    ),
  ),
});

const wordAdapter = () => {
  const highlight = vi.fn<SyntaxAdapter<string>['highlight']>(async code => wordTokens(code));
  const adapter: SyntaxAdapter<string> = {
    name: 'words',
    highlight,
    getSupportedLanguages: () => ['words'],
  };
  return { adapter, highlight };
};

const mount = (doc: string, extension: ReturnType<typeof adapterPainter>): EditorView => {
  const parent = document.createElement('div');
  document.body.append(parent);
  return new EditorView({ state: EditorState.create({ doc, extensions: [extension] }), parent });
};

describe('buildTokenDecorations', () => {
  it('maps per-line tokens to document offsets with TOKEN_CLASSES', () => {
    const doc = Text.of(['GET /a', 'Host: x']);
    const result: HighlightResult = {
      tokens: [
        [
          { content: 'GET', type: 'function' },
          { content: ' ', type: 'plain' },
          { content: '/a', type: 'string' },
        ],
        [
          { content: 'Host', type: 'attr-name' },
          { content: ': ', type: 'punctuation' },
          { content: 'x', type: 'attr-value' },
        ],
      ],
    };

    expect(collect(buildTokenDecorations(doc, result))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-function' },
      { from: 4, to: 6, className: 'text-syntax-string' },
      { from: 7, to: 11, className: 'text-syntax-attr-name' },
      { from: 11, to: 13, className: 'text-syntax-punctuation' },
      { from: 13, to: 14, className: 'text-syntax-attr-value' },
    ]);
  });

  it('prefers token.className over the type class, and keeps plain tokens that carry a className', () => {
    const doc = Text.of(['ab']);
    const result: HighlightResult = {
      tokens: [
        [
          { content: 'a', type: 'keyword', className: 'text-syntax-string' },
          { content: 'b', type: 'plain', className: 'text-syntax-comment italic' },
        ],
      ],
    };

    expect(collect(buildTokenDecorations(doc, result))).toEqual([
      { from: 0, to: 1, className: 'text-syntax-string' },
      { from: 1, to: 2, className: 'text-syntax-comment italic' },
    ]);
  });

  it('clamps tokens and lines that run past the document', () => {
    const doc = Text.of(['abc']);
    const result: HighlightResult = {
      tokens: [
        [
          { content: 'ab', type: 'keyword' },
          { content: 'cdef', type: 'string' },
          { content: 'zz', type: 'number' },
        ],
        [{ content: 'extra', type: 'keyword' }],
      ],
    };

    expect(collect(buildTokenDecorations(doc, result))).toEqual([
      { from: 0, to: 2, className: 'text-syntax-keyword' },
      { from: 2, to: 3, className: 'text-syntax-string' },
    ]);
  });
});

describe('adapterPainter — initial paint', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('highlights on create and applies classes to the right ranges', async () => {
    vi.useFakeTimers();
    const { adapter, highlight } = wordAdapter();
    const view = mount('GET /a\nHost: x', adapterPainter({ adapter, language: 'http' }));

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(highlight).toHaveBeenCalledWith('GET /a\nHost: x', 'http');

    await vi.advanceTimersByTimeAsync(0);

    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-keyword' },
      { from: 4, to: 6, className: 'text-syntax-keyword' },
      { from: 7, to: 12, className: 'text-syntax-keyword' },
      { from: 13, to: 14, className: 'text-syntax-keyword' },
    ]);
    expect(view.contentDOM.querySelectorAll('.text-syntax-keyword')).toHaveLength(4);
    view.destroy();
  });

  it('plainAdapter produces no marks', async () => {
    vi.useFakeTimers();
    const highlight = vi.spyOn(plainAdapter, 'highlight');
    // Same cast CodeSnippetRoot applies to its plainAdapter fallback.
    const adapter = plainAdapter as SyntaxAdapter<string>;
    const view = mount('line one\nline two', adapterPainter({ adapter, language: 'text' }));

    await vi.advanceTimersByTimeAsync(0);

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(getPaintedDecorations(view).size).toBe(0);
    highlight.mockRestore();
    view.destroy();
  });

  it('returns an empty set when the painter is not installed', () => {
    const parent = document.createElement('div');
    const view = new EditorView({ state: EditorState.create({ doc: 'x' }), parent });

    expect(getPaintedDecorations(view).size).toBe(0);
    view.destroy();
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm vitest run src/components/CodeEditor/engine/adapterPainter.test.ts`
Expected: FAIL, because `./adapterPainter` does not exist yet (`Failed to resolve import "./adapterPainter"`).

- [ ] **Step 4: Implement `engine/adapterPainter.ts`**

Create `src/components/CodeEditor/engine/adapterPainter.ts`:

```ts
import { type Extension, RangeSetBuilder, StateEffect, type Text } from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  type PluginValue,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import type { HighlightResult, SyntaxAdapter, TokenType } from '../../CodeSnippet/adapters/types';
import { TOKEN_CLASSES } from '../../CodeSnippet/internal/CodeToken';

/** Delay between the last document change and the adapter re-highlight (spec §7.3). */
export const DEFAULT_PAINT_DEBOUNCE_MS = 100;

interface PainterConfig {
  adapter: SyntaxAdapter<string>;
  language: string;
  debounceMs: number;
}

/** Carries a freshly built token decoration set from an async adapter result into the view. */
const paintEffect = StateEffect.define<DecorationSet>();

/** One shared mark per class string — tokens of the same type reuse the same Decoration. */
const markCache = new Map<string, Decoration>();

const markFor = (className: string): Decoration => {
  let mark = markCache.get(className);
  if (!mark) {
    mark = Decoration.mark({ class: className });
    markCache.set(className, mark);
  }
  return mark;
};

/**
 * Same priority as CodeSnippet's `CodeToken`: `token.className ?? TOKEN_CLASSES[token.type]`.
 * Plain tokens without an explicit className are skipped — `text-syntax-no-syntax` equals
 * the editor's default text colour, so marking them only adds decorations.
 */
const tokenClass = (className: string | undefined, type: TokenType): string | null => {
  if (className !== undefined) return className === '' ? null : className;
  if (type === 'plain') return null;
  return TOKEN_CLASSES[type];
};

/**
 * Converts an adapter result (tokens per line, offsets implied by `content.length`)
 * into mark decorations over `doc`. Lines or token text beyond the document are clamped,
 * so a result that does not exactly match the document never throws.
 */
export const buildTokenDecorations = (doc: Text, result: HighlightResult): DecorationSet => {
  const builder = new RangeSetBuilder<Decoration>();
  const lineCount = Math.min(result.tokens.length, doc.lines);

  for (let index = 0; index < lineCount; index++) {
    const line = doc.line(index + 1);
    const lineTokens = result.tokens[index] ?? [];
    let offset = line.from;

    for (const token of lineTokens) {
      const from = offset;
      offset += token.content.length;
      if (from >= line.to) break;
      const to = Math.min(offset, line.to);
      if (to <= from) continue;
      const className = tokenClass(token.className, token.type);
      if (className) builder.add(from, to, markFor(className));
    }
  }

  return builder.finish();
};

class PainterPluginValue implements PluginValue {
  decorations: DecorationSet = Decoration.none;

  private readonly view: EditorView;
  private readonly config: PainterConfig;
  /** Bumped on every document change; a result is applied only if it still matches. */
  private docVersion = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private errorReported = false;

  constructor(view: EditorView, config: PainterConfig) {
    this.view = view;
    this.config = config;
    this.request();
  }

  update(update: ViewUpdate): void {
    if (update.docChanged) {
      // Keep existing colours attached to the text they belong to until the next result.
      this.decorations = this.decorations.map(update.changes);
      this.docVersion++;
      this.schedule();
    }
    for (const transaction of update.transactions) {
      for (const effect of transaction.effects) {
        if (effect.is(paintEffect)) this.decorations = effect.value;
      }
    }
  }

  destroy(): void {
    this.destroyed = true;
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  private schedule(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.request();
    }, this.config.debounceMs);
  }

  private request(): void {
    const version = this.docVersion;
    const doc = this.view.state.doc;
    const { adapter, language } = this.config;

    let pending: Promise<HighlightResult>;
    try {
      pending = adapter.highlight(doc.toString(), language);
    } catch (error) {
      this.reportError(error);
      return;
    }

    pending.then(
      result => {
        if (this.destroyed || version !== this.docVersion) return;
        this.view.dispatch({ effects: paintEffect.of(buildTokenDecorations(doc, result)) });
      },
      (error: unknown) => {
        if (this.destroyed) return;
        this.reportError(error);
      },
    );
  }

  private reportError(error: unknown): void {
    if (this.errorReported) return;
    this.errorReported = true;
    // biome-ignore lint/suspicious/noConsole: adapter failures are otherwise invisible (colours just stop updating)
    console.error(
      `[CodeEditor] Syntax adapter "${this.config.adapter.name}" failed to highlight "${this.config.language}"; keeping previous colours.`,
      error,
    );
  }
}

const painterPlugin = ViewPlugin.fromClass<PainterPluginValue, PainterConfig>(PainterPluginValue, {
  decorations: plugin => plugin.decorations,
});

/**
 * Paints `SyntaxAdapter` tokens as mark decorations (spec §7.3, D3).
 * Every call returns a new plugin spec, so reconfiguring the painter compartment with a
 * new adapter/language destroys the old instance and highlights again from scratch.
 */
export const adapterPainter = (config: {
  adapter: SyntaxAdapter<string>;
  language: string;
  debounceMs?: number;
}): Extension =>
  painterPlugin.of({
    adapter: config.adapter,
    language: config.language,
    debounceMs: config.debounceMs ?? DEFAULT_PAINT_DEBOUNCE_MS,
  });

/** The painter's current token decorations (tests / diagnostics only). */
export const getPaintedDecorations = (view: EditorView): DecorationSet =>
  view.plugin(painterPlugin)?.decorations ?? Decoration.none;
```

Run: `pnpm vitest run src/components/CodeEditor/engine/adapterPainter.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Add typing, debounce and stale-result tests**

Create `src/components/CodeEditor/engine/adapterPainter.typing.test.ts`:

```ts
import { EditorState } from '@codemirror/state';
import { type DecorationSet, EditorView } from '@codemirror/view';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HighlightResult, SyntaxAdapter, Token } from '../../CodeSnippet/adapters/types';
import { adapterPainter, getPaintedDecorations } from './adapterPainter';

type PaintedRange = { from: number; to: number; className: string };

const collect = (set: DecorationSet): PaintedRange[] => {
  const ranges: PaintedRange[] = [];
  set.between(0, Number.MAX_SAFE_INTEGER, (from, to, value) => {
    ranges.push({ from, to, className: String(value.spec.class) });
  });
  return ranges;
};

/** Every non-space run is a keyword; spaces are plain. */
const wordTokens = (code: string): HighlightResult => ({
  tokens: code.split('\n').map(line =>
    (line.match(/\s+|\S+/g) ?? []).map(
      (content): Token => ({
        content,
        type: /\s/.test(content) ? 'plain' : 'keyword',
      }),
    ),
  ),
});

type Deferred = {
  code: string;
  resolve: (result: HighlightResult) => void;
  reject: (error: unknown) => void;
};

/** Adapter whose every highlight() call stays pending until the test settles it. */
const deferredAdapter = () => {
  const calls: Deferred[] = [];
  const highlight = vi.fn<SyntaxAdapter<string>['highlight']>(
    code =>
      new Promise<HighlightResult>((resolve, reject) => {
        calls.push({ code, resolve, reject });
      }),
  );
  const adapter: SyntaxAdapter<string> = {
    name: 'deferred',
    highlight,
    getSupportedLanguages: () => ['words'],
  };
  return { adapter, highlight, calls };
};

const mount = (doc: string, adapter: SyntaxAdapter<string>): EditorView => {
  const parent = document.createElement('div');
  document.body.append(parent);
  return new EditorView({
    state: EditorState.create({
      doc,
      extensions: [adapterPainter({ adapter, language: 'words' })],
    }),
    parent,
  });
};

describe('adapterPainter — typing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('maps existing decorations through changes immediately (no flash) and re-highlights after 100ms', async () => {
    const { adapter, highlight, calls } = deferredAdapter();
    const view = mount('foo bar', adapter);
    calls[0]?.resolve(wordTokens('foo bar'));
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-keyword' },
      { from: 4, to: 7, className: 'text-syntax-keyword' },
    ]);

    view.dispatch({ changes: { from: 0, insert: 'xx ' } });

    // Before the debounce fires the old colours follow their text.
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 3, to: 6, className: 'text-syntax-keyword' },
      { from: 7, to: 10, className: 'text-syntax-keyword' },
    ]);
    await vi.advanceTimersByTimeAsync(99);
    expect(highlight).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(highlight).toHaveBeenCalledTimes(2);
    expect(calls[1]?.code).toBe('xx foo bar');

    calls[1]?.resolve(wordTokens('xx foo bar'));
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 2, className: 'text-syntax-keyword' },
      { from: 3, to: 6, className: 'text-syntax-keyword' },
      { from: 7, to: 10, className: 'text-syntax-keyword' },
    ]);
    view.destroy();
  });

  it('restarts the debounce on every keystroke', async () => {
    const { adapter, highlight, calls } = deferredAdapter();
    const view = mount('a', adapter);
    calls[0]?.resolve(wordTokens('a'));
    await vi.advanceTimersByTimeAsync(0);

    view.dispatch({ changes: { from: 1, insert: 'b' } });
    await vi.advanceTimersByTimeAsync(60);
    view.dispatch({ changes: { from: 2, insert: 'c' } });
    await vi.advanceTimersByTimeAsync(60);
    expect(highlight).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(40);
    expect(highlight).toHaveBeenCalledTimes(2);
    expect(calls[1]?.code).toBe('abc');
    view.destroy();
  });

  it('drops a result when the document changed while the highlight was pending', async () => {
    const { adapter, calls } = deferredAdapter();
    const view = mount('one', adapter);

    view.dispatch({ changes: { from: 0, to: 3, insert: 'two words' } });
    // The stale result describes 'one' — applying it would paint the wrong ranges.
    calls[0]?.resolve({ tokens: [[{ content: 'one', type: 'string' }]] });
    await vi.advanceTimersByTimeAsync(0);
    expect(getPaintedDecorations(view).size).toBe(0);

    await vi.advanceTimersByTimeAsync(100);
    expect(calls[1]?.code).toBe('two words');
    calls[1]?.resolve(wordTokens('two words'));
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-keyword' },
      { from: 4, to: 9, className: 'text-syntax-keyword' },
    ]);
    view.destroy();
  });

  it('ignores transactions that do not change the document', async () => {
    const { adapter, highlight, calls } = deferredAdapter();
    const view = mount('abc', adapter);
    calls[0]?.resolve(wordTokens('abc'));
    await vi.advanceTimersByTimeAsync(0);

    view.dispatch({ selection: { anchor: 2 } });
    await vi.advanceTimersByTimeAsync(200);

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(getPaintedDecorations(view).size).toBe(1);
    view.destroy();
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/adapterPainter.typing.test.ts`
Expected: PASS (4 tests). This step pins down behaviour that is already implemented. If any test fails, fix `adapterPainter.ts`, not the test.

- [ ] **Step 6: Add lifecycle tests (rejection, synchronous throw, reconfigure, destroy)**

Create `src/components/CodeEditor/engine/adapterPainter.lifecycle.test.ts`:

```ts
import { Compartment, EditorState } from '@codemirror/state';
import { type DecorationSet, EditorView } from '@codemirror/view';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HighlightResult, SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import { adapterPainter, getPaintedDecorations } from './adapterPainter';

type PaintedRange = { from: number; to: number; className: string };

const collect = (set: DecorationSet): PaintedRange[] => {
  const ranges: PaintedRange[] = [];
  set.between(0, Number.MAX_SAFE_INTEGER, (from, to, value) => {
    ranges.push({ from, to, className: String(value.spec.class) });
  });
  return ranges;
};

/** Paints each whole line with one token of the given type. */
const lineAdapter = (name: string, type: 'keyword' | 'string') => {
  const highlight = vi.fn<SyntaxAdapter<string>['highlight']>(
    async (code): Promise<HighlightResult> => ({
      tokens: code.split('\n').map(line => [{ content: line, type }]),
    }),
  );
  const adapter: SyntaxAdapter<string> = {
    name,
    highlight,
    getSupportedLanguages: () => ['json', 'yaml'],
  };
  return { adapter, highlight };
};

const mount = (
  doc: string,
  extension: ReturnType<typeof adapterPainter>,
  compartment: Compartment,
): EditorView => {
  const parent = document.createElement('div');
  document.body.append(parent);
  return new EditorView({
    state: EditorState.create({ doc, extensions: [compartment.of(extension)] }),
    parent,
  });
};

describe('adapterPainter — lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('keeps the previous (mapped) marks and logs once when highlight rejects', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let fail = false;
    const highlight = vi.fn<SyntaxAdapter<string>['highlight']>(async code => {
      if (fail) throw new Error('tokenizer crashed');
      return {
        tokens: code.split('\n').map(line => [{ content: line, type: 'keyword' as const }]),
      };
    });
    const adapter: SyntaxAdapter<string> = {
      name: 'flaky',
      highlight,
      getSupportedLanguages: () => ['json'],
    };
    const painter = new Compartment();
    const view = mount('abc', adapterPainter({ adapter, language: 'json' }), painter);
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-keyword' },
    ]);

    fail = true;
    view.dispatch({ changes: { from: 0, insert: 'z' } });
    await vi.advanceTimersByTimeAsync(100);
    view.dispatch({ changes: { from: 0, insert: 'y' } });
    await vi.advanceTimersByTimeAsync(100);

    expect(highlight).toHaveBeenCalledTimes(3);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 2, to: 5, className: 'text-syntax-keyword' },
    ]);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0]?.[0])).toContain('flaky');
    view.destroy();
  });

  it('treats a synchronous throw like a rejection', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const adapter: SyntaxAdapter<string> = {
      name: 'throws',
      highlight: () => {
        throw new Error('sync failure');
      },
      getSupportedLanguages: () => ['json'],
    };
    const view = mount('abc', adapterPainter({ adapter, language: 'json' }), new Compartment());
    await vi.advanceTimersByTimeAsync(0);

    expect(getPaintedDecorations(view).size).toBe(0);
    expect(consoleError).toHaveBeenCalledTimes(1);
    view.destroy();
  });

  it('re-highlights with the new adapter and language when the compartment is reconfigured', async () => {
    const first = lineAdapter('first', 'keyword');
    const second = lineAdapter('second', 'string');
    const painter = new Compartment();
    const view = mount(
      'key: 1',
      adapterPainter({ adapter: first.adapter, language: 'json' }),
      painter,
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 6, className: 'text-syntax-keyword' },
    ]);

    view.dispatch({
      effects: painter.reconfigure(adapterPainter({ adapter: second.adapter, language: 'yaml' })),
    });
    await vi.advanceTimersByTimeAsync(0);

    expect(second.highlight).toHaveBeenCalledWith('key: 1', 'yaml');
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 6, className: 'text-syntax-string' },
    ]);
    expect(first.highlight).toHaveBeenCalledTimes(1);
    view.destroy();
  });

  it('ignores a result that arrives after the old painter instance was replaced', async () => {
    let resolveFirst: (result: HighlightResult) => void = () => undefined;
    const slow: SyntaxAdapter<string> = {
      name: 'slow',
      highlight: () =>
        new Promise<HighlightResult>(resolve => {
          resolveFirst = resolve;
        }),
      getSupportedLanguages: () => ['json'],
    };
    const fast = lineAdapter('fast', 'string');
    const painter = new Compartment();
    const view = mount('abc', adapterPainter({ adapter: slow, language: 'json' }), painter);

    view.dispatch({
      effects: painter.reconfigure(adapterPainter({ adapter: fast.adapter, language: 'json' })),
    });
    await vi.advanceTimersByTimeAsync(0);
    resolveFirst({ tokens: [[{ content: 'abc', type: 'keyword' }]] });
    await vi.advanceTimersByTimeAsync(0);

    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-string' },
    ]);
    view.destroy();
  });

  it('cancels the pending debounce on destroy', async () => {
    const { adapter, highlight } = lineAdapter('lines', 'keyword');
    const view = mount('abc', adapterPainter({ adapter, language: 'json' }), new Compartment());
    await vi.advanceTimersByTimeAsync(0);

    view.dispatch({ changes: { from: 0, insert: 'x' } });
    view.destroy();
    await vi.advanceTimersByTimeAsync(500);

    expect(highlight).toHaveBeenCalledTimes(1);
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/adapterPainter.lifecycle.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 7: Typecheck, lint and commit the painter**

Run from `packages/design-system/`:
- `pnpm exec tsc --build tsconfig.app.json --noEmit` (expected: no errors)
- `pnpm exec biome check src/components/CodeEditor/engine/adapterPainter.ts src/components/CodeEditor/engine/adapterPainter.test.ts src/components/CodeEditor/engine/adapterPainter.typing.test.ts src/components/CodeEditor/engine/adapterPainter.lifecycle.test.ts src/components/CodeSnippet/internal/CodeToken.tsx` (expected: no errors; the single `console.error` carries a `biome-ignore lint/suspicious/noConsole`, following the repo convention in `RemoteShell.tsx:91`)
- `pnpm vitest run src/components/CodeEditor/engine/adapterPainter src/components/CodeSnippet` (expected: PASS)

```bash
git add packages/design-system/src/components/CodeSnippet/internal/CodeToken.tsx \
  packages/design-system/src/components/CodeEditor/engine/adapterPainter.ts \
  packages/design-system/src/components/CodeEditor/engine/adapterPainter.test.ts \
  packages/design-system/src/components/CodeEditor/engine/adapterPainter.typing.test.ts \
  packages/design-system/src/components/CodeEditor/engine/adapterPainter.lifecycle.test.ts
git commit -m "$(cat <<'EOF'
feat(code-editor): add adapter painter for SyntaxAdapter token colours

ViewPlugin that paints SyntaxAdapter tokens as CM mark decorations with
CodeSnippet's TOKEN_CLASSES, maps them through edits so text never
flashes plain, debounces re-highlighting (100ms), drops stale results
and keeps previous colours when the adapter rejects.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 8: Write the failing wiring test through `createEditor`**

Create `src/components/CodeEditor/engine/adapterPainter.integration.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HighlightResult, SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import { createPortalRegistry } from '../lib/portalRegistry';
import { getPaintedDecorations } from './adapterPainter';
import { createEditor } from './index';
import type { EditorHandle, EngineCallbacks, EngineOptions } from './types';

const lineAdapter = (name: string, type: 'keyword' | 'string') => {
  const highlight = vi.fn<SyntaxAdapter<string>['highlight']>(
    async (code): Promise<HighlightResult> => ({
      tokens: code.split('\n').map(line => [{ content: line, type }]),
    }),
  );
  const adapter: SyntaxAdapter<string> = {
    name,
    highlight,
    getSupportedLanguages: () => ['json', 'yaml'],
  };
  return { adapter, highlight };
};

const baseOptions = (adapter: SyntaxAdapter<string>): EngineOptions => ({
  value: '{"a": 1}',
  documentId: undefined,
  language: 'json',
  readOnly: false,
  wrapLines: false,
  startingLineNumber: 1,
  lineNumbers: true,
  lines: {},
  folds: undefined,
  adapter,
  original: undefined,
  schema: undefined,
  completions: [],
  diagnostics: [],
  contentAttributes: {},
  testId: undefined,
  cspNonce: undefined,
  maxHeight: null,
});

const makeCallbacks = (): EngineCallbacks => ({
  onChange: vi.fn(),
  onDiagnosticsChange: vi.fn(),
  onVisibleRowCountChange: vi.fn(),
  portals: createPortalRegistry(),
});

describe('createEditor — adapter painter wiring', () => {
  let handle: EditorHandle | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    handle?.destroy();
    handle = null;
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  const mount = (options: EngineOptions): EditorHandle => {
    const parent = document.createElement('div');
    document.body.append(parent);
    handle = createEditor(parent, options, makeCallbacks());
    return handle;
  };

  it('paints adapter tokens on create', async () => {
    const { adapter, highlight } = lineAdapter('lines', 'keyword');
    const editor = mount(baseOptions(adapter));
    await vi.advanceTimersByTimeAsync(0);

    expect(highlight).toHaveBeenCalledWith('{"a": 1}', 'json');
    expect(getPaintedDecorations(editor.view).size).toBe(1);
  });

  it('does not re-highlight when an unrelated option changes', async () => {
    const { adapter, highlight } = lineAdapter('lines', 'keyword');
    const options = baseOptions(adapter);
    const editor = mount(options);
    await vi.advanceTimersByTimeAsync(0);
    const painted = getPaintedDecorations(editor.view);

    editor.update({ ...options, readOnly: true, wrapLines: true });
    await vi.advanceTimersByTimeAsync(200);

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(getPaintedDecorations(editor.view)).toBe(painted);
  });

  it('re-highlights when language or adapter changes', async () => {
    const first = lineAdapter('first', 'keyword');
    const second = lineAdapter('second', 'string');
    const options = baseOptions(first.adapter);
    const editor = mount(options);
    await vi.advanceTimersByTimeAsync(0);

    editor.update({ ...options, language: 'yaml' });
    await vi.advanceTimersByTimeAsync(0);
    expect(first.highlight).toHaveBeenLastCalledWith('{"a": 1}', 'yaml');

    editor.update({ ...options, language: 'yaml', adapter: second.adapter });
    await vi.advanceTimersByTimeAsync(0);
    expect(second.highlight).toHaveBeenCalledWith('{"a": 1}', 'yaml');
    expect(first.highlight).toHaveBeenCalledTimes(2);
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/adapterPainter.integration.test.ts`
Expected: FAIL. "paints adapter tokens on create" fails (`highlight` never called, size `0`) because the `painter` compartment in T5 is still empty.

- [ ] **Step 9: Register the painter in `createEditor` (edit T5's `engine/index.ts`)**

T5 builds one extension per compartment in `featureExtensions(options, callbacks)`. Its `painter` entry is an empty placeholder, and `update()` reconfigures a compartment only when that compartment's inputs changed.

(a) Add the import next to the other engine-module imports at the top of `src/components/CodeEditor/engine/index.ts`:
```ts
import { adapterPainter } from './adapterPainter';
```

(b) In `featureExtensions`, replace the placeholder:

old:
```ts
    painter: [],
```
new:
```ts
    painter: adapterPainter({ adapter: options.adapter, language: options.language }),
```

(c) In the change-detection used by `handle.update(next)` (T5's per-compartment "changed?" predicates), the painter predicate must be exactly:

old:
```ts
    painter: () => false,
```
new:
```ts
    painter: (prev, next) => prev.adapter !== next.adapter || prev.language !== next.language,
```

Why the predicate must be exact: every `adapterPainter(...)` call yields a new plugin spec, so any reconfigure destroys the painter and re-highlights from nothing. Reconfiguring on unrelated option changes would make colours flash, and the "does not re-highlight" test catches that. If T5 wrote its placeholder or predicate map in a different form, keep T5's form and apply only these rules:
- the painter compartment holds `adapterPainter({ adapter: options.adapter, language: options.language })`;
- it is reconfigured only when `adapter` or `language` changes.

`view.setState(...)` on a `documentId` switch recreates every plugin by design, so a restored document re-highlights once.

Run: `pnpm vitest run src/components/CodeEditor/engine/adapterPainter.integration.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 10: Full engine run, typecheck, lint, commit**

Run from `packages/design-system/`:
- `pnpm vitest run src/components/CodeEditor src/components/CodeSnippet` (expected: PASS, including T5's engine tests)
- `pnpm exec tsc --build tsconfig.app.json --noEmit` (expected: no errors)
- `pnpm exec biome check src/components/CodeEditor/engine/index.ts src/components/CodeEditor/engine/adapterPainter.integration.test.ts` (expected: no errors)

```bash
git add packages/design-system/src/components/CodeEditor/engine/index.ts \
  packages/design-system/src/components/CodeEditor/engine/adapterPainter.integration.test.ts
git commit -m "$(cat <<'EOF'
feat(code-editor): wire adapter painter into createEditor

The painter compartment now holds adapterPainter(adapter, language) and
is reconfigured only when the adapter or language changes, so unrelated
option updates never repaint.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: lines decorations + gutters

**Files:**
- Create: `src/components/CodeEditor/engine/lines.ts`
- Create: `src/components/CodeEditor/engine/gutters.ts`
- Modify: `src/components/CodeEditor/engine/index.ts` (T5's `featureExtensions`: register lines and gutters)
- Test: `src/components/CodeEditor/engine/cssPropertiesToString.test.ts`
- Test: `src/components/CodeEditor/engine/lines.test.ts`
- Test: `src/components/CodeEditor/engine/gutters.test.ts`
- Test: `src/components/CodeEditor/engine/linesGutters.integration.test.ts`

**Interfaces:**
- Consumes:
  - `lineNumberToDocLine(doc: Text, absoluteLine: number, startingLineNumber: number): Line | null` from `engine/positions.ts` (T3)
  - `PortalRegistry` (`register`/`unregister`/`getSnapshot`) and `createPortalRegistry()` from `lib/portalRegistry.ts` (T3)
  - `EngineOptions`, `EngineCallbacks`, `createEditor` (T5)
  - From CodeSnippet, by relative path: `LineConfig`, `LineColor` (`CodeSnippet/CodeSnippetContext.ts`), `LINE_COLOR_STYLES` (`CodeSnippet/lib/lineStyles.ts`) and `getLineTextStyles` (`CodeSnippet/lib/lineUtils.ts`)
- Produces (matches the skeleton):
  - `export const linesExtension: (config: { lines: Record<number, LineConfig>; startingLineNumber: number }) => Extension;`
  - `export const getLineDecorations: (state: EditorState) => DecorationSet;`
  - `export const guttersExtension: (config: { lines: Record<number, LineConfig>; startingLineNumber: number; lineNumbers: boolean; foldGutter: Extension | null; portals: PortalRegistry; testId: string | undefined }) => Extension;`
  - Additional exports, used only inside the engine and its tests:
    - `export interface LinesConfig { lines: Record<number, LineConfig>; startingLineNumber: number }`
    - `export const cssPropertiesToString: (style: CSSProperties | undefined) => string;`
    - `export interface GuttersConfig` (the config type of `guttersExtension`)
    - `export const STICK_GUTTER_CLASS = 'cm-ds-stick';`
    - `export const PREFIX_GUTTER_CLASS = 'cm-ds-prefix';`

**Design notes (checked in jsdom against the CM versions pinned in Global Constraints):**
- **Why marks, not only `.cm-line` classes.** CodeToken's colour order is range colour, then line colour, then token colour. A text colour on `.cm-line` loses to the painter's token spans, so line and range text colours are also emitted as `Decoration.mark`. `Prec.high` makes these the innermost spans; this was checked against a default-precedence painter mark: `.text-syntax-keyword > .text-syntax-highlight-warning-code`.
- **Rebuild, don't map.** `lines` are keyed by absolute line number (D6), so the field is rebuilt on every `docChanged`. It reads its config from a module-level Facet, so `getLineDecorations` finds one stable field, and a reconfigure is detected by comparing facet values.
- **Gutter cell colours.** The line background goes on every gutter cell (stick, number, fold, prefix) through `gutterLineClass`. CodeSnippet also paints each gutter column's cells, and FoldColumn has a background. The line text colour goes on the number cell through `lineNumberMarkers`, as `CodeSnippetLineNumbers` does, and on the prefix cell through its marker class.
- **Line-number styling goes in a theme.** CM's `lineNumbers` has no class option. Its base theme pads `.cm-lineNumbers .cm-gutterElement` with `0 3px 0 5px`. A small `EditorView.theme` in `gutters.ts` changes that to `0 8px` and sets `text-text-secondary` (`var(--color-text-secondary)`) on the `.cm-lineNumbers` column. The colour sits on the column, so a colour class on a cell still wins over the inherited value.
- **Prefix portal ids.** Ids are stored in a module-level `WeakMap<Node, number>` keyed by the host node. When CM keeps the DOM of a marker that is `eq`, it still swaps in the new marker instance (`GutterElement.setMarkers` ends with `this.markers = markers`). So `destroy` can run on an instance other than the one that called `toDOM`, and a per-instance map would leak ids.
- **Dependency on T5 (the 8px gap).** In CodeSnippet, the 8px gap between gutter and code (`mr-8`) shows the line highlight, because the highlight layer spans the whole row. For visual parity, T5's theme should build that gap as `.cm-line` left padding, not as a margin on `.cm-gutters`. A `.cm-line` background only covers the line box.

- [ ] **Step 1: Write the failing `cssPropertiesToString` test**

Create `src/components/CodeEditor/engine/cssPropertiesToString.test.ts`:

```ts
import type { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';
import { cssPropertiesToString } from './lines';

/** Consumer styles may carry custom properties and loose values that `CSSProperties` does not model. */
const looseStyle = (value: Record<string, unknown>): CSSProperties => value as CSSProperties;

describe('cssPropertiesToString', () => {
  it('returns an empty string for undefined or empty styles', () => {
    expect(cssPropertiesToString(undefined)).toBe('');
    expect(cssPropertiesToString({})).toBe('');
  });

  it('converts camelCase properties to kebab-case', () => {
    expect(cssPropertiesToString({ backgroundColor: 'red', textDecorationLine: 'underline' })).toBe(
      'background-color: red; text-decoration-line: underline',
    );
  });

  it('adds px to numbers except unitless properties and zero', () => {
    expect(
      cssPropertiesToString({ paddingLeft: 4, opacity: 0.5, lineHeight: 2, zIndex: 3, margin: 0 }),
    ).toBe('padding-left: 4px; opacity: 0.5; line-height: 2; z-index: 3; margin: 0');
  });

  it('keeps custom properties verbatim and never adds px to them', () => {
    expect(
      cssPropertiesToString(looseStyle({ '--line-accent': 3, '--line-color': ' blue ' })),
    ).toBe('--line-accent: 3; --line-color: blue');
  });

  it('prefixes vendor properties like react-dom does', () => {
    expect(cssPropertiesToString({ WebkitLineClamp: 2, msTransform: 'none' })).toBe(
      '-webkit-line-clamp: 2; -ms-transform: none',
    );
  });

  it('skips undefined, null, boolean and empty-string values', () => {
    expect(
      cssPropertiesToString(
        looseStyle({
          color: undefined,
          fontStyle: '',
          outline: null,
          display: false,
          fontWeight: 600,
        }),
      ),
    ).toBe('font-weight: 600');
  });
});
```

- [ ] **Step 2: Write the failing `linesExtension` test**

Create `src/components/CodeEditor/engine/lines.test.ts`:

```ts
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { getLineDecorations, linesExtension } from './lines';

interface CollectedDecoration {
  from: number;
  to: number;
  kind: 'line' | 'mark';
  className: string;
  style: string | undefined;
}

const collect = (state: EditorState): CollectedDecoration[] => {
  const result: CollectedDecoration[] = [];
  getLineDecorations(state).between(0, state.doc.length, (from, to, value) => {
    const spec = value.spec as { class?: string; attributes?: Record<string, string> };
    result.push({
      from,
      to,
      kind: from === to ? 'line' : 'mark',
      className: spec.class ?? '',
      style: spec.attributes?.style,
    });
  });
  return result;
};

const createState = (
  doc: string,
  lines: Record<number, LineConfig>,
  startingLineNumber = 1,
  extra: Extension = [],
): EditorState =>
  EditorState.create({ doc, extensions: [linesExtension({ lines, startingLineNumber }), extra] });

let view: EditorView | null = null;
afterEach(() => {
  view?.destroy();
  view = null;
});

describe('linesExtension', () => {
  it('returns an empty set when the extension is not installed', () => {
    const state = EditorState.create({ doc: 'a' });
    expect(getLineDecorations(state).size).toBe(0);
  });

  it('decorates a coloured line by absolute line number (startingLineNumber 10)', () => {
    const state = createState('first\nsecond\nthird', { 11: { color: 'danger' } }, 10);
    const decorations = collect(state);

    const line = decorations.find(d => d.kind === 'line');
    expect(line?.from).toBe(6);
    expect(line?.className).toContain('bg-syntax-highlight-error-highlight');
    expect(line?.className).toContain('text-syntax-highlight-error-code');

    // Whole-line text colour is also an innermost mark so it beats token colours
    const mark = decorations.find(d => d.kind === 'mark');
    expect(mark).toMatchObject({ from: 6, to: 12 });
    expect(mark?.className).toContain('text-syntax-highlight-error-code');
  });

  it('ignores line numbers outside the document', () => {
    const state = createState('only', { 0: { color: 'info' }, 5: { color: 'info' } });
    expect(collect(state)).toEqual([]);
  });

  it('applies textStyle, className and serialized style on the line', () => {
    const state = createState('code', {
      1: { textStyle: 'italic', className: 'my-line', style: { paddingLeft: 4, opacity: 0.5 } },
    });
    const [line] = collect(state);
    expect(line?.kind).toBe('line');
    expect(line?.className).toContain('italic');
    expect(line?.className).toContain('my-line');
    expect(line?.style).toBe('padding-left: 4px; opacity: 0.5');
  });

  it('maps ranges to marks at line-relative offsets, clamped to the line length', () => {
    const state = createState('skip\nabcdef', {
      2: {
        color: 'warning',
        ranges: [
          { start: 1, end: 3 },
          { start: 4, end: 99, color: 'info' },
          { start: -5, end: 1, color: 'success' },
        ],
      },
    });
    const marks = collect(state).filter(d => d.kind === 'mark');
    expect(marks).toEqual([
      expect.objectContaining({
        from: 5,
        to: 6,
        className: 'text-syntax-highlight-success-code font-medium',
      }),
      expect.objectContaining({
        from: 6,
        to: 8,
        className: 'text-syntax-highlight-warning-code font-medium',
      }),
      expect.objectContaining({
        from: 9,
        to: 11,
        className: 'text-syntax-highlight-info-code font-medium',
      }),
    ]);
  });

  it('suppresses the whole-line text colour when ranges exist, keeping the background', () => {
    const state = createState('abcdef', {
      1: { color: 'warning', ranges: [{ start: 0, end: 2 }] },
    });
    const line = collect(state).find(d => d.kind === 'line');
    expect(line?.className).toContain('bg-syntax-highlight-warning-highlight');
    expect(line?.className).not.toContain('text-syntax-highlight-warning-code');
    const marks = collect(state).filter(d => d.kind === 'mark');
    expect(marks).toHaveLength(1);
    expect(marks[0]).toMatchObject({ from: 0, to: 2 });
  });

  it('skips ranges without a colour on uncoloured lines and empty ranges', () => {
    const state = createState('abcdef', {
      1: {
        ranges: [
          { start: 0, end: 3 },
          { start: 3, end: 3, color: 'danger' },
        ],
      },
    });
    expect(collect(state)).toEqual([]);
  });

  it('recomputes by absolute line number after a document change (no mapping)', () => {
    const state = createState('a\nb', { 2: { color: 'danger' } });
    expect(collect(state).find(d => d.kind === 'line')?.from).toBe(2);

    const next = state.update({ changes: { from: 0, insert: 'x\n' } }).state;
    // Mapping would have moved it to 4 ("b" on line 3); line 2 is now "a" at offset 2
    expect(collect(next).find(d => d.kind === 'line')?.from).toBe(2);
    expect(next.doc.line(2).text).toBe('a');
  });

  it('rebuilds when the extension is reconfigured', () => {
    const compartment = new Compartment();
    const state = EditorState.create({
      doc: 'a\nb',
      extensions: compartment.of(
        linesExtension({ lines: { 1: { color: 'info' } }, startingLineNumber: 1 }),
      ),
    });
    const next = state.update({
      effects: compartment.reconfigure(
        linesExtension({ lines: { 2: { color: 'brand' } }, startingLineNumber: 1 }),
      ),
    }).state;
    const line = collect(next).find(d => d.kind === 'line');
    expect(line?.from).toBe(2);
    expect(line?.className).toContain('bg-syntax-highlight-brand-highlight');
  });

  it('renders line classes and style on .cm-line and nests range marks inside painter marks', () => {
    // Simulates the adapter painter: a default-precedence token mark over the whole line
    const painter = EditorView.decorations.of(
      Decoration.set([Decoration.mark({ class: 'text-syntax-keyword' }).range(0, 6)]),
    );
    view = new EditorView({
      state: createState(
        'abcdef',
        { 1: { color: 'warning', ranges: [{ start: 1, end: 3 }], style: { opacity: 0.5 } } },
        1,
        painter,
      ),
      parent: document.body,
    });

    const line = view.dom.querySelector('.cm-line');
    expect(line?.className).toContain('bg-syntax-highlight-warning-highlight');
    expect(line?.getAttribute('style')).toContain('opacity: 0.5');

    const range = line?.querySelector('.text-syntax-keyword > .text-syntax-highlight-warning-code');
    expect(range?.textContent).toBe('bc');
  });
});
```

- [ ] **Step 3: Run both tests and confirm they fail**

Run from `packages/design-system`:
`pnpm vitest run src/components/CodeEditor/engine/cssPropertiesToString.test.ts src/components/CodeEditor/engine/lines.test.ts`

Expected: both files FAIL with `Failed to resolve import "./lines"`.

- [ ] **Step 4: Implement `engine/lines.ts`**

Create `src/components/CodeEditor/engine/lines.ts`:

```ts
import type { CSSProperties } from 'react';
import {
  type EditorState,
  type Extension,
  Facet,
  Prec,
  type Range,
  StateField,
} from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';
import { cn } from '../../../utils/cn';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { LINE_COLOR_STYLES } from '../../CodeSnippet/lib/lineStyles';
import { getLineTextStyles } from '../../CodeSnippet/lib/lineUtils';
import { lineNumberToDocLine } from './positions';

export interface LinesConfig {
  lines: Record<number, LineConfig>;
  startingLineNumber: number;
}

const DEFAULT_CONFIG: LinesConfig = { lines: {}, startingLineNumber: 1 };

/** CSS properties React renders without a `px` suffix (react-dom `isUnitlessNumber`). */
const UNITLESS_PROPERTIES: ReadonlySet<string> = new Set([
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
]);

const VENDOR_PREFIX = /^(Webkit|Moz|ms|O)(?=[A-Z])/;

/** `WebkitLineClamp` → `lineClamp`, so vendor-prefixed unitless properties stay unitless. */
const isUnitless = (property: string): boolean => {
  const unprefixed = property.replace(VENDOR_PREFIX, '');
  const normalized =
    unprefixed === property ? property : unprefixed.charAt(0).toLowerCase() + unprefixed.slice(1);
  return UNITLESS_PROPERTIES.has(normalized);
};

const toKebabCase = (property: string): string => {
  if (property.startsWith('--')) return property;
  const kebab = property.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
  // `msTransition` → `-ms-transition` (React convention for the lowercase ms prefix)
  return kebab.startsWith('ms-') ? `-${kebab}` : kebab;
};

/**
 * Serialize React `CSSProperties` into an inline style string, following
 * react-dom's rules: camelCase → kebab-case, custom properties kept as-is,
 * numbers get `px` unless the property is unitless (or the value is 0),
 * `null` / `undefined` / booleans / empty strings are skipped.
 */
export const cssPropertiesToString = (style: CSSProperties | undefined): string => {
  if (!style) return '';
  const declarations: string[] = [];
  for (const [property, rawValue] of Object.entries(style)) {
    const value: unknown = rawValue;
    if (value == null || typeof value === 'boolean' || value === '') continue;
    const isCustom = property.startsWith('--');
    let serialized: string;
    if (typeof value === 'number') {
      serialized = value === 0 || isCustom || isUnitless(property) ? String(value) : `${value}px`;
    } else {
      serialized = String(value).trim();
    }
    declarations.push(`${toKebabCase(property)}: ${serialized}`);
  }
  return declarations.join('; ');
};

const linesConfigFacet = Facet.define<LinesConfig, LinesConfig>({
  combine: values => values[values.length - 1] ?? DEFAULT_CONFIG,
});

const buildLineDecorations = (state: EditorState): DecorationSet => {
  const { lines, startingLineNumber } = state.facet(linesConfigFacet);
  const decorations: Range<Decoration>[] = [];

  for (const [key, config] of Object.entries(lines)) {
    const line = lineNumberToDocLine(state.doc, Number(key), startingLineNumber);
    if (!line) continue;

    const { colorClass, textStyleClass, className, style } = getLineTextStyles(config);
    const lineClass = cn(
      config.color ? LINE_COLOR_STYLES[config.color].bg : undefined,
      colorClass,
      textStyleClass,
      className,
    );
    const styleString = cssPropertiesToString(style);
    if (lineClass || styleString) {
      decorations.push(
        Decoration.line({
          ...(lineClass ? { class: lineClass } : {}),
          ...(styleString ? { attributes: { style: styleString } } : {}),
        }).range(line.from),
      );
    }

    // Whole-line text colour must beat syntax-token colours (CodeToken precedence:
    // range colour > line colour > token colour), so it is also applied as an
    // innermost mark over the full line text.
    if (colorClass && line.length > 0) {
      decorations.push(Decoration.mark({ class: colorClass }).range(line.from, line.to));
    }

    for (const range of config.ranges ?? []) {
      const resolvedColor = range.color ?? config.color;
      if (!resolvedColor) continue;
      const start = Math.max(range.start, 0);
      const end = Math.min(range.end, line.length);
      if (start >= end) continue;
      decorations.push(
        Decoration.mark({ class: LINE_COLOR_STYLES[resolvedColor].text }).range(
          line.from + start,
          line.from + end,
        ),
      );
    }
  }

  return Decoration.set(decorations, true);
};

const linesField = StateField.define<DecorationSet>({
  create: buildLineDecorations,
  update: (value, tr) => {
    if (
      tr.docChanged ||
      tr.startState.facet(linesConfigFacet) !== tr.state.facet(linesConfigFacet)
    ) {
      return buildLineDecorations(tr.state);
    }
    return value;
  },
  provide: field => EditorView.decorations.from(field),
});

/**
 * `lines` prop → line decorations (background, text colour, text style, className, style)
 * and range marks. Rebuilt on every document change, keyed by absolute line number.
 * `Prec.high` makes these marks the innermost spans so they win over painter token colours.
 */
export const linesExtension = (config: LinesConfig): Extension => [
  linesConfigFacet.of(config),
  Prec.high(linesField),
];

export const getLineDecorations = (state: EditorState): DecorationSet =>
  state.field(linesField, false) ?? Decoration.none;
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `pnpm vitest run src/components/CodeEditor/engine/cssPropertiesToString.test.ts src/components/CodeEditor/engine/lines.test.ts`

Expected: PASS, 2 files and 16 tests.

- [ ] **Step 6: Lint and commit the lines work**

Run: `pnpm exec biome check src/components/CodeEditor/engine/lines.ts src/components/CodeEditor/engine/lines.test.ts src/components/CodeEditor/engine/cssPropertiesToString.test.ts`

Expected: no errors. If it reports only formatting, run it again with `--write`.

```bash
git add src/components/CodeEditor/engine/lines.ts src/components/CodeEditor/engine/lines.test.ts src/components/CodeEditor/engine/cssPropertiesToString.test.ts
git commit -m "feat(code-editor): add lines decorations (colours, ranges, text style, style)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Write the failing `guttersExtension` test**

Create `src/components/CodeEditor/engine/gutters.test.ts`:

```ts
import { createElement } from 'react';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, gutter } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { createPortalRegistry, type PortalRegistry } from '../lib/portalRegistry';
import { guttersExtension, PREFIX_GUTTER_CLASS, STICK_GUTTER_CLASS } from './gutters';

interface Options {
  lines?: Record<number, LineConfig>;
  startingLineNumber?: number;
  lineNumbers?: boolean;
  foldGutter?: Extension | null;
  portals?: PortalRegistry;
}

let view: EditorView | null = null;
afterEach(() => {
  view?.destroy();
  view = null;
});

const extensionFor = (options: Options, portals: PortalRegistry): Extension =>
  guttersExtension({
    lines: options.lines ?? {},
    startingLineNumber: options.startingLineNumber ?? 1,
    lineNumbers: options.lineNumbers ?? false,
    foldGutter: options.foldGutter ?? null,
    portals,
    testId: undefined,
  });

const mount = (doc: string, options: Options, compartment?: Compartment): EditorView => {
  const portals = options.portals ?? createPortalRegistry();
  const extension = extensionFor(options, portals);
  view = new EditorView({
    state: EditorState.create({
      doc,
      extensions: compartment ? compartment.of(extension) : extension,
    }),
    parent: document.body,
  });
  return view;
};

/** Gutter cells without CM's hidden width spacer. */
const cells = (editor: EditorView, gutterClass: string): HTMLElement[] =>
  Array.from(
    editor.dom.querySelectorAll<HTMLElement>(`.cm-gutter.${gutterClass} > .cm-gutterElement`),
  ).filter(cell => cell.style.visibility !== 'hidden');

describe('guttersExtension', () => {
  it('renders no gutters when nothing needs one', () => {
    const editor = mount('a\nb', { lines: { 1: { className: 'x' } } });
    expect(editor.dom.querySelector('.cm-gutters')).toBeNull();
  });

  it('renders no colour stick when no line has a colour', () => {
    const editor = mount('a\nb', { lineNumbers: true });
    expect(editor.dom.querySelector(`.${STICK_GUTTER_CLASS}`)).toBeNull();
    expect(editor.dom.querySelector('.cm-lineNumbers')).not.toBeNull();
  });

  it('orders gutters: colour stick, line numbers, fold, prefix', () => {
    const editor = mount('a\nb\nc', {
      lines: { 1: { color: 'danger' }, 2: { prefix: '+' } },
      lineNumbers: true,
      foldGutter: gutter({ class: 'test-fold-gutter' }),
    });
    const order = Array.from(editor.dom.querySelectorAll('.cm-gutters > .cm-gutter')).map(element =>
      [STICK_GUTTER_CLASS, 'cm-lineNumbers', 'test-fold-gutter', PREFIX_GUTTER_CLASS].find(cls =>
        element.classList.contains(cls),
      ),
    );
    expect(order).toEqual([
      STICK_GUTTER_CLASS,
      'cm-lineNumbers',
      'test-fold-gutter',
      PREFIX_GUTTER_CLASS,
    ]);
  });

  it('formats line numbers with the startingLineNumber offset', () => {
    const editor = mount('a\nb\nc', { lineNumbers: true, startingLineNumber: 10 });
    expect(cells(editor, 'cm-lineNumbers').map(cell => cell.textContent)).toEqual([
      '10',
      '11',
      '12',
    ]);
  });

  it('draws the colour stick with the line border colour and transparent elsewhere', () => {
    const editor = mount('a\nb\nc', { lines: { 11: { color: 'danger' } }, startingLineNumber: 10 });
    const [first, second] = cells(editor, STICK_GUTTER_CLASS);
    expect(first?.className).toContain('border-l-2');
    expect(first?.className).toContain('pl-12');
    expect(first?.className).toContain('border-transparent');
    expect(second?.className).toContain('border-syntax-highlight-error-indicator');
    expect(second?.className).toContain('bg-syntax-highlight-error-highlight');
  });

  it('applies the line colour background to every gutter cell and text colour to its number', () => {
    const editor = mount('a\nb', {
      lines: { 2: { color: 'info' } },
      lineNumbers: true,
      foldGutter: gutter({ class: 'test-fold-gutter' }),
    });
    const numbers = cells(editor, 'cm-lineNumbers');
    expect(numbers[0]?.className).not.toContain('bg-syntax-highlight-info-highlight');
    expect(numbers[1]?.className).toContain('bg-syntax-highlight-info-highlight');
    expect(numbers[1]?.className).toContain('text-syntax-highlight-info-code');
    expect(cells(editor, 'test-fold-gutter')[0]?.className).toContain(
      'bg-syntax-highlight-info-highlight',
    );
  });

  it('keeps gutter colours on the absolute line after an edit', () => {
    const editor = mount('a\nb', { lines: { 2: { color: 'info' } }, lineNumbers: true });
    editor.dispatch({ changes: { from: 0, insert: 'x\n' } });
    const numbers = cells(editor, 'cm-lineNumbers');
    expect(numbers[1]?.className).toContain('bg-syntax-highlight-info-highlight');
    expect(numbers[2]?.className).not.toContain('bg-syntax-highlight-info-highlight');
  });

  it('renders string prefixes as text without portals', () => {
    const portals = createPortalRegistry();
    const editor = mount('a\nb', { lines: { 2: { prefix: '+', color: 'success' } }, portals });
    const prefixCells = cells(editor, PREFIX_GUTTER_CLASS);
    expect(prefixCells).toHaveLength(1);
    expect(prefixCells[0]?.textContent).toBe('+');
    expect(prefixCells[0]?.className).toContain('px-8');
    expect(prefixCells[0]?.className).toContain('text-center');
    expect(prefixCells[0]?.className).toContain('text-syntax-highlight-success-code');
    expect(portals.getSnapshot()).toHaveLength(0);
  });

  it('registers ReactNode prefixes in the portal registry and unregisters on destroy', () => {
    const portals = createPortalRegistry();
    const node = createElement('strong', null, '!');
    const editor = mount('a\nb', { lines: { 1: { prefix: node } }, portals });

    const entries = portals.getSnapshot();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.node).toBe(node);
    expect(cells(editor, PREFIX_GUTTER_CLASS)[0]?.contains(entries[0]?.host ?? null)).toBe(true);

    editor.destroy();
    view = null;
    expect(portals.getSnapshot()).toHaveLength(0);
  });

  it('unregisters ReactNode prefixes when the gutters are reconfigured away', () => {
    const portals = createPortalRegistry();
    const compartment = new Compartment();
    const editor = mount(
      'a\nb',
      { lines: { 1: { prefix: createElement('em', null, '*') } }, portals },
      compartment,
    );
    expect(portals.getSnapshot()).toHaveLength(1);

    editor.dispatch({
      effects: compartment.reconfigure(extensionFor({ lineNumbers: true }, portals)),
    });
    expect(portals.getSnapshot()).toHaveLength(0);
  });

  it('does not re-register a ReactNode prefix on unrelated updates', () => {
    const portals = createPortalRegistry();
    const editor = mount('a\nb', {
      lines: { 1: { prefix: createElement('em', null, '*') } },
      portals,
    });
    const [before] = portals.getSnapshot();
    editor.dispatch({ changes: { from: 3, insert: 'c' } });
    const after = portals.getSnapshot();
    expect(after).toHaveLength(1);
    expect(after[0]?.id).toBe(before?.id);
  });
});
```

- [ ] **Step 8: Run the test and confirm it fails**

Run: `pnpm vitest run src/components/CodeEditor/engine/gutters.test.ts`

Expected: FAIL with `Failed to resolve import "./gutters"`.

- [ ] **Step 9: Implement `engine/gutters.ts`**

Create `src/components/CodeEditor/engine/gutters.ts`:

```ts
import type { ReactNode } from 'react';
import {
  type EditorState,
  type Extension,
  type Range,
  RangeSet,
  StateField,
} from '@codemirror/state';
import {
  type BlockInfo,
  EditorView,
  GutterMarker,
  gutter,
  gutterLineClass,
  lineNumberMarkers,
  lineNumbers,
} from '@codemirror/view';
import { cn } from '../../../utils/cn';
import type { LineColor, LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { LINE_COLOR_STYLES } from '../../CodeSnippet/lib/lineStyles';
import type { PortalRegistry } from '../lib/portalRegistry';
import { lineNumberToDocLine } from './positions';

export interface GuttersConfig {
  lines: Record<number, LineConfig>;
  startingLineNumber: number;
  lineNumbers: boolean;
  foldGutter: Extension | null;
  portals: PortalRegistry;
  testId: string | undefined;
}

/** Gutter wrapper classes (`.cm-gutter`), used by tests and the theme below. */
export const STICK_GUTTER_CLASS = 'cm-ds-stick';
export const PREFIX_GUTTER_CLASS = 'cm-ds-prefix';

/** Class-only marker: adds `elementClass` to the gutter cell, renders nothing. */
class ClassMarker extends GutterMarker {
  constructor(readonly elementClass: string) {
    super();
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof ClassMarker && other.elementClass === this.elementClass;
  }
}

// ColorStickColumn: `border-l-2 pl-12` + border colour (transparent for uncoloured lines)
const STICK_BASE_CLASS = 'border-l-2 pl-12';
const transparentStick = new ClassMarker(cn(STICK_BASE_CLASS, 'border-transparent'));
const colorStickMarkers = new Map<LineColor, ClassMarker>();
const getStickMarker = (color: LineColor | undefined): ClassMarker => {
  if (!color) return transparentStick;
  let marker = colorStickMarkers.get(color);
  if (!marker) {
    marker = new ClassMarker(cn(STICK_BASE_CLASS, LINE_COLOR_STYLES[color].border));
    colorStickMarkers.set(color, marker);
  }
  return marker;
};

/**
 * Portal ids by marker host. Module-level (not per marker) because CM keeps the DOM of an
 * `eq` marker but swaps in the new instance, so `destroy` may run on a different instance.
 */
const prefixPortalIds = new WeakMap<Node, number>();

/** PrefixColumn cell: `px-8 text-center` + line text colour; ReactNode content via portals. */
class PrefixMarker extends GutterMarker {
  readonly elementClass: string;

  constructor(
    readonly lineNumber: number,
    readonly prefix: ReactNode,
    readonly color: LineColor | undefined,
    readonly portals: PortalRegistry,
  ) {
    super();
    this.elementClass = cn('px-8 text-center', color ? LINE_COLOR_STYLES[color].text : undefined);
  }

  override eq(other: GutterMarker): boolean {
    return (
      other instanceof PrefixMarker &&
      other.lineNumber === this.lineNumber &&
      other.prefix === this.prefix &&
      other.color === this.color &&
      other.portals === this.portals
    );
  }

  override toDOM(view: EditorView): Node {
    const host = view.dom.ownerDocument.createElement('span');
    const { prefix } = this;
    if (typeof prefix === 'string' || typeof prefix === 'number' || typeof prefix === 'bigint') {
      host.textContent = String(prefix);
    } else if (prefix != null && typeof prefix !== 'boolean') {
      prefixPortalIds.set(host, this.portals.register(host, prefix));
    }
    return host;
  }

  override destroy(dom: Node): void {
    const id = prefixPortalIds.get(dom);
    if (id !== undefined) {
      prefixPortalIds.delete(dom);
      this.portals.unregister(id);
    }
  }
}

const absoluteLineAt = (state: EditorState, block: BlockInfo, startingLineNumber: number): number =>
  state.doc.lineAt(block.from).number + startingLineNumber - 1;

const gutterTheme = EditorView.theme({
  // CodeSnippetLineNumbers: `px-8 text-right text-text-secondary select-none`
  '.cm-lineNumbers': {
    color: 'var(--color-text-secondary)',
    userSelect: 'none',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px',
    minWidth: '0',
    textAlign: 'right',
  },
  // PrefixColumn inherits the root text colour; CM's base gutter colour is grey.
  [`.${PREFIX_GUTTER_CLASS}`]: {
    color: 'var(--color-syntax-no-syntax)',
    userSelect: 'none',
  },
});

interface GutterClassSets {
  /** Line colour background on every gutter cell of a coloured line (`gutterLineClass`). */
  background: RangeSet<GutterMarker>;
  /** Line colour text on line-number cells (`lineNumberMarkers`), as CodeSnippetLineNumbers does. */
  numberText: RangeSet<GutterMarker>;
}

const buildGutterClassSets = (
  state: EditorState,
  lines: Record<number, LineConfig>,
  startingLineNumber: number,
): GutterClassSets => {
  const background: Range<GutterMarker>[] = [];
  const numberText: Range<GutterMarker>[] = [];
  for (const [key, config] of Object.entries(lines)) {
    if (!config.color) continue;
    const line = lineNumberToDocLine(state.doc, Number(key), startingLineNumber);
    if (!line) continue;
    const styles = LINE_COLOR_STYLES[config.color];
    background.push(new ClassMarker(styles.bg).range(line.from));
    numberText.push(new ClassMarker(styles.text).range(line.from));
  }
  return {
    background: RangeSet.of(background, true),
    numberText: RangeSet.of(numberText, true),
  };
};

/**
 * Gutters in CodeSnippet order: colour stick (only if any line has `color`) → line numbers
 * (if `lineNumbers`) → fold gutter (if given) → prefix (only if any line has `prefix`).
 */
export const guttersExtension = (config: GuttersConfig): Extension => {
  const { lines, startingLineNumber, portals } = config;
  const configs = Object.values(lines);
  const hasColors = configs.some(line => line.color != null);
  const hasPrefixes = configs.some(line => line.prefix != null);

  if (!hasColors && !hasPrefixes && !config.lineNumbers && !config.foldGutter) {
    return [];
  }

  const extensions: Extension[] = [gutterTheme];

  if (hasColors) {
    const classSets = StateField.define<GutterClassSets>({
      create: state => buildGutterClassSets(state, lines, startingLineNumber),
      update: (value, tr) =>
        tr.docChanged ? buildGutterClassSets(tr.state, lines, startingLineNumber) : value,
      provide: field => [
        gutterLineClass.from(field, sets => sets.background),
        lineNumberMarkers.from(field, sets => sets.numberText),
      ],
    });
    extensions.push(
      classSets,
      gutter({
        class: STICK_GUTTER_CLASS,
        lineMarker: (view, block) =>
          getStickMarker(lines[absoluteLineAt(view.state, block, startingLineNumber)]?.color),
        initialSpacer: () => transparentStick,
      }),
    );
  }

  if (config.lineNumbers) {
    extensions.push(
      lineNumbers({ formatNumber: lineNo => String(lineNo + startingLineNumber - 1) }),
    );
  }

  if (config.foldGutter) {
    extensions.push(config.foldGutter);
  }

  if (hasPrefixes) {
    extensions.push(
      gutter({
        class: PREFIX_GUTTER_CLASS,
        lineMarker: (view, block) => {
          const absolute = absoluteLineAt(view.state, block, startingLineNumber);
          const line = lines[absolute];
          if (line?.prefix == null) return null;
          return new PrefixMarker(absolute, line.prefix, line.color, portals);
        },
      }),
    );
  }

  return extensions;
};
```

`testId` is accepted so the signature matches the skeleton. The `--gutter` test id on `.cm-gutters` is set by T5's ViewPlugin.

- [ ] **Step 10: Run the test and confirm it passes**

Run: `pnpm vitest run src/components/CodeEditor/engine/gutters.test.ts`

Expected: PASS, 11 tests.

- [ ] **Step 11: Write the failing integration test through `createEditor`**

Create `src/components/CodeEditor/engine/linesGutters.integration.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import { createPortalRegistry } from '../lib/portalRegistry';
import { createEditor } from './index';
import { PREFIX_GUTTER_CLASS, STICK_GUTTER_CLASS } from './gutters';
import type { EditorHandle, EngineOptions } from './types';

const testAdapter: SyntaxAdapter<string> = {
  name: 'test',
  highlight: async code => ({
    tokens: code.split('\n').map(line => [{ content: line, type: 'plain' }]),
  }),
  getSupportedLanguages: () => ['text'],
};

const baseOptions = (overrides: Partial<EngineOptions> = {}): EngineOptions => ({
  value: 'first\nsecond\nthird',
  documentId: undefined,
  language: 'text',
  readOnly: false,
  wrapLines: false,
  startingLineNumber: 10,
  lineNumbers: true,
  lines: { 11: { color: 'danger', prefix: '!' } },
  folds: undefined,
  adapter: testAdapter,
  original: undefined,
  schema: undefined,
  completions: [],
  diagnostics: [],
  contentAttributes: {},
  testId: 'editor',
  cspNonce: undefined,
  maxHeight: null,
  ...overrides,
});

let handle: EditorHandle | null = null;
afterEach(() => {
  handle?.destroy();
  handle = null;
  document.body.innerHTML = '';
});

const mount = (options: EngineOptions): EditorHandle => {
  const parent = document.createElement('div');
  document.body.append(parent);
  handle = createEditor(parent, options, {
    onChange: vi.fn(),
    onDiagnosticsChange: vi.fn(),
    onVisibleRowCountChange: vi.fn(),
    portals: createPortalRegistry(),
  });
  return handle;
};

const numberTexts = (editorHandle: EditorHandle): (string | null)[] =>
  Array.from(
    editorHandle.view.dom.querySelectorAll<HTMLElement>('.cm-lineNumbers > .cm-gutterElement'),
  )
    .filter(cell => cell.style.visibility !== 'hidden')
    .map(cell => cell.textContent);

describe('createEditor: lines + gutters', () => {
  it('renders line decorations and the gutters from options', () => {
    const editor = mount(baseOptions());
    const lines = editor.view.dom.querySelectorAll('.cm-line');
    expect(lines[1]?.className).toContain('bg-syntax-highlight-error-highlight');
    expect(editor.view.dom.querySelector(`.${STICK_GUTTER_CLASS}`)).not.toBeNull();
    expect(editor.view.dom.querySelector(`.${PREFIX_GUTTER_CLASS}`)?.textContent).toBe('!');
    expect(numberTexts(editor)).toEqual(['10', '11', '12']);
  });

  it('reconfigures lines, lineNumbers and startingLineNumber on update', () => {
    const editor = mount(baseOptions());
    editor.update(baseOptions({ lines: {}, lineNumbers: false }));
    expect(editor.view.dom.querySelector('.cm-gutters')).toBeNull();
    expect(editor.view.dom.querySelectorAll('.cm-line')[1]?.className).not.toContain(
      'bg-syntax-highlight-error-highlight',
    );

    editor.update(baseOptions({ lines: {}, lineNumbers: true, startingLineNumber: 1 }));
    expect(numberTexts(editor)).toEqual(['1', '2', '3']);
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/linesGutters.integration.test.ts`

Expected: FAIL. The first test fails because `.cm-line` has no `bg-syntax-highlight-error-highlight` and there is no `.cm-ds-stick` (not registered yet).

- [ ] **Step 12: Register lines and gutters in `createEditor`**

Edit `src/components/CodeEditor/engine/index.ts`, the T5 file.

1. Add the imports next to the other feature imports, e.g. after `import { adapterPainter } from './adapterPainter';` from T6:

```ts
import { guttersExtension } from './gutters';
import { linesExtension } from './lines';
```

2. In `featureExtensions(options: EngineOptions, callbacks: EngineCallbacks): Extension[]`, which T5 puts in the features Compartment, add these two entries to the returned array right after the `adapterPainter({...})` entry:

```ts
    linesExtension({ lines: options.lines, startingLineNumber: options.startingLineNumber }),
    guttersExtension({
      lines: options.lines,
      startingLineNumber: options.startingLineNumber,
      lineNumbers: options.lineNumbers,
      // T8 replaces `null` with `foldsExtension(...).gutter`
      foldGutter: null,
      portals: callbacks.portals,
      testId: options.testId,
    }),
```

3. Check how `update(options)` decides to reconfigure the features compartment. If it compares a list of option keys, make sure the list contains `'lines'`, `'startingLineNumber'`, `'lineNumbers'` and `'testId'`, compared by reference, and add any that are missing. If it reconfigures on any change other than value/documentId, no change is needed.

- [ ] **Step 13: Run all engine tests for this task and confirm they pass**

Run: `pnpm vitest run src/components/CodeEditor/engine/cssPropertiesToString.test.ts src/components/CodeEditor/engine/lines.test.ts src/components/CodeEditor/engine/gutters.test.ts src/components/CodeEditor/engine/linesGutters.integration.test.ts`

Expected: PASS, 4 files and 29 tests.

Then run the whole engine folder and the CodeSnippet suites to catch regressions:
`pnpm vitest run src/components/CodeEditor src/components/CodeSnippet`

Expected: PASS.

- [ ] **Step 14: Typecheck and lint**

Run:
- `pnpm exec tsc --build tsconfig.app.json --noEmit` (expected: no errors)
- `pnpm exec biome check src/components/CodeEditor/engine/lines.ts src/components/CodeEditor/engine/gutters.ts src/components/CodeEditor/engine/index.ts src/components/CodeEditor/engine/gutters.test.ts src/components/CodeEditor/engine/linesGutters.integration.test.ts` (expected: no errors; fix formatting with `--write`)

- [ ] **Step 15: Commit**

```bash
git add src/components/CodeEditor/engine/gutters.ts src/components/CodeEditor/engine/gutters.test.ts src/components/CodeEditor/engine/linesGutters.integration.test.ts src/components/CodeEditor/engine/index.ts
git commit -m "feat(code-editor): add colour stick, line number and prefix gutters

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Folds

Spec §7.7, §7.5 (fold gutter), §7.8 (visible rows), §7.16 (fold keys, aria-labels, announce), D6, D9.

**Files:**
- Create: `src/components/CodeEditor/engine/folds.ts`
- Create: `src/components/CodeSnippet/internal/FoldSummary.tsx`
- Modify: `src/components/CodeSnippet/lib/foldUtils.ts` (optional `warn` option on `validateFolds`, `readonly` input)
- Modify: `src/components/CodeSnippet/internal/FoldToggle.tsx` (optional `testId` prop)
- Modify: `src/components/CodeSnippet/internal/index.ts` (export `FoldSummary`)
- Modify: `src/components/CodeSnippet/CodeSnippetCode.tsx` (use `FoldSummary`)
- Modify: `src/components/CodeEditor/engine/index.ts` (T5: folds compartment, fold gutter, `api.foldAll/unfoldAll`, visible row count, drop CM `foldKeymap`)
- Test: `src/components/CodeSnippet/lib/foldUtils.test.ts` (add one case)
- Test: `src/components/CodeEditor/engine/folds.test.ts`
- Test: `src/components/CodeEditor/engine/folds.reconfigure.test.ts`
- Test: `src/components/CodeEditor/engine/folds.portals.test.tsx`
- Test: `src/components/CodeEditor/engine/index.folds.test.ts`

**Interfaces:**
- Consumes:
  - `PortalRegistry`, `createPortalRegistry` (`lib/portalRegistry.ts`) and `PortalOutlet` (`lib/PortalOutlet.tsx`) from T3.
  - `CodeEditorFolds` (`types.ts`) and the jsdom `Range` rect stubs in `vitest.setup.ts` from T3.
  - `createEditor`, `EditorHandle.api` / `.update` / `.view`, the keymap array and the `guttersExtension({... foldGutter ...})` call site from T5.
  - `guttersExtension` (`foldGutter: Extension | null` slot) from T7.
  - From CodeSnippet: `FoldRegion`, `getFoldSummaryLabel`, `validateFolds` (`lib/foldUtils.ts`), `getHttpFolds` and `HTTP_FOLD_ID` (`lib/httpFolds.ts`), and `FoldToggle` (`internal/FoldToggle.tsx`).
- Produces (the skeleton signatures, unchanged):
  ```ts
  export const foldsExtension: (config: { folds: CodeEditorFolds | undefined; startingLineNumber: number; portals: PortalRegistry; testId: string | undefined }) => { extension: Extension; gutter: Extension | null };
  export const getCollapsedFoldIds: (state: EditorState) => ReadonlySet<string>;
  export const getVisibleRowCount: (state: EditorState) => number;
  export const foldAllRegions: (view: EditorView) => boolean;
  export const unfoldAllRegions: (view: EditorView) => boolean;
  export const toggleFoldRegion: (view: EditorView, id: string) => boolean;
  ```
- Produces (additional, internal only; not re-exported from any `index.ts`):
  ```ts
  // engine/folds.ts
  export const FOLDS_DEBOUNCE_MS = 150;
  // CodeSnippet/internal/FoldSummary.tsx
  export interface FoldSummaryProps { fold: FoldRegion; lineCount: number; onToggle: () => void; testId?: string }
  export const FoldSummary: FC<FoldSummaryProps>;
  // CodeSnippet/internal/FoldToggle.tsx — new optional prop
  testId?: string   // default data-testid; toggleProps['data-testid'] still wins
  // CodeSnippet/lib/foldUtils.ts
  export type ValidateFoldsOptions = { warn?: boolean };
  export function validateFolds(folds: readonly FoldRegion[], totalLines: number, startingLineNumber?: number, options?: ValidateFoldsOptions): FoldRegion[];
  ```
- **Design notes:**
  - **State lives in one field.** `foldsField` is a module-level singleton, so it survives a compartment reconfigure. The config goes through a `Facet`. When the facet value changes, the field re-resolves the regions and matches collapsed state by `id`.
  - **Decorations come straight from the field.** They are provided with `EditorView.decorations.from(field)`, which is required for a replace that covers line breaks. The range is an inline `Decoration.replace` from `line(start).from` to `line(end).to`, the same shape CM's own `codeFolding` uses. The collapsed region renders as one row, and the line-number gutter shows `startLine`, as in CodeSnippet.
  - **CM's `foldKeymap` is removed from T5.** It would create a second, CM-owned `foldState` through `foldService`. The same four keys are rebound at `Prec.high` to this field.
  - **Gutter visibility.** `gutter` is `null` when `folds` is `undefined` or `[]`. The function form always gets the gutter column.

---

- [ ] **Step 1: Write the failing `validateFolds` silent-mode test**

Append this `it` inside the existing `describe('validateFolds', ...)` block in `src/components/CodeSnippet/lib/foldUtils.test.ts`, right after the `'allows adjacent (non-overlapping) folds'` test (before the `});` that closes the describe, currently line 109):

```ts
  it('skips invalid folds without warning when warn is false', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const folds: readonly FoldRegion[] = [
      { id: 'reversed', startLine: 3, endLine: 2 },
      { id: 'outside', startLine: 8, endLine: 20 },
      { id: 'ok', startLine: 1, endLine: 2 },
    ];

    const result = validateFolds(folds, 10, 1, { warn: false });

    expect(result.map(fold => fold.id)).toEqual(['ok']);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/components/CodeSnippet/lib/foldUtils.test.ts`
Expected: FAIL. The new test fails because `warn` is called twice (the fourth argument is ignored).

- [ ] **Step 3: Add the `warn` option to `validateFolds`**

In `src/components/CodeSnippet/lib/foldUtils.ts`, replace:

```ts
export function validateFolds(
  folds: FoldRegion[],
  totalLines: number,
  startingLineNumber = 1,
): FoldRegion[] {
  const isDev = process.env.NODE_ENV !== 'production';
```

with:

```ts
export type ValidateFoldsOptions = {
  /** Log dev warnings for skipped folds. Default: true */
  warn?: boolean;
};

export function validateFolds(
  folds: readonly FoldRegion[],
  totalLines: number,
  startingLineNumber = 1,
  options?: ValidateFoldsOptions,
): FoldRegion[] {
  const isDev = options?.warn !== false && process.env.NODE_ENV !== 'production';
```

(The body already copies with `[...folds].sort(...)`, so `readonly` input works.)

Run: `pnpm vitest run src/components/CodeSnippet/lib/foldUtils.test.ts`
Expected: PASS (all tests).

- [ ] **Step 4: Extract `FoldSummary` and add the `FoldToggle` test id (refactor; the existing tests are the regression)**

Create `src/components/CodeSnippet/internal/FoldSummary.tsx`:

```tsx
import type { FC, MouseEventHandler } from 'react';
import { cn } from '../../../utils/cn';
import type { FoldRegion } from '../lib/foldUtils';
import { getFoldSummaryLabel } from '../lib/foldUtils';

export interface FoldSummaryProps {
  fold: FoldRegion;
  lineCount: number;
  onToggle: () => void;
  /** Default `data-testid`; `fold.summaryProps['data-testid']` still wins. */
  testId?: string;
}

/** Collapsed-fold summary button. Shared by CodeSnippetCode and the CodeEditor fold widget. */
export const FoldSummary: FC<FoldSummaryProps> = ({ fold, lineCount, onToggle, testId }) => {
  const label = getFoldSummaryLabel(fold, lineCount);
  const { className, onClick, ...summaryProps } = fold.summaryProps ?? {};

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    onToggle();
    onClick?.(event);
  };

  return (
    <button
      type='button'
      className={cn('inline-flex items-center cursor-pointer select-none', className)}
      aria-expanded={false}
      aria-label={`Collapsed region: ${label}, ${lineCount} lines`}
      data-slot='code-snippet-fold-summary'
      data-testid={testId}
      {...summaryProps}
      onClick={handleClick}
    >
      <span className='inline-flex items-center italic text-text-secondary hover:text-text-primary transition-colors'>
        {label}
      </span>
    </button>
  );
};

FoldSummary.displayName = 'FoldSummary';
```

In `src/components/CodeSnippet/internal/FoldToggle.tsx`, replace:

```tsx
export const FoldToggle: FC<{
  fold: FoldRegion;
  isCollapsed: boolean;
  onToggle: () => void;
}> = ({ fold, isCollapsed, onToggle }) => {
```

with:

```tsx
export const FoldToggle: FC<{
  fold: FoldRegion;
  isCollapsed: boolean;
  onToggle: () => void;
  /** Default `data-testid`; `fold.toggleProps['data-testid']` still wins. */
  testId?: string;
}> = ({ fold, isCollapsed, onToggle, testId }) => {
```

and replace:

```tsx
      aria-label={ariaLabel}
      {...toggleProps}
```

with:

```tsx
      aria-label={ariaLabel}
      data-testid={testId}
      {...toggleProps}
```

In `src/components/CodeSnippet/internal/index.ts`, add this line after the `CodeToken` export line:

```ts
export { FoldSummary, type FoldSummaryProps } from './FoldSummary';
```

In `src/components/CodeSnippet/CodeSnippetCode.tsx`, replace the import block (lines 1-9):

```tsx
import type { FC, HTMLAttributes, MouseEventHandler, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useCodeSnippet } from './hooks';
import { CodeContent, CodeLine, TokenizedCodeLine } from './internal';
import type { DisplayItem } from './lib/foldUtils';
import { getFoldSummaryLabel } from './lib/foldUtils';
import { SIZE_LINE_HEIGHT_CLASSES } from './lib/lineStyles';
import { splitTextByRanges } from './lib/lineUtils';
```

with:

```tsx
import type { FC, HTMLAttributes, Ref } from 'react';
import { useTestId } from '../../utils/testId';
import { useCodeSnippet } from './hooks';
import { CodeContent, CodeLine, FoldSummary, TokenizedCodeLine } from './internal';
import type { DisplayItem } from './lib/foldUtils';
import { SIZE_LINE_HEIGHT_CLASSES } from './lib/lineStyles';
import { splitTextByRanges } from './lib/lineUtils';
```

and replace the whole `renderFoldSummary` function (currently lines 47-82, from `const renderFoldSummary = (item: ...) => {` through its closing `};`) with:

```tsx
  const renderFoldSummary = (item: Extract<DisplayItem, { type: 'fold-summary' }>) => (
    <CodeLine
      key={`fold-${item.fold.id}`}
      lineConfig={undefined}
      lineHeightClass={lineHeightClass}
      showInlineGutter={inlineGutter}
      lineNumber={showLineNumbers ? item.fold.startLine : undefined}
      fold={inlineGutter ? item.fold : undefined}
      isFoldCollapsed={inlineGutter || undefined}
      onFoldToggle={inlineGutter ? () => toggleFold(item.fold.id) : undefined}
      hasFolds={inlineGutter && hasFolds}
    >
      <FoldSummary
        fold={item.fold}
        lineCount={item.lineCount}
        onToggle={() => toggleFold(item.fold.id)}
      />
    </CodeLine>
  );
```

Run: `pnpm vitest run src/components/CodeSnippet`
Expected: PASS. This includes `CodeSnippet.test.tsx` "forwards FoldRegion summaryProps…", "composes FoldRegion button handlers…" and `CodeSnippet.nesting.test.tsx`.

Run: `pnpm exec biome check src/components/CodeSnippet/internal src/components/CodeSnippet/CodeSnippetCode.tsx src/components/CodeSnippet/lib/foldUtils.ts`
Expected: no errors. The four `noConsole` warnings in `foldUtils.ts` were already there.

- [ ] **Step 5: Commit the CodeSnippet refactor**

```bash
git add src/components/CodeSnippet/lib/foldUtils.ts src/components/CodeSnippet/lib/foldUtils.test.ts src/components/CodeSnippet/internal/FoldSummary.tsx src/components/CodeSnippet/internal/FoldToggle.tsx src/components/CodeSnippet/internal/index.ts src/components/CodeSnippet/CodeSnippetCode.tsx
git commit -m "refactor(code-snippet): extract FoldSummary, add fold test-id defaults and silent validateFolds

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Write the failing engine tests for static folds, function folds, selection and keymap**

Create `src/components/CodeEditor/engine/folds.test.ts`:

```ts
import { foldable } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, runScopeHandlers } from '@codemirror/view';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FoldRegion } from '../../CodeSnippet/lib/foldUtils';
import { getHttpFolds, HTTP_FOLD_ID } from '../../CodeSnippet/lib/httpFolds';
import { createPortalRegistry } from '../lib/portalRegistry';
import type { CodeEditorFolds } from '../types';
import {
  FOLDS_DEBOUNCE_MS,
  foldAllRegions,
  foldsExtension,
  getCollapsedFoldIds,
  getVisibleRowCount,
  toggleFoldRegion,
  unfoldAllRegions,
} from './folds';

const views: EditorView[] = [];

const mount = (doc: string, folds: CodeEditorFolds | undefined, startingLineNumber = 1) => {
  const { extension, gutter } = foldsExtension({
    folds,
    startingLineNumber,
    portals: createPortalRegistry(),
    testId: 'editor',
  });
  const parent = document.body.appendChild(document.createElement('div'));
  const view = new EditorView({
    state: EditorState.create({ doc, extensions: [extension, gutter ?? []] }),
    parent,
  });
  views.push(view);
  return view;
};

const visibleLineTexts = (view: EditorView): string[] =>
  Array.from(view.contentDOM.querySelectorAll('.cm-line'), line => line.textContent ?? '');

const FIVE_LINES = ['line 1', 'line 2', 'line 3', 'line 4', 'line 5'].join('\n');

const REQUEST = [
  'POST /api HTTP/1.1',
  'Host: example.com',
  'Content-Type: application/json',
  '',
  '{',
  '  "a": 1',
  '}',
].join('\n');

afterEach(() => {
  for (const view of views.splice(0)) {
    view.dom.parentElement?.remove();
    view.destroy();
  }
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('foldsExtension — static folds', () => {
  it('collapses regions with defaultCollapsed into one row', () => {
    const view = mount(FIVE_LINES, [
      { id: 'middle', startLine: 2, endLine: 4, label: 'Middle', defaultCollapsed: true },
    ]);

    expect([...getCollapsedFoldIds(view.state)]).toEqual(['middle']);
    expect(getVisibleRowCount(view.state)).toBe(3);
    expect(visibleLineTexts(view)).toEqual(['line 1', '', 'line 5']);
    expect(view.contentDOM.querySelectorAll('.cm-ds-fold-summary')).toHaveLength(1);
  });

  it('toggles a region by id and reports unknown ids', () => {
    const view = mount(FIVE_LINES, [{ id: 'middle', startLine: 2, endLine: 4 }]);

    expect(getVisibleRowCount(view.state)).toBe(5);
    expect(toggleFoldRegion(view, 'middle')).toBe(true);
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(true);
    expect(getVisibleRowCount(view.state)).toBe(3);
    expect(toggleFoldRegion(view, 'middle')).toBe(true);
    expect(getCollapsedFoldIds(view.state).size).toBe(0);
    expect(toggleFoldRegion(view, 'missing')).toBe(false);
  });

  it('folds and unfolds all regions', () => {
    const view = mount(FIVE_LINES, [
      { id: 'top', startLine: 1, endLine: 2 },
      { id: 'bottom', startLine: 4, endLine: 5 },
    ]);

    expect(foldAllRegions(view)).toBe(true);
    expect(getVisibleRowCount(view.state)).toBe(3);
    expect(foldAllRegions(view)).toBe(false);
    expect(unfoldAllRegions(view)).toBe(true);
    expect(getVisibleRowCount(view.state)).toBe(5);
    expect(unfoldAllRegions(view)).toBe(false);
  });

  it('uses absolute line numbers with startingLineNumber', () => {
    const view = mount(
      FIVE_LINES,
      [{ id: 'abs', startLine: 11, endLine: 12, defaultCollapsed: true }],
      10,
    );

    expect(getVisibleRowCount(view.state)).toBe(4);
    expect(visibleLineTexts(view)).toEqual(['line 1', '', 'line 4', 'line 5']);
  });

  it('drops invalid regions with the CodeSnippet warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = mount(FIVE_LINES, [
      { id: 'reversed', startLine: 3, endLine: 2 },
      { id: 'outside', startLine: 4, endLine: 9 },
      { id: 'ok', startLine: 1, endLine: 2 },
    ]);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[CodeSnippet] Fold "reversed"'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[CodeSnippet] Fold "outside"'));
    expect(toggleFoldRegion(view, 'reversed')).toBe(false);
    expect(toggleFoldRegion(view, 'outside')).toBe(false);
    expect(toggleFoldRegion(view, 'ok')).toBe(true);
  });

  it('re-applies static regions by line number after edits, silently (D6)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = mount(FIVE_LINES, [
      { id: 'tail', startLine: 4, endLine: 5, defaultCollapsed: true },
    ]);
    const removed = view.state.doc.sliceString(view.state.doc.line(3).to);

    view.dispatch({ changes: { from: view.state.doc.line(3).to, to: view.state.doc.length } });
    expect(getCollapsedFoldIds(view.state).size).toBe(0);
    expect(toggleFoldRegion(view, 'tail')).toBe(false);

    view.dispatch({ changes: { from: view.state.doc.length, insert: removed } });
    expect(toggleFoldRegion(view, 'tail')).toBe(true);
    expect(getVisibleRowCount(view.state)).toBe(4);
    expect(warn).not.toHaveBeenCalled();
  });

  it('exposes the regions through foldService', () => {
    const view = mount(FIVE_LINES, [{ id: 'middle', startLine: 2, endLine: 4 }]);
    const line2 = view.state.doc.line(2);

    expect(foldable(view.state, line2.from, line2.to)).toEqual({
      from: line2.from,
      to: view.state.doc.line(4).to,
    });
    const line3 = view.state.doc.line(3);
    expect(foldable(view.state, line3.from, line3.to)).toBeNull();
  });
});

describe('foldsExtension — function folds', () => {
  const httpFolds: CodeEditorFolds = (value, { startingLineNumber }) =>
    getHttpFolds(value, { startingLineNumber });

  it('re-runs the function after the debounce and keeps collapsed ids', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const folds = vi.fn(httpFolds);
    const view = mount(REQUEST, folds);
    expect(folds).toHaveBeenCalledTimes(1);

    toggleFoldRegion(view, HTTP_FOLD_ID.body);
    view.dispatch({ changes: { from: view.state.doc.line(2).to, insert: '\nX-Trace: 1' } });
    view.dispatch({ changes: { from: view.state.doc.line(3).to, insert: '\nX-Other: 2' } });
    expect(folds).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);

    expect(folds).toHaveBeenCalledTimes(2);
    expect([...getCollapsedFoldIds(view.state)]).toEqual([HTTP_FOLD_ID.body]);
    // 9 lines: start line, 4 headers, blank, 3 body lines collapsed into 1 row
    expect(getVisibleRowCount(view.state)).toBe(7);
    expect(visibleLineTexts(view).slice(-1)).toEqual(['']);
  });

  it('drops a region whose id disappears', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const view = mount(REQUEST, httpFolds);
    toggleFoldRegion(view, HTTP_FOLD_ID.headers);
    toggleFoldRegion(view, HTTP_FOLD_ID.body);

    // Remove the blank separator and the body.
    view.dispatch({ changes: { from: view.state.doc.line(3).to, to: view.state.doc.length } });
    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);

    expect([...getCollapsedFoldIds(view.state)]).toEqual([HTTP_FOLD_ID.headers]);
    expect(toggleFoldRegion(view, HTTP_FOLD_ID.body)).toBe(false);
  });

  it('applies defaultCollapsed only the first time an id appears', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const folds: CodeEditorFolds = (value, { startingLineNumber }) =>
      getHttpFolds(value, { startingLineNumber, body: { defaultCollapsed: true } });
    const view = mount('GET / HTTP/1.1\nHost: a', folds);
    expect(getCollapsedFoldIds(view.state).size).toBe(0);

    view.dispatch({ changes: { from: view.state.doc.length, insert: '\n\nbody' } });
    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);
    expect(getCollapsedFoldIds(view.state).has(HTTP_FOLD_ID.body)).toBe(true);

    toggleFoldRegion(view, HTTP_FOLD_ID.body);
    view.dispatch({ changes: { from: 0, insert: ' ' }, selection: { anchor: 0 } });
    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);
    expect(getCollapsedFoldIds(view.state).has(HTTP_FOLD_ID.body)).toBe(false);
  });

  it('stops the debounce timer on destroy', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const folds = vi.fn(httpFolds);
    const view = mount(REQUEST, folds);
    view.dispatch({ changes: { from: 0, insert: ' ' } });
    view.destroy();
    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);
    expect(folds).toHaveBeenCalledTimes(1);
  });
});

describe('foldsExtension — selection and editing', () => {
  const MIDDLE: FoldRegion[] = [{ id: 'middle', startLine: 2, endLine: 4, defaultCollapsed: true }];

  it('unfolds when the selection moves inside a collapsed region', () => {
    const view = mount(FIVE_LINES, MIDDLE);

    view.dispatch({ selection: { anchor: view.state.doc.line(2).from } });
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(true);

    view.dispatch({ selection: { anchor: view.state.doc.line(3).from + 2 } });
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(false);
  });

  it('unfolds when a search-like range selection overlaps the region', () => {
    const view = mount(FIVE_LINES, MIDDLE);
    const line4 = view.state.doc.line(4);

    view.dispatch({ selection: { anchor: line4.from, head: line4.to } });
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(false);
  });

  it('moves a cursor out of a region when it collapses', () => {
    const view = mount(FIVE_LINES, [{ id: 'middle', startLine: 2, endLine: 4 }]);
    view.dispatch({ selection: { anchor: view.state.doc.line(3).from + 1 } });

    toggleFoldRegion(view, 'middle');

    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(true);
    expect(view.state.selection.main.head).toBe(view.state.doc.line(2).from);
  });

  it('unfolds when a user edit touches the collapsed region', () => {
    const view = mount(FIVE_LINES, MIDDLE);

    view.dispatch({
      changes: { from: view.state.doc.line(2).from, insert: 'x' },
      userEvent: 'input.type',
    });

    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(false);
  });

  it('binds Ctrl-Shift-[ and Ctrl-Shift-] to the region at the cursor', () => {
    const view = mount(FIVE_LINES, [{ id: 'middle', startLine: 2, endLine: 4 }]);
    view.dispatch({ selection: { anchor: view.state.doc.line(3).from } });

    const press = (key: string) =>
      runScopeHandlers(
        view,
        new KeyboardEvent('keydown', { key, ctrlKey: true, shiftKey: true }),
        'editor',
      );

    expect(press('[')).toBe(true);
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(true);
    expect(press(']')).toBe(true);
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(false);
  });
});
```

Create `src/components/CodeEditor/engine/folds.reconfigure.test.ts`:

```ts
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import type { FoldRegion } from '../../CodeSnippet/lib/foldUtils';
import { createPortalRegistry } from '../lib/portalRegistry';
import type { CodeEditorFolds } from '../types';
import { foldsExtension, getCollapsedFoldIds, getVisibleRowCount, toggleFoldRegion } from './folds';

const DOC = ['a', 'b', 'c', 'd', 'e', 'f'].join('\n');
const portals = createPortalRegistry();
const views: EditorView[] = [];

const build = (folds: CodeEditorFolds | undefined) =>
  foldsExtension({ folds, startingLineNumber: 1, portals, testId: undefined }).extension;

afterEach(() => {
  for (const view of views.splice(0)) view.destroy();
});

describe('foldsExtension — reconfigure', () => {
  it('keeps collapsed ids across a static-array reconfigure and applies new defaults once', () => {
    const compartment = new Compartment();
    const first: FoldRegion[] = [{ id: 'a', startLine: 1, endLine: 2 }];
    const view = new EditorView({
      state: EditorState.create({ doc: DOC, extensions: [compartment.of(build(first))] }),
    });
    views.push(view);
    toggleFoldRegion(view, 'a');

    view.dispatch({
      effects: compartment.reconfigure(
        build([
          { id: 'a', startLine: 1, endLine: 3 },
          { id: 'b', startLine: 5, endLine: 6, defaultCollapsed: true },
        ]),
      ),
    });

    expect([...getCollapsedFoldIds(view.state)].sort()).toEqual(['a', 'b']);
    expect(getVisibleRowCount(view.state)).toBe(3);

    view.dispatch({
      effects: compartment.reconfigure(build([{ id: 'b', startLine: 5, endLine: 6 }])),
    });
    expect([...getCollapsedFoldIds(view.state)]).toEqual(['b']);

    view.dispatch({ effects: compartment.reconfigure(build(undefined)) });
    expect(getCollapsedFoldIds(view.state).size).toBe(0);
    expect(getVisibleRowCount(view.state)).toBe(6);
  });

  it('returns the plain line count when the extension is absent', () => {
    expect(getVisibleRowCount(EditorState.create({ doc: DOC }))).toBe(6);
    expect(getCollapsedFoldIds(EditorState.create({ doc: DOC })).size).toBe(0);
  });
});
```

- [ ] **Step 7: Run them and confirm they fail**

Run: `pnpm vitest run src/components/CodeEditor/engine/folds.test.ts src/components/CodeEditor/engine/folds.reconfigure.test.ts`
Expected: FAIL for both files with `Failed to resolve import "./folds"` (the module does not exist yet).

- [ ] **Step 8: Implement `engine/folds.ts`**

Create `src/components/CodeEditor/engine/folds.ts`:

```ts
import { createElement } from 'react';
import { foldService } from '@codemirror/language';
import type { EditorState, Extension, Range, SelectionRange, Transaction } from '@codemirror/state';
import { EditorSelection, Facet, Prec, StateEffect, StateField } from '@codemirror/state';
import type { BlockInfo, DecorationSet, ViewUpdate } from '@codemirror/view';
import {
  Decoration,
  EditorView,
  GutterMarker,
  gutter,
  keymap,
  ViewPlugin,
  WidgetType,
} from '@codemirror/view';
import { FoldSummary } from '../../CodeSnippet/internal/FoldSummary';
import { FoldToggle } from '../../CodeSnippet/internal/FoldToggle';
import type { FoldRegion } from '../../CodeSnippet/lib/foldUtils';
import { getFoldSummaryLabel, validateFolds } from '../../CodeSnippet/lib/foldUtils';
import type { PortalRegistry } from '../lib/portalRegistry';
import type { CodeEditorFolds } from '../types';

/** Debounce for re-running function-form `folds` after edits (spec §4). */
export const FOLDS_DEBOUNCE_MS = 150;

interface FoldsConfig {
  folds: CodeEditorFolds | undefined;
  startingLineNumber: number;
  portals: PortalRegistry;
  testId: string | undefined;
}

interface FoldsState {
  /** Last regions received (static prop or function output), before validation. */
  raw: readonly FoldRegion[];
  /** Validated regions for the current document, sorted by startLine. */
  regions: readonly FoldRegion[];
  collapsed: ReadonlySet<string>;
  /** Every id ever seen — `defaultCollapsed` applies only on the first sighting. */
  seen: ReadonlySet<string>;
  decorations: DecorationSet;
}

const foldsConfig = Facet.define<FoldsConfig, FoldsConfig | null>({
  combine: values => values[0] ?? null,
});

/** Replaces the raw regions (function-form re-run). */
const setFoldsEffect = StateEffect.define<readonly FoldRegion[]>();
/** Collapses or expands one region by id. */
const setCollapsedEffect = StateEffect.define<{ id: string; collapsed: boolean }>();

const portalIds = new WeakMap<Node, number>();

const releasePortal = (portals: PortalRegistry, dom: Node): void => {
  const id = portalIds.get(dom);
  if (id === undefined) return;
  portalIds.delete(dom);
  portals.unregister(id);
};

const sameRegion = (a: FoldRegion, b: FoldRegion): boolean =>
  a.id === b.id &&
  a.startLine === b.startLine &&
  a.endLine === b.endLine &&
  a.label === b.label &&
  a.toggleProps === b.toggleProps &&
  a.summaryProps === b.summaryProps;

const regionLineCount = (region: FoldRegion): number => region.endLine - region.startLine + 1;

const regionRange = (
  state: EditorState,
  region: FoldRegion,
  startingLineNumber: number,
): { from: number; to: number } => ({
  from: state.doc.line(region.startLine - startingLineNumber + 1).from,
  to: state.doc.line(region.endLine - startingLineNumber + 1).to,
});

const startingLine = (state: EditorState): number =>
  state.facet(foldsConfig)?.startingLineNumber ?? 1;

const computeRaw = (config: FoldsConfig | null, state: EditorState): readonly FoldRegion[] => {
  const folds = config?.folds;
  if (folds === undefined) return [];
  if (typeof folds === 'function') {
    return folds(state.doc.toString(), { startingLineNumber: config?.startingLineNumber ?? 1 });
  }
  return folds;
};

const resolve = (
  raw: readonly FoldRegion[],
  state: EditorState,
  warn: boolean,
): readonly FoldRegion[] => validateFolds(raw, state.doc.lines, startingLine(state), { warn });

class FoldSummaryWidget extends WidgetType {
  constructor(
    readonly region: FoldRegion,
    readonly portals: PortalRegistry,
    readonly testId: string | undefined,
  ) {
    super();
  }

  eq(other: FoldSummaryWidget): boolean {
    return (
      sameRegion(this.region, other.region) &&
      this.portals === other.portals &&
      this.testId === other.testId
    );
  }

  toDOM(view: EditorView): HTMLElement {
    const host = document.createElement('span');
    host.className = 'cm-ds-fold-summary';
    const { id } = this.region;
    const portalId = this.portals.register(
      host,
      createElement(FoldSummary, {
        fold: this.region,
        lineCount: regionLineCount(this.region),
        onToggle: () => {
          toggleFoldRegion(view, id);
        },
        testId: this.testId === undefined ? undefined : `${this.testId}--fold-summary`,
      }),
    );
    portalIds.set(host, portalId);
    return host;
  }

  destroy(dom: HTMLElement): void {
    releasePortal(this.portals, dom);
  }

  ignoreEvent(): boolean {
    return true;
  }
}

const buildDecorations = (
  state: EditorState,
  regions: readonly FoldRegion[],
  collapsed: ReadonlySet<string>,
): DecorationSet => {
  const config = state.facet(foldsConfig);
  if (!config || collapsed.size === 0) return Decoration.none;
  const ranges: Range<Decoration>[] = [];
  for (const region of regions) {
    if (!collapsed.has(region.id)) continue;
    const { from, to } = regionRange(state, region, config.startingLineNumber);
    ranges.push(
      Decoration.replace({
        widget: new FoldSummaryWidget(region, config.portals, config.testId),
      }).range(from, to),
    );
  }
  return Decoration.set(ranges, true);
};

const selectionEntersRange = (range: SelectionRange, from: number, to: number): boolean =>
  range.empty ? range.head > from && range.head < to : range.from < to && range.to > from;

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean =>
  a.size === b.size && [...a].every(id => b.has(id));

const initialState = (state: EditorState): FoldsState => {
  const raw = computeRaw(state.facet(foldsConfig), state);
  const regions = resolve(raw, state, true);
  const collapsed = new Set(regions.filter(r => r.defaultCollapsed).map(r => r.id));
  return {
    raw,
    regions,
    collapsed,
    seen: new Set(regions.map(r => r.id)),
    decorations: Decoration.none,
  };
};

const updateState = (value: FoldsState, tr: Transaction): FoldsState => {
  const { state } = tr;
  let { raw, regions } = value;
  let validated = false;

  if (tr.startState.facet(foldsConfig) !== state.facet(foldsConfig)) {
    raw = computeRaw(state.facet(foldsConfig), state);
    regions = resolve(raw, state, true);
    validated = true;
  }
  for (const effect of tr.effects) {
    if (effect.is(setFoldsEffect)) {
      raw = effect.value;
      regions = resolve(raw, state, true);
      validated = true;
    }
  }
  if (!validated && tr.docChanged) {
    // D6: regions are absolute line numbers — re-apply to the new document silently.
    regions = resolve(raw, state, false);
  }

  const collapsed = new Set(value.collapsed);
  let seen = value.seen;
  if (regions !== value.regions) {
    const nextSeen = new Set(seen);
    for (const region of regions) {
      if (nextSeen.has(region.id)) continue;
      nextSeen.add(region.id);
      if (region.defaultCollapsed) collapsed.add(region.id);
    }
    seen = nextSeen;
  }
  for (const effect of tr.effects) {
    if (!effect.is(setCollapsedEffect)) continue;
    if (effect.value.collapsed) collapsed.add(effect.value.id);
    else collapsed.delete(effect.value.id);
  }

  const ids = new Set(regions.map(r => r.id));
  for (const id of [...collapsed]) {
    if (!ids.has(id)) collapsed.delete(id);
  }

  const userEdit = tr.docChanged && (tr.isUserEvent('input') || tr.isUserEvent('delete'));
  if (collapsed.size > 0 && (tr.selection || userEdit)) {
    const start = startingLine(state);
    for (const region of regions) {
      if (!collapsed.has(region.id)) continue;
      const { from, to } = regionRange(state, region, start);
      const selected =
        tr.selection !== undefined &&
        state.selection.ranges.some(range => selectionEntersRange(range, from, to));
      let edited = false;
      if (userEdit) {
        tr.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
          if (fromB <= to && toB >= from) edited = true;
        });
      }
      if (selected || edited) collapsed.delete(region.id);
    }
  }

  const collapsedChanged = !sameSet(collapsed, value.collapsed);
  if (regions === value.regions && !collapsedChanged && !tr.docChanged && seen === value.seen) {
    return value;
  }
  const nextCollapsed = collapsedChanged ? collapsed : value.collapsed;
  return {
    raw,
    regions,
    collapsed: nextCollapsed,
    seen,
    decorations: buildDecorations(state, regions, nextCollapsed),
  };
};

const foldsField = StateField.define<FoldsState>({
  create: state => {
    const value = initialState(state);
    return { ...value, decorations: buildDecorations(state, value.regions, value.collapsed) };
  },
  update: updateState,
  // Provided directly (not as a function) — required for replace decorations that cover line breaks.
  provide: field => EditorView.decorations.from(field, value => value.decorations),
});

const functionFoldsPlugin = ViewPlugin.fromClass(
  class {
    timer: ReturnType<typeof setTimeout> | null = null;

    constructor(readonly view: EditorView) {}

    update(update: ViewUpdate): void {
      if (!update.docChanged) return;
      if (typeof update.state.facet(foldsConfig)?.folds !== 'function') return;
      this.clear();
      this.timer = setTimeout(() => {
        this.timer = null;
        const config = this.view.state.facet(foldsConfig);
        const folds = config?.folds;
        if (typeof folds !== 'function') return;
        const raw = folds(this.view.state.doc.toString(), {
          startingLineNumber: config?.startingLineNumber ?? 1,
        });
        this.view.dispatch({ effects: setFoldsEffect.of(raw) });
      }, FOLDS_DEBOUNCE_MS);
    }

    clear(): void {
      if (this.timer !== null) clearTimeout(this.timer);
      this.timer = null;
    }

    destroy(): void {
      this.clear();
    }
  },
);

const readField = (state: EditorState): FoldsState | undefined => state.field(foldsField, false);

const setCollapsed = (
  view: EditorView,
  targets: readonly FoldRegion[],
  collapse: boolean,
): boolean => {
  const { state } = view;
  if (targets.length === 0) return false;
  const start = startingLine(state);
  const ranges = targets.map(region => regionRange(state, region, start));
  const effects: StateEffect<unknown>[] = targets.map(region =>
    setCollapsedEffect.of({ id: region.id, collapsed: collapse }),
  );
  if (targets.length === 1 && targets[0]) {
    const label = getFoldSummaryLabel(targets[0], regionLineCount(targets[0]));
    effects.push(EditorView.announce.of(`${collapse ? 'Folded' : 'Unfolded'} ${label}`));
  }
  let selection: EditorSelection | undefined;
  if (collapse) {
    // Never leave a cursor hidden inside a collapsed region: move it to the region start.
    let moved = false;
    const next = state.selection.ranges.map(range => {
      const hit = ranges.find(({ from, to }) => selectionEntersRange(range, from, to));
      if (!hit) return range;
      moved = true;
      return EditorSelection.cursor(hit.from);
    });
    if (moved) selection = EditorSelection.create(next, state.selection.mainIndex);
  }
  view.dispatch(selection ? { effects, selection } : { effects });
  return true;
};

export const getCollapsedFoldIds = (state: EditorState): ReadonlySet<string> =>
  readField(state)?.collapsed ?? new Set<string>();

export const getVisibleRowCount = (state: EditorState): number => {
  const value = readField(state);
  if (!value) return state.doc.lines;
  let hidden = 0;
  for (const region of value.regions) {
    if (value.collapsed.has(region.id)) hidden += regionLineCount(region) - 1;
  }
  return state.doc.lines - hidden;
};

export const toggleFoldRegion = (view: EditorView, id: string): boolean => {
  const value = readField(view.state);
  const region = value?.regions.find(r => r.id === id);
  if (!value || !region) return false;
  return setCollapsed(view, [region], !value.collapsed.has(id));
};

export const foldAllRegions = (view: EditorView): boolean => {
  const value = readField(view.state);
  if (!value) return false;
  return setCollapsed(
    view,
    value.regions.filter(r => !value.collapsed.has(r.id)),
    true,
  );
};

export const unfoldAllRegions = (view: EditorView): boolean => {
  const value = readField(view.state);
  if (!value) return false;
  return setCollapsed(
    view,
    value.regions.filter(r => value.collapsed.has(r.id)),
    false,
  );
};

const regionAtCursor = (state: EditorState): FoldRegion | undefined => {
  const value = readField(state);
  if (!value) return undefined;
  const line = state.doc.lineAt(state.selection.main.head).number + startingLine(state) - 1;
  return value.regions.find(r => r.startLine <= line && r.endLine >= line);
};

const foldRegionAtCursor = (view: EditorView): boolean => {
  const region = regionAtCursor(view.state);
  if (!region || getCollapsedFoldIds(view.state).has(region.id)) return false;
  return setCollapsed(view, [region], true);
};

const unfoldRegionAtCursor = (view: EditorView): boolean => {
  const region = regionAtCursor(view.state);
  if (!region || !getCollapsedFoldIds(view.state).has(region.id)) return false;
  return setCollapsed(view, [region], false);
};

// Same keys as CM's foldKeymap, bound to our field (CM's foldKeymap is NOT used — it would
// create a second, CM-owned fold state).
const foldsKeymap = Prec.high(
  keymap.of([
    { key: 'Ctrl-Shift-[', mac: 'Cmd-Alt-[', run: foldRegionAtCursor },
    { key: 'Ctrl-Shift-]', mac: 'Cmd-Alt-]', run: unfoldRegionAtCursor },
    { key: 'Ctrl-Alt-[', run: foldAllRegions },
    { key: 'Ctrl-Alt-]', run: unfoldAllRegions },
  ]),
);

const regionsFoldService = foldService.of((state, lineStart) => {
  const value = readField(state);
  if (!value) return null;
  const start = startingLine(state);
  const line = state.doc.lineAt(lineStart).number + start - 1;
  const region = value.regions.find(r => r.startLine === line);
  return region ? regionRange(state, region, start) : null;
});

class FoldToggleMarker extends GutterMarker {
  constructor(
    readonly region: FoldRegion,
    readonly collapsed: boolean,
    readonly portals: PortalRegistry,
    readonly testId: string | undefined,
  ) {
    super();
  }

  eq(other: GutterMarker): boolean {
    return (
      other instanceof FoldToggleMarker &&
      sameRegion(this.region, other.region) &&
      this.collapsed === other.collapsed &&
      this.portals === other.portals &&
      this.testId === other.testId
    );
  }

  toDOM(view: EditorView): Node {
    const host = document.createElement('span');
    host.className = 'cm-ds-fold-toggle';
    const { id } = this.region;
    const portalId = this.portals.register(
      host,
      createElement(FoldToggle, {
        fold: this.region,
        isCollapsed: this.collapsed,
        onToggle: () => {
          toggleFoldRegion(view, id);
        },
        testId: this.testId === undefined ? undefined : `${this.testId}--fold-toggle`,
      }),
    );
    portalIds.set(host, portalId);
    return host;
  }

  destroy(dom: Node): void {
    releasePortal(this.portals, dom);
  }
}

class FoldSpacerMarker extends GutterMarker {
  eq(other: GutterMarker): boolean {
    return other instanceof FoldSpacerMarker;
  }

  toDOM(): Node {
    const spacer = document.createElement('span');
    spacer.className = 'cm-ds-fold-spacer';
    return spacer;
  }
}

const foldSpacer = new FoldSpacerMarker();

const foldGutterTheme = EditorView.theme({
  '.cm-ds-fold-gutter .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  '.cm-ds-fold-spacer, .cm-ds-fold-toggle': {
    display: 'flex',
    width: '16px',
    height: '16px',
  },
});

const foldGutter: Extension = [
  gutter({
    class: 'cm-ds-fold-gutter',
    renderEmptyElements: true,
    lineMarker: (view: EditorView, line: BlockInfo): GutterMarker | null => {
      const { state } = view;
      const value = readField(state);
      const config = state.facet(foldsConfig);
      if (!value || !config) return null;
      const lineNumber = state.doc.lineAt(line.from).number + config.startingLineNumber - 1;
      const region = value.regions.find(r => r.startLine === lineNumber);
      if (!region) return null;
      return new FoldToggleMarker(
        region,
        value.collapsed.has(region.id),
        config.portals,
        config.testId,
      );
    },
    lineMarkerChange: update => readField(update.startState) !== readField(update.state),
    initialSpacer: () => foldSpacer,
  }),
  foldGutterTheme,
];

export const foldsExtension = (config: {
  folds: CodeEditorFolds | undefined;
  startingLineNumber: number;
  portals: PortalRegistry;
  testId: string | undefined;
}): { extension: Extension; gutter: Extension | null } => ({
  extension: [
    foldsConfig.of({ ...config }),
    foldsField,
    functionFoldsPlugin,
    foldsKeymap,
    regionsFoldService,
  ],
  gutter:
    config.folds === undefined || (Array.isArray(config.folds) && config.folds.length === 0)
      ? null
      : foldGutter,
});
```

- [ ] **Step 9: Run the engine tests and confirm they pass**

Run: `pnpm vitest run src/components/CodeEditor/engine/folds.test.ts src/components/CodeEditor/engine/folds.reconfigure.test.ts`
Expected: PASS, 18 tests.

- [ ] **Step 10: Write the portal / RTL tests (toggle, summary, `toggleProps`/`summaryProps`, cleanup)**

Create `src/components/CodeEditor/engine/folds.portals.test.tsx`:

```tsx
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FoldRegion } from '../../CodeSnippet/lib/foldUtils';
import { PortalOutlet } from '../lib/PortalOutlet';
import { createPortalRegistry } from '../lib/portalRegistry';
import { foldsExtension, getCollapsedFoldIds } from './folds';

const views: EditorView[] = [];

const CODE = ['function test() {', '  return true;', '}'].join('\n');

const setup = (folds: FoldRegion[]) => {
  const portals = createPortalRegistry();
  const { container } = render(<PortalOutlet registry={portals} />);
  const { extension, gutter } = foldsExtension({
    folds,
    startingLineNumber: 1,
    portals,
    testId: 'editor',
  });
  let view: EditorView | undefined;
  act(() => {
    view = new EditorView({
      state: EditorState.create({ doc: CODE, extensions: [extension, gutter ?? []] }),
      parent: container,
    });
  });
  if (!view) throw new Error('view not created');
  views.push(view);
  return { view, portals };
};

afterEach(() => {
  for (const view of views.splice(0)) act(() => view.destroy());
});

describe('folds — portal-rendered toggle and summary', () => {
  it('renders the DS fold toggle with a derived test id and aria-label', async () => {
    const { view } = setup([{ id: 'body', startLine: 1, endLine: 3, label: 'Body' }]);

    const toggle = screen.getByTestId('editor--fold-toggle');
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('aria-label', 'Collapse Body');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(toggle);

    expect(getCollapsedFoldIds(view.state).has('body')).toBe(true);
    expect(screen.getByTestId('editor--fold-toggle')).toHaveAttribute('aria-label', 'Expand Body');
    expect(screen.getByTestId('editor--fold-summary')).toHaveTextContent('Body');
  });

  it('expands a collapsed region when its summary is clicked', async () => {
    const { view } = setup([
      { id: 'body', startLine: 1, endLine: 3, label: 'Body', defaultCollapsed: true },
    ]);

    const summary = screen.getByTestId('editor--fold-summary');
    expect(summary).toHaveAttribute('aria-label', 'Collapsed region: Body, 3 lines');

    await userEvent.click(summary);

    expect(getCollapsedFoldIds(view.state).size).toBe(0);
    expect(screen.queryByTestId('editor--fold-summary')).not.toBeInTheDocument();
  });

  it('forwards toggleProps to the real toggle button and composes onClick', async () => {
    const onClick = vi.fn();
    const payload = '{"feature":"code","target":"fold-toggle"}';
    const { view } = setup([
      {
        id: 'body',
        startLine: 1,
        endLine: 3,
        toggleProps: {
          'data-testid': 'consumer-toggle',
          'data-analytics-id': 'FOLD_TOGGLE',
          'data-analytics-props': payload,
          onClick,
        },
      },
    ]);

    const toggle = screen.getByTestId('consumer-toggle');
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('data-analytics-id', 'FOLD_TOGGLE');
    expect(toggle).toHaveAttribute('data-analytics-props', payload);

    await userEvent.click(toggle);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getCollapsedFoldIds(view.state).has('body')).toBe(true);
  });

  it('forwards summaryProps to the real summary button and composes onClick', async () => {
    const onClick = vi.fn();
    const payload = '{"feature":"code","target":"fold-summary"}';
    const { view } = setup([
      {
        id: 'body',
        startLine: 1,
        endLine: 3,
        defaultCollapsed: true,
        summaryProps: {
          'data-testid': 'consumer-summary',
          'data-analytics-id': 'FOLD_SUMMARY',
          'data-analytics-props': payload,
          onClick,
        },
      },
    ]);

    const summary = screen.getByTestId('consumer-summary');
    expect(summary.tagName).toBe('BUTTON');
    expect(summary).toHaveAttribute('data-analytics-id', 'FOLD_SUMMARY');
    expect(summary).toHaveAttribute('data-analytics-props', payload);

    await userEvent.click(summary);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getCollapsedFoldIds(view.state).size).toBe(0);
  });

  it('unregisters portal hosts when the view is destroyed', () => {
    const { view, portals } = setup([
      { id: 'body', startLine: 1, endLine: 3, defaultCollapsed: true },
    ]);
    expect(portals.getSnapshot().length).toBeGreaterThan(0);

    act(() => view.destroy());
    views.splice(views.indexOf(view), 1);

    expect(portals.getSnapshot()).toHaveLength(0);
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/folds.portals.test.tsx`
Expected: PASS, 5 tests, with no React `act(...)` warnings. The implementation from Step 8 already covers these; this file guards the portal wiring and the metrics contract (`toggleProps`/`summaryProps` land on the real `<button>`, and handlers compose).

- [ ] **Step 11: Write the failing `createEditor` integration test**

Create `src/components/CodeEditor/engine/index.folds.test.ts`:

```ts
import { runScopeHandlers } from '@codemirror/view';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SyntaxAdapter } from '../../CodeSnippet/adapters';
import type { FoldRegion } from '../../CodeSnippet/lib/foldUtils';
import { createPortalRegistry } from '../lib/portalRegistry';
import { getCollapsedFoldIds } from './folds';
import { createEditor } from './index';
import type { EditorHandle, EngineCallbacks, EngineOptions } from './types';

const adapter: SyntaxAdapter<string> = {
  name: 'test',
  highlight: async code => ({ tokens: code.split('\n').map(() => []) }),
  getSupportedLanguages: () => ['text'],
};

const options = (folds: FoldRegion[] | undefined): EngineOptions => ({
  value: ['a', 'b', 'c', 'd', 'e'].join('\n'),
  documentId: undefined,
  language: 'text',
  readOnly: false,
  wrapLines: false,
  startingLineNumber: 1,
  lineNumbers: true,
  lines: {},
  folds,
  adapter,
  original: undefined,
  schema: undefined,
  completions: [],
  diagnostics: [],
  contentAttributes: {},
  testId: 'ed',
  cspNonce: undefined,
  maxHeight: null,
});

const handles: EditorHandle[] = [];

const create = (folds: FoldRegion[] | undefined) => {
  const callbacks: EngineCallbacks = {
    onChange: vi.fn(),
    onDiagnosticsChange: vi.fn(),
    onVisibleRowCountChange: vi.fn(),
    portals: createPortalRegistry(),
  };
  const parent = document.body.appendChild(document.createElement('div'));
  const handle = createEditor(parent, options(folds), callbacks);
  handles.push(handle);
  return { handle, callbacks };
};

afterEach(() => {
  for (const handle of handles.splice(0)) {
    handle.view.dom.parentElement?.remove();
    handle.destroy();
  }
});

const MIDDLE: FoldRegion[] = [{ id: 'middle', startLine: 2, endLine: 4 }];

describe('createEditor — folds wiring', () => {
  it('renders the fold gutter only when folds are given', () => {
    expect(create(MIDDLE).handle.view.dom.querySelector('.cm-ds-fold-gutter')).not.toBeNull();
    expect(create(undefined).handle.view.dom.querySelector('.cm-ds-fold-gutter')).toBeNull();
  });

  it('api.foldAll / api.unfoldAll drive the fold field and the visible row count', () => {
    const { handle, callbacks } = create(MIDDLE);

    handle.api.foldAll();
    expect(getCollapsedFoldIds(handle.view.state).has('middle')).toBe(true);
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(3);

    handle.api.unfoldAll();
    expect(getCollapsedFoldIds(handle.view.state).size).toBe(0);
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(5);
  });

  it('keeps collapsed ids when update() passes new folds', () => {
    const { handle, callbacks } = create(MIDDLE);
    handle.api.foldAll();

    handle.update(options([{ id: 'middle', startLine: 2, endLine: 3 }]));

    expect(getCollapsedFoldIds(handle.view.state).has('middle')).toBe(true);
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(4);
  });

  it('Ctrl-Alt-[ folds every region through our keymap', () => {
    const { handle } = create(MIDDLE);

    const handled = runScopeHandlers(
      handle.view,
      new KeyboardEvent('keydown', { key: '[', ctrlKey: true, altKey: true }),
      'editor',
    );

    expect(handled).toBe(true);
    expect(getCollapsedFoldIds(handle.view.state).has('middle')).toBe(true);
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/index.folds.test.ts`
Expected: FAIL. `renders the fold gutter only when folds are given` fails (`.cm-ds-fold-gutter` is null). The `api.foldAll` test fails because T5's `foldAll` does not touch `foldsField`. The `Ctrl-Alt-[` test fails because the field is not registered.

- [ ] **Step 12: Wire folds into `engine/index.ts` (T5)**

Make these edits in `src/components/CodeEditor/engine/index.ts`:

1. **Imports.** Add:
   ```ts
   import { foldAllRegions, foldsExtension, getVisibleRowCount, unfoldAllRegions } from './folds';
   ```
   In the `@codemirror/language` import, remove `foldKeymap`. Also remove `foldAll` / `unfoldAll` from that import if T5 imported them.

2. **Keymap.** In the `keymap.of([...])` array, delete the `...foldKeymap,` entry. The fold keys now come from `foldsExtension` at `Prec.high`.

3. **Compartment.** Next to T5's other `new Compartment()` declarations, make sure this one exists. If T5 already declared a folds compartment (spec §7.1 lists `folds`), reuse its name instead of adding a second one:
   ```ts
   const foldsCompartment = new Compartment();
   ```
   and add this helper above `createEditor`:
   ```ts
   const buildFolds = (options: EngineOptions, portals: PortalRegistry) =>
     foldsExtension({
       folds: options.folds,
       startingLineNumber: options.startingLineNumber,
       portals,
       testId: options.testId,
     });
   ```
   (`PortalRegistry` is `import type { PortalRegistry } from '../lib/portalRegistry';`, which T5 already imports for `guttersExtension`.)

4. **Initial extensions.** In `createEditor`, before the extensions array is built:
   ```ts
   const folds = buildFolds(options, callbacks.portals);
   ```
   Then:
   - add `foldsCompartment.of(folds.extension)` to the extensions array;
   - in the `guttersExtension({ ... })` call, replace `foldGutter: null` with `foldGutter: folds.gutter`.

5. **`update(next)`.** Add this before the reconfigure effects are dispatched:
   ```ts
   const foldsChanged =
     next.folds !== prev.folds ||
     next.startingLineNumber !== prev.startingLineNumber ||
     next.testId !== prev.testId;
   if (foldsChanged) effects.push(foldsCompartment.reconfigure(buildFolds(next, callbacks.portals).extension));
   ```
   In T5's existing gutters-reconfigure condition, add `|| next.folds !== prev.folds`. In its `guttersExtension({ ... })` call, replace `foldGutter: null` with `foldGutter: buildFolds(next, callbacks.portals).gutter`. (`prev`, `next` and `effects` stand for T5's own variables for the previous options, the new options and the effect list; use its names.)

6. **Visible row count.** Replace T5's `onVisibleRowCountChange` computation (the `EditorView.updateListener` / call that reports `state.doc.lines`) with a deduplicating reporter based on folds. Declare it inside `createEditor`, before the extensions array:
   ```ts
   let lastRowCount = -1;
   const reportRowCount = (state: EditorState): void => {
     const rows = getVisibleRowCount(state);
     if (rows === lastRowCount) return;
     lastRowCount = rows;
     callbacks.onVisibleRowCountChange(rows);
   };
   ```
   - Add `EditorView.updateListener.of(update => reportRowCount(update.state))` to the extensions. It is O(regions), so it is cheap to run on every update, and it reports only real changes (spec §7.8).
   - Call `reportRowCount(view.state)` right after `new EditorView(...)`.
   - Call it again after every `view.setState(...)` in the `documentId` switch.
   - Delete T5's old row-count code.

7. **API.** In the `api` object, replace the `foldAll` and `unfoldAll` members with:
   ```ts
   foldAll: () => {
     foldAllRegions(view);
   },
   unfoldAll: () => {
     unfoldAllRegions(view);
   },
   ```

Run: `pnpm vitest run src/components/CodeEditor/engine`
Expected: PASS for all engine tests, including T5's own `engine/index.test.ts` and T7's gutter tests.

- [ ] **Step 13: Typecheck and lint**

Run: `pnpm exec tsc --build tsconfig.app.json --noEmit`
Expected: no errors.

Run: `pnpm exec biome check src/components/CodeEditor/engine src/components/CodeSnippet`
Expected: no errors. Only the `noConsole` warnings in `CodeSnippet/lib/foldUtils.ts`, which were already there. If the formatter complains, run `pnpm exec biome check --write src/components/CodeEditor/engine` and re-run the tests.

Run: `pnpm vitest run src/components/CodeSnippet src/components/CodeEditor`
Expected: PASS. The CodeSnippet suites stay green.

- [ ] **Step 14: Commit**

```bash
git add src/components/CodeEditor/engine/folds.ts src/components/CodeEditor/engine/folds.test.ts src/components/CodeEditor/engine/folds.reconfigure.test.ts src/components/CodeEditor/engine/folds.portals.test.tsx src/components/CodeEditor/engine/index.folds.test.ts src/components/CodeEditor/engine/index.ts
git commit -m "feat(code-editor): add id-keyed folds with portal-rendered FoldToggle and summary

Folds live in a StateField: collapsed state is keyed by id, function-form
folds re-run on a 150ms debounce, and the replace decorations come straight
from the field. The fold gutter and summary reuse CodeSnippet's FoldToggle
and FoldSummary through the portal registry. Our own fold keymap replaces
CM's foldKeymap, and visible rows are counted after folds.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

**Verification status:**
- **Prototype, all passing.** I copied Steps 1–10 into `/private/tmp/claude-501/plan-t8` and ran them. That covered `folds.ts`, the three fold test files, `FoldSummary` and the `FoldToggle`/`validateFolds` edits, with minimal T3 `portalRegistry`/`PortalOutlet` stand-ins and Range stubs. The prototype used CM 6.43.13 / state 6.7.6 / language 6.12.4 with the repo's React 19.2.8, RTL, Vitest 4.1.10 and jsdom.
  - 23/23 tests pass, with no `act` warnings.
  - `tsc` in strict mode with `noUncheckedIndexedAccess` is clean for the source files.
  - Biome is clean.
- **Checked in the prototype:**
  - The inline replace from `line(start).from` to `line(end).to` renders as one `.cm-line`.
  - Keeping the StateField at module level preserves collapsed ids across `Compartment.reconfigure`.
  - `runScopeHandlers` matches `Ctrl-Shift-[` with `shiftKey`.
  - React click handlers fire on portal-rendered buttons inside CM widgets and gutter markers.
- **Not run.** Step 11/12 (`engine/index.ts` wiring) could not be run, because T5 does not exist yet. The edits are anchored on the names T5 will define (compartments, `prev`/`next`/`effects`, the `foldGutter: null` slot).
- **For T16.** Fold announcements (`EditorView.announce`, "Folded {label}" / "Unfolded {label}") are already emitted here, so T16 only needs to assert them.

---

### Task 9: React layer: CodeEditorRoot, CodeEditorContent, context, useCodeEditor, apiRef, index exports

**Files:**
- Create: `src/components/CodeEditor/lib/loadEngine.ts`
- Create: `src/components/CodeEditor/lib/keyboardHint.ts`
- Create: `src/components/CodeEditor/lib/splitContentProps.ts`
- Create: `src/components/CodeEditor/classes.ts`
- Create: `src/components/CodeEditor/CodeEditorContext.ts`
- Create: `src/components/CodeEditor/hooks/useCodeEditor.ts`
- Create: `src/components/CodeEditor/CodeEditorContent.tsx`
- Create: `src/components/CodeEditor/CodeEditorRoot.tsx`
- Modify: `src/components/CodeEditor/index.ts` (T3 made it with type exports only; this task replaces the whole file)
- Test: `src/components/CodeEditor/lib/loadEngine.test.ts`
- Test: `src/components/CodeEditor/lib/splitContentProps.test.ts`
- Test: `src/components/CodeEditor/lib/engineBoundary.test.ts`
- Test: `src/components/CodeEditor/CodeEditor.test.tsx` (new; T11–T16 add `describe` blocks to it later)
- Test: `src/components/CodeEditor/CodeEditor.loadError.test.tsx`

**Interfaces:**

Consumes. The exact names come from Shared Interfaces:
- T1: `CodeSnippetChromeContext`, `CodeSnippetChromeContextValue` (`../CodeSnippet/CodeSnippetChromeContext`), `useCodeSnippetChrome` (public, `../CodeSnippet`), and `hasExplicitShowMoreButton`, `getHiddenLineCount`, `isClamped` (`../CodeSnippet/lib/showMore`). It also needs the T1 `CodeSnippetCopyButton`, which uses `<Copyable text={getCode} onCopied={notifyCopied}>`.
- T2: `codeSnippetRootVariants` (`../CodeSnippet/classes`) and `ChromeFrame` (`../CodeSnippet/internal/ChromeFrame`). This task relies on three things ChromeFrame does: it never remounts children, it keeps props and `ref`, and it calls `useTestId('backdrop')`.
- T3: the public types in `./types`, `EngineOptions`, `EngineCallbacks` and `EditorHandle` (`./engine/types`, imported with `import type` only), `createPortalRegistry` (`./lib/portalRegistry`), and `PortalOutlet` (`./lib/PortalOutlet`).
- T5: `createEditor(parent, options, callbacks): EditorHandle` from `./engine`, reached only through `loadEngine()`. The tests below rely on these T5–T8 behaviours:
  - `.cm-content` gets `data-testid="${testId}--editor"` and the consumer `contentAttributes`.
  - `readOnly` sets `aria-readonly="true"`.
  - `maxHeightTheme(maxHeight)` sets `max-height` on `.cm-scroller`, which is the parent of `.cm-content`.
  - `api.insertText` fires `onChange`.
  - `handle.update()` syncs an external `value` without firing `onChange`.
- Existing code: `useControlled` (`src/hooks/useControlled.ts`, locks controlled vs uncontrolled on first render), `useAdapter` (`../CodeSnippet/hooks`), `plainAdapter`, `SyntaxAdapter`, `LineConfig`, `CodeSnippetSize`, `TestableProps`, `TestIdProvider`, `useTestId`, `cn`.

Produces (the public ones are exported from `CodeEditor/index.ts`):
```ts
// CodeEditorRoot.tsx
export interface CodeEditorRootProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'defaultValue' | 'onCopy'>,
    TestableProps,
    VariantProps<typeof codeSnippetRootVariants> {
  ref?: Ref<HTMLDivElement>; value?: string; defaultValue?: string; onChange?: (value: string) => void;
  language?: CodeEditorLanguage; documentId?: string; readOnly?: boolean; startingLineNumber?: number;
  lines?: Record<number, LineConfig>; folds?: CodeEditorFolds;
  wrapLines?: boolean; defaultWrapLines?: boolean; onWrapLinesChange?: (wrap: boolean) => void;
  maxLines?: number; original?: string; schema?: JsonSchema; completions?: CodeEditorCompletionSource[];
  diagnostics?: CodeEditorDiagnostic[]; onDiagnosticsChange?: (diagnostics: CodeEditorDiagnostic[]) => void;
  apiRef?: Ref<CodeEditorApi>; cspNonce?: string; onCopy?: (value: string) => void; children?: ReactNode;
}
export const CodeEditorRoot: (props: CodeEditorRootProps) => JSX.Element; // displayName 'CodeEditorRoot'
// CodeEditorContent.tsx
export interface CodeEditorContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'contentEditable' | 'role' | 'defaultValue'>,
    TestableProps { ref?: Ref<HTMLDivElement>; lineNumbers?: boolean; }
export const CodeEditorContent: FC<CodeEditorContentProps>;
// CodeEditorContext.ts (internal) — exactly as in Shared Interfaces
export interface CodeEditorContextValue { options; callbacks; setHandle; api }
export const CodeEditorContext: React.Context<CodeEditorContextValue | null>;
export const useCodeEditorContext: () => CodeEditorContextValue; // throws 'CodeEditor components must be used within CodeEditorRoot'
// hooks/useCodeEditor.ts (public)
export const useCodeEditor: () => CodeEditorApi;
// lib/loadEngine.ts (internal)
export const loadEngine: () => Promise<typeof import('../engine')>; // cached; cache cleared on rejection
// lib/keyboardHint.ts (public)
export const CODE_EDITOR_KEYBOARD_HINT: string;
// lib/splitContentProps.ts (internal, added by this task)
export interface SplitContentProps<TWrapper> { contentAttributes: Record<string, string>; wrapperProps: TWrapper; }
export const splitContentProps: <TProps extends object>(props: TProps) => SplitContentProps<TProps>;
// classes.ts (internal)
export const codeEditorContentVariants, codeEditorHostVariants, codeEditorFallbackVariants,
  codeEditorFallbackGutterVariants, codeEditorFallbackCodeVariants, codeEditorFallbackLineVariants; // CVA
// index.ts (public)
export type CodeEditorProps = CodeEditorRootProps; // alias so scripts/metadata picks up main props
```

Notes for later tasks:
- `api.getValue()` returns the current React `value` until the engine loads (the Shared Interfaces comment says `''`). Copy therefore works before the editor is ready.
- A `data-testid` passed to `CodeEditorContent` overrides the wrapper's derived `…--content` id. It is not forwarded to `.cm-content`, because the engine owns `…--editor`.
- `httpCompletions` is added to `index.ts` by T14, not by this task.

---

- [ ] **Step 1: Write the failing test for `loadEngine`**

Create `src/components/CodeEditor/lib/loadEngine.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { loadEngine } from './loadEngine';

describe('loadEngine', () => {
  it('returns one cached promise for every caller', () => {
    expect(loadEngine()).toBe(loadEngine());
  });

  it('resolves to the engine module', async () => {
    const engine = await loadEngine();
    expect(typeof engine.createEditor).toBe('function');
  });
});
```

- [ ] **Step 2: Run it and check that it fails**

Run: `pnpm vitest run src/components/CodeEditor/lib/loadEngine.test.ts`
Expected: FAIL with `Failed to resolve import "./loadEngine"`.

- [ ] **Step 3: Implement `loadEngine` and the keyboard hint**

Create `src/components/CodeEditor/lib/loadEngine.ts`:
```ts
type EngineModule = typeof import('../engine');

let enginePromise: Promise<EngineModule> | null = null;

/**
 * Loads the CodeMirror engine chunk once. Every `CodeEditorContent` shares the
 * same promise; a rejected import clears the cache so a later mount can retry.
 */
export const loadEngine = (): Promise<EngineModule> => {
  if (!enginePromise) {
    enginePromise = import('../engine').catch((error: unknown) => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
};
```

Create `src/components/CodeEditor/lib/keyboardHint.ts`:
```ts
/**
 * Keyboard hint for the editor (spec §7.16). Render it in an element and point
 * `aria-describedby` on `CodeEditorContent` at that element's id.
 */
export const CODE_EDITOR_KEYBOARD_HINT =
  'Tab inserts indentation. Press Escape, then Tab, to move focus out of the editor.';
```

- [ ] **Step 4: Run it and check that it passes**

Run: `pnpm vitest run src/components/CodeEditor/lib/loadEngine.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing test for attribute routing**

Create `src/components/CodeEditor/lib/splitContentProps.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest';
import { splitContentProps } from './splitContentProps';

describe('splitContentProps', () => {
  it('routes data-*, aria-*, id, title and tabIndex to the typing surface', () => {
    const onKeyDown = vi.fn();
    const style = { color: 'red' };
    const { contentAttributes, wrapperProps } = splitContentProps({
      'data-analytics-id': 'editor',
      'data-analytics-props': '{"a":1}',
      'aria-label': 'Request',
      'aria-invalid': true,
      id: 'req',
      title: 'Request body',
      tabIndex: 0,
      style,
      onKeyDown,
      lang: 'en',
    });

    expect(contentAttributes).toEqual({
      'data-analytics-id': 'editor',
      'data-analytics-props': '{"a":1}',
      'aria-label': 'Request',
      'aria-invalid': 'true',
      id: 'req',
      title: 'Request body',
      tabindex: '0',
    });
    expect(wrapperProps).toEqual({ style, onKeyDown, lang: 'en' });
  });

  it('drops undefined and null attribute values', () => {
    const { contentAttributes } = splitContentProps({
      'aria-label': undefined,
      'data-x': null,
      id: undefined,
    });
    expect(contentAttributes).toEqual({});
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/lib/splitContentProps.test.ts`
Expected: FAIL with `Failed to resolve import "./splitContentProps"`.

- [ ] **Step 6: Implement `splitContentProps`**

Create `src/components/CodeEditor/lib/splitContentProps.ts`:
```ts
export interface SplitContentProps<TWrapper> {
  /** Attributes for the typing surface (`.cm-content`), as DOM attribute strings */
  contentAttributes: Record<string, string>;
  /** Everything else: className, style, event handlers, other wrapper attributes */
  wrapperProps: TWrapper;
}

const isContentAttribute = (key: string): boolean =>
  key.startsWith('data-') || key.startsWith('aria-') || key === 'id' || key === 'title';

const toAttributeValue = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
};

/**
 * Attribute routing for `CodeEditorContent` (spec D10): `data-*`, `aria-*`,
 * `id`, `title` and `tabIndex` go to the editor's typing surface; the rest stays
 * on the wrapper div. `undefined` / `null` values are dropped, as React would.
 */
export const splitContentProps = <TProps extends object>(
  props: TProps,
): SplitContentProps<TProps> => {
  const contentAttributes: Record<string, string> = {};
  const wrapperProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (key === 'tabIndex') {
      const attribute = toAttributeValue(value);
      if (attribute !== null) contentAttributes.tabindex = attribute;
      continue;
    }
    if (isContentAttribute(key)) {
      const attribute = toAttributeValue(value);
      if (attribute !== null) contentAttributes[key] = attribute;
      continue;
    }
    wrapperProps[key] = value;
  }

  return { contentAttributes, wrapperProps: wrapperProps as TProps };
};
```

Run: `pnpm vitest run src/components/CodeEditor/lib/splitContentProps.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: Write the failing component tests**

Create `src/components/CodeEditor/CodeEditor.test.tsx`. The engine is loaded with a dynamic import, so every test that mounts the editor waits for `ed--editor` before it ends. Without that wait, React logs act() warnings after the test finishes.
```tsx
import { act, createRef, StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../../utils/copyText';
import {
  CodeSnippetActions,
  CodeSnippetCopyButton,
  CodeSnippetFullscreenButton,
  CodeSnippetHeader,
  CodeSnippetTitle,
  CodeSnippetWrapButton,
  useCodeSnippetChrome,
} from '../CodeSnippet';
import { type CodeEditorApi, CodeEditorContent, CodeEditorRoot, useCodeEditor } from './index';
import { loadEngine } from './lib/loadEngine';

vi.mock('../../utils/copyText', () => ({
  copyText: vi.fn(() => Promise.resolve()),
}));

const makeValue = (lineCount: number) =>
  Array.from({ length: lineCount }, (_, index) => `line ${index + 1}`).join('\n');

const WrapProbe = () => {
  const { wrapLines } = useCodeSnippetChrome();
  return <output data-testid='wrap-probe'>{String(wrapLines)}</output>;
};

afterEach(() => {
  vi.mocked(copyText).mockClear();
  vi.restoreAllMocks();
});

describe('CodeEditor', () => {
  describe('loading', () => {
    it('renders the static fallback first, then the editor', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue={'GET / HTTP/1.1\nHost: a'}>
          <CodeEditorContent aria-label='Request' />
        </CodeEditorRoot>,
      );

      const fallback = screen.getByTestId('ed--fallback');
      expect(fallback).toHaveAttribute('aria-busy', 'true');
      expect(fallback).toHaveTextContent('GET / HTTP/1.1');
      expect(fallback).toHaveTextContent('Host: a');

      const editor = await screen.findByTestId('ed--editor');
      expect(editor).toHaveTextContent('Host: a');
      expect(screen.queryByTestId('ed--fallback')).not.toBeInTheDocument();
    });

    it('numbers fallback rows from startingLineNumber when lineNumbers is set', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue={'a\nb'} startingLineNumber={41}>
          <CodeEditorContent aria-label='Code' lineNumbers />
        </CodeEditorRoot>,
      );

      expect(screen.getByTestId('ed--fallback')).toHaveTextContent('41');
      expect(screen.getByTestId('ed--fallback')).toHaveTextContent('42');
      await screen.findByTestId('ed--editor');
    });

    it('creates exactly one editor under StrictMode', async () => {
      render(
        <StrictMode>
          <CodeEditorRoot data-testid='ed' defaultValue='x'>
            <CodeEditorContent aria-label='Code' />
          </CodeEditorRoot>
        </StrictMode>,
      );

      await screen.findByTestId('ed--editor');
      expect(screen.getAllByTestId('ed--editor')).toHaveLength(1);
    });

    it('does not throw or warn when unmounted before the engine resolves', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const consoleWarn = vi.spyOn(console, 'warn');
      const { unmount } = render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      unmount();
      await act(async () => {
        await loadEngine();
      });

      expect(screen.queryByTestId('ed--editor')).not.toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
      expect(consoleWarn).not.toHaveBeenCalled();
    });

    it('warns in development when the editor has no accessible name', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeEditorContent />
        </CodeEditorRoot>,
      );

      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
      await screen.findByTestId('ed--editor');
    });

    it('throws when CodeEditorContent is rendered outside CodeEditorRoot', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(<CodeEditorContent aria-label='Code' />)).toThrow(
        'CodeEditor components must be used within CodeEditorRoot',
      );
    });
  });

  describe('value', () => {
    it('fires onChange for edits made through apiRef and keeps the uncontrolled value', async () => {
      const onChange = vi.fn();
      const apiRef = createRef<CodeEditorApi>();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='abc' onChange={onChange} apiRef={apiRef}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');

      act(() => apiRef.current?.insertText('X'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('Xabc');
      expect(apiRef.current?.getValue()).toBe('Xabc');
      expect(screen.getByTestId('ed--editor')).toHaveTextContent('Xabc');
    });

    it('syncs a new controlled value into the document without firing onChange', async () => {
      const onChange = vi.fn();
      const apiRef = createRef<CodeEditorApi>();
      const { rerender } = render(
        <CodeEditorRoot data-testid='ed' value='first' onChange={onChange} apiRef={apiRef}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');

      rerender(
        <CodeEditorRoot data-testid='ed' value='second' onChange={onChange} apiRef={apiRef}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      expect(apiRef.current?.getValue()).toBe('second');
      expect(screen.getByTestId('ed--editor')).toHaveTextContent('second');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('returns the current value from the api before the engine loads', async () => {
      const apiRef = createRef<CodeEditorApi>();
      render(
        <CodeEditorRoot data-testid='ed' value='early' apiRef={apiRef}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      expect(screen.getByTestId('ed--fallback')).toBeInTheDocument();
      expect(apiRef.current?.getValue()).toBe('early');
      await screen.findByTestId('ed--editor');
    });

    it('useCodeEditor returns the same api object as apiRef', async () => {
      const apiRef = createRef<CodeEditorApi>();
      let fromHook: CodeEditorApi | null = null;
      const Probe = () => {
        fromHook = useCodeEditor();
        return null;
      };
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x' apiRef={apiRef}>
          <Probe />
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');

      expect(fromHook).not.toBeNull();
      expect(fromHook).toBe(apiRef.current);
    });
  });

  describe('chrome', () => {
    it('copies the edited document and calls onCopy with it', async () => {
      const onCopy = vi.fn();
      const apiRef = createRef<CodeEditorApi>();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='abc' onCopy={onCopy} apiRef={apiRef}>
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetCopyButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      await screen.findByTestId('ed--editor');
      act(() => apiRef.current?.insertText('edited '));

      await userEvent.click(screen.getByTestId('ed--copy-button'));

      expect(copyText).toHaveBeenCalledWith('edited abc');
      expect(onCopy).toHaveBeenCalledWith('edited abc');
    });

    it('toggles uncontrolled wrapping and reports it through onWrapLinesChange', async () => {
      const onWrapLinesChange = vi.fn();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x' onWrapLinesChange={onWrapLinesChange}>
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetWrapButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <WrapProbe />
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      await userEvent.click(screen.getByTestId('ed--wrap-button'));

      expect(onWrapLinesChange).toHaveBeenCalledWith(true);
      expect(screen.getByTestId('wrap-probe')).toHaveTextContent('true');
    });

    it('respects controlled wrapLines', async () => {
      const onWrapLinesChange = vi.fn();
      render(
        <CodeEditorRoot
          data-testid='ed'
          defaultValue='x'
          wrapLines={false}
          onWrapLinesChange={onWrapLinesChange}
        >
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetWrapButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <WrapProbe />
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      await userEvent.click(screen.getByTestId('ed--wrap-button'));

      expect(onWrapLinesChange).toHaveBeenCalledWith(true);
      expect(screen.getByTestId('wrap-probe')).toHaveTextContent('false');
    });

    it('keeps the same editor instance when entering and leaving fullscreen', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetFullscreenButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      const before = await screen.findByTestId('ed--editor');

      await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
      expect(screen.getByTestId('ed--fullscreen-button')).toHaveAccessibleName('Exit full screen');
      expect(screen.getByTestId('ed--editor')).toBe(before);

      await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
      expect(screen.getByTestId('ed--fullscreen-button')).toHaveAccessibleName('Enter full screen');
      expect(screen.getByTestId('ed--editor')).toBe(before);
    });

    it('clamps to maxLines with an auto-rendered show-more button and unclamps on click', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue={makeValue(10)} maxLines={4}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      const editor = await screen.findByTestId('ed--editor');
      const scroller = editor.parentElement as HTMLElement;

      const showMore = screen.getByTestId('ed--show-more-button');
      expect(showMore).toHaveTextContent('Show more (6 lines)');
      expect(getComputedStyle(scroller).maxHeight).toBe('96px');

      await userEvent.click(showMore);

      expect(screen.getByTestId('ed--show-more-button')).toHaveTextContent('Show less');
      expect(getComputedStyle(scroller).maxHeight).not.toBe('96px');
    });

    it('does not clamp when fewer than 3 rows would be hidden', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue={makeValue(6)} maxLines={4}>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );
      const editor = await screen.findByTestId('ed--editor');

      expect(screen.queryByTestId('ed--show-more-button')).not.toBeInTheDocument();
      expect(getComputedStyle(editor.parentElement as HTMLElement).maxHeight).not.toBe('96px');
    });

    it('cascades test ids to the reused chrome', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeSnippetHeader>
            <CodeSnippetTitle>Request</CodeSnippetTitle>
            <CodeSnippetActions>
              <CodeSnippetCopyButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      expect(screen.getByTestId('ed')).toHaveAttribute('data-slot', 'code-editor');
      expect(screen.getByTestId('ed--header')).toBeInTheDocument();
      expect(screen.getByTestId('ed--title')).toHaveTextContent('Request');
      expect(screen.getByTestId('ed--actions')).toBeInTheDocument();
      expect(screen.getByTestId('ed--copy-button')).toBeInTheDocument();
      expect(screen.getByTestId('ed--content')).toHaveAttribute('data-ds-suppress-parent-click');
      await screen.findByTestId('ed--editor');
    });
  });

  describe('attributes and events', () => {
    it('lands consumer data-*/aria-* on the editor node, not on the wrapper', async () => {
      const payload = '{"rule":"r-1","nested":{"a":[1,2]}}';
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeEditorContent
            aria-label='HTTP request'
            data-analytics-id='rule-request-editor'
            data-analytics-props={payload}
            id='request-editor'
          />
        </CodeEditorRoot>,
      );
      const editor = await screen.findByTestId('ed--editor');
      const wrapper = screen.getByTestId('ed--content');

      expect(editor).toHaveAttribute('aria-label', 'HTTP request');
      expect(editor).toHaveAttribute('data-analytics-id', 'rule-request-editor');
      expect(editor).toHaveAttribute('data-analytics-props', payload);
      expect(editor).toHaveAttribute('id', 'request-editor');
      expect(wrapper).not.toHaveAttribute('data-analytics-id');
      expect(wrapper).not.toHaveAttribute('aria-label');
    });

    it('keeps className and handlers on the wrapper, which receives bubbled keydown', async () => {
      const onKeyDown = vi.fn();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x'>
          <CodeEditorContent aria-label='Code' className='custom-wrapper' onKeyDown={onKeyDown} />
        </CodeEditorRoot>,
      );
      const editor = await screen.findByTestId('ed--editor');

      fireEvent.keyDown(editor, { key: 'a' });

      expect(screen.getByTestId('ed--content')).toHaveClass('custom-wrapper');
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown.mock.calls[0]?.[0].target).toBe(editor);
    });

    it('marks the editor aria-readonly when readOnly', async () => {
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x' readOnly>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      const editor = await screen.findByTestId('ed--editor');
      expect(editor).toHaveAttribute('aria-readonly', 'true');
    });

    it('keeps root consumer props and ref on the root element', async () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <CodeEditorRoot data-testid='ed' defaultValue='x' ref={ref} data-analytics-id='root'>
          <CodeEditorContent aria-label='Code' />
        </CodeEditorRoot>,
      );

      await waitFor(() => expect(ref.current).toBe(screen.getByTestId('ed')));
      expect(screen.getByTestId('ed')).toHaveAttribute('data-analytics-id', 'root');
    });
  });
});
```

Create `src/components/CodeEditor/CodeEditor.loadError.test.tsx`. It is a separate file because it mocks `loadEngine` for the whole module:
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditorContent, CodeEditorRoot } from './index';

vi.mock('./lib/loadEngine', () => ({
  loadEngine: () => Promise.reject(new Error('chunk failed')),
}));

describe('CodeEditor engine load failure', () => {
  it('keeps the fallback text and logs the error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <CodeEditorRoot data-testid='ed' defaultValue={'a\nb'}>
        <CodeEditorContent aria-label='Code' />
      </CodeEditorRoot>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('ed--fallback')).toHaveAttribute('aria-busy', 'false'),
    );
    expect(screen.getByTestId('ed--fallback')).toHaveTextContent('a');
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load the editor engine'),
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});
```

- [ ] **Step 8: Run the component tests and check that they fail**

Run: `pnpm vitest run src/components/CodeEditor/CodeEditor.test.tsx src/components/CodeEditor/CodeEditor.loadError.test.tsx`
Expected: FAIL. `./index` has no runtime export `CodeEditorRoot` yet, so you get `SyntaxError: The requested module './index' does not provide an export named 'CodeEditorContent'` or `Element type is invalid`.

- [ ] **Step 9: Add the content CVA, the internal context and `useCodeEditor`**

Create `src/components/CodeEditor/classes.ts`:
```ts
import { cva } from 'class-variance-authority';

/** `CodeEditorContent` wrapper: fills the root's flex column (fullscreen) and clips by height. */
export const codeEditorContentVariants = cva('relative flex-1 min-h-0');

/** Element CodeMirror mounts into; `.cm-editor` fills it in the fullscreen column. */
export const codeEditorHostVariants = cva('h-full [&>.cm-editor]:h-full');

/** Static text shown until the engine chunk resolves: CodeSnippet's 20px rows and `py-8`. */
export const codeEditorFallbackVariants = cva('m-0 flex overflow-hidden py-8 font-mono');

export const codeEditorFallbackGutterVariants = cva(
  'mr-8 flex shrink-0 flex-col px-8 text-right text-text-secondary select-none',
);

export const codeEditorFallbackCodeVariants = cva('flex min-w-0 flex-1 flex-col pr-12', {
  variants: {
    hasGutter: {
      true: '',
      false: 'pl-12',
    },
  },
  defaultVariants: {
    hasGutter: false,
  },
});

export const codeEditorFallbackLineVariants = cva('block min-h-lh leading-sm', {
  variants: {
    wrapLines: {
      true: 'whitespace-pre-wrap break-all',
      false: 'whitespace-pre',
    },
  },
  defaultVariants: {
    wrapLines: false,
  },
});
```

Create `src/components/CodeEditor/CodeEditorContext.ts`:
```ts
import { createContext, useContext } from 'react';
import type { EditorHandle, EngineCallbacks, EngineOptions } from './engine/types';
import type { CodeEditorApi } from './types';

/** Internal bridge between `CodeEditorRoot` (state owner) and `CodeEditorContent` (engine host). */
export interface CodeEditorContextValue {
  /** Engine options owned by Root; Content adds `lineNumbers` and `contentAttributes` */
  options: Omit<EngineOptions, 'lineNumbers' | 'contentAttributes' | 'maxHeight'> & {
    maxHeight: number | null;
  };
  /** Stable callbacks (same identity for the Root's lifetime) */
  callbacks: Omit<EngineCallbacks, 'portals'>;
  /** Content registers the live handle after `createEditor()` and clears it on destroy */
  setHandle: (handle: EditorHandle | null) => void;
  /** Stable object delegating to the current handle (no-ops before the engine loads) */
  api: CodeEditorApi;
}

export const CodeEditorContext = createContext<CodeEditorContextValue | null>(null);

export const useCodeEditorContext = (): CodeEditorContextValue => {
  const context = useContext(CodeEditorContext);
  if (!context) {
    throw new Error('CodeEditor components must be used within CodeEditorRoot');
  }
  return context;
};
```

Create `src/components/CodeEditor/hooks/useCodeEditor.ts`:
```ts
import { useCodeEditorContext } from '../CodeEditorContext';
import type { CodeEditorApi } from '../types';

/**
 * Returns the editor's imperative API from inside `CodeEditorRoot`
 * (e.g. in custom header actions). Same object as `apiRef`.
 */
export const useCodeEditor = (): CodeEditorApi => useCodeEditorContext().api;
```

- [ ] **Step 10: Implement `CodeEditorContent`**

The component does five things:
- It loads the engine in an effect with a `cancelled` flag, which makes it safe under StrictMode and when it unmounts before the import resolves.
- It creates the editor with the latest options, then calls `handle.update` on every option change.
- It keeps the `contentAttributes` identity stable, so the engine does not reconfigure on every render.
- It shows the fallback until the engine loads, and keeps it if loading fails.
- It creates one portal registry per Content.

Create `src/components/CodeEditor/CodeEditorContent.tsx`:
```tsx
import type { FC, HTMLAttributes, Ref } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useCodeEditorContext } from './CodeEditorContext';
import {
  codeEditorContentVariants,
  codeEditorFallbackCodeVariants,
  codeEditorFallbackGutterVariants,
  codeEditorFallbackLineVariants,
  codeEditorFallbackVariants,
  codeEditorHostVariants,
} from './classes';
import type { EditorHandle, EngineOptions } from './engine/types';
import { loadEngine } from './lib/loadEngine';
import { PortalOutlet } from './lib/PortalOutlet';
import { createPortalRegistry } from './lib/portalRegistry';
import { splitContentProps } from './lib/splitContentProps';

type CodeEditorContentNativeProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'contentEditable' | 'role' | 'defaultValue'
>;

export interface CodeEditorContentProps extends CodeEditorContentNativeProps, TestableProps {
  /** Content wrapper element */
  ref?: Ref<HTMLDivElement>;
  /** Show the line-number gutter (CodeSnippet's `<CodeSnippetLineNumbers />` equivalent) */
  lineNumbers?: boolean;
}

const ROW_HEIGHT = 20;
const VERTICAL_PADDING = 16;

interface FallbackRow {
  number: number;
  text: string;
}

const buildFallbackRows = (
  value: string,
  startingLineNumber: number,
  maxHeight: number | null,
): FallbackRow[] => {
  const lines = value.split('\n');
  const visible =
    maxHeight === null
      ? lines
      : lines.slice(0, Math.max(0, Math.round((maxHeight - VERTICAL_PADDING) / ROW_HEIGHT)));
  return visible.map((text, index) => ({ number: startingLineNumber + index, text }));
};

/**
 * Editing surface of `CodeEditorRoot`. Loads the CodeMirror engine on mount and
 * shows the value as static text until it is ready. `data-*`, `aria-*`, `id`,
 * `title` and `tabIndex` land on the typing surface; `className`, `style`, `ref`
 * and event handlers stay on this wrapper (events from the editor bubble to it).
 */
export const CodeEditorContent: FC<CodeEditorContentProps> = ({
  ref,
  lineNumbers = false,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('content', testIdProp);
  const fallbackTestId = useTestId('fallback');
  const { options, callbacks, setHandle } = useCodeEditorContext();
  const [registry] = useState(createPortalRegistry);
  const [handle, setLocalHandle] = useState<EditorHandle | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  const { contentAttributes: routedAttributes, wrapperProps } = splitContentProps(props);
  // Stable identity while the attribute values are unchanged, so the engine does not reconfigure per render.
  const attributesKey = JSON.stringify(routedAttributes);
  const contentAttributes = useMemo(
    () => JSON.parse(attributesKey) as Record<string, string>,
    [attributesKey],
  );

  const engineOptions = useMemo<EngineOptions>(
    () => ({ ...options, lineNumbers, contentAttributes }),
    [options, lineNumbers, contentAttributes],
  );
  const optionsRef = useRef(engineOptions);

  useEffect(() => {
    optionsRef.current = engineOptions;
  }, [engineOptions]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let created: EditorHandle | null = null;

    loadEngine().then(
      engine => {
        if (cancelled) return;
        created = engine.createEditor(host, optionsRef.current, {
          ...callbacks,
          portals: registry,
        });
        setHandle(created);
        setLocalHandle(created);
      },
      (error: unknown) => {
        if (cancelled) return;
        // biome-ignore lint/suspicious/noConsole: engine load failures have no onError (spec D12); log and keep the fallback.
        console.error(
          '[CodeEditor] Failed to load the editor engine; showing read-only text.',
          error,
        );
        setLoadFailed(true);
      },
    );

    return () => {
      cancelled = true;
      if (created) {
        created.destroy();
        setHandle(null);
      }
      setLocalHandle(null);
    };
  }, [callbacks, registry, setHandle]);

  useEffect(() => {
    handle?.update(engineOptions);
  }, [handle, engineOptions]);

  const hasAccessibleName =
    contentAttributes['aria-label'] !== undefined ||
    contentAttributes['aria-labelledby'] !== undefined;

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
      // biome-ignore lint/suspicious/noConsole: dev-only accessibility authoring guard.
      console.warn(
        '[CodeEditor] CodeEditorContent has no accessible name. Pass `aria-label` or `aria-labelledby`.',
      );
    }
  }, [hasAccessibleName]);

  const fallbackRows =
    handle === null
      ? buildFallbackRows(options.value, options.startingLineNumber, options.maxHeight)
      : null;

  return (
    <div
      {...wrapperProps}
      ref={ref}
      data-slot='code-editor-content'
      data-testid={testId}
      data-ds-suppress-parent-click=''
      className={cn(codeEditorContentVariants(), className)}
    >
      {fallbackRows && (
        <pre
          data-testid={fallbackTestId}
          aria-busy={loadFailed ? 'false' : 'true'}
          className={codeEditorFallbackVariants()}
        >
          {lineNumbers && (
            <span aria-hidden='true' className={codeEditorFallbackGutterVariants()}>
              {fallbackRows.map(row => (
                <span key={row.number} className={codeEditorFallbackLineVariants()}>
                  {row.number}
                </span>
              ))}
            </span>
          )}
          <code className={codeEditorFallbackCodeVariants({ hasGutter: lineNumbers })}>
            {fallbackRows.map(row => (
              <span
                key={row.number}
                className={codeEditorFallbackLineVariants({ wrapLines: options.wrapLines })}
              >
                {row.text}
              </span>
            ))}
          </code>
        </pre>
      )}
      <div ref={hostRef} className={codeEditorHostVariants()} />
      <PortalOutlet registry={registry} />
    </div>
  );
};

CodeEditorContent.displayName = 'CodeEditorContent';
```

- [ ] **Step 11: Implement `CodeEditorRoot`**

What the component does:
- `value` and `wrapLines` go through `useControlled`.
- Consumer callbacks are read from `latest`, a ref synced in an effect. That lets `callbacks`, `api` and `setHandle` keep one identity for the Root's lifetime, so `CodeEditorContent` never recreates the editor.
- The visible row count comes from `onVisibleRowCountChange`. Until the engine reports it, the line count of `value` is used.
- `maxHeight` is `maxLines * 20 + 16` while the content is clamped.
- `ShowMore` is rendered automatically, as in `CodeSnippetRoot`.

Create `src/components/CodeEditor/CodeEditorRoot.tsx`:
```tsx
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { useControlled } from '../../hooks/useControlled';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { plainAdapter } from '../CodeSnippet/adapters/plain';
import type { SyntaxAdapter } from '../CodeSnippet/adapters/types';
import {
  CodeSnippetChromeContext,
  type CodeSnippetChromeContextValue,
} from '../CodeSnippet/CodeSnippetChromeContext';
import type { CodeSnippetSize, LineConfig } from '../CodeSnippet/CodeSnippetContext';
import { CodeSnippetShowMoreButton } from '../CodeSnippet/CodeSnippetShowMoreButton';
import { codeSnippetRootVariants } from '../CodeSnippet/classes';
import { useAdapter } from '../CodeSnippet/hooks';
import { ChromeFrame } from '../CodeSnippet/internal/ChromeFrame';
import {
  getHiddenLineCount,
  hasExplicitShowMoreButton,
  isClamped,
} from '../CodeSnippet/lib/showMore';
import { CodeEditorContext, type CodeEditorContextValue } from './CodeEditorContext';
import type { EditorHandle } from './engine/types';
import type {
  CodeEditorApi,
  CodeEditorCompletionSource,
  CodeEditorDiagnostic,
  CodeEditorFolds,
  CodeEditorLanguage,
  JsonSchema,
} from './types';

type CodeEditorRootNativeProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'defaultValue' | 'onCopy'
>;

export interface CodeEditorRootProps
  extends CodeEditorRootNativeProps,
    TestableProps,
    VariantProps<typeof codeSnippetRootVariants> {
  /** Root element, including in fullscreen */
  ref?: Ref<HTMLDivElement>;
  /** Controlled document */
  value?: string;
  /** Uncontrolled initial document (controlled vs uncontrolled is locked on first render) */
  defaultValue?: string;
  /** Fired for user edits only, never for external `value` syncs */
  onChange?: (value: string) => void;
  /** Passed verbatim to the syntax adapter; selects the structural parser */
  language?: CodeEditorLanguage;
  /** Document identity: changing it swaps to that document's cached state (undo history, selection, folds) */
  documentId?: string;
  /** Focusable, selectable, searchable, copyable — but not editable by the user */
  readOnly?: boolean;
  /** Offsets gutter numbers; `lines`, `folds`, `diagnostics` use absolute numbers */
  startingLineNumber?: number;
  /** Per-line configuration keyed by absolute line number (static, see spec D6) */
  lines?: Record<number, LineConfig>;
  /** Fold regions, or a function re-run after edits; collapsed state is kept by `id` */
  folds?: CodeEditorFolds;
  /** Controlled line wrapping */
  wrapLines?: boolean;
  /** Uncontrolled initial line wrapping */
  defaultWrapLines?: boolean;
  /** Fired when the wrap button toggles wrapping */
  onWrapLinesChange?: (wrap: boolean) => void;
  /** Height clamp in rows; auto-renders `CodeSnippetShowMoreButton` unless one is a direct child */
  maxLines?: number;
  /** Enables diff mode against this text */
  original?: string;
  /** JSON Schema for the document (`json`) or the JSON body (`http`) */
  schema?: JsonSchema;
  /** Consumer completion sources, added after the built-in ones */
  completions?: CodeEditorCompletionSource[];
  /** External diagnostics, merged with syntax and schema ones */
  diagnostics?: CodeEditorDiagnostic[];
  /** Fired when the merged diagnostics change */
  onDiagnosticsChange?: (diagnostics: CodeEditorDiagnostic[]) => void;
  /** Imperative handle */
  apiRef?: Ref<CodeEditorApi>;
  /** Nonce for the style tags the editor injects */
  cspNonce?: string;
  /** Fired by `CodeSnippetCopyButton` after a copy, with the current document */
  onCopy?: (value: string) => void;
  /** Chrome (header, floating actions, show more) and `CodeEditorContent` */
  children?: ReactNode;
}

const EMPTY_LINES: Record<number, LineConfig> = {};
const EMPTY_COMPLETIONS: CodeEditorCompletionSource[] = [];
const EMPTY_DIAGNOSTICS: CodeEditorDiagnostic[] = [];
const ROW_HEIGHT = 20;
const VERTICAL_PADDING = 16;

const countLines = (value: string): number => {
  let count = 1;
  for (let index = value.indexOf('\n'); index !== -1; index = value.indexOf('\n', index + 1)) {
    count += 1;
  }
  return count;
};

interface LatestProps {
  value: string;
  onChange: ((value: string) => void) | undefined;
  onDiagnosticsChange: ((diagnostics: CodeEditorDiagnostic[]) => void) | undefined;
  onWrapLinesChange: ((wrap: boolean) => void) | undefined;
  onCopy: ((value: string) => void) | undefined;
}

/**
 * Editable code surface (CodeMirror 6, lazy-loaded) that looks like CodeSnippet and reuses
 * its chrome: syntax-adapter colours, gutters, lines, folds, copy/wrap/fullscreen/show-more,
 * plus find/replace, diagnostics, JSON Schema, autocomplete and diff against an original.
 */
export const CodeEditorRoot = ({
  ref,
  value: valueProp,
  defaultValue = '',
  onChange,
  language = 'text',
  documentId,
  size = 'sm',
  readOnly = false,
  startingLineNumber = 1,
  lines = EMPTY_LINES,
  folds,
  wrapLines: wrapLinesProp,
  defaultWrapLines = false,
  onWrapLinesChange,
  maxLines = 0,
  original,
  schema,
  completions = EMPTY_COMPLETIONS,
  diagnostics = EMPTY_DIAGNOSTICS,
  onDiagnosticsChange,
  apiRef,
  cspNonce,
  onCopy,
  className,
  children,
  'data-testid': testId,
  ...props
}: CodeEditorRootProps) => {
  const adapterContext = useAdapter();
  // plainAdapter ignores the language, so widening its language parameter is safe (same as CodeSnippetRoot).
  const adapter = (adapterContext?.adapter ?? plainAdapter) as SyntaxAdapter<string>;

  const [valueState, setValue] = useControlled<string>({
    controlled: valueProp,
    default: defaultValue,
  });
  const value = valueState ?? '';

  const [wrapState, setWrapState] = useControlled<boolean>({
    controlled: wrapLinesProp,
    default: defaultWrapLines,
  });
  const wrapLines = wrapState ?? false;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [engineRows, setEngineRows] = useState<number | null>(null);

  const latest = useRef<LatestProps>({
    value,
    onChange,
    onDiagnosticsChange,
    onWrapLinesChange,
    onCopy,
  });
  useEffect(() => {
    latest.current = { value, onChange, onDiagnosticsChange, onWrapLinesChange, onCopy };
  });

  const handleRef = useRef<EditorHandle | null>(null);

  const [api] = useState<CodeEditorApi>(() => ({
    focus: () => handleRef.current?.api.focus(),
    getValue: () => handleRef.current?.api.getValue() ?? latest.current.value,
    insertText: text => handleRef.current?.api.insertText(text),
    openSearch: () => handleRef.current?.api.openSearch(),
    foldAll: () => handleRef.current?.api.foldAll(),
    unfoldAll: () => handleRef.current?.api.unfoldAll(),
  }));

  useImperativeHandle(apiRef, () => api, [api]);

  const [callbacks] = useState<CodeEditorContextValue['callbacks']>(() => ({
    onChange: next => {
      setValue(next);
      latest.current.onChange?.(next);
    },
    onDiagnosticsChange: next => latest.current.onDiagnosticsChange?.(next),
    onVisibleRowCountChange: rows => setEngineRows(rows),
  }));

  const setHandle = useCallback((handle: EditorHandle | null) => {
    handleRef.current = handle;
    if (handle === null) setEngineRows(null);
  }, []);

  const setWrapLines = useCallback(
    (wrap: boolean) => {
      setWrapState(wrap);
      latest.current.onWrapLinesChange?.(wrap);
    },
    [setWrapState],
  );

  const getCode = useCallback(() => api.getValue(), [api]);
  const notifyCopied = useCallback(() => latest.current.onCopy?.(api.getValue()), [api]);

  const lineCount = useMemo(() => countLines(value), [value]);
  const hiddenLineCount = getHiddenLineCount(engineRows ?? lineCount, maxLines);
  const maxHeight = isClamped(hiddenLineCount, isExpanded)
    ? maxLines * ROW_HEIGHT + VERTICAL_PADDING
    : null;
  const resolvedSize: CodeSnippetSize = size ?? 'sm';

  const chromeValue = useMemo<CodeSnippetChromeContextValue>(
    () => ({
      size: resolvedSize,
      getCode,
      notifyCopied,
      wrapLines,
      setWrapLines,
      isFullscreen,
      setIsFullscreen,
      maxLines,
      isExpanded,
      setIsExpanded,
      hiddenLineCount,
    }),
    [
      resolvedSize,
      getCode,
      notifyCopied,
      wrapLines,
      setWrapLines,
      isFullscreen,
      maxLines,
      isExpanded,
      hiddenLineCount,
    ],
  );

  const options = useMemo<CodeEditorContextValue['options']>(
    () => ({
      value,
      documentId,
      language,
      readOnly,
      wrapLines,
      startingLineNumber,
      lines,
      folds,
      adapter,
      original,
      schema,
      completions,
      diagnostics,
      testId,
      cspNonce,
      maxHeight,
    }),
    [
      value,
      documentId,
      language,
      readOnly,
      wrapLines,
      startingLineNumber,
      lines,
      folds,
      adapter,
      original,
      schema,
      completions,
      diagnostics,
      testId,
      cspNonce,
      maxHeight,
    ],
  );

  const editorContext = useMemo<CodeEditorContextValue>(
    () => ({ options, callbacks, setHandle, api }),
    [options, callbacks, setHandle, api],
  );

  return (
    <TestIdProvider value={testId}>
      <CodeSnippetChromeContext.Provider value={chromeValue}>
        <CodeEditorContext.Provider value={editorContext}>
          <ChromeFrame
            {...props}
            ref={ref}
            data-slot='code-editor'
            data-testid={testId}
            className={cn(codeSnippetRootVariants({ size }), className)}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
          >
            {children}
            {maxLines > 0 && !hasExplicitShowMoreButton(children) && <CodeSnippetShowMoreButton />}
          </ChromeFrame>
        </CodeEditorContext.Provider>
      </CodeSnippetChromeContext.Provider>
    </TestIdProvider>
  );
};

CodeEditorRoot.displayName = 'CodeEditorRoot';
```

- [ ] **Step 12: Replace `index.ts` with the public exports**

Replace the whole of `src/components/CodeEditor/index.ts`. T3's type-only block is kept at the bottom, unchanged:
```ts
export { CodeEditorContent, type CodeEditorContentProps } from './CodeEditorContent';
export {
  CodeEditorRoot,
  type CodeEditorRootProps,
  type CodeEditorRootProps as CodeEditorProps,
} from './CodeEditorRoot';
export { useCodeEditor } from './hooks/useCodeEditor';
export { CODE_EDITOR_KEYBOARD_HINT } from './lib/keyboardHint';
export type {
  CodeEditorApi,
  CodeEditorCompletion,
  CodeEditorCompletionContext,
  CodeEditorCompletionSource,
  CodeEditorDiagnostic,
  CodeEditorFolds,
  CodeEditorHttpContext,
  CodeEditorLanguage,
  CodeEditorPosition,
  JsonSchema,
} from './types';
```

- [ ] **Step 13: Run the component tests and check that they pass**

Run: `pnpm vitest run src/components/CodeEditor/CodeEditor.test.tsx src/components/CodeEditor/CodeEditor.loadError.test.tsx`
Expected: PASS (23 + 1 tests). Stderr must have no `not wrapped in act(...)` warnings.

- [ ] **Step 14: Add the engine chunk boundary guard**

Create `src/components/CodeEditor/lib/engineBoundary.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const EDITOR_DIR = join(__dirname, '..');

/** Files in the main chunk: they may reference the engine only through `import type` or `loadEngine`. */
const MAIN_CHUNK_FILES = [
  'index.ts',
  'types.ts',
  'CodeEditorRoot.tsx',
  'CodeEditorContent.tsx',
  'CodeEditorContext.ts',
  'classes.ts',
  'hooks/useCodeEditor.ts',
  'lib/keyboardHint.ts',
  'lib/splitContentProps.ts',
  'lib/portalRegistry.ts',
  'lib/PortalOutlet.tsx',
];

const STATIC_IMPORT = /^import\s+(?!type\b)[^;]*?from\s+'([^']+)'/gm;
const FORBIDDEN = /(^|\/)engine(\/|$)|^@codemirror\/|^@lezer\/|^json-schema-library$/;

describe('engine chunk boundary', () => {
  it.each(MAIN_CHUNK_FILES)('%s has no static runtime import of the engine', file => {
    const source = readFileSync(join(EDITOR_DIR, file), 'utf8');
    const runtimeImports = [...source.matchAll(STATIC_IMPORT)].map(match => match[1] ?? '');

    expect(runtimeImports.filter(specifier => FORBIDDEN.test(specifier))).toEqual([]);
  });

  it('lib/loadEngine.ts reaches the engine only through a dynamic import', () => {
    const source = readFileSync(join(EDITOR_DIR, 'lib/loadEngine.ts'), 'utf8');

    expect([...source.matchAll(STATIC_IMPORT)]).toEqual([]);
    expect(source).toContain("import('../engine')");
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/lib/engineBoundary.test.ts`
Expected: PASS (12 tests). As a sanity check, temporarily add `import { createEditor } from './engine';` to `CodeEditorRoot.tsx`. The test must then fail for that file. Revert the line afterwards.

- [ ] **Step 15: Run the full CodeEditor and CodeSnippet suites, typecheck and lint**

Run:
```bash
pnpm vitest run src/components/CodeEditor src/components/CodeSnippet
pnpm exec tsc --build tsconfig.app.json --noEmit
pnpm exec biome check src/components/CodeEditor
```
Expected:
- vitest: all files pass (the CodeEditor tests plus the unchanged CodeSnippet tests).
- tsc: exits 0.
- biome: 0 errors and 0 warnings. The two `console` calls carry `biome-ignore lint/suspicious/noConsole`. If biome only reports formatting or import order, run `pnpm exec biome check --write src/components/CodeEditor` and re-run.

- [ ] **Step 16: Commit**

```bash
git add src/components/CodeEditor/lib/loadEngine.ts \
  src/components/CodeEditor/lib/loadEngine.test.ts \
  src/components/CodeEditor/lib/keyboardHint.ts \
  src/components/CodeEditor/lib/splitContentProps.ts \
  src/components/CodeEditor/lib/splitContentProps.test.ts \
  src/components/CodeEditor/lib/engineBoundary.test.ts \
  src/components/CodeEditor/classes.ts \
  src/components/CodeEditor/CodeEditorContext.ts \
  src/components/CodeEditor/hooks/useCodeEditor.ts \
  src/components/CodeEditor/CodeEditorContent.tsx \
  src/components/CodeEditor/CodeEditorRoot.tsx \
  src/components/CodeEditor/index.ts \
  src/components/CodeEditor/CodeEditor.test.tsx \
  src/components/CodeEditor/CodeEditor.loadError.test.tsx
git commit -m "$(cat <<'EOF'
feat(code-editor): add CodeEditorRoot and CodeEditorContent React layer

Root owns value/wrap/expand/fullscreen state, provides the CodeSnippet chrome
context and renders through ChromeFrame; Content lazy-loads the engine with a
static fallback, routes data-/aria-/id/title/tabIndex to the typing surface and
hosts the portal outlet. Adds apiRef, useCodeEditor, CODE_EDITOR_KEYBOARD_HINT
and the CodeEditorProps metadata alias.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Stories: parity + core stories

**Files:**
- Create: `src/components/CodeEditor/CodeEditor.stories.tsx`
- Test: `src/components/CodeEditor/CodeEditor.stories.test.tsx` (new, separate from `CodeEditor.test.tsx`; renders every story through `composeStories`. This was checked: `composeStories` from `storybook-react-rsbuild` runs under the repo's Vitest/jsdom setup, tried against `CodeSnippet.stories`, 26/26 passed)

**Interfaces:**
- Consumes:
  - From T9: `CodeEditorRoot` and `CodeEditorContent`, with props `value`, `onChange`, `language`, `documentId`, `size`, `readOnly`, `startingLineNumber`, `lines`, `folds` (array or `(value, { startingLineNumber }) => FoldRegion[]`), `wrapLines`, `defaultWrapLines`, `onWrapLinesChange`, `maxLines`, `data-testid`. `CodeEditorContent` takes `lineNumbers` and `aria-label`.
  - From T3: `CodeEditorLanguage` (`./types`).
  - From T5: the engine test ids `${testId}--editor` (on `.cm-content`) and `${testId}--gutter`.
  - From T8: `${testId}--fold-summary`.
  - Existing, from the `../CodeSnippet` barrel: `CodeSnippetActions`, `CodeSnippetAdapterProvider`, `CodeSnippetCode`, `CodeSnippetContent`, `CodeSnippetCopyButton`, `CodeSnippetFullscreenButton`, `CodeSnippetHeader`, `CodeSnippetLineNumbers`, `CodeSnippetRoot`, `CodeSnippetShowMoreButton`, `CodeSnippetTab`, `CodeSnippetTabs`, `CodeSnippetTitle`, `CodeSnippetWrapButton`, `getHttpFolds`, `loadPrismAdapter`, `loadShikiAdapter`, `type FoldRegion`, `type LineConfig`.
- Produces: no new exports from the package. Storybook title `Data display/CodeEditor/CodeEditor`, so story ids start with `data-display-codeeditor-codeeditor--`.
  - Story exports: `Default`, `WithHeader`, `FloatingActions`, `LineNumbersAndStartingLine`, `LineColorsAndPrefixes`, `Ranges`, `HttpRequestWithPrism`, `HttpResponseWithShiki`, `HttpFolds`, `ShowMore`, `Wrap`, `Sizes`, `ReadOnly`, `Tabs`, `ParityDefault`, `ParityLineColors`, `ParityFoldsCollapsed`, `ParityHttpPrism`.
  - Root `data-testid` values used by T17 are listed in `STORY_ROOTS` in the test below. Parity stories use `parity-<config>-snippet` and `parity-<config>-editor`.
  - **Note for T17 (caret blink):** `drawSelection({ cursorBlinkRate })` is internal to the engine and the stories do not expose it. No story autofocuses, so no caret is drawn until focus. Before any screenshot, E2E must wait for `[data-testid$="--editor"]` and then blur: `await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())`. Any interaction test that focuses the editor must blur before `toHaveScreenshot`.

- [ ] **Step 1: Write the failing story smoke test**

Create `src/components/CodeEditor/CodeEditor.stories.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { composeStories } from 'storybook-react-rsbuild';
import { describe, expect, it, vi } from 'vitest';
import * as stories from './CodeEditor.stories';

// Highlighting is covered by the adapter painter tests (T6). Here the heavy
// adapters are swapped for the plain one, so Shiki's WASM never loads in jsdom.
vi.mock('../CodeSnippet/adapters/shiki', async () => {
  const { plainAdapter } = await import('../CodeSnippet/adapters/plain');
  return { shikiAdapter: plainAdapter };
});
vi.mock('../CodeSnippet/adapters/prism', async () => {
  const { plainAdapter } = await import('../CodeSnippet/adapters/plain');
  return { prismAdapter: plainAdapter };
});

const composed = composeStories(stories);
type StoryName = keyof typeof composed;

interface StoryRoots {
  /** CodeEditorRoot data-testid values rendered by the story */
  editors: readonly string[];
  /** CodeSnippetRoot data-testid values rendered by the story (parity stories) */
  snippets?: readonly string[];
}

const STORY_ROOTS: Record<StoryName, StoryRoots> = {
  Default: { editors: ['code-editor-default'] },
  WithHeader: { editors: ['code-editor-with-header'] },
  FloatingActions: { editors: ['code-editor-floating-actions'] },
  LineNumbersAndStartingLine: { editors: ['code-editor-line-numbers', 'code-editor-starting-line'] },
  LineColorsAndPrefixes: {
    editors: ['code-editor-line-colors', 'code-editor-line-diff', 'code-editor-line-icons'],
  },
  Ranges: { editors: ['code-editor-ranges'] },
  HttpRequestWithPrism: { editors: ['code-editor-http-request'] },
  HttpResponseWithShiki: { editors: ['code-editor-http-response'] },
  HttpFolds: { editors: ['code-editor-http-folds-request', 'code-editor-http-folds-response'] },
  ShowMore: {
    editors: ['code-editor-show-more', 'code-editor-show-more-threshold', 'code-editor-show-more-manual'],
  },
  Wrap: {
    editors: ['code-editor-wrap-off', 'code-editor-wrap-uncontrolled', 'code-editor-wrap-controlled'],
  },
  Sizes: { editors: ['code-editor-size-sm', 'code-editor-size-md', 'code-editor-size-lg'] },
  ReadOnly: { editors: ['code-editor-read-only'] },
  Tabs: { editors: ['code-editor-tabs'] },
  ParityDefault: { editors: ['parity-default-editor'], snippets: ['parity-default-snippet'] },
  ParityLineColors: {
    editors: ['parity-line-colors-editor'],
    snippets: ['parity-line-colors-snippet'],
  },
  ParityFoldsCollapsed: {
    editors: ['parity-folds-collapsed-editor'],
    snippets: ['parity-folds-collapsed-snippet'],
  },
  ParityHttpPrism: { editors: ['parity-http-prism-editor'], snippets: ['parity-http-prism-snippet'] },
};

/** The engine chunk is a dynamic import; the first load in a worker can take a few seconds. */
const ENGINE = { timeout: 5000 };

describe('CodeEditor stories', () => {
  it('lists every exported story in STORY_ROOTS', () => {
    expect(Object.keys(composed).sort()).toEqual(Object.keys(STORY_ROOTS).sort());
  });

  it.each(Object.keys(STORY_ROOTS) as StoryName[])(
    '%s mounts the engine in every editor root',
    async name => {
      const Story = composed[name];
      render(<Story />);
      const roots = STORY_ROOTS[name];

      for (const id of roots.editors) {
        expect(screen.getByTestId(id)).toBeInTheDocument();
        expect(await screen.findByTestId(`${id}--editor`, {}, ENGINE)).toBeInTheDocument();
      }
      for (const id of roots.snippets ?? []) {
        expect(screen.getByTestId(`${id}--code`)).toBeInTheDocument();
      }
    },
  );

  it('Default renders the controlled JSON value', async () => {
    const { Default } = composed;
    render(<Default />);

    const editor = await screen.findByTestId('code-editor-default--editor', {}, ENGINE);
    expect(editor).toHaveTextContent('"name": "@wallarm-org/sdk"');
    expect(editor).not.toHaveAttribute('aria-readonly');
  });

  it('ReadOnly marks the typing surface read-only', async () => {
    const { ReadOnly } = composed;
    render(<ReadOnly />);

    const editor = await screen.findByTestId('code-editor-read-only--editor', {}, ENGINE);
    expect(editor).toHaveAttribute('aria-readonly', 'true');
  });

  it('WithHeader renders the shared chrome buttons', async () => {
    const { WithHeader } = composed;
    render(<WithHeader />);

    await screen.findByTestId('code-editor-with-header--editor', {}, ENGINE);
    expect(screen.getByTestId('code-editor-with-header--title')).toHaveTextContent('rule.json');
    expect(screen.getByTestId('code-editor-with-header--copy-button')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor-with-header--wrap-button')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor-with-header--fullscreen-button')).toBeInTheDocument();
  });

  it('LineNumbersAndStartingLine renders a gutter', async () => {
    const { LineNumbersAndStartingLine } = composed;
    render(<LineNumbersAndStartingLine />);

    await screen.findByTestId('code-editor-starting-line--editor', {}, ENGINE);
    expect(screen.getByTestId('code-editor-starting-line--gutter')).toHaveTextContent('97');
  });

  it('HttpFolds starts with the request headers collapsed', async () => {
    const { HttpFolds } = composed;
    render(<HttpFolds />);

    await screen.findByTestId('code-editor-http-folds-request--editor', {}, ENGINE);
    const summaries = await screen.findAllByTestId(
      'code-editor-http-folds-request--fold-summary',
      {},
      ENGINE,
    );
    expect(summaries.length).toBeGreaterThan(0);
  });

  it('ShowMore auto-renders the show-more button when 5 lines are hidden', async () => {
    const { ShowMore } = composed;
    render(<ShowMore />);

    expect(
      await screen.findByTestId('code-editor-show-more--show-more-button', {}, ENGINE),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId('code-editor-show-more-manual--show-more-button', {}, ENGINE),
    ).toHaveAttribute('data-analytics-id', 'CODE_EDITOR_SHOW_MORE');
  });

  it('Tabs swaps the document when a tab is selected', async () => {
    const { Tabs } = composed;
    render(<Tabs />);

    const editor = await screen.findByTestId('code-editor-tabs--editor', {}, ENGINE);
    expect(editor).toHaveTextContent('POST /api/v2/rules HTTP/1.1');

    await userEvent.click(screen.getByTestId('code-editor-tabs--tab-response'));
    expect(await screen.findByText(/HTTP\/1\.1 201 Created/, {}, ENGINE)).toBeInTheDocument();
    expect(screen.getByTestId('code-editor-tabs--editor')).toHaveTextContent('HTTP/1.1 201 Created');

    await userEvent.click(screen.getByTestId('code-editor-tabs--tab-request'));
    expect(screen.getByTestId('code-editor-tabs--editor')).toHaveTextContent(
      'POST /api/v2/rules HTTP/1.1',
    );
  });

  it('ParityDefault shows the same first line in CodeSnippet and CodeEditor', async () => {
    const { ParityDefault } = composed;
    render(<ParityDefault />);

    const editor = await screen.findByTestId('parity-default-editor--editor', {}, ENGINE);
    const snippet = screen.getByTestId('parity-default-snippet--code');
    expect(snippet).toHaveTextContent('const greeting = "Hello, World!";');
    expect(editor).toHaveTextContent('const greeting = "Hello, World!";');
    expect(editor).toHaveAttribute('aria-readonly', 'true');
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm vitest run src/components/CodeEditor/CodeEditor.stories.test.tsx`
Expected: FAIL. The suite cannot load, with `Failed to resolve import "./CodeEditor.stories"` (or `Cannot find module './CodeEditor.stories'`), and 0 tests run.

- [ ] **Step 3: Create the stories file**

Create `src/components/CodeEditor/CodeEditor.stories.tsx`:

```tsx
import { type ReactNode, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info, Skull, TriangleAlert } from '../../icons';
import {
  CodeSnippetActions,
  CodeSnippetAdapterProvider,
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetCopyButton,
  CodeSnippetFullscreenButton,
  CodeSnippetHeader,
  CodeSnippetLineNumbers,
  CodeSnippetRoot,
  CodeSnippetShowMoreButton,
  CodeSnippetTab,
  CodeSnippetTabs,
  CodeSnippetTitle,
  CodeSnippetWrapButton,
  type FoldRegion,
  getHttpFolds,
  type LineConfig,
  loadPrismAdapter,
  loadShikiAdapter,
} from '../CodeSnippet';
import { VStack } from '../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { CodeEditorContent } from './CodeEditorContent';
import { CodeEditorRoot } from './CodeEditorRoot';
import type { CodeEditorLanguage } from './types';

const DESCRIPTION = [
  'An editable code surface that looks exactly like `CodeSnippet` and reuses its chrome — header, title, tabs, copy, wrap, fullscreen and show more — with undo, find, folds and line colours on CodeMirror 6, loaded lazily on first mount.',
  'Reach for `CodeSnippet` when the code is only read; reach for `CodeEditor` when the value changes. Colours come from the same `CodeSnippetAdapterProvider`, so an editor under Prism looks like a snippet under Prism.',
].join(' ');

const meta = {
  title: 'Data display/CodeEditor/CodeEditor',
  component: CodeEditorRoot,
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29516&m=dev',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeEditorRoot>;

export default meta;

// --- Sample documents ---

const jsonCode = `{
    "name": "@wallarm-org/sdk",
    "version": "1.0.0",
    "dependencies": {
        "react": "^19.0.0",
        "typescript": "^5.0.0"
    }
}`;

const sampleCode = `const greeting = "Hello, World!";
console.log(greeting);

function add(a, b) {
    return a + b;
}

export default add;`;

const colorsCode = `Line 1: Default (no color)
Line 2: Danger color
Line 3: Warning color
Line 4: Info color
Line 5: Success color
Line 6: Brand color
Line 7: AI color
Line 8: Neutral color`;

const diffCode = `const greeting = "Hello";
console.log("old message");
console.log("new message");
console.log("another new line");

export default greeting;`;

const annotatedHeadersCode = `Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
AppleWebKit/537.36
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache`;

const rangesCode = `GET /api/v2/users HTTP/1.1
Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
X-Forwarded-For: 192.168.1.100
Cache-Control: no-cache`;

const httpRequestCode = `POST /api/v2/rules HTTP/1.1
Host: api.wallarm.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Content-Type: application/json
Accept: application/json

{
  "action": "block",
  "point": ["header", "X-Forwarded-For"],
  "enabled": true
}`;

const httpResponseCode = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Request-Id: abc-123-def-456
Cache-Control: no-store

{
    "users": [
        { "id": 1, "name": "Alice" },
        { "id": 2, "name": "Bob" }
    ],
    "total": 42
}`;

const foldableRequestCode = `GET /api/v2/users HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9
X-Request-ID: abc-123
Content-Type: application/json
Cache-Control: no-cache

{
  "filter": {
    "status": "active",
    "role": "admin"
  },
  "pagination": {
    "page": 1,
    "limit": 50
  }
}`;

const foldableResponseCode = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Request-ID: abc-123
X-RateLimit-Remaining: 98
Cache-Control: private, max-age=0

{
  "data": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "admin" }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 50
  }
}`;

const showMoreCode = `Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Referer: https://app.example.com/dashboard
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache
Referer: https://app.example.com/dashboard
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache`;

const showMoreThresholdCode = `Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Referer: https://app.example.com/dashboard
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache
Authorization: Bearer token123
X-Request-ID: abc-def-ghi`;

const longCode = `const veryLongVariableName = "This is a very long string that will demonstrate line wrapping behavior when the content exceeds the container width";
console.log(veryLongVariableName);`;

const bashCode = `npm install @wallarm-org/sdk
npm run build
npm run test`;

const tabDocuments = {
  request: httpRequestCode,
  response: `HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v2/rules/42

{
  "id": 42,
  "action": "block"
}`,
} satisfies Record<string, string>;

type TabId = keyof typeof tabDocuments;

const isTabId = (value: string): value is TabId => value === 'request' || value === 'response';

// --- Shared line configs and fold functions ---

const tooltipPrefix = (icon: ReactNode, text: string): ReactNode => (
  <Tooltip>
    <TooltipTrigger>{icon}</TooltipTrigger>
    <TooltipContent>{text}</TooltipContent>
  </Tooltip>
);

const colorLines: Record<number, LineConfig> = {
  2: { color: 'danger' },
  3: { color: 'warning' },
  4: { color: 'info' },
  5: { color: 'success' },
  6: { color: 'brand' },
  7: { color: 'ai' },
  8: { color: 'neutral' },
};

const diffLines: Record<number, LineConfig> = {
  2: { color: 'danger', prefix: '-' },
  3: { color: 'success', prefix: '+' },
  4: { color: 'success', prefix: '+' },
};

const iconLines: Record<number, LineConfig> = {
  3: { color: 'danger', prefix: tooltipPrefix(<Skull />, 'Malicious user agent') },
  5: { color: 'warning', prefix: tooltipPrefix(<TriangleAlert />, 'Unusual language list') },
  7: { color: 'info', prefix: tooltipPrefix(<Info />, 'Caching disabled') },
};

const rangeLines: Record<number, LineConfig> = {
  4: { color: 'danger', ranges: [{ start: 8, end: 24 }] },
  7: { color: 'info', ranges: [{ start: 17, end: 30 }] },
};

const parityColorLines: Record<number, LineConfig> = {
  ...colorLines,
  1: { prefix: tooltipPrefix(<Info />, 'Untouched line') },
  2: { color: 'danger', prefix: '-' },
  5: { color: 'success', prefix: '+' },
};

/** Module-level so the function identity is stable across renders. */
const foldRequestHeadersCollapsed = (
  value: string,
  { startingLineNumber }: { startingLineNumber: number },
): FoldRegion[] => getHttpFolds(value, { startingLineNumber, headers: { defaultCollapsed: true } });

const foldHttp = (
  value: string,
  { startingLineNumber }: { startingLineNumber: number },
): FoldRegion[] => getHttpFolds(value, { startingLineNumber });

const parityCollapsedFolds = getHttpFolds(foldableRequestCode, {
  headers: { defaultCollapsed: true },
});

// --- Core stories ---

/**
 * A controlled editor: `value` plus `onChange`, like any input. With no adapter in scope the
 * text is plain, exactly as `CodeSnippet` renders it without a provider.
 */
export const Default: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(jsonCode);

  return (
    <div style={{ width: '600px' }}>
      <CodeEditorRoot
        value={value}
        onChange={setValue}
        language='json'
        data-testid='code-editor-default'
      >
        <CodeEditorContent lineNumbers aria-label='Package manifest' />
      </CodeEditorRoot>
    </div>
  );
};

/**
 * The `CodeSnippet` header works unchanged: a title and the copy, wrap and fullscreen buttons.
 * Copy puts the edited value on the clipboard, and fullscreen keeps the undo history.
 */
export const WithHeader: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(jsonCode);

  return (
    <div style={{ width: '600px' }}>
      <CodeEditorRoot
        value={value}
        onChange={setValue}
        language='json'
        data-testid='code-editor-with-header'
      >
        <CodeSnippetHeader>
          <CodeSnippetTitle>rule.json</CodeSnippetTitle>
          <CodeSnippetActions>
            <CodeSnippetCopyButton />
            <CodeSnippetWrapButton />
            <CodeSnippetFullscreenButton />
          </CodeSnippetActions>
        </CodeSnippetHeader>
        <CodeEditorContent lineNumbers aria-label='Rule JSON' />
      </CodeEditorRoot>
    </div>
  );
};

/**
 * Without a header, `CodeSnippetActions` as a direct child floats over the top-right of the
 * editor, as it does over a snippet.
 */
export const FloatingActions: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(sampleCode);

  return (
    <div style={{ width: '320px' }}>
      <CodeEditorRoot
        value={value}
        onChange={setValue}
        language='text'
        data-testid='code-editor-floating-actions'
      >
        <CodeSnippetActions>
          <CodeSnippetWrapButton />
          <CodeSnippetCopyButton />
        </CodeSnippetActions>
        <CodeEditorContent lineNumbers aria-label='Sample code' />
      </CodeEditorRoot>
    </div>
  );
};

/**
 * `lineNumbers` on `CodeEditorContent` is the equivalent of `CodeSnippetLineNumbers`, and
 * `startingLineNumber` renumbers the gutter for a fragment taken from a longer file.
 */
export const LineNumbersAndStartingLine: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>lineNumbers</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={sampleCode}
          language='text'
          data-testid='code-editor-line-numbers'
        >
          <CodeEditorContent lineNumbers aria-label='Sample code' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>startingLineNumber = 97</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={sampleCode}
          language='text'
          startingLineNumber={97}
          data-testid='code-editor-starting-line'
        >
          <CodeEditorContent lineNumbers aria-label='Sample code from line 97' />
        </CodeEditorRoot>
      </div>
    </VStack>
  </VStack>
);

/**
 * `lines` uses the same `LineConfig` as CodeSnippet: seven semantic colours, text prefixes for a
 * hand-made diff, and ReactNode prefixes such as a tooltipped icon. Lines are static and tied
 * to line numbers, so they stay on their number while you type.
 */
export const LineColorsAndPrefixes: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>colours</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={colorsCode}
          language='text'
          lines={colorLines}
          data-testid='code-editor-line-colors'
        >
          <CodeEditorContent lineNumbers aria-label='Line colours' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>text prefixes</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={diffCode}
          language='text'
          lines={diffLines}
          data-testid='code-editor-line-diff'
        >
          <CodeEditorContent lineNumbers aria-label='Diff prefixes' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>ReactNode prefixes with tooltips</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={annotatedHeadersCode}
          language='text'
          lines={iconLines}
          data-testid='code-editor-line-icons'
        >
          <CodeEditorContent lineNumbers aria-label='Annotated headers' />
        </CodeEditorRoot>
      </div>
    </VStack>
  </VStack>
);

/**
 * `ranges` colours character offsets inside a line (start inclusive, end exclusive). The line
 * keeps its background, and only the range gets the colour.
 */
export const Ranges: StoryFn<typeof meta> = () => (
  <div style={{ width: '600px' }}>
    <CodeEditorRoot
      defaultValue={rangesCode}
      language='text'
      lines={rangeLines}
      data-testid='code-editor-ranges'
    >
      <CodeEditorContent lineNumbers aria-label='Request with ranges' />
    </CodeEditorRoot>
  </div>
);

/**
 * `language='http'` under Prism. The colours come from the adapter and the structure (start
 * line, headers, JSON body) comes from the editor's own HTTP grammar.
 */
export const HttpRequestWithPrism: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(httpRequestCode);

  return (
    <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          value={value}
          onChange={setValue}
          language='http'
          data-testid='code-editor-http-request'
        >
          <CodeEditorContent lineNumbers aria-label='HTTP request' />
        </CodeEditorRoot>
      </div>
    </CodeSnippetAdapterProvider>
  );
};

/**
 * The response side under Shiki. After an edit, highlighting is repainted in the background,
 * so for a moment you may see the previous colours mapped through your change.
 */
export const HttpResponseWithShiki: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(httpResponseCode);

  return (
    <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          value={value}
          onChange={setValue}
          language='http'
          data-testid='code-editor-http-response'
        >
          <CodeEditorContent lineNumbers aria-label='HTTP response' />
        </CodeEditorRoot>
      </div>
    </CodeSnippetAdapterProvider>
  );
};

/**
 * `folds` as a function of the value: `getHttpFolds` runs again after edits, so adding a header
 * grows the headers fold. Collapsed state is kept by fold `id`. The second editor starts at
 * line 100, and the fold function gets the same offset.
 */
export const HttpFolds: StoryFn<typeof meta> = () => {
  const [request, setRequest] = useState(foldableRequestCode);
  const [response, setResponse] = useState(foldableResponseCode);

  return (
    <VStack gap={16}>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>headers collapsed by default</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            value={request}
            onChange={setRequest}
            language='http'
            folds={foldRequestHeadersCollapsed}
            data-testid='code-editor-http-folds-request'
          >
            <CodeEditorContent lineNumbers aria-label='Foldable HTTP request' />
          </CodeEditorRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>startingLineNumber = 100</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            value={response}
            onChange={setResponse}
            language='http'
            startingLineNumber={100}
            folds={foldHttp}
            data-testid='code-editor-http-folds-response'
          >
            <CodeEditorContent lineNumbers aria-label='Foldable HTTP response' />
          </CodeEditorRoot>
        </div>
      </VStack>
    </VStack>
  );
};

/**
 * `maxLines` limits the height, and the editor scrolls inside it (no rows are removed). The
 * button appears on its own when at least three lines are hidden. Render
 * `CodeSnippetShowMoreButton` yourself only to pass props to the real button.
 */
export const ShowMore: StoryFn<typeof meta> = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '500px' }}>
    <div>
      <p className='sb-annotation mb-8'>12 lines, clamped at 7 — 5 hidden</p>
      <CodeEditorRoot
        defaultValue={showMoreCode}
        language='text'
        maxLines={7}
        data-testid='code-editor-show-more'
      >
        <CodeEditorContent aria-label='Request headers' />
      </CodeEditorRoot>
    </div>
    <div>
      <p className='sb-annotation mb-8'>9 lines, clamped at 7 — 2 hidden, no button</p>
      <CodeEditorRoot
        defaultValue={showMoreThresholdCode}
        language='text'
        maxLines={7}
        data-testid='code-editor-show-more-threshold'
      >
        <CodeEditorContent aria-label='Request headers' />
      </CodeEditorRoot>
    </div>
    <div>
      <p className='sb-annotation mb-8'>the button rendered by hand</p>
      <CodeEditorRoot
        defaultValue={showMoreCode}
        language='text'
        maxLines={7}
        data-testid='code-editor-show-more-manual'
      >
        <CodeEditorContent aria-label='Request headers' />
        <CodeSnippetShowMoreButton data-analytics-id='CODE_EDITOR_SHOW_MORE' />
      </CodeEditorRoot>
    </div>
  </div>
);

/**
 * Wrapping can be uncontrolled (`defaultWrapLines`, driven by the wrap button) or controlled
 * (`wrapLines` plus `onWrapLinesChange`). Colour sticks and prefixes stay on the first visual row.
 */
export const Wrap: StoryFn<typeof meta> = () => {
  const [wrap, setWrap] = useState(true);

  return (
    <VStack gap={16}>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>no wrapping</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            defaultValue={longCode}
            language='text'
            lines={{ 1: { color: 'danger', prefix: '-' }, 2: { color: 'success', prefix: '+' } }}
            data-testid='code-editor-wrap-off'
          >
            <CodeEditorContent lineNumbers aria-label='Long lines' />
          </CodeEditorRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>defaultWrapLines + wrap button</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            defaultValue={longCode}
            language='text'
            defaultWrapLines
            lines={{ 1: { color: 'danger', prefix: '-' }, 2: { color: 'success', prefix: '+' } }}
            data-testid='code-editor-wrap-uncontrolled'
          >
            <CodeSnippetActions>
              <CodeSnippetWrapButton />
            </CodeSnippetActions>
            <CodeEditorContent lineNumbers aria-label='Long lines, wrapped' />
          </CodeEditorRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='sb-annotation'>controlled — wrapLines = {String(wrap)}</span>
        <div style={{ width: '600px' }}>
          <CodeEditorRoot
            defaultValue={longCode}
            language='text'
            wrapLines={wrap}
            onWrapLinesChange={setWrap}
            data-testid='code-editor-wrap-controlled'
          >
            <CodeSnippetActions>
              <CodeSnippetWrapButton />
            </CodeSnippetActions>
            <CodeEditorContent lineNumbers aria-label='Long lines, controlled wrap' />
          </CodeEditorRoot>
        </div>
      </VStack>
    </VStack>
  );
};

/**
 * The same three sizes as CodeSnippet: `sm` (12px, default), `md` (14px) and `lg` (16px), each
 * on 20px rows.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>sm (default)</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={bashCode}
          language='bash'
          size='sm'
          data-testid='code-editor-size-sm'
        >
          <CodeEditorContent lineNumbers aria-label='Install commands, small' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>md</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={bashCode}
          language='bash'
          size='md'
          data-testid='code-editor-size-md'
        >
          <CodeEditorContent lineNumbers aria-label='Install commands, medium' />
        </CodeEditorRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>lg</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          defaultValue={bashCode}
          language='bash'
          size='lg'
          data-testid='code-editor-size-lg'
        >
          <CodeEditorContent lineNumbers aria-label='Install commands, large' />
        </CodeEditorRoot>
      </div>
    </VStack>
  </VStack>
);

/**
 * `readOnly` still lets you focus, select, search and copy, but not type. Use it when the value
 * can change elsewhere but not here. If it never changes, use `CodeSnippet`.
 */
export const ReadOnly: StoryFn<typeof meta> = () => (
  <div style={{ width: '600px' }}>
    <CodeEditorRoot
      value={httpResponseCode}
      language='http'
      readOnly
      data-testid='code-editor-read-only'
    >
      <CodeSnippetHeader>
        <CodeSnippetTitle>Response</CodeSnippetTitle>
        <CodeSnippetActions>
          <CodeSnippetCopyButton />
        </CodeSnippetActions>
      </CodeSnippetHeader>
      <CodeEditorContent lineNumbers aria-label='HTTP response, read only' />
    </CodeEditorRoot>
  </div>
);

/**
 * Tabs swap `value`, and `documentId` swaps the editor's whole state with it, so each tab keeps
 * its own undo history, selection and collapsed folds.
 */
export const Tabs: StoryFn<typeof meta> = () => {
  const [tab, setTab] = useState<TabId>('request');
  const [docs, setDocs] = useState<Record<TabId, string>>(tabDocuments);

  return (
    <div style={{ width: '600px' }}>
      <CodeEditorRoot
        documentId={tab}
        value={docs[tab]}
        onChange={value => setDocs(prev => ({ ...prev, [tab]: value }))}
        language='http'
        data-testid='code-editor-tabs'
      >
        <CodeSnippetHeader>
          <CodeSnippetTabs
            value={tab}
            onValueChange={value => {
              if (isTabId(value)) setTab(value);
            }}
          >
            <CodeSnippetTab value='request' data-testid='code-editor-tabs--tab-request'>
              Request
            </CodeSnippetTab>
            <CodeSnippetTab value='response' data-testid='code-editor-tabs--tab-response'>
              Response
            </CodeSnippetTab>
          </CodeSnippetTabs>
          <CodeSnippetActions>
            <CodeSnippetCopyButton />
          </CodeSnippetActions>
        </CodeSnippetHeader>
        <CodeEditorContent lineNumbers aria-label='HTTP message' />
      </CodeEditorRoot>
    </div>
  );
};

// --- Parity stories: CodeSnippet above, read-only CodeEditor below, identical props ---

interface ParityPairProps {
  testId: string;
  code: string;
  language: CodeEditorLanguage;
  lines?: Record<number, LineConfig>;
  folds?: FoldRegion[];
}

const ParityPair = ({ testId, code, language, lines, folds }: ParityPairProps) => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>CodeSnippet</span>
      <div style={{ width: '600px' }}>
        <CodeSnippetRoot
          code={code}
          language={language}
          lines={lines}
          folds={folds}
          data-testid={`${testId}-snippet`}
        >
          <CodeSnippetContent>
            <CodeSnippetLineNumbers />
            <CodeSnippetCode />
          </CodeSnippetContent>
        </CodeSnippetRoot>
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>CodeEditor (readOnly)</span>
      <div style={{ width: '600px' }}>
        <CodeEditorRoot
          value={code}
          language={language}
          lines={lines}
          folds={folds}
          readOnly
          data-testid={`${testId}-editor`}
        >
          <CodeEditorContent lineNumbers aria-label='Parity editor' />
        </CodeEditorRoot>
      </div>
    </VStack>
  </VStack>
);

/**
 * Parity check: the same code and props in CodeSnippet and in a read-only CodeEditor should look
 * identical. Accepted differences: a native thin scrollbar, and CodeMirror's caret and selection
 * layer (shown only while focused).
 */
export const ParityDefault: StoryFn<typeof meta> = () => (
  <ParityPair testId='parity-default' code={sampleCode} language='text' />
);

/**
 * Parity check with line colours, text prefixes and a tooltipped icon prefix: same stick, same
 * tint, same prefix column.
 */
export const ParityLineColors: StoryFn<typeof meta> = () => (
  <ParityPair
    testId='parity-line-colors'
    code={colorsCode}
    language='text'
    lines={parityColorLines}
  />
);

/**
 * Parity check with the headers fold collapsed: same chevrons and the same summary row in place
 * of the hidden lines.
 */
export const ParityFoldsCollapsed: StoryFn<typeof meta> = () => (
  <ParityPair
    testId='parity-folds-collapsed'
    code={foldableRequestCode}
    language='text'
    folds={parityCollapsedFolds}
  />
);

/**
 * Parity check for an HTTP request with a JSON body, both under the same Prism provider: token
 * colours come from the same adapter.
 */
export const ParityHttpPrism: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
    <ParityPair testId='parity-http-prism' code={httpRequestCode} language='http' />
  </CodeSnippetAdapterProvider>
);
```

- [ ] **Step 4: Run the story smoke test and confirm it passes**

Run: `pnpm vitest run src/components/CodeEditor/CodeEditor.stories.test.tsx`
Expected: PASS. That is 1 + 18 (it.each) + 8 named tests = 27 tests.
- If `lists every exported story` fails, a story export and `STORY_ROOTS` are out of sync: fix the map, not the assertion.
- If a `--editor` lookup times out, the engine did not mount in jsdom. Check that the T3 Range stubs are in `vitest.setup.ts`.

- [ ] **Step 5: Typecheck the stories and lint**

Run: `pnpm exec tsc -p tsconfig.storybook.json --noEmit 2>&1 | grep -E 'src/components/(CodeEditor|CodeSnippet)/'`
Expected: no output. The command as a whole still reports existing, unrelated errors in `Toast.stories.tsx`, `Icons.stories.tsx` and `Pixel.stories.tsx`, which is why the output is filtered.

Run: `pnpm exec tsc --build tsconfig.app.json --noEmit`
Expected: exit 0. Stories and tests are excluded from this config, so this only confirms nothing else broke.

Run: `pnpm exec biome check --write src/components/CodeEditor/CodeEditor.stories.tsx src/components/CodeEditor/CodeEditor.stories.test.tsx && pnpm exec biome check src/components/CodeEditor/CodeEditor.stories.tsx src/components/CodeEditor/CodeEditor.stories.test.tsx`
Expected: `Checked 2 files` with no errors. `--write` only sorts imports and formats.

- [ ] **Step 6: Verify the Storybook build (no screenshots locally)**

Run: `pnpm build-storybook --test --quiet --output-dir "$TMPDIR/code-editor-storybook"`
Expected: exit code 0 and no `ERR`/`Module not found` lines. The script is `storybook build`; `--test` skips the docs and addon work that is not needed here. Output goes to `$TMPDIR`, so nothing lands in the repo.

Optional manual check (no screenshots):
- Run `pnpm storybook`.
- Open `http://localhost:6006/?path=/story/data-display-codeeditor-codeeditor--parity-default` and `--tabs`.
- Confirm that both parity blocks line up, and that each tab keeps its own undo history (type, switch tabs, switch back, Ctrl/Cmd-Z).
- Do not run `e2e:docker`; baselines are made in CI in T17.

- [ ] **Step 7: Make sure the existing CodeSnippet tests still pass**

Run: `pnpm vitest run src/components/CodeSnippet src/components/CodeEditor`
Expected: PASS. This covers `CodeSnippet.test.tsx`, `CodeSnippet.nesting.test.tsx`, `adapters/adapters.test.ts`, `lib/*.test.ts` and all CodeEditor tests.

- [ ] **Step 8: Commit**

```bash
git add src/components/CodeEditor/CodeEditor.stories.tsx src/components/CodeEditor/CodeEditor.stories.test.tsx
git commit -m "docs(code-editor): add CodeEditor stories with CodeSnippet parity stories

Core stories (controlled JSON, header and floating chrome, line numbers,
line colours and prefixes, ranges, HTTP under Prism and Shiki, HTTP fold
function, show more, wrap, sizes, read-only, tabs with documentId) and
parity stories that stack CodeSnippetRoot over a read-only CodeEditorRoot
with identical props. A composeStories smoke test mounts the engine in
every story root.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Search panel

**Files:**
- Create: `src/components/CodeEditor/engine/searchMatches.ts`
- Create: `src/components/CodeEditor/engine/SearchPanel.tsx`
- Create: `src/components/CodeEditor/engine/search.ts`
- Modify: `src/components/CodeEditor/engine/index.ts` (T5): move the `searchConfigured` facet into `search.ts` and fill the `search` feature slot
- Test: `src/components/CodeEditor/engine/searchMatches.test.ts`
- Test: `src/components/CodeEditor/engine/search.test.tsx`
- Test: `src/components/CodeEditor/engine/search.engine.test.tsx`

**Interfaces:**
- Consumes:
  - `PortalRegistry` from `lib/portalRegistry.ts` (T3): `register`, `update`, `unregister`, `getSnapshot`.
  - `PortalOutlet` from `lib/PortalOutlet.tsx` (T3). Tests only.
  - `createEditor`, `EngineOptions`, `EditorHandle`, and the `featureExtensions` / `SLOT_DEPS` slots in `engine/index.ts` (T5). T5 already sets `SLOT_DEPS.search = ['readOnly', 'testId']`, and `api.openSearch` already calls `openSearchPanel` behind the `searchConfigured` facet.
  - `engineOptions()` from `src/testUtils/codeEditorEngine.ts` (T5). Tests only.
  - DS `Input` (`size='small'`, `error`), `ToggleButton` (`active`, `onToggle(active, event)`; it does not set `aria-pressed` itself, so we pass it), `Button` (`variant='ghost' color='neutral' size='small'`), and the icons `ChevronUp`, `ChevronDown`, `X`. The repo has no case, regexp or whole-word icons, so those toggles use the text labels `Aa`, `W` and `.*` with an `aria-label`.
  - `@codemirror/search` 6.7.2: `search`, `searchKeymap`, `getSearchQuery`, `setSearchQuery`, `SearchQuery`, `findNext`, `findPrevious`, `replaceNext`, `replaceAll`, `closeSearchPanel`. `@codemirror/view`: `runScopeHandlers`, `EditorView.announce`, `Panel`.
- Produces:
  - `export const searchExtension: (config: { portals: PortalRegistry; readOnly: boolean; testId: string | undefined }) => Extension;` (authoritative signature)
  - `export const searchConfigured: Facet<boolean, boolean>;` This moves here from `engine/index.ts`, which re-exports it so the old import path still works. Internal.
  - `export const SearchPanel: FC<SearchPanelProps>;` with `interface SearchPanelProps { view: EditorView; query: SearchQuery; matchCount: number | null; readOnly: boolean; testId: string | undefined }`. Internal.
  - `export const MATCH_COUNT_LIMIT = 1000;`, `export const countMatches: (state: EditorState, query: SearchQuery) => number;`, `export const matchCountMessage: (count: number) => string;` Internal, in `engine/searchMatches.ts`.
  - DOM test ids, all derived from the `testId` base and absent when `testId` is `undefined`:
    - `--search` (panel root)
    - `--search-input`, `--search-count`
    - `--search-case`, `--search-whole-word`, `--search-regexp`
    - `--search-previous`, `--search-next`, `--search-close`
    - `--replace-input`, `--replace-next`, `--replace-all`

**Design notes (for the implementer):**
- CodeMirror keeps an open panel across compartment reconfigures, because the panel constructor stays the same. So the panel reads `{ portals, readOnly, testId }` from a private facet in state rather than from its closure. When `readOnly` or `testId` changes, the open panel re-renders in place.
- The panel is controlled by `getSearchQuery(state)`. Typing dispatches `setSearchQuery`, then `panel.update` calls `portals.update`. `useSyncExternalStore` re-renders in the same discrete event, so the controlled `<input>` keeps its caret. The test with `userEvent.type` proves this.
- The find field has `main-field="true"`. CodeMirror's `openSearchPanel` then refocuses and selects it when the panel is already open. On first open, a stable callback ref focuses it. There is no `useEffect` and no `autoFocus`, since biome's a11y rule forbids `autoFocus`.
- Escape goes through `runScopeHandlers(view, e, 'search-panel')`, which runs `searchKeymap`'s `closeSearchPanel` (as CodeMirror's own panel does), and then `preventDefault()`. ChromeFrame (T2) ignores Escape events that are default-prevented, so fullscreen stays open.
- `searchMatches.ts` is a separate module so that `search.ts` and `SearchPanel.tsx` do not import each other. Likewise, moving `searchConfigured` into `search.ts` removes an `index.ts` ↔ `search.ts` cycle.

---

- [ ] **Step 1: Write failing tests for match counting**

Create `src/components/CodeEditor/engine/searchMatches.test.ts`:

```ts
import { SearchQuery } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { countMatches, MATCH_COUNT_LIMIT, matchCountMessage } from './searchMatches';

describe('countMatches', () => {
  const state = EditorState.create({ doc: 'foo bar foo\nFOO food' });

  it('counts case-insensitive matches by default', () => {
    expect(countMatches(state, new SearchQuery({ search: 'foo' }))).toBe(4);
  });

  it('respects caseSensitive and wholeWord', () => {
    expect(countMatches(state, new SearchQuery({ search: 'foo', caseSensitive: true }))).toBe(3);
    expect(countMatches(state, new SearchQuery({ search: 'foo', wholeWord: true }))).toBe(3);
  });

  it('returns 0 for an empty or invalid query', () => {
    expect(countMatches(state, new SearchQuery({ search: '' }))).toBe(0);
    expect(countMatches(state, new SearchQuery({ search: '(', regexp: true }))).toBe(0);
  });

  it('stops counting after the limit', () => {
    const big = EditorState.create({ doc: 'a'.repeat(MATCH_COUNT_LIMIT + 50) });
    expect(countMatches(big, new SearchQuery({ search: 'a' }))).toBe(MATCH_COUNT_LIMIT + 1);
  });
});

describe('matchCountMessage', () => {
  it('formats counts for screen readers', () => {
    expect(matchCountMessage(0)).toBe('No matches');
    expect(matchCountMessage(1)).toBe('1 match');
    expect(matchCountMessage(3)).toBe('3 matches');
    expect(matchCountMessage(MATCH_COUNT_LIMIT + 1)).toBe('1000+ matches');
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `pnpm vitest run src/components/CodeEditor/engine/searchMatches.test.ts`
Expected: FAIL with `Failed to resolve import "./searchMatches"`.

- [ ] **Step 3: Implement `searchMatches.ts`**

Create `src/components/CodeEditor/engine/searchMatches.ts`:

```ts
import type { SearchQuery } from '@codemirror/search';
import type { EditorState } from '@codemirror/state';

/** Match counting stops here; the panel then shows `1000+ matches`. */
export const MATCH_COUNT_LIMIT = 1000;

/** Number of matches of `query` in the document, capped at `MATCH_COUNT_LIMIT + 1`. */
export const countMatches = (state: EditorState, query: SearchQuery): number => {
  if (!query.valid) return 0;
  const cursor = query.getCursor(state);
  let count = 0;
  while (count <= MATCH_COUNT_LIMIT && !cursor.next().done) count++;
  return count;
};

/** Screen-reader and visible text for a match count. */
export const matchCountMessage = (count: number): string => {
  if (count === 0) return 'No matches';
  if (count === 1) return '1 match';
  if (count > MATCH_COUNT_LIMIT) return `${MATCH_COUNT_LIMIT}+ matches`;
  return `${count} matches`;
};
```

Run: `pnpm vitest run src/components/CodeEditor/engine/searchMatches.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 4: Write failing tests for the search panel**

Create `src/components/CodeEditor/engine/search.test.tsx`. This is an engine unit test on a real `EditorView`. It selects by `data-testid`/role and reads `.cm-announced` only for the announce check.

```tsx
import { closeSearchPanel, openSearchPanel, searchPanelOpen } from '@codemirror/search';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { PortalOutlet } from '../lib/PortalOutlet';
import { createPortalRegistry } from '../lib/portalRegistry';
import { searchExtension } from './search';

const views: EditorView[] = [];

interface SetupOptions {
  doc?: string;
  readOnly?: boolean;
  /** Defaults to 'editor'; pass `undefined` explicitly for "no test id". */
  testId?: string | undefined;
}

const setup = (options: SetupOptions = {}) => {
  const { doc = 'foo bar foo\nbaz foo', readOnly = false } = options;
  const testId = 'testId' in options ? options.testId : 'editor';
  const portals = createPortalRegistry();
  const { container } = render(<PortalOutlet registry={portals} />);
  const searchSlot = new Compartment();
  const readOnlySlot = new Compartment();
  let view: EditorView | undefined;
  act(() => {
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [
          readOnlySlot.of(EditorState.readOnly.of(readOnly)),
          searchSlot.of(searchExtension({ portals, readOnly, testId })),
        ],
      }),
      parent: container,
    });
  });
  if (!view) throw new Error('view not created');
  const created = view;
  views.push(created);
  const open = () =>
    act(() => {
      openSearchPanel(created);
    });
  const setReadOnly = (next: boolean) =>
    act(() =>
      created.dispatch({
        effects: [
          readOnlySlot.reconfigure(EditorState.readOnly.of(next)),
          searchSlot.reconfigure(searchExtension({ portals, readOnly: next, testId })),
        ],
      }),
    );
  return { view: created, portals, open, setReadOnly };
};

afterEach(() => {
  for (const view of views.splice(0)) act(() => view.destroy());
});

describe('searchExtension — panel', () => {
  it('renders the DS panel with derived test ids when opened and focuses the find input', () => {
    const { open } = setup();
    expect(screen.queryByTestId('editor--search')).not.toBeInTheDocument();

    open();

    expect(screen.getByTestId('editor--search')).toHaveAttribute('role', 'search');
    const input = screen.getByTestId('editor--search-input');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('main-field', 'true');
    for (const slot of [
      'search-previous',
      'search-next',
      'search-case',
      'search-whole-word',
      'search-regexp',
      'search-close',
      'replace-input',
      'replace-next',
      'replace-all',
    ]) {
      expect(screen.getByTestId(`editor--${slot}`)).toBeInTheDocument();
    }
  });

  it('removes the panel from the portal registry when closed', () => {
    const { view, portals, open } = setup();
    open();
    expect(portals.getSnapshot()).toHaveLength(1);

    act(() => {
      closeSearchPanel(view);
    });

    expect(portals.getSnapshot()).toHaveLength(0);
    expect(screen.queryByTestId('editor--search')).not.toBeInTheDocument();
  });

  it('typing a query and pressing Enter selects the next match; Shift-Enter goes back', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();

    await user.type(screen.getByTestId('editor--search-input'), 'foo');
    expect(screen.getByTestId('editor--search-input')).toHaveValue('foo');
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('3 matches');

    await user.keyboard('{Enter}');
    expect(view.state.selection.main).toMatchObject({ from: 0, to: 3 });

    await user.keyboard('{Enter}');
    expect(view.state.selection.main).toMatchObject({ from: 8, to: 11 });

    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(view.state.selection.main).toMatchObject({ from: 0, to: 3 });
  });

  it('the next / previous buttons move between matches', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();
    await user.type(screen.getByTestId('editor--search-input'), 'foo');

    await user.click(screen.getByTestId('editor--search-next'));
    await user.click(screen.getByTestId('editor--search-next'));
    expect(view.state.selection.main).toMatchObject({ from: 8, to: 11 });

    await user.click(screen.getByTestId('editor--search-previous'));
    expect(view.state.selection.main).toMatchObject({ from: 0, to: 3 });
  });

  it('toggles set the query flags and expose aria-pressed', async () => {
    const user = userEvent.setup();
    const { open } = setup({ doc: 'Foo foo food' });
    open();
    await user.type(screen.getByTestId('editor--search-input'), 'foo');
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('3 matches');

    await user.click(screen.getByTestId('editor--search-case'));
    expect(screen.getByTestId('editor--search-case')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('2 matches');

    await user.click(screen.getByTestId('editor--search-whole-word'));
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('1 match');
  });

  it('replace all replaces every match', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();
    await user.type(screen.getByTestId('editor--search-input'), 'foo');
    await user.type(screen.getByTestId('editor--replace-input'), 'qux');

    await user.click(screen.getByTestId('editor--replace-all'));

    expect(view.state.doc.toString()).toBe('qux bar qux\nbaz qux');
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('No matches');
  });

  it('replace replaces the selected match and moves to the next one', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();
    await user.type(screen.getByTestId('editor--search-input'), 'foo');
    await user.type(screen.getByTestId('editor--replace-input'), 'qux');
    await user.click(screen.getByTestId('editor--search-next'));

    await user.click(screen.getByTestId('editor--replace-next'));

    expect(view.state.doc.toString()).toBe('qux bar foo\nbaz foo');
    expect(view.state.selection.main).toMatchObject({ from: 8, to: 11 });
  });

  it('hides the replace row when readOnly, and shows it again when readOnly turns off', () => {
    const { open, setReadOnly } = setup({ readOnly: true });
    open();
    expect(screen.getByTestId('editor--search-input')).toBeInTheDocument();
    expect(screen.queryByTestId('editor--replace-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('editor--replace-all')).not.toBeInTheDocument();

    setReadOnly(false);

    expect(screen.getByTestId('editor--replace-input')).toBeInTheDocument();
  });

  it('Escape closes the panel and is default-prevented (an enclosing fullscreen stays open)', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();
    const seen: boolean[] = [];
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') seen.push(event.defaultPrevented);
    };
    document.addEventListener('keydown', onKeyDown);

    try {
      await user.keyboard('{Escape}');
    } finally {
      document.removeEventListener('keydown', onKeyDown);
    }

    expect(seen).toEqual([true]);
    expect(searchPanelOpen(view.state)).toBe(false);
    expect(screen.queryByTestId('editor--search')).not.toBeInTheDocument();
    expect(view.hasFocus).toBe(true);
  });

  it('the close button closes the panel', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();

    await user.click(screen.getByTestId('editor--search-close'));

    expect(searchPanelOpen(view.state)).toBe(false);
  });

  it('announces the match count to screen readers while typing', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();

    await user.type(screen.getByTestId('editor--search-input'), 'foo');

    expect(view.dom.querySelector('.cm-announced')).toHaveTextContent('3 matches');
  });

  it('keeps the DOM free of test ids when no testId is given', () => {
    const { open } = setup({ testId: undefined });
    open();
    const panel = screen.getByRole('search', { name: 'Find and replace' });
    expect(panel).not.toHaveAttribute('data-testid');
    expect(panel.querySelector('[data-testid]')).toBeNull();
  });
});
```

- [ ] **Step 5: Run the tests and confirm they fail**

Run: `pnpm vitest run src/components/CodeEditor/engine/search.test.tsx`
Expected: FAIL with `Failed to resolve import "./search"`.

- [ ] **Step 6: Implement `SearchPanel.tsx`**

Create `src/components/CodeEditor/engine/SearchPanel.tsx`:

```tsx
import { type ChangeEvent, type FC, type KeyboardEvent, useCallback } from 'react';
import {
  closeSearchPanel,
  findNext,
  findPrevious,
  replaceAll,
  replaceNext,
  SearchQuery,
  setSearchQuery,
} from '@codemirror/search';
import { EditorView, runScopeHandlers } from '@codemirror/view';
import { ChevronDown } from '../../../icons/ChevronDown';
import { ChevronUp } from '../../../icons/ChevronUp';
import { X } from '../../../icons/X';
import { cn } from '../../../utils/cn';
import { Button } from '../../Button';
import { Input } from '../../Input';
import { ToggleButton } from '../../ToggleButton';
import { countMatches, matchCountMessage } from './searchMatches';

export interface SearchPanelProps {
  view: EditorView;
  query: SearchQuery;
  /** `null` while the query is empty or an invalid regular expression. */
  matchCount: number | null;
  readOnly: boolean;
  testId: string | undefined;
}

type QueryPatch = Partial<
  Pick<SearchQuery, 'search' | 'replace' | 'caseSensitive' | 'regexp' | 'wholeWord'>
>;

const rowClassName = 'flex h-32 items-center gap-4 px-6';

/** Internal: rendered by `searchExtension` into CodeMirror's top panel through the portal registry. */
export const SearchPanel: FC<SearchPanelProps> = ({
  view,
  query,
  matchCount,
  readOnly,
  testId,
}) => {
  const slot = (name: string) => (testId ? `${testId}--${name}` : undefined);

  /** Focus + select the find field once, when the panel mounts. */
  const focusOnMount = useCallback((input: HTMLInputElement | null) => {
    input?.focus();
    input?.select();
  }, []);

  const updateQuery = (patch: QueryPatch) => {
    const next = new SearchQuery({
      search: query.search,
      replace: query.replace,
      caseSensitive: query.caseSensitive,
      regexp: query.regexp,
      wholeWord: query.wholeWord,
      literal: query.literal,
      ...patch,
    });
    if (next.eq(query)) return;
    const effects = [setSearchQuery.of(next)];
    const announce =
      next.search === ''
        ? []
        : [EditorView.announce.of(matchCountMessage(countMatches(view.state, next)))];
    view.dispatch({ effects: [...effects, ...announce] });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, onEnter: (shift: boolean) => void) => {
    // Escape / Mod-F / F3 / Mod-G from `searchKeymap` (scope `search-panel`).
    // preventDefault marks Escape as handled, so an enclosing fullscreen stays open.
    if (runScopeHandlers(view, event.nativeEvent, 'search-panel')) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      onEnter(event.shiftKey);
    }
  };

  const handleFindKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    handleKeyDown(event, shift => (shift ? findPrevious : findNext)(view));

  const handleReplaceKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    handleKeyDown(event, () => replaceNext(view));

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Inputs handle their own keys; this covers the buttons.
    if (event.target instanceof HTMLInputElement) return;
    if (runScopeHandlers(view, event.nativeEvent, 'search-panel')) event.preventDefault();
  };

  const canSearch = query.valid;

  return (
    <div
      role='search'
      aria-label='Find and replace'
      data-slot='code-editor-search'
      data-testid={slot('search')}
      className='flex flex-col border-b border-border-primary-light code-snippet-bg font-sans'
      onKeyDown={handlePanelKeyDown}
    >
      <div className={rowClassName}>
        <Input
          ref={focusOnMount}
          size='small'
          className='w-240'
          placeholder='Find'
          aria-label='Find'
          main-field='true'
          value={query.search}
          error={query.search !== '' && !canSearch}
          data-testid={slot('search-input')}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateQuery({ search: event.target.value })
          }
          onKeyDown={handleFindKeyDown}
        />
        <span
          aria-hidden='true'
          className={cn(
            'min-w-72 text-xs text-text-secondary whitespace-nowrap',
            !canSearch && 'invisible',
          )}
          data-testid={slot('search-count')}
        >
          {matchCount === null ? '' : matchCountMessage(matchCount)}
        </span>
        <ToggleButton
          variant='ghost'
          color='neutral'
          size='small'
          active={query.caseSensitive}
          aria-pressed={query.caseSensitive}
          aria-label='Match case'
          data-testid={slot('search-case')}
          onToggle={active => updateQuery({ caseSensitive: active })}
        >
          Aa
        </ToggleButton>
        <ToggleButton
          variant='ghost'
          color='neutral'
          size='small'
          active={query.wholeWord}
          aria-pressed={query.wholeWord}
          aria-label='Match whole word'
          data-testid={slot('search-whole-word')}
          onToggle={active => updateQuery({ wholeWord: active })}
        >
          W
        </ToggleButton>
        <ToggleButton
          variant='ghost'
          color='neutral'
          size='small'
          active={query.regexp}
          aria-pressed={query.regexp}
          aria-label='Use regular expression'
          data-testid={slot('search-regexp')}
          onToggle={active => updateQuery({ regexp: active })}
        >
          .*
        </ToggleButton>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label='Previous match'
          disabled={!canSearch}
          data-testid={slot('search-previous')}
          onClick={() => findPrevious(view)}
        >
          <ChevronUp />
        </Button>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label='Next match'
          disabled={!canSearch}
          data-testid={slot('search-next')}
          onClick={() => findNext(view)}
        >
          <ChevronDown />
        </Button>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          className='ml-auto'
          aria-label='Close search'
          data-testid={slot('search-close')}
          onClick={() => closeSearchPanel(view)}
        >
          <X />
        </Button>
      </div>
      {!readOnly && (
        <div className={rowClassName}>
          <Input
            size='small'
            className='w-240'
            placeholder='Replace'
            aria-label='Replace'
            value={query.replace}
            data-testid={slot('replace-input')}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateQuery({ replace: event.target.value })
            }
            onKeyDown={handleReplaceKeyDown}
          />
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            disabled={!canSearch}
            data-testid={slot('replace-next')}
            onClick={() => replaceNext(view)}
          >
            Replace
          </Button>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            disabled={!canSearch}
            data-testid={slot('replace-all')}
            onClick={() => replaceAll(view)}
          >
            Replace all
          </Button>
        </div>
      )}
    </div>
  );
};

SearchPanel.displayName = 'SearchPanel';
```

- [ ] **Step 7: Implement `search.ts`**

Create `src/components/CodeEditor/engine/search.ts`:

```ts
import { createElement, type ReactNode } from 'react';
import { getSearchQuery, search, searchKeymap } from '@codemirror/search';
import { type EditorState, type Extension, Facet } from '@codemirror/state';
import { EditorView, keymap, type Panel, type ViewUpdate } from '@codemirror/view';
import type { PortalRegistry } from '../lib/portalRegistry';
import { SearchPanel } from './SearchPanel';
import { countMatches } from './searchMatches';

/**
 * `true` once a search extension is configured. `api.openSearch` checks it so
 * `openSearchPanel` never falls back to CodeMirror's own un-themed panel.
 */
export const searchConfigured = Facet.define<boolean, boolean>({
  combine: values => values.some(Boolean),
});

interface SearchPanelConfig {
  portals: PortalRegistry;
  readOnly: boolean;
  testId: string | undefined;
}

/**
 * CodeMirror keeps an open panel across compartment reconfigures (its
 * constructor stays the same), so the panel reads its config from state
 * instead of closing over the config it was created with.
 */
const searchPanelConfig = Facet.define<SearchPanelConfig, SearchPanelConfig | null>({
  combine: values => values[0] ?? null,
});

const renderPanel = (
  view: EditorView,
  state: EditorState,
  config: SearchPanelConfig,
): ReactNode => {
  const query = getSearchQuery(state);
  return createElement(SearchPanel, {
    view,
    query,
    matchCount: query.valid ? countMatches(state, query) : null,
    readOnly: config.readOnly || state.readOnly,
    testId: config.testId,
  });
};

const needsRender = (update: ViewUpdate): boolean =>
  update.docChanged ||
  update.state.readOnly !== update.startState.readOnly ||
  update.state.facet(searchPanelConfig) !== update.startState.facet(searchPanelConfig) ||
  !getSearchQuery(update.state).eq(getSearchQuery(update.startState));

const createSearchPanel = (view: EditorView): Panel => {
  const dom = document.createElement('div');
  let registered: { id: number; portals: PortalRegistry } | null = null;

  return {
    dom,
    top: true,
    mount() {
      const config = view.state.facet(searchPanelConfig);
      if (!config) return;
      registered = {
        id: config.portals.register(dom, renderPanel(view, view.state, config)),
        portals: config.portals,
      };
    },
    update(update) {
      const config = update.state.facet(searchPanelConfig);
      if (!registered || !config || !needsRender(update)) return;
      registered.portals.update(registered.id, renderPanel(view, update.state, config));
    },
    destroy() {
      registered?.portals.unregister(registered.id);
      registered = null;
    },
  };
};

/** Neutralises CodeMirror's default panel chrome; the React panel draws its own. */
const searchTheme = EditorView.theme({
  '.cm-panels': {
    backgroundColor: 'transparent',
    color: 'inherit',
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: 'none',
  },
  '.cm-searchMatch': {
    backgroundColor: 'var(--color-syntax-highlight-warning-highlight)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'var(--color-syntax-highlight-brand-highlight)',
  },
});

/** Find / replace panel (spec §7.11): DS components rendered into CodeMirror's top panel via portals. */
export const searchExtension = (config: {
  portals: PortalRegistry;
  readOnly: boolean;
  testId: string | undefined;
}): Extension => [
  search({ top: true, createPanel: createSearchPanel }),
  searchPanelConfig.of({
    portals: config.portals,
    readOnly: config.readOnly,
    testId: config.testId,
  }),
  searchConfigured.of(true),
  keymap.of(searchKeymap),
  searchTheme,
];
```

Run: `pnpm vitest run src/components/CodeEditor/engine/search.test.tsx src/components/CodeEditor/engine/searchMatches.test.ts`
Expected: PASS (17 tests: 12 panel + 5 matches).

- [ ] **Step 8: Write failing tests for the engine wiring**

Create `src/components/CodeEditor/engine/search.engine.test.tsx`:

```tsx
import { searchPanelOpen } from '@codemirror/search';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { engineOptions } from '../../../testUtils/codeEditorEngine';
import { PortalOutlet } from '../lib/PortalOutlet';
import { createPortalRegistry } from '../lib/portalRegistry';
import { createEditor } from './index';
import type { EditorHandle, EngineOptions } from './types';

const handles: EditorHandle[] = [];

const mountWithPortals = (overrides: Partial<EngineOptions> = {}) => {
  const portals = createPortalRegistry();
  const { container } = render(<PortalOutlet registry={portals} />);
  let options = engineOptions({ value: 'foo bar foo', testId: 'editor', ...overrides });
  let handle: EditorHandle | undefined;
  act(() => {
    handle = createEditor(container, options, {
      onChange: vi.fn(),
      onDiagnosticsChange: vi.fn(),
      onVisibleRowCountChange: vi.fn(),
      portals,
    });
  });
  if (!handle) throw new Error('editor not created');
  const created = handle;
  handles.push(created);
  const rerender = (next: Partial<EngineOptions>) => {
    options = { ...options, ...next };
    act(() => created.update(options));
  };
  return { handle: created, rerender };
};

afterEach(() => {
  for (const handle of handles.splice(0)) act(() => handle.destroy());
});

describe('createEditor — search wiring', () => {
  it('api.openSearch renders the DS search panel', () => {
    const { handle } = mountWithPortals();

    act(() => handle.api.openSearch());

    expect(screen.getByTestId('editor--search')).toBeInTheDocument();
    expect(screen.getByTestId('editor--search-input')).toHaveFocus();
    expect(searchPanelOpen(handle.view.state)).toBe(true);
  });

  it('Mod-F in the editor opens the panel (searchKeymap)', async () => {
    const user = userEvent.setup();
    const { handle } = mountWithPortals();
    act(() => handle.api.focus());

    await user.keyboard('{Control>}f{/Control}');

    expect(screen.getByTestId('editor--search')).toBeInTheDocument();
  });

  it('a readOnly change reconfigures the open panel without closing it', () => {
    const { handle, rerender } = mountWithPortals();
    act(() => handle.api.openSearch());
    expect(screen.getByTestId('editor--replace-input')).toBeInTheDocument();

    rerender({ readOnly: true });

    expect(searchPanelOpen(handle.view.state)).toBe(true);
    expect(screen.getByTestId('editor--search-input')).toBeInTheDocument();
    expect(screen.queryByTestId('editor--replace-input')).not.toBeInTheDocument();
  });

  it('a testId change re-derives the panel test ids', () => {
    const { handle, rerender } = mountWithPortals();
    act(() => handle.api.openSearch());

    rerender({ testId: 'other' });

    expect(screen.getByTestId('other--search')).toBeInTheDocument();
    expect(screen.queryByTestId('editor--search')).not.toBeInTheDocument();
  });
});
```

(jsdom's `navigator.platform` is `''`, so CodeMirror maps `Mod` to `Ctrl`.)

- [ ] **Step 9: Run the tests and confirm they fail**

Run: `pnpm vitest run src/components/CodeEditor/engine/search.engine.test.tsx`
Expected: FAIL. `Unable to find an element by: [data-testid="editor--search"]` in all 4 tests: the `search` slot is still `() => []`, so `searchConfigured` is false and `api.openSearch` does nothing.

- [ ] **Step 10: Wire search into `engine/index.ts`**

Make these edits in `src/components/CodeEditor/engine/index.ts` (T5):

(a) Remove `Facet` from the `@codemirror/state` import:

```ts
// old
  type Extension,
  Facet,
  Transaction,
} from '@codemirror/state';
// new
  type Extension,
  Transaction,
} from '@codemirror/state';
```

(b) Import from `./search` (after the `./languages` import) and re-export the facet, so existing importers of `searchConfigured` from `./index` keep working:

```ts
// old
import { languageExtension } from './languages';
// new
import { languageExtension } from './languages';
import { searchConfigured, searchExtension } from './search';
```

Then add this line directly below the `externalChange` declaration:

```ts
export { searchConfigured } from './search';
```

(c) Delete the facet block that now lives in `search.ts`:

```ts
// delete entirely
/**
 * `true` once a search extension is configured (T11 adds `searchConfigured.of(true)`
 * next to its search extension). Without it `openSearch` is a no-op, so
 * `openSearchPanel` never falls back to CodeMirror's own un-themed panel.
 */
export const searchConfigured = Facet.define<boolean, boolean>({
  combine: values => values.some(Boolean),
});
```

(d) In `featureExtensions`, fill the search slot. If the parameters are still called `_options` / `_callbacks` because no earlier feature task renamed them, rename them to `options` / `callbacks`:

```ts
// old
  search: () => [],
// new
  search: () =>
    searchExtension({
      portals: callbacks.portals,
      readOnly: options.readOnly,
      testId: options.testId,
    }),
```

Leave `SLOT_DEPS.search` (`['readOnly', 'testId']`) and `api.openSearch` as they are.

Run: `pnpm vitest run src/components/CodeEditor/engine/search.engine.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 11: Run the whole CodeEditor and CodeSnippet suites**

Run: `pnpm vitest run src/components/CodeEditor src/components/CodeSnippet`
Expected: PASS.

If a T5 test asserted that `api.openSearch` does nothing because no search extension is configured, it now fails, because search is always configured. Find it with `grep -rn "openSearch" src/components/CodeEditor/engine/*.test.ts`. Change its expectation so that `searchPanelOpen(handle.view.state)` becomes `true` after `handle.api.openSearch()`, then re-run.

- [ ] **Step 12: Typecheck and lint**

Run: `pnpm exec tsc --build tsconfig.app.json --noEmit`
Expected: no errors.

Run: `pnpm exec biome check src/components/CodeEditor/engine/search.ts src/components/CodeEditor/engine/SearchPanel.tsx src/components/CodeEditor/engine/searchMatches.ts src/components/CodeEditor/engine/searchMatches.test.ts src/components/CodeEditor/engine/search.test.tsx src/components/CodeEditor/engine/search.engine.test.tsx src/components/CodeEditor/engine/index.ts`
Expected: `No fixes applied`, with no errors. If only formatting is reported, run the same command with `--write`.

- [ ] **Step 13: Commit**

```bash
git add packages/design-system/src/components/CodeEditor/engine/searchMatches.ts \
  packages/design-system/src/components/CodeEditor/engine/searchMatches.test.ts \
  packages/design-system/src/components/CodeEditor/engine/SearchPanel.tsx \
  packages/design-system/src/components/CodeEditor/engine/search.ts \
  packages/design-system/src/components/CodeEditor/engine/search.test.tsx \
  packages/design-system/src/components/CodeEditor/engine/search.engine.test.tsx \
  packages/design-system/src/components/CodeEditor/engine/index.ts
git commit -m "$(cat <<'EOF'
feat(code-editor): add DS search panel

Find/replace panel rendered into CodeMirror's top panel through the portal
registry with DS Input/ToggleButton/Button. Enter/Shift-Enter navigate,
Escape closes and is default-prevented so fullscreen stays, the replace row
hides when readOnly, match counts are announced to screen readers.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

(If Step 11 required an edit to a T5 test file, add that file to the `git add` list too.)

---

### Task 12: Diagnostics

**Files:**
- Create: `src/components/CodeEditor/engine/diagnostics.ts`
- Create: `src/testUtils/codeEditorDiagnostics.ts` (test-only helper; `src/testUtils` is already excluded from `tsconfig.app.json`)
- Modify: `src/components/CodeEditor/engine/index.ts` (the `diagnostics` entry of `featureExtensions`, plus one import)
- Test: `src/components/CodeEditor/engine/diagnostics.locate.test.ts`
- Test: `src/components/CodeEditor/engine/diagnostics.syntax.test.ts`
- Test: `src/components/CodeEditor/engine/diagnostics.external.test.ts`
- Test: `src/components/CodeEditor/engine/diagnostics.theme.test.ts`
- Test: `src/components/CodeEditor/engine/diagnostics.engine.test.ts`

**Interfaces:**

Consumes:
- `findJsonBodyRange(state: EditorState): { from: number; to: number } | null` from `engine/languages` (T4).
- `languageExtension(language: CodeEditorLanguage): Extension` from `engine/languages` (T4, used in tests).
- `offsetToPosition(doc, offset, startingLineNumber)` and `positionToOffset(doc, position, startingLineNumber): number | null` from `engine/positions` (T3).
- `CodeEditorDiagnostic`, `CodeEditorLanguage`, `JsonSchema` from `../types` (T3).
- `EngineOptions.diagnostics / language / schema / startingLineNumber` and `EngineCallbacks.onDiagnosticsChange` (T3).
- The `featureExtensions` / `SLOT_DEPS` compartment machinery in `engine/index.ts` (T5). `SLOT_DEPS.diagnostics` is already `['language', 'schema', 'diagnostics', 'startingLineNumber']`, so it does not change.
- `mountEngine`, `unmountAllEngines` from `src/testUtils/codeEditorEngine.ts` (T5).
- From `@codemirror/lint`: `linter`, `setDiagnosticsEffect`, `forceLinting`, `forEachDiagnostic`, `type Diagnostic`.

Produces (in `engine/diagnostics.ts`):
```ts
export interface JsonRegion { from: number; to: number; }
export type SchemaDiagnosticsSource = (state: EditorState, region: JsonRegion) => Promise<readonly Diagnostic[]>;
export interface DiagnosticsConfig {
  language: CodeEditorLanguage;
  schema: JsonSchema | undefined;
  external: readonly CodeEditorDiagnostic[];
  startingLineNumber: number;
  onChange: (diagnostics: CodeEditorDiagnostic[]) => void;
  schemaSource?: SchemaDiagnosticsSource;   // NEW vs skeleton — T13 plugs it in
}
export const diagnosticsExtension: (config: DiagnosticsConfig) => Extension;
export const jsonRegion: (state: EditorState, language: CodeEditorLanguage) => JsonRegion | null;
// internal exports (engine + tests only, not re-exported from CodeEditor/index.ts):
export const LINT_DELAY: 300;  export const SYNTAX_SOURCE: 'syntax';  export const SCHEMA_SOURCE: 'schema';
export interface JsonSyntaxErrorLocation { offset: number | null; message: string; }
export const locateJsonSyntaxError: (message: string, text: string) => JsonSyntaxErrorLocation;
export const jsonSyntaxDiagnostics: (state: EditorState, region: JsonRegion) => Diagnostic[];
export const toCmDiagnostic: (doc: Text, diagnostic: CodeEditorDiagnostic, startingLineNumber: number) => Diagnostic | null;
export const toPublicDiagnostic: (doc: Text, diagnostic: Diagnostic, startingLineNumber: number) => CodeEditorDiagnostic;
export const diagnosticsTheme: Extension;
```

Changes to the skeleton's Shared Interfaces (apply at assembly):
- `diagnosticsExtension`'s config gains `schemaSource?: SchemaDiagnosticsSource`.
- `schemaSource` runs only when `schema !== undefined`, the JSON region exists and is not blank, and `JSON.parse` of the region succeeds.
- Results get `source: 'schema'` unless they already have one.
- A rejected promise is logged with `console.error('[CodeEditor] JSON Schema validation failed', error)`. When that happens the syntax and external diagnostics are still reported.

What T13 must do: in `featureExtensions`, add this to the `diagnosticsExtension({...})` call:
```ts
schemaSource: options.schema === undefined ? undefined : (state, region) => import('./schema/validate').then(m => m.validateAgainstSchema(state, region, options.schema as JsonSchema))
```
T13 also inherits the DS hover-tooltip surface through the `.cm-tooltip.cm-tooltip-hover` rule in `diagnosticsTheme`. It needs no second tooltip-surface theme.

Behaviour contract:
- **One linter.** It is `linter(source, { delay: 300, autoPanel: false })`. There is no `lintGutter` and no `lintKeymap`, so there is no panel.
- **Merge order** of the diagnostics list:
  1. the syntax error (at most one),
  2. schema errors,
  3. external diagnostics.
- **`onDiagnosticsChange`:**
  - It runs from an update listener, on each `setDiagnosticsEffect`.
  - Each diagnostic is converted to public form: `offsetToPosition` for both ends, `hint → info`, and `source` kept.
  - The listener compares `JSON.stringify` of that list with the last list reported for this `EditorView`. The last list is kept in a module-level `WeakMap<EditorView, string>` so it survives compartment reconfigures and `documentId` swaps.
  - Before anything has been reported, the previous list counts as `[]`. So an initially clean document never fires the callback.
- **External diagnostics:**
  - One is dropped when `from.line` is outside the document.
  - A `to` that is out of range is clamped to the end of the document. `to` is never before `from`.
  - With no `to`, the diagnostic covers one character, or is a point at the end of the line.

---

- [ ] **Step 1: Write the test helper**

Create `src/testUtils/codeEditorDiagnostics.ts`:

```ts
import { forceLinting, forEachDiagnostic } from '@codemirror/lint';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { type Mock, vi } from 'vitest';
import {
  type DiagnosticsConfig,
  diagnosticsExtension,
} from '../components/CodeEditor/engine/diagnostics';
import { languageExtension } from '../components/CodeEditor/engine/languages';

export interface LintedView {
  view: EditorView;
  onChange: Mock<DiagnosticsConfig['onChange']>;
  config: DiagnosticsConfig;
}

const views: EditorView[] = [];

/** EditorView with the language + diagnostics extension only. Call `destroyLintedViews()` in `afterEach`. */
export const mountLinted = (
  doc: string,
  overrides: Partial<Omit<DiagnosticsConfig, 'onChange'>> = {},
  extra: Extension = [],
): LintedView => {
  const onChange = vi.fn<DiagnosticsConfig['onChange']>();
  const config: DiagnosticsConfig = {
    language: 'json',
    schema: undefined,
    external: [],
    startingLineNumber: 1,
    onChange,
    ...overrides,
  };
  const parent = document.createElement('div');
  document.body.append(parent);
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [languageExtension(config.language), diagnosticsExtension(config), extra],
    }),
  });
  views.push(view);
  return { view, onChange, config };
};

export const destroyLintedViews = () => {
  for (const view of views.splice(0)) {
    view.dom.parentElement?.remove();
    view.destroy();
  }
};

/** Runs the pending lint now and waits for its (promise-based) result to be dispatched. */
export const flushLint = async (view: EditorView) => {
  forceLinting(view);
  await new Promise(resolve => setTimeout(resolve, 0));
};

export interface ActiveDiagnostic {
  from: number;
  to: number;
  severity: string;
  message: string;
  source: string | undefined;
}

/** Diagnostics currently held by the lint state, at their current positions. */
export const activeDiagnostics = (state: EditorState): ActiveDiagnostic[] => {
  const out: ActiveDiagnostic[] = [];
  forEachDiagnostic(state, (d, from, to) => {
    out.push({ from, to, severity: d.severity, message: d.message, source: d.source });
  });
  return out;
};
```

- [ ] **Step 2: Write the failing test for locating the error position in the message**

Create `src/components/CodeEditor/engine/diagnostics.locate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { locateJsonSyntaxError } from './diagnostics';

describe('locateJsonSyntaxError', () => {
  it('reads the V8 "at position N" offset and drops the position suffix', () => {
    expect(
      locateJsonSyntaxError(
        "Expected ',' or '}' after property value in JSON at position 13 (line 3 column 3)",
        '{\n  "a": 1\n  "b": 2\n}',
      ),
    ).toEqual({ offset: 13, message: "Expected ',' or '}' after property value" });
  });

  it('converts a Firefox "line L column C" position into an offset', () => {
    expect(
      locateJsonSyntaxError(
        "JSON.parse: expected ',' or '}' after property value in object at line 3 column 3 of the JSON data",
        '{\n  "a": 1\n  "b": 2\n}',
      ),
    ).toEqual({ offset: 13, message: "Expected ',' or '}' after property value in object" });
  });

  it('points "unexpected end" at the end of the content, ignoring trailing whitespace', () => {
    expect(locateJsonSyntaxError('Unexpected end of JSON input', '{"a": \n\n')).toEqual({
      offset: 5,
      message: 'Unexpected end of JSON input',
    });
  });

  it('returns a null offset when the message has no position', () => {
    expect(
      locateJsonSyntaxError(`Unexpected token '}', "{"a": tru}" is not valid JSON`, '{"a": tru}'),
    ).toEqual({ offset: null, message: "Unexpected token '}'" });
    expect(locateJsonSyntaxError("JSON Parse error: Expected '}'", '{')).toEqual({
      offset: null,
      message: "Expected '}'",
    });
  });

  it('falls back to a generic message when nothing is left after cleaning', () => {
    expect(locateJsonSyntaxError('', '{')).toEqual({ offset: null, message: 'Invalid JSON' });
  });
});
```

- [ ] **Step 3: Write the failing tests for JSON syntax errors (json + http body)**

Create `src/components/CodeEditor/engine/diagnostics.syntax.test.ts`:

```ts
import { EditorState } from '@codemirror/state';
import { afterEach, describe, expect, it } from 'vitest';
import {
  activeDiagnostics,
  destroyLintedViews,
  flushLint,
  mountLinted,
} from '../../../testUtils/codeEditorDiagnostics';
import { jsonRegion, jsonSyntaxDiagnostics } from './diagnostics';
import { languageExtension } from './languages';

const HTTP_JSON = 'POST /users HTTP/1.1\nContent-Type: application/json\n\n{"a": 1,}';
const HTTP_TEXT = 'POST /users HTTP/1.1\nContent-Type: text/plain\n\n{"a": 1,}';

const stateOf = (doc: string, language: 'json' | 'http' | 'yaml' | 'text') =>
  EditorState.create({ doc, extensions: languageExtension(language) });

afterEach(() => {
  destroyLintedViews();
});

describe('jsonRegion', () => {
  it('is the whole document for json', () => {
    expect(jsonRegion(stateOf('{"a": 1}', 'json'), 'json')).toEqual({ from: 0, to: 8 });
  });

  it('is the JSON body for http', () => {
    const state = stateOf(HTTP_JSON, 'http');
    const region = jsonRegion(state, 'http');
    expect(region).not.toBeNull();
    expect(state.sliceDoc(region?.from, region?.to)).toBe('{"a": 1,}');
  });

  it('is null for an http body that is not JSON and for other languages', () => {
    expect(jsonRegion(stateOf(HTTP_TEXT, 'http'), 'http')).toBeNull();
    expect(jsonRegion(stateOf('a: 1', 'yaml'), 'yaml')).toBeNull();
    expect(jsonRegion(stateOf('{', 'text'), 'text')).toBeNull();
  });
});

describe('jsonSyntaxDiagnostics', () => {
  it('returns nothing for valid, empty and whitespace-only JSON', () => {
    for (const doc of ['{"a": [1, true, null]}', '', '  \n ']) {
      const state = stateOf(doc, 'json');
      expect(jsonSyntaxDiagnostics(state, { from: 0, to: state.doc.length })).toEqual([]);
    }
  });

  it('underlines the character at the reported position', () => {
    const doc = '{\n  "a": 1\n  "b": 2\n}';
    const state = stateOf(doc, 'json');
    const at = doc.indexOf('"b"');

    expect(jsonSyntaxDiagnostics(state, { from: 0, to: doc.length })).toEqual([
      {
        from: at,
        to: at + 1,
        severity: 'error',
        message: "Expected ',' or '}' after property value",
        source: 'syntax',
      },
    ]);
  });

  it('underlines the last non-whitespace character on unexpected end of input', () => {
    const doc = '{"a": \n';
    const state = stateOf(doc, 'json');
    const [diagnostic] = jsonSyntaxDiagnostics(state, { from: 0, to: doc.length });

    expect(diagnostic).toMatchObject({ from: 4, to: 5, message: 'Unexpected end of JSON input' });
  });

  it('falls back to the Lezer error node when the message has no position', () => {
    const doc = '{"a": tru}';
    const state = stateOf(doc, 'json');
    const [diagnostic] = jsonSyntaxDiagnostics(state, { from: 0, to: doc.length });

    expect(diagnostic?.message).toBe("Unexpected token '}'");
    expect(diagnostic?.from).toBeGreaterThanOrEqual(doc.indexOf('tru'));
    expect(diagnostic?.to).toBeLessThanOrEqual(doc.length);
    expect(diagnostic?.to).toBeGreaterThan(diagnostic?.from ?? Number.POSITIVE_INFINITY);
  });
});

describe('diagnosticsExtension — JSON syntax', () => {
  it('reports one syntax error at the right offset for invalid json', async () => {
    const doc = '{"name" "x"}';
    const { view } = mountLinted(doc, { language: 'json' });
    await flushLint(view);

    expect(activeDiagnostics(view.state)).toEqual([
      {
        from: doc.indexOf('"x"'),
        to: doc.indexOf('"x"') + 1,
        severity: 'error',
        message: "Expected ':' after property name",
        source: 'syntax',
      },
    ]);
  });

  it('shifts http JSON body errors to absolute document offsets', async () => {
    const { view } = mountLinted(HTTP_JSON, { language: 'http' });
    await flushLint(view);

    const at = HTTP_JSON.lastIndexOf('}');
    expect(activeDiagnostics(view.state)).toEqual([
      {
        from: at,
        to: at + 1,
        severity: 'error',
        message: 'Expected double-quoted property name',
        source: 'syntax',
      },
    ]);
  });

  it('does not lint an http body that is not JSON, nor text/yaml documents', async () => {
    for (const [doc, language] of [
      [HTTP_TEXT, 'http'],
      ['{', 'text'],
      ['a: [', 'yaml'],
    ] as const) {
      const { view } = mountLinted(doc, { language });
      await flushLint(view);
      expect(activeDiagnostics(view.state)).toEqual([]);
    }
  });

  it('clears the error once the JSON is fixed', async () => {
    const { view } = mountLinted('{"a": 1,}', { language: 'json' });
    await flushLint(view);
    expect(activeDiagnostics(view.state)).toHaveLength(1);

    view.dispatch({ changes: { from: 7, to: 8 } });
    await flushLint(view);
    expect(view.state.doc.toString()).toBe('{"a": 1}');
    expect(activeDiagnostics(view.state)).toEqual([]);
  });
});
```

- [ ] **Step 4: Write the failing tests for external diagnostics, severity mapping, `onChange` dedupe and the schema hook**

Create `src/components/CodeEditor/engine/diagnostics.external.test.ts`:

```ts
import type { Diagnostic } from '@codemirror/lint';
import { Text } from '@codemirror/state';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  activeDiagnostics,
  destroyLintedViews,
  flushLint,
  mountLinted,
} from '../../../testUtils/codeEditorDiagnostics';
import type { CodeEditorDiagnostic } from '../types';
import { type SchemaDiagnosticsSource, toCmDiagnostic, toPublicDiagnostic } from './diagnostics';

const DOC = 'first line\nsecond line';
const doc = Text.of(DOC.split('\n'));

afterEach(() => {
  destroyLintedViews();
  vi.restoreAllMocks();
});

describe('toCmDiagnostic', () => {
  it('maps absolute lines (startingLineNumber 10) and 1-based columns to offsets', () => {
    expect(
      toCmDiagnostic(
        doc,
        {
          from: { line: 11, column: 1 },
          to: { line: 11, column: 7 },
          severity: 'warning',
          message: 'w',
          source: 'api',
        },
        10,
      ),
    ).toEqual({ from: 11, to: 17, severity: 'warning', message: 'w', source: 'api' });
  });

  it('covers one character without `to`, or a point at the end of the line', () => {
    expect(
      toCmDiagnostic(doc, { from: { line: 10, column: 3 }, severity: 'info', message: 'i' }, 10),
    ).toEqual({ from: 2, to: 3, severity: 'info', message: 'i' });
    expect(
      toCmDiagnostic(doc, { from: { line: 10, column: 99 }, severity: 'info', message: 'i' }, 10),
    ).toEqual({ from: 10, to: 10, severity: 'info', message: 'i' });
  });

  it('drops a diagnostic whose start line is outside the document', () => {
    for (const line of [9, 12]) {
      expect(
        toCmDiagnostic(doc, { from: { line, column: 1 }, severity: 'error', message: 'x' }, 10),
      ).toBeNull();
    }
  });

  it('clamps an out-of-range `to` to the document end and never ends before `from`', () => {
    expect(
      toCmDiagnostic(
        doc,
        {
          from: { line: 10, column: 2 },
          to: { line: 50, column: 1 },
          severity: 'error',
          message: 'x',
        },
        10,
      ),
    ).toMatchObject({ from: 1, to: DOC.length });
    expect(
      toCmDiagnostic(
        doc,
        {
          from: { line: 11, column: 5 },
          to: { line: 10, column: 1 },
          severity: 'error',
          message: 'x',
        },
        10,
      ),
    ).toMatchObject({ from: 15, to: 15 });
  });
});

describe('toPublicDiagnostic', () => {
  it('maps offsets back to absolute positions and keeps severity and source', () => {
    const diagnostic: Diagnostic = {
      from: 11,
      to: 17,
      severity: 'error',
      message: 'e',
      source: 'syntax',
    };
    expect(toPublicDiagnostic(doc, diagnostic, 10)).toEqual({
      from: { line: 11, column: 1 },
      to: { line: 11, column: 7 },
      severity: 'error',
      message: 'e',
      source: 'syntax',
    });
  });

  it("reads CodeMirror's `hint` severity as `info` and omits a missing source", () => {
    expect(toPublicDiagnostic(doc, { from: 0, to: 1, severity: 'hint', message: 'h' }, 1)).toEqual({
      from: { line: 1, column: 1 },
      to: { line: 1, column: 2 },
      severity: 'info',
      message: 'h',
    });
  });
});

describe('diagnosticsExtension — external diagnostics', () => {
  const external: CodeEditorDiagnostic[] = [
    { from: { line: 10, column: 1 }, to: { line: 10, column: 6 }, severity: 'error', message: 'e' },
    { from: { line: 11, column: 1 }, severity: 'warning', message: 'w', source: 'api' },
    { from: { line: 11, column: 8 }, severity: 'info', message: 'i' },
    { from: { line: 99, column: 1 }, severity: 'error', message: 'dropped' },
  ];

  it('converts in-range diagnostics with their severity and drops out-of-range ones', async () => {
    const { view } = mountLinted(DOC, { language: 'text', external, startingLineNumber: 10 });
    await flushLint(view);

    expect(activeDiagnostics(view.state)).toEqual([
      { from: 0, to: 5, severity: 'error', message: 'e', source: undefined },
      { from: 11, to: 12, severity: 'warning', message: 'w', source: 'api' },
      { from: 18, to: 19, severity: 'info', message: 'i', source: undefined },
    ]);
  });

  it('merges JSON syntax errors with external diagnostics', async () => {
    const { view, onChange } = mountLinted('{"a" 1}', {
      language: 'json',
      external: [{ from: { line: 1, column: 1 }, severity: 'info', message: 'ext' }],
    });
    await flushLint(view);

    expect(onChange).toHaveBeenLastCalledWith([
      {
        from: { line: 1, column: 6 },
        to: { line: 1, column: 7 },
        severity: 'error',
        message: "Expected ':' after property name",
        source: 'syntax',
      },
      {
        from: { line: 1, column: 1 },
        to: { line: 1, column: 2 },
        severity: 'info',
        message: 'ext',
      },
    ]);
  });
});

describe('diagnosticsExtension — onChange', () => {
  it('is not called while the list stays empty', async () => {
    const { view, onChange } = mountLinted('{"a": 1}', { language: 'json' });
    await flushLint(view);
    view.dispatch({ changes: { from: 7, insert: ' ' } });
    await flushLint(view);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('is called once per distinct list, in public form', async () => {
    const { view, onChange } = mountLinted('{"a": 1,}', {
      language: 'json',
      startingLineNumber: 5,
    });
    await flushLint(view);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([
      {
        from: { line: 5, column: 9 },
        to: { line: 5, column: 10 },
        severity: 'error',
        message: 'Expected double-quoted property name',
        source: 'syntax',
      },
    ]);

    // Same error after an edit that does not move it → no new call.
    view.dispatch({ changes: { from: 9, insert: '\n' } });
    await flushLint(view);
    expect(onChange).toHaveBeenCalledTimes(1);

    // Fixed → one call with the empty list.
    view.dispatch({ changes: { from: 7, to: 8 } });
    await flushLint(view);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('diagnosticsExtension — schema hook', () => {
  const schemaDiagnostic: Diagnostic = {
    from: 6,
    to: 7,
    severity: 'warning',
    message: 'Expected string',
  };

  it('runs schemaSource only when schema is set and the JSON parses, defaulting source to "schema"', async () => {
    const schemaSource = vi.fn<SchemaDiagnosticsSource>(async () => [schemaDiagnostic]);

    const withoutSchema = mountLinted('{"a": 1}', { language: 'json', schemaSource });
    await flushLint(withoutSchema.view);
    expect(schemaSource).not.toHaveBeenCalled();

    const invalid = mountLinted('{"a": 1,}', { language: 'json', schema: {}, schemaSource });
    await flushLint(invalid.view);
    expect(schemaSource).not.toHaveBeenCalled();

    const valid = mountLinted('{"a": 1}', { language: 'json', schema: {}, schemaSource });
    await flushLint(valid.view);
    expect(schemaSource).toHaveBeenCalledTimes(1);
    const [state, region] = schemaSource.mock.calls[0] ?? [];
    expect(state?.doc.toString()).toBe('{"a": 1}');
    expect(region).toEqual({ from: 0, to: 8 });
    expect(activeDiagnostics(valid.view.state)).toEqual([
      { from: 6, to: 7, severity: 'warning', message: 'Expected string', source: 'schema' },
    ]);
  });

  it('keeps external diagnostics when schemaSource rejects', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { view } = mountLinted('{"a": 1}', {
      language: 'json',
      schema: {},
      schemaSource: async () => {
        throw new Error('boom');
      },
      external: [{ from: { line: 1, column: 1 }, severity: 'info', message: 'ext' }],
    });
    await flushLint(view);

    expect(activeDiagnostics(view.state)).toEqual([
      { from: 0, to: 1, severity: 'info', message: 'ext', source: undefined },
    ]);
    expect(consoleError).toHaveBeenCalledWith(
      '[CodeEditor] JSON Schema validation failed',
      expect.any(Error),
    );
  });
});
```

- [ ] **Step 5: Write the failing rendering/theme test**

Create `src/components/CodeEditor/engine/diagnostics.theme.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest';
import {
  destroyLintedViews,
  flushLint,
  mountLinted,
} from '../../../testUtils/codeEditorDiagnostics';

/** All CSS CodeMirror (style-mod) has mounted into the document. */
const mountedCss = (): string =>
  Array.from(document.querySelectorAll('style'))
    .map(style => style.textContent ?? '')
    .join('\n');

afterEach(() => {
  destroyLintedViews();
});

describe('diagnosticsExtension — rendering', () => {
  it('underlines with wavy indicator tokens instead of the default SVG squiggle', async () => {
    const { view } = mountLinted('{"a" 1}', { language: 'json' });
    await flushLint(view);

    const mark = view.contentDOM.querySelector('.cm-lintRange-error');
    expect(mark?.textContent).toBe('1');

    const css = mountedCss();
    expect(css).toMatch(/\.cm-lintRange-error \{[^}]*background-image: none/);
    expect(css).toMatch(/\.cm-lintRange-error \{[^}]*text-decoration-style: wavy/);
    expect(css).toContain('text-decoration-color: var(--color-syntax-highlight-error-indicator)');
    expect(css).toContain('text-decoration-color: var(--color-syntax-highlight-warning-indicator)');
    expect(css).toContain('text-decoration-color: var(--color-syntax-highlight-info-indicator)');
  });

  it('puts hover tooltips on the DS Tooltip surface', () => {
    mountLinted('{}', { language: 'json' });
    const css = mountedCss();

    expect(css).toContain('background-color: var(--color-component-tooltip-bg)');
    expect(css).toContain('color: var(--color-text-primary-alt)');
    expect(css).toContain('border-radius: var(--radius-8)');
    expect(css).toContain('font-size: var(--text-xs)');
    expect(css).toContain('z-index: var(--tooltip-z-index)');
  });

  it('renders no lint gutter and no lint panel', async () => {
    const { view } = mountLinted('{"a" 1}', { language: 'json' });
    await flushLint(view);

    expect(view.dom.querySelector('.cm-gutter-lint')).toBeNull();
    expect(view.dom.querySelector('.cm-panel-lint')).toBeNull();
  });
});
```

- [ ] **Step 6: Run the new tests and confirm they fail**

Run from `packages/design-system/`:
```bash
pnpm vitest run src/components/CodeEditor/engine/diagnostics.locate.test.ts src/components/CodeEditor/engine/diagnostics.syntax.test.ts src/components/CodeEditor/engine/diagnostics.external.test.ts src/components/CodeEditor/engine/diagnostics.theme.test.ts
```
Expected: all 4 files FAIL with `Failed to resolve import "./diagnostics"`, or `"../components/CodeEditor/engine/diagnostics"` from the helper.

- [ ] **Step 7: Implement `engine/diagnostics.ts`**

Create `src/components/CodeEditor/engine/diagnostics.ts`:

```ts
import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';
import { type Diagnostic, linter, setDiagnosticsEffect } from '@codemirror/lint';
import type { EditorState, Extension, Text } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import type { CodeEditorDiagnostic, CodeEditorLanguage, JsonSchema } from '../types';
import { findJsonBodyRange } from './languages';
import { offsetToPosition, positionToOffset } from './positions';

/** Absolute document range holding JSON (whole doc for `json`, the JSON body for `http`). */
export interface JsonRegion {
  from: number;
  to: number;
}

/**
 * Schema hook (spec §7.13). T13 passes a function that dynamically imports
 * `./schema/validate` and returns CM diagnostics with absolute offsets.
 * Called only when `schema` is set and the region is syntactically valid JSON.
 */
export type SchemaDiagnosticsSource = (
  state: EditorState,
  region: JsonRegion,
) => Promise<readonly Diagnostic[]>;

export interface DiagnosticsConfig {
  language: CodeEditorLanguage;
  schema: JsonSchema | undefined;
  external: readonly CodeEditorDiagnostic[];
  startingLineNumber: number;
  onChange: (diagnostics: CodeEditorDiagnostic[]) => void;
  schemaSource?: SchemaDiagnosticsSource;
}

/** Linter debounce after a change, in ms (spec §7.12). */
export const LINT_DELAY = 300;
export const SYNTAX_SOURCE = 'syntax';
export const SCHEMA_SOURCE = 'schema';

/** Upper bound for the parse work the Lezer fallback may force, in ms. */
const ENSURE_TREE_TIMEOUT = 200;

/**
 * Where the JSON lives in the document: the whole document for `json`, the mounted
 * `JsonText` body for `http` (null when the body is absent or not JSON), otherwise null.
 */
export const jsonRegion = (state: EditorState, language: CodeEditorLanguage): JsonRegion | null => {
  if (language === 'json') return { from: 0, to: state.doc.length };
  if (language === 'http') return findJsonBodyRange(state);
  return null;
};

export interface JsonSyntaxErrorLocation {
  /** Offset relative to the parsed text, or null when the message carries no position. */
  offset: number | null;
  /** Human-readable message without engine-specific position suffixes. */
  message: string;
}

const POSITION = /at position (\d+)/;
const LINE_COLUMN = /line (\d+) column (\d+)/;
const END_OF_INPUT = /end of (?:JSON )?(?:input|data)/i;

const offsetOfLineColumn = (text: string, line: number, column: number): number => {
  let offset = 0;
  for (let current = 1; current < line; current++) {
    const newline = text.indexOf('\n', offset);
    if (newline < 0) return text.length;
    offset = newline + 1;
  }
  return Math.min(offset + column - 1, text.length);
};

const cleanMessage = (message: string): string => {
  const cleaned = message
    .replace(/^JSON\.parse: /, '')
    .replace(/^JSON Parse error: /, '')
    .replace(/ in JSON at position \d+(?: \(line \d+ column \d+\))?$/, '')
    .replace(/ at line \d+ column \d+ of the JSON data$/, '')
    .replace(/, ".*" is not valid JSON$/s, '')
    .trim();
  if (cleaned === '') return 'Invalid JSON';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

/**
 * Reads the error position out of a `JSON.parse` SyntaxError message.
 * V8: `... in JSON at position N (line L column C)`; Firefox: `... at line L column C of the JSON data`;
 * `Unexpected end of JSON input` / `unexpected end of data` → end of the content.
 */
export const locateJsonSyntaxError = (message: string, text: string): JsonSyntaxErrorLocation => {
  const clean = cleanMessage(message);
  const position = POSITION.exec(message);
  if (position) return { offset: Number(position[1]), message: clean };
  const lineColumn = LINE_COLUMN.exec(message);
  if (lineColumn) {
    return {
      offset: offsetOfLineColumn(text, Number(lineColumn[1]), Number(lineColumn[2])),
      message: clean,
    };
  }
  if (END_OF_INPUT.test(message)) return { offset: text.trimEnd().length, message: clean };
  return { offset: null, message: clean };
};

/**
 * One-character range at `relative` inside `text`, shifted by `base`. Past the last
 * non-whitespace character it underlines that character; on a line break it is a point.
 */
const rangeAt = (text: string, relative: number, base: number): JsonRegion => {
  const contentEnd = text.trimEnd().length;
  if (relative >= contentEnd) return { from: base + contentEnd - 1, to: base + contentEnd };
  const from = Math.max(relative, 0);
  return text.charAt(from) === '\n'
    ? { from: base + from, to: base + from }
    : { from: base + from, to: base + from + 1 };
};

/** First Lezer error (⚠) node inside the region — used when the message has no position. */
const firstErrorNode = (state: EditorState, region: JsonRegion): JsonRegion | null => {
  const tree = ensureSyntaxTree(state, region.to, ENSURE_TREE_TIMEOUT) ?? syntaxTree(state);
  let found: JsonRegion | null = null;
  tree.iterate({
    from: region.from,
    to: region.to,
    enter: node => {
      if (found) return false;
      if (!node.type.isError || node.from < region.from) return true;
      found = { from: node.from, to: node.to };
      return false;
    },
  });
  return found;
};

/** JSON syntax error of the region (at most one — `JSON.parse` stops at the first). */
export const jsonSyntaxDiagnostics = (state: EditorState, region: JsonRegion): Diagnostic[] => {
  const text = state.sliceDoc(region.from, region.to);
  if (text.trim() === '') return [];
  try {
    JSON.parse(text);
    return [];
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    const located = locateJsonSyntaxError(raw, text);
    let range: JsonRegion;
    if (located.offset !== null) {
      range = rangeAt(text, located.offset, region.from);
    } else {
      const node = firstErrorNode(state, region);
      if (node && node.to > node.from) range = node;
      else if (node) range = rangeAt(text, node.from - region.from, region.from);
      else range = rangeAt(text, text.length - text.trimStart().length, region.from);
    }
    return [
      {
        from: range.from,
        to: range.to,
        severity: 'error',
        message: located.message,
        source: SYNTAX_SOURCE,
      },
    ];
  }
};

/** Without `to`: one character, or a point at the end of the line. */
const defaultEnd = (doc: Text, from: number): number =>
  from < doc.lineAt(from).to ? from + 1 : from;

/**
 * Consumer diagnostic → CM diagnostic. `null` when `from.line` is outside the document;
 * a `to` line outside the document is clamped to the document end.
 */
export const toCmDiagnostic = (
  doc: Text,
  diagnostic: CodeEditorDiagnostic,
  startingLineNumber: number,
): Diagnostic | null => {
  const from = positionToOffset(doc, diagnostic.from, startingLineNumber);
  if (from === null) return null;
  const to = diagnostic.to
    ? Math.max(from, positionToOffset(doc, diagnostic.to, startingLineNumber) ?? doc.length)
    : defaultEnd(doc, from);
  return {
    from,
    to,
    severity: diagnostic.severity,
    message: diagnostic.message,
    ...(diagnostic.source === undefined ? {} : { source: diagnostic.source }),
  };
};

/** CM diagnostic → public form (absolute lines, 1-based columns). `hint` reads as `info`. */
export const toPublicDiagnostic = (
  doc: Text,
  diagnostic: Diagnostic,
  startingLineNumber: number,
): CodeEditorDiagnostic => ({
  from: offsetToPosition(doc, diagnostic.from, startingLineNumber),
  to: offsetToPosition(doc, diagnostic.to, startingLineNumber),
  severity: diagnostic.severity === 'hint' ? 'info' : diagnostic.severity,
  message: diagnostic.message,
  ...(diagnostic.source === undefined ? {} : { source: diagnostic.source }),
});

const externalDiagnostics = (
  doc: Text,
  external: readonly CodeEditorDiagnostic[],
  startingLineNumber: number,
): Diagnostic[] =>
  external.flatMap(diagnostic => {
    const converted = toCmDiagnostic(doc, diagnostic, startingLineNumber);
    return converted ? [converted] : [];
  });

const lintSource =
  (config: DiagnosticsConfig) =>
  (view: EditorView): readonly Diagnostic[] | Promise<readonly Diagnostic[]> => {
    const { state } = view;
    const region = jsonRegion(state, config.language);
    const syntax = region ? jsonSyntaxDiagnostics(state, region) : [];
    const external = externalDiagnostics(state.doc, config.external, config.startingLineNumber);
    const { schemaSource, schema } = config;
    if (
      !region ||
      syntax.length > 0 ||
      schema === undefined ||
      !schemaSource ||
      state.sliceDoc(region.from, region.to).trim() === ''
    ) {
      return [...syntax, ...external];
    }
    return schemaSource(state, region).then(
      schemaDiagnostics => [
        ...schemaDiagnostics.map(d => ({ ...d, source: d.source ?? SCHEMA_SOURCE })),
        ...external,
      ],
      (error: unknown) => {
        // biome-ignore lint/suspicious/noConsole: a failing schema must not hide syntax/consumer diagnostics
        console.error('[CodeEditor] JSON Schema validation failed', error);
        return external;
      },
    );
  };

/** Last list reported per view, as JSON — survives compartment reconfigures and documentId swaps. */
const reported = new WeakMap<EditorView, string>();
const EMPTY_LIST = '[]';

const reportChanges = (config: DiagnosticsConfig): Extension =>
  EditorView.updateListener.of(update => {
    for (const tr of update.transactions) {
      for (const effect of tr.effects) {
        if (!effect.is(setDiagnosticsEffect)) continue;
        const list = effect.value.map(d =>
          toPublicDiagnostic(tr.state.doc, d, config.startingLineNumber),
        );
        const key = JSON.stringify(list);
        if ((reported.get(update.view) ?? EMPTY_LIST) === key) continue;
        reported.set(update.view, key);
        config.onChange(list);
      }
    }
  });

const wavyUnderline = (token: string) => ({
  backgroundImage: 'none',
  textDecorationLine: 'underline',
  textDecorationStyle: 'wavy',
  textDecorationColor: `var(${token})`,
  textDecorationSkipInk: 'none',
  textUnderlineOffset: '3px',
});

const ERROR_INDICATOR = '--color-syntax-highlight-error-indicator';
const WARNING_INDICATOR = '--color-syntax-highlight-warning-indicator';
const INFO_INDICATOR = '--color-syntax-highlight-info-indicator';

/**
 * Underlines per spec §7.10 (existing indicator tokens only) and the lint tooltip on the
 * DS Tooltip surface (`TooltipContent`: `bg-component-tooltip-bg text-text-primary-alt
 * text-xs font-medium rounded-8 py-4 px-8`, z-index `--tooltip-z-index`). The surface rule
 * targets every hover tooltip so schema hover (T13) matches.
 */
export const diagnosticsTheme: Extension = EditorView.theme({
  '.cm-lintRange': { paddingBottom: '0' },
  '.cm-lintRange-error': wavyUnderline(ERROR_INDICATOR),
  '.cm-lintRange-warning': wavyUnderline(WARNING_INDICATOR),
  '.cm-lintRange-info': wavyUnderline(INFO_INDICATOR),
  '.cm-lintRange-hint': wavyUnderline(INFO_INDICATOR),
  '.cm-lintRange-active': { backgroundColor: 'transparent' },
  '.cm-lintPoint:after': { borderBottomColor: `var(${ERROR_INDICATOR})` },
  '.cm-lintPoint-warning:after': { borderBottomColor: `var(${WARNING_INDICATOR})` },
  '.cm-lintPoint-info:after': { borderBottomColor: `var(${INFO_INDICATOR})` },
  '.cm-lintPoint-hint:after': { borderBottomColor: `var(${INFO_INDICATOR})` },
  '.cm-tooltip.cm-tooltip-hover': {
    border: 'none',
    borderRadius: 'var(--radius-8)',
    backgroundColor: 'var(--color-component-tooltip-bg)',
    color: 'var(--color-text-primary-alt)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    overflow: 'hidden',
    zIndex: 'var(--tooltip-z-index)',
  },
  '.cm-tooltip-lint': { padding: '4px 0' },
  '.cm-diagnostic': {
    padding: '0 8px 0 6px',
    marginLeft: '0',
    borderLeft: `2px solid var(${ERROR_INDICATOR})`,
  },
  '.cm-diagnostic-warning': { borderLeft: `2px solid var(${WARNING_INDICATOR})` },
  '.cm-diagnostic-info': { borderLeft: `2px solid var(${INFO_INDICATOR})` },
  '.cm-diagnostic-hint': { borderLeft: `2px solid var(${INFO_INDICATOR})` },
  '.cm-diagnosticSource': { fontSize: 'var(--text-xs)', opacity: '0.7' },
});

/**
 * Diagnostics (spec §7.12): one debounced linter merging JSON syntax errors (json / http
 * JSON body), schema errors (via `schemaSource`, T13) and the consumer `diagnostics` prop.
 * Underlines + hover tooltip only — no lint gutter, panel or lint keymap.
 */
export const diagnosticsExtension = (config: DiagnosticsConfig): Extension => [
  linter(lintSource(config), { delay: LINT_DELAY, autoPanel: false }),
  reportChanges(config),
  diagnosticsTheme,
];
```

- [ ] **Step 8: Run the unit tests and confirm they pass**

```bash
pnpm vitest run src/components/CodeEditor/engine/diagnostics.locate.test.ts src/components/CodeEditor/engine/diagnostics.syntax.test.ts src/components/CodeEditor/engine/diagnostics.external.test.ts src/components/CodeEditor/engine/diagnostics.theme.test.ts
```
Expected: 4 files and 31 tests PASS. The counts are 5 + 11 + 12 + 3.

- [ ] **Step 9: Write the failing engine-wiring test**

Create `src/components/CodeEditor/engine/diagnostics.engine.test.ts`:

```ts
import { forceLinting } from '@codemirror/lint';
import { afterEach, describe, expect, it } from 'vitest';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

const flush = async (view: Parameters<typeof forceLinting>[0]) => {
  forceLinting(view);
  await new Promise(resolve => setTimeout(resolve, 0));
};

afterEach(() => {
  unmountAllEngines();
});

describe('createEditor — diagnostics compartment', () => {
  it('reports JSON syntax errors through onDiagnosticsChange', async () => {
    const { handle, callbacks } = mountEngine({ language: 'json', value: '{"a" 1}' });
    await flush(handle.view);

    expect(callbacks.onDiagnosticsChange).toHaveBeenCalledTimes(1);
    expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([
      {
        from: { line: 1, column: 6 },
        to: { line: 1, column: 7 },
        severity: 'error',
        message: "Expected ':' after property name",
        source: 'syntax',
      },
    ]);
  });

  it('re-lints when the diagnostics prop or startingLineNumber changes', async () => {
    const { handle, callbacks, rerender } = mountEngine({ language: 'text', value: 'a\nb' });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).not.toHaveBeenCalled();

    rerender({
      diagnostics: [{ from: { line: 2, column: 1 }, severity: 'warning', message: 'w' }],
    });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([
      {
        from: { line: 2, column: 1 },
        to: { line: 2, column: 2 },
        severity: 'warning',
        message: 'w',
      },
    ]);

    // Line 2 of the prop is now outside the document (lines 10–11) → dropped.
    rerender({ startingLineNumber: 10 });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([]);
    expect(callbacks.onDiagnosticsChange).toHaveBeenCalledTimes(2);
  });

  it('does not call onDiagnosticsChange again for an identical external list', async () => {
    const diagnostics = [{ from: { line: 1, column: 1 }, severity: 'error' as const, message: 'e' }];
    const { handle, callbacks, rerender } = mountEngine({
      language: 'text',
      value: 'abc',
      diagnostics,
    });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).toHaveBeenCalledTimes(1);

    rerender({ diagnostics: [...diagnostics] });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).toHaveBeenCalledTimes(1);
  });
});
```

Run:
```bash
pnpm vitest run src/components/CodeEditor/engine/diagnostics.engine.test.ts
```
Expected: FAIL. `onDiagnosticsChange` is never called, and `toHaveBeenCalledTimes(1)` gets 0 calls, because the `diagnostics` compartment is still `[]`.

- [ ] **Step 10: Register the extension in the `diagnostics` compartment**

In `src/components/CodeEditor/engine/index.ts`, add the import right after the `./contentAttributes` import:

```ts
// old
import { sanitizeContentAttributes } from './contentAttributes';
// new
import { sanitizeContentAttributes } from './contentAttributes';
import { diagnosticsExtension } from './diagnostics';
```

In `featureExtensions`, replace the `diagnostics` entry. If the parameters are still named `_options` / `_callbacks`, which is the case when no earlier feature task renamed them, rename them to `options` / `callbacks`:

```ts
// old
const featureExtensions = (
  _options: EngineOptions,
  _callbacks: EngineCallbacks,
): SlotBuilders<FeatureKey> => ({
  ...
  diagnostics: () => [],
  ...
});
// new
const featureExtensions = (
  options: EngineOptions,
  callbacks: EngineCallbacks,
): SlotBuilders<FeatureKey> => ({
  ...
  diagnostics: () =>
    diagnosticsExtension({
      language: options.language,
      schema: options.schema,
      external: options.diagnostics,
      startingLineNumber: options.startingLineNumber,
      onChange: callbacks.onDiagnosticsChange,
    }),
  ...
});
```

Leave `SLOT_DEPS.diagnostics` unchanged. It is already `['language', 'schema', 'diagnostics', 'startingLineNumber']`. The linter reruns on reconfigure because `@codemirror/lint`'s plugin re-schedules whenever the `lintConfig` facet changes.

- [ ] **Step 11: Run the diagnostics tests and the whole engine suite**

```bash
pnpm vitest run src/components/CodeEditor/engine/diagnostics.engine.test.ts
pnpm vitest run src/components/CodeEditor
```
Expected:
- `diagnostics.engine.test.ts` gives 3 tests PASS.
- The whole CodeEditor run is all green. The earlier T3–T11 engine tests must be unaffected; the linter is always installed and dispatches `setDiagnostics([])` only after the lint delay or `forceLinting`.

- [ ] **Step 12: Typecheck and lint**

```bash
pnpm exec tsc --build tsconfig.app.json --noEmit
pnpm exec biome check src/components/CodeEditor/engine/diagnostics.ts src/components/CodeEditor/engine/diagnostics.locate.test.ts src/components/CodeEditor/engine/diagnostics.syntax.test.ts src/components/CodeEditor/engine/diagnostics.external.test.ts src/components/CodeEditor/engine/diagnostics.theme.test.ts src/components/CodeEditor/engine/diagnostics.engine.test.ts src/components/CodeEditor/engine/index.ts src/testUtils/codeEditorDiagnostics.ts
```
Expected: 0 TypeScript errors and 0 Biome errors or warnings. If Biome reports only formatting, run the same command with `--write` and re-run it.

- [ ] **Step 13: Commit**

```bash
git add packages/design-system/src/components/CodeEditor/engine/diagnostics.ts \
  packages/design-system/src/components/CodeEditor/engine/diagnostics.locate.test.ts \
  packages/design-system/src/components/CodeEditor/engine/diagnostics.syntax.test.ts \
  packages/design-system/src/components/CodeEditor/engine/diagnostics.external.test.ts \
  packages/design-system/src/components/CodeEditor/engine/diagnostics.theme.test.ts \
  packages/design-system/src/components/CodeEditor/engine/diagnostics.engine.test.ts \
  packages/design-system/src/components/CodeEditor/engine/index.ts \
  packages/design-system/src/testUtils/codeEditorDiagnostics.ts
git commit -m "$(cat <<'EOF'
feat(code-editor): add diagnostics (JSON syntax, HTTP body, external, onDiagnosticsChange)

One debounced linter merges JSON syntax errors (json, http JSON body with
absolute offsets), a schema hook for T13 and the diagnostics prop (line/column
mapped via startingLineNumber, out-of-range dropped). onDiagnosticsChange
fires once per distinct public-form list. Wavy underlines use existing
syntax indicator tokens; hover tooltips use the DS Tooltip surface. No lint
gutter or panel.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: JSON pointers + JSON Schema validate/complete/hover

Spec §7.13 and D8. `json-schema-library` is loaded only through `engine/schema/loadSchema.ts` with a cached `import()`. Every other schema module imports only types, and gets them from `loadSchema.ts`. A throwaway copy (Task 4 languages, Task 5 engine and a stub of the Task 12 diagnostics signature) was typechecked with `tsc` 7.0.2, linted with biome 2.5.7, and run with vitest 4.1.10 on the installed CodeMirror/Lezer versions: 44/44 tests passed.

Checked facts about `json-schema-library@11.6.2`:
- `compileSchema(schema)` returns a `SchemaNode`. `node.validate(data)` returns `{ valid, errors: JsonError[] }`.
- `error.data.pointer` looks like `'#'` or `'#/tags/0/id'` and is **not** RFC 6901-escaped (a key `a/b` comes back as `#/a/b`).
- Useful error codes: `required-property-error` points at the object, `no-additional-properties-error` points at `#/…/<key>`, `type-error`, `enum-error`.
- `node.getNode('/a~1b', data)` does unescape, and accepts `''` for the root. It returns `{ node }`, where `node` is `undefined` for unknown paths.
- `node.getNodeChild(name).node` resolves `$ref`.
- `node.properties`, `node.required` and `node.schema.{type, enum, const, title, description}` are all available.

**Files:**
- Create: `src/components/CodeEditor/engine/languages/jsonPointers.ts`
- Create: `src/components/CodeEditor/engine/schema/loadSchema.ts`
- Create: `src/components/CodeEditor/engine/schema/validate.ts`
- Create: `src/components/CodeEditor/engine/schema/complete.ts`
- Create: `src/components/CodeEditor/engine/schema/hover.ts`
- Modify: `src/components/CodeEditor/engine/diagnostics.ts` (Task 12: add schema diagnostics to the linter source)
- Modify: `src/components/CodeEditor/engine/index.ts` (the `diagnostics` entry of `featureExtensions` also mounts `schemaHover`)
- Test: `src/components/CodeEditor/engine/languages/jsonPointers.test.ts`
- Test: `src/components/CodeEditor/engine/schema/loadSchema.test.ts`
- Test: `src/components/CodeEditor/engine/schema/validate.test.ts`
- Test: `src/components/CodeEditor/engine/schema/complete.test.ts`
- Test: `src/components/CodeEditor/engine/schema/hover.test.ts`
- Test: `src/components/CodeEditor/engine/schema/schemaIntegration.test.ts`

**Interfaces:**

Consumes:
- From Task 3: `JsonSchema` from `../../types`, the `json-schema-library@11.6.2` dependency, and `mountEngine` / `unmountAllEngines` from `src/testUtils/codeEditorEngine.ts` (the Task 5 test util).
- From Task 4 (`engine/languages/http/index.ts` and `engine/languages/json.ts`):
  - `http(): LanguageSupport` and `findJsonBodyRange(state): { from: number; to: number } | null`, which gives the range of the mounted `JsonText` node.
  - `json(): LanguageSupport`.
- From Task 5 (`engine/index.ts`): `featureExtensions(options, callbacks)` with a `diagnostics` slot. Its `SLOT_DEPS.diagnostics` is `['language', 'schema', 'diagnostics', 'startingLineNumber']`, so it already includes `schema`.
- From Task 12 (`engine/diagnostics.ts`): `diagnosticsExtension(config)` and `jsonRegion(state, language)`.

Produces (the Shared Interfaces signatures, exactly as given):
```ts
// engine/languages/jsonPointers.ts
export interface JsonPointerEntry { pointer: string; keyFrom?: number; keyTo?: number; valueFrom: number; valueTo: number; }
export const getJsonPointers: (state: EditorState, region: { from: number; to: number }) => Map<string, JsonPointerEntry>;
export const pointerAt: (state: EditorState, pos: number, region: { from: number; to: number }) => string | undefined;
// engine/schema/*
export const loadSchemaLibrary: () => Promise<typeof import('json-schema-library')>;
export const validateAgainstSchema: (state: EditorState, region: { from: number; to: number }, schema: JsonSchema) => Promise<Diagnostic[]>;
export const schemaCompletionSource: (getSchema: () => JsonSchema | undefined, getRegion: (state: EditorState) => { from: number; to: number } | null) => CompletionSource;
export const schemaHover: (getSchema: () => JsonSchema | undefined, getRegion: (state: EditorState) => { from: number; to: number } | null) => Extension;
```
Extra exports. They are used only inside `engine/` and are not public:
```ts
// jsonPointers.ts
export const escapePointerSegment: (segment: string) => string;              // RFC 6901
export const readJsonKey: (state: EditorState, node: SyntaxNode) => string;  // decoded PropertyName text
export const findJsonText: (state: EditorState, region: { from: number; to: number }) => SyntaxNode | null;
// loadSchema.ts
export type { JsonError, JsonSchema as LibraryJsonSchema, SchemaNode } from 'json-schema-library';
export const getCompiledSchema: (schema: JsonSchema) => Promise<SchemaNode>; // cached per identity (WeakMap / boolean Map)
export const parseJson: (text: string) => { ok: true; value: unknown } | { ok: false };
// hover.ts
export const schemaHoverSource: (getSchema, getRegion) => HoverTooltipSource;
```
Handoff to Task 14: `completionExtension` registers `schemaCompletionSource(() => config.schema, state => jsonRegion(state, config.language))` when `config.schema !== undefined`. `buildCompletionContext` fills `jsonPointer` using `pointerAt(state, pos, region)`. This task does not touch the `completion` slot.

---

- [ ] **Step 1: Write the failing JSON pointer tests**

Create `src/components/CodeEditor/engine/languages/jsonPointers.test.ts`:
```ts
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { findJsonBodyRange, http } from './http';
import { json } from './json';
import { getJsonPointers, pointerAt } from './jsonPointers';

const jsonState = (doc: string) => EditorState.create({ doc, extensions: [json()] });
const httpState = (doc: string) => EditorState.create({ doc, extensions: [http()] });
const whole = (state: EditorState) => ({ from: 0, to: state.doc.length });
const text = (state: EditorState, from: number | undefined, to: number | undefined) =>
  state.sliceDoc(from, to);

describe('getJsonPointers', () => {
  it('builds pointers for nested objects and arrays', () => {
    const state = jsonState('{"a": {"b": [1, {"c": true}]}, "d": null}');
    const pointers = getJsonPointers(state, whole(state));

    expect([...pointers.keys()]).toEqual(['', '/a', '/a/b', '/a/b/0', '/a/b/1', '/a/b/1/c', '/d']);
    const c = pointers.get('/a/b/1/c');
    expect(text(state, c?.keyFrom, c?.keyTo)).toBe('"c"');
    expect(text(state, c?.valueFrom, c?.valueTo)).toBe('true');
    const item = pointers.get('/a/b/0');
    expect(item?.keyFrom).toBeUndefined();
    expect(text(state, item?.valueFrom, item?.valueTo)).toBe('1');
    const root = pointers.get('');
    expect(root).toEqual({ pointer: '', valueFrom: 0, valueTo: state.doc.length });
  });

  it('escapes "~" and "/" in keys (RFC 6901)', () => {
    const state = jsonState('{"a/b": 1, "m~n": 2, "\\u0041": 3}');
    expect([...getJsonPointers(state, whole(state)).keys()]).toEqual(['', '/a~1b', '/m~0n', '/A']);
  });

  it('skips members that have no value yet', () => {
    const state = jsonState('{"a": 1, "b": }');
    expect([...getJsonPointers(state, whole(state)).keys()]).toEqual(['', '/a']);
  });

  it('returns an empty map for a region without JSON', () => {
    const state = jsonState('');
    expect(getJsonPointers(state, whole(state)).size).toBe(0);
  });

  it('uses absolute offsets inside an HTTP JSON body', () => {
    const head = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n';
    const state = httpState(`${head}{"name": 1, "tags": ["x"]}`);
    const region = findJsonBodyRange(state);
    expect(region).toEqual({ from: head.length, to: state.doc.length });
    if (!region) return;

    const pointers = getJsonPointers(state, region);
    expect([...pointers.keys()]).toEqual(['', '/name', '/tags', '/tags/0']);
    const name = pointers.get('/name');
    expect(name?.keyFrom).toBe(head.length + 1);
    expect(text(state, name?.keyFrom, name?.keyTo)).toBe('"name"');
    expect(text(state, name?.valueFrom, name?.valueTo)).toBe('1');
    const tag = pointers.get('/tags/0');
    expect(text(state, tag?.valueFrom, tag?.valueTo)).toBe('"x"');
  });
});

describe('pointerAt', () => {
  const doc = '{"a": {"b": [10, 20]}, "c": "x"}';
  const state = jsonState(doc);

  it('returns the innermost value under the position', () => {
    expect(pointerAt(state, doc.indexOf('20') + 1, whole(state))).toBe('/a/b/1');
    expect(pointerAt(state, doc.indexOf('"x"') + 1, whole(state))).toBe('/c');
  });

  it('maps a key to its member', () => {
    expect(pointerAt(state, doc.indexOf('"b"') + 1, whole(state))).toBe('/a/b');
  });

  it('returns the enclosing container between members', () => {
    expect(pointerAt(state, doc.indexOf(', "c"') + 1, whole(state))).toBe('');
  });

  it('is undefined outside the JSON value', () => {
    const padded = jsonState('  {"a": 1}');
    expect(pointerAt(padded, 0, whole(padded))).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/components/CodeEditor/engine/languages/jsonPointers.test.ts`
Expected: FAIL, `Failed to resolve import "./jsonPointers"`.

- [ ] **Step 3: Implement `jsonPointers.ts`**

Create `src/components/CodeEditor/engine/languages/jsonPointers.ts`:
```ts
import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import type { SyntaxNode } from '@lezer/common';

/** Absolute document offsets of one JSON value (and of its key, for object members). */
export interface JsonPointerEntry {
  pointer: string;
  keyFrom?: number;
  keyTo?: number;
  valueFrom: number;
  valueTo: number;
}

interface JsonRegion {
  from: number;
  to: number;
}

/** Lezer JSON node names that are complete values (error nodes `⚠` are not). */
const VALUE_NODE_NAMES: ReadonlySet<string> = new Set([
  'Object',
  'Array',
  'String',
  'Number',
  'True',
  'False',
  'Null',
]);

/** Upper bound for the parse work a pointer lookup may force, in ms. */
const ENSURE_TREE_TIMEOUT = 200;

/** RFC 6901 reference-token escaping: `~` → `~0`, `/` → `~1`. */
export const escapePointerSegment = (segment: string): string =>
  segment.replaceAll('~', '~0').replaceAll('/', '~1');

const isValueNode = (node: SyntaxNode): boolean => VALUE_NODE_NAMES.has(node.name);

/** Decoded text of a `PropertyName` / `String` node; the raw inner text when it is not valid JSON. */
export const readJsonKey = (state: EditorState, node: SyntaxNode): string => {
  const raw = state.sliceDoc(node.from, node.to);
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
  } catch {
    // Unfinished escape sequence — fall through to the raw inner text.
  }
  return raw.slice(1, raw.endsWith('"') && raw.length > 1 ? -1 : undefined);
};

/**
 * The `JsonText` node of the region: the whole tree for `json`, the `parseMixed`
 * mount for an `http` body. `null` when the region holds no JSON tree.
 */
export const findJsonText = (state: EditorState, region: JsonRegion): SyntaxNode | null => {
  const tree = ensureSyntaxTree(state, region.to, ENSURE_TREE_TIMEOUT) ?? syntaxTree(state);
  for (let node: SyntaxNode | null = tree.resolveInner(region.from, 1); node; node = node.parent) {
    if (node.name === 'JsonText') return node;
  }
  return null;
};

/** The first complete value child of a node (the root value of `JsonText`, a member's value). */
const firstValueChild = (node: SyntaxNode): SyntaxNode | null => {
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (isValueNode(child)) return child;
  }
  return null;
};

const collect = (
  state: EditorState,
  value: SyntaxNode,
  pointer: string,
  key: SyntaxNode | null,
  out: Map<string, JsonPointerEntry>,
): void => {
  const entry: JsonPointerEntry = { pointer, valueFrom: value.from, valueTo: value.to };
  if (key) {
    entry.keyFrom = key.from;
    entry.keyTo = key.to;
  }
  // Duplicate keys: the last one wins, like JSON.parse.
  out.set(pointer, entry);

  if (value.name === 'Object') {
    for (const property of value.getChildren('Property')) {
      const name = property.getChild('PropertyName');
      const member = firstValueChild(property);
      if (!name || !member) continue;
      const segment = escapePointerSegment(readJsonKey(state, name));
      collect(state, member, `${pointer}/${segment}`, name, out);
    }
    return;
  }
  if (value.name === 'Array') {
    let index = 0;
    for (let child = value.firstChild; child; child = child.nextSibling) {
      if (!isValueNode(child)) continue;
      collect(state, child, `${pointer}/${index}`, null, out);
      index++;
    }
  }
};

/**
 * RFC 6901 pointer (`''` = root, `/a/0/b`, `~0`/`~1` escaped) → absolute key/value ranges,
 * built from the Lezer JSON tree inside `region`. Unfinished members (no value yet) are skipped.
 */
export const getJsonPointers = (
  state: EditorState,
  region: JsonRegion,
): Map<string, JsonPointerEntry> => {
  const out = new Map<string, JsonPointerEntry>();
  const jsonText = findJsonText(state, region);
  const root = jsonText ? firstValueChild(jsonText) : null;
  if (root) collect(state, root, '', null, out);
  return out;
};

/**
 * Pointer of the innermost key or value that contains `pos` (a key counts as its member).
 * `undefined` outside the JSON value.
 */
export const pointerAt = (
  state: EditorState,
  pos: number,
  region: JsonRegion,
): string | undefined => {
  let best: string | undefined;
  let bestSize = Number.POSITIVE_INFINITY;
  for (const entry of getJsonPointers(state, region).values()) {
    const ranges: [number, number][] = [[entry.valueFrom, entry.valueTo]];
    if (entry.keyFrom !== undefined && entry.keyTo !== undefined) {
      ranges.push([entry.keyFrom, entry.keyTo]);
    }
    for (const [from, to] of ranges) {
      if (pos < from || pos > to || to - from >= bestSize) continue;
      best = entry.pointer;
      bestSize = to - from;
    }
  }
  return best;
};
```

- [ ] **Step 4: Run the tests and watch them pass**

Run: `pnpm vitest run src/components/CodeEditor/engine/languages/jsonPointers.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/CodeEditor/engine/languages/jsonPointers.ts src/components/CodeEditor/engine/languages/jsonPointers.test.ts
git commit -m "feat(code-editor): add JSON pointer map for json documents and http bodies

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Write the failing `loadSchema` tests**

Create `src/components/CodeEditor/engine/schema/loadSchema.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getCompiledSchema, loadSchemaLibrary, parseJson } from './loadSchema';

describe('loadSchemaLibrary', () => {
  it('caches the import promise', async () => {
    const first = loadSchemaLibrary();
    expect(loadSchemaLibrary()).toBe(first);
    const library = await first;
    expect(typeof library.compileSchema).toBe('function');
    expect(loadSchemaLibrary()).toBe(first);
  });
});

describe('getCompiledSchema', () => {
  it('compiles once per schema object identity', async () => {
    const schema = { type: 'string' };
    const node = await getCompiledSchema(schema);
    expect(await getCompiledSchema(schema)).toBe(node);
    expect(await getCompiledSchema({ type: 'string' })).not.toBe(node);
    expect(node.validate('ok').valid).toBe(true);
    expect(node.validate(1).valid).toBe(false);
  });

  it('supports boolean schemas', async () => {
    expect((await getCompiledSchema(true)).validate(1).valid).toBe(true);
    expect((await getCompiledSchema(false)).validate(1).valid).toBe(false);
    expect(await getCompiledSchema(false)).toBe(await getCompiledSchema(false));
  });
});

describe('parseJson', () => {
  it('never throws', () => {
    expect(parseJson('{"a": 1}')).toEqual({ ok: true, value: { a: 1 } });
    expect(parseJson('{"a": ')).toEqual({ ok: false });
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/loadSchema.test.ts`
Expected: FAIL, `Failed to resolve import "./loadSchema"`.

- [ ] **Step 7: Implement `loadSchema.ts`**

Create `src/components/CodeEditor/engine/schema/loadSchema.ts`:
```ts
import type { SchemaNode } from 'json-schema-library';
import type { JsonSchema } from '../../types';

/** Library types for the other schema modules, so this file stays the single import site. */
export type {
  JsonError,
  JsonSchema as LibraryJsonSchema,
  SchemaNode,
} from 'json-schema-library';

type SchemaLibrary = typeof import('json-schema-library');

let libraryPromise: Promise<SchemaLibrary> | null = null;

/**
 * The only place `json-schema-library` is imported (spec D8): a separate chunk that
 * loads on first use. The promise is cached; a failed load is retried on the next call.
 */
export const loadSchemaLibrary = (): Promise<SchemaLibrary> => {
  libraryPromise ??= import('json-schema-library').catch((error: unknown) => {
    libraryPromise = null;
    throw error;
  });
  return libraryPromise;
};

/** Compiled nodes per schema object identity (a new object → a recompile). */
const compiledObjects = new WeakMap<object, SchemaNode>();
const compiledBooleans = new Map<boolean, SchemaNode>();

/** `compileSchema(schema)` from the lazily loaded library, cached per schema identity. */
export const getCompiledSchema = async (schema: JsonSchema): Promise<SchemaNode> => {
  const cached =
    typeof schema === 'boolean' ? compiledBooleans.get(schema) : compiledObjects.get(schema);
  if (cached) return cached;
  const { compileSchema } = await loadSchemaLibrary();
  const node = compileSchema(schema);
  if (typeof schema === 'boolean') compiledBooleans.set(schema, node);
  else compiledObjects.set(schema, node);
  return node;
};

/** `JSON.parse` without throwing: `{ ok: false }` for invalid JSON. */
export const parseJson = (text: string): { ok: true; value: unknown } | { ok: false } => {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
};
```

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/loadSchema.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 8: Write the failing validation tests**

Create `src/components/CodeEditor/engine/schema/validate.test.ts`:
```ts
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { findJsonBodyRange, http } from '../languages/http';
import { json } from '../languages/json';
import { validateAgainstSchema } from './validate';

const schema = {
  type: 'object',
  required: ['name', 'mode'],
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    mode: { enum: ['block', 'monitor'] },
    tags: { type: 'array', items: { type: 'string' } },
    'a/b': { type: 'number' },
  },
};

const jsonState = (doc: string) => EditorState.create({ doc, extensions: [json()] });
const whole = (state: EditorState) => ({ from: 0, to: state.doc.length });
const marked = (state: EditorState, d: { from: number; to: number }) =>
  state.sliceDoc(d.from, d.to);

describe('validateAgainstSchema', () => {
  it('maps a wrong type to the value range', async () => {
    const state = jsonState('{"name": 5, "mode": "block"}');
    const diagnostics = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({ severity: 'error', source: 'schema' });
    expect(diagnostics[0]?.message).toContain('string');
    expect(marked(state, diagnostics[0] ?? { from: 0, to: 0 })).toBe('5');
  });

  it('maps a missing required property to the object start', async () => {
    const state = jsonState('  {"name": "x"}');
    const [diagnostic] = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostic).toMatchObject({ from: 2, to: 3, source: 'schema' });
    expect(diagnostic?.message).toContain('mode');
  });

  it('maps nested errors and keys with "/" to their values', async () => {
    const state = jsonState('{"name": "x", "mode": "block", "tags": ["ok", 7], "a/b": "no"}');
    const diagnostics = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostics.map(d => marked(state, d))).toEqual(['7', '"no"']);
  });

  it('marks the key of a property the schema does not allow', async () => {
    const state = jsonState('{"name": "x", "mode": "block", "extra": 1}');
    const diagnostics = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostics.map(d => marked(state, d))).toEqual(['"extra"']);
  });

  it('maps a root type error to the whole value', async () => {
    const state = jsonState('[1]');
    const [diagnostic] = await validateAgainstSchema(state, whole(state), schema);

    expect(diagnostic).toMatchObject({ from: 0, to: 3 });
  });

  it('returns nothing for valid data', async () => {
    const state = jsonState('{"name": "x", "mode": "monitor"}');
    expect(await validateAgainstSchema(state, whole(state), schema)).toEqual([]);
  });

  it('skips syntactically invalid JSON (syntax errors come from the syntax source)', async () => {
    const state = jsonState('{"name": 5,');
    expect(await validateAgainstSchema(state, whole(state), schema)).toEqual([]);
  });

  it('validates an HTTP JSON body with absolute offsets', async () => {
    const head = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n';
    const state = EditorState.create({
      doc: `${head}{"name": 5, "mode": "block"}`,
      extensions: [http()],
    });
    const region = findJsonBodyRange(state);
    expect(region).not.toBeNull();
    if (!region) return;

    const [diagnostic] = await validateAgainstSchema(state, region, schema);
    expect(diagnostic?.from).toBe(head.length + '{"name": '.length);
    expect(diagnostic && marked(state, diagnostic)).toBe('5');
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/validate.test.ts`
Expected: FAIL, `Failed to resolve import "./validate"`.

- [ ] **Step 9: Implement `validate.ts`**

Create `src/components/CodeEditor/engine/schema/validate.ts`:
```ts
import type { Diagnostic } from '@codemirror/lint';
import type { EditorState } from '@codemirror/state';
import type { JsonSchema } from '../../types';
import { getJsonPointers, type JsonPointerEntry } from '../languages/jsonPointers';
import { getCompiledSchema, type JsonError, parseJson } from './loadSchema';

interface JsonRegion {
  from: number;
  to: number;
}

const REQUIRED_ERROR = 'required-property-error';
const ADDITIONAL_PROPERTY_ERROR = 'no-additional-properties-error';

/** `json-schema-library` reports `#`, `#/a/b` — without RFC 6901 escaping. */
const normalizeLibraryPointer = (pointer: string): string =>
  pointer.startsWith('#') ? pointer.slice(1) : pointer;

const unescapeSegment = (segment: string): string =>
  segment.replaceAll('~1', '/').replaceAll('~0', '~');

/** `/a~1b` → `/a/b`: the (ambiguous) form the library uses in error pointers. */
const toUnescapedPointer = (pointer: string): string =>
  pointer.split('/').map(unescapeSegment).join('/');

const parentPointer = (pointer: string): string | null => {
  const slash = pointer.lastIndexOf('/');
  return slash < 0 ? null : pointer.slice(0, slash);
};

const findEntry = (
  pointers: Map<string, JsonPointerEntry>,
  unescaped: Map<string, JsonPointerEntry>,
  libraryPointer: string,
): JsonPointerEntry | undefined => {
  // Walk up to the nearest ancestor that exists in the document.
  for (
    let pointer: string | null = normalizeLibraryPointer(libraryPointer);
    pointer !== null;
    pointer = parentPointer(pointer)
  ) {
    const entry = pointers.get(pointer) ?? unescaped.get(pointer);
    if (entry) return entry;
  }
  return undefined;
};

const rangeFor = (
  error: JsonError,
  entry: JsonPointerEntry | undefined,
  region: JsonRegion,
): { from: number; to: number } => {
  if (!entry) return { from: region.from, to: Math.min(region.from + 1, region.to) };
  // A missing required property is reported on the object: mark its opening brace.
  if (error.code === REQUIRED_ERROR) return { from: entry.valueFrom, to: entry.valueFrom + 1 };
  // A forbidden property: mark its key.
  if (
    error.code === ADDITIONAL_PROPERTY_ERROR &&
    entry.keyFrom !== undefined &&
    entry.keyTo !== undefined
  ) {
    return { from: entry.keyFrom, to: entry.keyTo };
  }
  if (entry.valueTo > entry.valueFrom) return { from: entry.valueFrom, to: entry.valueTo };
  if (entry.keyFrom !== undefined && entry.keyTo !== undefined) {
    return { from: entry.keyFrom, to: entry.keyTo };
  }
  return { from: region.from, to: Math.min(region.from + 1, region.to) };
};

/**
 * JSON Schema errors for the JSON in `region` (spec §7.13). Returns `[]` when the slice
 * is not valid JSON — syntax errors are reported by the syntax source (Task 12).
 */
export const validateAgainstSchema = async (
  state: EditorState,
  region: JsonRegion,
  schema: JsonSchema,
): Promise<Diagnostic[]> => {
  const parsed = parseJson(state.sliceDoc(region.from, region.to));
  if (!parsed.ok) return [];
  const node = await getCompiledSchema(schema);
  const { errors } = node.validate(parsed.value);
  if (errors.length === 0) return [];

  const pointers = getJsonPointers(state, region);
  const unescaped = new Map<string, JsonPointerEntry>();
  for (const [pointer, entry] of pointers) {
    const key = toUnescapedPointer(pointer);
    if (!unescaped.has(key)) unescaped.set(key, entry);
  }

  return errors.map(error => {
    const { from, to } = rangeFor(
      error,
      findEntry(pointers, unescaped, error.data.pointer),
      region,
    );
    return { from, to, severity: 'error', source: 'schema', message: error.message };
  });
};
```

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/validate.test.ts src/components/CodeEditor/engine/schema/loadSchema.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 10: Commit**

```bash
git add src/components/CodeEditor/engine/schema/loadSchema.ts src/components/CodeEditor/engine/schema/loadSchema.test.ts src/components/CodeEditor/engine/schema/validate.ts src/components/CodeEditor/engine/schema/validate.test.ts
git commit -m "feat(code-editor): validate JSON against a schema with lazy json-schema-library

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 11: Write the failing completion tests**

Create `src/components/CodeEditor/engine/schema/complete.test.ts`:
```ts
import {
  type Completion,
  CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import type { JsonSchema } from '../../types';
import { findJsonBodyRange, http } from '../languages/http';
import { json } from '../languages/json';
import { schemaCompletionSource } from './complete';

const schema: JsonSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', description: 'Rule name' },
    mode: { enum: ['block', 'monitor'] },
    enabled: { type: 'boolean' },
    kind: { const: 'rule' },
    meta: { type: 'object', properties: { owner: { type: 'string' } } },
    tags: { type: 'array', items: { enum: ['a', 'b'] } },
  },
};

const wholeDoc = (state: EditorState) => ({ from: 0, to: state.doc.length });
const jsonSource = schemaCompletionSource(() => schema, wholeDoc);

/** `|` marks the cursor. */
const setup = (docWithCursor: string, extensions = [json()]) => {
  const pos = docWithCursor.indexOf('|');
  const doc = docWithCursor.replace('|', '');
  return { state: EditorState.create({ doc, extensions }), pos };
};

const complete = async (docWithCursor: string, explicit = false) => {
  const { state, pos } = setup(docWithCursor);
  return jsonSource(new CompletionContext(state, pos, explicit));
};

const labels = (result: CompletionResult | null) => result?.options.map(o => o.label) ?? null;

const views: EditorView[] = [];
afterEach(() => {
  for (const view of views.splice(0)) view.destroy();
});

/** Applies `option` the way the autocomplete UI does and returns the new document. */
const accept = (docWithCursor: string, result: CompletionResult | null, label: string) => {
  const { state, pos } = setup(docWithCursor);
  const view = new EditorView({ state: state.update({ selection: { anchor: pos } }).state });
  views.push(view);
  const option = result?.options.find(o => o.label === label) as Completion;
  const apply = option.apply ?? option.label;
  const from = result?.from ?? pos;
  if (typeof apply === 'string') {
    view.dispatch({ changes: { from, to: pos, insert: apply } });
  } else {
    apply(view, option, from, pos);
  }
  return view.state.doc.toString();
};

describe('schemaCompletionSource — property names', () => {
  it('suggests the properties that are not present yet', async () => {
    const result = await complete('{"name": "x", "|"}');
    expect(labels(result)).toEqual(['mode', 'enabled', 'kind', 'meta', 'tags']);
  });

  it('marks required properties and uses description as info', async () => {
    const result = await complete('{"|"}');
    const name = result?.options.find(o => o.label === 'name');
    expect(name).toMatchObject({
      detail: 'string (required)',
      info: 'Rule name',
      type: 'property',
    });
    expect(result?.options.find(o => o.label === 'mode')?.detail).toBe('enum');
  });

  it('inserts the quoted key and ": " inside an auto-closed string', async () => {
    const doc = '{"na|"}';
    const result = await complete(doc);
    expect(result?.from).toBe(2);
    expect(accept(doc, result, 'name')).toBe('{"name": }');
  });

  it('does not add a second colon', async () => {
    const doc = '{"mo|": "block"}';
    expect(accept(doc, await complete(doc), 'mode')).toBe('{"mode": "block"}');
  });

  it('completes an unquoted word into a quoted key', async () => {
    const doc = '{"name": "x", en|}';
    expect(accept(doc, await complete(doc), 'enabled')).toBe('{"name": "x", "enabled": }');
  });

  it('needs an explicit request when nothing is typed', async () => {
    expect(await complete('{|}')).toBeNull();
    expect(labels(await complete('{|}', true))).toContain('name');
  });

  it('completes nested objects from the nested schema', async () => {
    expect(labels(await complete('{"meta": {"|"}}'))).toEqual(['owner']);
  });
});

describe('schemaCompletionSource — values', () => {
  it('suggests enum values', async () => {
    const doc = '{"mode": "|"}';
    const result = await complete(doc);
    expect(labels(result)).toEqual(['"block"', '"monitor"']);
    expect(accept(doc, result, '"monitor"')).toBe('{"mode": "monitor"}');
  });

  it('suggests booleans and const values', async () => {
    expect(labels(await complete('{"enabled": t|}'))).toEqual(['true', 'false']);
    expect(labels(await complete('{"kind": |}', true))).toEqual(['"rule"']);
  });

  it('suggests enum values for array items', async () => {
    expect(labels(await complete('{"tags": ["a", "|"]}'))).toEqual(['"a"', '"b"']);
  });

  it('returns null where the schema has nothing to offer', async () => {
    expect(await complete('{"name": "|"}')).toBeNull();
    expect(await complete('{"unknown": {"|"}}')).toBeNull();
  });
});

describe('schemaCompletionSource — scope', () => {
  it('works inside an HTTP JSON body', async () => {
    const doc = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n{"name": "x", "|"}';
    const { state, pos } = setup(doc, [http()]);
    const source = schemaCompletionSource(() => schema, findJsonBodyRange);
    const result = await source(new CompletionContext(state, pos, false));
    expect(labels(result)).toEqual(['mode', 'enabled', 'kind', 'meta', 'tags']);
  });

  it('stays silent outside the region and without a schema', async () => {
    const doc = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n{}';
    const { state } = setup(doc, [http()]);
    const source = schemaCompletionSource(() => schema, findJsonBodyRange);
    expect(await source(new CompletionContext(state, 5, true))).toBeNull();

    const noSchema = schemaCompletionSource(() => undefined, wholeDoc);
    const { state: jsonDoc, pos } = setup('{"|"}');
    expect(await noSchema(new CompletionContext(jsonDoc, pos, true))).toBeNull();
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/complete.test.ts`
Expected: FAIL, `Failed to resolve import "./complete"`.

- [ ] **Step 12: Implement `complete.ts`**

How it works:
- While the user is typing, the Lezer JSON tree is mostly `⚠` error nodes. For example `{"na` parses as `Object("{",⚠)` and `{"mode": }` as `Property(PropertyName,":",⚠)`. So the token under the cursor is found by scanning text; JSON strings never span lines.
- Key vs value position comes from the punctuation before the token: `{` or `,` means a key, `:` means a value, and `[` or `,` inside an array means an item. Those punctuation nodes are always direct children of `Object`/`Array`/`Property`, so the tree gives the container reliably.
- CodeMirror filters options on `sliceDoc(result.from, result.to)`, so `to` stays at the cursor. Text after the cursor that must be replaced (for example the closing `"` added by `closeBrackets`) goes through a function `apply` that uses `insertCompletionText` + `pickedCompletion`.

Create `src/components/CodeEditor/engine/schema/complete.ts`:
```ts
import {
  type Completion,
  type CompletionContext,
  type CompletionResult,
  type CompletionSource,
  insertCompletionText,
  pickedCompletion,
} from '@codemirror/autocomplete';
import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';
import type { JsonSchema } from '../../types';
import { escapePointerSegment, getJsonPointers, readJsonKey } from '../languages/jsonPointers';
import {
  getCompiledSchema,
  type LibraryJsonSchema,
  parseJson,
  type SchemaNode,
} from './loadSchema';

interface JsonRegion {
  from: number;
  to: number;
}

/** The text the cursor is in: an (possibly unterminated) string literal, or a bare word. */
interface CursorToken {
  from: number;
  to: number;
  kind: 'string' | 'word';
  closed: boolean;
}

type CompletionTarget =
  | { role: 'key'; container: SyntaxNode }
  | { role: 'value'; container: SyntaxNode; key: string | number };

const WORD_BEFORE = /[\w$.+-]*$/;
const WORD_AFTER = /^[\w$.+-]*/;
const WHITESPACE = /\s/;
const ENSURE_TREE_TIMEOUT = 200;

/** JSON strings cannot span lines, so a scan from the line start tells whether `pos` is inside one. */
const tokenAt = (state: EditorState, pos: number, region: JsonRegion): CursorToken => {
  const line = state.doc.lineAt(pos);
  const start = Math.max(line.from, region.from);
  const end = Math.min(line.to, region.to);
  const before = state.sliceDoc(start, pos);
  const after = state.sliceDoc(pos, end);

  let stringStart = -1;
  for (let i = 0; i < before.length; i++) {
    const ch = before[i];
    if (stringStart < 0) {
      if (ch === '"') stringStart = i;
    } else if (ch === '\\') {
      i++;
    } else if (ch === '"') {
      stringStart = -1;
    }
  }
  if (stringStart >= 0) {
    for (let i = 0; i < after.length; i++) {
      if (after[i] === '\\') {
        i++;
      } else if (after[i] === '"') {
        return { from: start + stringStart, to: pos + i + 1, kind: 'string', closed: true };
      }
    }
    return { from: start + stringStart, to: pos, kind: 'string', closed: false };
  }
  const wordBefore = WORD_BEFORE.exec(before)?.[0] ?? '';
  const wordAfter = WORD_AFTER.exec(after)?.[0] ?? '';
  return { from: pos - wordBefore.length, to: pos + wordAfter.length, kind: 'word', closed: false };
};

/** Nearest non-whitespace character before `pos` (backwards) or from `pos` (forwards). */
const significantChar = (
  state: EditorState,
  pos: number,
  region: JsonRegion,
  direction: -1 | 1,
): { ch: string; pos: number } | null => {
  for (let p = direction < 0 ? pos - 1 : pos; p >= region.from && p < region.to; p += direction) {
    const ch = state.sliceDoc(p, p + 1);
    if (!WHITESPACE.test(ch)) return { ch, pos: p };
  }
  return null;
};

const ancestor = (node: SyntaxNode | null, names: readonly string[]): SyntaxNode | null => {
  for (let current = node; current; current = current.parent) {
    if (names.includes(current.name)) return current;
    if (current.name === 'JsonText') return null;
  }
  return null;
};

const VALUE_NODE_NAMES: readonly string[] = [
  'Object',
  'Array',
  'String',
  'Number',
  'True',
  'False',
  'Null',
];

/** Decides key vs value position from the punctuation before the token and the syntax tree. */
const targetAt = (
  state: EditorState,
  token: CursorToken,
  region: JsonRegion,
): CompletionTarget | null => {
  const previous = significantChar(state, token.from, region, -1);
  if (!previous) return null;
  const tree = ensureSyntaxTree(state, token.to, ENSURE_TREE_TIMEOUT) ?? syntaxTree(state);
  const punctuation = tree.resolveInner(previous.pos + 1, -1);

  if (previous.ch === ':') {
    const property = ancestor(punctuation, ['Property']);
    const name = property?.getChild('PropertyName');
    const container = property?.parent;
    if (!name || !container || container.name !== 'Object') return null;
    return { role: 'value', container, key: readJsonKey(state, name) };
  }
  if (previous.ch !== '{' && previous.ch !== '[' && previous.ch !== ',') return null;
  const container = ancestor(punctuation, ['Object', 'Array']);
  if (!container) return null;
  if (container.name === 'Object') return previous.ch === '[' ? null : { role: 'key', container };
  if (previous.ch === '{') return null;
  let index = 0;
  for (let child = container.firstChild; child; child = child.nextSibling) {
    if (VALUE_NODE_NAMES.includes(child.name) && child.to <= token.from) index++;
  }
  return { role: 'value', container, key: index };
};

/** A completion that also replaces `tail` characters after the cursor (e.g. the closing quote). */
const applyText = (text: string, tail: number): Completion['apply'] =>
  tail === 0
    ? text
    : (view: EditorView, completion: Completion, from: number, to: number) => {
        view.dispatch({
          ...insertCompletionText(view.state, text, from, to + tail),
          annotations: pickedCompletion.of(completion),
        });
      };

const typeLabel = (schema: LibraryJsonSchema): string => {
  const type: unknown = schema.type;
  if (typeof type === 'string') return type;
  if (Array.isArray(type)) return type.filter(item => typeof item === 'string').join(' | ');
  if (Array.isArray(schema.enum)) return 'enum';
  if ('const' in schema) return 'const';
  return '';
};

const hasType = (schema: LibraryJsonSchema, name: string): boolean => {
  const type: unknown = schema.type;
  return type === name || (Array.isArray(type) && type.includes(name));
};

const stringOrUndefined = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined;

const presentKeys = (state: EditorState, object: SyntaxNode, editing: CursorToken): Set<string> => {
  const keys = new Set<string>();
  for (const property of object.getChildren('Property')) {
    const name = property.getChild('PropertyName');
    if (name && name.from !== editing.from) keys.add(readJsonKey(state, name));
  }
  return keys;
};

const propertyOptions = (
  node: SchemaNode,
  present: ReadonlySet<string>,
  render: (name: string) => Completion['apply'],
): Completion[] => {
  const required = new Set(node.required ?? []);
  const options: Completion[] = [];
  for (const [name, child] of Object.entries(node.properties ?? {})) {
    if (present.has(name)) continue;
    const schema = (node.getNodeChild(name).node ?? child).schema;
    const type = typeLabel(schema);
    const isRequired = required.has(name);
    options.push({
      label: name,
      apply: render(name),
      type: 'property',
      detail: isRequired ? (type ? `${type} (required)` : 'required') : type || undefined,
      info: stringOrUndefined(schema.description),
      boost: isRequired ? 1 : 0,
    });
  }
  return options;
};

const valueOptions = (node: SchemaNode, tail: number): Completion[] => {
  const { schema } = node;
  const values: unknown[] = [];
  if (Array.isArray(schema.enum)) values.push(...schema.enum);
  if ('const' in schema) values.push(schema.const);
  if (hasType(schema, 'boolean')) values.push(true, false);
  const seen = new Set<string>();
  const options: Completion[] = [];
  for (const value of values) {
    const text = JSON.stringify(value);
    if (text === undefined || seen.has(text)) continue;
    seen.add(text);
    options.push({
      label: text,
      apply: applyText(text, tail),
      type: 'value',
      info: stringOrUndefined(schema.description),
    });
  }
  return options;
};

/**
 * JSON Schema completions for the JSON region (spec §7.13): missing property names in key
 * position, `enum` / `const` / boolean values in value position. Registered by Task 14.
 */
export const schemaCompletionSource =
  (
    getSchema: () => JsonSchema | undefined,
    getRegion: (state: EditorState) => { from: number; to: number } | null,
  ): CompletionSource =>
  async (context: CompletionContext): Promise<CompletionResult | null> => {
    const schema = getSchema();
    if (schema === undefined) return null;
    const { state, pos } = context;
    const region = getRegion(state);
    if (!region || pos < region.from || pos > region.to) return null;

    const token = tokenAt(state, pos, region);
    if (token.kind === 'word' && token.from === pos && token.to === pos && !context.explicit) {
      return null;
    }
    const target = targetAt(state, token, region);
    if (!target) return null;

    const containerEntry = [...getJsonPointers(state, region).values()].find(
      entry => entry.valueFrom === target.container.from,
    );
    if (!containerEntry) return null;
    const pointer =
      target.role === 'key'
        ? containerEntry.pointer
        : `${containerEntry.pointer}/${escapePointerSegment(String(target.key))}`;

    const parsed = parseJson(state.sliceDoc(region.from, region.to));
    const root = await getCompiledSchema(schema);
    const { node } = root.getNode(pointer, parsed.ok ? parsed.value : undefined);
    if (!node) return null;

    const tail = token.kind === 'string' && !token.closed ? 0 : token.to - pos;
    if (target.role === 'value') {
      const options = valueOptions(node, tail);
      return options.length > 0 ? { from: token.from, options } : null;
    }

    const next = significantChar(state, token.to, region, 1);
    const suffix = next?.ch === ':' ? '' : ': ';
    const inString = token.kind === 'string';
    const options = propertyOptions(node, presentKeys(state, target.container, token), name => {
      const quoted = JSON.stringify(name);
      return applyText(inString ? `${quoted.slice(1)}${suffix}` : `${quoted}${suffix}`, tail);
    });
    if (options.length === 0) return null;
    // Inside a string the filter text starts after the opening quote.
    return { from: inString ? token.from + 1 : token.from, options };
  };
```

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/complete.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 13: Commit**

```bash
git add src/components/CodeEditor/engine/schema/complete.ts src/components/CodeEditor/engine/schema/complete.test.ts
git commit -m "feat(code-editor): add JSON Schema completion source for keys and values

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 14: Write the failing hover tests**

Create `src/components/CodeEditor/engine/schema/hover.test.ts`:
```ts
import { EditorState } from '@codemirror/state';
import { EditorView, type Tooltip } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import type { JsonSchema } from '../../types';
import { findJsonBodyRange, http } from '../languages/http';
import { json } from '../languages/json';
import { schemaHover, schemaHoverSource } from './hover';

const schema: JsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name', description: 'Rule name shown in the list' },
    meta: {
      type: 'object',
      description: 'Metadata',
      properties: { owner: { type: 'string', description: '<b>Owner</b> e-mail' } },
    },
    count: { type: 'number' },
  },
};

type RegionGetter = (state: EditorState) => { from: number; to: number } | null;

const wholeDoc: RegionGetter = state => ({ from: 0, to: state.doc.length });
const views: EditorView[] = [];
afterEach(() => {
  for (const view of views.splice(0)) view.destroy();
});

const viewFor = (doc: string, extensions = [json()]) => {
  const view = new EditorView({ state: EditorState.create({ doc, extensions }) });
  views.push(view);
  return view;
};

const hoverAt = async (view: EditorView, pos: number, getRegion: RegionGetter = wholeDoc) => {
  const result = await schemaHoverSource(() => schema, getRegion)(view, pos, 1);
  return result as Tooltip | null;
};

const render = (view: EditorView, tooltip: Tooltip | null) => tooltip?.create(view).dom;

describe('schemaHoverSource', () => {
  const doc = '{"name": "x", "meta": {"owner": "me"}, "count": 1}';

  it('shows title and description for the key under the pointer', async () => {
    const view = viewFor(doc);
    const tooltip = await hoverAt(view, doc.indexOf('name') + 1);

    expect(tooltip).toMatchObject({ pos: 1, end: 7, above: true });
    const dom = render(view, tooltip);
    expect(dom?.hasAttribute('data-schema-hover')).toBe(true);
    expect(dom?.children).toHaveLength(2);
    expect(dom?.children[0]?.textContent).toBe('Name');
    expect(dom?.children[1]?.textContent).toBe('Rule name shown in the list');
  });

  it('describes a primitive value through its property', async () => {
    const view = viewFor(doc);
    const tooltip = await hoverAt(view, doc.indexOf('"x"') + 1);
    expect(render(view, tooltip)?.textContent).toContain('Rule name');
  });

  it('describes nested keys and renders text, not markup', async () => {
    const view = viewFor(doc);
    const dom = render(view, await hoverAt(view, doc.indexOf('owner') + 1));
    expect(dom?.textContent).toBe('<b>Owner</b> e-mail');
    expect(dom?.querySelector('b')).toBeNull();
  });

  it('does not describe an object from inside it', async () => {
    const view = viewFor(doc);
    expect(await hoverAt(view, doc.indexOf('{"owner"'))).toBeNull();
  });

  it('returns null for properties without title/description', async () => {
    const view = viewFor(doc);
    expect(await hoverAt(view, doc.indexOf('count') + 1)).toBeNull();
  });

  it('works inside an HTTP JSON body', async () => {
    const head = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n';
    const view = viewFor(`${head}{"name": "x"}`, [http()]);
    const tooltip = await hoverAt(view, head.length + 2, findJsonBodyRange);
    expect(tooltip?.pos).toBe(head.length + 1);
    expect(await hoverAt(view, 2, findJsonBodyRange)).toBeNull();
  });
});

describe('schemaHover', () => {
  it('is an extension that can be added to a state', () => {
    expect(() =>
      EditorState.create({ extensions: [json(), schemaHover(() => schema, wholeDoc)] }),
    ).not.toThrow();
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/hover.test.ts`
Expected: FAIL, `Failed to resolve import "./hover"`.

- [ ] **Step 15: Implement `hover.ts`**

Create `src/components/CodeEditor/engine/schema/hover.ts`. The DOM is built with `document.createElement` + `textContent` (no `innerHTML`) and DS classes. The host gets the DS popover surface from `EditorView.theme`, using existing CSS variables only (spec §7.10):
```ts
import type { EditorState, Extension } from '@codemirror/state';
import { EditorView, type HoverTooltipSource, hoverTooltip, type Tooltip } from '@codemirror/view';
import type { JsonSchema } from '../../types';
import { getJsonPointers } from '../languages/jsonPointers';
import { getCompiledSchema, parseJson } from './loadSchema';

interface JsonRegion {
  from: number;
  to: number;
}

interface HoverTarget {
  pointer: string;
  from: number;
  to: number;
}

/** DS popover surface for CodeMirror's hover tooltip host (spec §7.10). */
const hoverTheme = EditorView.theme({
  '.cm-tooltip.cm-tooltip-hover': {
    backgroundColor: 'var(--color-bg-surface-2)',
    border: '1px solid var(--color-border-primary-light)',
    borderRadius: 'var(--radius-12)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
  },
});

const CONTAINER_START = /^[[{]/;

/**
 * The property under `pos`: its key, or a primitive value. Objects and arrays are only
 * matched through their key, so hovering inside an object does not describe the object.
 */
const hoverTargetAt = (state: EditorState, pos: number, region: JsonRegion): HoverTarget | null => {
  let best: HoverTarget | null = null;
  const consider = (candidate: HoverTarget) => {
    if (pos < candidate.from || pos > candidate.to) return;
    if (!best || candidate.to - candidate.from < best.to - best.from) best = candidate;
  };
  for (const entry of getJsonPointers(state, region).values()) {
    if (entry.keyFrom !== undefined && entry.keyTo !== undefined) {
      consider({ pointer: entry.pointer, from: entry.keyFrom, to: entry.keyTo });
    }
    const isContainer = CONTAINER_START.test(state.sliceDoc(entry.valueFrom, entry.valueFrom + 1));
    if (!isContainer) {
      consider({ pointer: entry.pointer, from: entry.valueFrom, to: entry.valueTo });
    }
  }
  return best;
};

const textOf = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;

/** Plain DOM (no innerHTML): title and description are schema text, never markup. */
const renderHover = (title: string | undefined, description: string | undefined): HTMLElement => {
  const dom = document.createElement('div');
  dom.className = 'flex max-w-[320px] flex-col gap-4 px-12 py-8 text-xs text-text-primary';
  dom.setAttribute('data-schema-hover', '');
  if (title) {
    const heading = document.createElement('div');
    heading.className = 'font-medium';
    heading.textContent = title;
    dom.append(heading);
  }
  if (description) {
    const body = document.createElement('div');
    body.className = 'whitespace-pre-wrap text-text-secondary';
    body.textContent = description;
    dom.append(body);
  }
  return dom;
};

/** Hover source: `title` / `description` of the schema for the property under the pointer. */
export const schemaHoverSource =
  (
    getSchema: () => JsonSchema | undefined,
    getRegion: (state: EditorState) => { from: number; to: number } | null,
  ): HoverTooltipSource =>
  async (view: EditorView, pos: number): Promise<Tooltip | null> => {
    const schema = getSchema();
    if (schema === undefined) return null;
    const { state } = view;
    const region = getRegion(state);
    if (!region || pos < region.from || pos > region.to) return null;
    const target = hoverTargetAt(state, pos, region);
    if (!target) return null;

    const parsed = parseJson(state.sliceDoc(region.from, region.to));
    const root = await getCompiledSchema(schema);
    const { node } = root.getNode(target.pointer, parsed.ok ? parsed.value : undefined);
    if (!node) return null;
    const title = textOf(node.schema.title);
    const description = textOf(node.schema.description);
    if (!title && !description) return null;

    return {
      pos: target.from,
      end: target.to,
      above: true,
      create: () => ({ dom: renderHover(title, description) }),
    };
  };

export const schemaHover = (
  getSchema: () => JsonSchema | undefined,
  getRegion: (state: EditorState) => { from: number; to: number } | null,
): Extension => [hoverTooltip(schemaHoverSource(getSchema, getRegion)), hoverTheme];
```

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/hover.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 16: Commit**

```bash
git add src/components/CodeEditor/engine/schema/hover.ts src/components/CodeEditor/engine/schema/hover.test.ts
git commit -m "feat(code-editor): show JSON Schema title and description on hover

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 17: Write the failing engine integration test**

Create `src/components/CodeEditor/engine/schema/schemaIntegration.test.ts`. It runs the real engine with the Task 5 `mountEngine`. Public positions are 1-based columns (spec §4) and `startingLineNumber` defaults to 1:
```ts
import { forceLinting } from '@codemirror/lint';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountEngine, unmountAllEngines } from '../../../../testUtils/codeEditorEngine';

const schema = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', description: 'Rule name' } },
};

afterEach(unmountAllEngines);

describe('schema diagnostics in the engine', () => {
  it('reports schema errors through onDiagnosticsChange for json', async () => {
    const { handle, callbacks } = mountEngine({ language: 'json', value: '{"name": 5}', schema });
    forceLinting(handle.view);

    await vi.waitFor(() =>
      expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([
        expect.objectContaining({
          source: 'schema',
          severity: 'error',
          from: { line: 1, column: 10 },
        }),
      ]),
    );
  });

  it('reports schema errors for an http JSON body', async () => {
    const value = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n{}';
    const { handle, callbacks } = mountEngine({ language: 'http', value, schema });
    forceLinting(handle.view);

    await vi.waitFor(() =>
      expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([
        expect.objectContaining({ source: 'schema', from: { line: 4, column: 1 } }),
      ]),
    );
  });

  it('drops schema diagnostics when the schema prop is removed', async () => {
    const engine = mountEngine({ language: 'json', value: '{"name": 5}', schema });
    forceLinting(engine.handle.view);
    await vi.waitFor(() => expect(engine.callbacks.onDiagnosticsChange).toHaveBeenCalled());

    engine.rerender({ schema: undefined });
    forceLinting(engine.handle.view);
    await vi.waitFor(() =>
      expect(engine.callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([]),
    );
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/schemaIntegration.test.ts`
Expected: FAIL on the first two tests. `vi.waitFor` times out: `expected "spy" to be last called with arguments: [ [ ObjectContaining { source: 'schema', … } ] ]`, but it was last called with `[]`, because Task 12 has no schema source yet.

- [ ] **Step 18: Add schema diagnostics to the Task 12 linter source**

In `src/components/CodeEditor/engine/diagnostics.ts`:

1. Add this import next to the other relative imports:
```ts
import { validateAgainstSchema } from './schema/validate';
```
2. Task 12's `linter(async view => …)` source already computes `region` (`jsonRegion(view.state, config.language)`) and the JSON syntax diagnostics for that region. Add the schema diagnostics right after the syntax ones. Put them into the merged list in spec §7.12 order: syntax, then schema, then external. If Task 12 used different local names for the region and the syntax array, use those names:
```ts
    const schemaDiagnostics =
      config.schema !== undefined && region !== null && syntaxDiagnostics.length === 0
        ? await validateAgainstSchema(view.state, region, config.schema).catch(() => [])
        : [];
```
and change the merge from
```ts
    [...syntaxDiagnostics, ...externalDiagnostics]
```
to
```ts
    [...syntaxDiagnostics, ...schemaDiagnostics, ...externalDiagnostics]
```
Notes:
- The source must be `async`. `linter` accepts `Promise<readonly Diagnostic[]>`.
- `validateAgainstSchema` already returns `[]` for invalid JSON, so the `syntaxDiagnostics.length === 0` guard only avoids pointless work.
- `.catch(() => [])` stops a failed chunk load from breaking linting; the next run tries again, because `loadSchemaLibrary` clears its cache on failure.
- Task 12 converts the result to the public form, so `source: 'schema'` reaches `onDiagnosticsChange`.

- [ ] **Step 19: Mount the schema hover in `engine/index.ts`**

In `src/components/CodeEditor/engine/index.ts`:

1. Imports: next to the Task 12 import `import { diagnosticsExtension, jsonRegion } from './diagnostics';`, add:
```ts
import { schemaHover } from './schema/hover';
```
(Add `jsonRegion` to the Task 12 import if it is not there yet.)

2. In `featureExtensions`, replace the `diagnostics` entry left by Task 12:
```ts
  diagnostics: () =>
    diagnosticsExtension({
      language: options.language,
      schema: options.schema,
      external: options.diagnostics,
      startingLineNumber: options.startingLineNumber,
      onChange: callbacks.onDiagnosticsChange,
    }),
```
with the following (keep Task 12's `diagnosticsExtension({...})` argument object exactly as it is):
```ts
  diagnostics: () => [
    diagnosticsExtension({
      language: options.language,
      schema: options.schema,
      external: options.diagnostics,
      startingLineNumber: options.startingLineNumber,
      onChange: callbacks.onDiagnosticsChange,
    }),
    options.schema === undefined
      ? []
      : schemaHover(
          () => options.schema,
          state => jsonRegion(state, options.language),
        ),
  ],
```
`SLOT_DEPS.diagnostics` already lists `'language'` and `'schema'`, so changing the `schema` or `language` prop reconfigures the hover, and it disappears when `schema` is removed. `SLOT_DEPS` needs no edit. Completion is not wired here: Task 14's `completionExtension` registers `schemaCompletionSource(() => config.schema, state => jsonRegion(state, config.language))`.

- [ ] **Step 20: Run the integration test and all engine tests**

Run: `pnpm vitest run src/components/CodeEditor/engine/schema/schemaIntegration.test.ts`
Expected: PASS (3 tests).

Run: `pnpm vitest run src/components/CodeEditor src/components/CodeSnippet`
Expected: PASS. All CodeEditor engine tests (Tasks 3–13) and all existing CodeSnippet tests stay green.

- [ ] **Step 21: Typecheck and lint**

Run: `pnpm exec tsc --build tsconfig.app.json --noEmit`
Expected: no errors.

Run: `pnpm exec biome check src/components/CodeEditor/engine/languages/jsonPointers.ts src/components/CodeEditor/engine/languages/jsonPointers.test.ts src/components/CodeEditor/engine/schema src/components/CodeEditor/engine/diagnostics.ts src/components/CodeEditor/engine/index.ts`
Expected: `No fixes applied`, 0 errors. If it reports formatting, run the same command with `--write` and check again.

Check that the lazy-load boundary holds: `grep -rn "json-schema-library" src/components/CodeEditor --include=*.ts --include=*.tsx | grep -v "engine/schema/loadSchema.ts"`
Expected: no output. Only `loadSchema.ts` imports the library: types via `import type`/`export type`, runtime only via `import('json-schema-library')`.

- [ ] **Step 22: Commit**

```bash
git add src/components/CodeEditor/engine/diagnostics.ts src/components/CodeEditor/engine/index.ts src/components/CodeEditor/engine/schema/schemaIntegration.test.ts
git commit -m "feat(code-editor): wire JSON Schema diagnostics and hover into the engine

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Autocomplete wiring + HTTP completions

Spec §7.14 (and §4 `CodeEditorCompletion*` types, §7.16 keymaps). Built-in HTTP source (pure, public as `httpCompletions`), the CodeMirror adapter for public `CodeEditorCompletionSource`s, the JSON Schema source from T13, and registration in the `completion` compartment.

**Files:**
- Create: `src/components/CodeEditor/lib/httpCompletionsData.ts`
- Create: `src/components/CodeEditor/lib/httpCompletions.ts`
- Create: `src/components/CodeEditor/engine/completion.ts`
- Modify: `src/components/CodeEditor/engine/index.ts` (`featureExtensions` → `completion` entry + import)
- Modify: `src/components/CodeEditor/index.ts` (export `httpCompletions`)
- Test: `src/components/CodeEditor/lib/httpCompletionsData.test.ts`
- Test: `src/components/CodeEditor/lib/httpCompletions.test.ts`
- Test: `src/components/CodeEditor/engine/completion.context.test.ts`
- Test: `src/components/CodeEditor/engine/completion.test.ts`
- Test: `src/components/CodeEditor/engine/completion.engine.test.ts`
- Test: `src/components/CodeEditor/index.exports.test.ts`

**Interfaces:**

Consumes:
- T3 `types.ts`: `CodeEditorCompletion`, `CodeEditorCompletionContext`, `CodeEditorCompletionSource`, `CodeEditorHttpContext`, `CodeEditorLanguage`, `JsonSchema`
- T3 `engine/positions.ts`: `offsetToPosition(doc: Text, offset: number, startingLineNumber: number): CodeEditorPosition`
- T4 `engine/languages/index.ts`: `languageExtension(language)`, `httpContextAt(state: EditorState, pos: number): CodeEditorHttpContext | undefined` (the blank separator line counts as `header-name`, line 1 is always `start-line`)
- T5 `engine/index.ts`: `featureExtensions(options, callbacks)` with a `completion: () => []` entry and `SLOT_DEPS.completion = ['language', 'schema', 'completions', 'startingLineNumber']` (already there, not changed here); `src/testUtils/codeEditorEngine.ts` (`mountEngine`, `unmountAllEngines`)
- T12 `engine/diagnostics.ts`: `jsonRegion(state: EditorState, language: CodeEditorLanguage): { from: number; to: number } | null`
- T13 `engine/languages/jsonPointers.ts`: `pointerAt(state, pos, region): string | undefined`; `engine/schema/complete.ts`: `schemaCompletionSource(getSchema, getRegion): CompletionSource`
- `src/components/HttpMethod/constants.ts`: `HTTP_METHODS`
- `src/components/DropdownMenu/classes.ts`: `dropdownMenuItemVariants`

Produces:
- `lib/httpCompletions.ts` (public via `index.ts`): `export const httpCompletions: CodeEditorCompletionSource;` (synchronous, pure, no CodeMirror imports)
- `engine/completion.ts`:
  - `export const completionExtension: (config: { language: CodeEditorLanguage; schema: JsonSchema | undefined; sources: readonly CodeEditorCompletionSource[]; startingLineNumber: number }) => Extension;` (returns `[]` when there is no source at all)
  - `export const buildCompletionContext: (ctx: CompletionContext, language: CodeEditorLanguage, startingLineNumber: number) => CodeEditorCompletionContext;`
- `lib/httpCompletionsData.ts` (internal, not exported from `index.ts`): `type HttpHeaderDirection = 'request' | 'response' | 'both'`, `interface HttpHeaderInfo { name; direction; repeatable?; description }`, `interface HttpHeaderValueInfo { label; apply?; info? }`, `HTTP_COMPLETION_METHODS: readonly string[]`, `HTTP_VERSIONS: readonly string[]`, `HTTP_HEADERS: readonly HttpHeaderInfo[]` (91 entries), `HTTP_MEDIA_TYPE_PARAMETERS: readonly HttpHeaderValueInfo[]`, `HTTP_HEADER_VALUES: Readonly<Record<string, readonly HttpHeaderValueInfo[]>>` (keys are lowercased header names)

Behaviour contract (tests pin it down):
- Completion word = `/[\w\-/.:]*/` before the cursor. The CM result `from` is always that word's start.
- `httpCompletions`:
  - Start line: on the first token, methods (`apply: 'GET '`, kind `method`) plus versions (`apply: 'HTTP/1.1 '`, kind `keyword`, so a status line can be started). Shown once something is typed, or on Ctrl-Space. On the third token of a request line, versions with no trailing space, shown unprompted. Nothing for the target or for a response status line.
  - Header name: only when the whole text before the cursor is the word. Needs a typed character or Ctrl-Space. Headers are filtered by `messageKind` (`both` always passes). A header already present on lines 2 up to the first blank line is skipped, compared case-insensitively, unless it is `repeatable`; the line being typed does not count as present. Each item has `apply: 'Name: '`, `detail`, `info` = description and kind `header`.
  - Header value: looked up by the lowercased name. Shown unprompted at the start of a value. After `;` in `Content-Type`/`Accept` it offers `charset=utf-8`. Past the first token (`gzip, |`) it needs Ctrl-Space. It returns `null` when the word contains `:` (`Name:value` typed with no space).
  - Body / no `http` context: `null`.
- The adapter maps `kind` to CM `type` (`value → constant`, `header → property`, `snippet → text`, the rest unchanged) and drops `null`/empty results. It supports both sync and `Promise` sources.
- Order of `override`: HTTP built-in (`language === 'http'`), then the schema source (`schema !== undefined` and language `json`/`http`), then consumer sources in the given order.
- `completionKeymap` comes from `autocompletion({ defaultKeymap: true })`, which installs it at `Prec.highest`. So Enter, the arrow keys and Escape reach the open list before `indentWithTab` and the fullscreen Escape; CM `preventDefault`s handled keys, and T2's ChromeFrame checks `defaultPrevented`. Do not add a second `keymap.of(completionKeymap)`.
- `activateOnCompletion` re-opens the list after any pick whose `apply` ends with `': '`, so header values (or schema values after `"key": `) show straight away.

- [ ] **Step 1: Write the failing data test**

Create `src/components/CodeEditor/lib/httpCompletionsData.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { HTTP_METHODS } from '../../HttpMethod/constants';
import {
  HTTP_COMPLETION_METHODS,
  HTTP_HEADER_VALUES,
  HTTP_HEADERS,
  HTTP_VERSIONS,
} from './httpCompletionsData';

describe('httpCompletionsData', () => {
  it('extends the DS HTTP_METHODS with CONNECT and TRACE', () => {
    expect(HTTP_COMPLETION_METHODS).toEqual([...HTTP_METHODS, 'CONNECT', 'TRACE']);
  });

  it('offers HTTP/1.1 and HTTP/2', () => {
    expect(HTTP_VERSIONS).toEqual(['HTTP/1.1', 'HTTP/2']);
  });

  it('has about seventy unique headers, each with a description', () => {
    const names = HTTP_HEADERS.map(header => header.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    expect(HTTP_HEADERS.length).toBeGreaterThanOrEqual(70);
    for (const header of HTTP_HEADERS) {
      expect(header.name).toMatch(/^[A-Za-z0-9-]+$/);
      expect(header.description.length).toBeGreaterThan(0);
    }
  });

  it('tags directions and repeatable headers', () => {
    const byName = new Map(HTTP_HEADERS.map(header => [header.name, header]));
    expect(byName.get('Host')?.direction).toBe('request');
    expect(byName.get('Set-Cookie')).toMatchObject({ direction: 'response', repeatable: true });
    expect(byName.get('Content-Type')?.direction).toBe('both');
    expect(byName.get('Content-Type')?.repeatable).toBeUndefined();
  });

  it('keys header values by the lowercased name of a known header', () => {
    const known = new Set(HTTP_HEADERS.map(header => header.name.toLowerCase()));
    for (const key of Object.keys(HTTP_HEADER_VALUES)) {
      expect(key).toBe(key.toLowerCase());
      expect(known.has(key)).toBe(true);
    }
    const contentTypes = (HTTP_HEADER_VALUES['content-type'] ?? []).map(value => value.label);
    expect(contentTypes).toContain('application/json');
    expect(contentTypes).toContain('application/json; charset=utf-8');
  });
});
```

- [ ] **Step 2: Run it — expect failure**

Run: `pnpm vitest run src/components/CodeEditor/lib/httpCompletionsData.test.ts`
Expected: FAIL — `Failed to resolve import "./httpCompletionsData"`.

- [ ] **Step 3: Implement the curated data**

Create `src/components/CodeEditor/lib/httpCompletionsData.ts` (the only runtime import is the DS `HTTP_METHODS`; `HttpMethod/constants.ts` imports `BadgeColor` as a type only):

```ts
import { HTTP_METHODS } from '../../HttpMethod/constants';

/**
 * Curated HTTP completion data for `httpCompletions` (spec §7.14).
 * Hand-maintained from RFC 9110/9111, MDN (`@mdn/browser-compat-data`, CC0) and
 * the IANA field-name registry — no runtime dependency on either source.
 */

/** Which message kinds a header is normally sent in. */
export type HttpHeaderDirection = 'request' | 'response' | 'both';

export interface HttpHeaderInfo {
  /** Canonical spelling, inserted as `Name: `. */
  name: string;
  direction: HttpHeaderDirection;
  /** May appear on several lines of one message (`Set-Cookie`), so it is offered even when present. */
  repeatable?: boolean;
  description: string;
}

export interface HttpHeaderValueInfo {
  label: string;
  /** Text to insert; defaults to `label`. */
  apply?: string;
  info?: string;
}

/** DS `HTTP_METHODS` plus the remaining RFC 9110 §9 methods. */
export const HTTP_COMPLETION_METHODS: readonly string[] = [...HTTP_METHODS, 'CONNECT', 'TRACE'];

export const HTTP_VERSIONS: readonly string[] = ['HTTP/1.1', 'HTTP/2'];

export const HTTP_HEADERS: readonly HttpHeaderInfo[] = [
  // ---- Request
  {
    name: 'Accept',
    direction: 'request',
    description: 'Media types the client can handle, in order of preference.',
  },
  {
    name: 'Accept-Encoding',
    direction: 'request',
    description: 'Content codings (compression) the client understands.',
  },
  {
    name: 'Accept-Language',
    direction: 'request',
    description: 'Natural languages the client prefers for the response.',
  },
  {
    name: 'Access-Control-Request-Headers',
    direction: 'request',
    description: 'CORS preflight: headers the actual request will send.',
  },
  {
    name: 'Access-Control-Request-Method',
    direction: 'request',
    description: 'CORS preflight: method the actual request will use.',
  },
  {
    name: 'Authorization',
    direction: 'request',
    description: 'Credentials that authenticate the client with the server.',
  },
  {
    name: 'Cookie',
    direction: 'request',
    description: 'Cookies previously sent by the server with Set-Cookie.',
  },
  {
    name: 'Expect',
    direction: 'request',
    description: 'Expectations the server must meet, such as 100-continue.',
  },
  {
    name: 'Forwarded',
    direction: 'request',
    repeatable: true,
    description: 'Client and proxy information lost when a proxy is involved (RFC 7239).',
  },
  {
    name: 'From',
    direction: 'request',
    description: 'Email address of the person controlling the user agent.',
  },
  {
    name: 'Host',
    direction: 'request',
    description: 'Host and port of the server the request is sent to.',
  },
  {
    name: 'If-Match',
    direction: 'request',
    description: 'Apply the method only if the resource matches one of the ETags.',
  },
  {
    name: 'If-Modified-Since',
    direction: 'request',
    description: 'Return the resource only if it changed after this date.',
  },
  {
    name: 'If-None-Match',
    direction: 'request',
    description: 'Return the resource only if it matches none of the ETags.',
  },
  {
    name: 'If-Range',
    direction: 'request',
    description: 'Send the requested range only if the ETag or date still matches.',
  },
  {
    name: 'If-Unmodified-Since',
    direction: 'request',
    description: 'Apply the method only if the resource has not changed since this date.',
  },
  {
    name: 'Max-Forwards',
    direction: 'request',
    description: 'Maximum number of proxies for TRACE and OPTIONS requests.',
  },
  {
    name: 'Origin',
    direction: 'request',
    description: 'Scheme, host and port the request originates from.',
  },
  {
    name: 'Priority',
    direction: 'request',
    description: 'Urgency and incremental delivery hints (RFC 9218).',
  },
  {
    name: 'Proxy-Authorization',
    direction: 'request',
    description: 'Credentials that authenticate the client with a proxy.',
  },
  {
    name: 'Range',
    direction: 'request',
    description: 'Parts of the resource to return, such as bytes=0-1023.',
  },
  {
    name: 'Referer',
    direction: 'request',
    description: 'Address of the page that linked to the requested resource.',
  },
  {
    name: 'Sec-Fetch-Dest',
    direction: 'request',
    description: 'Fetch metadata: how the response will be used (document, image, empty).',
  },
  {
    name: 'Sec-Fetch-Mode',
    direction: 'request',
    description: 'Fetch metadata: request mode (cors, navigate, no-cors, same-origin).',
  },
  {
    name: 'Sec-Fetch-Site',
    direction: 'request',
    description: 'Fetch metadata: relation between initiator and target origin.',
  },
  {
    name: 'Sec-Fetch-User',
    direction: 'request',
    description: 'Fetch metadata: the navigation was triggered by user activation.',
  },
  {
    name: 'TE',
    direction: 'request',
    description: 'Transfer codings the client accepts, such as trailers.',
  },
  {
    name: 'Upgrade-Insecure-Requests',
    direction: 'request',
    description: 'The client prefers an encrypted, authenticated response.',
  },
  {
    name: 'User-Agent',
    direction: 'request',
    description: 'Software that sends the request.',
  },
  {
    name: 'X-Api-Key',
    direction: 'request',
    description: 'API key used by many services to authenticate the client.',
  },
  {
    name: 'X-CSRF-Token',
    direction: 'request',
    description: 'Anti-CSRF token echoed back to the server.',
  },
  {
    name: 'X-Forwarded-For',
    direction: 'request',
    repeatable: true,
    description: 'Originating client IP address when behind proxies (de facto).',
  },
  {
    name: 'X-Forwarded-Host',
    direction: 'request',
    description: 'Original Host requested by the client (de facto).',
  },
  {
    name: 'X-Forwarded-Proto',
    direction: 'request',
    description: 'Protocol the client used to connect to the proxy (de facto).',
  },
  {
    name: 'X-Real-IP',
    direction: 'request',
    description: 'Client IP address set by a reverse proxy (de facto).',
  },
  {
    name: 'X-Requested-With',
    direction: 'request',
    description: 'Marks AJAX requests, usually XMLHttpRequest (de facto).',
  },
  // ---- Request and response
  {
    name: 'Cache-Control',
    direction: 'both',
    description: 'Caching directives for requests and responses.',
  },
  {
    name: 'Connection',
    direction: 'both',
    description: 'Whether the connection stays open after the current message.',
  },
  {
    name: 'Content-Encoding',
    direction: 'both',
    description: 'Content codings applied to the body, such as gzip.',
  },
  {
    name: 'Content-Language',
    direction: 'both',
    description: 'Natural language of the intended audience of the body.',
  },
  {
    name: 'Content-Length',
    direction: 'both',
    description: 'Size of the body in bytes.',
  },
  {
    name: 'Content-Type',
    direction: 'both',
    description: 'Media type of the body.',
  },
  {
    name: 'Date',
    direction: 'both',
    description: 'Date and time the message was created.',
  },
  {
    name: 'Keep-Alive',
    direction: 'both',
    description: 'Timeout and maximum requests for a persistent connection.',
  },
  {
    name: 'Pragma',
    direction: 'both',
    description: 'HTTP/1.0 caching directive, usually no-cache.',
  },
  {
    name: 'Trailer',
    direction: 'both',
    description: 'Header fields sent after a chunked body.',
  },
  {
    name: 'Transfer-Encoding',
    direction: 'both',
    description: 'Encoding used to transfer the body, such as chunked.',
  },
  {
    name: 'Upgrade',
    direction: 'both',
    description: 'Switch the connection to another protocol, such as websocket.',
  },
  {
    name: 'Via',
    direction: 'both',
    repeatable: true,
    description: 'Proxies the message passed through.',
  },
  {
    name: 'X-Correlation-ID',
    direction: 'both',
    description: 'Identifier that correlates related requests across services (de facto).',
  },
  {
    name: 'X-Request-ID',
    direction: 'both',
    description: 'Unique identifier of the request for tracing (de facto).',
  },
  // ---- Response
  {
    name: 'Accept-Patch',
    direction: 'response',
    description: 'Media types the server accepts in a PATCH request.',
  },
  {
    name: 'Accept-Ranges',
    direction: 'response',
    description: 'Whether the server supports range requests, usually bytes.',
  },
  {
    name: 'Access-Control-Allow-Credentials',
    direction: 'response',
    description: 'CORS: whether the response may be shared when credentials are sent.',
  },
  {
    name: 'Access-Control-Allow-Headers',
    direction: 'response',
    description: 'CORS: headers allowed in the actual request.',
  },
  {
    name: 'Access-Control-Allow-Methods',
    direction: 'response',
    description: 'CORS: methods allowed for the resource.',
  },
  {
    name: 'Access-Control-Allow-Origin',
    direction: 'response',
    description: 'CORS: origin allowed to read the response.',
  },
  {
    name: 'Access-Control-Expose-Headers',
    direction: 'response',
    description: 'CORS: response headers scripts are allowed to read.',
  },
  {
    name: 'Access-Control-Max-Age',
    direction: 'response',
    description: 'CORS: seconds a preflight result may be cached.',
  },
  {
    name: 'Age',
    direction: 'response',
    description: 'Seconds the response has been in a proxy cache.',
  },
  {
    name: 'Allow',
    direction: 'response',
    description: 'Methods supported by the target resource.',
  },
  {
    name: 'Alt-Svc',
    direction: 'response',
    description: 'Alternative services (protocol, host, port) for the origin.',
  },
  {
    name: 'Clear-Site-Data',
    direction: 'response',
    description: 'Clears browsing data (cookies, storage, cache) for the site.',
  },
  {
    name: 'Content-Disposition',
    direction: 'response',
    description: 'Show the body inline or download it as an attachment.',
  },
  {
    name: 'Content-Location',
    direction: 'response',
    description: 'Alternate location of the returned data.',
  },
  {
    name: 'Content-Range',
    direction: 'response',
    description: 'Position of a partial body in the full resource.',
  },
  {
    name: 'Content-Security-Policy',
    direction: 'response',
    description: 'Resources the user agent is allowed to load for the page.',
  },
  {
    name: 'Content-Security-Policy-Report-Only',
    direction: 'response',
    description: 'CSP that only reports violations without enforcing them.',
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    direction: 'response',
    description: 'Controls loading of cross-origin resources into the document.',
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    direction: 'response',
    description: 'Isolates the browsing context group from cross-origin documents.',
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    direction: 'response',
    description: 'Blocks no-cors cross-origin or cross-site loads of the resource.',
  },
  {
    name: 'ETag',
    direction: 'response',
    description: 'Identifier of a specific version of the resource.',
  },
  {
    name: 'Expires',
    direction: 'response',
    description: 'Date after which the response is considered stale.',
  },
  {
    name: 'Last-Modified',
    direction: 'response',
    description: 'Date the resource was last changed.',
  },
  {
    name: 'Link',
    direction: 'response',
    repeatable: true,
    description: 'Typed links to related resources (RFC 8288).',
  },
  {
    name: 'Location',
    direction: 'response',
    description: 'URL to redirect to, or of a newly created resource.',
  },
  {
    name: 'Permissions-Policy',
    direction: 'response',
    description: 'Browser features the document and its frames may use.',
  },
  {
    name: 'Proxy-Authenticate',
    direction: 'response',
    repeatable: true,
    description: 'Authentication scheme required to access a resource through a proxy.',
  },
  {
    name: 'Referrer-Policy',
    direction: 'response',
    description: 'How much referrer information requests should include.',
  },
  {
    name: 'Retry-After',
    direction: 'response',
    description: 'How long to wait before making a follow-up request.',
  },
  {
    name: 'Server',
    direction: 'response',
    description: 'Software used by the origin server.',
  },
  {
    name: 'Server-Timing',
    direction: 'response',
    repeatable: true,
    description: 'Server-side performance metrics for the request.',
  },
  {
    name: 'Set-Cookie',
    direction: 'response',
    repeatable: true,
    description: 'Sends a cookie from the server to the user agent.',
  },
  {
    name: 'Strict-Transport-Security',
    direction: 'response',
    description: 'Tells browsers to use HTTPS only for this host (HSTS).',
  },
  {
    name: 'Vary',
    direction: 'response',
    description: 'Request headers that affect which response is cached.',
  },
  {
    name: 'WWW-Authenticate',
    direction: 'response',
    repeatable: true,
    description: 'Authentication scheme required to access the resource.',
  },
  {
    name: 'X-Content-Type-Options',
    direction: 'response',
    description: 'nosniff disables MIME type sniffing.',
  },
  {
    name: 'X-Frame-Options',
    direction: 'response',
    description: 'Whether the page may be shown in a frame (DENY, SAMEORIGIN).',
  },
  {
    name: 'X-RateLimit-Limit',
    direction: 'response',
    description: 'Requests allowed in the current rate-limit window (de facto).',
  },
  {
    name: 'X-RateLimit-Remaining',
    direction: 'response',
    description: 'Requests left in the current rate-limit window (de facto).',
  },
  {
    name: 'X-RateLimit-Reset',
    direction: 'response',
    description: 'When the current rate-limit window resets (de facto).',
  },
];

const MEDIA_TYPES: readonly string[] = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'text/html',
  'application/xml',
  'application/octet-stream',
];

/** Media types whose `; charset=utf-8` form is also offered. */
const TEXTUAL_MEDIA_TYPES: readonly string[] = [
  'application/json',
  'text/plain',
  'text/html',
  'application/xml',
];

const mediaTypeValues = (withWildcard: boolean): HttpHeaderValueInfo[] => [
  ...(withWildcard ? [{ label: '*/*', info: 'Any media type' }] : []),
  ...MEDIA_TYPES.map(label => ({ label })),
  ...TEXTUAL_MEDIA_TYPES.map(type => ({ label: `${type}; charset=utf-8` })),
];

const AUTH_SCHEMES: readonly HttpHeaderValueInfo[] = [
  { label: 'Bearer', apply: 'Bearer ', info: 'OAuth 2.0 / JWT access token (RFC 6750)' },
  { label: 'Basic', apply: 'Basic ', info: 'base64(user:password) (RFC 7617)' },
  { label: 'Digest', apply: 'Digest ', info: 'Digest access authentication (RFC 7616)' },
  { label: 'Negotiate', apply: 'Negotiate ', info: 'SPNEGO / Kerberos (RFC 4559)' },
  {
    label: 'AWS4-HMAC-SHA256',
    apply: 'AWS4-HMAC-SHA256 ',
    info: 'AWS Signature Version 4',
  },
];

const CODINGS: readonly HttpHeaderValueInfo[] = [
  { label: 'gzip' },
  { label: 'deflate' },
  { label: 'br' },
  { label: 'zstd' },
];

/** Parameter values offered after `;` in a Content-Type / Accept value. */
export const HTTP_MEDIA_TYPE_PARAMETERS: readonly HttpHeaderValueInfo[] = [
  { label: 'charset=utf-8' },
];

/** Header values keyed by lowercased header name. */
export const HTTP_HEADER_VALUES: Readonly<Record<string, readonly HttpHeaderValueInfo[]>> = {
  accept: mediaTypeValues(true),
  'accept-encoding': [{ label: 'gzip, deflate, br, zstd' }, ...CODINGS, { label: 'identity' }],
  'access-control-allow-credentials': [{ label: 'true' }],
  'access-control-allow-origin': [
    { label: '*', info: 'Any origin (not allowed with credentials)' },
  ],
  authorization: AUTH_SCHEMES,
  'cache-control': [
    { label: 'no-cache' },
    { label: 'no-store' },
    { label: 'max-age=', info: 'Seconds the response stays fresh' },
    { label: 'private' },
    { label: 'public' },
    { label: 'must-revalidate' },
    { label: 'no-transform' },
    { label: 'immutable' },
  ],
  connection: [{ label: 'keep-alive' }, { label: 'close' }],
  'content-encoding': CODINGS,
  'content-type': mediaTypeValues(false),
  pragma: [{ label: 'no-cache' }],
  'proxy-authorization': AUTH_SCHEMES,
  'transfer-encoding': [{ label: 'chunked' }, ...CODINGS],
  upgrade: [{ label: 'websocket' }, { label: 'h2c' }],
  'x-content-type-options': [{ label: 'nosniff' }],
  'x-frame-options': [{ label: 'DENY' }, { label: 'SAMEORIGIN' }],
  'x-requested-with': [{ label: 'XMLHttpRequest' }],
};
```

- [ ] **Step 4: Run it — expect pass**

Run: `pnpm vitest run src/components/CodeEditor/lib/httpCompletionsData.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Write the failing `httpCompletions` tests**

Create `src/components/CodeEditor/lib/httpCompletions.test.ts` (pure: the context is built by hand, no CodeMirror):

```ts
import { describe, expect, it } from 'vitest';
import type {
  CodeEditorCompletion,
  CodeEditorCompletionContext,
  CodeEditorHttpContext,
} from '../types';
import { httpCompletions } from './httpCompletions';

const WORD = /[\w\-/.:]*$/;

/**
 * Hand-built context: `|` in `doc` marks the cursor. Mirrors what the engine's
 * `buildCompletionContext` produces (startingLineNumber 1).
 */
const contextAt = (
  docWithCursor: string,
  http: CodeEditorHttpContext | undefined,
  explicit = false,
): CodeEditorCompletionContext => {
  const offset = docWithCursor.indexOf('|');
  const value = docWithCursor.replace('|', '');
  const before = value.slice(0, offset);
  const lineStart = before.lastIndexOf('\n') + 1;
  const lineEnd = value.indexOf('\n', offset);
  const line = before.split('\n').length;
  const column = offset - lineStart + 1;
  const wordText = before.slice(lineStart).match(WORD)?.[0] ?? '';
  return {
    value,
    position: { line, column },
    lineText: value.slice(lineStart, lineEnd < 0 ? value.length : lineEnd),
    word: { text: wordText, from: { line, column: column - wordText.length } },
    explicit,
    http,
  };
};

const run = (ctx: CodeEditorCompletionContext): CodeEditorCompletion[] | null => {
  const result = httpCompletions(ctx);
  if (result instanceof Promise) throw new Error('httpCompletions must be synchronous');
  return result;
};

const labels = (ctx: CodeEditorCompletionContext): string[] =>
  (run(ctx) ?? []).map(item => item.label);

const REQUEST = { messageKind: 'request' } as const;
const RESPONSE = { messageKind: 'response' } as const;

describe('httpCompletions', () => {
  it('returns null without an http context and in the body', () => {
    expect(run(contextAt('GE|', undefined, true))).toBeNull();
    expect(
      run(contextAt('GET / HTTP/1.1\n\n{"a|"}', { section: 'body', ...REQUEST }, true)),
    ).toBeNull();
  });

  describe('start line', () => {
    it('offers methods with a trailing space for the first token', () => {
      const items = run(contextAt('PO|', { section: 'start-line', ...REQUEST })) ?? [];
      expect(items).toContainEqual({ label: 'POST', apply: 'POST ', kind: 'method' });
      expect(items.map(item => item.label)).toEqual(
        expect.arrayContaining([
          'GET',
          'PUT',
          'PATCH',
          'DELETE',
          'HEAD',
          'OPTIONS',
          'CONNECT',
          'TRACE',
        ]),
      );
    });

    it('also offers versions for the first token, to start a status line', () => {
      const items = run(contextAt('HT|', { section: 'start-line', ...REQUEST })) ?? [];
      expect(items).toContainEqual({ label: 'HTTP/1.1', apply: 'HTTP/1.1 ', kind: 'keyword' });
    });

    it('needs a typed character or Ctrl-Space on an empty line', () => {
      expect(run(contextAt('|', { section: 'start-line', ...REQUEST }))).toBeNull();
      expect(labels(contextAt('|', { section: 'start-line', ...REQUEST }, true))).toContain('GET');
    });

    it('offers nothing for the target', () => {
      expect(run(contextAt('GET /ap|', { section: 'start-line', ...REQUEST }, true))).toBeNull();
    });

    it('offers versions after the target, unprompted', () => {
      const items = run(contextAt('GET /api |', { section: 'start-line', ...REQUEST })) ?? [];
      expect(items).toEqual([
        { label: 'HTTP/1.1', apply: 'HTTP/1.1', kind: 'keyword' },
        { label: 'HTTP/2', apply: 'HTTP/2', kind: 'keyword' },
      ]);
    });

    it('offers no versions after the status code of a response', () => {
      expect(
        run(contextAt('HTTP/1.1 200 |', { section: 'start-line', ...RESPONSE }, true)),
      ).toBeNull();
    });
  });

  describe('header names', () => {
    it('offers request headers with `Name: ` apply, detail and description', () => {
      const items =
        run(contextAt('GET / HTTP/1.1\nAcc|', { section: 'header-name', ...REQUEST })) ?? [];
      const accept = items.find(item => item.label === 'Accept');
      expect(accept).toMatchObject({ apply: 'Accept: ', kind: 'header', detail: 'request header' });
      expect(accept?.info).toEqual(expect.any(String));
      expect(items.map(item => item.label)).toContain('Content-Type');
      expect(items.map(item => item.label)).not.toContain('Set-Cookie');
    });

    it('offers response headers for a response', () => {
      const names = labels(
        contextAt('HTTP/1.1 200 OK\nSe|', { section: 'header-name', ...RESPONSE }),
      );
      expect(names).toEqual(expect.arrayContaining(['Set-Cookie', 'Server', 'Content-Type']));
      expect(names).not.toContain('Host');
    });

    it('skips non-repeatable headers already present, case-insensitively', () => {
      const names = labels(
        contextAt(
          'GET / HTTP/1.1\nhost: a\nContent-Type: text/plain\n|',
          {
            section: 'header-name',
            ...REQUEST,
          },
          true,
        ),
      );
      expect(names).not.toContain('Host');
      expect(names).not.toContain('Content-Type');
      expect(names).toContain('Accept');
    });

    it('keeps repeatable headers that are already present', () => {
      const names = labels(
        contextAt('HTTP/1.1 200 OK\nSet-Cookie: a=1\nSet|', {
          section: 'header-name',
          ...RESPONSE,
        }),
      );
      expect(names).toContain('Set-Cookie');
    });

    it('does not count the line being typed as present', () => {
      const names = labels(
        contextAt('GET / HTTP/1.1\nHost|', { section: 'header-name', ...REQUEST }),
      );
      expect(names).toContain('Host');
    });

    it('ignores header-looking lines in the body', () => {
      const names = labels(
        contextAt('GET / HTTP/1.1\nAcc|\n\nAccept: x', { section: 'header-name', ...REQUEST }),
      );
      expect(names).toContain('Accept');
    });

    it('offers nothing after a space in a header name, or on an empty line unprompted', () => {
      expect(
        run(contextAt('GET / HTTP/1.1\nX Ho|', { section: 'header-name', ...REQUEST }, true)),
      ).toBeNull();
      expect(
        run(contextAt('GET / HTTP/1.1\n|', { section: 'header-name', ...REQUEST })),
      ).toBeNull();
    });
  });

  describe('header values', () => {
    const valueContext = (doc: string, headerName: string, explicit = false) =>
      contextAt(doc, { section: 'header-value', headerName, ...REQUEST }, explicit);

    it('offers media types for Content-Type right after the colon, unprompted', () => {
      const items = run(valueContext('POST / HTTP/1.1\nContent-Type: |', 'Content-Type')) ?? [];
      expect(items).toContainEqual({ label: 'application/json', kind: 'value' });
      expect(items.map(item => item.label)).toContain('application/json; charset=utf-8');
      expect(items.map(item => item.label)).not.toContain('*/*');
    });

    it('offers */* for Accept and matches the header name case-insensitively', () => {
      expect(labels(valueContext('GET / HTTP/1.1\naccept: ap|', 'accept'))).toEqual(
        expect.arrayContaining(['*/*', 'application/json']),
      );
    });

    it('offers charset after `;` in a media type', () => {
      expect(
        labels(valueContext('POST / HTTP/1.1\nContent-Type: text/plain; |', 'Content-Type')),
      ).toEqual(['charset=utf-8']);
    });

    it('offers Authorization schemes with a trailing space', () => {
      const items = run(valueContext('GET / HTTP/1.1\nAuthorization: Be|', 'Authorization')) ?? [];
      expect(items).toContainEqual(
        expect.objectContaining({ label: 'Bearer', apply: 'Bearer ', kind: 'value' }),
      );
      expect(items.map(item => item.label)).toEqual([
        'Bearer',
        'Basic',
        'Digest',
        'Negotiate',
        'AWS4-HMAC-SHA256',
      ]);
    });

    it('offers Accept-Encoding, Cache-Control and Connection values', () => {
      expect(labels(valueContext('GET / HTTP/1.1\nAccept-Encoding: |', 'Accept-Encoding'))).toEqual(
        expect.arrayContaining(['gzip, deflate, br, zstd', 'gzip', 'br', 'zstd']),
      );
      expect(labels(valueContext('GET / HTTP/1.1\nCache-Control: |', 'Cache-Control'))).toEqual(
        expect.arrayContaining(['no-cache', 'no-store', 'max-age=', 'private', 'public']),
      );
      expect(labels(valueContext('GET / HTTP/1.1\nConnection: |', 'Connection'))).toEqual([
        'keep-alive',
        'close',
      ]);
    });

    it('offers later list items only on Ctrl-Space', () => {
      const doc = 'GET / HTTP/1.1\nAccept-Encoding: gzip, |';
      expect(run(valueContext(doc, 'Accept-Encoding'))).toBeNull();
      expect(labels(valueContext(doc, 'Accept-Encoding', true))).toContain('br');
    });

    it('offers nothing for unknown headers or `Name:value` without a space', () => {
      expect(run(valueContext('GET / HTTP/1.1\nX-Custom: |', 'X-Custom', true))).toBeNull();
      expect(run(valueContext('GET / HTTP/1.1\nConnection:cl|', 'Connection', true))).toBeNull();
    });
  });
});
```

- [ ] **Step 6: Run them — expect failure**

Run: `pnpm vitest run src/components/CodeEditor/lib/httpCompletions.test.ts`
Expected: FAIL — `Failed to resolve import "./httpCompletions"`.

- [ ] **Step 7: Implement `httpCompletions`**

Create `src/components/CodeEditor/lib/httpCompletions.ts`. It must not import `@codemirror/*` or `../engine` (Global Constraints: `lib/**` stays in the main chunk):

```ts
import type {
  CodeEditorCompletion,
  CodeEditorCompletionContext,
  CodeEditorCompletionSource,
  CodeEditorHttpContext,
} from '../types';
import {
  HTTP_COMPLETION_METHODS,
  HTTP_HEADER_VALUES,
  HTTP_HEADERS,
  HTTP_MEDIA_TYPE_PARAMETERS,
  HTTP_VERSIONS,
  type HttpHeaderDirection,
  type HttpHeaderValueInfo,
} from './httpCompletionsData';

/** Same blank-line rule as the HTTP grammar and getHttpFolds: empty or spaces/tabs only. */
const BLANK_LINE = /^[ \t]*$/;
const WHITESPACE = /[ \t]+/;
/** Headers whose values are media types and accept `; charset=utf-8`. */
const MEDIA_TYPE_HEADERS: ReadonlySet<string> = new Set(['content-type', 'accept']);

const DIRECTION_DETAIL: Record<HttpHeaderDirection, string> = {
  request: 'request header',
  response: 'response header',
  both: 'header',
};

/** Text of the current line before the cursor. */
const textBeforeCursor = (ctx: CodeEditorCompletionContext): string =>
  ctx.lineText.slice(0, Math.max(0, ctx.position.column - 1));

/** Lowercased header name of a header line (text before `:`, or the whole line). */
const headerNameOf = (line: string): string => {
  const colon = line.indexOf(':');
  return (colon < 0 ? line : line.slice(0, colon)).trim().toLowerCase();
};

/** Lowercased header name → number of header lines using it (line 2 up to the first blank line). */
const countHeaderNames = (value: string): Map<string, number> => {
  const counts = new Map<string, number>();
  const lines = value.split('\n');
  for (let index = 1; index < lines.length; index++) {
    const line = lines[index] ?? '';
    if (BLANK_LINE.test(line)) break;
    const name = headerNameOf(line);
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return counts;
};

const methodCompletions = (): CodeEditorCompletion[] =>
  HTTP_COMPLETION_METHODS.map(method => ({ label: method, apply: `${method} `, kind: 'method' }));

const versionCompletions = (suffix: string): CodeEditorCompletion[] =>
  HTTP_VERSIONS.map(version => ({ label: version, apply: `${version}${suffix}`, kind: 'keyword' }));

const valueCompletions = (values: readonly HttpHeaderValueInfo[]): CodeEditorCompletion[] =>
  values.map(({ label, apply, info }) => ({
    label,
    ...(apply === undefined ? {} : { apply }),
    ...(info === undefined ? {} : { info }),
    kind: 'value',
  }));

/**
 * Line 1. First token: methods (and versions, to start a response status line), once
 * something is typed or on Ctrl-Space. Third token of a request line (after method and
 * target): versions. The target and anything after the version: none.
 */
const startLineCompletions = (
  ctx: CodeEditorCompletionContext,
  http: CodeEditorHttpContext,
): CodeEditorCompletion[] | null => {
  const before = textBeforeCursor(ctx);
  if (WHITESPACE.test(before.charAt(0))) return null;
  const tokenIndex = before.split(WHITESPACE).length - 1;
  if (tokenIndex === 0) {
    if (!ctx.explicit && ctx.word.text === '') return null;
    return [...methodCompletions(), ...versionCompletions(' ')];
  }
  // Shown unprompted right after the space that follows the target.
  if (tokenIndex === 2 && http.messageKind === 'request') return versionCompletions('');
  return null;
};

/** Header lines: names for this message kind; present non-repeatable headers are skipped. */
const headerNameCompletions = (
  ctx: CodeEditorCompletionContext,
  http: CodeEditorHttpContext,
): CodeEditorCompletion[] | null => {
  if (textBeforeCursor(ctx) !== ctx.word.text) return null;
  if (!ctx.explicit && ctx.word.text === '') return null;
  const present = countHeaderNames(ctx.value);
  // The line being typed is not "already present".
  const current = headerNameOf(ctx.lineText);
  const currentCount = present.get(current);
  if (currentCount !== undefined) present.set(current, currentCount - 1);

  return HTTP_HEADERS.filter(
    header =>
      (header.direction === 'both' || header.direction === http.messageKind) &&
      (header.repeatable === true || (present.get(header.name.toLowerCase()) ?? 0) === 0),
  ).map(header => ({
    label: header.name,
    apply: `${header.name}: `,
    detail: DIRECTION_DETAIL[header.direction],
    info: header.description,
    kind: 'header',
  }));
};

/** Header values keyed on the lowercased header name. Shown unprompted at the start of a value. */
const headerValueCompletions = (
  ctx: CodeEditorCompletionContext,
  http: CodeEditorHttpContext,
): CodeEditorCompletion[] | null => {
  // `Name:value` without a space: the completion word swallowed the colon.
  if (ctx.word.text.includes(':')) return null;
  const name = http.headerName?.trim().toLowerCase() ?? '';
  const values = HTTP_HEADER_VALUES[name];
  if (!values) return null;
  const before = textBeforeCursor(ctx);
  const valueSoFar = before.slice(before.indexOf(':') + 1);
  const typedBeforeWord = valueSoFar.slice(0, valueSoFar.length - ctx.word.text.length);

  if (MEDIA_TYPE_HEADERS.has(name) && typedBeforeWord.includes(';')) {
    return valueCompletions(HTTP_MEDIA_TYPE_PARAMETERS);
  }
  if (typedBeforeWord.trim() !== '') {
    // Past the first token (`gzip, |`): only on Ctrl-Space.
    return ctx.explicit ? valueCompletions(values) : null;
  }
  return valueCompletions(values);
};

/**
 * Built-in HTTP completion source (spec §7.14): methods and versions on the start line,
 * header names on header lines, common values for well-known headers. Pure — reads only
 * the `CodeEditorCompletionContext`, so consumers can wrap or filter it.
 */
export const httpCompletions: CodeEditorCompletionSource = ctx => {
  const { http } = ctx;
  if (!http) return null;
  if (http.section === 'start-line') return startLineCompletions(ctx, http);
  if (http.section === 'header-name') return headerNameCompletions(ctx, http);
  if (http.section === 'header-value') return headerValueCompletions(ctx, http);
  return null;
};
```

- [ ] **Step 8: Run the lib tests — expect pass**

Run: `pnpm vitest run src/components/CodeEditor/lib/httpCompletions.test.ts src/components/CodeEditor/lib/httpCompletionsData.test.ts`
Expected: PASS (26 tests).

- [ ] **Step 9: Lint and commit**

```bash
pnpm exec biome check src/components/CodeEditor/lib/httpCompletionsData.ts src/components/CodeEditor/lib/httpCompletionsData.test.ts src/components/CodeEditor/lib/httpCompletions.ts src/components/CodeEditor/lib/httpCompletions.test.ts
git add src/components/CodeEditor/lib/httpCompletionsData.ts src/components/CodeEditor/lib/httpCompletionsData.test.ts src/components/CodeEditor/lib/httpCompletions.ts src/components/CodeEditor/lib/httpCompletions.test.ts
git commit -m "feat(code-editor): add HTTP completion data and httpCompletions source

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 10: Write the failing `buildCompletionContext` tests**

Create `src/components/CodeEditor/engine/completion.context.test.ts`. `CompletionContext` is constructed directly, so no view is needed:

```ts
import { CompletionContext } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import type { CodeEditorLanguage } from '../types';
import { buildCompletionContext } from './completion';
import { languageExtension } from './languages';

/** `|` marks the cursor. */
const contextFor = (
  docWithCursor: string,
  language: CodeEditorLanguage,
  { explicit = false, startingLineNumber = 1 } = {},
) => {
  const pos = docWithCursor.indexOf('|');
  const state = EditorState.create({
    doc: docWithCursor.replace('|', ''),
    extensions: languageExtension(language),
  });
  return buildCompletionContext(
    new CompletionContext(state, pos, explicit),
    language,
    startingLineNumber,
  );
};

describe('buildCompletionContext', () => {
  it('reports value, absolute position, line text, word and explicit', () => {
    const ctx = contextFor('first\nsecond wo|rd', 'text', {
      explicit: true,
      startingLineNumber: 10,
    });
    expect(ctx).toEqual({
      value: 'first\nsecond word',
      position: { line: 11, column: 10 },
      lineText: 'second word',
      word: { text: 'wo', from: { line: 11, column: 8 } },
      explicit: true,
    });
  });

  it('includes dashes, slashes, dots and colons in the word', () => {
    expect(contextFor('Content-Type: application/js|', 'text').word).toEqual({
      text: 'application/js',
      from: { line: 1, column: 15 },
    });
    expect(contextFor('GET /api HTTP/1.|', 'text').word.text).toBe('HTTP/1.');
  });

  it('returns an empty word at the cursor after whitespace', () => {
    expect(contextFor('a |', 'text').word).toEqual({ text: '', from: { line: 1, column: 3 } });
  });

  it('adds the http context only for http', () => {
    const doc = 'POST /api HTTP/1.1\nContent-Type: app|';
    expect(contextFor(doc, 'http').http).toEqual({
      section: 'header-value',
      headerName: 'Content-Type',
      messageKind: 'request',
    });
    expect(contextFor(doc, 'text')).not.toHaveProperty('http');
    expect(contextFor('HTTP/1.1 200 OK\nSe|', 'http').http).toEqual({
      section: 'header-name',
      messageKind: 'response',
    });
  });

  it('adds the JSON pointer in a JSON document', () => {
    expect(contextFor('{"a": {"b": 1|}}', 'json').jsonPointer).toBe('/a/b');
    expect(contextFor('{"a": 1|}', 'yaml')).not.toHaveProperty('jsonPointer');
  });

  it('adds the JSON pointer in an HTTP JSON body only', () => {
    const doc = 'POST /api HTTP/1.1\nContent-Type: application/json\n\n{"user": {"name": "x|"}}';
    const ctx = contextFor(doc, 'http');
    expect(ctx.http?.section).toBe('body');
    expect(ctx.jsonPointer).toBe('/user/name');
    expect(contextFor('POST /api HTTP/1.1\nHo|', 'http')).not.toHaveProperty('jsonPointer');
  });
});
```

- [ ] **Step 11: Write the failing integration tests**

Create `src/components/CodeEditor/engine/completion.test.ts`. It mounts a real `EditorView` with only the language and `completionExtension`. The view is focused first, and completion runs asynchronously, so the test waits with `vi.waitFor`. `acceptCompletion` is ignored during CM's 75 ms `interactionDelay`, so it is retried inside `waitFor`. This engine unit test may query CM classes (`.cm-tooltip-autocomplete`), as the Global Constraints allow:

```ts
import {
  acceptCompletion,
  completionStatus,
  currentCompletions,
  startCompletion,
} from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  CodeEditorCompletionContext,
  CodeEditorCompletionSource,
  CodeEditorLanguage,
  JsonSchema,
} from '../types';
import { completionExtension } from './completion';
import { languageExtension } from './languages';

const views: EditorView[] = [];

afterEach(() => {
  for (const view of views.splice(0)) {
    view.dom.parentElement?.remove();
    view.destroy();
  }
});

interface MountConfig {
  language?: CodeEditorLanguage;
  schema?: JsonSchema;
  sources?: readonly CodeEditorCompletionSource[];
  startingLineNumber?: number;
}

/** `|` marks the cursor. The view is focused: CodeMirror only completes in a focused editor. */
const mount = (docWithCursor: string, config: MountConfig = {}): EditorView => {
  const language = config.language ?? 'text';
  const pos = docWithCursor.indexOf('|');
  const parent = document.createElement('div');
  document.body.append(parent);
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: docWithCursor.replace('|', ''),
      selection: { anchor: pos },
      extensions: [
        languageExtension(language),
        completionExtension({
          language,
          schema: config.schema,
          sources: config.sources ?? [],
          startingLineNumber: config.startingLineNumber ?? 1,
        }),
      ],
    }),
  });
  views.push(view);
  view.focus();
  return view;
};

/** `acceptCompletion` is ignored during CodeMirror's 75 ms interaction delay, so retry it. */
const accept = async (view: EditorView, line: number, expected: string): Promise<void> => {
  await vi.waitFor(() => {
    acceptCompletion(view);
    expect(view.state.doc.line(line).text).toBe(expected);
  });
};

const openCompletions = async (view: EditorView, timeout = 1000): Promise<string[]> => {
  startCompletion(view);
  await vi.waitFor(() => expect(completionStatus(view.state)).toBe('active'), { timeout });
  return currentCompletions(view.state).map(completion => completion.label);
};

describe('completionExtension', () => {
  it('adds nothing when there is no source', () => {
    expect(
      completionExtension({
        language: 'text',
        schema: undefined,
        sources: [],
        startingLineNumber: 1,
      }),
    ).toEqual([]);
  });

  it('completes HTTP methods on the start line', async () => {
    const view = mount('PO|', { language: 'http' });
    expect(await openCompletions(view)).toContain('POST');
  });

  it('completes HTTP header names and applies `Name: `', async () => {
    const view = mount('GET / HTTP/1.1\nContent-Ty|', { language: 'http' });
    expect(await openCompletions(view)).toContain('Content-Type');
    await accept(view, 2, 'Content-Type: ');
  });

  it('reopens the list with values after a header name is picked', async () => {
    const view = mount('GET / HTTP/1.1\nConnecti|', { language: 'http' });
    await openCompletions(view);
    await accept(view, 2, 'Connection: ');
    await vi.waitFor(() =>
      expect(currentCompletions(view.state).map(item => item.label)).toEqual([
        'close',
        'keep-alive',
      ]),
    );
  });

  it('completes Content-Type values', async () => {
    const view = mount('POST / HTTP/1.1\nContent-Type: application/js|', { language: 'http' });
    expect(await openCompletions(view)).toEqual(
      expect.arrayContaining(['application/json', 'application/json; charset=utf-8']),
    );
    await accept(view, 2, 'Content-Type: application/json');
  });

  it('does not add the HTTP source for other languages', async () => {
    const source = vi.fn<CodeEditorCompletionSource>(() => [{ label: 'POLICY' }]);
    const view = mount('PO|', { language: 'text', sources: [source] });
    expect(await openCompletions(view)).toEqual(['POLICY']);
  });

  it('passes the public context to consumer sources and shows their results', async () => {
    const source = vi.fn<CodeEditorCompletionSource>(() => [
      {
        label: 'X-Tenant-Id',
        apply: 'X-Tenant-Id: ',
        detail: 'tenant',
        info: 'Tenant header',
        kind: 'header',
      },
    ]);
    const view = mount('GET / HTTP/1.1\nX-Ten|', {
      language: 'http',
      sources: [source],
      startingLineNumber: 5,
    });
    expect(await openCompletions(view)).toContain('X-Tenant-Id');
    const ctx: CodeEditorCompletionContext | undefined = source.mock.calls.at(-1)?.[0];
    expect(ctx).toEqual({
      value: 'GET / HTTP/1.1\nX-Ten',
      position: { line: 6, column: 6 },
      lineText: 'X-Ten',
      word: { text: 'X-Ten', from: { line: 6, column: 1 } },
      explicit: true,
      http: { section: 'header-name', messageKind: 'request' },
    });
    const option = currentCompletions(view.state).find(item => item.label === 'X-Tenant-Id');
    expect(option).toMatchObject({ detail: 'tenant', info: 'Tenant header', type: 'property' });
    await accept(view, 2, 'X-Tenant-Id: ');
  });

  it('awaits async consumer sources', async () => {
    const source: CodeEditorCompletionSource = async () => [{ label: 'later', kind: 'value' }];
    const view = mount('la|', { sources: [source] });
    expect(await openCompletions(view)).toEqual(['later']);
  });

  it('merges built-in and consumer results', async () => {
    const source: CodeEditorCompletionSource = () => [{ label: 'PURGE', apply: 'PURGE ' }];
    const view = mount('P|', { language: 'http', sources: [source] });
    expect(await openCompletions(view)).toEqual(expect.arrayContaining(['POST', 'PURGE']));
  });

  it('ignores null and empty consumer results', async () => {
    const nothing: CodeEditorCompletionSource = () => null;
    const empty: CodeEditorCompletionSource = () => [];
    const view = mount('PO|', { language: 'http', sources: [nothing, empty] });
    expect(await openCompletions(view)).toContain('POST');
  });

  it('adds the schema source when a schema is set', async () => {
    const schema: JsonSchema = { type: 'object', properties: { name: { type: 'string' } } };
    const view = mount('{|}', { language: 'json', schema });
    // First use lazy-loads json-schema-library (T13), hence the longer timeout.
    const labels = await openCompletions(view, 5000);
    expect(labels.some(label => label.includes('name'))).toBe(true);
  });

  it('puts DS menu classes on the list and its options', async () => {
    const view = mount('PO|', { language: 'http' });
    await openCompletions(view);
    await vi.waitFor(() =>
      expect(view.dom.querySelector('.cm-tooltip-autocomplete')).not.toBeNull(),
    );
    const tooltip = view.dom.querySelector('.cm-tooltip-autocomplete');
    expect(tooltip).toHaveClass('bg-bg-surface-2!', 'rounded-12', 'shadow-md');
    expect(tooltip?.querySelector('li')).toHaveClass(
      'rounded-6',
      'aria-selected:bg-states-primary-hover!',
    );
  });
});
```

- [ ] **Step 12: Run both — expect failure**

Run: `pnpm vitest run src/components/CodeEditor/engine/completion.context.test.ts src/components/CodeEditor/engine/completion.test.ts`
Expected: FAIL — `Failed to resolve import "./completion"`.

- [ ] **Step 13: Implement `engine/completion.ts`**

Create `src/components/CodeEditor/engine/completion.ts`:

```ts
import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
  type CompletionSource,
} from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { cn } from '../../../utils/cn';
import { dropdownMenuItemVariants } from '../../DropdownMenu/classes';
import { httpCompletions } from '../lib/httpCompletions';
import type {
  CodeEditorCompletion,
  CodeEditorCompletionContext,
  CodeEditorCompletionSource,
  CodeEditorLanguage,
  JsonSchema,
} from '../types';
import { jsonRegion } from './diagnostics';
import { httpContextAt } from './languages';
import { pointerAt } from './languages/jsonPointers';
import { offsetToPosition } from './positions';
import { schemaCompletionSource } from './schema/complete';

/** The "word" a completion replaces: identifiers, header names, media types, paths, versions. */
const COMPLETION_WORD = /[\w\-/.:]*/;

/** CodeMirror `Completion.type` (drives the `cm-completionIcon-*` class) per public kind. */
const KIND_TO_TYPE: Record<NonNullable<CodeEditorCompletion['kind']>, string> = {
  keyword: 'keyword',
  property: 'property',
  value: 'constant',
  method: 'method',
  header: 'property',
  snippet: 'text',
  text: 'text',
};

/**
 * DS popover surface (DropdownMenu content look). `!` where CodeMirror's base theme sets the
 * same property with a higher-specificity selector (`.cm-tooltip` border / background).
 */
const COMPLETION_TOOLTIP_CLASS = cn(
  'overflow-hidden rounded-12 border border-border-primary-light! bg-bg-surface-2! p-4',
  'font-sans text-text-primary shadow-md',
);

/** DropdownMenu item look; `aria-selected` is how CodeMirror marks the active option. */
const COMPLETION_OPTION_CLASS = cn(
  dropdownMenuItemVariants({ variant: 'default' }),
  'px-8! py-6!',
  'aria-selected:bg-states-primary-hover! aria-selected:text-text-primary!',
);

/** Layout overrides for the option list; a theme outranks CodeMirror's base theme. */
const completionTheme = EditorView.theme({
  '.cm-tooltip.cm-tooltip-autocomplete > ul': {
    fontFamily: 'inherit',
    maxHeight: '240px',
    minWidth: '200px',
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
    lineHeight: '20px',
  },
  '.cm-completionDetail': {
    marginLeft: 'auto',
    fontStyle: 'normal',
    color: 'var(--color-text-secondary)',
  },
  '.cm-completionMatchedText': {
    textDecoration: 'none',
    fontWeight: '600',
  },
  '.cm-tooltip.cm-completionInfo': {
    padding: '6px 8px',
  },
});

const completionWord = (ctx: CompletionContext): { from: number; text: string } =>
  ctx.matchBefore(COMPLETION_WORD) ?? { from: ctx.pos, text: '' };

const isJsonLike = (language: CodeEditorLanguage): boolean =>
  language === 'json' || language === 'http';

const jsonPointerAt = (
  ctx: CompletionContext,
  language: CodeEditorLanguage,
): string | undefined => {
  if (!isJsonLike(language)) return undefined;
  const region = jsonRegion(ctx.state, language);
  if (!region || ctx.pos < region.from || ctx.pos > region.to) return undefined;
  return pointerAt(ctx.state, ctx.pos, region);
};

/** Public, engine-free view of a CodeMirror completion request (spec §4). */
export const buildCompletionContext = (
  ctx: CompletionContext,
  language: CodeEditorLanguage,
  startingLineNumber: number,
): CodeEditorCompletionContext => {
  const { doc } = ctx.state;
  const word = completionWord(ctx);
  const http = language === 'http' ? httpContextAt(ctx.state, ctx.pos) : undefined;
  const jsonPointer = jsonPointerAt(ctx, language);
  return {
    value: doc.toString(),
    position: offsetToPosition(doc, ctx.pos, startingLineNumber),
    lineText: doc.lineAt(ctx.pos).text,
    word: { text: word.text, from: offsetToPosition(doc, word.from, startingLineNumber) },
    explicit: ctx.explicit,
    ...(http === undefined ? {} : { http }),
    ...(jsonPointer === undefined ? {} : { jsonPointer }),
  };
};

const toCompletion = (item: CodeEditorCompletion): Completion => ({
  label: item.label,
  apply: item.apply,
  detail: item.detail,
  info: item.info,
  type: item.kind === undefined ? undefined : KIND_TO_TYPE[item.kind],
});

/** Adapts a public `CodeEditorCompletionSource` to a CodeMirror `CompletionSource`. */
const adaptSource = (
  source: CodeEditorCompletionSource,
  language: CodeEditorLanguage,
  startingLineNumber: number,
): CompletionSource => {
  return ctx => {
    const from = completionWord(ctx).from;
    const finish = (items: CodeEditorCompletion[] | null): CompletionResult | null =>
      items && items.length > 0 ? { from, options: items.map(toCompletion) } : null;
    const result = source(buildCompletionContext(ctx, language, startingLineNumber));
    return result instanceof Promise ? result.then(finish) : finish(result);
  };
};

/** Re-open the list after a `Name: ` header (or `"key": `) pick, so values show up at once. */
const reopensAfter = (completion: Completion): boolean =>
  typeof completion.apply === 'string' && completion.apply.endsWith(': ');

/**
 * Autocomplete (spec §7.14): built-in HTTP source for `http`, the JSON Schema source when
 * `schema` is set, then consumer sources, all through `override` (language-data sources are
 * off). `completionKeymap` comes with `defaultKeymap: true` at `Prec.highest`, so Enter,
 * arrows and Escape reach the open list before `indentWithTab` / fullscreen Escape.
 */
export const completionExtension = (config: {
  language: CodeEditorLanguage;
  schema: JsonSchema | undefined;
  sources: readonly CodeEditorCompletionSource[];
  startingLineNumber: number;
}): Extension => {
  const { language, schema, sources, startingLineNumber } = config;
  const override: CompletionSource[] = [];
  if (language === 'http') {
    override.push(adaptSource(httpCompletions, language, startingLineNumber));
  }
  if (schema !== undefined && isJsonLike(language)) {
    override.push(
      schemaCompletionSource(
        () => schema,
        state => jsonRegion(state, language),
      ),
    );
  }
  for (const source of sources) {
    override.push(adaptSource(source, language, startingLineNumber));
  }
  if (override.length === 0) return [];

  return [
    autocompletion({
      override,
      activateOnTyping: true,
      activateOnCompletion: reopensAfter,
      defaultKeymap: true,
      icons: false,
      tooltipClass: () => COMPLETION_TOOLTIP_CLASS,
      optionClass: () => COMPLETION_OPTION_CLASS,
    }),
    completionTheme,
  ];
};
```

Why `!` on some classes: CodeMirror's base theme sets `.cm-tooltip` border and background and `li[aria-selected]` background and colour through `.ͼ2 …` selectors, which are more specific than a Tailwind utility. Tailwind v4's `!` suffix is already used in `engine/theme.ts`. The literal class strings sit in `src/`, so Tailwind's source scan generates them.

- [ ] **Step 14: Run both — expect pass**

Run: `pnpm vitest run src/components/CodeEditor/engine/completion.context.test.ts src/components/CodeEditor/engine/completion.test.ts`
Expected: PASS (6 + 12 tests). If `adds the schema source when a schema is set` fails, check T13's `schemaCompletionSource` offers property names at `{|}`. The assertion only requires a label containing `name`, so T13 may quote the label or not.

- [ ] **Step 15: Write the failing registration test**

Create `src/components/CodeEditor/engine/completion.engine.test.ts`:

```ts
import { completionStatus, currentCompletions, startCompletion } from '@codemirror/autocomplete';
import { EditorSelection } from '@codemirror/state';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';
import type { CodeEditorCompletionSource } from '../types';

afterEach(unmountAllEngines);

const labelsAfterStart = async (view: Parameters<typeof startCompletion>[0]): Promise<string[]> => {
  view.focus();
  startCompletion(view);
  await vi.waitFor(() => expect(completionStatus(view.state)).toBe('active'));
  return currentCompletions(view.state).map(completion => completion.label);
};

describe('createEditor completion compartment', () => {
  it('wires the HTTP source for language http', async () => {
    const { handle } = mountEngine({ value: 'PO', language: 'http' });
    handle.view.dispatch({ selection: EditorSelection.cursor(2) });
    expect(await labelsAfterStart(handle.view)).toContain('POST');
  });

  it('reconfigures when completions change', async () => {
    const source: CodeEditorCompletionSource = () => [{ label: 'tenant-a' }];
    const engine = mountEngine({ value: 'ten', language: 'text' });
    engine.handle.view.dispatch({ selection: EditorSelection.cursor(3) });
    // No source for `text` → no autocompletion extension at all.
    expect(startCompletion(engine.handle.view)).toBe(false);

    engine.rerender({ completions: [source] });
    expect(await labelsAfterStart(engine.handle.view)).toEqual(['tenant-a']);
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/completion.engine.test.ts`
Expected: FAIL — `wires the HTTP source for language http` times out in `waitFor` (`expected null to be 'active'`), because the `completion` compartment is still `[]`.

- [ ] **Step 16: Register the extension in the `completion` compartment**

In `src/components/CodeEditor/engine/index.ts`:

1. Add the import next to the other relative imports (biome sorts it):

```ts
import { completionExtension } from './completion';
```

2. In `featureExtensions`, replace the placeholder entry

```ts
  completion: () => [],
```

with

```ts
  completion: () =>
    completionExtension({
      language: options.language,
      schema: options.schema,
      sources: options.completions,
      startingLineNumber: options.startingLineNumber,
    }),
```

If the first parameter of `featureExtensions` is still named `_options` (it is renamed once an earlier feature task uses it), rename it to `options`. `SLOT_DEPS.completion` already lists `['language', 'schema', 'completions', 'startingLineNumber']`, so leave it alone. Also leave alone the `baseExtensions` comment saying `completionKeymap` comes with its feature extension.

Run: `pnpm vitest run src/components/CodeEditor/engine/completion.engine.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 17: Write the failing public-export test**

Create `src/components/CodeEditor/index.exports.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import * as CodeEditor from './index';
import { httpCompletions } from './lib/httpCompletions';

describe('CodeEditor public exports', () => {
  it('exports the built-in HTTP completion source', () => {
    expect(CodeEditor.httpCompletions).toBe(httpCompletions);
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/index.exports.test.ts`
Expected: FAIL — `expected undefined to be [Function httpCompletions]`.

- [ ] **Step 18: Export `httpCompletions`**

In `src/components/CodeEditor/index.ts`, after the line

```ts
export { CODE_EDITOR_KEYBOARD_HINT } from './lib/keyboardHint';
```

add

```ts
export { httpCompletions } from './lib/httpCompletions';
```

(`lib/httpCompletions.ts` has no CodeMirror imports, so the main chunk stays engine-free.)

Run: `pnpm vitest run src/components/CodeEditor/index.exports.test.ts`
Expected: PASS.

- [ ] **Step 19: Full CodeEditor suite, typecheck, lint**

```bash
pnpm vitest run src/components/CodeEditor src/components/CodeSnippet
pnpm exec tsc --build tsconfig.app.json --noEmit
pnpm exec biome check src/components/CodeEditor/engine/completion.ts src/components/CodeEditor/engine/completion.context.test.ts src/components/CodeEditor/engine/completion.test.ts src/components/CodeEditor/engine/completion.engine.test.ts src/components/CodeEditor/engine/index.ts src/components/CodeEditor/index.ts src/components/CodeEditor/index.exports.test.ts
```

Expected: all tests PASS (the existing CodeSnippet tests stay green); tsc exits 0; biome reports no errors. If biome only reports formatting, run `pnpm exec biome check --write` on the same paths.

- [ ] **Step 20: Commit**

```bash
git add src/components/CodeEditor/engine/completion.ts src/components/CodeEditor/engine/completion.context.test.ts src/components/CodeEditor/engine/completion.test.ts src/components/CodeEditor/engine/completion.engine.test.ts src/components/CodeEditor/engine/index.ts src/components/CodeEditor/index.ts src/components/CodeEditor/index.exports.test.ts
git commit -m "feat(code-editor): wire autocomplete with HTTP, schema and consumer sources

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Notes for later tasks:
- T16 `ANALYTICS_GAPS.md`: the autocomplete option list is CM DOM (a closed target). The workaround is the `apply` text and `onChange`.
- T17 "autocomplete open" story: `startCompletion` needs a focused view. `completions` should be referentially stable (a module constant or `useMemo`), because each new array reconfigures the compartment and closes an open list.

---

### Task 15: Diff mode

Spec: §7.15, D7 (plus §7.5 "deleted rows get no number"). This task adds `engine/diff.ts` and teaches the Task 7 gutters about diff mode. It also fills the `diff` feature compartment in `engine/index.ts`, and adds an RTL test and a `Diff` story.

**Design decisions (verified in `/private/tmp/claude-501/plan-t15` against `@codemirror/merge@6.12.2` / `@codemirror/view@6.43.13`; all 38 sandbox tests pass, including Task 7's `gutters.test.ts` / `lines.test.ts` against the modified `gutters.ts`):**
- **One prefix column and one colour stick, not an extra gutter.** `guttersExtension` gets an optional `diff?: boolean`. When it is set, the stick and prefix gutters it already owns look up the diff first: an inserted line gets a `success` stick and `+`, a deleted-chunk widget gets a `danger` stick and one `-` per deleted row. So "diff styling wins" (spec §7.15) holds without two `+` / prefix columns. The flag is optional, so Task 7's tests and other callers compile unchanged.
- **How deleted rows are found.** The merge deletion widget is a block widget with `side: -1` placed at `chunk.fromB`. A gutter sees it as a `BlockInfo` with `type === BlockType.WidgetBefore` and `from === chunk.fromB`. `DeletionWidget` is not exported, so it is identified this way. Every chunk also gets an empty widget, even a pure insertion. `fromA >= toA` is filtered out, so that widget gets no gutter cells.
- **No line number on deleted rows.** The line-number gutter's `widgetMarker` only reads `lineNumberWidgetMarker`, which nothing registers, so the cell has no text. `gutterWidgetClass` adds the `danger` background to every gutter cell beside the widget, so the blank line-number cell is still tinted.
- **Changing `original` works by plain compartment reconfigure.** `unifiedMergeView` uses `originalDoc.init()` / `ChunkField.init()`, and `@codemirror/state` re-creates a field whose `init` changed (`state/dist/index.js:1795`). No `updateOriginalDoc` effect is needed. Our decoration field is also installed through a fresh `.init()` per call so it rebuilds the same way.
- **Styling.** Decorations provided by the diff StateField use `LINE_COLOR_STYLES.success` classes: the line background, an innermost `Prec.highest` text-colour mark (beats token colours, like Task 7), `gutterLineClass` and `lineNumberMarkers`. Merge-owned DOM (`.cm-deletedChunk`, `.cm-changedText`, `.cm-deletedText`) cannot take Tailwind classes. It is themed with the same `--color-syntax-highlight-*` variables (`semantic.css` untouched). The theme also removes merge's own tints and underline gradients.
- **Intra-line changes.** They are bold plus the line colour, but only in chunks that *replace* lines. A wholly added or removed block would otherwise be bold everywhere. Deleted text is bolded via `.cm-deletedChunk:has(+ .cm-ds-diff-changed)`; browsers without `:has()` just skip the bold.
- `allowInlineDiffs: false` is passed explicitly. Its default is off, and inline diffs would hide deleted rows, which breaks D7.

**Files:**
- Create: `src/components/CodeEditor/engine/diff.ts`
- Create: `src/components/CodeEditor/engine/diff.test.ts`
- Create: `src/components/CodeEditor/engine/diff.engine.test.ts`
- Create: `src/components/CodeEditor/CodeEditor.diff.test.tsx`
- Modify: `src/components/CodeEditor/engine/gutters.ts` (Task 7)
- Modify: `src/components/CodeEditor/engine/index.ts` (Task 5; `featureExtensions` / `SLOT_DEPS`)
- Modify: `src/components/CodeEditor/CodeEditor.stories.tsx` (Task 10; append a `Diff` story)

**Interfaces:**
- Consumes:
  - `unifiedMergeView`, `getChunks`, `getOriginalDoc`, `type Chunk` from `@codemirror/merge`
  - `gutter`'s `widgetMarker(view, widget, block)` / `lineMarkerChange(update)`, `gutterWidgetClass`, `gutterLineClass`, `lineNumberMarkers`, `BlockType` from `@codemirror/view`
  - `LINE_COLOR_STYLES` (`CodeSnippet/lib/lineStyles`)
  - `PortalRegistry` (Task 3)
  - `guttersExtension`, `PREFIX_GUTTER_CLASS`, `STICK_GUTTER_CLASS`, plus the internal `getStickMarker`, `PrefixMarker`, `absoluteLineAt` (Task 7)
  - `createEditor` / `EngineOptions` / `featureExtensions` / `SLOT_DEPS` (Task 5)
  - `CodeEditorRoot` `original` prop threaded into `options.original` (Task 9)
- Produces:
  - `export const diffExtension: (config: DiffExtensionConfig) => Extension;` where `export interface DiffExtensionConfig { original: string; portals: PortalRegistry }`. This is the skeleton signature.
  - Internal to the engine (used by `gutters.ts` and tests):
    - `export const DIFF_INSERTED_CLASS = 'cm-ds-diff-inserted'`
    - `export const DIFF_CHANGED_CLASS = 'cm-ds-diff-changed'`
    - `export const DIFF_DELETED_CLASS = 'cm-ds-diff-deleted'`
    - `export const isDiffInsertedLine: (state: EditorState, lineFrom: number) => boolean`
    - `export const deletedRowCount: (state: EditorState, block: BlockInfo) => number`
    - `export const diffChunksChanged: (update: ViewUpdate) => boolean`
  - `GuttersConfig` gains `diff?: boolean`. The `guttersExtension` signature is otherwise unchanged.

- [ ] **Step 1: Write the failing engine-level diff test**

Create `src/components/CodeEditor/engine/diff.test.ts`:

```ts
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { LINE_COLOR_STYLES } from '../../CodeSnippet/lib/lineStyles';
import { createPortalRegistry } from '../lib/portalRegistry';
import { DIFF_CHANGED_CLASS, DIFF_DELETED_CLASS, DIFF_INSERTED_CLASS, diffExtension } from './diff';
import { guttersExtension, PREFIX_GUTTER_CLASS, STICK_GUTTER_CLASS } from './gutters';

const views: EditorView[] = [];

afterEach(() => {
  for (const view of views.splice(0)) {
    view.destroy();
    view.dom.remove();
  }
});

interface SetupOptions {
  original: string;
  value: string;
  lineNumbers?: boolean;
  lines?: Record<number, LineConfig>;
  startingLineNumber?: number;
}

const setup = ({
  original,
  value,
  lineNumbers = true,
  lines = {},
  startingLineNumber = 1,
}: SetupOptions): EditorView => {
  const portals = createPortalRegistry();
  const extensions: Extension[] = [
    diffExtension({ original, portals }),
    guttersExtension({
      lines,
      startingLineNumber,
      lineNumbers,
      foldGutter: null,
      portals,
      testId: undefined,
      diff: true,
    }),
  ];
  const parent = document.createElement('div');
  document.body.append(parent);
  const view = new EditorView({ parent, state: EditorState.create({ doc: value, extensions }) });
  views.push(view);
  return view;
};

const contentLines = (view: EditorView): HTMLElement[] =>
  Array.from(view.contentDOM.querySelectorAll<HTMLElement>(':scope > .cm-line'));

const gutterCells = (view: EditorView, gutterClass: string): HTMLElement[] =>
  Array.from(
    view.dom.querySelectorAll<HTMLElement>(`.cm-gutter.${gutterClass} > .cm-gutterElement`),
  ).filter(cell => cell.style.visibility !== 'hidden'); // skip the width spacer

const ORIGINAL = 'const a = 1;\nconsole.log("old message");\nexport default a;';
const MODIFIED =
  'const a = 1;\nconsole.log("new message");\nconsole.log("another");\nexport default a;';

describe('diffExtension — inserted lines', () => {
  it('gives inserted and changed lines the success line classes', () => {
    const view = setup({ original: ORIGINAL, value: MODIFIED });
    const [first, changed, added, last] = contentLines(view);

    expect(first?.classList.contains(DIFF_INSERTED_CLASS)).toBe(false);
    expect(last?.classList.contains(DIFF_INSERTED_CLASS)).toBe(false);
    for (const line of [changed, added]) {
      expect(line?.classList.contains(DIFF_INSERTED_CLASS)).toBe(true);
      expect(line?.classList.contains(LINE_COLOR_STYLES.success.bg)).toBe(true);
      // Line text colour as an inner mark, so it beats token colours.
      const mark = line?.querySelector(`span.${LINE_COLOR_STYLES.success.text.split(' ')[0]}`);
      expect(mark).not.toBeNull();
    }
    // The chunk replaces a line → it is a "changed" chunk (intra-line changes are emphasised).
    expect(changed?.classList.contains(DIFF_CHANGED_CLASS)).toBe(true);
  });

  it('marks intra-line changes with .cm-changedText', () => {
    const view = setup({ original: ORIGINAL, value: MODIFIED });
    const changed = contentLines(view)[1];
    const changedText = Array.from(changed?.querySelectorAll('.cm-changedText') ?? []).map(
      node => node.textContent,
    );
    expect(changedText.join('')).toContain('new');
    expect(changedText.join('')).not.toContain('console');
  });

  it('does not mark a wholly added block as changed', () => {
    const view = setup({ original: 'a\nc', value: 'a\nb\nc' });
    const added = contentLines(view)[1];
    expect(added?.classList.contains(DIFF_INSERTED_CLASS)).toBe(true);
    expect(added?.classList.contains(DIFF_CHANGED_CLASS)).toBe(false);
  });

  it('puts a success "+" prefix and a success stick next to inserted lines', () => {
    const view = setup({ original: 'a\nc', value: 'a\nb\nc' });
    const prefixes = gutterCells(view, PREFIX_GUTTER_CLASS);
    expect(prefixes).toHaveLength(1);
    expect(prefixes[0]?.textContent).toBe('+');
    expect(prefixes[0]?.className).toContain(LINE_COLOR_STYLES.success.text.split(' ')[0]);

    const sticks = gutterCells(view, STICK_GUTTER_CLASS);
    expect(sticks.map(cell => cell.classList.contains(LINE_COLOR_STYLES.success.border))).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('colours the line number of an inserted line', () => {
    const view = setup({ original: 'a\nc', value: 'a\nb\nc' });
    const numbers = gutterCells(view, 'cm-lineNumbers');
    expect(numbers.map(cell => cell.textContent)).toEqual(['1', '2', '3']);
    expect(numbers[1]?.classList.contains(DIFF_INSERTED_CLASS)).toBe(true);
    expect(numbers[1]?.className).toContain(LINE_COLOR_STYLES.success.bg);
  });
});

describe('diffExtension — deleted chunks', () => {
  it('renders deleted lines in a .cm-deletedChunk widget without syntax spans', () => {
    const view = setup({ original: 'a\nold 1\nold 2\nc', value: 'a\nc' });
    const chunk = view.contentDOM.querySelector('.cm-deletedChunk');
    expect(chunk).not.toBeNull();
    const deletedLines = Array.from(chunk?.querySelectorAll('.cm-deletedLine') ?? []);
    expect(deletedLines.map(line => line.textContent)).toEqual(['old 1', 'old 2']);
    // mergeControls: false → no accept / reject buttons.
    expect(chunk?.querySelector('button')).toBeNull();
  });

  it('puts one danger "-" per deleted row and a danger stick next to the widget', () => {
    const view = setup({ original: 'a\nold 1\nold 2\nc', value: 'a\nc' });
    const prefixes = gutterCells(view, PREFIX_GUTTER_CLASS);
    expect(prefixes).toHaveLength(1);
    expect(prefixes[0]?.className).toContain(LINE_COLOR_STYLES.danger.text.split(' ')[0]);
    expect(
      Array.from(prefixes[0]?.querySelectorAll('div') ?? []).map(row => row.textContent),
    ).toEqual(['-', '-']);

    const sticks = gutterCells(view, STICK_GUTTER_CLASS);
    // a, deleted widget, c
    expect(sticks).toHaveLength(3);
    expect(sticks[1]?.classList.contains(LINE_COLOR_STYLES.danger.border)).toBe(true);
    expect(sticks[1]?.classList.contains(DIFF_DELETED_CLASS)).toBe(true);
  });

  it('shows no line number on the deleted row, and numbers stay continuous', () => {
    const view = setup({
      original: 'a\nold\nc',
      value: 'a\nc',
      startingLineNumber: 10,
    });
    const numbers = gutterCells(view, 'cm-lineNumbers');
    expect(numbers.map(cell => cell.textContent)).toEqual(['10', '', '11']);
    expect(numbers[1]?.classList.contains(DIFF_DELETED_CLASS)).toBe(true);
    expect(numbers[1]?.className).toContain(LINE_COLOR_STYLES.danger.bg);
  });

  it('adds no gutter cells for the empty widget of a pure insertion', () => {
    const view = setup({ original: 'a\nc', value: 'a\nb\nc' });
    expect(gutterCells(view, 'cm-lineNumbers').map(cell => cell.textContent)).toEqual([
      '1',
      '2',
      '3',
    ]);
  });
});

describe('diffExtension — live updates', () => {
  it('re-diffs when the document is edited', () => {
    const view = setup({ original: 'a\nb', value: 'a\nb' });
    expect(view.contentDOM.querySelector(`.${DIFF_INSERTED_CLASS}`)).toBeNull();
    view.dispatch({ changes: { from: 2, insert: 'new\n' } });
    const lines = contentLines(view);
    expect(lines[1]?.textContent).toBe('new');
    expect(lines[1]?.classList.contains(DIFF_INSERTED_CLASS)).toBe(true);
    expect(gutterCells(view, PREFIX_GUTTER_CLASS).map(cell => cell.textContent)).toEqual(['+']);
  });

  it('diff styling wins over a `lines` colour on the same line', () => {
    const view = setup({
      original: 'a\nc',
      value: 'a\nb\nc',
      lines: { 2: { color: 'warning', prefix: '!' } },
    });
    const prefixes = gutterCells(view, PREFIX_GUTTER_CLASS);
    expect(prefixes.map(cell => cell.textContent)).toEqual(['+']);
    const sticks = gutterCells(view, STICK_GUTTER_CLASS);
    expect(sticks[1]?.classList.contains(LINE_COLOR_STYLES.success.border)).toBe(true);
    expect(sticks[1]?.classList.contains(LINE_COLOR_STYLES.warning.border)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/components/CodeEditor/engine/diff.test.ts`
Expected: FAIL. The suite cannot load: `Failed to resolve import "./diff"` / `Cannot find module './diff'`.

- [ ] **Step 3: Implement `engine/diff.ts`**

Create `src/components/CodeEditor/engine/diff.ts`:

```ts
import { type Chunk, getChunks, getOriginalDoc, unifiedMergeView } from '@codemirror/merge';
import {
  type EditorState,
  type Extension,
  Prec,
  type Range,
  RangeSet,
  StateField,
} from '@codemirror/state';
import {
  type BlockInfo,
  BlockType,
  Decoration,
  type DecorationSet,
  EditorView,
  GutterMarker,
  gutterLineClass,
  gutterWidgetClass,
  lineNumberMarkers,
  type ViewUpdate,
} from '@codemirror/view';
import { cn } from '../../../utils/cn';
import { LINE_COLOR_STYLES } from '../../CodeSnippet/lib/lineStyles';
import type { PortalRegistry } from '../lib/portalRegistry';

export interface DiffExtensionConfig {
  original: string;
  /** Reserved for ReactNode content in diff rows; the `+` / `-` markers are plain text. */
  portals: PortalRegistry;
}

/** Semantic hooks for the theme below (never used as test selectors in RTL tests). */
export const DIFF_INSERTED_CLASS = 'cm-ds-diff-inserted';
export const DIFF_CHANGED_CLASS = 'cm-ds-diff-changed';
export const DIFF_DELETED_CLASS = 'cm-ds-diff-deleted';

const success = LINE_COLOR_STYLES.success;

/** Class-only gutter marker (adds `elementClass` to the gutter cell, renders nothing). */
class DiffClassMarker extends GutterMarker {
  constructor(readonly elementClass: string) {
    super();
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof DiffClassMarker && other.elementClass === this.elementClass;
  }
}

const insertedGutterBackground = new DiffClassMarker(cn(DIFF_INSERTED_CLASS, success.bg));
const insertedNumberText = new DiffClassMarker(cn(DIFF_INSERTED_CLASS, success.text));
const deletedGutterBackground = new DiffClassMarker(
  cn(DIFF_DELETED_CLASS, LINE_COLOR_STYLES.danger.bg),
);

interface DiffDecorations {
  /** Identity of the merge chunk array these sets were built from. */
  chunks: readonly Chunk[] | null;
  /** Line starts (`line.from`) of every inserted / changed line in the current document. */
  insertedLines: ReadonlySet<number>;
  decorations: DecorationSet;
  gutterBackground: RangeSet<GutterMarker>;
  numberText: RangeSet<GutterMarker>;
}

const EMPTY: DiffDecorations = {
  chunks: null,
  insertedLines: new Set(),
  decorations: Decoration.none,
  gutterBackground: RangeSet.empty,
  numberText: RangeSet.empty,
};

const buildDiffDecorations = (state: EditorState): DiffDecorations => {
  const chunks = getChunks(state)?.chunks ?? null;
  if (!chunks) return EMPTY;

  const insertedLines = new Set<number>();
  const decorations: Range<Decoration>[] = [];
  const gutterBackground: Range<GutterMarker>[] = [];
  const numberText: Range<GutterMarker>[] = [];

  for (const chunk of chunks) {
    if (chunk.fromB >= chunk.toB) continue; // pure deletion: only the merge widget
    const changed = chunk.fromA < chunk.toA; // lines replaced, not only added
    const lineDecoration = Decoration.line({
      class: cn(DIFF_INSERTED_CLASS, changed && DIFF_CHANGED_CLASS, success.bg),
    });
    const textMark = Decoration.mark({ class: success.text });
    const first = state.doc.lineAt(chunk.fromB).number;
    const last = state.doc.lineAt(chunk.endB).number;
    for (let number = first; number <= last; number++) {
      const line = state.doc.line(number);
      insertedLines.add(line.from);
      decorations.push(lineDecoration.range(line.from));
      // Line text colour beats token colours (CodeSnippet `colorClass` precedence).
      if (line.length > 0) decorations.push(textMark.range(line.from, line.to));
      gutterBackground.push(insertedGutterBackground.range(line.from));
      numberText.push(insertedNumberText.range(line.from));
    }
  }

  return {
    chunks,
    insertedLines,
    decorations: Decoration.set(decorations, true),
    gutterBackground: RangeSet.of(gutterBackground, true),
    numberText: RangeSet.of(numberText, true),
  };
};

const diffDecorationsField = StateField.define<DiffDecorations>({
  create: buildDiffDecorations,
  update: (value, tr) =>
    getChunks(tr.state)?.chunks === value.chunks ? value : buildDiffDecorations(tr.state),
  provide: field => [
    EditorView.decorations.from(field, value => value.decorations),
    gutterLineClass.from(field, value => value.gutterBackground),
    lineNumberMarkers.from(field, value => value.numberText),
  ],
});

/** `true` when `lineFrom` is the start of an inserted or changed line of the current document. */
export const isDiffInsertedLine = (state: EditorState, lineFrom: number): boolean =>
  state.field(diffDecorationsField, false)?.insertedLines.has(lineFrom) ?? false;

/**
 * Number of original lines shown by the merge view's deleted-chunk widget for this gutter
 * block, or 0 when the block is not a (non-empty) deleted chunk. The merge view places
 * that widget as a block widget *before* `chunk.fromB`.
 */
export const deletedRowCount = (state: EditorState, block: BlockInfo): number => {
  if (block.type !== BlockType.WidgetBefore) return 0;
  const chunks = getChunks(state)?.chunks;
  if (!chunks) return 0;
  const chunk = chunks.find(candidate => candidate.fromB === block.from);
  if (!chunk || chunk.fromA >= chunk.toA) return 0;
  const original = getOriginalDoc(state);
  return original.lineAt(chunk.endA).number - original.lineAt(chunk.fromA).number + 1;
};

/** For gutter `lineMarkerChange`: the diff changed although the document may not have. */
export const diffChunksChanged = (update: ViewUpdate): boolean =>
  getChunks(update.startState)?.chunks !== getChunks(update.state)?.chunks;

/** Danger background on every gutter cell next to a deleted chunk (line numbers stay blank). */
const deletedGutterClass = gutterWidgetClass.of((view, _widget, block) =>
  deletedRowCount(view.state, block) > 0 ? deletedGutterBackground : null,
);

/**
 * Merge DOM (`.cm-deletedChunk`, `.cm-changedText`, …) cannot take Tailwind classes, so it is
 * themed here with the same tokens `LINE_COLOR_STYLES` uses (danger / success). The class
 * rules also make diff styling win over `lines` colours on the same line (spec §7.15).
 */
const diffTheme = EditorView.theme({
  [`.cm-line.${DIFF_INSERTED_CLASS}`]: {
    backgroundColor: 'var(--color-syntax-highlight-success-highlight)',
  },
  [`.cm-gutterElement.${DIFF_INSERTED_CLASS}`]: {
    backgroundColor: 'var(--color-syntax-highlight-success-highlight)',
  },
  [`.cm-lineNumbers .cm-gutterElement.${DIFF_INSERTED_CLASS}`]: {
    color: 'var(--color-syntax-highlight-success-code)',
  },
  [`.cm-gutterElement.${DIFF_DELETED_CLASS}`]: {
    backgroundColor: 'var(--color-syntax-highlight-error-highlight)',
  },
  // Deleted rows = `danger` line: background + code colour + font-medium, no syntax colours.
  '& .cm-deletedChunk': {
    backgroundColor: 'var(--color-syntax-highlight-error-highlight)',
    color: 'var(--color-syntax-highlight-error-code)',
    fontWeight: '500',
    paddingLeft: '0',
  },
  '& .cm-deletedChunk .cm-deletedLine': {
    padding: '0',
  },
  // Merge's own markers (tinted line backgrounds, underline gradients) are replaced.
  '&.cm-merge-b .cm-changedText, & .cm-deletedChunk .cm-deletedText, &.cm-merge-b .cm-deletedText':
    {
      background: 'none',
    },
  // Intra-line changes read like a `ranges` entry: bold + the line colour. Only in chunks
  // that replace lines — a wholly added / removed block has nothing to single out.
  [`.${DIFF_CHANGED_CLASS} .cm-changedText`]: {
    fontWeight: '700',
    color: 'var(--color-syntax-highlight-success-code)',
  },
  [`.cm-deletedChunk:has(+ .${DIFF_CHANGED_CLASS}) .cm-deletedText`]: {
    fontWeight: '700',
    color: 'var(--color-syntax-highlight-error-code)',
  },
});

/**
 * Diff mode (spec §7.15, D7): CodeMirror's unified merge view against `original`, restyled as
 * CodeSnippet `success` / `danger` lines. The `+` / `-` prefixes, colour sticks and blank line
 * numbers of deleted rows are drawn by `guttersExtension({ diff: true })`.
 */
export const diffExtension = (config: DiffExtensionConfig): Extension => [
  unifiedMergeView({
    original: config.original,
    highlightChanges: true,
    gutter: false,
    mergeControls: false,
    syntaxHighlightDeletions: false,
    allowInlineDiffs: false,
  }),
  // A fresh `.init` per call re-creates the field when the compartment is reconfigured with a
  // new `original` (the merge view re-initialises its chunk field the same way).
  Prec.highest(diffDecorationsField.init(buildDiffDecorations)),
  deletedGutterClass,
  diffTheme,
];
```

- [ ] **Step 4: Teach `engine/gutters.ts` (Task 7) about diff mode**

Make these edits in `src/components/CodeEditor/engine/gutters.ts`. The anchors are Task 7's code.

4a. Imports. After `import type { PortalRegistry } from '../lib/portalRegistry';` add:
```ts
import { deletedRowCount, diffChunksChanged, isDiffInsertedLine } from './diff';
```

4b. `GuttersConfig`. After `testId: string | undefined;` add:
```ts
  /** Diff mode (`original` set): `+` / `-` prefixes and colour sticks from the merge chunks. */
  diff?: boolean;
```

4c. Directly above `const absoluteLineAt = (state: EditorState, block: BlockInfo, startingLineNumber: number): number =>` insert:
```ts
/** Prefix cell of a deleted chunk: one `-` per deleted row (the widget is a single gutter block). */
class DeletedRowsMarker extends GutterMarker {
  readonly elementClass = cn('px-8 text-center', LINE_COLOR_STYLES.danger.text);

  constructor(readonly rows: number) {
    super();
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof DeletedRowsMarker && other.rows === this.rows;
  }

  override toDOM(view: EditorView): Node {
    const doc = view.dom.ownerDocument;
    const host = doc.createElement('span');
    for (let row = 0; row < this.rows; row++) {
      const cell = doc.createElement('div');
      cell.textContent = '-';
      host.append(cell);
    }
    return host;
  }
}
```

4d. In `guttersExtension`, replace the doc comment and the opening:
```ts
/**
 * Gutters in CodeSnippet order: colour stick (only if any line has `color`) → line numbers
 * (if `lineNumbers`) → fold gutter (if given) → prefix (only if any line has `prefix`).
 */
export const guttersExtension = (config: GuttersConfig): Extension => {
  const { lines, startingLineNumber, portals } = config;
  const configs = Object.values(lines);
  const hasColors = configs.some(line => line.color != null);
  const hasPrefixes = configs.some(line => line.prefix != null);

  if (!hasColors && !hasPrefixes && !config.lineNumbers && !config.foldGutter) {
    return [];
  }
```
with:
```ts
/**
 * Gutters in CodeSnippet order: colour stick (only if any line has `color`, or diff mode) →
 * line numbers (if `lineNumbers`) → fold gutter (if given) → prefix (only if any line has
 * `prefix`, or diff mode). In diff mode the diff marker wins over the line's own stick/prefix.
 */
export const guttersExtension = (config: GuttersConfig): Extension => {
  const { lines, startingLineNumber, portals } = config;
  const diff = config.diff === true;
  const configs = Object.values(lines);
  const hasColors = configs.some(line => line.color != null);
  const hasPrefixes = configs.some(line => line.prefix != null);

  if (!hasColors && !hasPrefixes && !diff && !config.lineNumbers && !config.foldGutter) {
    return [];
  }
```

4e. Replace `  if (hasColors) {` (the block that defines `classSets`) with `  if (hasColors || diff) {`. In the same block, replace the stick `gutter({...})`:
```ts
      gutter({
        class: STICK_GUTTER_CLASS,
        lineMarker: (view, block) =>
          getStickMarker(lines[absoluteLineAt(view.state, block, startingLineNumber)]?.color),
        initialSpacer: () => transparentStick,
      }),
```
with:
```ts
      gutter({
        class: STICK_GUTTER_CLASS,
        lineMarker: (view, block) =>
          getStickMarker(
            diff && isDiffInsertedLine(view.state, block.from)
              ? 'success'
              : lines[absoluteLineAt(view.state, block, startingLineNumber)]?.color,
          ),
        widgetMarker: (view, _widget, block) =>
          diff && deletedRowCount(view.state, block) > 0 ? getStickMarker('danger') : null,
        lineMarkerChange: diff ? diffChunksChanged : null,
        initialSpacer: () => transparentStick,
      }),
```

4f. Replace the prefix block:
```ts
  if (hasPrefixes) {
    extensions.push(
      gutter({
        class: PREFIX_GUTTER_CLASS,
        lineMarker: (view, block) => {
          const absolute = absoluteLineAt(view.state, block, startingLineNumber);
          const line = lines[absolute];
          if (line?.prefix == null) return null;
          return new PrefixMarker(absolute, line.prefix, line.color, portals);
        },
      }),
    );
  }
```
with:
```ts
  if (hasPrefixes || diff) {
    extensions.push(
      gutter({
        class: PREFIX_GUTTER_CLASS,
        lineMarker: (view, block) => {
          const absolute = absoluteLineAt(view.state, block, startingLineNumber);
          if (diff && isDiffInsertedLine(view.state, block.from)) {
            return new PrefixMarker(absolute, '+', 'success', portals);
          }
          const line = lines[absolute];
          if (line?.prefix == null) return null;
          return new PrefixMarker(absolute, line.prefix, line.color, portals);
        },
        widgetMarker: (view, _widget, block) => {
          if (!diff) return null;
          const rows = deletedRowCount(view.state, block);
          return rows > 0 ? new DeletedRowsMarker(rows) : null;
        },
        lineMarkerChange: diff ? diffChunksChanged : null,
      }),
    );
  }
```

If Task 7 landed with slightly different surrounding text, apply the same four behaviours:
- the `diff` flag
- stick and prefix gutters created when `diff` is set
- diff checked first in `lineMarker`
- `widgetMarker` and `lineMarkerChange` added

- [ ] **Step 5: Run the diff test and the Task 7 tests**

Run: `pnpm vitest run src/components/CodeEditor/engine/diff.test.ts src/components/CodeEditor/engine/gutters.test.ts src/components/CodeEditor/engine/lines.test.ts`
Expected: PASS. All 11 tests in `diff.test.ts` pass, and the Task 7 gutter/line tests are unchanged and green.

- [ ] **Step 6: Write the failing engine-integration and RTL tests**

Create `src/components/CodeEditor/engine/diff.engine.test.ts`:

```ts
import { getChunks, getOriginalDoc } from '@codemirror/merge';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import { createPortalRegistry } from '../lib/portalRegistry';
import { DIFF_INSERTED_CLASS } from './diff';
import { PREFIX_GUTTER_CLASS } from './gutters';
import { createEditor } from './index';
import type { EditorHandle, EngineOptions } from './types';

const plainAdapter: SyntaxAdapter<string> = {
  name: 'diff-test-plain',
  highlight: async code => ({
    tokens: code.split('\n').map(line => [{ content: line, type: 'plain' }]),
  }),
  getSupportedLanguages: () => ['text'],
};

const baseOptions = (overrides: Partial<EngineOptions>): EngineOptions => ({
  value: '',
  documentId: undefined,
  language: 'text',
  readOnly: false,
  wrapLines: false,
  startingLineNumber: 1,
  lineNumbers: true,
  lines: {},
  folds: undefined,
  adapter: plainAdapter,
  original: undefined,
  schema: undefined,
  completions: [],
  diagnostics: [],
  contentAttributes: {},
  testId: undefined,
  cspNonce: undefined,
  maxHeight: null,
  ...overrides,
});

const handles: EditorHandle[] = [];

afterEach(() => {
  for (const handle of handles.splice(0)) {
    handle.view.dom.parentElement?.remove();
    handle.destroy();
  }
});

const mount = (overrides: Partial<EngineOptions>) => {
  const parent = document.createElement('div');
  document.body.append(parent);
  let options = baseOptions(overrides);
  const handle = createEditor(parent, options, {
    onChange: vi.fn(),
    onDiagnosticsChange: vi.fn(),
    onVisibleRowCountChange: vi.fn(),
    portals: createPortalRegistry(),
  });
  handles.push(handle);
  return {
    handle,
    rerender: (next: Partial<EngineOptions>) => {
      options = { ...options, ...next };
      handle.update(options);
    },
  };
};

const prefixTexts = (handle: EditorHandle): string[] =>
  Array.from(
    handle.view.dom.querySelectorAll<HTMLElement>(
      `.cm-gutter.${PREFIX_GUTTER_CLASS} > .cm-gutterElement`,
    ),
  )
    .filter(cell => cell.style.visibility !== 'hidden')
    .map(cell => cell.textContent ?? '');

const insertedLineTexts = (handle: EditorHandle): string[] =>
  Array.from(handle.view.contentDOM.querySelectorAll(`.cm-line.${DIFF_INSERTED_CLASS}`)).map(
    line => line.textContent ?? '',
  );

describe('createEditor — diff compartment', () => {
  it('has no diff without `original`', () => {
    const { handle } = mount({ value: 'a\nb' });
    expect(getChunks(handle.view.state)).toBeNull();
    expect(handle.view.dom.querySelector('.cm-deletedChunk')).toBeNull();
    expect(prefixTexts(handle)).toEqual([]);
  });

  it('diffs against `original` when it is set', () => {
    const { handle } = mount({ value: 'a\nb\nc', original: 'a\nc' });
    expect(getOriginalDoc(handle.view.state).toString()).toBe('a\nc');
    expect(insertedLineTexts(handle)).toEqual(['b']);
    expect(prefixTexts(handle)).toEqual(['+']);
  });

  it('turns diff mode on after mount', () => {
    const { handle, rerender } = mount({ value: 'a\nb\nc' });
    rerender({ original: 'a\nd\nb\nc' });
    expect(handle.view.dom.querySelector('.cm-deletedChunk .cm-deletedLine')?.textContent).toBe(
      'd',
    );
    expect(prefixTexts(handle)).toEqual(['-']);
  });

  it('re-diffs when `original` changes', () => {
    const { handle, rerender } = mount({ value: 'a\nb\nc', original: 'a\nc' });
    rerender({ original: 'b\nc' });
    expect(getOriginalDoc(handle.view.state).toString()).toBe('b\nc');
    expect(insertedLineTexts(handle)).toEqual(['a']);
    expect(prefixTexts(handle)).toEqual(['+']);

    rerender({ original: 'a\nb\nc' });
    expect(getChunks(handle.view.state)?.chunks).toHaveLength(0);
    expect(insertedLineTexts(handle)).toEqual([]);
    expect(prefixTexts(handle)).toEqual([]);
  });

  it('removes the diff when `original` becomes undefined', () => {
    const { handle, rerender } = mount({ value: 'a\nb\nc', original: 'a\nold\nc' });
    expect(handle.view.dom.querySelector('.cm-deletedChunk')).not.toBeNull();
    rerender({ original: undefined });
    expect(getChunks(handle.view.state)).toBeNull();
    expect(handle.view.dom.querySelector('.cm-deletedChunk')).toBeNull();
    expect(insertedLineTexts(handle)).toEqual([]);
    expect(prefixTexts(handle)).toEqual([]);
    expect(handle.view.dom.classList.contains('cm-merge-b')).toBe(false);
  });

  it('re-diffs user edits in diff mode', () => {
    const { handle } = mount({ value: 'a', original: 'a' });
    handle.api.insertText('x');
    expect(handle.api.getValue()).toBe('xa');
    expect(insertedLineTexts(handle)).toEqual(['xa']);
  });
});
```

Create `src/components/CodeEditor/CodeEditor.diff.test.tsx`. It selects by `data-testid` only; `ed--editor` is `.cm-content` and `ed--gutter` is `.cm-gutters`, both from Task 5:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditorContent, CodeEditorRoot } from './index';

describe('CodeEditor — diff mode (original)', () => {
  it('shows deleted rows and +/- prefixes against `original`, and drops them without it', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CodeEditorRoot
        data-testid='ed'
        value={'a\nb\nc'}
        onChange={onChange}
        original={'a\nold\nc'}
      >
        <CodeEditorContent aria-label='Diff' lineNumbers />
      </CodeEditorRoot>,
    );

    const editor = await screen.findByTestId('ed--editor');
    await waitFor(() => expect(screen.getByTestId('ed--gutter')).toHaveTextContent('-'));
    expect(screen.getByTestId('ed--gutter')).toHaveTextContent('+');
    // The deleted original line is rendered (as a read-only widget) inside the editor.
    expect(editor).toHaveTextContent('old');

    rerender(
      <CodeEditorRoot data-testid='ed' value={'a\nb\nc'} onChange={onChange}>
        <CodeEditorContent aria-label='Diff' lineNumbers />
      </CodeEditorRoot>,
    );

    await waitFor(() => expect(screen.getByTestId('ed--editor')).not.toHaveTextContent('old'));
    expect(screen.getByTestId('ed--gutter')).not.toHaveTextContent('+');
    expect(screen.getByTestId('ed--gutter')).not.toHaveTextContent('-');
    // Diffing never edits the value.
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

Run: `pnpm vitest run src/components/CodeEditor/engine/diff.engine.test.ts src/components/CodeEditor/CodeEditor.diff.test.tsx`
Expected: FAIL. The `diff` compartment is still `[]`, so the tests that expect a diff fail:
- In `diff.engine.test.ts`, `getOriginalDoc` throws or chunks are `null`, and `prefixTexts` is `[]`.
- In `CodeEditor.diff.test.tsx`, the `waitFor(... toHaveTextContent('-'))` times out.

"has no diff without `original`" already passes.

- [ ] **Step 7: Register the diff compartment in `engine/index.ts`**

Edit `src/components/CodeEditor/engine/index.ts`.

7a. Imports. After `import { sanitizeContentAttributes } from './contentAttributes';` add `import { diffExtension } from './diff';`. Biome keeps it sorted.

7b. `SLOT_DEPS`: append `'original'` to the `lines` entry. With Task 5's text:
```ts
  lines: ['lines', 'startingLineNumber', 'lineNumbers', 'testId'],
```
becomes:
```ts
  lines: ['lines', 'startingLineNumber', 'lineNumbers', 'testId', 'original'],
```
If Task 8 already appended `'folds'`, keep it and add `'original'` last. The existing `diff: ['original'],` entry stays as is.

7c. `featureExtensions`: its parameters must be `options` / `callbacks`. Task 6/7 already renamed them from `_options` / `_callbacks`; rename them now if not. In the `lines` builder's `guttersExtension({ ... })` object literal, add the property below after `testId: options.testId,`:
```ts
      diff: options.original !== undefined,
```
Then replace:
```ts
  diff: () => [],
```
with:
```ts
  diff: () =>
    options.original === undefined
      ? []
      : diffExtension({ original: options.original, portals: callbacks.portals }),
```

Compartment reconfigure is enough to change `original`: the merge view re-initialises its `init`-ed fields. `undefined` gives `[]` and removes the merge fields, the `cm-merge-b` class and our decorations.

- [ ] **Step 8: Run the new tests and confirm they pass**

Run: `pnpm vitest run src/components/CodeEditor/engine/diff.engine.test.ts src/components/CodeEditor/CodeEditor.diff.test.tsx src/components/CodeEditor/engine/diff.test.ts`
Expected: PASS: 6 in `diff.engine.test.ts`, 1 in `CodeEditor.diff.test.tsx`, 11 in `diff.test.ts`.

- [ ] **Step 9: Add the `Diff` story**

Append to `src/components/CodeEditor/CodeEditor.stories.tsx`, after the last story. If `useState` is not yet imported from `react` in this file, add it to the existing `react` import, or add `import { useState } from 'react';`. `CodeEditorRoot`, `CodeEditorContent`, `StoryFn` and `meta` already exist from Task 10.

```tsx
const DIFF_ORIGINAL = `POST /api/v2/users HTTP/1.1
Host: api.wallarm.com
Content-Type: application/json
X-Request-Id: 42

{
  "name": "Ann",
  "role": "viewer"
}`;

const DIFF_MODIFIED = `POST /api/v2/users HTTP/1.1
Host: api.wallarm.com
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Ann",
  "role": "admin"
}`;

/**
 * `original` turns on diff mode: added and changed lines read as `success` lines with a `+`,
 * removed lines as `danger` rows with a `-` and no line number. The rows stay editable, and the
 * diff updates as you type.
 */
export const Diff: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(DIFF_MODIFIED);

  return (
    <CodeEditorRoot
      data-testid='code-editor-diff'
      language='http'
      original={DIFF_ORIGINAL}
      value={value}
      onChange={setValue}
    >
      <CodeEditorContent aria-label='Request draft compared with the stored request' lineNumbers />
    </CodeEditorRoot>
  );
};
```

- [ ] **Step 10: Typecheck, lint, and run the full CodeEditor + CodeSnippet suites**

Run these in parallel:
- `pnpm exec tsc --build tsconfig.app.json --noEmit`. Expected: no errors.
- `pnpm exec biome check src/components/CodeEditor/engine/diff.ts src/components/CodeEditor/engine/diff.test.ts src/components/CodeEditor/engine/diff.engine.test.ts src/components/CodeEditor/engine/gutters.ts src/components/CodeEditor/engine/index.ts src/components/CodeEditor/CodeEditor.diff.test.tsx src/components/CodeEditor/CodeEditor.stories.tsx`. Expected: no errors; if there are, run `pnpm exec biome check --write <same paths>` and re-run.
- `pnpm vitest run src/components/CodeEditor src/components/CodeSnippet`. Expected: PASS, including every earlier CodeEditor task's tests and the CodeSnippet suites.

- [ ] **Step 11: Commit**

```bash
git add packages/design-system/src/components/CodeEditor/engine/diff.ts \
  packages/design-system/src/components/CodeEditor/engine/diff.test.ts \
  packages/design-system/src/components/CodeEditor/engine/diff.engine.test.ts \
  packages/design-system/src/components/CodeEditor/engine/gutters.ts \
  packages/design-system/src/components/CodeEditor/engine/index.ts \
  packages/design-system/src/components/CodeEditor/CodeEditor.diff.test.tsx \
  packages/design-system/src/components/CodeEditor/CodeEditor.stories.tsx
git commit -m "$(cat <<'EOF'
feat(code-editor): add diff mode against an original value

`original` enables a unified diff built on @codemirror/merge: inserted and
changed lines render as success lines with a `+` prefix, deleted chunks as
danger rows with a `-` prefix and no line number, intra-line changes in bold.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

**Notes for reviewers / later tasks:**
- **Task 16 (`ANALYTICS_GAPS.md`):** deleted-chunk widgets are merge-owned DOM (closed target). Consumer attributes do not reach them, and the gutter `-` cells are plain markers.
- **Task 17 (axe on diff):** the deleted rows sit inside `.cm-content` (`role="textbox"`) as `contenteditable=false` widgets, so screen readers read them as part of the text. Check the axe result on the `Diff` story. The visual checks (bold intra-line changes, the `:has()` rule, the backgrounds winning over `lines` colours) are CSS only and are covered by screenshots, not jsdom.
- **Row count:** `getVisibleRowCount` (Task 8) counts document lines, not deleted rows. With `maxLines` in diff mode, the height clamp slightly under-counts when many lines are deleted. This is accepted for now.

---

### Task 16: Analytics & test-id hardening, ANALYTICS_GAPS.md, docs fix, announce

**Files:**
- Create: `src/components/CodeEditor/engine/folds.announce.test.ts`
- Create: `src/components/CodeEditor/engine/search.announce.test.tsx`
- Modify: `src/components/CodeEditor/engine/folds.ts` (only if T8 did not already add the announce, see Step 3)
- Modify: `src/components/CodeEditor/engine/search.ts`
- Create: `src/components/CodeEditor/CodeEditor.nesting.test.tsx`
- Create: `src/components/CodeEditor/CodeEditor.analytics.test.tsx`
- Modify: `src/components/CodeEditor/CodeEditor.stories.tsx` (add one story)
- Create: `src/components/CodeEditor/ANALYTICS_GAPS.md`
- Modify: `docs/metrics/contract.md` (repo root, line 87)
- Modify: `docs/metrics/new-component-checklist.md` (repo root, line **32**; the spec says 30, but the text is on line 32)

**Interfaces:**
- Consumes:
  - `CodeEditorRoot` / `CodeEditorContent` (T9). Props used: `data-testid`, `defaultValue`, `readOnly`, `folds`, `data-analytics-*` on both. `CodeEditorContent` sets `data-ds-suppress-parent-click` on its wrapper (T9).
  - Derived test ids: `{id}--content`, `{id}--editor`, `{id}--gutter` (T5 and T7, when `lineNumbers`), `{id}--fold-toggle`, `{id}--fold-summary` (T8), `{id}--copy-button`, `{id}--wrap-button`, `{id}--fullscreen-button` (phase 0).
  - Search panel test ids from T11: `{id}--search`, `{id}--replace-all`.
  - `toggleFoldRegion(view: EditorView, id: string): boolean` (T8, `engine/folds.ts`).
  - `searchExtension(config)` (T11, `engine/search.ts`).
  - `createEditor`, `EditorHandle`, `EngineOptions` (T5).
  - `engineOptions(overrides)`, `mountEngine(overrides)`, `unmountAllEngines()` from `src/testUtils/codeEditorEngine.ts` (T5).
  - `createPortalRegistry` and `PortalOutlet` (T3).
  - `captureAnalyticsClicks()` from `src/testUtils/captureAnalyticsClicks.ts`.
  - `Card`, `Popover`, `PopoverTrigger`, `PopoverContent`.
- Produces:
  - No new exports.
  - Internal (not exported) `const SEARCH_PHRASES: Record<string, string>` in `engine/search.ts`.
  - Announcement texts:
    - `Folded {label}` / `Unfolded {label}`, where label is `getFoldSummaryLabel(region, lineCount)` (either `label` or `N lines`).
    - `Replaced N occurrences.` The trailing period comes from `@codemirror/search`'s own `replaceAll`, which appends `"."` to the phrase (verified against `search/dist/index.js:971`).

> Verified facts this task relies on (read from the installed `@codemirror/view@6.43.13` and `@codemirror/search@6.7.2` dist and run under jsdom in `/private/tmp/claude-501/plan-t16/t.mjs`):
> - `EditorView.announce` effects are written synchronously into `view.dom > .cm-announced` (one child `<div>` per effect of the last update). A `setTimeout` of 200 ms then resets that element to `"\u00a0"`, so tests must read it synchronously right after the dispatch or the `fireEvent`.
> - `replaceAll` already dispatches `EditorView.announce.of(state.phrase("replaced $ matches", n) + ".")`. A second announce from `SearchPanel` would stack a second line, so the wording is changed through `EditorState.phrases`. With `{'replaced $ matches': 'Replaced $ occurrences'}` the result is `"Replaced 3 occurrences."`.

- [ ] **Step 1: Write the failing fold-announce engine test**

Create `src/components/CodeEditor/engine/folds.announce.test.ts`:

```ts
import type { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';
import { toggleFoldRegion } from './folds';

const FIVE_LINES = ['line 1', 'line 2', 'line 3', 'line 4', 'line 5'].join('\n');

/**
 * CodeMirror's `aria-live="polite"` region. Each `EditorView.announce` effect of the
 * last update becomes one child `<div>`; CM clears it 200 ms later, so read synchronously.
 */
const announcements = (view: EditorView): string[] =>
  Array.from(view.dom.querySelectorAll('.cm-announced > div'), node => node.textContent ?? '');

afterEach(() => {
  unmountAllEngines();
});

describe('folds — screen-reader announcements (spec §7.16)', () => {
  it('announces "Folded {label}" and "Unfolded {label}" when a region is toggled', () => {
    const { handle } = mountEngine({
      value: FIVE_LINES,
      folds: [{ id: 'headers', startLine: 2, endLine: 4, label: 'Headers' }],
    });

    expect(toggleFoldRegion(handle.view, 'headers')).toBe(true);
    expect(announcements(handle.view)).toEqual(['Folded Headers']);

    expect(toggleFoldRegion(handle.view, 'headers')).toBe(true);
    expect(announcements(handle.view)).toEqual(['Unfolded Headers']);
  });

  it('falls back to the CodeSnippet line-count label when the region has no label', () => {
    const { handle } = mountEngine({
      value: FIVE_LINES,
      folds: [{ id: 'middle', startLine: 2, endLine: 4 }],
    });

    toggleFoldRegion(handle.view, 'middle');

    expect(announcements(handle.view)).toEqual(['Folded 3 lines']);
  });

  it('uses absolute line numbers with startingLineNumber', () => {
    const { handle } = mountEngine({
      value: FIVE_LINES,
      startingLineNumber: 41,
      folds: [{ id: 'middle', startLine: 42, endLine: 45 }],
    });

    toggleFoldRegion(handle.view, 'middle');

    expect(announcements(handle.view)).toEqual(['Folded 4 lines']);
  });

  it('announces nothing for an unknown region id', () => {
    const { handle } = mountEngine({
      value: FIVE_LINES,
      folds: [{ id: 'headers', startLine: 2, endLine: 4, label: 'Headers' }],
    });

    expect(toggleFoldRegion(handle.view, 'missing')).toBe(false);
    expect(announcements(handle.view)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it**

Run: `pnpm vitest run src/components/CodeEditor/engine/folds.announce.test.ts`

Expected: FAIL. The first three tests get `[]` instead of `['Folded …']` (`expected [] to deeply equal [ 'Folded Headers' ]`), and "announces nothing" passes.

If T8 already put `EditorView.announce` into `setCollapsed` (check with `grep -n "EditorView.announce" src/components/CodeEditor/engine/folds.ts`), all four tests pass here. In that case skip Step 3 and go to Step 4.

- [ ] **Step 3: Add the fold announce in `engine/folds.ts`**

The effect goes in the single helper that dispatches `setCollapsedEffect` for user and API toggles (`setCollapsed(view, targets, collapse)` from T8). It announces only a single-region change. `foldAll` and `unfoldAll` stay silent, because announcing each region in a bulk command would flood the live region.

1. Make sure the imports include these two lines (add `getFoldSummaryLabel` if it is missing; `EditorView` must be a value import):

```ts
import { Decoration, EditorView, GutterMarker, gutter, keymap, ViewPlugin, WidgetType } from '@codemirror/view';
import { getFoldSummaryLabel, validateFolds } from '../../CodeSnippet/lib/foldUtils';
```

2. In `setCollapsed`, replace:

```ts
  const effects: StateEffect<unknown>[] = targets.map(region =>
    setCollapsedEffect.of({ id: region.id, collapsed: collapse }),
  );
```

with:

```ts
  const effects: StateEffect<unknown>[] = targets.map(region =>
    setCollapsedEffect.of({ id: region.id, collapsed: collapse }),
  );
  const [single] = targets;
  if (targets.length === 1 && single) {
    // Spec §7.16: same label the summary row and the toggle's aria-label use.
    const label = getFoldSummaryLabel(single, single.endLine - single.startLine + 1);
    effects.push(EditorView.announce.of(`${collapse ? 'Folded' : 'Unfolded'} ${label}`));
  }
```

`effects` is then dispatched as before (`view.dispatch(selection ? { effects, selection } : { effects })`).

- [ ] **Step 4: Run it**

Run: `pnpm vitest run src/components/CodeEditor/engine/folds.announce.test.ts src/components/CodeEditor/engine/folds.test.ts`

Expected: PASS, 4 new tests plus the unchanged T8 tests.

- [ ] **Step 5: Write the failing replace-all announce test**

Create `src/components/CodeEditor/engine/search.announce.test.tsx`:

```tsx
import { SearchQuery, setSearchQuery } from '@codemirror/search';
import type { EditorView } from '@codemirror/view';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { engineOptions } from '../../../testUtils/codeEditorEngine';
import { PortalOutlet } from '../lib/PortalOutlet';
import { createPortalRegistry } from '../lib/portalRegistry';
import { createEditor } from './index';
import type { EditorHandle } from './types';

const handles: EditorHandle[] = [];

const mount = (value: string): EditorHandle => {
  const portals = createPortalRegistry();
  const { container } = render(<PortalOutlet registry={portals} />);
  let handle: EditorHandle | undefined;
  act(() => {
    handle = createEditor(container, engineOptions({ value, testId: 'editor' }), {
      onChange: vi.fn(),
      onDiagnosticsChange: vi.fn(),
      onVisibleRowCountChange: vi.fn(),
      portals,
    });
  });
  if (!handle) throw new Error('editor not created');
  handles.push(handle);
  return handle;
};

/** CodeMirror's live region (engine test: CM class names allowed). Read synchronously. */
const announcements = (view: EditorView): string[] =>
  Array.from(view.dom.querySelectorAll('.cm-announced > div'), node => node.textContent ?? '');

afterEach(() => {
  for (const handle of handles.splice(0)) act(() => handle.destroy());
});

describe('search panel — replace all announcement (spec §7.16)', () => {
  it('announces "Replaced N occurrences" once when Replace all is clicked', () => {
    const handle = mount('foo bar foo baz foo');
    act(() => handle.api.openSearch());
    act(() => {
      handle.view.dispatch({
        effects: setSearchQuery.of(new SearchQuery({ search: 'foo', replace: 'x' })),
      });
    });

    // fireEvent is synchronous: CM resets the live region 200 ms after an announce.
    fireEvent.click(screen.getByTestId('editor--replace-all'));

    expect(handle.view.state.doc.toString()).toBe('x bar x baz x');
    expect(announcements(handle.view)).toEqual(['Replaced 3 occurrences.']);
  });

  it('announces nothing when there is nothing to replace', () => {
    const handle = mount('foo bar');
    act(() => handle.api.openSearch());
    act(() => {
      handle.view.dispatch({
        effects: setSearchQuery.of(new SearchQuery({ search: 'zzz', replace: 'x' })),
      });
    });
    const before = announcements(handle.view);

    fireEvent.click(screen.getByTestId('editor--replace-all'));

    expect(handle.view.state.doc.toString()).toBe('foo bar');
    expect(announcements(handle.view)).toEqual(before);
    expect(announcements(handle.view)).not.toContain('Replaced 0 occurrences.');
  });
});
```

The second test does not require an empty region. T11's panel may already have announced `No matches` when the query was set; the test only asserts that the Replace all click added nothing. If T11 disables the button for zero matches, the click is a no-op and the test still holds.

- [ ] **Step 6: Run it**

Run: `pnpm vitest run src/components/CodeEditor/engine/search.announce.test.tsx`

Expected: the first test FAILS with `expected [ 'replaced 3 matches.' ] to deeply equal [ 'Replaced 3 occurrences.' ]`, and the second passes.

- [ ] **Step 7: Override the phrase in `engine/search.ts`**

1. Change the `@codemirror/state` import so `EditorState` is a value import:

```ts
// old
import { type EditorState, type Extension, Facet } from '@codemirror/state';
// new
import { EditorState, type Extension, Facet } from '@codemirror/state';
```

2. Add this below the imports, above `searchConfigured`:

```ts
/**
 * Screen-reader wording (spec §7.16). `replaceAll` from `@codemirror/search` already
 * announces `state.phrase('replaced $ matches', n) + '.'`, so the wording is changed
 * here. A second announce from the panel would stack a second line in `.cm-announced`.
 */
const SEARCH_PHRASES: Record<string, string> = {
  'replaced $ matches': 'Replaced $ occurrences',
};
```

3. In the array returned by `searchExtension`, replace:

```ts
  searchConfigured.of(true),
  keymap.of(searchKeymap),
  searchTheme,
];
```

with:

```ts
  searchConfigured.of(true),
  keymap.of(searchKeymap),
  EditorState.phrases.of(SEARCH_PHRASES),
  searchTheme,
];
```

`SearchPanel.tsx` is unchanged: its Replace all button keeps calling `replaceAll(view)`.

- [ ] **Step 8: Run the engine tests**

Run: `pnpm vitest run src/components/CodeEditor/engine/search.announce.test.tsx src/components/CodeEditor/engine/folds.announce.test.ts src/components/CodeEditor/engine/search.test.tsx src/components/CodeEditor/engine/search.engine.test.tsx`

Expected: PASS.

- [ ] **Step 9: Commit the announcements**

```bash
git add src/components/CodeEditor/engine/folds.ts src/components/CodeEditor/engine/search.ts src/components/CodeEditor/engine/folds.announce.test.ts src/components/CodeEditor/engine/search.announce.test.tsx
git commit -m "$(cat <<'EOF'
feat(code-editor): announce fold toggles and replace-all to screen readers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

(If Step 3 was skipped, `folds.ts` is unchanged and `git add` ignores it.)

- [ ] **Step 10: Write the nesting test (mirrors `CodeSnippet.nesting.test.tsx`)**

Create `src/components/CodeEditor/CodeEditor.nesting.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Card } from '../Card';
import {
  CodeSnippetActions,
  CodeSnippetCopyButton,
  CodeSnippetFullscreenButton,
  CodeSnippetHeader,
  CodeSnippetWrapButton,
} from '../CodeSnippet';
import type { FoldRegion } from '../CodeSnippet/lib/foldUtils';
import { Popover } from '../Popover/Popover';
import { PopoverContent } from '../Popover/PopoverContent';
import { PopoverTrigger } from '../Popover/PopoverTrigger';
import { CodeEditorContent, CodeEditorRoot } from './index';

/**
 * CodeEditor counterpart of the CodeSnippet M50 suite. No DS code calls
 * `stopPropagation()`, so clicks reach document-level analytics SDKs, and:
 *  (a) analytics still resolves via `closest('[data-analytics-id]')`;
 *  (b) an enclosing clickable Card stays inert — toolbar/fold buttons via its
 *      interactive-selector gate, the editor surface (contenteditable, no tabindex)
 *      via `data-ds-suppress-parent-click` on the CodeEditorContent wrapper;
 *  (c) an open Popover is not dismissed by clicks inside the editor.
 */

const REQUEST = ['GET /api HTTP/1.1', 'Host: example.com', 'Accept: */*', 'X-Id: 1', ''].join('\n');

const HEADERS_FOLD: FoldRegion[] = [
  {
    id: 'headers',
    startLine: 2,
    endLine: 4,
    label: 'Headers',
    toggleProps: { 'data-analytics-id': 'FOLD_HEADERS' },
  },
];

describe('CodeEditor inside a clickable Card', () => {
  it('toolbar button clicks resolve analytics without firing the Card onClick', async () => {
    const cardClick = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={cardClick}>
        <CodeEditorRoot data-testid='ed' defaultValue={REQUEST}>
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetCopyButton data-analytics-id='COPY_CODE' />
              <CodeSnippetWrapButton data-analytics-id='TOGGLE_WRAP' />
              <CodeSnippetFullscreenButton data-analytics-id='TOGGLE_FULLSCREEN' />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent aria-label='Request' />
        </CodeEditorRoot>
      </Card>,
    );
    await screen.findByTestId('ed--editor');

    await userEvent.click(screen.getByTestId('ed--copy-button'));
    await userEvent.click(screen.getByTestId('ed--wrap-button'));
    await userEvent.click(screen.getByTestId('ed--fullscreen-button'));

    expect(captured).toHaveBeenCalledWith('COPY_CODE');
    expect(captured).toHaveBeenCalledWith('TOGGLE_WRAP');
    expect(captured).toHaveBeenCalledWith('TOGGLE_FULLSCREEN');
    expect(cardClick).not.toHaveBeenCalled();
  });

  it('clicking into the editor or its gutter does not activate the Card', async () => {
    const cardClick = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={cardClick}>
        <CodeEditorRoot data-testid='ed' defaultValue={REQUEST}>
          <CodeEditorContent
            aria-label='Request'
            lineNumbers
            data-analytics-id='REQUEST_EDITOR'
          />
        </CodeEditorRoot>
      </Card>,
    );
    const editor = await screen.findByTestId('ed--editor');

    await userEvent.click(editor);
    await userEvent.click(screen.getByTestId('ed--gutter'));

    // (a) the typing surface resolves to its own analytics id
    expect(captured).toHaveBeenCalledWith('REQUEST_EDITOR');
    // (b) the wrapper's data-ds-suppress-parent-click keeps the Card inert
    expect(screen.getByTestId('ed--content')).toHaveAttribute('data-ds-suppress-parent-click');
    expect(cardClick).not.toHaveBeenCalled();
  });

  it('fold toggle clicks resolve analytics without firing the Card onClick', async () => {
    const cardClick = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={cardClick}>
        <CodeEditorRoot data-testid='ed' defaultValue={REQUEST} folds={HEADERS_FOLD}>
          <CodeEditorContent aria-label='Request' />
        </CodeEditorRoot>
      </Card>,
    );

    await userEvent.click(await screen.findByTestId('ed--fold-toggle'));

    expect(captured).toHaveBeenCalledWith('FOLD_HEADERS');
    expect(screen.getByTestId('ed--fold-summary')).toBeInTheDocument();
    expect(cardClick).not.toHaveBeenCalled();
  });

  it('still activates the Card for clicks outside the editor', async () => {
    const cardClick = vi.fn();

    render(
      <Card onClick={cardClick}>
        <span data-testid='card-text'>Rule request</span>
        <CodeEditorRoot data-testid='ed' defaultValue={REQUEST}>
          <CodeEditorContent aria-label='Request' />
        </CodeEditorRoot>
      </Card>,
    );
    await screen.findByTestId('ed--editor');

    await userEvent.click(screen.getByTestId('card-text'));

    // the suppression is scoped to the editor wrapper, not the whole Card
    expect(cardClick).toHaveBeenCalledTimes(1);
  });
});

describe('CodeEditor inside an open Popover', () => {
  it('editor and toolbar clicks resolve analytics and do not dismiss the Popover', async () => {
    // Controlled `open` keeps the content mounted; the spy detects any dismissal.
    const onOpenChange = vi.fn();

    render(
      <Popover open onOpenChange={onOpenChange}>
        <PopoverTrigger data-testid='trigger'>Open</PopoverTrigger>
        <PopoverContent>
          <CodeEditorRoot data-testid='ed' defaultValue={REQUEST}>
            <CodeSnippetHeader>
              <CodeSnippetActions>
                <CodeSnippetCopyButton data-analytics-id='COPY_CODE' />
              </CodeSnippetActions>
            </CodeSnippetHeader>
            <CodeEditorContent aria-label='Request' data-analytics-id='REQUEST_EDITOR' />
          </CodeEditorRoot>
        </PopoverContent>
      </Popover>,
    );
    const editor = await screen.findByTestId('ed--editor');
    const captured = captureAnalyticsClicks();

    await userEvent.click(editor);
    await userEvent.click(screen.getByTestId('ed--copy-button'));

    expect(captured).toHaveBeenCalledWith('REQUEST_EDITOR');
    expect(captured).toHaveBeenCalledWith('COPY_CODE');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
```

- [ ] **Step 11: Run it**

Run: `pnpm vitest run src/components/CodeEditor/CodeEditor.nesting.test.tsx`

Expected: PASS. T9 already ships `data-ds-suppress-parent-click` and T8 the portal fold toggle, so this is a regression lock and needs no new code.

If "clicking into the editor … does not activate the Card" fails with `cardClick` called, the wrapper is missing the marker. In `CodeEditorContent.tsx`, put `data-ds-suppress-parent-click=''` on the wrapper `<div>` *after* `{...wrapperProps}`, so a consumer prop cannot remove it (spec §9). Then re-run.

- [ ] **Step 12: Write the analytics persistence test**

Create `src/components/CodeEditor/CodeEditor.analytics.test.tsx`:

```tsx
import type { ReactElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { CodeSnippetActions, CodeSnippetFullscreenButton, CodeSnippetHeader } from '../CodeSnippet';
import type { FoldRegion } from '../CodeSnippet/lib/foldUtils';
import { CodeEditorContent, CodeEditorRoot } from './index';

/** Characters an SDK payload may contain — must reach the DOM byte-for-byte. */
const PAYLOAD = '{"rule":"r-1","path":"/api/v1?x=1&y=\\"2\\"","tags":["a","b"],"n":0.5}';
const FIVE_LINES = ['line 1', 'line 2', 'line 3', 'line 4', 'line 5'].join('\n');

const editorUi = (readOnly: boolean): ReactElement => (
  <CodeEditorRoot
    data-testid='ed'
    defaultValue={FIVE_LINES}
    readOnly={readOnly}
    data-analytics-id='RULE_EDITOR'
  >
    <CodeSnippetHeader>
      <CodeSnippetActions>
        <CodeSnippetFullscreenButton data-analytics-id='TOGGLE_FULLSCREEN' />
      </CodeSnippetActions>
    </CodeSnippetHeader>
    <CodeEditorContent
      aria-label='Request'
      data-analytics-id='REQUEST_EDITOR'
      data-analytics-props={PAYLOAD}
    />
  </CodeEditorRoot>
);

describe('CodeEditor analytics attributes', () => {
  it('lands data-analytics-* from CodeEditorContent on the editor node, unchanged', async () => {
    const captured = captureAnalyticsClicks();
    render(editorUi(false));
    const editor = await screen.findByTestId('ed--editor');

    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);
    expect(screen.getByTestId('ed--content')).not.toHaveAttribute('data-analytics-id');
    expect(screen.getByTestId('ed--content')).not.toHaveAttribute('data-analytics-props');

    await userEvent.click(editor);

    // the nearest id wins over the root's container-level id
    expect(captured).toHaveBeenLastCalledWith('REQUEST_EDITOR');
  });

  it('keeps the attributes on the same node across a readOnly toggle', async () => {
    const captured = captureAnalyticsClicks();
    const { rerender } = render(editorUi(false));
    const editor = await screen.findByTestId('ed--editor');

    rerender(editorUi(true));
    await waitFor(() => expect(editor).toHaveAttribute('aria-readonly', 'true'));

    expect(screen.getByTestId('ed--editor')).toBe(editor);
    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);

    rerender(editorUi(false));
    await waitFor(() => expect(editor).not.toHaveAttribute('aria-readonly'));
    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);

    await userEvent.click(editor);
    expect(captured).toHaveBeenLastCalledWith('REQUEST_EDITOR');
  });

  it('keeps editor and root attributes through a fullscreen round trip', async () => {
    const captured = captureAnalyticsClicks();
    render(editorUi(false));
    const editor = await screen.findByTestId('ed--editor');

    await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
    expect(captured).toHaveBeenLastCalledWith('TOGGLE_FULLSCREEN');
    expect(screen.getByTestId('ed--fullscreen-button')).toHaveAccessibleName('Exit full screen');

    expect(screen.getByTestId('ed--editor')).toBe(editor);
    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);
    expect(screen.getByTestId('ed')).toHaveAttribute('data-analytics-id', 'RULE_EDITOR');

    await userEvent.click(editor);
    expect(captured).toHaveBeenLastCalledWith('REQUEST_EDITOR');

    await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
    expect(screen.getByTestId('ed--fullscreen-button')).toHaveAccessibleName('Enter full screen');
    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);
  });
});

describe('CodeEditor fold analytics (toggleProps / summaryProps)', () => {
  const FOLDS: FoldRegion[] = [
    {
      id: 'headers',
      startLine: 2,
      endLine: 4,
      label: 'Headers',
      toggleProps: { 'data-analytics-id': 'FOLD_HEADERS', 'data-analytics-props': PAYLOAD },
      summaryProps: { 'data-analytics-id': 'EXPAND_HEADERS', 'data-analytics-props': PAYLOAD },
    },
  ];

  it('forwards toggleProps and summaryProps analytics attributes to the real buttons', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <CodeEditorRoot data-testid='ed' defaultValue={FIVE_LINES} folds={FOLDS}>
        <CodeEditorContent aria-label='Request' data-analytics-id='REQUEST_EDITOR' />
      </CodeEditorRoot>,
    );

    const toggle = await screen.findByTestId('ed--fold-toggle');
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('data-analytics-id', 'FOLD_HEADERS');
    expect(toggle.getAttribute('data-analytics-props')).toBe(PAYLOAD);
    expect(toggle).toHaveAttribute('aria-label', 'Collapse Headers');

    await userEvent.click(toggle);
    expect(captured).toHaveBeenLastCalledWith('FOLD_HEADERS');

    // attributes survive the collapsed-state re-render of the toggle
    const collapsedToggle = screen.getByTestId('ed--fold-toggle');
    expect(collapsedToggle).toHaveAttribute('aria-label', 'Expand Headers');
    expect(collapsedToggle).toHaveAttribute('data-analytics-id', 'FOLD_HEADERS');

    const summary = screen.getByTestId('ed--fold-summary');
    expect(summary.tagName).toBe('BUTTON');
    expect(summary).toHaveAttribute('data-analytics-id', 'EXPAND_HEADERS');
    expect(summary.getAttribute('data-analytics-props')).toBe(PAYLOAD);

    await userEvent.click(summary);
    expect(captured).toHaveBeenLastCalledWith('EXPAND_HEADERS');
    expect(screen.queryByTestId('ed--fold-summary')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 13: Run it**

Run: `pnpm vitest run src/components/CodeEditor/CodeEditor.analytics.test.tsx`

Expected: PASS. This is a regression lock over T5 (content attributes compartment), T8 (portal fold buttons) and T9 plus phase 0 (fullscreen without remount).

If the readOnly test fails because attributes vanish after `rerender`, T5's `update()` rebuilds the `contentAttributes` compartment without the consumer attributes. Fix it in `engine/index.ts` so that the readOnly reconfigure touches only the readOnly compartment, then re-run.

- [ ] **Step 14: Run the CodeEditor and CodeSnippet suites together**

Run: `pnpm vitest run src/components/CodeEditor src/components/CodeSnippet`

Expected: PASS, with the existing CodeSnippet tests unchanged.

- [ ] **Step 15: Commit the tests**

```bash
git add src/components/CodeEditor/CodeEditor.nesting.test.tsx src/components/CodeEditor/CodeEditor.analytics.test.tsx
git commit -m "$(cat <<'EOF'
test(code-editor): cover nesting and analytics attribute persistence

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 16: Add a Storybook story that shows where analytics attributes go**

The new-component checklist says: "Storybook shows where `data-analytics-id` goes".

Append this at the end of `src/components/CodeEditor/CodeEditor.stories.tsx`. It assumes T10's meta const is named `meta`, like every DS story file. Add only the imports that are not already there, and merge them into the existing import lines rather than duplicating them: `CodeSnippetActions`, `CodeSnippetCopyButton`, `CodeSnippetFullscreenButton`, `CodeSnippetHeader`, `CodeSnippetTitle`, `CodeSnippetWrapButton` from `'../CodeSnippet'`; `type FoldRegion` from `'../CodeSnippet/lib/foldUtils'`; `CodeEditorContent`, `CodeEditorRoot` from `'./index'` (or wherever T10 imports them from).

```tsx
const analyticsRequest = `POST /api/v1/rules HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123

{
  "action": "block"
}`;

const analyticsFolds: FoldRegion[] = [
  {
    id: 'headers',
    startLine: 2,
    endLine: 4,
    label: 'Headers',
    toggleProps: { 'data-analytics-id': 'CODE_EDITOR_FOLD_HEADERS' },
    summaryProps: { 'data-analytics-id': 'CODE_EDITOR_EXPAND_HEADERS' },
  },
];

/**
 * Where analytics attributes land. `data-*` / `aria-*` / `id` on `CodeEditorContent`
 * reach the typing surface (`role="textbox"`), chrome buttons take them directly, and
 * fold buttons take them through `toggleProps` / `summaryProps`. Popups drawn by the
 * editor (autocomplete, tooltips, search panel) are not attributable — see
 * `CodeEditor/ANALYTICS_GAPS.md`.
 */
export const AnalyticsAttributes: StoryFn<typeof meta> = () => (
  <CodeEditorRoot
    data-testid='analytics-editor'
    language='http'
    defaultValue={analyticsRequest}
    folds={analyticsFolds}
  >
    <CodeSnippetHeader>
      <CodeSnippetTitle>Request</CodeSnippetTitle>
      <CodeSnippetActions>
        <CodeSnippetCopyButton data-analytics-id='CODE_EDITOR_COPY' />
        <CodeSnippetWrapButton data-analytics-id='CODE_EDITOR_WRAP' />
        <CodeSnippetFullscreenButton data-analytics-id='CODE_EDITOR_FULLSCREEN' />
      </CodeSnippetActions>
    </CodeSnippetHeader>
    <CodeEditorContent
      aria-label='HTTP request'
      lineNumbers
      data-analytics-id='CODE_EDITOR_REQUEST'
      data-analytics-props='{"surface":"rule-editor"}'
    />
  </CodeEditorRoot>
);
```

- [ ] **Step 17: Create `src/components/CodeEditor/ANALYTICS_GAPS.md`**

````markdown
# CodeEditor — Analytics Gaps

Single source of truth for `CodeEditor`'s analytics decisions, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md) (Closed-Target Gaps).
It lists every interactive target, whether a consumer can put `data-analytics-id` /
`data-analytics-props` (or any `data-*` / `aria-*` / `ref`) on it, and, for the targets that
cannot take them yet, the callback-based workaround, the owner and the next decision point.

Audited: 2026-09-30 · Owner: Design System team

No DS code in `CodeEditor` calls `stopPropagation()`, and `data-analytics-props` is never
parsed or rewritten. Tests: `CodeEditor.analytics.test.tsx`, `CodeEditor.nesting.test.tsx`.

## Already covered (not gaps)

| Target | Seam | Node |
|---|---|---|
| Root container (not a click target; kept in fullscreen) | `CodeEditorRoot` `{...rest}` + `ref` | root `div[data-slot=code-editor]` |
| Typing surface | `CodeEditorContent`: `data-*`, `aria-*`, `id`, `title`, `tabIndex` | `.cm-content` `div[role=textbox]` (`{testId}--editor`) |
| Content wrapper (`className`, `style`, `ref`, every `on*` handler — editor events bubble to it) | `CodeEditorContent` | wrapper `div` (`{testId}--content`), carries `data-ds-suppress-parent-click` |
| Copy / Wrap / Fullscreen / Show more | `CodeSnippetCopyButton`, `CodeSnippetWrapButton`, `CodeSnippetFullscreenButton`, `CodeSnippetShowMoreButton` (render it yourself to pass props) | `<button>` |
| Header / Title / Tabs / Tab | `CodeSnippetHeader`, `CodeSnippetTitle`, `CodeSnippetTabs`, `CodeSnippetTab` | as in `CodeSnippet` |
| Fold gutter toggle | `FoldRegion.toggleProps` (handlers composed, as in `CodeSnippet`) | `<button>` in the fold gutter (`{testId}--fold-toggle`) |
| Collapsed fold summary | `FoldRegion.summaryProps` (handlers composed) | `<button>` summary row (`{testId}--fold-summary`) |
| Search panel inputs / toggles / buttons | DS `Input`, `ToggleButton`, `Button` rendered by the internal `engine/SearchPanel.tsx` | real `<input>` / `<button>`, with derived test ids `{testId}--search`, `{testId}--search-*`, `{testId}--replace-*`. **Test ids only; no consumer attributes, see gap SP-1** |

A clickable `Card` around the editor stays inert: DS buttons are excluded by its
interactive-selector gate, and the editor surface and gutters by the wrapper's
`data-ds-suppress-parent-click`.

**Container-level attribution.** The popups below (autocomplete, tooltips, search panel) are
CodeMirror DOM inside `.cm-editor` but outside `.cm-content`. A click in one of them resolves
`closest('[data-analytics-id]')` to the id on `CodeEditorRoot` if the consumer put one there,
never to the id on `CodeEditorContent`. Read a root-level id as "somewhere in this editor".

## Known gaps (closed targets)

### SP-1 — Search panel does not accept consumer attributes

- **Where:** `engine/search.ts` + `engine/SearchPanel.tsx`. The panel is created by
  CodeMirror's `search({ createPanel })` and filled through the portal registry.
- **Why a gap:** the panel is DS-internal. It is opened by `Mod-F` or `apiRef.openSearch()`,
  never composed by the consumer, so no part is exported that could take `{...rest}`.
- **Workaround:** a consumer-triggered open is observable at the `apiRef.openSearch()` call.
  Replacements reach `onChange`: one `onChange` per Replace / Replace all. Clicks on panel
  controls resolve to the root id (container-level, see above).
- **Owner:** Design System team.
- **Next decision point:** when a consumer asks for per-control search analytics. Export a
  composable `CodeEditorSearchPanel` (and its parts) rendered through the portal registry, so
  `{...rest}` reaches the real `<input>` / `<button>`. No `searchPanelProps` escape hatch.

### AC-1 — Autocomplete option list

- **Where:** `engine/completion.ts` (`@codemirror/autocomplete`). The list and its
  `li[role=option]` items are CodeMirror DOM (`.cm-tooltip-autocomplete`), built outside React.
- **Why a gap:** options are created by CodeMirror from `CodeEditorCompletion` data, so there
  is no node the consumer renders. The option is applied on `mousedown` or `Enter`, so a
  keyboard accept produces no click at all.
- **Workaround:** `onChange` receives the document after the accepted completion. Consumer
  `CodeEditorCompletionSource`s know which options they returned, including `apply` text.
- **Owner:** Design System team.
- **Next decision point:** when product needs to attribute accepted completions. Add a typed
  callback (for example `onCompletionApply(completion, context)`) on `CodeEditorRoot`, not
  attributes on CM's `<li>`.

### TT-1 — Lint (diagnostic) and hover (JSON Schema) tooltips

- **Where:** `engine/diagnostics.ts` (`@codemirror/lint`) and `engine/schema/hover.ts`
  (`hoverTooltip`): `.cm-tooltip-lint`, `.cm-tooltip-hover`.
- **Why a gap:** read-only CodeMirror DOM shown on hover or cursor position. It has no action
  buttons (no quick fixes, no lint panel), so there is nothing to click beyond text.
- **Workaround:** `onDiagnosticsChange` receives the merged diagnostics (syntax, schema and
  external) whenever the set changes.
- **Owner:** Design System team.
- **Next decision point:** if diagnostic actions (quick fixes) or a lint panel are added.
  Their buttons must be DS components through the portal registry with an attribute seam.

### DF-1 — Diff deleted-chunk widgets

- **Where:** `engine/diff.ts` (`@codemirror/merge` `unifiedMergeView`): deleted chunks are
  CodeMirror block widgets (`.cm-deletedChunk`).
- **Why a gap:** CodeMirror DOM with no controls. `mergeControls: false`, so there are no
  accept / reject buttons, only selectable text.
- **Workaround:** none needed for clicks. Edits of the current document reach `onChange`.
- **Owner:** Design System team.
- **Next decision point:** if accept / reject controls are enabled. Render them as DS buttons
  through the portal registry with an exported seam before shipping.

### KB-1 — Keyboard-only commands

- **Where:** keymaps in `engine/index.ts`, `engine/folds.ts`, `engine/search.ts` (undo / redo,
  `Mod-F`, fold `Ctrl-Shift-[` / `]`, Tab indent, `Escape` then `Tab`).
- **Why a gap:** no DOM click by definition.
- **Workaround:** outcomes are observable through `onChange` (edits, undo / redo, replace)
  and the fold summary / toggle state. The `EditorView.announce` messages for screen readers
  (matches, `Folded {label}` / `Unfolded {label}`, `Replaced N occurrences.`) are not an
  analytics channel.
- **Owner:** Design System team.
- **Next decision point:** revisit only if product needs per-shortcut attribution.
````

- [ ] **Step 18: Fix the dangling precedent references in `docs/metrics/`**

Edit `docs/metrics/contract.md` line 87 (paths below are from the repo root).

Old:
```markdown
- the component flags the wrapper-level decision in its **own folder** — in the component's test comments or in an `ANALYTICS_GAPS.md` colocated with it (the `CodeSnippet/ANALYTICS_GAPS.md` precedent)
```
New:
```markdown
- the component flags the wrapper-level decision in its **own folder** — in the component's test comments or in an `ANALYTICS_GAPS.md` colocated with it (precedents: [`Table/ANALYTICS_GAPS.md`](../../packages/design-system/src/components/Table/ANALYTICS_GAPS.md), [`FilterDropdown/ANALYTICS_GAPS.md`](../../packages/design-system/src/components/FilterDropdown/ANALYTICS_GAPS.md), [`CodeEditor/ANALYTICS_GAPS.md`](../../packages/design-system/src/components/CodeEditor/ANALYTICS_GAPS.md))
```

Edit `docs/metrics/new-component-checklist.md` line 32.

Old:
```markdown
- [ ] **Gaps & exceptions are explicit** — any wrapper-level decision or unreachable (closed) target is recorded in the **component folder** (test comments or an `ANALYTICS_GAPS.md`, per the `CodeSnippet/ANALYTICS_GAPS.md` precedent), each with its workaround, owner, and next decision point; the wrapper-level conditions in [contract.md](./contract.md) are met.
```
New:
```markdown
- [ ] **Gaps & exceptions are explicit** — any wrapper-level decision or unreachable (closed) target is recorded in the **component folder** (test comments or an `ANALYTICS_GAPS.md`, per the [`Table/ANALYTICS_GAPS.md`](../../packages/design-system/src/components/Table/ANALYTICS_GAPS.md) precedent; [`CodeEditor/ANALYTICS_GAPS.md`](../../packages/design-system/src/components/CodeEditor/ANALYTICS_GAPS.md) shows closed targets inside a third-party engine), each with its workaround, owner, and next decision point; the wrapper-level conditions in [contract.md](./contract.md) are met.
```

`.claude/rules/metrics.md:17` has the same dangling `CodeSnippet/ANALYTICS_GAPS.md` reference. It is Claude instruction config, so do not edit it in this task. Tell the user about it in the task report and let them decide.

- [ ] **Step 19: Verify links, typecheck and lint**

Run from `packages/design-system/`:

```bash
grep -rn "CodeSnippet/ANALYTICS_GAPS" ../../docs/metrics ; echo "exit=$?"
for f in Table FilterDropdown CodeEditor; do test -f "src/components/$f/ANALYTICS_GAPS.md" && echo "ok $f"; done
pnpm exec tsc --build tsconfig.app.json --noEmit
pnpm exec biome check src/components/CodeEditor/engine/folds.ts src/components/CodeEditor/engine/search.ts src/components/CodeEditor/engine/folds.announce.test.ts src/components/CodeEditor/engine/search.announce.test.tsx src/components/CodeEditor/CodeEditor.nesting.test.tsx src/components/CodeEditor/CodeEditor.analytics.test.tsx src/components/CodeEditor/CodeEditor.stories.tsx
```

Expected:
- `grep` prints nothing and `exit=1`.
- `ok Table`, `ok FilterDropdown`, `ok CodeEditor`.
- `tsc` reports no errors.
- Biome reports no errors. For import order or format issues only, run the same command with `--write` and re-run it.

- [ ] **Step 20: Run the full CodeEditor and CodeSnippet suites once more**

Run: `pnpm vitest run src/components/CodeEditor src/components/CodeSnippet`

Expected: PASS.

- [ ] **Step 21: Commit the docs and the story**

```bash
git add src/components/CodeEditor/ANALYTICS_GAPS.md src/components/CodeEditor/CodeEditor.stories.tsx ../../docs/metrics/contract.md ../../docs/metrics/new-component-checklist.md
git commit -m "$(cat <<'EOF'
docs(code-editor): record analytics gaps and fix ANALYTICS_GAPS precedent links

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: E2E suite + Storybook Overview docs + CI screenshots

**Files:**
- Create: `src/components/CodeEditor/CodeEditor.stories.docs.test.ts`, which checks the Overview page for the storybook-docs skill.
- Create: `src/components/CodeEditor/story-content/_storyFixtures.ts`
- Create: `src/components/CodeEditor/story-content/_storyEditingWorkflow.tsx`
- Create: `src/components/CodeEditor/story-content/_storyTabsKeepHistory.tsx`
- Create: `src/components/CodeEditor/story-content/_storyLongDocument.tsx`
  - All three demo files live in `story-content/`. That folder is already excluded from the Rslib entry and from `tsconfig.app.json`, following the `AppShell/story-content/_story*.tsx` precedent.
- Modify: `src/components/CodeEditor/CodeEditor.stories.tsx` (created in T10). Changes: imports, `DESCRIPTION`, the `meta` docs parameter, three new stories, and a JSDoc check on every story.
- Create: `src/components/CodeEditor/CodeEditor.e2e.ts`
- Modify: `docs/storybook-docs-coverage.md` (repo root), adding one row.
- Generated in CI, never by hand: `src/components/CodeEditor/CodeEditor.e2e.ts-snapshots/*.png`

**Interfaces:**

Consumes. These are the exact strings and ids the tests depend on. Each one comes from an earlier task:
- **T10:** `CodeEditor.stories.tsx` has `const meta = {...} satisfies Meta<typeof CodeEditorRoot>` with `title: 'Data display/CodeEditor/CodeEditor'`, so the story id prefix is `data-display-codeeditor-codeeditor`. Stories are `export const X: StoryFn<typeof meta>`.
  - The E2E file reads every `export const` from this file at collection time, so it depends on no particular T10 story names.
- **T9:**
  - `CodeEditorRoot` props: `value`, `defaultValue`, `onChange`, `language`, `documentId`, `readOnly`, `folds: CodeEditorFolds`, `schema: JsonSchema`, `maxLines`, `data-testid`.
  - `CodeEditorContent` props: `lineNumbers`, plus `aria-label` and `aria-describedby`, which are routed to `.cm-content`.
  - Test ids `{id}--content` (wrapper) and `{id}--fallback` (fallback with `aria-busy='true'`).
- **T9 `lib/keyboardHint.ts`:** `export const CODE_EDITOR_KEYBOARD_HINT: string`.
- **T5:**
  - `{id}--editor` on `.cm-content`.
  - `EditorState.allowMultipleSelections` on.
  - Keymaps: `defaultKeymap` (`Mod-Home`, `End`), `historyKeymap` (`Mod-z`, `Mod-Shift-z`), `indentWithTab`.
  - CodeMirror's built-in Escape→Tab focus release.
  - `.cm-lineWrapping` plus the theme's `word-break: break-all`.
- **T1:** chrome test ids `{id}--copy-button`, `{id}--wrap-button`, `{id}--fullscreen-button`, `{id}--show-more-button`.
  - Show-more text is `Show more (N lines)` / `Show less`.
  - The copy button copies `getCode()`, which is the edited value.
- **T2:** the fullscreen button's accessible name is `Enter full screen` / `Exit full screen`. `ChromeFrame` ignores an Escape that was already `defaultPrevented`, and the host moves without remounting.
- **T8:**
  - `{id}--fold-toggle` (DS `FoldToggle`, `aria-label` `Collapse Headers` / `Expand Headers`, `aria-expanded`).
  - `{id}--fold-summary`, which expands the region when clicked.
- **T11:** `searchKeymap` (`Mod-f`, `Mod-d` `selectNextOccurrence`, `Escape`).
  - Panel test ids: `{id}--search`, `{id}--search-input` (focused on open), `{id}--replace-input`, `{id}--replace-all`.
  - Closing the panel refocuses the editor.
- **T12/T13:** a lint hover tooltip rendering the json-schema-library message. Verified with json-schema-library 11.6.2: ``Value in `#/retries` is `9`, but should be `5` at maximum``.
- **T14:** built-in HTTP completions offer `Accept*` header names on a header line. `completionKeymap` Escape closes the list with `preventDefault`.
- **Tooling (verified 2026-09-30):**
  - `storybook/internal/csf` exports `storyNameFromExport(key: string): string` (`HTTPWithPrism` → `HTTP With Prism`).
  - Playwright `ControlOrMeta` works.
  - The repo has no `@axe-core/playwright`, so the Accessibility group asserts roles, names and descriptions instead.

Produces (story-only, never published):
- `export const EditingWorkflow`, `TabsKeepHistory`, `LongDocument: StoryFn<typeof meta>` in `CodeEditor.stories.tsx`.
- `story-content/_storyFixtures.ts`: `EDITING_REQUEST: string`, `RULE_SCHEMA: JsonSchema`, `httpFolds: CodeEditorFolds`, `type TabId = 'request' | 'response'`, `isTabId(value: string): value is TabId`, `TAB_DOCUMENTS: Record<TabId, string>`, `LONG_DOCUMENT: string` (exactly 2000 lines).
- `EditingWorkflowDemo: FC`, `TabsKeepHistoryDemo: FC`, `LongDocumentDemo: FC`.

Rules for this task:
- E2E runs in CI only. Locally you may only list tests (`--list`), which starts no browser and needs no Storybook.
- No Docker and no `e2e:docker*`.
- All commands run from `packages/design-system/` unless stated otherwise.

---

- [ ] **Step 1: Write the failing Overview-page guard test**

Create `src/components/CodeEditor/CodeEditor.stories.docs.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'CodeEditor.stories.tsx'),
  'utf8',
);
const lines = source.split('\n');

const storyExports = lines.flatMap((line, index) => {
  const name = /^export const (\w+)\b/.exec(line)?.[1];
  return name ? [{ name, index }] : [];
});

const description = /const DESCRIPTION = \[([\s\S]*?)\]\.join\(' '\);/.exec(source)?.[1] ?? '';

/**
 * Guards the Overview page (storybook-docs skill): lint and typecheck cannot see a
 * missing sentence or a description that lost one of the facts the spec requires.
 */
describe('CodeEditor Storybook docs', () => {
  it('feeds DESCRIPTION into the meta component description', () => {
    expect(source.match(/^const DESCRIPTION = \[/gm)).toHaveLength(1);
    expect(source).toMatch(/docs:\s*\{\s*description:\s*\{\s*component:\s*DESCRIPTION\s*\}\s*\}/);
  });

  it('names the boundary, the adapter, the visual differences, the envelope and the keyboard', () => {
    expect(description).toContain('`CodeSnippet`');
    expect(description).toContain('`CodeSnippetAdapterProvider`');
    expect(description).toContain('scrollbar');
    expect(description).toContain('2 000 lines');
    expect(description).toContain('`CODE_EDITOR_KEYBOARD_HINT`');
    expect(description).toContain('Escape, then Tab');
  });

  it('includes the stories the E2E suite drives', () => {
    expect(storyExports.map(story => story.name)).toEqual(
      expect.arrayContaining(['EditingWorkflow', 'TabsKeepHistory', 'LongDocument']),
    );
  });

  it.each(storyExports)('documents $name with a JSDoc sentence directly above it', ({ index }) => {
    expect(lines[index - 1]?.trim()).toMatch(/\*\/$/);
  });

  it('has no story-level description that would shadow the JSDoc', () => {
    expect(source).not.toMatch(/description:\s*\{\s*story:/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/components/CodeEditor/CodeEditor.stories.docs.test.ts`

Expected: FAIL.
- `includes the stories the E2E suite drives` fails because `EditingWorkflow`, `TabsKeepHistory` and `LongDocument` are missing.
- `names the boundary, …` fails because T10's description, if any, lacks `2 000 lines` and `CODE_EDITOR_KEYBOARD_HINT`.
- Any `documents <Name> …` row that fails names a T10 story with no JSDoc. You fix that in Step 5.

- [ ] **Step 3: Create the story fixtures**

Create `src/components/CodeEditor/story-content/_storyFixtures.ts`:

```ts
import { getHttpFolds } from '../../CodeSnippet/lib/httpFolds';
import type { CodeEditorFolds, JsonSchema } from '../types';

/**
 * Line map the E2E suite relies on (`CodeEditor.e2e.ts`): 1 start line, 2 `Host`,
 * 4 `X-Env: staging`, 7 `"name"`, 9 `"retries": 9` (breaks the schema maximum),
 * 10 a line longer than the frame. `staging` appears exactly twice (lines 4 and 8).
 */
export const EDITING_REQUEST = [
  'POST /api/v1/rules HTTP/1.1',
  'Host: api.wallarm.example',
  'Content-Type: application/json',
  'X-Env: staging',
  '',
  '{',
  '  "name": "Block scanners",',
  '  "env": "staging",',
  '  "retries": 9,',
  '  "description": "Blocks requests from known vulnerability scanners on every public endpoint of the API gateway, including the legacy routes kept only for older mobile clients"',
  '}',
].join('\n');

/** Applies to the JSON body of `EDITING_REQUEST`. Module-level so its identity is stable. */
export const RULE_SCHEMA: JsonSchema = {
  type: 'object',
  required: ['name', 'env'],
  properties: {
    name: { type: 'string', title: 'Rule name' },
    env: { enum: ['staging', 'production'], description: 'Where the rule is deployed.' },
    retries: {
      type: 'integer',
      minimum: 0,
      maximum: 5,
      description: 'How many times a failed check is retried.',
    },
    description: { type: 'string' },
  },
};

/** Headers and body folds recomputed from the edited value (stable reference). */
export const httpFolds: CodeEditorFolds = (value, { startingLineNumber }) =>
  getHttpFolds(value, { startingLineNumber });

export type TabId = 'request' | 'response';

export const isTabId = (value: string): value is TabId =>
  value === 'request' || value === 'response';

/** Line 3 of each document ends with a quoted string the E2E suite edits. */
export const TAB_DOCUMENTS: Record<TabId, string> = {
  request: ['{', '  "action": "block",', '  "path": "/login"', '}'].join('\n'),
  response: ['{', '  "status": 403,', '  "reason": "blocked"', '}'].join('\n'),
};

const LONG_DOCUMENT_EVENTS = 1996;

/** Exactly 2 000 lines — the top of the adapter painter's performance envelope. */
export const LONG_DOCUMENT = [
  '{',
  '  "events": [',
  ...Array.from({ length: LONG_DOCUMENT_EVENTS }, (_, index) => {
    const id = index + 1;
    const status = id % 7 === 0 ? 403 : 200;
    const comma = id === LONG_DOCUMENT_EVENTS ? '' : ',';
    return `    { "id": ${id}, "method": "GET", "path": "/api/v1/items/${id}", "status": ${status} }${comma}`;
  }),
  '  ]',
  '}',
].join('\n');
```

- [ ] **Step 4: Create the three interaction demos**

Create `src/components/CodeEditor/story-content/_storyEditingWorkflow.tsx`:

```tsx
import { type FC, useState } from 'react';
import { CodeSnippetActions } from '../../CodeSnippet/CodeSnippetActions';
import { CodeSnippetCopyButton } from '../../CodeSnippet/CodeSnippetCopyButton';
import { CodeSnippetFullscreenButton } from '../../CodeSnippet/CodeSnippetFullscreenButton';
import { CodeSnippetHeader } from '../../CodeSnippet/CodeSnippetHeader';
import { CodeSnippetTitle } from '../../CodeSnippet/CodeSnippetTitle';
import { CodeSnippetWrapButton } from '../../CodeSnippet/CodeSnippetWrapButton';
import { CodeEditorContent } from '../CodeEditorContent';
import { CodeEditorRoot } from '../CodeEditorRoot';
import { CODE_EDITOR_KEYBOARD_HINT } from '../lib/keyboardHint';
import { EDITING_REQUEST, httpFolds, RULE_SCHEMA } from './_storyFixtures';

const HINT_ID = 'code-editor-editing-workflow-hint';

export const EditingWorkflowDemo: FC = () => {
  const [value, setValue] = useState(EDITING_REQUEST);

  return (
    <div className='w-640'>
      <CodeEditorRoot
        value={value}
        onChange={setValue}
        language='http'
        folds={httpFolds}
        schema={RULE_SCHEMA}
        data-testid='editing'
      >
        <CodeSnippetHeader>
          <CodeSnippetTitle>Request</CodeSnippetTitle>
          <CodeSnippetActions>
            <CodeSnippetFullscreenButton />
            <CodeSnippetWrapButton />
            <CodeSnippetCopyButton />
          </CodeSnippetActions>
        </CodeSnippetHeader>
        <CodeEditorContent lineNumbers aria-label='HTTP request' aria-describedby={HINT_ID} />
      </CodeEditorRoot>
      <span id={HINT_ID} className='sr-only'>
        {CODE_EDITOR_KEYBOARD_HINT}
      </span>
    </div>
  );
};

EditingWorkflowDemo.displayName = 'EditingWorkflowDemo';
```

Create `src/components/CodeEditor/story-content/_storyTabsKeepHistory.tsx`:

```tsx
import { type FC, useState } from 'react';
import { CodeSnippetHeader } from '../../CodeSnippet/CodeSnippetHeader';
import { CodeSnippetTab } from '../../CodeSnippet/CodeSnippetTab';
import { CodeSnippetTabs } from '../../CodeSnippet/CodeSnippetTabs';
import { CodeEditorContent } from '../CodeEditorContent';
import { CodeEditorRoot } from '../CodeEditorRoot';
import { isTabId, TAB_DOCUMENTS, type TabId } from './_storyFixtures';

export const TabsKeepHistoryDemo: FC = () => {
  const [tab, setTab] = useState<TabId>('request');
  const [documents, setDocuments] = useState<Record<TabId, string>>(TAB_DOCUMENTS);

  return (
    <div className='w-480'>
      <CodeEditorRoot
        documentId={tab}
        value={documents[tab]}
        onChange={value => setDocuments(previous => ({ ...previous, [tab]: value }))}
        language='json'
        data-testid='tabs-editor'
      >
        <CodeSnippetHeader>
          <CodeSnippetTabs
            value={tab}
            onValueChange={next => {
              if (isTabId(next)) setTab(next);
            }}
          >
            <CodeSnippetTab value='request' data-testid='tabs-editor--tab-request'>
              Request
            </CodeSnippetTab>
            <CodeSnippetTab value='response' data-testid='tabs-editor--tab-response'>
              Response
            </CodeSnippetTab>
          </CodeSnippetTabs>
        </CodeSnippetHeader>
        <CodeEditorContent lineNumbers aria-label='Rule check payload' />
      </CodeEditorRoot>
    </div>
  );
};

TabsKeepHistoryDemo.displayName = 'TabsKeepHistoryDemo';
```

Create `src/components/CodeEditor/story-content/_storyLongDocument.tsx`:

```tsx
import type { FC } from 'react';
import { CodeEditorContent } from '../CodeEditorContent';
import { CodeEditorRoot } from '../CodeEditorRoot';
import { LONG_DOCUMENT } from './_storyFixtures';

export const LongDocumentDemo: FC = () => (
  <div className='w-640'>
    <CodeEditorRoot
      defaultValue={LONG_DOCUMENT}
      readOnly
      language='json'
      maxLines={12}
      data-testid='long-document'
    >
      <CodeEditorContent lineNumbers aria-label='Access log' />
    </CodeEditorRoot>
  </div>
);

LongDocumentDemo.displayName = 'LongDocumentDemo';
```

- [ ] **Step 5: Wire the Overview description and the three stories into `CodeEditor.stories.tsx`**

Read the current file first, because T10 wrote it.

5a. **Imports.** Add these three lines to the import block. Biome sorts them.

```tsx
import { EditingWorkflowDemo } from './story-content/_storyEditingWorkflow';
import { LongDocumentDemo } from './story-content/_storyLongDocument';
import { TabsKeepHistoryDemo } from './story-content/_storyTabsKeepHistory';
```

5b. **Description.** Put this block immediately above `const meta = {`. If T10 already declared a `const DESCRIPTION = [...]`, replace T10's whole statement, because there must be exactly one.

```tsx
const DESCRIPTION = [
  'An editable code surface that is visually the same component as `CodeSnippet` and reuses its header, tabs, actions and show-more — reach for `CodeSnippet` whenever the code is only read, since a page that never renders `CodeEditorContent` never loads the editor engine.',
  'Colours come from the same `CodeSnippetAdapterProvider` (plain text without one), so a read-only editor matches the snippet except for a native thin scrollbar, a caret and selection drawn by the editor, and an HTTP JSON body that stays coloured when `Content-Type` has parameters or the body has blank lines.',
  'The adapter re-tokenizes the whole document after each pause in typing, which stays within a frame up to about 2 000 lines with Prism; longer documents still edit smoothly, their colours just settle a moment later.',
  'Tab indents, so keyboard users leave with Escape, then Tab — point `aria-describedby` at text holding `CODE_EDITOR_KEYBOARD_HINT` to tell screen-reader users.',
].join(' ');
```

This is four sentences, one over the skill's usual budget of two or three. That is deliberate: spec §8 and §10 require the adapter note, the accepted visual differences, the performance envelope and the keyboard escape on this page, and none of them is visible in a rendered story.

5c. **Meta.** Replace the whole `const meta = { … } satisfies Meta<typeof CodeEditorRoot>;` statement with the block below. If T10 added other `parameters` keys (for example `design`), keep them next to `docs`.

```tsx
const meta = {
  title: 'Data display/CodeEditor/CodeEditor',
  component: CodeEditorRoot,
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeEditorRoot>;
```

5d. **Stories.** Append these at the end of the file:

```tsx
/**
 * A controlled HTTP request with header and body folds and a JSON Schema on the body —
 * `retries` breaks the schema's maximum on purpose, so the underline and its hover message
 * are part of the example. The editor's description points at `CODE_EDITOR_KEYBOARD_HINT`.
 */
export const EditingWorkflow: StoryFn<typeof meta> = () => <EditingWorkflowDemo />;

/**
 * Each tab passes its own `documentId`, so switching swaps in that document's undo history,
 * selection and collapsed folds instead of replacing the text of one shared document.
 */
export const TabsKeepHistory: StoryFn<typeof meta> = () => <TabsKeepHistoryDemo />;

/**
 * 2 000 read-only lines clamped by `maxLines` — the top of the envelope the colour painter is
 * built for, where `readOnly` still lets the text be focused, searched and copied.
 */
export const LongDocument: StoryFn<typeof meta> = () => <LongDocumentDemo />;
```

5e. **JSDoc on T10's stories.** For every T10 story that Step 2 reported under `documents <Name> …`, add a one-sentence JSDoc directly above its `export const` line, following `.claude/skills/storybook-docs/references/prose-standard.md`:
- say what the frame shows plus one fact its name does not give;
- for a parity story, name the `CodeSnippet` story it mirrors;
- never restate the story name.

Anchor each edit on the `export const` line, never with a multiline regex. Then verify that no story was lost:

```bash
git show HEAD:packages/design-system/src/components/CodeEditor/CodeEditor.stories.tsx | grep -c '^export const'   # N (T10's count)
grep -c '^export const' src/components/CodeEditor/CodeEditor.stories.tsx                                           # must be N + 3
grep -n 'story:' src/components/CodeEditor/CodeEditor.stories.tsx                                                  # must print nothing
```

- [ ] **Step 6: Run the guard and the CodeEditor unit tests (expect PASS), then typecheck and lint**

```bash
pnpm vitest run src/components/CodeEditor/CodeEditor.stories.docs.test.ts
pnpm vitest run src/components/CodeEditor src/components/CodeSnippet
pnpm exec tsc -p tsconfig.storybook.json --noEmit 2>&1 | grep 'CodeEditor'
pnpm exec tsc --build tsconfig.app.json --noEmit
pnpm exec biome check src/components/CodeEditor/CodeEditor.stories.tsx src/components/CodeEditor/CodeEditor.stories.docs.test.ts src/components/CodeEditor/story-content
```

Expected:
- Every guard test passes: 5 fixed tests plus one row per story.
- The CodeEditor and CodeSnippet suites stay green.
- The storybook `tsc | grep` prints nothing. `tsconfig.storybook.json` already has unrelated errors elsewhere (Toast, Pixel, Icons), so only CodeEditor lines matter.
- The app `tsc` exits 0.
- Biome reports no errors. If it only reports formatting or import order, run the same command with `--write`.

- [ ] **Step 7: Read the page as a stranger (storybook-docs skill, step 5)**

Run `pnpm storybook` and open `http://localhost:6006/?path=/docs/data-display-codeeditor-codeeditor--docs`. Check that:
- every story shows a sentence;
- nothing contradicts the props table;
- the scaffolding is quieter than the editors. The only non-component text is the visually hidden hint.

Squint test: `grep -n "variant='primary'\|<Button>\|bg-blue-\|bg-gray-" src/components/CodeEditor/CodeEditor.stories.tsx src/components/CodeEditor/story-content/*.tsx` must print nothing.

Stop Storybook when you are done. It is not needed again.

- [ ] **Step 8: Add the coverage row and commit the docs**

In `docs/storybook-docs-coverage.md`, insert this row immediately above the line `| ✅ | Data display/CodeSnippet/CodeSnippet | 25 | 25 | \`components/CodeSnippet/CodeSnippet.stories.tsx\` |`. Replace `N` with the output of `grep -c '^export const' src/components/CodeEditor/CodeEditor.stories.tsx`:

```md
| ✅ | Data display/CodeEditor/CodeEditor | N | N | `components/CodeEditor/CodeEditor.stories.tsx` |
```

Then commit:

```bash
git add src/components/CodeEditor/CodeEditor.stories.tsx src/components/CodeEditor/CodeEditor.stories.docs.test.ts src/components/CodeEditor/story-content ../../docs/storybook-docs-coverage.md
git commit -m "$(cat <<'EOF'
docs(code-editor): lead the Overview with the CodeSnippet boundary and add interaction stories

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 9: Write the E2E suite**

Create `src/components/CodeEditor/CodeEditor.e2e.ts`. It was typechecked with the repo's e2e config and formatted by the repo's Biome config. Its test collection was verified with `playwright test --list`.

```ts
import { expect, type Locator, type Page, test } from '@playwright/test';
import { storyNameFromExport } from 'storybook/internal/csf';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';
import { CODE_EDITOR_KEYBOARD_HINT } from './lib/keyboardHint';

const COMPONENT_ID = 'data-display-codeeditor-codeeditor';

const storiesSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'CodeEditor.stories.tsx'),
  'utf8',
);

/**
 * Every story exported from `CodeEditor.stories.tsx`, named the way Storybook names it
 * (`ParityLineNumbers` → `Parity Line Numbers`). Each one gets a screenshot, so a story
 * added later is covered without touching this file.
 */
const STORY_NAMES: string[] = [...storiesSource.matchAll(/^export const (\w+)\b/gm)].flatMap(
  match => (match[1] ? [storyNameFromExport(match[1])] : []),
);

const everyStory = createStoryHelper(COMPONENT_ID, STORY_NAMES);

const interactionStory = createStoryHelper(COMPONENT_ID, [
  'Editing Workflow',
  'Tabs Keep History',
  'Long Document',
] as const);

const MOD = 'ControlOrMeta';

type CopyCaptureWindow = Window & { __copiedText?: string };
type DomProbeWindow = Window & { __codeEditorDomProbe?: { html: string; since: number } };

const editorOf = (page: Page, testId: string): Locator => page.getByTestId(`${testId}--editor`);

/** The engine chunk has loaded: a CodeMirror textbox exists and no static fallback is left. */
const waitForEngine = async (page: Page) => {
  await expect(page.getByRole('textbox').first()).toBeVisible();
  await expect(page.locator('[data-testid$="--fallback"]')).toHaveCount(0);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
};

/**
 * Waits until nothing — adapter painter, linter, portals, tooltip positioning — has changed
 * the DOM for 750ms (longer than the 300ms lint delay plus the lazy schema load), so a
 * screenshot never catches a half-painted frame.
 */
const waitForStableDom = async (page: Page) => {
  await page.waitForFunction(
    () => {
      const probeWindow = window as DomProbeWindow;
      const html = document.body.innerHTML;
      const now = performance.now();
      const probe = probeWindow.__codeEditorDomProbe;
      if (!probe || probe.html !== html) {
        probeWindow.__codeEditorDomProbe = { html, since: now };
        return false;
      }
      return now - probe.since >= 750;
    },
    undefined,
    { polling: 100, timeout: 15_000 },
  );
};

/**
 * Drops focus so CodeMirror stops drawing its caret — except while a completion list is
 * open, because the list closes on blur and the screenshot is meant to show it.
 */
const blurUnlessCompleting = async (page: Page) => {
  if ((await page.getByRole('listbox').count()) > 0) return;
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });
};

const settleForScreenshot = async (page: Page) => {
  await blurUnlessCompleting(page);
  await waitForStableDom(page);
};

/** Puts the caret at the end of a (1-based) document line using the keyboard only. */
const caretToLineEnd = async (page: Page, editor: Locator, line: number) => {
  await editor.click();
  await page.keyboard.press(`${MOD}+Home`);
  for (let current = 1; current < line; current++) {
    await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('End');
};

/** Viewport box of `target`, found as the first occurrence inside the first occurrence of `context`. */
const textBox = async (editor: Locator, context: string, target: string) => {
  const box = await editor.evaluate(
    (root, { context, target }) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let text = '';
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node instanceof Text) {
          nodes.push(node);
          text += node.data;
        }
      }
      const contextStart = text.indexOf(context);
      const targetOffset = context.indexOf(target);
      if (contextStart < 0 || targetOffset < 0) return null;
      const start = contextStart + targetOffset;
      const end = start + target.length;
      const range = document.createRange();
      let offset = 0;
      for (const node of nodes) {
        const length = node.data.length;
        if (start >= offset && start <= offset + length) range.setStart(node, start - offset);
        if (end >= offset && end <= offset + length) {
          range.setEnd(node, end - offset);
          break;
        }
        offset += length;
      }
      const rect = range.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    },
    { context, target },
  );
  if (!box) throw new Error(`"${target}" inside "${context}" is not rendered in the editor`);
  return box;
};

const editorText = (editor: Locator): Promise<string> =>
  editor.evaluate(element => element.textContent ?? '');

test.describe('Component: CodeEditor', () => {
  test.describe('Visual', () => {
    for (const storyName of STORY_NAMES) {
      test(`Should render ${storyName.toLowerCase()} correctly`, async ({ page }) => {
        await everyStory.goto(page, storyName);
        await waitForEngine(page);
        await settleForScreenshot(page);
        await expect(page).toHaveScreenshot();
      });
    }

    test('Should render the find and replace panel correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      await caretToLineEnd(page, editorOf(page, 'editing'), 1);
      await page.keyboard.press(`${MOD}+f`);
      await page.getByTestId('editing--search-input').fill('staging');
      await expect(page.getByTestId('editing--search')).toBeVisible();
      await waitForStableDom(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the open completion list correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      await caretToLineEnd(page, editorOf(page, 'editing'), 4);
      await page.keyboard.press('Enter');
      await page.keyboard.type('Acc');
      await expect(page.getByRole('listbox')).toBeVisible();
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render a schema diagnostic tooltip correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const box = await textBox(editorOf(page, 'editing'), '"retries": 9', '9');
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      // The linter runs 300ms after load and the schema library loads lazily; a hover that
      // lands before the diagnostic exists shows nothing, so re-hover until the message shows.
      await expect(async () => {
        await page.mouse.move(x, y + box.height);
        await page.mouse.move(x, y);
        await expect(page.getByText(/at maximum/).first()).toBeVisible({ timeout: 1_000 });
      }).toPass({ timeout: 10_000 });
      await waitForStableDom(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render a collapsed fold summary correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      await page.getByTestId('editing--fold-toggle').first().click();
      await expect(page.getByTestId('editing--fold-summary')).toBeVisible();
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render full screen correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      await page.getByTestId('editing--fullscreen-button').click();
      await expect(page.getByTestId('editing--fullscreen-button')).toHaveAccessibleName(
        'Exit full screen',
      );
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should update the document when text is typed', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 2);
      await page.keyboard.type('.test');
      await expect(editor).toContainText('Host: api.wallarm.example.test');
    });

    test('Should undo and redo typing when the history shortcuts are pressed', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 2);
      await page.keyboard.type('.test');
      await expect(editor).toContainText('api.wallarm.example.test');

      await page.keyboard.press(`${MOD}+z`);
      await expect(editor).not.toContainText('api.wallarm.example.test');
      await expect(editor).toContainText('Host: api.wallarm.example');

      await page.keyboard.press(`${MOD}+Shift+z`);
      await expect(editor).toContainText('api.wallarm.example.test');
    });

    test('Should edit every occurrence when the next occurrence is added to the selection', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      // Line 4 is `X-Env: staging`; the caret ends up touching the word.
      await caretToLineEnd(page, editor, 4);
      await page.keyboard.press(`${MOD}+d`);
      await page.keyboard.press(`${MOD}+d`);
      await page.keyboard.type('production');
      await expect(editor).toContainText('X-Env: production');
      await expect(editor).toContainText('"env": "production"');
      await expect(editor).not.toContainText('staging');
    });

    test('Should replace every match when replace all is clicked', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 1);
      await page.keyboard.press(`${MOD}+f`);
      await expect(page.getByTestId('editing--search')).toBeVisible();
      await page.getByTestId('editing--search-input').fill('staging');
      await page.getByTestId('editing--replace-input').fill('production');
      await page.getByTestId('editing--replace-all').click();
      await expect(editor).toContainText('X-Env: production');
      await expect(editor).toContainText('"env": "production"');
      await expect(editor).not.toContainText('staging');
    });

    test('Should collapse and expand the headers when the fold toggle and summary are clicked', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      const headersToggle = page.getByTestId('editing--fold-toggle').first();
      await expect(headersToggle).toHaveAccessibleName('Collapse Headers');

      await headersToggle.click();
      const summary = page.getByTestId('editing--fold-summary');
      await expect(summary).toBeVisible();
      await expect(editor).not.toContainText('Content-Type');
      await expect(page.getByTestId('editing--fold-toggle').first()).toHaveAccessibleName(
        'Expand Headers',
      );

      await summary.click();
      await expect(summary).toHaveCount(0);
      await expect(editor).toContainText('Content-Type: application/json');
    });

    test('Should reveal the whole document when show more is clicked', async ({ page }) => {
      await interactionStory.goto(page, 'Long Document');
      await waitForEngine(page);
      const showMore = page.getByTestId('long-document--show-more-button');
      const content = page.getByTestId('long-document--content');
      await expect(showMore).toContainText('Show more (1988 lines)');
      const clamped = await content.boundingBox();

      await showMore.click();
      await expect(showMore).toContainText('Show less');
      const expanded = await content.boundingBox();
      expect(clamped).not.toBeNull();
      expect(expanded).not.toBeNull();
      expect(expanded?.height ?? 0).toBeGreaterThan((clamped?.height ?? 0) * 10);

      await showMore.click();
      await expect(showMore).toContainText('Show more (1988 lines)');
      await expect.poll(async () => (await content.boundingBox())?.height).toBe(clamped?.height);
    });

    test('Should wrap long lines when the wrap button is clicked', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await expect(editor).toHaveCSS('white-space', 'pre');

      await page.getByTestId('editing--wrap-button').click();
      await expect(editor).toHaveCSS('white-space', 'break-spaces');
      await expect(editor).toHaveCSS('word-break', 'break-all');

      await page.getByTestId('editing--wrap-button').click();
      await expect(editor).toHaveCSS('white-space', 'pre');
    });

    test('Should keep the undo history when full screen is entered', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 2);
      await page.keyboard.type('.test');
      await expect(editor).toContainText('api.wallarm.example.test');

      const fullscreenButton = page.getByTestId('editing--fullscreen-button');
      await fullscreenButton.click();
      await expect(fullscreenButton).toHaveAccessibleName('Exit full screen');

      await editor.click();
      await page.keyboard.press(`${MOD}+z`);
      await expect(editor).not.toContainText('api.wallarm.example.test');
      await expect(fullscreenButton).toHaveAccessibleName('Exit full screen');
    });

    test('Should close the completion list without leaving full screen when Escape is pressed', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const fullscreenButton = page.getByTestId('editing--fullscreen-button');
      await fullscreenButton.click();
      await expect(fullscreenButton).toHaveAccessibleName('Exit full screen');

      await caretToLineEnd(page, editorOf(page, 'editing'), 4);
      await page.keyboard.press('Enter');
      await page.keyboard.type('Acc');
      const completions = page.getByRole('listbox');
      await expect(completions).toBeVisible();
      await expect(completions.getByRole('option', { name: /^Accept/ }).first()).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(completions).toHaveCount(0);
      await expect(fullscreenButton).toHaveAccessibleName('Exit full screen');
    });

    test('Should copy the edited value when the copy button is clicked', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          value: {
            writeText: (text: string) => {
              (window as CopyCaptureWindow).__copiedText = text;
              return Promise.resolve();
            },
          },
          writable: true,
          configurable: true,
        });
      });
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 2);
      await page.keyboard.type('.test');
      await expect(editor).toContainText('api.wallarm.example.test');

      await page.getByTestId('editing--copy-button').click();
      await expect(page.getByText('Copied')).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => (window as CopyCaptureWindow).__copiedText ?? ''))
        .toContain('POST /api/v1/rules HTTP/1.1\nHost: api.wallarm.example.test\n');
    });

    test('Should keep a separate undo history per tab when tabs are switched', async ({ page }) => {
      await interactionStory.goto(page, 'Tabs Keep History');
      await waitForEngine(page);
      const editor = editorOf(page, 'tabs-editor');

      // Line 3 ends with a closing quote; step inside it before typing.
      await caretToLineEnd(page, editor, 3);
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.type('-e2e');
      await expect(editor).toContainText('"/login-e2e"');

      await page.getByTestId('tabs-editor--tab-response').click();
      await expect(editor).toContainText('"reason": "blocked"');
      await caretToLineEnd(page, editor, 3);
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.type('-e2e');
      await expect(editor).toContainText('"blocked-e2e"');

      await page.getByTestId('tabs-editor--tab-request').click();
      await expect(editor).toContainText('"/login-e2e"');
      await editor.click();
      await page.keyboard.press(`${MOD}+z`);
      await expect(editor).toContainText('"path": "/login"');

      await page.getByTestId('tabs-editor--tab-response').click();
      await expect(editor).toContainText('"blocked-e2e"');
      await editor.click();
      await page.keyboard.press(`${MOD}+z`);
      await expect(editor).toContainText('"reason": "blocked"');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be exposed as a labelled multiline textbox via ARIA attributes', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await expect(editor).toHaveRole('textbox');
      await expect(editor).toHaveAccessibleName('HTTP request');
      await expect(editor).toHaveAccessibleDescription(CODE_EDITOR_KEYBOARD_HINT);
      await expect(editor).toHaveAttribute('aria-multiline', 'true');
    });

    test('Should be announced as read-only via aria-readonly', async ({ page }) => {
      await interactionStory.goto(page, 'Long Document');
      await waitForEngine(page);
      const editor = editorOf(page, 'long-document');
      await expect(editor).toHaveAttribute('aria-readonly', 'true');

      await editor.click();
      await expect(editor).toBeFocused();
      const before = await editorText(editor);
      await page.keyboard.type('x');
      expect(await editorText(editor)).toBe(before);
    });

    test('Should keep focus in the editor via Tab key', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 7);
      const before = await editorText(editor);

      await page.keyboard.press('Tab');
      await expect(editor).toBeFocused();
      await expect
        .poll(async () => (await editorText(editor)).length)
        .toBeGreaterThan(before.length);
    });

    test('Should move focus out of the editor via Escape then Tab', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 7);
      await expect(editor).toBeFocused();
      const before = await editorText(editor);

      await page.keyboard.press('Escape');
      await page.keyboard.press('Tab');
      await expect(editor).not.toBeFocused();
      expect(await editorText(editor)).toBe(before);
    });

    test('Should be collapsible via keyboard Enter on the fold toggle', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const headersToggle = page.getByTestId('editing--fold-toggle').first();
      await headersToggle.focus();
      await expect(headersToggle).toHaveAttribute('aria-expanded', 'true');

      await page.keyboard.press('Enter');
      await expect(page.getByTestId('editing--fold-summary')).toBeVisible();
      await expect(page.getByTestId('editing--fold-toggle').first()).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    test('Should close the search panel and return focus to the editor via Escape key', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 1);
      await page.keyboard.press(`${MOD}+f`);
      const searchInput = page.getByTestId('editing--search-input');
      await expect(searchInput).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(page.getByTestId('editing--search')).toHaveCount(0);
      await expect(editor).toBeFocused();
    });
  });
});
```

- [ ] **Step 10: Check test collection, typecheck and lint (no browser, no Storybook)**

```bash
echo "expected: $(( $(grep -c '^export const' src/components/CodeEditor/CodeEditor.stories.tsx) + 22 ))"
pnpm exec playwright test src/components/CodeEditor/CodeEditor.e2e.ts --list | tail -1
pnpm exec tsc -p tsconfig.e2e.json --noEmit 2>&1 | grep -v 'TS6307' | grep 'CodeEditor'
pnpm exec biome check src/components/CodeEditor/CodeEditor.e2e.ts
```

Expected:
- `--list` prints `Total: <expected> tests in 1 file`. That is one Visual test per story export, plus 5 Visual, 11 Interactions and 6 Accessibility tests. It only lists; nothing runs.
- If you see `createStoryHelper: storyNames cannot be empty`, the export regex found no stories: check that the stories use `export const`.
- The `tsc | grep` prints nothing. `tsconfig.e2e.json` already has unrelated TS6307, Dialog and FilterInput errors, so only CodeEditor lines matter.
- Biome reports no errors.

- [ ] **Step 11: Commit with the screenshot trigger and push**

```bash
git add src/components/CodeEditor/CodeEditor.e2e.ts
git commit -m "$(cat <<'EOF'
test(code-editor): add Visual, Interactions and Accessibility E2E suite [update-screenshots]

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
git push -u origin HEAD
```

If port 22 times out, retry once over 443: `GIT_SSH_COMMAND="ssh -o HostName=ssh.github.com -o Port=443" git push -u origin HEAD`.

- [ ] **Step 12: Watch the screenshot run**

The `e2e-update-screenshots` job ignores its own exit code. `commit-screenshots` then pushes a `🖼️ Update screenshots` bot commit and dispatches a fresh verification run (`workflow_dispatch`).

```bash
gh auth switch --user ispashkov
BRANCH=$(git branch --show-current)
gh run list --branch "$BRANCH" --workflow main.yml --limit 5
RUN_ID=$(gh run list --branch "$BRANCH" --workflow main.yml --event push --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RUN_ID" --exit-status
```

Expected: `Commit Updated Screenshots` succeeds, and a new `workflow_dispatch` run appears in `gh run list`.

- [ ] **Step 13: Inspect the bot commit and restore unrelated baselines from main**

Every baseline in the repo is regenerated. Flaky stories such as the FilterInput nested value menu can get a bad frame committed, so anything outside `CodeEditor/` is suspect.

```bash
git pull --ff-only
BOT=$(git log -1 --format=%H --author='github-actions\[bot\]')
git show --stat --format='%h %s' "$BOT"
TOP=$(git rev-parse --show-toplevel)
UNRELATED=$(git -C "$TOP" diff-tree --no-commit-id --name-only -r "$BOT" | grep -v '^packages/design-system/src/components/CodeEditor/' || true)
echo "$UNRELATED"
git -C "$TOP" fetch origin main
if [ -n "$UNRELATED" ]; then
  echo "$UNRELATED" | xargs git -C "$TOP" checkout origin/main --
  git -C "$TOP" commit -m "$(cat <<'EOF'
test(e2e): restore unrelated screenshot baselines from main

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
  git push
fi
```

Restored `CodeSnippet` baselines are a real signal, not noise. Phase 0 must leave them pixel-identical (spec §5, §13), so the verification run below decides. Do not re-bless them.

- [ ] **Step 14: Watch the verification runs and review the new baselines**

```bash
gh run list --branch "$BRANCH" --workflow main.yml --limit 5
VERIFY_ID=$(gh run list --branch "$BRANCH" --workflow main.yml --event workflow_dispatch --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$VERIFY_ID" --exit-status
# if Step 13 pushed a restore commit, also watch its push run:
PUSH_ID=$(gh run list --branch "$BRANCH" --workflow main.yml --event push --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$PUSH_ID" --exit-status
open src/components/CodeEditor/CodeEditor.e2e.ts-snapshots/
```

Expected: both runs are green.

Review every CodeEditor PNG by eye:
- no static fallback;
- no caret, except in the completion-open frame;
- colours present in the Prism and Shiki stories;
- the tooltip visible in the diagnostic frame;
- the fullscreen frame covers the viewport.

If a test fails:
1. Run `gh run download "$VERIFY_ID" -n e2e-results-shard-<N>` and compare `*-actual.png` with the baseline.
2. Fix the cause.
3. Push again, with `[update-screenshots]` only if the fix changes pixels.
4. Repeat Steps 12–14.

Never regenerate baselines locally.

---

### Task 18: Playground bundle measurement + final verification

**Files:**
- Create: `src/components/CodeEditor/boundary.test.ts`
- Create: `apps/playground/src/routes/code-editor.tsx`
- Modify: `apps/playground/src/routeTree.gen.ts`. It is generated by `@tanstack/router-plugin` during `rsbuild build` / `rsbuild dev`, and it is committed. The exact expected content is below.
- Test: `src/components/CodeEditor/boundary.test.ts`. The playground is checked by build + typecheck + dist grep. No unit test.

**Interfaces:**
- Consumes (public, from `@wallarm-org/design-system/CodeEditor`): `CodeEditorRoot`, `CodeEditorContent`, `type JsonSchema`.
- Consumes (from `@wallarm-org/design-system/CodeSnippet`): `CodeSnippetAdapterProvider`, `loadPrismAdapter`, `CodeSnippetHeader`, `CodeSnippetTitle`, `CodeSnippetActions`, `CodeSnippetCopyButton`, `CodeSnippetWrapButton`, `CodeSnippetFullscreenButton`.
- Consumes (source files the boundary test scans): `CodeEditorRoot.tsx`, `CodeEditorContent.tsx`, `CodeEditorContext.ts`, `types.ts`, `index.ts`, `classes.ts`, `hooks/**`, `lib/**`. It also checks two loaders:
  - `lib/loadEngine.ts` must contain `import('../engine')`.
  - `engine/schema/loadSchema.ts` must contain `import('json-schema-library')`.
- Consumes (for measurement only): these string markers survive minification.
  - `cm-scroller`, `cm-gutters` and `cm-content` come from `@codemirror/view` and from `engine/theme.ts`.
  - `JsonText` comes from `@lezer/json`.
  - `--fold-toggle` is the engine-derived test-id suffix.
  - `unevaluated-property-error` comes from `json-schema-library`.
- Produces: no new exports. `apps/playground` gets a lazy route at `/code-editor` (TanStack `autoCodeSplitting: true`). Its page uses the test ids `playground-code-editor-http` and `playground-code-editor-json`.

Notes checked while writing this task:
- A production `rsbuild build` resolves `@wallarm-org/design-system` through the `import` condition, which points to `dist/`. The `development` → `src/` condition applies only in dev. So the DS must be built before the playground.
- `build:doctor` has `dependsOn: ["^build:doctor"]` in `turbo.json`, which does not build the DS. Build the DS first and explicitly.
- `@rsdoctor/rspack-plugin` is a dependency of `@wallarm-org/rsbuild-config` only. rsbuild resolves it from `apps/playground` (`require.resolve(..., { paths: [rootPath] })`). So `RSDOCTOR=true` logs ``process.env.RSDOCTOR` enabled, please install @rsdoctor/rspack-plugin`` and runs a normal build. That is expected. Sizes come from the dist listing in Step 9. Do not add the dependency in this task.
- Rslib `bundle: false` writes one file per source file, each import on a single line, and rewrites `./x` to `./x.js`. The published `adapters/index.js` has `await import("./prism.js")`, so the dist greps below match single-line `import ... from "..."`.

---

- [ ] **Step 1: Write the boundary test**

Create `src/components/CodeEditor/boundary.test.ts`:

```ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

/**
 * Main-chunk import boundary (spec §3 / plan Global Constraints).
 *
 * Everything outside `engine/` ships in the consumer's main chunk. It may reach
 * CodeMirror, Lezer, json-schema-library or `engine/` only through `import type`
 * (erased at build time) or through `lib/loadEngine.ts`'s `import('../engine')`.
 * `json-schema-library` is reachable only through `engine/schema/loadSchema.ts`'s
 * `import('json-schema-library')`, so it stays a second, schema-only chunk.
 *
 * The check is textual on purpose: rslib runs with `bundle: false`, so every
 * source import survives 1:1 in `dist/`, and a regex over the source is exactly
 * what the consumer's bundler will see.
 */

const EDITOR_DIR = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_DIR = path.join(EDITOR_DIR, 'engine');

const HEAVY_PACKAGE = /^(@codemirror\/|@lezer\/|json-schema-library(\/|$))/;
const SCHEMA_PACKAGE = /^json-schema-library(\/|$)/;

/** Files the Global Constraints name explicitly; the scan below must find them all. */
const REQUIRED_MAIN_CHUNK_FILES = [
  'CodeEditorRoot.tsx',
  'CodeEditorContent.tsx',
  'CodeEditorContext.ts',
  'types.ts',
  'index.ts',
  'hooks/useCodeEditor.ts',
  'lib/loadEngine.ts',
];

interface ImportRecord {
  specifier: string;
  typeOnly: boolean;
  dynamic: boolean;
  statement: string;
}

const STATIC_IMPORT = /^[ \t]*import\s+(type\s+)?([^'";]*?)\s*from\s*['"]([^'"]+)['"]/gm;
const SIDE_EFFECT_IMPORT = /^[ \t]*import\s*['"]([^'"]+)['"]/gm;
const RE_EXPORT =
  /^[ \t]*export\s+(type\s+)?(\*(?:\s+as\s+\w+)?|\{[^}]*\})\s*from\s*['"]([^'"]+)['"]/gm;
const DYNAMIC_IMPORT = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Drops comment lines (`//`, `/*`, ` *`) so JSDoc examples never count as imports. */
const stripCommentLines = (source: string): string =>
  source
    .split('\n')
    .filter(line => !/^\s*(\/\/|\/\*|\*)/.test(line))
    .join('\n');

const collectImports = (rawSource: string): ImportRecord[] => {
  const source = stripCommentLines(rawSource);
  const records: ImportRecord[] = [];
  for (const match of source.matchAll(STATIC_IMPORT)) {
    records.push({
      specifier: match[3] ?? '',
      typeOnly: match[1] !== undefined,
      dynamic: false,
      statement: match[0].trim(),
    });
  }
  for (const match of source.matchAll(SIDE_EFFECT_IMPORT)) {
    records.push({
      specifier: match[1] ?? '',
      typeOnly: false,
      dynamic: false,
      statement: match[0].trim(),
    });
  }
  for (const match of source.matchAll(RE_EXPORT)) {
    records.push({
      specifier: match[3] ?? '',
      typeOnly: match[1] !== undefined,
      dynamic: false,
      statement: match[0].trim(),
    });
  }
  for (const match of source.matchAll(DYNAMIC_IMPORT)) {
    records.push({
      specifier: match[1] ?? '',
      typeOnly: false,
      dynamic: true,
      statement: match[0].trim(),
    });
  }
  return records;
};

const resolvesIntoEngine = (fromFile: string, specifier: string): boolean => {
  if (!specifier.startsWith('.')) return false;
  const target = path.resolve(path.dirname(fromFile), specifier);
  return target === ENGINE_DIR || target.startsWith(`${ENGINE_DIR}${path.sep}`);
};

const isHeavy = (fromFile: string, specifier: string): boolean =>
  HEAVY_PACKAGE.test(specifier) || resolvesIntoEngine(fromFile, specifier);

/**
 * Violations for a main-chunk file: any value (non-`import type`) import or
 * re-export of a heavy module, and any dynamic import of one — except
 * `lib/loadEngine.ts`'s `import('../engine')`.
 */
const findMainChunkViolations = (filePath: string, source: string): string[] => {
  const isLoader = filePath === path.join(EDITOR_DIR, 'lib', 'loadEngine.ts');
  return collectImports(source)
    .filter(record => isHeavy(filePath, record.specifier))
    .filter(record => !record.typeOnly)
    .filter(record => !(record.dynamic && isLoader && record.specifier === '../engine'))
    .map(record => `${path.relative(EDITOR_DIR, filePath)}: ${record.statement}`);
};

/**
 * Violations for json-schema-library anywhere in CodeEditor: only
 * `engine/schema/loadSchema.ts` may import it, and only dynamically.
 */
const findSchemaLibraryViolations = (filePath: string, source: string): string[] => {
  const isSchemaLoader = filePath === path.join(ENGINE_DIR, 'schema', 'loadSchema.ts');
  return collectImports(source)
    .filter(record => SCHEMA_PACKAGE.test(record.specifier))
    .filter(record => !record.typeOnly)
    .filter(record => !(record.dynamic && isSchemaLoader))
    .map(record => `${path.relative(EDITOR_DIR, filePath)}: ${record.statement}`);
};

const isSourceFile = (name: string): boolean =>
  /\.(ts|tsx)$/.test(name) && !/\.(test|stories|e2e)\.(ts|tsx)$/.test(name);

const walk = (dir: string, found: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.endsWith('-snapshots')) walk(full, found);
    } else if (isSourceFile(entry.name)) {
      found.push(full);
    }
  }
  return found;
};

const allSourceFiles = walk(EDITOR_DIR);
const mainChunkFiles = allSourceFiles.filter(
  file => !(file === ENGINE_DIR || file.startsWith(`${ENGINE_DIR}${path.sep}`)),
);
const read = (file: string): string => fs.readFileSync(file, 'utf8');

describe('CodeEditor import boundary', () => {
  describe('detector', () => {
    const root = path.join(EDITOR_DIR, 'CodeEditorRoot.tsx');
    const loader = path.join(EDITOR_DIR, 'lib', 'loadEngine.ts');
    const hook = path.join(EDITOR_DIR, 'hooks', 'useCodeEditor.ts');

    it('flags static value imports of CodeMirror, Lezer and json-schema-library', () => {
      const source = [
        "import { EditorView } from '@codemirror/view';",
        "import { tags } from '@lezer/highlight';",
        "import { compileSchema } from 'json-schema-library';",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toHaveLength(3);
    });

    it('flags multi-line, side-effect, namespace and inline-type imports', () => {
      const source = [
        'import {',
        '  EditorState,',
        '  type Extension,',
        "} from '@codemirror/state';",
        "import '@codemirror/view';",
        "import * as lr from '@lezer/lr';",
        "import { type EditorHandle } from './engine/types';",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toHaveLength(4);
    });

    it('flags value imports and re-exports that resolve into engine/', () => {
      const source = [
        "import { createEditor } from './engine';",
        "export { createEditor } from './engine/index';",
        "export * from './engine/positions';",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toHaveLength(3);
      expect(
        findMainChunkViolations(hook, "import { createEditor } from '../engine';"),
      ).toHaveLength(1);
    });

    it('allows import type, export type and unrelated relative paths', () => {
      const source = [
        "import type { EditorView } from '@codemirror/view';",
        "import type { EditorHandle, EngineOptions } from './engine/types';",
        "export type { EditorHandle } from './engine/types';",
        "import { cn } from '../../utils/cn';",
        "import { ChromeFrame } from '../CodeSnippet/internal/ChromeFrame';",
        "import { enginePlaceholder } from './engineless';",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toEqual([]);
    });

    it("allows import('../engine') only in lib/loadEngine.ts", () => {
      const source = "export const loadEngine = () => import('../engine');";
      expect(findMainChunkViolations(loader, source)).toEqual([]);
      expect(findMainChunkViolations(hook, source)).toHaveLength(1);
      expect(findMainChunkViolations(loader, "const m = import('@codemirror/view');")).toHaveLength(
        1,
      );
    });

    it('ignores imports mentioned inside JSDoc comments', () => {
      const source = [
        '/**',
        " * import { EditorView } from '@codemirror/view';",
        ' */',
        "// import { EditorView } from '@codemirror/view';",
        " * Loaded lazily via import('../engine') on first mount.",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toEqual([]);
    });

    it('allows json-schema-library only as a dynamic import in engine/schema/loadSchema.ts', () => {
      const schemaLoader = path.join(ENGINE_DIR, 'schema', 'loadSchema.ts');
      const validate = path.join(ENGINE_DIR, 'schema', 'validate.ts');
      const dynamic = "export const load = () => import('json-schema-library');";
      const stat = "import { compileSchema } from 'json-schema-library';";
      const typeOnly = "import type { SchemaNode } from 'json-schema-library';";
      expect(findSchemaLibraryViolations(schemaLoader, dynamic)).toEqual([]);
      expect(findSchemaLibraryViolations(schemaLoader, stat)).toHaveLength(1);
      expect(findSchemaLibraryViolations(validate, dynamic)).toHaveLength(1);
      expect(findSchemaLibraryViolations(validate, typeOnly)).toEqual([]);
    });
  });

  describe('source tree', () => {
    it('scans every main-chunk file named in the Global Constraints', () => {
      const relative = mainChunkFiles.map(file =>
        path.relative(EDITOR_DIR, file).split(path.sep).join('/'),
      );
      for (const required of REQUIRED_MAIN_CHUNK_FILES) {
        expect(relative).toContain(required);
      }
      expect(relative.some(file => file.startsWith('engine/'))).toBe(false);
    });

    it('has no static value import of engine/, CodeMirror, Lezer or json-schema-library outside engine/', () => {
      const violations = mainChunkFiles.flatMap(file => findMainChunkViolations(file, read(file)));
      expect(violations).toEqual([]);
    });

    it("loads the engine through lib/loadEngine.ts's import('../engine')", () => {
      const source = read(path.join(EDITOR_DIR, 'lib', 'loadEngine.ts'));
      expect(source).toMatch(/\bimport\s*\(\s*['"]\.\.\/engine['"]\s*\)/);
    });

    it('imports json-schema-library only dynamically from engine/schema/loadSchema.ts', () => {
      const violations = allSourceFiles.flatMap(file =>
        findSchemaLibraryViolations(file, read(file)),
      );
      expect(violations).toEqual([]);
      const loader = read(path.join(ENGINE_DIR, 'schema', 'loadSchema.ts'));
      expect(loader).toMatch(/\bimport\s*\(\s*['"]json-schema-library['"]\s*\)/);
    });
  });
});
```

The file is already Biome-formatted: it was checked with `biome check --write` through stdin, and a second pass made no changes. The regexes were run against a fake tree in a throwaway directory. The fake tree passed all 11 tests. With a violation added to `hooks/useCodeEditor.ts` and to `engine/schema/validate.ts`, exactly the two `source tree` tests failed, and each named the offending line.

- [ ] **Step 2: Run the boundary test**

Run: `pnpm vitest run src/components/CodeEditor/boundary.test.ts`

Expected: PASS, 11 tests. The 7 `detector` tests check the regexes against the inline fixtures. The 4 `source tree` tests check the real Tasks 3–15 tree.

If `has no static value import …` fails, the failure diff lists `relative/path: <statement>`. Fix the source, not the test:
- If the import is only used as a type, turn it into `import type { … }`.
- If it is a value import, move the code into `engine/` and reach it through the `EditorHandle` returned by `loadEngine()`.

If `scans every main-chunk file …` fails, a file named in the Global Constraints is missing or was moved. Restore it to the path in the File Map.

- [ ] **Step 3: Show the guard fails on a real regression (red check), then revert**

Run:
```bash
printf "\nimport { EditorView } from '@codemirror/view';\nexport const __boundaryProbe = EditorView;\n" >> src/components/CodeEditor/hooks/useCodeEditor.ts
pnpm vitest run src/components/CodeEditor/boundary.test.ts
```
Expected: FAIL, 1 failed / 10 passed. The diff shows `+ "hooks/useCodeEditor.ts: import { EditorView } from '@codemirror/view'"`.

Revert it and re-run:
```bash
git checkout -- src/components/CodeEditor/hooks/useCodeEditor.ts
pnpm vitest run src/components/CodeEditor/boundary.test.ts
```
Expected: PASS, 11 tests. `git status --short src/components/CodeEditor/hooks` prints nothing.

- [ ] **Step 4: Lint and commit the guard**

Run: `pnpm exec biome check src/components/CodeEditor/boundary.test.ts`

Expected: `Checked 1 file … No fixes applied.` and exit 0.

```bash
git add src/components/CodeEditor/boundary.test.ts
git commit -m "test(code-editor): guard main-chunk import boundary

Static regex scan over CodeEditor sources: nothing outside engine/ may
value-import @codemirror/*, @lezer/*, json-schema-library or engine/;
only lib/loadEngine.ts may import('../engine') and only
engine/schema/loadSchema.ts may import('json-schema-library').

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Final verification: full unit run**

Run: `pnpm vitest run`

Expected: every test file passes. That includes:
- the existing CodeSnippet suites: `CodeSnippet.test.tsx`, `CodeSnippet.nesting.test.tsx`, `adapters/adapters.test.ts`, `lib/*.test.ts`;
- the Copyable tests;
- every CodeEditor suite from Tasks 3–16;
- `boundary.test.ts`;
- `scripts/metadata/__tests__/*`.

The summary shows `Test Files  N passed (N)`, with no `failed` count. `retry: 2` is configured, so a test marked "retry" that passes on retry is a load flake. A test that fails on all three attempts is a real regression: stop and fix it before continuing.

- [ ] **Step 6: Final verification: typecheck and lint**

Run each command and wait for it to finish:
```bash
pnpm exec tsc --build tsconfig.app.json --noEmit
pnpm exec biome check src/components/CodeEditor src/components/CodeSnippet src/components/Copyable vitest.setup.ts package.json
```
Expected:
- `tsc` exits 0 with no output. Do not use `pnpm typecheck`: it runs `tsc --noEmit` on a `files: []` tsconfig and checks nothing.
- `biome check` exits 0 with `No fixes applied`. If it reports formatting or import-order issues, run the same command with `--write`, re-run it without `--write`, and fold the result into Step 13's fix-up commit.

- [ ] **Step 7: Final verification: build the DS and check the dist boundary**

Run: `pnpm build`

This runs `rslib build && pnpm generate-metadata`. Expected: exit 0. Metadata generation passes Zod validation, with no `Validation failed` output.

Check that the entry points exist:
```bash
test -f dist/components/CodeEditor/index.js && echo OK-index-js
test -f dist/components/CodeEditor/index.d.ts && echo OK-index-dts
test -f dist/components/CodeEditor/engine/index.js && echo OK-engine-js
test -f dist/components/CodeEditor/engine/schema/loadSchema.js && echo OK-loadSchema-js
```
Expected: all four `OK-*` lines.

Check that the dynamic imports are still in dist:
```bash
grep -n 'import("\.\./engine' dist/components/CodeEditor/lib/loadEngine.js
grep -n 'import("json-schema-library")' dist/components/CodeEditor/engine/schema/loadSchema.js
```
Expected:
- Line 1 prints one match: `import("../engine/index.js")`. Rslib rewrites the directory import.
- Line 2 prints one match.
- If either prints nothing, the build collapsed the lazy boundary. Stop and inspect `rslib.config.ts` (`bundle: false` must hold).

Check that no main-chunk dist file imports the heavy modules statically:
```bash
grep -rnE '^import .* from "(@codemirror/|@lezer/|json-schema-library)' dist/components/CodeEditor --include='*.js' | grep -v '^dist/components/CodeEditor/engine/' ; echo "exit-marker-1"
grep -rnE '^(import|export) .* from "(\./|\.\./)+engine(/|")' dist/components/CodeEditor --include='*.js' | grep -v '^dist/components/CodeEditor/engine/' ; echo "exit-marker-2"
grep -rnE '^import .* from "json-schema-library' dist/components/CodeEditor --include='*.js' ; echo "exit-marker-3"
```
Expected: only `exit-marker-1`, `exit-marker-2` and `exit-marker-3` are printed, with no match lines. `import type` is erased in `.js`, so any match here is a real static import.

Check that the public types stay free of CodeMirror:
```bash
grep -nE 'codemirror|lezer|json-schema-library' dist/components/CodeEditor/index.d.ts dist/components/CodeEditor/types.d.ts ; echo "exit-marker-4"
grep -n 'CodeEditor' src/index.ts ; echo "exit-marker-5"
```
Expected: only `exit-marker-4` and `exit-marker-5`.
- `JsonSchema` is structural in `types.ts`, so no engine type leaks into the public d.ts.
- CodeEditor is a subpath export only, like CodeSnippet (conflict E), so the root barrel does not mention it.

- [ ] **Step 8: Final verification: MCP metadata**

Run:
```bash
jq '.components[] | select(.name=="CodeEditor") | {name, importPath, description, props: (.props | length), subComponents: [.subComponents[].name]}' dist/metadata/components.json
jq -e '[.components[] | select(.name=="CodeEditor")] | length == 1 and .[0].importPath == "@wallarm-org/design-system/CodeEditor" and ((.[0].props | length) > 0) and (((.[0].description // "") | length) > 0) and ([.[0].subComponents[].name] | index("CodeEditorRoot") != null and index("CodeEditorContent") != null)' dist/metadata/components.json
```
Expected:
- The first command prints one object. It has `"importPath": "@wallarm-org/design-system/CodeEditor"` and the JSDoc description from `CodeEditorRoot`. `props` is greater than 0, because `CodeEditorProps = CodeEditorRootProps` is exported. `subComponents` include `CodeEditorRoot` and `CodeEditorContent`.
- The second command prints `true` and exits 0. If it prints `false`:
  - `props` = 0 means the `CodeEditorProps` export is missing from `index.ts`.
  - An empty description means the JSDoc on `CodeEditorRoot` is missing.
  - Fix it, re-run `pnpm build`, then re-run this step.

- [ ] **Step 9: Add the playground route**

Create `apps/playground/src/routes/code-editor.tsx`:

```tsx
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@wallarm-org/design-system/Button';
import {
  CodeEditorContent,
  CodeEditorRoot,
  type JsonSchema,
} from '@wallarm-org/design-system/CodeEditor';
import {
  CodeSnippetActions,
  CodeSnippetAdapterProvider,
  CodeSnippetCopyButton,
  CodeSnippetFullscreenButton,
  CodeSnippetHeader,
  CodeSnippetTitle,
  CodeSnippetWrapButton,
  loadPrismAdapter,
} from '@wallarm-org/design-system/CodeSnippet';
import { Heading } from '@wallarm-org/design-system/Heading';
import { VStack } from '@wallarm-org/design-system/Stack';
import { Text } from '@wallarm-org/design-system/Text';

export const Route = createFileRoute('/code-editor')({
  component: CodeEditorPage,
});

const HTTP_REQUEST = [
  'POST /api/v1/users HTTP/1.1',
  'Host: api.example.com',
  'Content-Type: application/json',
  'Authorization: Bearer <token>',
  '',
  '{',
  '  "name": "Jane Doe",',
  '  "email": "jane@example.com",',
  '  "roles": ["admin"]',
  '}',
].join('\n');

const USER_JSON = [
  '{',
  '  "name": "Jane Doe",',
  '  "email": "jane@example.com",',
  '  "roles": ["admin", "owner"]',
  '}',
].join('\n');

const USER_SCHEMA: JsonSchema = {
  type: 'object',
  required: ['name', 'email'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', description: 'Display name' },
    email: { type: 'string', format: 'email', description: 'Login e-mail' },
    roles: {
      type: 'array',
      items: { type: 'string', enum: ['admin', 'viewer'] },
    },
  },
};

function CodeEditorPage() {
  // The JSON editor starts without a schema, so json-schema-library's chunk is
  // requested only after the button is pressed (watch the Network tab).
  const [withSchema, setWithSchema] = useState(false);

  return (
    <div className='flex flex-col w-screen min-h-screen p-32'>
      <VStack gap={16}>
        <Heading color='primary'>CodeEditor</Heading>
        <Text color='secondary'>
          Bundle-measurement route: the editor engine is one lazy chunk loaded on first mount;
          json-schema-library is a second chunk loaded only when a schema is attached.
        </Text>

        <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
          <CodeEditorRoot
            language='http'
            defaultValue={HTTP_REQUEST}
            data-testid='playground-code-editor-http'
          >
            <CodeSnippetHeader>
              <CodeSnippetTitle>Request</CodeSnippetTitle>
              <CodeSnippetActions>
                <CodeSnippetCopyButton />
                <CodeSnippetWrapButton />
                <CodeSnippetFullscreenButton />
              </CodeSnippetActions>
            </CodeSnippetHeader>
            <CodeEditorContent lineNumbers aria-label='HTTP request' />
          </CodeEditorRoot>

          <Button
            variant='outline'
            color='neutral'
            onClick={() => setWithSchema(current => !current)}
          >
            {withSchema ? 'Detach JSON Schema' : 'Attach JSON Schema'}
          </Button>

          <CodeEditorRoot
            language='json'
            defaultValue={USER_JSON}
            schema={withSchema ? USER_SCHEMA : undefined}
            data-testid='playground-code-editor-json'
          >
            <CodeSnippetHeader>
              <CodeSnippetTitle>User (JSON)</CodeSnippetTitle>
              <CodeSnippetActions>
                <CodeSnippetCopyButton />
              </CodeSnippetActions>
            </CodeSnippetHeader>
            <CodeEditorContent lineNumbers aria-label='User JSON' />
          </CodeEditorRoot>
        </CodeSnippetAdapterProvider>
      </VStack>
    </div>
  );
}
```

About `httpCompletions`: it is deliberately not passed, because the built-in HTTP completions are already active for `language='http'` (Task 14). Passing it through `completions` would duplicate every suggestion.

Replace `apps/playground/src/routeTree.gen.ts` with the generator's output. It was produced by `@tanstack/router-generator@1.167.24` with the playground's `target: 'react'`, `autoCodeSplitting: true`, `semicolons: true`. `rsbuild build` regenerates it byte-for-byte in Step 10:

```ts
/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root';
import { Route as IndexRouteImport } from './routes/index';
import { Route as CodeEditorRouteImport } from './routes/code-editor';

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any);
const CodeEditorRoute = CodeEditorRouteImport.update({
  id: '/code-editor',
  path: '/code-editor',
  getParentRoute: () => rootRouteImport,
} as any);

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute;
  '/code-editor': typeof CodeEditorRoute;
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute;
  '/code-editor': typeof CodeEditorRoute;
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport;
  '/': typeof IndexRoute;
  '/code-editor': typeof CodeEditorRoute;
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: '/' | '/code-editor';
  fileRoutesByTo: FileRoutesByTo;
  to: '/' | '/code-editor';
  id: '__root__' | '/' | '/code-editor';
  fileRoutesById: FileRoutesById;
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  CodeEditorRoute: typeof CodeEditorRoute;
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof IndexRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    '/code-editor': {
      id: '/code-editor';
      path: '/code-editor';
      fullPath: '/code-editor';
      preLoaderRoute: typeof CodeEditorRouteImport;
      parentRoute: typeof rootRouteImport;
    };
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  CodeEditorRoute: CodeEditorRoute,
};
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();
```

`*.gen.ts` is excluded in the root `biome.json` (`"!**/*.gen.ts"`). Do not format it.

Lint the route:
```bash
pnpm exec biome check --write ../../apps/playground/src/routes/code-editor.tsx
pnpm exec biome check ../../apps/playground/src/routes/code-editor.tsx
```
Expected: the second run exits 0. `--write` may reorder the import groups: react, then packages, then `@wallarm-org/*`. That is expected.

- [ ] **Step 10: Build the playground and typecheck it**

Step 7 already built the DS `dist/`, which the playground's production build resolves through the `import` condition. Run from `packages/design-system/`:
```bash
pnpm --filter @wallarm-org/playground build:doctor
pnpm --filter @wallarm-org/playground typecheck
git diff --stat -- ../../apps/playground/src/routeTree.gen.ts
```
Expected:
- **`build:doctor`**
  - exits 0 and prints rsbuild's file-size table, with a `Gzip` column, for `dist/static/js/*.js` and `dist/static/js/async/*.js`;
  - may print ``process.env.RSDOCTOR` enabled, please install @rsdoctor/rspack-plugin``, which is expected (see the notes at the top);
  - must not error on `Module not found` for `@codemirror/*`, `@lezer/*` or `json-schema-library`. They resolve from `packages/design-system/node_modules` because they are DS `dependencies`.
- **`typecheck`** (`tsc --build --noEmit` over app/unit/e2e) exits 0. It type-checks the route against `dist/components/CodeEditor/index.d.ts`, with `verbatimModuleSyntax`, so `type JsonSchema` must stay a type import.
- **`git diff --stat`** shows `routeTree.gen.ts` either unchanged from Step 9, or regenerated identically. If the plugin produced different content, keep the plugin's version.

- [ ] **Step 11: Measure chunk sizes (gzip -9)**

Run from `packages/design-system/`:
```bash
bash <<'EOF'
cd ../../apps/playground
find dist/static/js -name '*.js' -print0 | while IFS= read -r -d '' f; do
  gz=$(gzip -9c "$f" | wc -c | tr -d ' ')
  tags=''
  grep -qE 'cm-scroller|cm-gutters|cm-content|JsonText|--fold-toggle' "$f" && tags="$tags [engine]"
  grep -q 'unevaluated-property-error' "$f" && tags="$tags [jsl]"
  grep -q 'playground-code-editor' "$f" && tags="$tags [route]"
  grep -q 'prism' "$f" && tags="$tags [prism]"
  printf '%8d  %s%s\n' "$gz" "$f" "$tags"
done | sort -n > dist/chunk-sizes.txt
cat dist/chunk-sizes.txt
echo '---'
awk '/\[engine\]/ && !/\[route\]/ && !/\[jsl\]/ {s+=$1} END {printf "engine (all [engine] chunks): %.1f KB gz\n", s/1024}' dist/chunk-sizes.txt
awk '/\[jsl\]/ {s+=$1} END {printf "json-schema-library: %.1f KB gz\n", s/1024}' dist/chunk-sizes.txt
awk '/\[route\]/ {s+=$1} END {printf "/code-editor route chunk (CodeEditorRoot + chrome): %.1f KB gz\n", s/1024}' dist/chunk-sizes.txt
echo '--- initial chunks must not contain engine, jsl or the route:'
for f in $(grep -oE 'static/js/[^"]+\.js' dist/index.html); do
  if grep -qE 'cm-scroller|cm-gutters|JsonText|unevaluated-property-error|playground-code-editor' "dist/$f"; then echo "LEAK: $f"; fi
done
echo 'initial-chunk check done'
EOF
```

Expected:
1. `chunk-sizes.txt` lists every JS file, and at least one line is tagged each of `[engine]`, `[jsl]` and `[route]`.
2. No line carries both `[route]` and `[engine]`: the engine is its own lazy chunk, separate from the route chunk that holds `CodeEditorRoot`. No line carries both `[engine]` and `[jsl]`: json-schema-library is split from the engine.
3. The engine total is about 150 KB gz and json-schema-library about 32 KB gz (spec §11 esbuild baseline). Record the numbers. No gate exists and none is added. If the engine total is over 200 KB gz (the CLAUDE.md budget), say so explicitly in the PR description as a risk. Do not fail the task on it.
4. `initial-chunk check done` is printed with no `LEAK:` line above it. Pages without CodeEditor pay 0.
5. Any untagged file under `dist/static/js/async/` larger than 1 KB gz should be a prism language chunk, the only other lazy code on this page. If it is not, open it and add its origin to the table in Step 12.

`dist/` is gitignored (`.gitignore:31`), so `chunk-sizes.txt` is never committed.

- [ ] **Step 12: Record the numbers for the PR description**

Copy this table into the PR body under a `## Bundle (apps/playground /code-editor)` heading. Fill it from Step 11's output and rsbuild's own `Gzip` column from Step 10:

```markdown
| Chunk | gzip -9 (KB) | rsbuild Gzip (KB) | Loaded when |
|---|---|---|---|
| engine (`[engine]` chunks, sum) | … | … | first `CodeEditorContent` mount |
| json-schema-library (`[jsl]`) | … | … | first `schema` prop |
| `/code-editor` route (`[route]`: CodeEditorRoot + CodeSnippet chrome) | … | … | route navigation |
| initial chunks containing engine/jsl | none | — | — |

Baseline (spec §11, esbuild 2026-09-30): engine ≈ 150 KB gz, json-schema-library ≈ 32 KB gz.
Measured with `pnpm --filter @wallarm-org/playground build:doctor` (rsdoctor plugin not resolvable from apps/playground, plain build output) + `gzip -9`.
```

- [ ] **Step 13: Commit the playground route (and any fix-ups from Steps 5–8)**

```bash
git add ../../apps/playground/src/routes/code-editor.tsx ../../apps/playground/src/routeTree.gen.ts
git commit -m "chore(code-editor): add playground route for bundle measurement

Lazy /code-editor route renders CodeEditorRoot (http + prism adapter,
json with an on-demand schema) so build:doctor output shows the engine
chunk and the json-schema-library chunk separately from the main chunk.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

If Steps 5–8 needed source fixes (Biome `--write`, a missing `CodeEditorProps` export, a missing JSDoc), commit them separately first. Stage exactly the files you changed, for example:
```bash
git add src/components/CodeEditor/index.ts src/components/CodeEditor/CodeEditorRoot.tsx
git commit -m "fix(code-editor): address final verification findings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 14: Clean-tree check**

Run:
```bash
git status --short
pnpm vitest run src/components/CodeEditor/boundary.test.ts
```
Expected: `git status --short` prints nothing (`dist/` is ignored) and the boundary test passes, 11 tests. Do not run E2E locally. The Task 17 CI run with `[update-screenshots]` owns baselines, and this task adds no E2E.
