import type { SearchQuery } from '@codemirror/search';
import type { EditorState } from '@codemirror/state';

/** Match counting stops here; the panel then shows `1000+ matches`. */
export const MATCH_COUNT_LIMIT = 1000;

/** Number of matches of `query` in the document, capped at `MATCH_COUNT_LIMIT + 1`. */
export const countMatches = (state: EditorState, query: SearchQuery): number => {
  if (!query.valid) return 0;
  const cursor = query.getCursor(state);
  let count = 0;
  while (count <= MATCH_COUNT_LIMIT && !cursor.next().done) count++;
  return count;
};

/** Screen-reader and visible text for a match count. */
export const matchCountMessage = (count: number): string => {
  if (count === 0) return 'No matches';
  if (count === 1) return '1 match';
  if (count > MATCH_COUNT_LIMIT) return `${MATCH_COUNT_LIMIT}+ matches`;
  return `${count} matches`;
};
