import type { Extension } from '@codemirror/state';
import type { CodeEditorLanguage } from '../../types';
import { http } from './http';
import { json } from './json';
import { yaml } from './yaml';

export { findJsonBodyRange, http, httpContextAt, httpLanguage } from './http';

const noLanguage = (): Extension => [];

const LANGUAGE_EXTENSIONS: Record<CodeEditorLanguage, () => Extension> = {
  http,
  json,
  yaml,
  bash: noLanguage,
  text: noLanguage,
  // Lazy: loaded by loadLanguageExtension and reconfigured by the engine.
  javascript: noLanguage,
  typescript: noLanguage,
  python: noLanguage,
};

const LAZY_LANGUAGES: Partial<Record<CodeEditorLanguage, () => Promise<Extension>>> = {
  javascript: () => import('@codemirror/lang-javascript').then(m => m.javascript()),
  typescript: () =>
    import('@codemirror/lang-javascript').then(m => m.javascript({ typescript: true })),
  python: () => import('@codemirror/lang-python').then(m => m.python()),
};

const lazyCache = new Map<CodeEditorLanguage, Promise<Extension>>();

/** CodeMirror language support for a CodeEditor `language`. `bash` and `text` have no structure parser. */
export const languageExtension = (language: CodeEditorLanguage): Extension =>
  LANGUAGE_EXTENSIONS[language]();

export const isLazyLanguage = (language: CodeEditorLanguage): boolean => language in LAZY_LANGUAGES;

/** Loads the parser for a lazy language (cached). Resolves [] for languages that are available synchronously. */
export const loadLanguageExtension = (language: CodeEditorLanguage): Promise<Extension> => {
  const load = LAZY_LANGUAGES[language];
  if (!load) return Promise.resolve([]);
  let pending = lazyCache.get(language);
  if (!pending) {
    pending = load().catch(error => {
      lazyCache.delete(language);
      throw error;
    });
    lazyCache.set(language, pending);
  }
  return pending;
};
