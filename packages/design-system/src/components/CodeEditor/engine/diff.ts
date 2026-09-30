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

/**
 * Rows the merge view's deleted-chunk widgets add in diff mode (one per deleted original line),
 * skipping chunks whose widget sits strictly inside a `hidden` (collapsed fold) range — the fold's
 * replace decoration hides those widgets. 0 outside diff mode.
 */
export const diffDeletedRowCount = (
  state: EditorState,
  hidden: readonly { from: number; to: number }[],
): number => {
  const chunks = getChunks(state)?.chunks;
  if (!chunks) return 0;
  const original = getOriginalDoc(state);
  let rows = 0;
  for (const chunk of chunks) {
    if (chunk.fromA >= chunk.toA) continue;
    if (hidden.some(({ from, to }) => from < chunk.fromB && chunk.fromB <= to)) continue;
    rows += original.lineAt(chunk.endA).number - original.lineAt(chunk.fromA).number + 1;
  }
  return rows;
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
  // These backgrounds duplicate the `LINE_COLOR_STYLES` classes on purpose: the theme's scoped
  // selectors outrank a `lines` colour class on the same line/cell, so diff styling always wins.
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
  // Deleted rows = `danger` line: background + code colour + font-medium (the same token as the
  // `font-medium` utility in `LINE_COLOR_STYLES`), no syntax colours.
  '& .cm-deletedChunk': {
    backgroundColor: 'var(--color-syntax-highlight-error-highlight)',
    color: 'var(--color-syntax-highlight-error-code)',
    fontWeight: 'var(--font-weight-medium, 450)',
    paddingLeft: '0',
  },
  // `.cm-deletedLine` is not a `.cm-line`: mirror the editor theme's line paddings (12px right
  // edge, 8px gap after the gutters) so deleted text lines up and the background fills the row.
  '& .cm-deletedChunk .cm-deletedLine': {
    padding: '0 12px',
  },
  '&:has(.cm-gutters) .cm-deletedChunk .cm-deletedLine': {
    paddingLeft: '8px',
  },
  // Merge's own markers (tinted line backgrounds, underline gradients) are replaced.
  '&.cm-merge-b .cm-changedText, & .cm-deletedChunk .cm-deletedText, &.cm-merge-b .cm-deletedText':
    {
      background: 'none',
    },
  // Intra-line changes read like a `ranges` entry: bold + the line colour. Only in chunks
  // that replace lines — a wholly added / removed block has nothing to single out. `*` reaches
  // the innermost success text mark, whose `font-medium` would otherwise win over the bold.
  [`.${DIFF_CHANGED_CLASS} .cm-changedText, .${DIFF_CHANGED_CLASS} .cm-changedText *`]: {
    fontWeight: 'var(--font-weight-bold, 700)',
    color: 'var(--color-syntax-highlight-success-code)',
  },
  [`.cm-deletedChunk:has(+ .${DIFF_CHANGED_CLASS}) .cm-deletedText`]: {
    fontWeight: 'var(--font-weight-bold, 700)',
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
