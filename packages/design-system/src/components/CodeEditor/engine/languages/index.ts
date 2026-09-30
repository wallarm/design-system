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
};

/** CodeMirror language support for a CodeEditor `language`. `bash` and `text` have no structure parser. */
export const languageExtension = (language: CodeEditorLanguage): Extension =>
  LANGUAGE_EXTENSIONS[language]();
