import type { ReactNode } from 'react';

/**
 * Wrap every case-insensitive occurrence of `query` in `text` with a brand-filled
 * emphasis (orange background + light text — the same tokens DateInput uses for a
 * focused segment), so a search match reads at a glance. Returns the raw string
 * when there's no query (the common, non-search path) so nothing changes there.
 *
 * Shared by the flat (`ValueMenuItem`) and nested (`NestedValueMenuItem`) value
 * menus so first- and second-level search highlights stay visually identical.
 */
export const highlightMatch = (text: string, query?: string): ReactNode => {
  const q = query?.trim().toLowerCase();
  if (!q) return text;
  const lower = text.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  while (cursor < text.length) {
    const at = lower.indexOf(q, cursor);
    if (at === -1) {
      parts.push(<span key={key++}>{text.slice(cursor)}</span>);
      break;
    }
    if (at > cursor) parts.push(<span key={key++}>{text.slice(cursor, at)}</span>);
    parts.push(
      <mark key={key++} className='rounded-2 bg-bg-fill-brand font-medium text-text-primary-alt'>
        {text.slice(at, at + q.length)}
      </mark>,
    );
    cursor = at + q.length;
  }
  return parts;
};
