/** Lazily load the highlight.js adapter for syntax highlighting. */
export const loadHighlightJsAdapter = async () => {
  const { highlightJsAdapter } = await import('./highlightjs');
  return highlightJsAdapter;
};
