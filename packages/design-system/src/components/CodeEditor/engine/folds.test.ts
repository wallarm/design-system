import { foldable } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, runScopeHandlers } from '@codemirror/view';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FoldRegion } from '../../CodeSnippet/lib/foldUtils';
import { getHttpFolds, HTTP_FOLD_ID } from '../../CodeSnippet/lib/httpFolds';
import { createPortalRegistry } from '../lib/portalRegistry';
import type { CodeEditorFolds } from '../types';
import {
  FOLDS_DEBOUNCE_MS,
  foldAllRegions,
  foldsExtension,
  getCollapsedFoldIds,
  getVisibleRowCount,
  toggleFoldRegion,
  unfoldAllRegions,
} from './folds';

const views: EditorView[] = [];

const mount = (doc: string, folds: CodeEditorFolds | undefined, startingLineNumber = 1) => {
  const { extension, gutter } = foldsExtension({
    folds,
    startingLineNumber,
    portals: createPortalRegistry(),
    testId: 'editor',
  });
  const parent = document.body.appendChild(document.createElement('div'));
  const view = new EditorView({
    state: EditorState.create({ doc, extensions: [extension, gutter ?? []] }),
    parent,
  });
  views.push(view);
  return view;
};

const visibleLineTexts = (view: EditorView): string[] =>
  Array.from(view.contentDOM.querySelectorAll('.cm-line'), line => line.textContent ?? '');

const FIVE_LINES = ['line 1', 'line 2', 'line 3', 'line 4', 'line 5'].join('\n');

const REQUEST = [
  'POST /api HTTP/1.1',
  'Host: example.com',
  'Content-Type: application/json',
  '',
  '{',
  '  "a": 1',
  '}',
].join('\n');

afterEach(() => {
  for (const view of views.splice(0)) {
    view.dom.parentElement?.remove();
    view.destroy();
  }
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('foldsExtension — static folds', () => {
  it('collapses regions with defaultCollapsed into one row', () => {
    const view = mount(FIVE_LINES, [
      { id: 'middle', startLine: 2, endLine: 4, label: 'Middle', defaultCollapsed: true },
    ]);

    expect([...getCollapsedFoldIds(view.state)]).toEqual(['middle']);
    expect(getVisibleRowCount(view.state)).toBe(3);
    expect(visibleLineTexts(view)).toEqual(['line 1', '', 'line 5']);
    expect(view.contentDOM.querySelectorAll('.cm-ds-fold-summary')).toHaveLength(1);
  });

  it('toggles a region by id and reports unknown ids', () => {
    const view = mount(FIVE_LINES, [{ id: 'middle', startLine: 2, endLine: 4 }]);

    expect(getVisibleRowCount(view.state)).toBe(5);
    expect(toggleFoldRegion(view, 'middle')).toBe(true);
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(true);
    expect(getVisibleRowCount(view.state)).toBe(3);
    expect(toggleFoldRegion(view, 'middle')).toBe(true);
    expect(getCollapsedFoldIds(view.state).size).toBe(0);
    expect(toggleFoldRegion(view, 'missing')).toBe(false);
  });

  it('folds and unfolds all regions', () => {
    const view = mount(FIVE_LINES, [
      { id: 'top', startLine: 1, endLine: 2 },
      { id: 'bottom', startLine: 4, endLine: 5 },
    ]);

    expect(foldAllRegions(view)).toBe(true);
    expect(getVisibleRowCount(view.state)).toBe(3);
    expect(foldAllRegions(view)).toBe(false);
    expect(unfoldAllRegions(view)).toBe(true);
    expect(getVisibleRowCount(view.state)).toBe(5);
    expect(unfoldAllRegions(view)).toBe(false);
  });

  it('uses absolute line numbers with startingLineNumber', () => {
    const view = mount(
      FIVE_LINES,
      [{ id: 'abs', startLine: 11, endLine: 12, defaultCollapsed: true }],
      10,
    );

    expect(getVisibleRowCount(view.state)).toBe(4);
    expect(visibleLineTexts(view)).toEqual(['line 1', '', 'line 4', 'line 5']);
  });

  it('drops invalid regions with the CodeSnippet warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = mount(FIVE_LINES, [
      { id: 'reversed', startLine: 3, endLine: 2 },
      { id: 'outside', startLine: 4, endLine: 9 },
      { id: 'ok', startLine: 1, endLine: 2 },
    ]);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[CodeSnippet] Fold "reversed"'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[CodeSnippet] Fold "outside"'));
    expect(toggleFoldRegion(view, 'reversed')).toBe(false);
    expect(toggleFoldRegion(view, 'outside')).toBe(false);
    expect(toggleFoldRegion(view, 'ok')).toBe(true);
  });

  it('re-applies static regions by line number after edits, silently (D6)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = mount(FIVE_LINES, [
      { id: 'tail', startLine: 4, endLine: 5, defaultCollapsed: true },
    ]);
    const removed = view.state.doc.sliceString(view.state.doc.line(3).to);

    view.dispatch({ changes: { from: view.state.doc.line(3).to, to: view.state.doc.length } });
    expect(getCollapsedFoldIds(view.state).size).toBe(0);
    expect(toggleFoldRegion(view, 'tail')).toBe(false);

    view.dispatch({ changes: { from: view.state.doc.length, insert: removed } });
    expect(toggleFoldRegion(view, 'tail')).toBe(true);
    expect(getVisibleRowCount(view.state)).toBe(4);
    expect(warn).not.toHaveBeenCalled();
  });

  it('exposes the regions through foldService', () => {
    const view = mount(FIVE_LINES, [{ id: 'middle', startLine: 2, endLine: 4 }]);
    const line2 = view.state.doc.line(2);

    expect(foldable(view.state, line2.from, line2.to)).toEqual({
      from: line2.from,
      to: view.state.doc.line(4).to,
    });
    const line3 = view.state.doc.line(3);
    expect(foldable(view.state, line3.from, line3.to)).toBeNull();
  });
});

