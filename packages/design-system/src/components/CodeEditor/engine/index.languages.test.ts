import { language as languageFacet } from '@codemirror/language';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

afterEach(unmountAllEngines);

describe('lazy language reconfigure', () => {
  it('reconfigures the language compartment once the parser loads', async () => {
    const { handle } = mountEngine({ value: 'const a = 1;', language: 'javascript' });
    await vi.waitFor(() => expect(handle.view.state.facet(languageFacet)?.name).toBe('javascript'));
  });

  it('switches from json to python via update()', async () => {
    const { handle, rerender } = mountEngine({ value: '{}', language: 'json' });
    expect(handle.view.state.facet(languageFacet)?.name).toBe('json');
    rerender({ language: 'python', value: 'x = 1' });
    await vi.waitFor(() => expect(handle.view.state.facet(languageFacet)?.name).toBe('python'));
  });

  it('drops a lazy load when the language changed before it resolved', async () => {
    const { handle, rerender } = mountEngine({ value: 'x', language: 'python' });
    rerender({ language: 'json' });
    await new Promise(r => setTimeout(r, 50));
    expect(handle.view.state.facet(languageFacet)?.name).toBe('json');
  });

  it('does not dispatch into a destroyed view', async () => {
    const { handle } = mountEngine({ value: 'x', language: 'typescript' });
    const dispatch = vi.spyOn(handle.view, 'dispatch');
    handle.destroy();
    await new Promise(r => setTimeout(r, 50));
    expect(dispatch).not.toHaveBeenCalled();
  });
});
