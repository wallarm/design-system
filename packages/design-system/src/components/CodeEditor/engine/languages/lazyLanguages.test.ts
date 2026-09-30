import { ensureSyntaxTree, language as languageFacet, syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { isLazyLanguage, languageExtension, loadLanguageExtension } from './index';

describe('lazy languages', () => {
  it('marks javascript, typescript and python as lazy', () => {
    expect(isLazyLanguage('javascript')).toBe(true);
    expect(isLazyLanguage('typescript')).toBe(true);
    expect(isLazyLanguage('python')).toBe(true);
    expect(isLazyLanguage('json')).toBe(false);
    expect(isLazyLanguage('text')).toBe(false);
  });

  it('returns no synchronous extension for lazy languages', () => {
    const state = EditorState.create({
      doc: 'const a = 1',
      extensions: languageExtension('javascript'),
    });
    expect(state.facet(languageFacet)).toBeNull();
  });

  it.each([
    ['javascript', 'const a = 1;', 'javascript'],
    ['typescript', 'let a: number = 1;', 'typescript'],
    ['python', 'def f():\n    return 1\n', 'python'],
  ] as const)('loads %s', async (lang, doc, name) => {
    const ext = await loadLanguageExtension(lang);
    const state = EditorState.create({ doc, extensions: ext });
    expect(state.facet(languageFacet)?.name).toBe(name);
    const tree = ensureSyntaxTree(state, state.doc.length, 1000) ?? syntaxTree(state);
    expect(tree.length).toBe(state.doc.length);
  });

  it('caches the load per language', () => {
    expect(loadLanguageExtension('python')).toBe(loadLanguageExtension('python'));
  });

  it('resolves [] for non-lazy languages', async () => {
    await expect(loadLanguageExtension('json')).resolves.toEqual([]);
  });
});
