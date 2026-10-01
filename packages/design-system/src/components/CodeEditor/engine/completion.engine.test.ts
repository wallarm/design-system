import { completionStatus, currentCompletions, startCompletion } from '@codemirror/autocomplete';
import { EditorSelection } from '@codemirror/state';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';
import type { CodeEditorCompletionSource } from '../types';

afterEach(unmountAllEngines);

const labelsAfterStart = async (view: Parameters<typeof startCompletion>[0]): Promise<string[]> => {
  view.focus();
  startCompletion(view);
  await rs.waitFor(() => expect(completionStatus(view.state)).toBe('active'));
  return currentCompletions(view.state).map(completion => completion.label);
};

describe('createEditor completion compartment', () => {
  it('wires the HTTP source for language http', async () => {
    const { handle } = mountEngine({ value: 'PO', language: 'http' });
    handle.view.dispatch({ selection: EditorSelection.cursor(2) });
    expect(await labelsAfterStart(handle.view)).toContain('POST');
  });

  it('reconfigures when completions change', async () => {
    const source: CodeEditorCompletionSource = () => [{ label: 'tenant-a' }];
    const engine = mountEngine({ value: 'ten', language: 'text' });
    engine.handle.view.dispatch({ selection: EditorSelection.cursor(3) });
    // The built-in local-word source has no matches in this document yet.
    expect(startCompletion(engine.handle.view)).toBe(true);

    engine.rerender({ completions: [source] });
    expect(await labelsAfterStart(engine.handle.view)).toEqual(['tenant-a']);
  });
});
