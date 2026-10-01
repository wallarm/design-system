type EngineModule = typeof import('../engine');

let enginePromise: Promise<EngineModule> | null = null;

/**
 * Loads the CodeMirror engine chunk once. Every `CodeEditorContent` shares the
 * same promise; a rejected import clears the cache so a later mount can retry.
 */
export const loadEngine = (): Promise<EngineModule> => {
  if (!enginePromise) {
    enginePromise = import('../engine').catch((error: unknown) => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
};
