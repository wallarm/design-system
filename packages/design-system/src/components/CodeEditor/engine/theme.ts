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
    padding: '8px 0',
    caretColor: 'var(--color-syntax-no-syntax)',
  },
  // The 12px right edge and the 8px gutter gap live on `.cm-line` (not on `.cm-content` /
  // `.cm-gutters`) so a coloured line background covers them, like CodeSnippet's full-row highlight.
  '.cm-line': {
    padding: '0 12px',
  },
  // With a gutter the text column starts 8px after it (CodeSnippet `mr-8`).
  '&:has(.cm-gutters) .cm-line': {
    paddingLeft: '8px',
  },
  // CodeSnippet wraps with `whitespace-pre-wrap break-all`.
  '.cm-lineWrapping': {
    wordBreak: 'break-all',
  },
  '.cm-gutters': {
    background: CODE_SNIPPET_BG,
    color: 'inherit',
    border: 'none',
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
