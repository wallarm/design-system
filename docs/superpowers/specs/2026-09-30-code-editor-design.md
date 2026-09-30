# CodeEditor — design spec

- **Base:** CodeMirror 6 (`@codemirror/state` 6.7.6, `@codemirror/view` 6.43.13, `@codemirror/language` 6.12.4 — versions as of 2026-09-30)
- **Looks like / reuses:** `CodeSnippet` (`packages/design-system/src/components/CodeSnippet/`)
- **Import path:** `@wallarm-org/design-system/CodeEditor` (subpath only, like CodeSnippet — not in the root barrel)
- **Reference scenario:** editing an HTTP request with a JSON body validated against a JSON Schema
- **Research:** engine comparison (CM6 vs Monaco vs overlay vs own engine) was done before this spec; CM6 was chosen.

## 1. Goal

An editable code surface that is visually the same component as `CodeSnippet` — same chrome (header, title, tabs, actions, copy/wrap/fullscreen/show-more), same gutter (colour stick, line numbers, folds, prefix), same token colours, same line colours — with the editing capabilities people expect from VS Code's editor:

- typing with undo/redo, IME, auto-indent, bracket auto-close and matching, multi-cursor, rectangular selection;
- find / replace;
- diagnostics (JSON syntax, JSON Schema, consumer-supplied);
- autocomplete (JSON Schema keys/values, HTTP methods/headers/values, consumer sources);
- a diff mode showing changes against an original;
- large documents without DOM growth (CM6 renders only the viewport).

`CodeSnippet` stays the read-only, SSR-friendly, zero-engine component. `CodeEditor` is for values that change.

## 2. Decisions

| # | Decision |
|---|---|
| D1 | Separate compound component `CodeEditor`, not an `editable` mode on CodeSnippet. Pages that only display code never load the engine. |
| D2 | Engine: CodeMirror 6, lazy-loaded as one chunk from `CodeEditorContent`. No Web Workers. |
| D3 | **Colours come from the same `SyntaxAdapter` as CodeSnippet** (`CodeSnippetAdapterProvider` → `useAdapter()`, fallback `plainAdapter`). Adapter tokens are painted as CM mark decorations with the existing `TOKEN_CLASSES`. With Prism the editor looks like CodeSnippet+Prism, with Shiki like CodeSnippet+Shiki, with no provider it is plain — exactly as CodeSnippet. No Lezer `HighlightStyle` is used for colour. |
| D4 | Lezer parsers are used **for structure only** (no colour): a custom HTTP grammar nesting `@lezer/json` through `parseMixed`, `@codemirror/lang-json`, `@codemirror/lang-yaml`. `bash` and `text` have no parser. |
| D5 | Chrome is shared: phase 0 adds a `CodeSnippetChromeContext` to CodeSnippet; the chrome buttons read only that context; `CodeEditorRoot` provides it. Header/Title/Tabs/Tab/Actions are reused unchanged. |
| D6 | `lines` and `folds` are **static**: the props are the source of truth and are re-applied by (absolute) line number after every change. Decorations do not travel with edited text. Consumers who want anchored decorations recompute them from `value`. |
| D7 | Diff = prop `original` on `CodeEditorRoot`. Rendered unified, one column, the CodeSnippet way: inserted lines are `success` lines with a `+` prefix, deleted lines are `danger` rows with a `-` prefix and no line number. Built on `@codemirror/merge` `unifiedMergeView`. No split view, no accept/reject controls. |
| D8 | JSON Schema support is our own code on `json-schema-library` 11 (drafts 04 → 2020-12, no `eval`, ~32 KB gz, loaded only when `schema` is set). `codemirror-json-schema` is **not** used (Draft-04 only, unmaintained since 2025-04, bundles shiki v1 + markdown-it, broken ESM). |
| D9 | ReactNode content inside CM DOM (line prefixes, fold toggles, fold summaries, search panel) is rendered by React through a **portal registry**: CM `toDOM` creates a host element and registers it; a React component renders `createPortal(node, host)` for every registered host. DS components (`FoldToggle`, `Tooltip`, `Input`, `IconButton`) are reused as-is. |
| D10 | Consumer attributes on `CodeEditorContent` (`data-*`, `aria-*`, `id`, `title`) land on the real typing surface `.cm-content` via `EditorView.contentAttributes`. React event handlers stay on the content wrapper and receive bubbled events from `.cm-content`. Reserved CM attributes are never overwritten (§9). |
| D11 | `readOnly` uses `EditorState.readOnly` (focusable, selectable, searchable, copyable), never `EditorView.editable: false`. |
| D12 | Out of scope (YAGNI): TypeScript/LSP IntelliSense, split diff and merge controls, mobile-specific work, cross-browser Playwright projects, schema-driven hover for YAML, languages beyond `http`/`json`/`yaml`/`bash`/`text`, an `onError` for engine load failures. |

## 3. Anatomy

