import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import { createPortalRegistry } from '../lib/portalRegistry';
import { PREFIX_GUTTER_CLASS, STICK_GUTTER_CLASS } from './gutters';
import { createEditor } from './index';
import type { EditorHandle, EngineOptions } from './types';

const testAdapter: SyntaxAdapter<string> = {
  name: 'test',
  highlight: async code => ({
    tokens: code.split('\n').map(line => [{ content: line, type: 'plain' }]),
  }),
  getSupportedLanguages: () => ['text'],
};

const baseOptions = (overrides: Partial<EngineOptions> = {}): EngineOptions => ({
  value: 'first\nsecond\nthird',
  documentId: undefined,
  language: 'text',
  readOnly: false,
  wrapLines: false,
  startingLineNumber: 10,
  lineNumbers: true,
  lines: { 11: { color: 'danger', prefix: '!' } },
  folds: undefined,
  adapter: testAdapter,
  original: undefined,
  schema: undefined,
  completions: [],
  diagnostics: [],
  contentAttributes: {},
  testId: 'editor',
  cspNonce: undefined,
  maxHeight: null,
  ...overrides,
});

let handle: EditorHandle | null = null;
afterEach(() => {
  handle?.destroy();
  handle = null;
  document.body.innerHTML = '';
});

const mount = (options: EngineOptions): EditorHandle => {
  const parent = document.createElement('div');
  document.body.append(parent);
  handle = createEditor(parent, options, {
    onChange: vi.fn(),
    onDiagnosticsChange: vi.fn(),
    onVisibleRowCountChange: vi.fn(),
    portals: createPortalRegistry(),
  });
  return handle;
};

const numberTexts = (editorHandle: EditorHandle): (string | null)[] =>
  Array.from(
    editorHandle.view.dom.querySelectorAll<HTMLElement>('.cm-lineNumbers > .cm-gutterElement'),
  )
    .filter(cell => cell.style.visibility !== 'hidden')
    .map(cell => cell.textContent);

describe('createEditor: lines + gutters', () => {
  it('renders line decorations and the gutters from options', () => {
    const editor = mount(baseOptions());
    const lines = editor.view.dom.querySelectorAll('.cm-line');
    expect(lines[1]?.className).toContain('bg-syntax-highlight-error-highlight');
    expect(editor.view.dom.querySelector(`.${STICK_GUTTER_CLASS}`)).not.toBeNull();
    expect(editor.view.dom.querySelector(`.${PREFIX_GUTTER_CLASS}`)?.textContent).toBe('!');
    expect(numberTexts(editor)).toEqual(['10', '11', '12']);
  });

  it('reconfigures lines, lineNumbers and startingLineNumber on update', () => {
    const editor = mount(baseOptions());
    editor.update(baseOptions({ lines: {}, lineNumbers: false }));
    expect(editor.view.dom.querySelector('.cm-gutters')).toBeNull();
    expect(editor.view.dom.querySelectorAll('.cm-line')[1]?.className).not.toContain(
      'bg-syntax-highlight-error-highlight',
    );

    editor.update(baseOptions({ lines: {}, lineNumbers: true, startingLineNumber: 1 }));
    expect(numberTexts(editor)).toEqual(['1', '2', '3']);
  });
});
