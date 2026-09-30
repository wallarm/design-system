import { language as languageFacet } from '@codemirror/language';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';
import { loadLanguageExtension } from './languages';

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

  // The parser modules are warmed first, so the flush below always covers the engine's `.then`
  // (a cold import could still be pending, making the assertions pass without testing anything).
  it('applies a lazy load when the language did not change (positive control)', async () => {
    await loadLanguageExtension('python');
    const { handle } = mountEngine({ value: 'x', language: 'python' });
    await vi.dynamicImportSettled();
    await loadLanguageExtension('python');
    expect(handle.view.state.facet(languageFacet)?.name).toBe('python');
  });

  it('drops a lazy load when the language changed before it resolved', async () => {
    await loadLanguageExtension('python');
    const { handle, rerender } = mountEngine({ value: 'x', language: 'python' });
    rerender({ language: 'json' });
    await vi.dynamicImportSettled();
    await loadLanguageExtension('python');
    expect(handle.view.state.facet(languageFacet)?.name).toBe('json');
  });

  it('does not dispatch into a destroyed view', async () => {
    await loadLanguageExtension('typescript');
    const { handle } = mountEngine({ value: 'x', language: 'typescript' });
    const dispatch = vi.spyOn(handle.view, 'dispatch');
    handle.destroy();
    await vi.dynamicImportSettled();
    await loadLanguageExtension('typescript');
    expect(dispatch).not.toHaveBeenCalled();
  });
});
