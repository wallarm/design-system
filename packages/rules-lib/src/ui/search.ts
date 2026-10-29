/**
 * Search and filtering utilities for Point Selector UI
 */

/**
 * Fuzzy search score (0-1)
 *
 * Simple substring matching with case-insensitive scoring.
 * Higher score = better match.
 *
 * @example
 * ```typescript
 * fuzzyScore('auth', 'authorization'); // > 0 (match)
 * fuzzyScore('xyz', 'authorization'); // 0 (no match)
 * ```
 */
export function fuzzyScore(query: string, text: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  // Exact match
  if (t === q) return 1.0;

  // Starts with
  if (t.startsWith(q)) return 0.9;

  // Contains
  if (t.includes(q)) return 0.7;

  // No match
  return 0;
}

/**
 * Number picker for keyboard shortcuts
 *
 * Handles digit key presses for selecting menu items by number (1-9).
 *
 * @returns true if key was handled
 */
export function pickByNumber(
  key: string,
  query: string,
  itemCount: number,
  setQuery: (q: string) => void,
  choose: (index: number) => void,
): boolean {
  // Digit key
  if (/^[0-9]$/.test(key)) {
    const newQuery = query + key;
    const num = parseInt(newQuery);

    if (num >= 1 && num <= itemCount) {
      choose(num - 1); // Convert 1-based to 0-based
      return true;
    }

    if (num * 10 <= itemCount) {
      setQuery(newQuery);
      return true;
    }
  }

  return false;
}
