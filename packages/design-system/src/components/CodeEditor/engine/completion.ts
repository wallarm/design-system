import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
  type CompletionSource,
  completeAnyWord,
  completeFromList,
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

let reported = false;
const reportSourceError = (error: unknown): null => {
  if (!reported) {
    reported = true;
    // biome-ignore lint/suspicious/noConsole: surfaced once; a failing consumer source is ignored
    console.error('[CodeEditor] a completion source failed', error);
  }
  return null;
};

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
    // A failing consumer source must not take down the plugin or close the list for others.
    try {
      const result = source(buildCompletionContext(ctx, language, startingLineNumber));
      return Promise.resolve(result).then(finish, reportSourceError);
    } catch (error) {
      return reportSourceError(error);
    }
  };
};

/** Re-open the list after a `Name: ` header (or `"key": `) pick, so values show up at once. */
const reopensAfter = (completion: Completion): boolean =>
  typeof completion.apply === 'string' && completion.apply.endsWith(': ');

const LANGUAGE_KEYWORDS: Partial<Record<CodeEditorLanguage, readonly string[]>> = {
  json: ['true', 'false', 'null'],
  yaml: ['true', 'false', 'null'],
  bash: ['echo', 'export', 'if', 'then', 'else', 'fi', 'for', 'in', 'do', 'done', 'function'],
  javascript: [
    'const',
    'let',
    'var',
    'function',
    'return',
    'if',
    'else',
    'for',
    'while',
    'class',
    'import',
    'export',
    'from',
    'async',
    'await',
    'true',
    'false',
    'null',
    'undefined',
  ],
  typescript: [
    'const',
    'let',
    'function',
    'return',
    'if',
    'else',
    'class',
    'import',
    'export',
    'from',
    'async',
    'await',
    'interface',
    'type',
    'enum',
    'extends',
    'implements',
    'public',
    'private',
    'readonly',
    'true',
    'false',
    'null',
    'undefined',
  ],
  python: [
    'def',
    'class',
    'return',
    'if',
    'elif',
    'else',
    'for',
    'while',
    'in',
    'import',
    'from',
    'as',
    'async',
    'await',
    'try',
    'except',
    'with',
    'True',
    'False',
    'None',
  ],
  lua: [
    'function',
    'local',
    'return',
    'if',
    'then',
    'elseif',
    'else',
    'end',
    'for',
    'while',
    'do',
    'repeat',
    'until',
    'true',
    'false',
    'nil',
  ],
};

const isInsideQuotedString = (text: string): boolean => {
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\\') {
      i++;
    } else if (text[i] === '"') {
      quoted = !quoted;
    }
  }
  return quoted;
};

const builtInSources = (language: CodeEditorLanguage): CompletionSource[] => {
  const keywords = LANGUAGE_KEYWORDS[language];
  if (!keywords) return [completeAnyWord];
  const completeKeywords = completeFromList(keywords.map(label => ({ label, type: 'keyword' })));
  if (language === 'json') {
    return [
      ctx => {
        const line = ctx.state.doc.lineAt(ctx.pos);
        const before = line.text.slice(0, ctx.pos - line.from);
        if (isInsideQuotedString(before)) return completeAnyWord(ctx);
        return /(?:^|[:,\[])[\s\w]*$/.test(before) ? completeKeywords(ctx) : null;
      },
    ];
  }
  return [completeKeywords, completeAnyWord];
};

/**
 * Autocomplete: HTTP and JSON Schema sources, consumer sources, then language keywords and
 * document words, all through `override` (language-data sources are off).
 * `completionKeymap` comes with `defaultKeymap: true` at `Prec.highest`, so Enter,
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
  override.push(...builtInSources(language));

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