```
CodeEditorRoot                       data-slot="code-editor"    (chrome provider + editor state owner)
├── CodeSnippetHeader                reused
│   ├── CodeSnippetTitle             reused
│   ├── CodeSnippetTabs / Tab        reused (consumer swaps value + documentId)
│   └── CodeSnippetActions           reused
│       ├── CodeSnippetCopyButton    reused (reads chrome context)
│       ├── CodeSnippetWrapButton    reused
│       └── CodeSnippetFullscreenButton reused
├── CodeSnippetActions               reused — floating variant (direct child), same Root CVA
├── CodeEditorContent                data-slot="code-editor-content"  (lazy engine host)
│   └── .cm-editor
│       ├── .cm-panels-top           search panel (React via portal registry)
│       ├── .cm-gutters              colour stick | line numbers | fold | prefix
│       └── .cm-content              typing surface — consumer attributes land here
└── CodeSnippetShowMoreButton        reused (auto-rendered when maxLines > 0, as in CodeSnippet)
```

### Usage

```tsx
import { CodeEditorContent, CodeEditorRoot } from '@wallarm-org/design-system/CodeEditor';
import {
  CodeSnippetActions,
  CodeSnippetAdapterProvider,
  CodeSnippetCopyButton,
  CodeSnippetFullscreenButton,
  CodeSnippetHeader,
  CodeSnippetTitle,
  CodeSnippetWrapButton,
  getHttpFolds,
  loadPrismAdapter,
} from '@wallarm-org/design-system/CodeSnippet';

<CodeSnippetAdapterProvider adapter={prismAdapter}>
  <CodeEditorRoot
    value={request}
    onChange={setRequest}
    language='http'
    schema={ruleBodySchema}
    folds={(value, { startingLineNumber }) => getHttpFolds(value, { startingLineNumber })}
    lines={{ 1: { color: 'brand', prefix: <Lock /> } }}
    onDiagnosticsChange={setProblems}
    data-testid='request-editor'
  >
    <CodeSnippetHeader>
      <CodeSnippetTitle>Request</CodeSnippetTitle>
      <CodeSnippetActions>
        <CodeSnippetCopyButton />
        <CodeSnippetWrapButton />
        <CodeSnippetFullscreenButton />
      </CodeSnippetActions>
    </CodeSnippetHeader>
    <CodeEditorContent lineNumbers aria-label='HTTP request' data-analytics-id='rule-request-editor' />
  </CodeEditorRoot>
</CodeSnippetAdapterProvider>
```

Diff against the stored version:

```tsx
<CodeEditorRoot original={storedRequest} value={draft} onChange={setDraft} language='http'>
  <CodeEditorContent lineNumbers aria-label='Request changes' />
</CodeEditorRoot>
```

Tabs with per-tab undo history:

```tsx
<CodeEditorRoot documentId={tab} value={docs[tab]} onChange={v => setDocs({ ...docs, [tab]: v })} language='json'>
  <CodeSnippetHeader>
    <CodeSnippetTabs value={tab} onValueChange={setTab}>
      <CodeSnippetTab value='request'>Request</CodeSnippetTab>
      <CodeSnippetTab value='response'>Response</CodeSnippetTab>
    </CodeSnippetTabs>
  </CodeSnippetHeader>
  <CodeEditorContent lineNumbers />
</CodeEditorRoot>
```

## 4. Public API

### `CodeEditorRoot`

Extends `Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'defaultValue'>`, `TestableProps`, and the Root CVA variant props. JSDoc on `CodeEditorRoot` is the MCP metadata description.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | — | Controlled document. |
| `defaultValue` | `string` | `''` | Uncontrolled initial document. Controlled vs uncontrolled is locked on first render (`src/hooks/useControlled.ts`). |
| `onChange` | `(value: string) => void` | — | Fired for user edits only, never for external `value` syncs. |
| `language` | `CodeEditorLanguage` = `'http' \| 'json' \| 'yaml' \| 'bash' \| 'text'` | `'text'` | Passed verbatim to the adapter (D3) and selects the structural parser (D4). |
| `documentId` | `string` | — | Identity of the document. Changing it swaps to a cached `EditorState` for that id (undo history, selection, collapsed folds per tab). Without it, an external `value` change is a normal (undoable-by-API, not by user) replacement. |
| `size` | `CodeSnippetSize` | `'sm'` | Same CVA as CodeSnippet (12/14/16px font, 20px rows). |
| `readOnly` | `boolean` | `false` | D11. |
| `startingLineNumber` | `number` | `1` | Offsets gutter numbers; `lines`, `folds`, `diagnostics` use absolute numbers, as in CodeSnippet. |
| `lines` | `Record<number, LineConfig>` | `{}` | Same type as CodeSnippet (`color`, `ranges`, `prefix`, `textStyle`, `className`, `style`). Static (D6). |
| `folds` | `FoldRegion[] \| ((value: string, ctx: { startingLineNumber: number }) => FoldRegion[])` | — | Same `FoldRegion` type. The function form is re-run (debounced 150 ms) after edits. Collapsed state is kept **by `id`**, `defaultCollapsed` applies the first time an id appears. Invalid regions are dropped with the same warning as CodeSnippet (`validateFolds`). |
| `wrapLines` / `defaultWrapLines` / `onWrapLinesChange` | `boolean` / `boolean` / `(wrap: boolean) => void` | uncontrolled, `false` | Wrap button drives it through the chrome context. |
| `maxLines` | `number` | `0` | Height clamp (see §7.8). Auto-renders `CodeSnippetShowMoreButton` exactly like CodeSnippet. |
| `original` | `string` | — | Enables diff mode (D7). |
| `schema` | `JsonSchema` (re-exported type from `json-schema-library`) | — | Applies to the whole document for `json`, to the JSON body for `http`. Enables validation, completion and hover. |
| `completions` | `CodeEditorCompletionSource[]` | — | Consumer sources, added after the built-in ones. |
| `diagnostics` | `CodeEditorDiagnostic[]` | — | External diagnostics, merged with syntax/schema ones. |
| `onDiagnosticsChange` | `(diagnostics: CodeEditorDiagnostic[]) => void` | — | Fired when the merged set changes (deep-equal check). |
| `apiRef` | `Ref<CodeEditorApi>` | — | Imperative handle (below). |
| `cspNonce` | `string` | — | Passed to `EditorView.cspNonce` for the style tags CM injects. |
| `onCopy` | `(value: string) => void` | — | Fired by `CodeSnippetCopyButton` after a successful copy. |
| `ref` | `Ref<HTMLDivElement>` | — | Root element, including in fullscreen. |
| `data-testid` | `string` | — | Cascades (§9). |

