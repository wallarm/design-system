import { forceLinting } from '@codemirror/lint';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { mountEngine, unmountAllEngines } from '../../../../testUtils/codeEditorEngine';

const schema = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', description: 'Rule name' } },
};

afterEach(unmountAllEngines);

describe('schema diagnostics in the engine', () => {
  it('reports schema errors through onDiagnosticsChange for json', async () => {
    const { handle, callbacks } = mountEngine({ language: 'json', value: '{"name": 5}', schema });
    forceLinting(handle.view);

    await rs.waitFor(() =>
      expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([
        expect.objectContaining({
          source: 'schema',
          severity: 'error',
          from: { line: 1, column: 10 },
        }),
      ]),
    );
  });

  it('reports schema errors for an http JSON body', async () => {
    const value = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n{}';
    const { handle, callbacks } = mountEngine({ language: 'http', value, schema });
    forceLinting(handle.view);

    await rs.waitFor(() =>
      expect(callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([
        expect.objectContaining({ source: 'schema', from: { line: 4, column: 1 } }),
      ]),
    );
  });

  it('drops schema diagnostics when the schema prop is removed', async () => {
    const engine = mountEngine({ language: 'json', value: '{"name": 5}', schema });
    forceLinting(engine.handle.view);
    await rs.waitFor(() => expect(engine.callbacks.onDiagnosticsChange).toHaveBeenCalled());

    engine.rerender({ schema: undefined });
    forceLinting(engine.handle.view);
    await rs.waitFor(() =>
      expect(engine.callbacks.onDiagnosticsChange).toHaveBeenLastCalledWith([]),
    );
  });
});
