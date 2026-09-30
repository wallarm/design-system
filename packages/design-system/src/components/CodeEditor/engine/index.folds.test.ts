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

  it('reports the row count when a selection-only transaction unfolds a region', () => {
    const { handle, callbacks } = create([
      { id: 'middle', startLine: 2, endLine: 4, defaultCollapsed: true },
    ]);
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(3);

    handle.view.dispatch({ selection: { anchor: handle.view.state.doc.line(3).from + 1 } });

    expect(getCollapsedFoldIds(handle.view.state).size).toBe(0);
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(5);
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
