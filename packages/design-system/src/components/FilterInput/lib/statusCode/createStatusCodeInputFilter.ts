/**
 * Per-character input filter for the HTTP status code field. Accepts only
 * digits and the `X` mask marker (case-insensitive). Meant to be wired to
 * `FieldMetadata.acceptChar` so typing in the value segment is constrained.
 */
export const createStatusCodeInputFilter = (): ((char: string) => boolean) => {
  return c => /^[0-9xX]$/.test(c);
};
