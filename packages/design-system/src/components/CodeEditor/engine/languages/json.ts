import { jsonLanguage } from '@codemirror/lang-json';
import { foldNodeProp, LanguageSupport, type LRLanguage } from '@codemirror/language';

/**
 * lang-json's JSON language with its Object/Array syntax folds switched off.
 * CodeSnippet folds only what the `folds` prop describes, so CodeEditor does the same (spec §7.4).
 * Indentation, bracket and language data are kept.
 */
export const jsonEditorLanguage: LRLanguage = jsonLanguage.configure({
  props: [foldNodeProp.add({ 'Object Array': () => null })],
});

export const json = (): LanguageSupport => new LanguageSupport(jsonEditorLanguage);
