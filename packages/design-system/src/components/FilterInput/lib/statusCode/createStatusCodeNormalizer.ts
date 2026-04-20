/**
 * Commit-time normalizer for the HTTP status code field. Pads partial input
 * to three characters and uppercases the mask marker:
 *   - "2"  → "2XX"
 *   - "22" → "22X"
 *   - "2x" → "2XX"
 *   - "222", "4XX", "40X" → unchanged (already 3 chars)
 * Leaves anything unrecognised alone so `validate` can still flag it.
 */
export const createStatusCodeNormalizer = (): ((
  value: string | number | boolean,
) => string | number | boolean) => {
  return value => {
    if (typeof value !== 'string' && typeof value !== 'number') return value;
    const s = String(value).toUpperCase();
    if (!/^\d[0-9X]{0,2}$/.test(s)) return value;
    if (s.length === 1) return `${s}XX`;
    if (s.length === 2) return `${s}X`;
    return s;
  };
};
