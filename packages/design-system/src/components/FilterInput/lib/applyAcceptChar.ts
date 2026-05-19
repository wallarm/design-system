/**
 * Strip chars failing `acceptChar`. Commas/spaces pass through (multi-select
 * delimiters). Returns the same string when no filtering happens, so callers
 * can identity-compare to detect a no-op.
 */
export const applyAcceptChar = (text: string, acceptChar: (c: string) => boolean): string => {
  const filtered = Array.from(text)
    .filter(c => c === ',' || c === ' ' || acceptChar(c))
    .join('');
  return filtered === text ? text : filtered;
};
