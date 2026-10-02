import { ensureSyntaxTree, foldable, getIndentation, language } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from '@rstest/core';
import { httpLanguage, languageExtension } from './index';
import { jsonEditorLanguage } from './json';
import { yamlEditorLanguage } from './yaml';

const stateFor = (doc: string, lang: Parameters<typeof languageExtension>[0]): EditorState =>
  EditorState.create({ doc, extensions: [languageExtension(lang)] });

describe('languageExtension', () => {
  it('installs the matching CodeMirror language', () => {
    expect(stateFor('GET /', 'http').facet(language)).toBe(httpLanguage);
    expect(stateFor('{}', 'json').facet(language)).toBe(jsonEditorLanguage);
    expect(stateFor('a: 1', 'yaml').facet(language)).toBe(yamlEditorLanguage);
  });

  it('installs no language for bash and text', () => {
    expect(languageExtension('bash')).toEqual([]);
    expect(languageExtension('text')).toEqual([]);
    expect(stateFor('echo 1', 'bash').facet(language)).toBeNull();
    expect(stateFor('plain', 'text').facet(language)).toBeNull();
  });

  it('parses JSON and YAML', () => {
    const jsonTree = ensureSyntaxTree(stateFor('{"a": [1]}', 'json'), 10, 5000);
    expect(jsonTree?.toString()).toBe(
      'JsonText(Object("{",Property(PropertyName,":",Array("[",Number,"]")),"}"))',
    );
    expect(stateFor('a: 1', 'yaml').facet(language)?.name).toBe('yaml');
  });

  it('disables JSON syntax folding', () => {
    const state = stateFor('{\n  "a": [\n    1\n  ]\n}', 'json');
    for (let n = 1; n <= state.doc.lines; n++) {
      const line = state.doc.line(n);
      expect(foldable(state, line.from, line.to)).toBeNull();
    }
  });

  it('disables YAML syntax folding', () => {
    const state = stateFor('a:\n  b: 1\n  c:\n    - 1\n    - 2\nd: [1,\n  2]', 'yaml');
    for (let n = 1; n <= state.doc.lines; n++) {
      const line = state.doc.line(n);
      expect(foldable(state, line.from, line.to)).toBeNull();
    }
  });

  it('keeps JSON indentation rules', () => {
    const state = stateFor('{\n"a": 1\n}', 'json');
    expect(jsonEditorLanguage.name).toBe('json');
    expect(getIndentation(state, state.doc.line(2).from)).toBe(2);
  });
});