```ts
export interface CodeEditorApi {
  focus: () => void;
  getValue: () => string;
  /** Replaces the selection, or inserts at the cursor. Undoable. */
  insertText: (text: string) => void;
  openSearch: () => void;
  foldAll: () => void;
  unfoldAll: () => void;
}

export interface CodeEditorPosition {
  /** Absolute line number (startingLineNumber-based) */
  line: number;
  /** 1-based column */
  column: number;
}

export interface CodeEditorDiagnostic {
  from: CodeEditorPosition;
  /** Defaults to one character after `from` (a point at end of line); clamped to the document */
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

export interface CodeEditorCompletionContext {
  value: string;
  position: CodeEditorPosition;
  lineText: string;
  /** Word being typed before the cursor and where it starts */
  word: { text: string; from: CodeEditorPosition };
  /** true when opened with Ctrl-Space */
  explicit: boolean;
  /** Present when language === 'http' */
  http?: {
    section: 'start-line' | 'header-name' | 'header-value' | 'body';
    headerName?: string;
    messageKind: 'request' | 'response';
  };
  /** Present in a JSON document or JSON body: JSON pointer of the cursor location */
  jsonPointer?: string;
}

export type CodeEditorCompletionSource = (
  ctx: CodeEditorCompletionContext,
) => CodeEditorCompletion[] | null | Promise<CodeEditorCompletion[] | null>;
```

Engine types (`EditorView`, `CompletionContext`, …) are never part of the public API.

### `CodeEditorContent`

Props: `Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'contentEditable' | 'role' | 'defaultValue'>` plus:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `lineNumbers` | `boolean` | `false` | CodeSnippet's `<CodeSnippetLineNumbers />` equivalent. |
| `ref` | `Ref<HTMLDivElement>` | — | Content wrapper. |

Attribute routing (D10): `data-*`, `aria-*`, `id`, `title`, `tabIndex` → `.cm-content`; `className`, `style`, `ref` and all `on*` handlers → the wrapper div.

### Exports (`CodeEditor/index.ts`)

`CodeEditorRoot`, `CodeEditorRootProps`, `CodeEditorContent`, `CodeEditorContentProps`, `CodeEditorApi`, `CodeEditorLanguage`, `CodeEditorDiagnostic`, `CodeEditorPosition`, `CodeEditorCompletion`, `CodeEditorCompletionContext`, `CodeEditorCompletionSource`, `JsonSchema`, `httpCompletions` (the built-in HTTP source, exported so consumers can wrap it), `useCodeEditor` (read `CodeEditorApi` from context inside custom chrome), `CODE_EDITOR_KEYBOARD_HINT` (§7.16).

Also exported as `CodeEditorProps = CodeEditorRootProps` so `scripts/metadata` picks up main props (it only reads an export named `{Name}Props`).

## 5. Phase 0 — CodeSnippet refactor (ships first, own PR)

No public behaviour of CodeSnippet changes except the listed bug fixes. All existing unit tests and the 30 screenshot baselines must pass unchanged.

1. **`CodeSnippetChromeContext`** (new, additive; `useCodeSnippet` and `CodeSnippetContextValue` stay untouched):
   ```ts
   export type CodeSnippetChromeContextValue = {
     size: CodeSnippetSize;
     /** Lazily reads the current text (snippet: code prop; editor: live document) */
     getCode: () => string;
     notifyCopied: () => void;
     wrapLines: boolean;
     setWrapLines: (wrap: boolean) => void;
     isFullscreen: boolean;
     setIsFullscreen: (fullscreen: boolean) => void;
     maxLines: number;
     isExpanded: boolean;
     setIsExpanded: (expanded: boolean) => void;
     /** Rows hidden by maxLines (0 when not clamped) */
     hiddenLineCount: number;
   };
   ```
   Plus `useCodeSnippetChrome()` (throws outside a provider). Exported from `CodeSnippet/index.ts`.
