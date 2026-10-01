import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import type { HighlightResult, SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import { createPortalRegistry } from '../lib/portalRegistry';
import { getPaintedDecorations } from './adapterPainter';
import { createEditor } from './index';
import type { EditorHandle, EngineCallbacks, EngineOptions } from './types';

const lineAdapter = (name: string, type: 'keyword' | 'string') => {
  const highlight = rs.fn<SyntaxAdapter<string>['highlight']>(
    async (code): Promise<HighlightResult> => ({
      tokens: code.split('\n').map(line => [{ content: line, type }]),
    }),
  );
  const adapter: SyntaxAdapter<string> = {
    name,
    highlight,
    getSupportedLanguages: () => ['json', 'yaml'],
  };
  return { adapter, highlight };
};

const baseOptions = (adapter: SyntaxAdapter<string>): EngineOptions => ({
  value: '{"a": 1}',
  documentId: undefined,
  language: 'json',
  readOnly: false,
  wrapLines: false,
  startingLineNumber: 1,
  lineNumbers: true,
  lines: {},
  folds: undefined,
  adapter,
  original: undefined,
  schema: undefined,
  completions: [],
  diagnostics: [],
  contentAttributes: {},
  testId: undefined,
  cspNonce: undefined,
  maxHeight: null,
});

const makeCallbacks = (): EngineCallbacks => ({
  onChange: rs.fn(),
  onDiagnosticsChange: rs.fn(),
  onVisibleRowCountChange: rs.fn(),
  portals: createPortalRegistry(),
});

describe('createEditor — adapter painter wiring', () => {
  let handle: EditorHandle | null = null;

  beforeEach(() => {
    rs.useFakeTimers();
  });

  afterEach(() => {
    handle?.destroy();
    handle = null;
    rs.useRealTimers();
    document.body.innerHTML = '';
  });

  const mount = (options: EngineOptions): EditorHandle => {
    const parent = document.createElement('div');
    document.body.append(parent);
    handle = createEditor(parent, options, makeCallbacks());
    return handle;
  };

  it('paints adapter tokens on create', async () => {
    const { adapter, highlight } = lineAdapter('lines', 'keyword');
    const editor = mount(baseOptions(adapter));
    await rs.advanceTimersByTimeAsync(0);

    expect(highlight).toHaveBeenCalledWith('{"a": 1}', 'json');
    expect(getPaintedDecorations(editor.view).size).toBe(1);
  });

  it('does not re-highlight when an unrelated option changes', async () => {
    const { adapter, highlight } = lineAdapter('lines', 'keyword');
    const options = baseOptions(adapter);
    const editor = mount(options);
    await rs.advanceTimersByTimeAsync(0);
    const painted = getPaintedDecorations(editor.view);

    editor.update({ ...options, readOnly: true, wrapLines: true });
    await rs.advanceTimersByTimeAsync(200);

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(getPaintedDecorations(editor.view)).toBe(painted);
  });

  it('re-highlights when language or adapter changes', async () => {
    const first = lineAdapter('first', 'keyword');
    const second = lineAdapter('second', 'string');
    const options = baseOptions(first.adapter);
    const editor = mount(options);
    await rs.advanceTimersByTimeAsync(0);

    editor.update({ ...options, language: 'yaml' });
    await rs.advanceTimersByTimeAsync(0);
    expect(first.highlight).toHaveBeenLastCalledWith('{"a": 1}', 'yaml');

    editor.update({ ...options, language: 'yaml', adapter: second.adapter });
    await rs.advanceTimersByTimeAsync(0);
    expect(second.highlight).toHaveBeenCalledWith('{"a": 1}', 'yaml');
    expect(first.highlight).toHaveBeenCalledTimes(2);
  });
});
