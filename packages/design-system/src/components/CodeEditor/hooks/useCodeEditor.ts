import { useCodeEditorContext } from '../CodeEditorContext';
import type { CodeEditorApi } from '../types';

/**
 * Returns the editor's imperative API from inside `CodeEditorRoot`
 * (e.g. in custom header actions). Same object as `apiRef`.
 */
export const useCodeEditor = (): CodeEditorApi => useCodeEditorContext().api;
