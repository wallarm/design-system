import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { openSearchPanel } from '@codemirror/search';
import {
  Annotation,
  type AnnotationType,
  type ChangeSpec,
  Compartment,
  EditorState,
  type Extension,
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
import type { PortalRegistry } from '../lib/portalRegistry';
import type { CodeEditorApi, CodeEditorLanguage } from '../types';
import { adapterPainter } from './adapterPainter';
import { sanitizeContentAttributes } from './contentAttributes';
import { diagnosticsExtension, jsonRegion } from './diagnostics';
import { foldAllRegions, foldsExtension, getVisibleRowCount, unfoldAllRegions } from './folds';
import { guttersExtension } from './gutters';
import { isLazyLanguage, languageExtension, loadLanguageExtension } from './languages';
import { linesExtension } from './lines';
import { schemaHover } from './schema/hover';
import { validateAgainstSchema } from './schema/validate';
import { searchConfigured, searchExtension } from './search';
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

export { searchConfigured } from './search';

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
  lines: ['lines', 'startingLineNumber', 'lineNumbers', 'testId', 'folds'],
  folds: ['folds', 'startingLineNumber', 'testId'],
  search: ['readOnly', 'testId'],
  diagnostics: ['language', 'schema', 'diagnostics', 'startingLineNumber'],
  completion: ['language', 'schema', 'completions', 'startingLineNumber'],
  diff: ['original'],
  gutterTestId: ['testId'],
};

type SlotBuilders<K extends string> = Record<K, () => Extension>;

/** Fold field/keymap/service (`folds` slot) and the fold gutter (inside the `lines` slot). */
const buildFolds = (o: EngineOptions, portals: PortalRegistry) =>
  foldsExtension({
    folds: o.folds,
    startingLineNumber: o.startingLineNumber,
    portals,
    testId: o.testId,
  });

/**
 * Extension point for feature tasks (painter, lines + gutters, folds, search,
 * diagnostics, completion, diff). Each entry builds the extension for its
 * compartment from the current options; an empty array means "feature off".
 * Later tasks replace the corresponding `[]` (and update `SLOT_DEPS`).
 */
const featureExtensions = (
  options: EngineOptions,
  callbacks: EngineCallbacks,
): SlotBuilders<FeatureKey> => ({
  painter: () => adapterPainter({ adapter: options.adapter, language: options.language }),
  lines: () => [
    linesExtension({ lines: options.lines, startingLineNumber: options.startingLineNumber }),
    guttersExtension({
      lines: options.lines,
      startingLineNumber: options.startingLineNumber,
      lineNumbers: options.lineNumbers,
      foldGutter: buildFolds(options, callbacks.portals).gutter,
      portals: callbacks.portals,
      testId: options.testId,
    }),
  ],
  folds: () => buildFolds(options, callbacks.portals).extension,
  search: () =>
    searchExtension({
      portals: callbacks.portals,
      readOnly: options.readOnly,
      testId: options.testId,
    }),
  diagnostics: () => {
    const { schema } = options;
    return [
      diagnosticsExtension({
        language: options.language,
        schema,
        external: options.diagnostics,
        startingLineNumber: options.startingLineNumber,
        onChange: callbacks.onDiagnosticsChange,
        schemaSource:
          schema === undefined
            ? undefined
            : (state, region) => validateAgainstSchema(state, region, schema),
      }),
      schema === undefined
        ? []
        : schemaHover(
            () => schema,
            state => jsonRegion(state, options.language),
          ),
    ];
  },
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

/** Rows the editor shows: document lines minus the lines hidden by collapsed folds. */
const visibleRowCount = (state: EditorState): number => getVisibleRowCount(state);

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
  let destroyed = false;

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
    // selectionSet: moving the cursor into a collapsed region unfolds it (no effects).
    if (
      update.docChanged ||
      update.selectionSet ||
      update.transactions.some(tr => tr.effects.length > 0)
    ) {
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
    // searchKeymap / completionKeymap come with their feature extensions; fold keys are
    // bound by foldsExtension (CM's foldKeymap is never used — it owns a second fold state).
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

  /** Loads a lazy parser and reconfigures the language compartment from the promise callback (never inside a CM update). */
  const ensureLazyLanguage = (lang: CodeEditorLanguage) => {
    if (!isLazyLanguage(lang)) return;
    loadLanguageExtension(lang).then(
      extension => {
        if (destroyed || options.language !== lang) return;
        view.dispatch({ effects: compartments.language.reconfigure(extension) });
      },
      error => {
        // biome-ignore lint/suspicious/noConsole: surfaced once per failed load; editor keeps working without structure
        console.error(`[CodeEditor] failed to load the ${lang} parser`, error);
      },
    );
  };

  ensureLazyLanguage(initialOptions.language);

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
    ensureLazyLanguage(next.language);
  };

  const update = (next: EngineOptions) => {
    const prev = options;
    options = next;
    if (next.documentId !== prev.documentId) {
      swapDocument(prev, next);
      return;
    }
    reconfigure(prev, next);
    if (next.language !== prev.language) ensureLazyLanguage(next.language);
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
    foldAll: () => {
      foldAllRegions(view);
    },
    unfoldAll: () => {
      unfoldAllRegions(view);
    },
  };

  reportRowCount(view.state);

  return {
    update,
    api,
    view,
    destroy: () => {
      destroyed = true;
      cache.clear();
      view.destroy();
    },
  };
};
