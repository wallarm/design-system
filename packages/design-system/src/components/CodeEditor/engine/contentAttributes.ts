/**
 * Attributes CodeMirror sets on `.cm-content` itself. A consumer value would
 * overwrite them (CM merges only `class` and `style`), breaking the textbox
 * semantics or the editing surface, so they are never forwarded (spec §9).
 */
export const RESERVED_CONTENT_ATTRIBUTES: readonly string[] = [
  'role',
  'contenteditable',
  'aria-multiline',
  'aria-readonly',
  'spellcheck',
  'autocorrect',
  'autocapitalize',
  'translate',
];

const RESERVED = new Set(RESERVED_CONTENT_ATTRIBUTES);

/**
 * Drops reserved keys (with a development warning) and keeps everything else
 * verbatim — `data-analytics-props` included. `class` is kept: CodeMirror
 * concatenates it with its own classes instead of replacing them.
 */
export const sanitizeContentAttributes = (
  attrs: Record<string, string>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (RESERVED.has(key.toLowerCase())) {
      if (process.env.NODE_ENV !== 'production') {
        // biome-ignore lint/suspicious/noConsole: dev-only authoring guard (matches Slider/BarList).
        console.warn(
          `[CodeEditor] "${key}" is managed by the editor and cannot be set on CodeEditorContent; the value "${value}" was ignored.`,
        );
      }
      continue;
    }
    result[key] = value;
  }
  return result;
};
