import {
  acceptCompletion,
  completionStatus,
  currentCompletions,
  startCompletion,
} from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  CodeEditorCompletionContext,
  CodeEditorCompletionSource,
  CodeEditorLanguage,
  JsonSchema,
} from '../types';
import { completionExtension } from './completion';
import { languageExtension } from './languages';

const views: EditorView[] = [];

afterEach(() => {
  for (const view of views.splice(0)) {
    view.dom.parentElement?.remove();
    view.destroy();
  }
});

interface MountConfig {
  language?: CodeEditorLanguage;
  schema?: JsonSchema;
  sources?: readonly CodeEditorCompletionSource[];
  startingLineNumber?: number;
}

/** `|` marks the cursor. The view is focused: CodeMirror only completes in a focused editor. */
const mount = (docWithCursor: string, config: MountConfig = {}): EditorView => {
  const language = config.language ?? 'text';
  const pos = docWithCursor.indexOf('|');
  const parent = document.createElement('div');
  document.body.append(parent);
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: docWithCursor.replace('|', ''),
      selection: { anchor: pos },
      extensions: [
        languageExtension(language),
        completionExtension({
          language,
          schema: config.schema,
          sources: config.sources ?? [],
          startingLineNumber: config.startingLineNumber ?? 1,
        }),
      ],
    }),
  });
  views.push(view);
  view.focus();
  return view;
};

/** `acceptCompletion` is ignored during CodeMirror's 75 ms interaction delay, so retry it. */
const accept = async (view: EditorView, line: number, expected: string): Promise<void> => {
  await vi.waitFor(() => {
    acceptCompletion(view);
    expect(view.state.doc.line(line).text).toBe(expected);
  });
};

const openCompletions = async (view: EditorView, timeout = 1000): Promise<string[]> => {
  startCompletion(view);
  await vi.waitFor(() => expect(completionStatus(view.state)).toBe('active'), { timeout });
  return currentCompletions(view.state).map(completion => completion.label);
};

describe('completionExtension', () => {
  it('adds nothing when there is no source', () => {
    expect(
      completionExtension({
        language: 'text',
        schema: undefined,
        sources: [],
        startingLineNumber: 1,
      }),
    ).toEqual([]);
  });

  it('completes HTTP methods on the start line', async () => {
    const view = mount('PO|', { language: 'http' });
    expect(await openCompletions(view)).toContain('POST');
  });

  it('completes HTTP header names and applies `Name: `', async () => {
    const view = mount('GET / HTTP/1.1\nContent-Ty|', { language: 'http' });
    expect(await openCompletions(view)).toContain('Content-Type');
    await accept(view, 2, 'Content-Type: ');
  });

  it('reopens the list with values after a header name is picked', async () => {
    const view = mount('GET / HTTP/1.1\nConnecti|', { language: 'http' });
    await openCompletions(view);
    await accept(view, 2, 'Connection: ');
    await vi.waitFor(() =>
      expect(currentCompletions(view.state).map(item => item.label)).toEqual([
        'close',
        'keep-alive',
      ]),
    );
  });

  it('completes Content-Type values', async () => {
    const view = mount('POST / HTTP/1.1\nContent-Type: application/js|', { language: 'http' });
    expect(await openCompletions(view)).toEqual(
      expect.arrayContaining(['application/json', 'application/json; charset=utf-8']),
    );
    await accept(view, 2, 'Content-Type: application/json');
  });

  it('does not add the HTTP source for other languages', async () => {
    const source = vi.fn<CodeEditorCompletionSource>(() => [{ label: 'POLICY' }]);
    const view = mount('PO|', { language: 'text', sources: [source] });
    expect(await openCompletions(view)).toEqual(['POLICY']);
  });

  it('passes the public context to consumer sources and shows their results', async () => {
    const source = vi.fn<CodeEditorCompletionSource>(() => [
      {
        label: 'X-Tenant-Id',
        apply: 'X-Tenant-Id: ',
        detail: 'tenant',
        info: 'Tenant header',
        kind: 'header',
      },
    ]);
    const view = mount('GET / HTTP/1.1\nX-Ten|', {
      language: 'http',
      sources: [source],
      startingLineNumber: 5,
    });
    expect(await openCompletions(view)).toContain('X-Tenant-Id');
    const ctx: CodeEditorCompletionContext | undefined = source.mock.calls.at(-1)?.[0];
    expect(ctx).toEqual({
      value: 'GET / HTTP/1.1\nX-Ten',
      position: { line: 6, column: 6 },
      lineText: 'X-Ten',
      word: { text: 'X-Ten', from: { line: 6, column: 1 } },
      explicit: true,
      http: { section: 'header-name', messageKind: 'request' },
    });
    const option = currentCompletions(view.state).find(item => item.label === 'X-Tenant-Id');
    expect(option).toMatchObject({ detail: 'tenant', info: 'Tenant header', type: 'property' });
    await accept(view, 2, 'X-Tenant-Id: ');
  });

  it('awaits async consumer sources', async () => {
    const source: CodeEditorCompletionSource = async () => [{ label: 'later', kind: 'value' }];
    const view = mount('la|', { sources: [source] });
    expect(await openCompletions(view)).toEqual(['later']);
  });

  it('merges built-in and consumer results', async () => {
    const source: CodeEditorCompletionSource = () => [{ label: 'PURGE', apply: 'PURGE ' }];
    const view = mount('P|', { language: 'http', sources: [source] });
    expect(await openCompletions(view)).toEqual(expect.arrayContaining(['POST', 'PURGE']));
  });

  it('ignores null and empty consumer results', async () => {
    const nothing: CodeEditorCompletionSource = () => null;
    const empty: CodeEditorCompletionSource = () => [];
    const view = mount('PO|', { language: 'http', sources: [nothing, empty] });
    expect(await openCompletions(view)).toContain('POST');
  });

  it('adds the schema source when a schema is set', async () => {
    const schema: JsonSchema = { type: 'object', properties: { name: { type: 'string' } } };
    const view = mount('{|}', { language: 'json', schema });
    // First use lazy-loads json-schema-library (T13), hence the longer timeout.
    const labels = await openCompletions(view, 5000);
    expect(labels.some(label => label.includes('name'))).toBe(true);
  });

  it('puts DS menu classes on the list and its options', async () => {
    const view = mount('PO|', { language: 'http' });
    await openCompletions(view);
    await vi.waitFor(() =>
      expect(view.dom.querySelector('.cm-tooltip-autocomplete')).not.toBeNull(),
    );
    const tooltip = view.dom.querySelector('.cm-tooltip-autocomplete');
    expect(tooltip).toHaveClass('bg-bg-surface-2!', 'rounded-12', 'shadow-md');
    expect(tooltip?.querySelector('li')).toHaveClass(
      'rounded-6',
      'aria-selected:bg-states-primary-hover!',
    );
  });
});
