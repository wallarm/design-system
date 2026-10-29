/** Lazily load the Shiki adapter. Its highlighter initializes on first use. */
export const loadShikiAdapter = async () => {
  const { shikiAdapter } = await import('./shiki');
  return shikiAdapter;
};
