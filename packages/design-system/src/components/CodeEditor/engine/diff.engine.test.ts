import { getChunks, getOriginalDoc } from '@codemirror/merge';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import { createPortalRegistry } from '../lib/portalRegistry';
import { DIFF_INSERTED_CLASS } from './diff';
import { getCollapsedFoldIds } from './folds';
import { PREFIX_GUTTER_CLASS } from './gutters';
import { createEditor } from './index';
import type { EditorHandle, EngineOptions } from './types';

const plainAdapter: SyntaxAdapter<string> = {
  name: 'diff-test-plain',
  highlight: async code => ({
    tokens: code.split('\n').map(line => [{ content: line, type: 'plain' }]),
  }),
  getSupportedLanguages: () => ['text'],
};

const baseOptions = (overrides: Partial<EngineOptions>): EngineOptions => ({
  value: '',
  documentId: undefined,
  language: 'text',
  readOnly: false,
  wrapLines: false,
  startingLineNumber: 1,
  lineNumbers: true,
  lines: {},
  folds: undefined,
  adapter: plainAdapter,
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

const handles: EditorHandle[] = [];

afterEach(() => {
  for (const handle of handles.splice(0)) {
    handle.view.dom.parentElement?.remove();
    handle.destroy();
  }
});

const mount = (overrides: Partial<EngineOptions>) => {
  const parent = document.createElement('div');
  document.body.append(parent);
  let options = baseOptions(overrides);
  const handle = createEditor(parent, options, {
    onChange: vi.fn(),
    onDiagnosticsChange: vi.fn(),
    onVisibleRowCountChange: vi.fn(),
    portals: createPortalRegistry(),
  });
  handles.push(handle);
  return {
    handle,
    rerender: (next: Partial<EngineOptions>) => {
      options = { ...options, ...next };
      handle.update(options);
    },
  };
};

const prefixTexts = (handle: EditorHandle): string[] =>
  Array.from(
    handle.view.dom.querySelectorAll<HTMLElement>(
      `.cm-gutter.${PREFIX_GUTTER_CLASS} > .cm-gutterElement`,
    ),
  )
    .filter(cell => cell.style.visibility !== 'hidden')
    .map(cell => cell.textContent ?? '');

const insertedLineTexts = (handle: EditorHandle): string[] =>
  Array.from(handle.view.contentDOM.querySelectorAll(`.cm-line.${DIFF_INSERTED_CLASS}`)).map(
    line => line.textContent ?? '',
  );

describe('createEditor — diff compartment', () => {
  it('has no diff without `original`', () => {
    const { handle } = mount({ value: 'a\nb' });
    expect(getChunks(handle.view.state)).toBeNull();
    expect(handle.view.dom.querySelector('.cm-deletedChunk')).toBeNull();
    expect(prefixTexts(handle)).toEqual([]);
  });

  it('diffs against `original` when it is set', () => {
    const { handle } = mount({ value: 'a\nb\nc', original: 'a\nc' });
    expect(getOriginalDoc(handle.view.state).toString()).toBe('a\nc');
    expect(insertedLineTexts(handle)).toEqual(['b']);
    expect(prefixTexts(handle)).toEqual(['+']);
  });

  it('turns diff mode on after mount', () => {
    const { handle, rerender } = mount({ value: 'a\nb\nc' });
    rerender({ original: 'a\nd\nb\nc' });
    expect(handle.view.dom.querySelector('.cm-deletedChunk .cm-deletedLine')?.textContent).toBe(
      'd',
    );
    expect(prefixTexts(handle)).toEqual(['-']);
  });

  it('re-diffs when `original` changes', () => {
    const { handle, rerender } = mount({ value: 'a\nb\nc', original: 'a\nc' });
    rerender({ original: 'b\nc' });
    expect(getOriginalDoc(handle.view.state).toString()).toBe('b\nc');
    expect(insertedLineTexts(handle)).toEqual(['a']);
    expect(prefixTexts(handle)).toEqual(['+']);

    rerender({ original: 'a\nb\nc' });
    expect(getChunks(handle.view.state)?.chunks).toHaveLength(0);
    expect(insertedLineTexts(handle)).toEqual([]);
    expect(prefixTexts(handle)).toEqual([]);
  });

  it('removes the diff when `original` becomes undefined', () => {
    const { handle, rerender } = mount({ value: 'a\nb\nc', original: 'a\nold\nc' });
    expect(handle.view.dom.querySelector('.cm-deletedChunk')).not.toBeNull();
    rerender({ original: undefined });
    expect(getChunks(handle.view.state)).toBeNull();
    expect(handle.view.dom.querySelector('.cm-deletedChunk')).toBeNull();
    expect(insertedLineTexts(handle)).toEqual([]);
    expect(prefixTexts(handle)).toEqual([]);
    expect(handle.view.dom.classList.contains('cm-merge-b')).toBe(false);
  });

  it('hides the `-` marker of a deleted chunk inside a collapsed fold', () => {
    const { handle } = mount({
      value: 'a\nb\nc\nd\ne',
      original: 'a\nb\nold\nc\nd\ne',
      folds: [{ id: 'middle', startLine: 2, endLine: 4, defaultCollapsed: true }],
    });
    expect(getCollapsedFoldIds(handle.view.state).has('middle')).toBe(true);
    expect(handle.view.contentDOM.querySelector('.cm-deletedChunk')).toBeNull();
    expect(prefixTexts(handle).filter(text => text !== '')).toEqual([]);

    handle.api.unfoldAll();
    expect(handle.view.contentDOM.querySelector('.cm-deletedChunk')).not.toBeNull();
    expect(prefixTexts(handle)).toEqual(['-']);
  });

  it('counts deleted rows in the visible row count', () => {
    const onVisibleRowCountChange = vi.fn();
    const parent = document.body.appendChild(document.createElement('div'));
    const handle = createEditor(
      parent,
      baseOptions({ value: 'a\nb', original: 'a\n1\n2\n3\n4\n5\n6\nb' }),
      {
        onChange: vi.fn(),
        onDiagnosticsChange: vi.fn(),
        onVisibleRowCountChange,
        portals: createPortalRegistry(),
      },
    );
    handles.push(handle);
    // 2 document lines + 6 deleted original lines.
    expect(onVisibleRowCountChange).toHaveBeenLastCalledWith(8);

    handle.update(baseOptions({ value: 'a\nb', original: undefined }));
    expect(onVisibleRowCountChange).toHaveBeenLastCalledWith(2);
  });

  it('does not count deleted rows hidden inside a collapsed fold', () => {
    const onVisibleRowCountChange = vi.fn();
    const parent = document.body.appendChild(document.createElement('div'));
    const handle = createEditor(
      parent,
      baseOptions({
        value: 'a\nb\nc\nd\ne',
        original: 'a\nb\nold\nc\nd\ne',
        folds: [{ id: 'middle', startLine: 2, endLine: 4, defaultCollapsed: true }],
      }),
      {
        onChange: vi.fn(),
        onDiagnosticsChange: vi.fn(),
        onVisibleRowCountChange,
        portals: createPortalRegistry(),
      },
    );
    handles.push(handle);
    expect(onVisibleRowCountChange).toHaveBeenLastCalledWith(3);

    handle.api.unfoldAll();
    expect(onVisibleRowCountChange).toHaveBeenLastCalledWith(6);
  });

  it('keeps the gutters compartment when only the `original` text changes', () => {
    const { handle, rerender } = mount({ value: 'a\nb\nc', original: 'a\nc' });
    const gutters = handle.view.dom.querySelector('.cm-gutters');
    const numbers = handle.view.dom.querySelector('.cm-lineNumbers');
    const spy = vi.spyOn(handle.view, 'dispatch');
    rerender({ original: 'b\nc' });
    const effects = spy.mock.calls.flatMap(([spec]) =>
      spec && 'effects' in spec && spec.effects ? [spec.effects].flat() : [],
    );
    // Only the diff compartment is reconfigured, not `lines` (gutters).
    expect(effects).toHaveLength(1);
    expect(handle.view.dom.querySelector('.cm-gutters')).toBe(gutters);
    expect(handle.view.dom.querySelector('.cm-lineNumbers')).toBe(numbers);
    expect(prefixTexts(handle)).toEqual(['+']);
  });

  it('re-diffs user edits in diff mode', () => {
    const { handle } = mount({ value: 'a', original: 'a' });
    handle.api.insertText('x');
    expect(handle.api.getValue()).toBe('xa');
    expect(insertedLineTexts(handle)).toEqual(['xa']);
  });
});
