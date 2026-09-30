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
