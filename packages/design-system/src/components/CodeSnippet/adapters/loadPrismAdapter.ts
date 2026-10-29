/** Lazily load the Prism adapter for syntax highlighting. */
export const loadPrismAdapter = async () => {
  const { prismAdapter } = await import('./prism');
  return prismAdapter;
};
