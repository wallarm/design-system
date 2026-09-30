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
