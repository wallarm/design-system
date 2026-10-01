import { createContext, useContext } from 'react';
import type { EditorHandle, EngineCallbacks, EngineOptions } from './engine/types';
import type { CodeEditorApi } from './types';

/** Internal bridge between `CodeEditorRoot` (state owner) and `CodeEditorContent` (engine host). */
export interface CodeEditorContextValue {
  /** Engine options owned by Root; Content adds `lineNumbers` and `contentAttributes` */
  options: Omit<EngineOptions, 'lineNumbers' | 'contentAttributes' | 'maxHeight'> & {
    maxHeight: number | null;
  };
  /** Stable callbacks (same identity for the Root's lifetime) */
  callbacks: Omit<EngineCallbacks, 'portals'>;
  /** Content registers the live handle after `createEditor()` and clears it on destroy */
  setHandle: (handle: EditorHandle | null) => void;
  /** Stable object delegating to the current handle (no-ops before the engine loads) */
  api: CodeEditorApi;
}

export const CodeEditorContext = createContext<CodeEditorContextValue | null>(null);

export const useCodeEditorContext = (): CodeEditorContextValue => {
  const context = useContext(CodeEditorContext);
  if (!context) {
    throw new Error('CodeEditor components must be used within CodeEditorRoot');
  }
  return context;
};