describe('foldsExtension — function folds', () => {
  const httpFolds: CodeEditorFolds = (value, { startingLineNumber }) =>
    getHttpFolds(value, { startingLineNumber });

  it('re-runs the function after the debounce and keeps collapsed ids', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const folds = vi.fn(httpFolds);
    const view = mount(REQUEST, folds);
    expect(folds).toHaveBeenCalledTimes(1);

    toggleFoldRegion(view, HTTP_FOLD_ID.body);
    view.dispatch({ changes: { from: view.state.doc.line(2).to, insert: '\nX-Trace: 1' } });
    view.dispatch({ changes: { from: view.state.doc.line(3).to, insert: '\nX-Other: 2' } });
    expect(folds).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);

    expect(folds).toHaveBeenCalledTimes(2);
    expect([...getCollapsedFoldIds(view.state)]).toEqual([HTTP_FOLD_ID.body]);
    // 9 lines: start line, 4 headers, blank, 3 body lines collapsed into 1 row
    expect(getVisibleRowCount(view.state)).toBe(7);
    expect(visibleLineTexts(view).slice(-1)).toEqual(['']);
  });

  it('drops a region whose id disappears', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const view = mount(REQUEST, httpFolds);
    toggleFoldRegion(view, HTTP_FOLD_ID.headers);
    toggleFoldRegion(view, HTTP_FOLD_ID.body);

    // Remove the blank separator and the body.
    view.dispatch({ changes: { from: view.state.doc.line(3).to, to: view.state.doc.length } });
    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);

    expect([...getCollapsedFoldIds(view.state)]).toEqual([HTTP_FOLD_ID.headers]);
    expect(toggleFoldRegion(view, HTTP_FOLD_ID.body)).toBe(false);
  });

  it('applies defaultCollapsed only the first time an id appears', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const folds: CodeEditorFolds = (value, { startingLineNumber }) =>
      getHttpFolds(value, { startingLineNumber, body: { defaultCollapsed: true } });
    const view = mount('GET / HTTP/1.1\nHost: a', folds);
    expect(getCollapsedFoldIds(view.state).size).toBe(0);

    view.dispatch({ changes: { from: view.state.doc.length, insert: '\n\nbody' } });
    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);
    expect(getCollapsedFoldIds(view.state).has(HTTP_FOLD_ID.body)).toBe(true);

    toggleFoldRegion(view, HTTP_FOLD_ID.body);
    view.dispatch({ changes: { from: 0, insert: ' ' }, selection: { anchor: 0 } });
    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);
    expect(getCollapsedFoldIds(view.state).has(HTTP_FOLD_ID.body)).toBe(false);
  });

  it('stops the debounce timer on destroy', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const folds = vi.fn(httpFolds);
    const view = mount(REQUEST, folds);
    view.dispatch({ changes: { from: 0, insert: ' ' } });
    view.destroy();
    vi.advanceTimersByTime(FOLDS_DEBOUNCE_MS);
    expect(folds).toHaveBeenCalledTimes(1);
  });
});

describe('foldsExtension — selection and editing', () => {
  const MIDDLE: FoldRegion[] = [{ id: 'middle', startLine: 2, endLine: 4, defaultCollapsed: true }];

  it('unfolds when the selection moves inside a collapsed region', () => {
    const view = mount(FIVE_LINES, MIDDLE);

    view.dispatch({ selection: { anchor: view.state.doc.line(2).from } });
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(true);

    view.dispatch({ selection: { anchor: view.state.doc.line(3).from + 2 } });
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(false);
  });

  it('unfolds when a search-like range selection overlaps the region', () => {
    const view = mount(FIVE_LINES, MIDDLE);
    const line4 = view.state.doc.line(4);

    view.dispatch({ selection: { anchor: line4.from, head: line4.to } });
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(false);
  });

  it('moves a cursor out of a region when it collapses', () => {
    const view = mount(FIVE_LINES, [{ id: 'middle', startLine: 2, endLine: 4 }]);
    view.dispatch({ selection: { anchor: view.state.doc.line(3).from + 1 } });

    toggleFoldRegion(view, 'middle');

    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(true);
    expect(view.state.selection.main.head).toBe(view.state.doc.line(2).from);
  });

  it('unfolds when a user edit touches the collapsed region', () => {
    const view = mount(FIVE_LINES, MIDDLE);

    view.dispatch({
      changes: { from: view.state.doc.line(2).from, insert: 'x' },
      userEvent: 'input.type',
    });

    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(false);
  });

  it('binds Ctrl-Shift-[ and Ctrl-Shift-] to the region at the cursor', () => {
    const view = mount(FIVE_LINES, [{ id: 'middle', startLine: 2, endLine: 4 }]);
    view.dispatch({ selection: { anchor: view.state.doc.line(3).from } });

    const press = (key: string) =>
      runScopeHandlers(
        view,
        new KeyboardEvent('keydown', { key, ctrlKey: true, shiftKey: true }),
        'editor',
      );

    expect(press('[')).toBe(true);
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(true);
    expect(press(']')).toBe(true);
    expect(getCollapsedFoldIds(view.state).has('middle')).toBe(false);
  });
});
