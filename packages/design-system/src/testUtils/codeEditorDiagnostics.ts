import { forceLinting, forEachDiagnostic } from '@codemirror/lint';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { type Mock, rs } from '@rstest/core';
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
  const onChange = rs.fn<DiagnosticsConfig['onChange']>();
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
