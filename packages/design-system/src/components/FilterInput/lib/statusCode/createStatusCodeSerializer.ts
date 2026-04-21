/**
 * Build the `serializeValue` callback for the HTTP status code field. Strips
 * trailing mask placeholders (`X` / `x`) from the UI value so the backend
 * receives the shorter class form:
 *
 *   "2XX" → "2"
 *   "22X" → "22"
 *   "222" → "222"
 *   "4XX" → "4"
 *   "40X" → "40"
 *
 * Anything that isn't a status-code-shaped string (e.g. a number, boolean,
 * or freeform text) is returned unchanged so invalid committed values still
 * surface in the backend payload for the parser to reject.
 */
export const createStatusCodeSerializer = (): ((
  value: string | number | boolean,
) => string | number | boolean) => {
  return value => {
    if (typeof value !== 'string') return value;
    if (!/^\d[\dX]{0,2}$/i.test(value)) return value;
    return value.replace(/X+$/i, '');
  };
};
