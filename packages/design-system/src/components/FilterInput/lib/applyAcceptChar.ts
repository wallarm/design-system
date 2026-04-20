/**
 * Strip characters from `text` that fail the field's `acceptChar` predicate.
 * Commas and spaces always pass through so multi-select delimiters keep
 * working. Returns the original string unchanged when no filtering was
 * needed, so callers can cheaply compare identity to detect a no-op.
 */
export const applyAcceptChar = (text: string, acceptChar: (c: string) => boolean): string => {
  const filtered = Array.from(text)
    .filter(c => c === ',' || c === ' ' || acceptChar(c))
    .join('');
  return filtered === text ? text : filtered;
};