2. **Chrome buttons** switch to `useCodeSnippetChrome()`: `CodeSnippetCopyButton`, `CodeSnippetWrapButton`, `CodeSnippetFullscreenButton`, `CodeSnippetShowMoreButton` (uses `hiddenLineCount` instead of `displayItems.length - maxLines`).
3. **`Copyable`** gets `text: string | (() => string)` (non-breaking), so the editor root never re-renders per keystroke for copy.
4. **Bug fix — `onCopy`:** `CodeSnippetCopyButton` passes `onCopied={notifyCopied}`; Root's `notifyCopied` calls `onCopy?.(code)`. Currently `onCopy` never fires.
5. **Bug fix — Escape:** the fullscreen Escape listener ignores `event.defaultPrevented` (so closing an editor popup does not exit fullscreen).
6. **Fullscreen without remount:** `internal/ChromeFrame.tsx` renders the root into a persistent host element via `createPortal`; a layout effect moves that host between an inline placeholder and `document.body`. The subtree is never remounted, consumer props and `ref` are kept in fullscreen (fullscreen classes are merged, not substituted). Backdrop click and Escape behave as today.
7. **`classes.ts`:** the Root CVA moves out of `CodeSnippetRoot.tsx` (rule: CVA in `classes.ts`) and is exported for `CodeEditorRoot`, because the floating-actions selector lives in it.
8. **ShowMore auto-render detection** moves to `lib/showMore.ts` (shared by both roots). `CodeSnippetShowMoreButton` gets `useTestId('show-more-button')`.
9. **New tests pinning phase 0:** `onCopy` fires; fullscreen keeps consumer props/ref and does not remount (a child's state survives toggle); Escape with `defaultPrevented` does not exit; backdrop click exits; `hiddenLineCount` drives ShowMore identically.

## 6. Module layout

```
src/components/CodeEditor/
  index.ts
  CodeEditorRoot.tsx            chrome provider (ChromeFrame from CodeSnippet), state, lazy engine bridge
  CodeEditorContent.tsx         wrapper div, Suspense-less loader, fallback, portal outlet
  CodeEditorContext.ts          internal context: api, options snapshot, portal registry
  classes.ts                    content wrapper CVA (root reuses CodeSnippet classes.ts)
  types.ts                      public types (§4)
  hooks/useCodeEditor.ts
  lib/
    loadEngine.ts               cached import('./engine')
    positions.ts                offset <-> {line, column} with startingLineNumber
    portalRegistry.ts           tiny external store (register/unregister host+node)
    httpCompletionsData.ts      curated methods / ~70 headers / values (generated once, committed)
  engine/                       everything below is in the lazy chunk
    index.ts                    createEditor(host, options) -> EditorHandle
    theme.ts                    EditorView.theme → CSS variables / Tailwind classes
    adapterPainter.ts           D3 ViewPlugin
    lines.ts                    StateField: line/mark decorations from `lines`
    gutters.ts                  colour stick, line numbers, fold, prefix gutters
    folds.ts                    StateField + foldService + summary widget
    maxLines.ts
    search.ts                   search() config + React panel
    diagnostics.ts              linter source merging syntax + schema + external
    completion.ts               autocompletion wiring + context builder
    diff.ts                     unifiedMergeView config + prefix/colour mapping
    languages/
      http/http.grammar         Lezer grammar (source)
      http/parser.ts            generated by lezer-generator, committed
      http/index.ts             LRLanguage + parseMixed(JSON body)
      json.ts, yaml.ts
      jsonPointers.ts           JSON tree → pointer ↔ range map (works on a mounted JSON subtree)
    schema/
      loadSchema.ts             cached import('json-schema-library')
      validate.ts, complete.ts, hover.ts
  CodeEditor.stories.tsx
  CodeEditor.test.tsx
  engine/**/*.test.ts
  CodeEditor.e2e.ts
  ANALYTICS_GAPS.md
```

## 7. Engine design

### 7.1 Lifecycle and value sync

- The `EditorView` is created in `CodeEditorContent`'s effect after `loadEngine()` resolves, destroyed in cleanup (StrictMode-safe).
- Every option that can change is in its own `Compartment` (language, readOnly, wrap, lines, folds, schema, completions, diagnostics, original, size, cspNonce) and is reconfigured, never re-created.
- User edits → `updateListener` → `onChange(doc.toString())`, skipped for transactions annotated `externalChange`.
- External `value` ≠ document → one transaction with the **minimal** change (common prefix/suffix), annotated `externalChange` and `addToHistory.of(false)`, so the cursor does not jump.
- `documentId` change → current `EditorState` stored in a `Map<id, EditorState>`; the target id's state is restored (or created from `value`) with `view.setState`. The map is dropped on unmount.

### 7.2 Loading and fallback

`CodeEditorContent` renders the wrapper immediately. Until the engine chunk resolves it renders a static fallback: the current value as plain lines with the same padding, 20px rows and a reserved gutter of the same width, so there is no layout shift. The fallback is `aria-busy='true'`. If `import()` rejects, the fallback stays (read-only text) and the error is logged with `console.error`.

### 7.3 Colours — adapter painter (D3)

- `adapterPainter` ViewPlugin reads the adapter from options (`useAdapter()` in Root → passed down).
- On create and on `docChanged` (debounced 100 ms) it calls `adapter.highlight(doc, language)`. Results for an outdated document version are dropped.
- Between keystroke and result, the previous decorations are **mapped through the changes** (`decorations.map(tr.changes)`), so text keeps its colour while typing and never flashes plain (the current CodeSnippet flashes).
- Each token → `Decoration.mark({ class: token.className ?? TOKEN_CLASSES[token.type] })`, same priority rule as `CodeToken.tsx`. `TOKEN_CLASSES` is imported from CodeSnippet (literal Tailwind classes — scanned by `@source "../components"`).
- Line colours and ranges from `lines` override token colours with the same precedence as CodeSnippet (`rangeColorClass ?? colorClass ?? token class`): the `lines` StateField marks get higher precedence (`Prec.high`) and range marks suppress the line text colour as in `lib/lineUtils.ts`.
- Performance envelope: adapters tokenize the whole document. Target: ≤ 2 000 lines stays under one frame of main-thread work per debounce with Prism; documented in the Storybook page. Larger documents still edit fine (CM viewport), colours just settle later.

### 7.4 Structure parsers (D4)

- **HTTP grammar** (Lezer, ~40 lines): `Message { StartLine (nl Header)* (nl BlankLine nl Body)? }`, `StartLine { RequestLine { Method Target Version } | StatusLine { Version StatusCode ReasonPhrase } }`, `Header { HeaderName ":" HeaderValue }`, `Body` = everything after the first blank line **after line 1** (identical rule to `getHttpFolds`; blank = `[ \t]*`). Tolerant: an unparseable start line still yields `StartLine`.
- `parseMixed` mounts `@lezer/json`'s parser on `Body` when a `Content-Type` header matches `json` or `+json` (parameters like `; charset=utf-8` allowed), or, with no Content-Type, when the body starts with `{` or `[`.
- The grammar is compiled with `@lezer/generator` (devDependency) by `pnpm --filter @wallarm-org/design-system generate:grammars`; the generated `parser.ts` is committed (Rslib has no Lezer plugin). A unit test fails if the committed parser is stale.
- JSON syntax folding from `lang-json` is disabled (`foldNodeProp` override) — folds come only from the `folds` prop, as in CodeSnippet.
- Indentation and bracket behaviour come from the language where it exists (`json`, `yaml`, JSON body); `bash`/`text` use plain indentation.

### 7.5 Gutters

Order and widths match `CodeSnippetContent`: colour stick (`border-l-2 pl-12`) → line numbers (`px-8 text-right text-text-secondary`) → fold (`px-4`, 16×16 toggle) → prefix (`px-8 text-center`). The gutter block is sticky with `code-snippet-bg`, followed by the 8px gap (`mr-8`); with no gutter the content gets `pl-12`; content always has `pr-12`.

- **Colour stick:** `gutter({ lineMarker })` returning a marker with the line colour's `border-*` class.
- **Line numbers:** `lineNumbers({ formatNumber: n => String(n + startingLineNumber - 1) })`, shown only when `lineNumbers` is set. In diff mode deleted rows get no number (`widgetMarker` returns an empty spacer).
- **Fold:** custom `gutter({ lineMarker })` placing a marker on each fold's `startLine`; the marker's host is filled by the portal registry with CodeSnippet's `FoldToggle`, including `toggleProps` forwarding and handler composition (same as `internal/FoldToggle.tsx`).
- **Prefix:** custom `gutter({ lineMarker })`; ReactNode prefixes via the portal registry, string prefixes as text. `GutterMarker.eq` compares by line number + config identity, so markers are not rebuilt on scroll.
- `gutterLineClass` applies the line colour background to gutter cells, as the CodeSnippet highlight layer does.
- Wrapped lines: markers sit on the first visual row (CM default) — identical to CodeSnippet's inline gutter.

### 7.6 Lines (`lines` prop)

`StateField` rebuilt from the prop on reconfigure and after every doc change (by absolute line number, D6):
- `Decoration.line({ class: cn(LINE_COLOR_STYLES[color].bg, LINE_COLOR_STYLES[color].text, LINE_TEXT_STYLE_CLASSES[textStyle], className), attributes: { style } })` — `style` (consumer `CSSProperties`) is serialized to a style string; this is consumer pass-through, identical to CodeSnippet.
- `ranges` → `Decoration.mark` with the range colour classes (bold + colour), offsets relative to the line start, clamped to the line length.

### 7.7 Folds

- `folds` StateField holds the resolved regions and `collapsedIds: Set<string>`.
- A collapsed region is a `Decoration.replace` from `line(startLine).from` to `line(endLine).to` provided **directly by the StateField** (required for decorations that cover line breaks). The widget renders CodeSnippet's summary row (label from `getFoldSummaryLabel`, `summaryProps` forwarded, click expands) through the portal registry.
- A `foldService` exposes the same ranges so `foldAll`/`unfoldAll`, `Ctrl-Shift-[` / `]` and "unfold on selection/search into a fold" work.
- When the fold function re-runs, collapsed state is matched by `id`; a region whose id disappears is dropped; a new id applies `defaultCollapsed`.
- Editing inside a collapsed region is impossible (it is replaced); search results inside it unfold it.

### 7.8 maxLines and Show more

- When `maxLines > 0`, not expanded and `hiddenLineCount ≥ MIN_HIDDEN_LINES_THRESHOLD` (3): `.cm-scroller` gets `max-height: maxLines * 20 + 16px`. The editor scrolls inside the clamp; nothing is removed from the DOM.
- `hiddenLineCount` = visible rows after folds − `maxLines`, recomputed when the line count or folds change (not on every keystroke).
- The auto-rendered `CodeSnippetShowMoreButton` (shared `lib/showMore.ts`) toggles `isExpanded`. Focus does not auto-expand.

### 7.9 Wrap, size, fullscreen

- Wrap: `EditorView.lineWrapping` + `.cm-line { word-break: break-all }` (CodeSnippet uses `whitespace-pre-wrap break-all`).
- Size: root CVA sets font size; the theme fixes `line-height: 20px` and content padding `8px 0`; font is inherited (`font-mono` → Geist Mono), overriding CM's base theme (`monospace`, `1.4`, `4px 0`).
- Fullscreen: `ChromeFrame` (phase 0) moves the host without remount; after the move `view.requestMeasure()`. `.cm-editor` gets `h-full` inside the fullscreen flex column.

### 7.10 Theme (no new syntax tokens)

`EditorView.theme` referencing existing tokens only — `semantic.css` is not edited (CLAUDE.md rule 7):

| CM element | Token / class |
|---|---|
| background | inherited `code-snippet-bg` from root |
| default text | `--color-syntax-no-syntax` |
| caret (`.cm-cursor`, `caret-color`) | `--color-syntax-no-syntax` |
| selection (`.cm-selectionBackground`, focused and unfocused) | `--color-syntax-highlight-selected-highlight` |
| active line / active line gutter | none (CodeSnippet has no active line) |
| matching bracket (`.cm-matchingBracket`) | `--color-syntax-highlight-neutral-highlight` background |
| search match / current match | `--color-syntax-highlight-warning-highlight` / `--color-syntax-highlight-selected-highlight` |
| diagnostic underline error / warning / info | wavy underline in `--color-syntax-highlight-error-indicator` / `-warning-indicator` / `-info-indicator` |
| tooltips (lint, hover, autocomplete) | DS popover surface tokens (`bg-bg-*`, `border-border-*`, `shadow-*`) — same classes as `Tooltip`/`DropdownMenu` content |
| autocomplete selected option | DS menu item selected classes |
| scrollbar | global thin scrollbar from `theme/index.css` (Ark hover-thumb is not used) |
| focus | no ring on `.cm-content`; the root shows `focus-within` outline using the DS focus ring classes |

Dark mode works through the same CSS variables under `[data-theme="dark"]`; no JS theme switch.

### 7.11 Search

`search({ top: true, createPanel })`. The panel host is filled via the portal registry with DS components: `Input` (find), `Input` (replace, hidden when `readOnly`), toggles for match case / regexp / whole word, `IconButton`s for previous / next / replace / replace all / close. Keyboard: `Mod-F` open, `Enter` / `Shift-Enter` next / previous, `Escape` closes (default-prevented, so fullscreen stays). Commands come from `@codemirror/search` (`findNext`, `replaceAll`, `setSearchQuery`).

### 7.12 Diagnostics

One `linter` source, delay 300 ms, returns the union of:
1. JSON syntax errors (for `json`, and for an `http` JSON body — parse only the body slice, offsets shifted),
2. schema errors (§7.13),
3. `diagnostics` prop converted from `{line, column}` to offsets (lines outside the document are ignored).

`onDiagnosticsChange` receives the merged list in public form (`source: 'syntax' | 'schema' | consumer value`). Rendering: underline marks + the CM lint tooltip on hover, themed per §7.10. No lint gutter, no panel.

### 7.13 JSON Schema

- `json-schema-library` is loaded (cached `import()`) only when `schema` is set; `compileSchema(schema)` is cached per schema object identity.
- The JSON region = the whole document (`json`) or the mounted `JsonText` subtree (`http`). `jsonPointers.ts` builds pointer → `{keyRange, valueRange}` from the Lezer tree with absolute offsets (verified to work on a `parseMixed` mount).
- **Validate:** `validate(JSON.parse(slice))` → errors with pointers → ranges (value range, falling back to key range, then the region start).
- **Complete:** at the cursor's pointer, property names not yet present (with `description` as `info`, `type`/required marked in `detail`), and `enum`/`const`/boolean values in value position.
- **Hover:** `hoverTooltip` showing `title`/`description` of the property under the cursor.

### 7.14 Autocomplete

`autocompletion({ override: [builtInSource, ...consumerSources] })`, activate on typing, `Ctrl-Space` explicit. Built-in sources:
- **HTTP** (`language === 'http'`, also exported as `httpCompletions`): methods (DS `HTTP_METHODS` + `CONNECT`, `TRACE`) at the start of line 1; `HTTP/1.1`, `HTTP/2` after the target; header names on header lines (request vs response set, already-present non-repeatable headers skipped, `apply: 'Name: '`); values for `Content-Type`/`Accept` (common media types, `; charset=utf-8`), `Authorization` (schemes), `Accept-Encoding`, `Cache-Control`, `Connection`. Data is a curated committed constant (~70 headers), no runtime dependency on BCD/mime-db.
- **Schema** (§7.13) when `schema` is set.

Consumer `CodeEditorCompletionSource`s receive `CodeEditorCompletionContext` (built from the syntax tree: HTTP section, header name, JSON pointer) and their results are converted to CM completions.

### 7.15 Diff mode (`original`)

- `unifiedMergeView({ original, highlightChanges: true, gutter: false, mergeControls: false, syntaxHighlightDeletions: false })`.
- Inserted/changed lines → `success` line styling + `+` in the prefix gutter; deleted chunks (CM block widgets) → `danger` row styling + `-` via `widgetMarker`, no line number; intra-line changes → range-style bold colour. All classes come from `LINE_COLOR_STYLES` so it looks like the `LineWithPrefix` story.
- `lines` still apply to current-document lines; diff styling wins where both apply.
- As in CodeSnippet, a coloured line's text colour wins over token colours (`colorClass` precedence, §7.3), so inserted lines read in `success` code colour and deleted rows in `danger` code colour; deleted rows therefore need no syntax painting.

### 7.16 Keyboard and accessibility

- Keymaps: `defaultKeymap`, `historyKeymap`, `searchKeymap`, `completionKeymap`, `foldKeymap`, `closeBracketsKeymap`, `indentWithTab`.
- **Tab indents.** Escape followed by Tab moves focus out (CM built-in `tabFocusMode`), `Ctrl-M` / `Alt-Shift-M` toggles Tab focus mode. Documented on the Storybook page and in the `aria-describedby`-able hint text exported as `CODE_EDITOR_KEYBOARD_HINT`.
- `.cm-content` keeps `role="textbox"`, `aria-multiline`, `aria-readonly` (set by CM); consumers must pass `aria-label` or `aria-labelledby` (dev warning if missing).
- Fold toggles/summaries are the DS buttons with CodeSnippet's aria-labels (`Expand/Collapse {label}`).
- `EditorView.announce` is used for "N matches", "Folded {label}", "Replaced N occurrences".

## 8. Visual contract

Read-only look of `CodeEditor` with the same props must be indistinguishable from `CodeSnippet`: same root CVA, 20px rows, `py-8` content padding, gutter order/widths/paddings, token and line colours, fold chevrons and summary rows, header/actions/show-more. Known, accepted differences (documented on the Storybook page):
- native thin scrollbar instead of Ark ScrollArea's hover thumb;
- a caret and selection layer drawn by CM (same colours);
- the HTTP JSON body is also highlighted when `Content-Type` has parameters or the body contains blank lines, when the adapter does so (unchanged adapter behaviour otherwise).

## 9. Test IDs and analytics

- **Test IDs:** `CodeEditorRoot` destructures `data-testid`, puts it on the root and wraps children in `TestIdProvider` (chrome buttons keep their CodeSnippet slots: `header`, `title`, `tabs`, `tab`, `actions`, `copy-button`, `wrap-button`, `fullscreen-button`, `show-more-button`). Editor slots: `content` (wrapper), `editor` (`.cm-content`), `gutter` (`.cm-gutters`, set by a ViewPlugin), `search` (panel root), `fold-toggle`, `fold-summary`, `fallback`.
- **Attribute forwarding** (D10) with reserved keys protected: `role`, `contenteditable`, `aria-multiline`, `aria-readonly`, `spellcheck`, `autocorrect`, `autocapitalize`, `translate`, `class` (merged, not replaced). A consumer value for a reserved key is ignored with a dev warning.
- `data-analytics-props` passes through unchanged; no `stopPropagation` anywhere; consumer handlers on the wrapper compose with none of ours.
- `data-ds-suppress-parent-click` is set on the content wrapper so a clickable `Card` does not activate when the user clicks into the editor.
- **`CodeEditor/ANALYTICS_GAPS.md`** (FilterDropdown format) records closed targets and workarounds: CM search panel inputs (workaround: panel is ours — DS components with test ids; consumer attributes not supported), autocomplete option list (CM DOM; workaround: completion `apply` callbacks / `onChange`), lint and hover tooltips (CM DOM; workaround `onDiagnosticsChange`), diff deleted-chunk widgets. Fold toggles/summaries are **not** gaps — `toggleProps`/`summaryProps` forward as in CodeSnippet.
- Also fix the dangling reference: `docs/metrics/contract.md:87` and `docs/metrics/new-component-checklist.md:30` cite a non-existent `CodeSnippet/ANALYTICS_GAPS.md`; point them at `CodeEditor/ANALYTICS_GAPS.md` / `Table/ANALYTICS_GAPS.md`.

## 10. Testing

- **Unit (Vitest, jsdom):** add `Range.prototype.getClientRects` / `getBoundingClientRect` stubs to `vitest.setup.ts`. Engine logic is tested through `EditorState` / a headless `EditorView`:
  - value sync (controlled, uncontrolled, minimal external change keeps cursor, no `onChange` echo), `documentId` swap keeps per-document history;
  - HTTP grammar trees (request, response, no body, blank-only lines, charset content-type, body sniffing) and stale-parser check;
  - JSON pointers on whole doc and mounted body; schema validate/complete on both;
  - HTTP completions per section; consumer source context;
  - folds: function re-run keeps collapsed ids, `defaultCollapsed` once, invalid regions dropped;
  - lines → decorations incl. ranges precedence; diagnostics merge and `onDiagnosticsChange` dedupe;
  - adapter painter maps decorations through changes and drops stale results;
  - attribute routing and reserved keys; test-id cascade; `data-analytics-*` on `.cm-content`; handlers on wrapper receive bubbled events; nesting in clickable `Card` and open `Popover` (mirrors `CodeSnippet.nesting.test.tsx`).
- **E2E (Playwright, `docs/e2e-test-rules.md`: `Component: CodeEditor` → `Visual` / `Interactions` / `Accessibility`):** wait for `[data-testid$="--editor"]` before screenshots; caret blink disabled (`drawSelection({ cursorBlinkRate: 0 })` in stories).
  - Visual: parity stories side by side with CodeSnippet (default, line numbers, line colours, prefixes, ranges, folds collapsed, wrap, sizes, header/tabs/floating actions, show more), HTTP with Prism and with Shiki, diff, diagnostics underline + tooltip, autocomplete open, search panel open, dark theme.
  - Interactions: type/undo/redo, multi-cursor edit, find/replace all, fold toggle + summary, show more, wrap toggle, fullscreen keeps undo history and Escape closes an autocomplete without leaving fullscreen, copy returns the edited value, tab switch keeps per-tab history.
  - Accessibility: axe on default/readOnly/diff, Escape→Tab leaves the editor, labels present.
  - Baselines are generated in CI only (`[update-screenshots]`); check the bot commit for unrelated flaky baselines.
- **Storybook:** `Data display/CodeEditor/CodeEditor`, Overview page via the `storybook-docs` skill (keyboard section, adapter note, performance envelope, accepted visual differences).

## 11. Packaging and dependencies

- `dependencies` (exact pins, repo convention): `@codemirror/state`, `@codemirror/view`, `@codemirror/language`, `@codemirror/commands`, `@codemirror/search`, `@codemirror/autocomplete`, `@codemirror/lint`, `@codemirror/merge`, `@codemirror/lang-json`, `@codemirror/lang-yaml`, `@lezer/common`, `@lezer/lr`, `@lezer/json`, `json-schema-library`.
- `devDependencies`: `@lezer/generator`.
- Chunks (measured with esbuild on 2026-09-30, to be re-measured in the consumer fixture): engine ≈ 150 KB gz (loaded on first `CodeEditorContent` mount), `json-schema-library` ≈ 32 KB gz (only with `schema`). Pages without `CodeEditor` pay 0.
- Measurement: add a CodeEditor route to `apps/playground` and record the chunk sizes from `build:doctor` in the PR. No CI size gate exists; none is added in this work.
- Rslib `bundle: false` preserves `import()`; consumers' bundlers produce the chunk.

## 12. Delivery phases

1. **Phase 0** — CodeSnippet chrome refactor + bug fixes (§5). Own PR.
2. **Phase 1 — core editor:** package/deps, lazy loader + fallback, value sync, `documentId`, theme, adapter painter, languages + HTTP grammar, gutters, `lines`, folds, wrap/size/fullscreen/maxLines/copy, readOnly, keymaps, attribute routing, test ids, unit tests, parity stories.
3. **Phase 2 — editing power:** search panel, diagnostics, JSON Schema (validate/complete/hover), HTTP + consumer completions, diff mode, ANALYTICS_GAPS.md, E2E suite, Storybook docs, playground measurement.

Phases 1 and 2 may ship as one PR or two; phase 0 always ships first.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Adapter re-tokenizes the whole document on every debounce (Shiki with `includeExplanation` is slow) | Debounce + decoration mapping; documented envelope; a later incremental painter can replace it without API change. |
| React portals inside CM DOM (prefix, folds, search) leak or flicker | One registry, `destroy` unregisters, `eq` prevents rebuilds; unit test mounts/unmounts 1 000 markers. |
| Static `lines`/`folds` surprise consumers during edits | D6 documented with a recipe for anchored decorations. |
| CM injects `<style>` tags | `cspNonce` prop; documented. |
| Fullscreen host move breaks CodeSnippet | Phase 0 tests + unchanged baselines before any editor code lands. |

## 14. Amendment 2026-10-01 — more languages, syntax errors for every parsed language

Requested after the first stories landed.

| # | Decision |
|---|---|
| A1 | `CodeEditorLanguage` gains `'javascript' \| 'typescript' \| 'python'`. Colours still come from the adapter (Prism, Shiki and highlight.js already support all three). |
| A2 | Structure parsers: `@codemirror/lang-javascript` 6.2.5 (`javascript()` / `javascript({ typescript: true })`) and `@codemirror/lang-python` 6.2.1, both exact-pinned dependencies. They are **lazy per language**: `languageExtension` returns `[]` for them synchronously, the engine then `import()`s the package and reconfigures the language compartment. A result for a language that is no longer current is dropped. The engine chunk does not grow; pages that never use JS/TS/Python never download them. |
| A3 | Syntax errors are shown for every language with a Lezer parser: `json`, `yaml`, `javascript`, `typescript`, `python`, and the JSON body of `http`. Source: Lezer error nodes (`node.type.isError`) of the fully parsed tree → `error` diagnostics, `source: 'syntax'`, message `Unexpected "<char>"` or `Unexpected end of input`. In JSON regions the precise `JSON.parse` message is used instead and error nodes inside that region are dropped (no duplicates). `bash` and `text` have no syntax diagnostics. Rendering is unchanged (§7.12: underline + tooltip). |
| A4 | Stories: `Languages` (Python, JSON, JavaScript, TypeScript, YAML, each editable, Shiki adapter) and `SyntaxErrors` (one intentionally broken sample per parsed language). |
