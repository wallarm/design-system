import { forceLinting } from '@codemirror/lint';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

const flush = async (view: Parameters<typeof forceLinting>[0]) => {
  forceLinting(view);
  await new Promise(resolve => setTimeout(resolve, 0));
};

afterEach(() => {
  unmountAllEngines();
});

describe('createEditor — diagnostics compartment', () => {
  it('reports JSON syntax errors through onDiagnosticsChange', async () => {
    const { handle, callbacks } = mountEngine({ language: 'json', value: '{"a" 1}' });
    await flush(handle.view);

    expect(callbacks.onDiagnosticsChange).toHaveBeenCalledTimes(1);
    expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([
      {
        from: { line: 1, column: 6 },
        to: { line: 1, column: 7 },
        severity: 'error',
        message: "Expected ':' after property name",
        source: 'syntax',
      },
    ]);
  });

  it('re-lints when the diagnostics prop or startingLineNumber changes', async () => {
    const { handle, callbacks, rerender } = mountEngine({ language: 'text', value: 'a\nb' });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).not.toHaveBeenCalled();

    rerender({
      diagnostics: [{ from: { line: 2, column: 1 }, severity: 'warning', message: 'w' }],
    });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([
      {
        from: { line: 2, column: 1 },
        to: { line: 2, column: 2 },
        severity: 'warning',
        message: 'w',
      },
    ]);

    // Line 2 of the prop is now outside the document (lines 10–11) → dropped.
    rerender({ startingLineNumber: 10 });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([]);
    expect(callbacks.onDiagnosticsChange).toHaveBeenCalledTimes(2);
  });

  it('does not call onDiagnosticsChange again for an identical external list', async () => {
    const diagnostics = [
      { from: { line: 1, column: 1 }, severity: 'error' as const, message: 'e' },
    ];
    const { handle, callbacks, rerender } = mountEngine({
      language: 'text',
      value: 'abc',
      diagnostics,
    });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).toHaveBeenCalledTimes(1);

    rerender({ diagnostics: [...diagnostics] });
    await flush(handle.view);
    expect(callbacks.onDiagnosticsChange).toHaveBeenCalledTimes(1);
  });

  it('reports syntax errors for a lazy language once its parser has loaded', async () => {
    const { callbacks } = mountEngine({ language: 'python', value: 'def f(:\n  pass' });

    // No forceLinting: loading the parser reconfigures the language compartment, which re-lints.
    await vi.waitFor(() => expect(callbacks.onDiagnosticsChange).toHaveBeenCalled(), {
      timeout: 3000,
    });
    const [reported] = callbacks.onDiagnosticsChange.mock.lastCall ?? [[]];
    expect(reported.length).toBeGreaterThan(0);
    expect(reported.every(d => d.severity === 'error' && d.source === 'syntax')).toBe(true);
    expect(reported[0]?.from.line).toBe(1);
  });
});
