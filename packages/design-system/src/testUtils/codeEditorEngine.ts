import type { EditorView } from '@codemirror/view';
import { type Mock, rs } from '@rstest/core';
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
    onChange: rs.fn<EngineCallbacks['onChange']>(),
    onDiagnosticsChange: rs.fn<EngineCallbacks['onDiagnosticsChange']>(),
    onVisibleRowCountChange: rs.fn<EngineCallbacks['onVisibleRowCountChange']>(),
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
